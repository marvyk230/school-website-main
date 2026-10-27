import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	await requireClubManager(event, clubId);

	return prisma.clubMembership.findMany({
		where: { clubId },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			user: { select: { id: true, name: true, username: true, email: true } },
		},
	});
});
