import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const activityId = getRouterParam(event, "id");
	if (!activityId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const activity = await prisma.activity.findUniqueOrThrow({ where: { id: activityId }, select: { id: true, clubId: true, date: true } });
	if (activity.date < new Date().toISOString().slice(0, 10)) {
		throw createError({ statusCode: 400, statusMessage: "Hoạt động đã diễn ra, không thể đăng ký." });
	}
	const membership = await prisma.clubMembership.findUnique({
		where: { userId_clubId: { userId: user.id, clubId: activity.clubId } },
	});
	if (!membership) throw createError({ statusCode: 403, statusMessage: "Hãy tham gia câu lạc bộ trước khi đăng ký hoạt động." });
	await prisma.activityRegistration.upsert({
		where: { activityId_userId: { activityId, userId: user.id } },
		create: { activityId, userId: user.id },
		update: {},
	});
	return { success: true };
});
