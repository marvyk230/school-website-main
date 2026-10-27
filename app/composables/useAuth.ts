import type { User, UserLogin } from "~/types/user";
import type { Token } from "~/types/token";

interface LoginResponse {
	access_token: string;
	user: User;
}

export default () => {
	const useStateToken = () => useState<Token | null>("auth_token", () => null);
	const useStateUser = () => useState<User | null>("auth_user", () => null);
	const useStateLoading = () => useState<boolean>("auth_loading", () => false);
	const initialized = useState<boolean>("auth_initialized", () => false);
	const initializing = useState<boolean>("auth_initializing", () => false);

	const setToken = (token: Token | null) => {
		useStateToken().value = token;
	};
	const setUser = (user: User | null) => {
		useStateUser().value = user;
	};

	const signUp = async (data: User) => {
		return await $fetch<{ user: User }>("/api/auth/register", {
			method: "POST",
			body: data,
		});
	};

	const signIn = async ({ username, password }: UserLogin) => {
		const response = await $fetch<LoginResponse>("/api/auth/login", {
			method: "POST",
			body: { username, password },
		});
		setToken(response.access_token);
		setUser(response.user);
		initialized.value = true;
		return response.user;
	};

	const refreshToken = async () => {
		const response = await $fetch<LoginResponse>("/api/auth/refresh");
		setToken(response.access_token);
		if (response.user) setUser(response.user);
		return response.access_token;
	};

	const initAuth = async () => {
		if (initialized.value) return Boolean(useStateUser().value);
		if (initializing.value) {
			while (!initialized.value) {
				await new Promise((resolve) => setTimeout(resolve, 25));
			}
			return Boolean(useStateUser().value);
		}

		initializing.value = true;
		setUseStateLoading(true);
		try {
			const token = await refreshToken();
			const response = await $fetch<{ user: User }>("/api/auth/user", {
				headers: { authorization: `Bearer ${token}` },
			});
			setUser(response.user);
			return true;
		} catch {
			setToken(null);
			setUser(null);
			return false;
		} finally {
			setUseStateLoading(false);
			initializing.value = false;
			initialized.value = true;
		}
	};

	const setUseStateLoading = (value: boolean) => {
		useStateLoading().value = value;
	};

	const logout = async () => {
		try {
			await $fetch("/api/auth/logout", { method: "POST" });
		} finally {
			setToken(null);
			setUser(null);
			initialized.value = true;
		}
	};

	return {
		signUp,
		signIn,
		logout,
		initAuth,
		refreshToken,
		useStateUser,
		useStateToken,
		useStateLoading,
		initialized,
	};
};
