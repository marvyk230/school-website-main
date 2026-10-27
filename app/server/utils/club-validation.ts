import type { H3Event } from "h3";
import { requireRole } from "~/server/utils/authorization";

const text = (value: unknown, label: string, maxLength: number) => {
	if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
		throw createError({ statusCode: 400, statusMessage: `${label} không hợp lệ.` });
	}
	return value.trim();
};

export const validateClubInput = (body: Record<string, unknown>) => ({
	name: text(body.name, "Tên câu lạc bộ", 80),
	category: text(body.category, "Lĩnh vực", 40),
	emoji: text(body.emoji, "Biểu tượng", 8),
	color: /^#[\da-fA-F]{6}$/.test(String(body.color)) ? String(body.color) : "#eaf3ec",
	description: text(body.description, "Mô tả", 500),
	teacher: text(body.teacher, "Giáo viên phụ trách", 100),
	meeting: text(body.meeting, "Lịch sinh hoạt", 100),
});

export const validateActivityInput = (body: Record<string, unknown>) => {
	const date = text(body.date, "Ngày tổ chức", 10);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
		throw createError({ statusCode: 400, statusMessage: "Ngày tổ chức không hợp lệ." });
	}
	const time = text(body.time, "Giờ bắt đầu", 5);
	if (!/^\d{2}:\d{2}$/.test(time)) {
		throw createError({ statusCode: 400, statusMessage: "Giờ bắt đầu không hợp lệ." });
	}
	return {
		clubId: text(body.clubId, "Câu lạc bộ", 30),
		title: text(body.title, "Tên hoạt động", 100),
		description: text(body.description, "Mô tả hoạt động", 1000),
		date,
		time,
		location: text(body.location, "Địa điểm", 150),
	};
};

export const requireClubManager = async (event: H3Event, clubId: string) => {
	const user = requireRole(event, ["ADMIN", "STAFF", "CLUB_LEADER"]);
	const { prisma } = await import("~/server/db");
	const club = await prisma.club.findUnique({ where: { id: clubId }, select: { leaderId: true } });
	if (!club) {
		throw createError({ statusCode: 404, statusMessage: "Không tìm thấy câu lạc bộ." });
	}
	if (user.role === "CLUB_LEADER") {
		if (club.leaderId !== user.id) {
			throw createError({ statusCode: 403, statusMessage: "Bạn chỉ được quản lý câu lạc bộ được phân công." });
		}
	}
	return user;
};
