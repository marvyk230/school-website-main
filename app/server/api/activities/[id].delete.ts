import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const activity = await prisma.activity.findUniqueOrThrow({ where: { id }, select: { clubId: true } });
	await requireClubManager(event, activity.clubId);
	await prisma.activity.delete({ where: { id } });
	return { success: true };
});
