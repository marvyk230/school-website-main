import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	requireRole(event, ["ADMIN"]);
	return prisma.user.findMany({
		orderBy: [{ role: "asc" }, { username: "asc" }],
		select: {
			id: true,
			username: true,
			email: true,
			name: true,
			role: true,
			mustChangePassword: true,
			_count: { select: { leadingClubs: true } },
		},
	});
});
