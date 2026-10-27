import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) throw createError({ statusCode: 400, statusMessage: "Thiếu mã hoạt động." });
	const activity = await prisma.activity.findUniqueOrThrow({
		where: { id },
		include: {
			club: { select: { leaderId: true, members: { include: { user: { select: { id: true, name: true, username: true } } } } } },
			registrations: { include: { user: { select: { id: true, name: true, username: true, email: true } } } },
		},
	});
	await requireClubManager(event, activity.clubId);
	return {
		activityId: activity.id,
		members: activity.club.members.map(({ user }) => ({
			...user,
			registered: activity.registrations.some((registration) => registration.userId === user.id),
			attended: activity.registrations.find((registration) => registration.userId === user.id)?.attended ?? false,
		})),
	};
});
