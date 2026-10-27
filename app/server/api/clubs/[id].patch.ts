import { prisma } from "~/server/db";
import { requireClubManager, validateClubInput } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	await requireClubManager(event, id);
	const body = await readBody<Record<string, unknown>>(event);
	return prisma.club.update({
		where: { id },
		data: validateClubInput(body ?? {}),
	});
});
