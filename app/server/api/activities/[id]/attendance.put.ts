import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const activityId = getRouterParam(event, "id");
	if (!activityId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const activity = await prisma.activity.findUniqueOrThrow({ where: { id: activityId }, select: { clubId: true } });
	await requireClubManager(event, activity.clubId);
	const body = await readBody<{ userId?: string; attended?: boolean }>(event);
	if (typeof body?.userId !== "string" || typeof body.attended !== "boolean") {
		throw createError({ statusCode: 400, statusMessage: "Thông tin điểm danh không hợp lệ." });
	}
	const registration = await prisma.activityRegistration.findUnique({
		where: { activityId_userId: { activityId, userId: body.userId } },
	});
	if (!registration) throw createError({ statusCode: 404, statusMessage: "Học sinh chưa đăng ký hoạt động này." });
	return prisma.activityRegistration.update({
		where: { id: registration.id },
		data: { attended: body.attended },
	});
});
