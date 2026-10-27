export default <T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
	const { useStateToken, refreshToken } = useAuth();
	const token = useStateToken();

	const request = () => $fetch<T>(url, {
		...options,
		headers: {
			...options?.headers,
			...(token.value ? { authorization: `Bearer ${token.value}` } : {}),
		},
	});

	return request().catch(async (error: unknown) => {
		const statusCode =
			error && typeof error === "object" && "statusCode" in error
				? error.statusCode
				: error && typeof error === "object" && "status" in error
					? error.status
					: undefined;
		if (statusCode !== 401) throw error;
		try {
			await refreshToken();
		} catch {
			token.value = null;
			throw error;
		}
		return request();
	});
};
