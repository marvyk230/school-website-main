import { getRequestURL } from "h3";
import { decodeAccessToken } from "../utils/jwt";
import { getUserById } from "../db/users";

interface AccessPayload {
	userId: string;
}

export default defineEventHandler(async (event) => {
	const url = getRequestURL(event);
	if (!url.pathname.startsWith("/api/")) return;

	const publicAuthRoutes = [
		"/api/auth/login",
		"/api/auth/register",
		"/api/auth/refresh",
		"/api/auth/logout",
	];
	if (publicAuthRoutes.includes(url.pathname)) return;

	if (
		event.method === "GET" &&
		(
			url.pathname === "/api/clubs" ||
			url.pathname === "/api/activities"
		)
	) {
		return;
	}

	const authorization = getHeader(event, "authorization");
	const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
	if (!token) {
		throw createError({ statusCode: 401, statusMessage: "Vui lòng đăng nhập." });
	}

	const decoded = decodeAccessToken(token);
	if (!decoded || typeof decoded === "string" || !("userId" in decoded)) {
		throw createError({ statusCode: 401, statusMessage: "Phiên đăng nhập đã hết hạn." });
	}

	const user = await getUserById((decoded as AccessPayload).userId);
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Tài khoản không còn tồn tại." });
	}
	if (
		user.mustChangePassword &&
		!["/api/auth/change-password", "/api/auth/logout", "/api/auth/user"].includes(url.pathname)
	) {
		throw createError({ statusCode: 403, statusMessage: "Hãy đổi mật khẩu tạm thời trước khi tiếp tục." });
	}
	event.context.auth = { user };
});
