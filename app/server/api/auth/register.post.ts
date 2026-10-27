import { User } from "~/types/user";
import { createUser } from "~/server/db/users";
import { userTransformer } from "~/server/transformers";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	if (
		typeof body?.username !== "string" ||
		typeof body?.email !== "string" ||
		typeof body?.password !== "string" ||
		typeof body?.repeatPassword !== "string"
	) {
		throw createError({ statusCode: 400, statusMessage: "Vui lòng điền đầy đủ thông tin." });
	}
	const username = body.username.trim();
	const email = body.email.trim();
	if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
		throw createError({ statusCode: 400, statusMessage: "Tên đăng nhập phải dài 3–30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới." });
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
		throw createError({ statusCode: 400, statusMessage: "Email không hợp lệ." });
	}
	if (body.password.length < 10 || body.password.length > 72) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu phải có từ 10 đến 72 ký tự." });
	}
	if (body.password !== body.repeatPassword) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu nhập lại không khớp." });
	}
	try {
		const user = await createUser({
			username,
			email,
			name: typeof body.name === "string" ? body.name.slice(0, 100) : null,
			password: body.password,
		});
		return { user: userTransformer(user as User) };
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
			throw createError({ statusCode: 409, statusMessage: "Tên đăng nhập hoặc email đã được sử dụng." });
		}
		throw error;
	}
});
