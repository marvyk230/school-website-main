import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	await requireClubManager(event, id);
	await prisma.club.delete({ where: { id } });
	return { success: true };
});
