<template>
	<div class="forgot-layout">
		<section class="card forgot-card">
			<NuxtLink to="/login" class="back-link">← Quay lại đăng nhập</NuxtLink>
			<p class="eyebrow">KHÔI PHỤC TÀI KHOẢN</p>
			<h1>Quên mật khẩu?</h1>
			<p>Vì website chưa cấu hình gửi email khôi phục, hãy liên hệ quản trị viên của trường để được cấp mật khẩu tạm thời.</p>
			<p>Quản trị viên vào <strong>Quản lý → Phân quyền → Đặt lại mật khẩu</strong> rồi gửi mật khẩu tạm thời cho bạn qua kênh riêng. Khi đăng nhập, bạn sẽ được yêu cầu đổi mật khẩu ngay.</p>
			<NuxtLink to="/login" class="button">Đến trang đăng nhập</NuxtLink>
		</section>
	</div>
</template>

<style scoped>
.forgot-layout { max-width: 700px; margin: 35px auto; }
.forgot-card { padding: clamp(24px, 5vw, 42px); }
.back-link { display: inline-block; margin-bottom: 30px; color: #78837e; font-size: 11px; }
.forgot-card h1 { margin: 0; font-size: 30px; letter-spacing: -1px; }
.forgot-card p:not(.eyebrow) { max-width: 520px; color: #78837e; font-size: 12px; line-height: 1.7; }
.forgot-card strong { color: #1d7655; }
.forgot-card .button { margin-top: 10px; }
</style>
