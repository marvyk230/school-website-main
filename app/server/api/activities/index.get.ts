import { prisma } from "~/server/db";

export default defineEventHandler(async () => {
	const activities = await prisma.activity.findMany({
		orderBy: [{ date: "asc" }, { time: "asc" }],
		include: { registrations: { select: { userId: true, attended: true } } },
	});
	return activities.map(({ registrations, ...activity }) => ({
		...activity,
		attendeeIds: registrations.map((registration) => registration.userId),
		attendanceIds: registrations.filter((registration) => registration.attended).map((registration) => registration.userId),
	}));
});
