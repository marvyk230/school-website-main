import { prisma } from "~/server/db";
import { requireClubManager } from "~/server/utils/club-validation";

export default defineEventHandler(async (event) => {
	const clubId = getRouterParam(event, "id");
	if (!clubId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã câu lạc bộ." });
	const author = await requireClubManager(event, clubId);
	const body = await readBody<{ title?: unknown; content?: unknown }>(event);

	if (!body || typeof body.title !== "string" || typeof body.content !== "string") {
		throw createError({ statusCode: 400, statusMessage: "Vui lòng nhập tiêu đề và nội dung thông báo." });
	}
	const title = body.title.trim();
	const content = body.content.trim();
	if (!title || title.length > 120 || !content || content.length > 3000) {
		throw createError({ statusCode: 400, statusMessage: "Tiêu đề tối đa 120 ký tự, nội dung tối đa 3000 ký tự và không được để trống." });
	}

	return prisma.clubAnnouncement.create({
		data: { clubId, authorId: author.id, title, content },
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
			author: { select: { name: true, username: true } },
		},
	});
});
