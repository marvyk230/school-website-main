import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
	if (!club) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy câu lạc bộ." });

	const membership = await prisma.clubMembership.findUnique({
		where: { userId_clubId: { userId: user.id, clubId } },
		select: { status: true },
	});
	if (membership?.status !== "ACTIVE") {
		throw createError({ statusCode: 403, statusMessage: "Chỉ thành viên đã được duyệt mới có thể xem thông báo của câu lạc bộ." });
	}

	return prisma.clubAnnouncement.findMany({
		where: { clubId },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
			author: { select: { name: true, username: true } },
		},
	});
});
