<script setup lang="ts">
const auth = useAuth();
const { useStateUser } = auth;
const user = useStateUser();
const currentPassword = ref("");
const newPassword = ref("");
const repeatPassword = ref("");
const errorMessage = ref("");
const submitting = ref(false);

onMounted(async () => {
	if (!(await auth.initAuth())) {
		await navigateTo({ path: "/login", query: { redirect: "/change-password" } });
	}
});

async function submit() {
	errorMessage.value = "";
	submitting.value = true;
	try {
		await useFetchApi("/api/auth/change-password", {
			method: "POST",
			body: {
				currentPassword: currentPassword.value,
				newPassword: newPassword.value,
				repeatPassword: repeatPassword.value,
			},
		});
		await auth.logout();
		await navigateTo({ path: "/login", query: { message: "password-changed" } });
	} catch (error) {
		errorMessage.value = getMessage(error);
	} finally {
		submitting.value = false;
	}
}

function getMessage(error: unknown) {
	if (error && typeof error === "object" && "data" in error) {
		const data = error.data;
		if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") {
			return data.statusMessage;
		}
	}
	return "Không thể đổi mật khẩu. Vui lòng kiểm tra kết nối và thử lại.";
}
</script>

<template>
	<div class="password-layout">
		<section class="card password-card">
			<NuxtLink to="/" class="back-link">← Quay lại trang chủ</NuxtLink>
			<p class="eyebrow">BẢO MẬT TÀI KHOẢN</p>
			<h1>Đổi mật khẩu</h1>
			<p v-if="user?.mustChangePassword" class="required-notice">Bạn đang dùng mật khẩu tạm thời. Hãy đổi mật khẩu để tiếp tục sử dụng tài khoản.</p>
			<p class="intro">Tài khoản: <strong>{{ user?.username }}</strong>. Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.</p>

			<form class="password-form" @submit.prevent="submit">
				<label class="form-field">
					Mật khẩu hiện tại
					<input v-model="currentPassword" type="password" autocomplete="current-password" required />
				</label>
				<label class="form-field">
					Mật khẩu mới
					<input v-model="newPassword" type="password" autocomplete="new-password" minlength="10" maxlength="72" required />
					<small>Dùng ít nhất 10 ký tự.</small>
				</label>
				<label class="form-field">
					Nhập lại mật khẩu mới
					<input v-model="repeatPassword" type="password" autocomplete="new-password" minlength="10" maxlength="72" required />
				</label>
				<p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
				<button class="button submit-button" :disabled="submitting">
					{{ submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu" }}
				</button>
			</form>
		</section>
	</div>
</template>

<style scoped>
.password-layout { max-width: 700px; margin: 20px auto; }
.password-card { padding: clamp(24px, 5vw, 42px); }
.back-link { display: inline-block; margin-bottom: 30px; color: #78837e; font-size: 11px; }
.password-card h1 { margin: 0; font-size: 30px; letter-spacing: -1px; }
.intro { margin: 10px 0 25px; color: #78837e; font-size: 12px; line-height: 1.6; }
.required-notice { margin: 12px 0 0; padding: 11px 13px; border-radius: 8px; background: #fff5e8; color: #805826; font-size: 11px; line-height: 1.5; }
.intro strong { color: #1d7655; }
.password-form { display: grid; gap: 16px; max-width: 460px; }
.form-field { display: grid; gap: 7px; color: #44524b; font-size: 11px; font-weight: 650; }
.form-field input { width: 100%; min-height: 42px; padding: 0 12px; border: 1px solid #e4eae6; border-radius: 8px; outline: none; }
.form-field input:focus { border-color: #1d7655; box-shadow: 0 0 0 3px #1d76551a; }
.form-field small { color: #85908a; font-size: 10px; font-weight: 400; }
.form-error { margin: 0; color: #b94b3a; font-size: 11px; line-height: 1.5; }
.submit-button { justify-self: start; min-width: 175px; }
.submit-button:disabled { opacity: .7; cursor: wait; }
</style>
