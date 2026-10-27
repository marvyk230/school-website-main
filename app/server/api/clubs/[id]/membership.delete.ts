import { prisma } from "~/server/db";
import { requireUser } from "~/server/utils/authorization";

export default defineEventHandler(async (event) => {
	const user = requireUser(event);
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	await prisma.clubMembership.deleteMany({ where: { userId: user.id, clubId } });
	return { success: true };
});
