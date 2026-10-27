<script setup lang="ts">
const { signIn, useStateUser } = useAuth();
const { loadData, toast } = useClubStore();
const user = useStateUser();
const route = useRoute();
const passwordChanged = computed(() => route.query.message === "password-changed");
const username = ref("");
const password = ref("");
const errorMessage = ref("");
const submitting = ref(false);

onMounted(() => {
	if (user.value) navigateTo("/");
});

async function submit() {
	errorMessage.value = "";
	submitting.value = true;
	try {
		const signedInUser = await signIn({ username: username.value, password: password.value });
		if (signedInUser.mustChangePassword) {
			await navigateTo("/change-password");
			return;
		}
		await loadData();
		const redirect = typeof route.query.redirect === "string" && route.query.redirect.startsWith("/") && !route.query.redirect.startsWith("//")
			? route.query.redirect
			: "/";
		await navigateTo(redirect);
	} catch (error) {
		errorMessage.value = getMessage(error);
	} finally {
		submitting.value = false;
	}
}

function getMessage(error: unknown) {
	if (error && typeof error === "object" && "data" in error) {
		const data = error.data;
		if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") return data.statusMessage;
	}
	return "Không thể đăng nhập. Vui lòng kiểm tra kết nối và thử lại.";
}
</script>

<template>
	<div class="auth-layout">
		<div class="auth-illustration">
			<div class="illustration-mark">C</div>
			<p class="eyebrow">CLB CONNECT · TRƯỜNG HỌC</p>
			<h1>Nơi những<br />đam mê gặp nhau.</h1>
			<p>Khám phá cộng đồng, gặp gỡ bạn bè và cùng tạo nên những trải nghiệm đáng nhớ.</p>
			<div class="illustration-icons"><span>🎨</span><span>🤖</span><span>🌱</span><span>🎸</span></div>
		</div>
		<section class="auth-card">
			<NuxtLink to="/" class="auth-back">← Trang chủ</NuxtLink>
			<p class="eyebrow">CHÀO MỪNG TRỞ LẠI</p>
			<h2>Đăng nhập</h2>
			<p class="auth-intro">Đăng nhập để tham gia câu lạc bộ và hoạt động.</p>
			<p v-if="passwordChanged" class="form-success" role="status">Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.</p>
			<form class="auth-form" @submit.prevent="submit">
				<label class="form-field">Tên đăng nhập<input v-model.trim="username" autocomplete="username" required autofocus placeholder="Nhập tên đăng nhập" /></label>
				<label class="form-field">Mật khẩu<input v-model="password" type="password" autocomplete="current-password" required placeholder="Nhập mật khẩu" /></label>
				<div class="forgot-link"><NuxtLink to="/forgot-password">Quên mật khẩu?</NuxtLink></div>
				<p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
				<button class="button auth-submit" :disabled="submitting">{{ submitting ? "Đang đăng nhập..." : "Đăng nhập →" }}</button>
			</form>
			<p class="auth-switch">Chưa có tài khoản? <NuxtLink to="/register">Đăng ký học sinh</NuxtLink></p>
		</section>
		<Transition><div v-if="toast" class="toast" role="status">{{ toast }}</div></Transition>
	</div>
</template>

<style scoped>
.auth-layout { min-height: calc(100vh - 144px); display: grid; grid-template-columns: minmax(0,1.1fr) minmax(350px,.9fr); overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: white; }
.auth-illustration { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding: 48px; background: #eaf4ee; }
.illustration-mark { width: 42px; height: 42px; margin-bottom: 42px; display: grid; place-items: center; border-radius: 13px; background: var(--green); color: white; font-size: 22px; font-weight: 800; }
.auth-illustration h1 { margin: 0; color: #183c2d; font-size: clamp(32px,4vw,48px); letter-spacing: -1.7px; line-height: 1.1; }
.auth-illustration > p:not(.eyebrow) { max-width: 360px; color: #66796e; font-size: 13px; line-height: 1.7; }
.illustration-icons { display: flex; gap: 12px; margin-top: 20px; }
.illustration-icons span { width: 49px; height: 49px; display: grid; place-items: center; border: 3px solid white; border-radius: 15px; background: #ffffff9e; font-size: 24px; }
.auth-card { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 50px clamp(25px,6vw,75px); }
.auth-back { position: absolute; top: 24px; left: 28px; color: #7e8b83; font-size: 11px; }
.auth-card h2 { margin: 0; font-size: 28px; letter-spacing: -.8px; }
.auth-intro { margin: 8px 0 23px; color: var(--muted); font-size: 12px; }
.auth-form { display: grid; gap: 15px; }
.auth-form .form-field { gap: 7px; }
.auth-submit { width: 100%; margin-top: 2px; }
.auth-submit:disabled { opacity: .7; cursor: wait; }
.form-error { margin: 0; color: #b94b3a; font-size: 11px; line-height: 1.5; }
.form-success { margin: -10px 0 4px; color: #1d7655; font-size: 11px; line-height: 1.5; }
.forgot-link { margin-top: -7px; text-align: right; font-size: 11px; }
.forgot-link a { color: var(--green); font-weight: 700; }
.auth-switch { margin-top: 18px; color: var(--muted); font-size: 11px; text-align: center; }
.auth-switch a { color: var(--green); font-weight: 700; }
@media(max-width: 760px) { .auth-layout { min-height: auto; grid-template-columns: 1fr; } .auth-illustration { min-height: 230px; padding: 28px; } .illustration-mark { margin-bottom: 20px; } .auth-illustration h1 { font-size: 32px; } .auth-illustration > p:not(.eyebrow) { max-width: 440px; margin-bottom: 0; } .illustration-icons { display: none; } .auth-card { min-height: 430px; padding: 55px 25px 35px; } }
</style>
