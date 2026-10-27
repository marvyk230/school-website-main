import { prisma } from "~/server/db";

export default defineEventHandler(async () => {
	const clubs = await prisma.club.findMany({
		orderBy: { name: "asc" },
		include: {
			members: { where: { status: "ACTIVE" }, select: { userId: true } },
			activities: { select: { id: true } },
		},
	});
	return clubs.map(({ members, activities, ...club }) => ({
		...club,
		memberIds: members.map((member) => member.userId),
		activityCount: activities.length,
	}));
});
