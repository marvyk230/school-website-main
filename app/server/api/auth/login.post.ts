import bcrypt from "bcryptjs";
import { getUserByUsername } from "~/server/db/users";
import { generateTokens, sendRefreshToken } from "~/server/utils/jwt";
import { userTransformer } from "~/server/transformers";
import { createRefreshToken } from "~/server/db/refreshTokens";
import { User } from "~/types/user";

export default defineEventHandler(async (event) => {
	// read body
	const body = await readBody(event);
	const username = typeof body?.username === "string" ? body.username.trim() : "";
	const password = typeof body?.password === "string" ? body.password : "";

	if (!username || !password) {
		throw createError({ statusCode: 400, statusMessage: "Vui lòng nhập tên đăng nhập và mật khẩu." });
	}
	const config = useRuntimeConfig(event);
	if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
		throw createError({ statusCode: 503, statusMessage: "Hệ thống đăng nhập chưa được cấu hình đầy đủ." });
	}

	const user = await getUserByUsername(username) as User | null;

	if (!user || !(await bcrypt.compare(password, user.password))) {
		throw createError({ statusCode: 401, statusMessage: "Tên đăng nhập hoặc mật khẩu không chính xác." });
	}

	// generate access and refresh token
	const { accessToken, refreshToken } = generateTokens(user);

	// save refresh token to db
	await createRefreshToken({
		token: refreshToken,
		userId: user.id!,
	});

	// save refresh token to cookie and add httpOnly flag
	sendRefreshToken(event, refreshToken);

	return {
	access_token: accessToken,
	user: userTransformer(user),
	};
});
