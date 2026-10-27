import type { H3Event } from "h3";
import type { User } from "@prisma/client";

export type AppRole = "ADMIN" | "STAFF" | "CLUB_LEADER" | "STUDENT";

export const requireUser = (event: H3Event) => {
	const user = event.context.auth?.user as User | undefined;
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Đăng nhập để tiếp tục." });
	}
	return user;
};

export const requireRole = (event: H3Event, roles: AppRole[]) => {
	const user = requireUser(event);
	if (!roles.includes(user.role as AppRole)) {
		throw createError({ statusCode: 403, statusMessage: "Bạn không có quyền thực hiện thao tác này." });
	}
	return user;
};
