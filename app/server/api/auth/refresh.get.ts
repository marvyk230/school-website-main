import { getRefreshTokenByToken } from "~/server/db/refreshTokens";
import { decodeRefreshToken, generateTokens, sendRefreshToken } from "~/server/utils/jwt";
import { getUserById } from "~/server/db/users";
import { createRefreshToken, deleteRefreshToken } from "~/server/db/refreshTokens";
import { userTransformer } from "~/server/transformers";

export default defineEventHandler(async (event) => {
	const refreshToken = getCookie(event, "refresh_token");
	if (!refreshToken) {
		throw createError({ statusCode: 401, statusMessage: "Vui lòng đăng nhập." });
	}
	const [dbToken, decoded] = await Promise.all([
		getRefreshTokenByToken(refreshToken),
		Promise.resolve(decodeRefreshToken(refreshToken)),
	]);
	if (!dbToken || !decoded || typeof decoded === "string" || !("userId" in decoded)) {
		deleteCookie(event, "refresh_token", { httpOnly: true, sameSite: "lax", path: "/" });
		throw createError({ statusCode: 401, statusMessage: "Phiên đăng nhập đã hết hạn." });
	}
	const user = await getUserById(String(decoded.userId));
	if (!user || dbToken.userId !== user.id) {
		throw createError({ statusCode: 401, statusMessage: "Tài khoản không còn tồn tại." });
	}
	await deleteRefreshToken(refreshToken);
	const tokens = generateTokens(user);
	await createRefreshToken({ token: tokens.refreshToken, userId: user.id });
	sendRefreshToken(event, tokens.refreshToken);
	return {
		access_token: tokens.accessToken,
		user: userTransformer(user),
	};
});
