import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	requireRole(event, ["ADMIN"]);
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });

	const body = await readBody<{ leaderId?: unknown }>(event);
	if (!body || typeof body !== "object") {
		throw createError({ statusCode: 400, statusMessage: "Thông tin chủ nhiệm không hợp lệ." });
	}
	if (body.leaderId !== null && typeof body.leaderId !== "string") {
		throw createError({ statusCode: 400, statusMessage: "Tài khoản chủ nhiệm không hợp lệ." });
	}
	if (typeof body.leaderId === "string") {
		const leader = await prisma.user.findUnique({ where: { id: body.leaderId }, select: { role: true } });
		if (!leader) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy tài khoản." });
		if (leader.role !== "CLUB_LEADER" && leader.role !== "ADMIN") {
			throw createError({ statusCode: 400, statusMessage: "Trước tiên hãy cấp vai trò Chủ nhiệm CLB cho tài khoản." });
		}
	}

	return prisma.club.update({
		where: { id: clubId },
		data: { leaderId: body.leaderId },
		select: { id: true, leaderId: true },
	});
});
