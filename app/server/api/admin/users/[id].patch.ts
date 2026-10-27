import { prisma } from "~/server/db";
import { requireRole } from "~/server/utils/authorization";

const roles = ["ADMIN", "STAFF", "CLUB_LEADER", "STUDENT"] as const;

export default defineEventHandler(async (event) => {
	const admin = requireRole(event, ["ADMIN"]);
	const userId = getRouterParam(event, "id");
	if (!userId) throw createError({ statusCode: 400, statusMessage: "Thiếu mã tài khoản." });

	const body = await readBody<{ role?: unknown }>(event);
	if (!body || typeof body !== "object") {
		throw createError({ statusCode: 400, statusMessage: "Thông tin vai trò không hợp lệ." });
	}
	if (typeof body.role !== "string" || !roles.includes(body.role as (typeof roles)[number])) {
		throw createError({ statusCode: 400, statusMessage: "Vai trò không hợp lệ." });
	}

	const target = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true, _count: { select: { leadingClubs: true } } },
	});
	if (!target) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy tài khoản." });
	if (target.role === "ADMIN" && body.role !== "ADMIN") {
		const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
		if (adminCount <= 1) {
			throw createError({ statusCode: 409, statusMessage: "Không thể hạ quyền quản trị viên cuối cùng." });
		}
	}
	if (target._count.leadingClubs > 0 && body.role !== "CLUB_LEADER" && body.role !== "ADMIN") {
		throw createError({ statusCode: 409, statusMessage: "Hãy gỡ tài khoản khỏi vai trò chủ nhiệm các CLB trước." });
	}

	return prisma.user.update({
		where: { id: userId },
		data: { role: body.role },
		select: { id: true, username: true, email: true, name: true, role: true, _count: { select: { leadingClubs: true } } },
	});
});
