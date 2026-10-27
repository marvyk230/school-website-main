import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireRole(event, ["ADMIN", "STAFF", "CLUB_LEADER"]);
	const memberships = await prisma.clubMembership.findMany({
		where: {
			status: "PENDING",
			...(user.role === "CLUB_LEADER" ? { club: { leaderId: user.id } } : {}),
		},
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			createdAt: true,
			user: { select: { id: true, name: true, username: true, email: true } },
			club: { select: { id: true, name: true, emoji: true } },
		},
	});
	return memberships;
});
