import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	await prisma.club.findUniqueOrThrow({ where: { id: clubId }, select: { id: true } });
	const existing = await prisma.clubMembership.findUnique({
		where: { userId_clubId: { userId: user.id, clubId } },
		select: { status: true },
	});
	if (existing?.status === "ACTIVE" || existing?.status === "PENDING") {
		return { success: true, status: existing.status };
	}
	await prisma.clubMembership.upsert({
		where: { userId_clubId: { userId: user.id, clubId } },
		create: { userId: user.id, clubId, status: "PENDING" },
		update: { status: "PENDING" },
	});
	return { success: true, status: "PENDING" };
});
