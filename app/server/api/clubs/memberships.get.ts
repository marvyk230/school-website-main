import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const memberships = await prisma.clubMembership.findMany({
		where: { userId: user.id },
		select: { clubId: true, status: true },
	});
	return memberships;
});
