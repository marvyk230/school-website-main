<script setup lang="ts">
const { signUp, signIn, useStateUser } = useAuth();
const { loadData } = useClubStore();
const user = useStateUser();
const form = reactive({ name: "", username: "", email: "", password: "", repeatPassword: "" });
const errorMessage = ref("");
const submitting = ref(false);

onMounted(() => {
	if (user.value) navigateTo("/");
});

async function submit() {
	errorMessage.value = "";
	submitting.value = true;
	try {
		await signUp({ ...form });
		await signIn({ username: form.username, password: form.password });
		await loadData();
		await navigateTo("/");
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
	return "Không thể tạo tài khoản. Vui lòng thử lại.";
}
</script>

<template>
	<div class="auth-layout register-layout">
		<div class="auth-illustration">
			<div class="illustration-mark">C</div>
			<p class="eyebrow">BẮT ĐẦU HÀNH TRÌNH CỦA BẠN</p>
			<h1>Một nơi để<br />bạn thuộc về.</h1>
			<p>Tạo tài khoản học sinh để đăng ký thành viên CLB, hoạt động và cập nhật hành trình của mình.</p>
			<div class="illustration-icons"><span>🎨</span><span>🤖</span><span>🌱</span><span>🎸</span></div>
		</div>
		<section class="auth-card">
			<NuxtLink to="/" class="auth-back">← Trang chủ</NuxtLink>
			<p class="eyebrow">TÀI KHOẢN HỌC SINH</p>
			<h2>Tạo tài khoản</h2>
			<p class="auth-intro">Thông tin tài khoản được lưu an toàn trong hệ thống.</p>
			<form class="auth-form" @submit.prevent="submit">
				<label class="form-field">Họ và tên<input v-model.trim="form.name" autocomplete="name" maxlength="100" placeholder="Tên hiển thị" /></label>
				<div class="register-grid">
					<label class="form-field">Tên đăng nhập<input v-model.trim="form.username" autocomplete="username" minlength="3" maxlength="30" pattern="[A-Za-z0-9._-]+" required placeholder="Ví dụ: nguyenan" /></label>
					<label class="form-field">Email<input v-model.trim="form.email" type="email" autocomplete="email" maxlength="254" required placeholder="email@truong.edu.vn" /></label>
				</div>
				<div class="register-grid">
					<label class="form-field">Mật khẩu<input v-model="form.password" type="password" autocomplete="new-password" minlength="10" maxlength="72" required placeholder="Ít nhất 10 ký tự" /></label>
					<label class="form-field">Nhập lại mật khẩu<input v-model="form.repeatPassword" type="password" autocomplete="new-password" minlength="10" maxlength="72" required placeholder="Nhập lại mật khẩu" /></label>
				</div>
				<p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
				<button class="button auth-submit" :disabled="submitting">{{ submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản →" }}</button>
			</form>
			<p class="auth-switch">Đã có tài khoản? <NuxtLink to="/login">Đăng nhập</NuxtLink></p>
		</section>
	</div>
</template>

<style scoped>
.auth-layout { min-height: calc(100vh - 144px); display: grid; grid-template-columns: minmax(0,1.1fr) minmax(420px,.9fr); overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: white; }
.auth-illustration { display: flex; flex-direction: column; justify-content: center; padding: 48px; background: #eaf4ee; }
.illustration-mark { width: 42px; height: 42px; margin-bottom: 42px; display: grid; place-items: center; border-radius: 13px; background: var(--green); color: white; font-size: 22px; font-weight: 800; }
.auth-illustration h1 { margin: 0; color: #183c2d; font-size: clamp(32px,4vw,48px); letter-spacing: -1.7px; line-height: 1.1; }
.auth-illustration > p:not(.eyebrow) { max-width: 360px; color: #66796e; font-size: 13px; line-height: 1.7; }
.illustration-icons { display: flex; gap: 12px; margin-top: 20px; }
.illustration-icons span { width: 49px; height: 49px; display: grid; place-items: center; border: 3px solid white; border-radius: 15px; background: #ffffff9e; font-size: 24px; }
.auth-card { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 54px clamp(25px,5vw,60px); }
.auth-back { position: absolute; top: 24px; left: 28px; color: #7e8b83; font-size: 11px; }
.auth-card h2 { margin: 0; font-size: 28px; letter-spacing: -.8px; }
.auth-intro { margin: 8px 0 18px; color: var(--muted); font-size: 12px; }
.auth-form { display: grid; gap: 12px; }
.register-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.auth-form .form-field { gap: 6px; }
.auth-submit { width: 100%; margin-top: 2px; }
.form-error { margin: 0; color: #b94b3a; font-size: 11px; line-height: 1.5; }
.auth-switch { margin-top: 15px; color: var(--muted); font-size: 11px; text-align: center; }
.auth-switch a { color: var(--green); font-weight: 700; }
@media(max-width: 900px) { .auth-layout { grid-template-columns: 1fr; } .auth-illustration { min-height: 230px; padding: 28px; } .illustration-mark { margin-bottom: 20px; } .illustration-icons { display: none; } .auth-illustration h1 { font-size: 32px; } .auth-illustration > p:not(.eyebrow) { max-width: 450px; margin-bottom: 0; } .auth-card { min-height: 480px; } }
@media(max-width: 520px) { .register-grid { grid-template-columns: 1fr; } }
</style>
