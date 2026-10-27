import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	requireRole(event, ["ADMIN"]);
	const userId = getRouterParam(event, "id");
	if (!userId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã tài khoản." });

	const account = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true },
	});
	if (!account) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy tài khoản." });

	const temporaryPassword = randomBytes(9).toString("base64url");
	const password = await bcrypt.hash(temporaryPassword, 12);
	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { password, mustChangePassword: true },
		}),
		prisma.refreshToken.deleteMany({ where: { userId } }),
	]);

	return { temporaryPassword };
});
