import { prisma } from "~/server/db";
import { requireClubManager, validateActivityInput } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const current = await prisma.activity.findUniqueOrThrow({ where: { id }, select: { clubId: true } });
	await requireClubManager(event, current.clubId);
	const body = await readBody<Record<string, unknown>>(event);
	const input = validateActivityInput(body ?? {});
	await requireClubManager(event, input.clubId);
	return prisma.activity.update({ where: { id }, data: input });
});
