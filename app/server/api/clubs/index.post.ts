import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";
import { validateClubInput } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	requireRole(event, ["ADMIN", "STAFF"]);
	const body = await readBody<Record<string, unknown>>(event);
	const club = await prisma.club.create({ data: validateClubInput(body ?? {}) });
	return club;
});
