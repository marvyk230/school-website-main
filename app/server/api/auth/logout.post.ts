import { deleteRefreshToken } from "~/server/db/refreshTokens";

export default defineEventHandler(async (event) => {
	const cookie = getCookie(event, "refresh_token");
	if (cookie) {
		await deleteRefreshToken(cookie).catch((error: unknown) => {
			if (error && typeof error === "object" && "code" in error && error.code === "P2025") return;
			throw error;
		});
	}
	deleteCookie(event, "refresh_token", { httpOnly: true, sameSite: "lax", path: "/" });
	return { message: "Đăng xuất thành công." };
});
