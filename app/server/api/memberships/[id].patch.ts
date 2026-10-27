import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireRole(event, ["ADMIN", "STAFF", "CLUB_LEADER"]);
	const membershipId = getRouterParam(event, "id");
	if (!membershipId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã yêu cầu." });

	const body = await readBody<{ decision?: unknown }>(event);
	if (!body || typeof body !== "object") {
		throw createError({ statusCode: 400, statusMessage: "Quyết định duyệt không hợp lệ." });
	}
	if (body.decision !== "approve" && body.decision !== "reject") {
		throw createError({ statusCode: 400, statusMessage: "Quyết định duyệt không hợp lệ." });
	}

	const membership = await prisma.clubMembership.findUnique({
		where: { id: membershipId },
		select: { id: true, club: { select: { leaderId: true } } },
	});
	if (!membership) throw createError({ statusCode: 404, statusMessage: "Yêu cầu tham gia không còn tồn tại." });
	if (user.role === "CLUB_LEADER" && membership.club.leaderId !== user.id) {
		throw createError({ statusCode: 403, statusMessage: "Bạn chỉ được duyệt thành viên của câu lạc bộ được phân công." });
	}

	if (body.decision === "approve") {
		await prisma.clubMembership.update({ where: { id: membershipId }, data: { status: "ACTIVE" } });
	} else {
		await prisma.clubMembership.delete({ where: { id: membershipId } });
	}
	return { success: true };
});
