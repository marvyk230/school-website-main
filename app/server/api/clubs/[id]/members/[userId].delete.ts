import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const clubId = getRouterParam(event, "id");
	const userId = getRouterParam(event, "userId");
	if (!clubId || !userId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ hoặc học sinh." });
	await requireClubManager(event, clubId);
	const result = await prisma.clubMembership.deleteMany({ where: { clubId, userId } });
	if (!result.count) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy thành viên trong câu lạc bộ." });
	return { success: true };
});
