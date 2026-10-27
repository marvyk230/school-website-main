import bcrypt from "bcryptjs";
import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const body = await readBody<{
		currentPassword?: unknown;
		newPassword?: unknown;
		repeatPassword?: unknown;
	}>(event);

	if (
		!body ||
		typeof body.currentPassword !== "string" ||
		typeof body.newPassword !== "string" ||
		typeof body.repeatPassword !== "string"
	) {
		throw createError({ statusCode: 400, statusMessage: "Vui lòng điền đầy đủ các trường mật khẩu." });
	}
	if (body.newPassword.length < 10 || Buffer.byteLength(body.newPassword, "utf8") > 72) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu mới phải có ít nhất 10 ký tự và không vượt quá 72 byte." });
	}
	if (body.newPassword !== body.repeatPassword) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu nhập lại không khớp." });
	}
	if (body.currentPassword === body.newPassword) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu mới phải khác mật khẩu hiện tại." });
	}

	const account = await prisma.user.findUnique({
		where: { id: user.id },
		select: { password: true },
	});
	if (!account || !(await bcrypt.compare(body.currentPassword, account.password))) {
		throw createError({ statusCode: 400, statusMessage: "Mật khẩu hiện tại không chính xác." });
	}

	const password = await bcrypt.hash(body.newPassword, 12);
	await prisma.$transaction([
		prisma.user.update({ where: { id: user.id }, data: { password, mustChangePassword: false } }),
		prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
	]);
	deleteCookie(event, "refresh_token", { httpOnly: true, sameSite: "lax", path: "/" });

	return { success: true };
});
