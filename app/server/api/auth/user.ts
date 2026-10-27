export default defineEventHandler((event) => {
	const user = event.context.auth?.user;
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Vui lòng đăng nhập." });
	}
	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			name: user.name,
			profileImage: user.profileImage,
			role: user.role,
			mustChangePassword: user.mustChangePassword,
		},
	};
});
