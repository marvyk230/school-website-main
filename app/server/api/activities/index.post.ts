import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";
import { validateActivityInput } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const user = requireRole(event, ["ADMIN", "STAFF", "CLUB_LEADER"]);
	const body = await readBody<Record<string, unknown>>(event);
	const input = validateActivityInput(body ?? {});
	await prisma.club.findUniqueOrThrow({ where: { id: input.clubId }, select: { id: true } });
	if (user.role === "CLUB_LEADER") {
		await prisma.club.findFirstOrThrow({ where: { id: input.clubId, leaderId: user.id }, select: { id: true } });
	}
	return prisma.activity.create({ data: input });
});
