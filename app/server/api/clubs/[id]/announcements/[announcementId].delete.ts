import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const clubId = getRouterParam(event, "id");
	const announcementId = getRouterParam(event, "announcementId");
	if (!clubId || !announcementId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ hoặc thông báo." });
	await requireClubManager(event, clubId);
	const result = await prisma.clubAnnouncement.deleteMany({
		where: { id: announcementId, clubId },
	});
	if (!result.count) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy thông báo." });
	return { success: true };
});
