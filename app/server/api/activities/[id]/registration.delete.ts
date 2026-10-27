import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const activityId = getRouterParam(event, "id");
	if (!activityId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const registration = await prisma.activityRegistration.findUnique({
		where: { activityId_userId: { activityId, userId: user.id } },
	});
	if (registration?.attended) {
		throw createError({ statusCode: 409, statusMessage: "Bạn đã được điểm danh cho hoạt động này nên không thể hủy đăng ký." });
	}
	await prisma.activityRegistration.deleteMany({ where: { activityId, userId: user.id } });
	return { success: true };
});
