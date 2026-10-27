<script setup lang="ts">
const route = useRoute();
const { toast, loadData } = useClubStore();
const { initAuth, logout, useStateUser } = useAuth();
const user = useStateUser();

onMounted(async () => {
	await initAuth();
	if (user.value?.mustChangePassword && route.path !== "/change-password") {
		await navigateTo("/change-password");
		return;
	}
	await loadData();
});

async function signOut() {
	await logout();
	notify("Đã đăng xuất.");
	await navigateTo("/");
}

function notify(message: string) {
	const state = useState<string>("club-connect-toast");
	state.value = message;
	setTimeout(() => (state.value = ""), 2500);
}

const navigation = [
	{ label: "Tổng quan", to: "/", icon: "⌂" },
	{ label: "Câu lạc bộ", to: "/clubs", icon: "✳" },
	{ label: "Hoạt động", to: "/activities", icon: "▦" },
	{ label: "Quản lý", to: "/manage", icon: "⚙" },
];
const visibleNavigation = computed(() => navigation.filter((item) =>
	item.to !== "/manage" || ["ADMIN", "STAFF", "CLUB_LEADER"].includes(user.value?.role ?? "")
));
</script>

<template>
	<div class="app-shell">
		<aside class="sidebar">
			<NuxtLink to="/" class="brand">
				<span class="brand-mark">C</span>
				<span><strong>CLB Connect</strong><small>TRƯỜNG HỌC</small></span>
			</NuxtLink>
			<p class="nav-caption">KHÔNG GIAN CỦA BẠN</p>
			<nav class="side-nav">
				<NuxtLink
					v-for="item in visibleNavigation"
					:key="item.to"
					:to="item.to"
					class="nav-link"
					:class="{ active: route.path === item.to }"
				>
					<span class="nav-icon">{{ item.icon }}</span>
					{{ item.label }}
					<span v-if="item.to === '/activities'" class="nav-count">MỚI</span>
				</NuxtLink>
			</nav>
			<div class="sidebar-bottom">
				<div class="demo-note"><span class="online-dot"></span> Hệ thống câu lạc bộ</div>
				<p>Hoạt động và thành viên được lưu trong cơ sở dữ liệu.</p>
			</div>
		</aside>

		<div class="main-shell">
			<header class="topbar">
				<div class="breadcrumb">Không gian học sinh <span>/</span> {{ route.path === "/change-password" ? "Đổi mật khẩu" : navigation.find((item) => item.to === route.path)?.label ?? "Chi tiết" }}</div>
				<div v-if="user" class="profile-actions">
					<div class="profile-chip"><span class="avatar">{{ (user.name || user.username).slice(0, 1).toUpperCase() }}</span><span>{{ user.name || user.username }}<small>{{ user.role === "ADMIN" ? "Quản trị viên" : user.role === "STAFF" ? "Cán bộ phụ trách" : user.role === "CLUB_LEADER" ? "Chủ nhiệm CLB" : "Học sinh" }}</small></span></div>
					<NuxtLink to="/change-password" class="button small outline">Đổi mật khẩu</NuxtLink>
					<button class="button small outline" @click="signOut">Đăng xuất</button>
				</div>
				<NuxtLink v-else to="/login" class="button small">Đăng nhập</NuxtLink>
			</header>
			<main class="page-container"><slot /></main>
		</div>

		<nav class="mobile-nav">
			<NuxtLink v-for="item in visibleNavigation" :key="item.to" :to="item.to" :class="{ active: route.path === item.to }">
				<span>{{ item.icon }}</span>{{ item.label }}
			</NuxtLink>
		</nav>
		<Transition><div v-if="toast" class="toast" role="status">{{ toast }}</div></Transition>
	</div>
</template>

<style lang="scss">
:root {
	--ink: #17231f;
	--muted: #78837e;
	--green: #1d7655;
	--green-dark: #15583f;
	--mint: #e8f4ee;
	--line: #e9eeeb;
	--paper: #fff;
	--canvas: #f7f9f7;
	--orange: #e88b4c;
	--sidebar-width: 248px;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--canvas); color: var(--ink); font-family: Inter, "Segoe UI", Arial, sans-serif; font-size: 14px; }
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
.app-shell { min-height: 100vh; }
.sidebar { width: var(--sidebar-width); position: fixed; inset: 0 auto 0 0; z-index: 4; background: #fff; border-right: 1px solid var(--line); padding: 28px 17px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 11px; padding: 0 7px; color: var(--ink); }
.brand-mark { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 12px; background: var(--green); color: #fff; font-weight: 800; font-size: 21px; }
.brand strong, .brand small, .profile-chip small { display: block; }
.brand strong { font-size: 15px; letter-spacing: -.3px; }
.brand small { margin-top: 3px; color: #98a39e; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; }
.nav-caption { margin: 48px 8px 13px; color: #a0aaa4; font-weight: 700; font-size: 9px; letter-spacing: 1.1px; }
.side-nav { display: grid; gap: 5px; }
.nav-link { min-height: 44px; padding: 0 11px; border-radius: 9px; display: flex; align-items: center; gap: 12px; color: #6f7a74; font-weight: 600; transition: background .15s, color .15s; }
.nav-link:hover, .nav-link.active { background: #edf6f1; color: var(--green); }
.nav-icon { width: 22px; text-align: center; font-size: 20px; }
.nav-count { margin-left: auto; font-size: 9px; color: var(--orange); letter-spacing: .3px; }
.sidebar-bottom { margin-top: auto; padding: 12px 9px; }
.demo-note { display: flex; align-items: center; gap: 8px; color: var(--green); font-size: 12px; font-weight: 700; }
.online-dot { width: 8px; height: 8px; border-radius: 50%; background: #52b482; }
.sidebar-bottom p { margin: 8px 0 0; color: #98a39e; font-size: 11px; line-height: 1.5; }
.main-shell { min-height: 100vh; margin-left: var(--sidebar-width); }
.topbar { height: 73px; padding: 0 42px; display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid var(--line); }
.breadcrumb { color: #85908a; font-size: 12px; }
.breadcrumb span { margin: 0 8px; color: #c1c9c4; }
.profile-chip { display: flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 700; }
.profile-actions { display: flex; align-items: center; gap: 12px; }
.profile-chip small { margin-top: 3px; color: var(--muted); font-size: 10px; font-weight: 400; }
.avatar { width: 35px; height: 35px; display: grid; place-items: center; border-radius: 50%; background: #f4dfc8; color: #875932; font-weight: 700; }
.chevron { margin-left: 5px; color: #8a948f; }
.page-container { max-width: 1310px; margin: 0 auto; padding: 35px 42px 60px; }
.mobile-nav { display: none; }
.page-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 27px; }
.eyebrow { margin: 0 0 8px; color: var(--green); font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
.page-heading h1 { margin: 0; font-size: clamp(26px, 3vw, 35px); letter-spacing: -1.3px; }
.page-heading p:not(.eyebrow) { margin: 9px 0 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
.button { min-height: 40px; padding: 0 15px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 8px; background: var(--green); color: #fff; font-size: 12px; font-weight: 700; transition: background .15s, transform .15s; }
.button:hover { background: var(--green-dark); transform: translateY(-1px); }
.button.secondary { background: #edf3ef; color: #35654f; }
.button.secondary:hover { background: #e0ece5; }
.button.outline { background: #fff; border: 1px solid var(--line); color: #52615a; }
.button.danger { background: #fff0ed; color: #b94b3a; }
.button.small { min-height: 33px; padding: 0 11px; font-size: 11px; }
.card { border: 1px solid var(--line); border-radius: 13px; background: #fff; }
.section-title { margin: 0; font-size: 16px; letter-spacing: -.3px; }
.section-subtitle { margin: 5px 0 0; color: var(--muted); font-size: 11px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.stat-card { padding: 19px; }
.stat-top { display: flex; justify-content: space-between; align-items: center; color: var(--muted); font-size: 11px; font-weight: 600; }
.stat-icon { width: 33px; height: 33px; display: grid; place-items: center; border-radius: 10px; background: var(--mint); color: var(--green); font-size: 17px; }
.stat-value { margin-top: 13px; font-size: 27px; font-weight: 750; letter-spacing: -1px; }
.stat-foot { margin-top: 5px; color: #8b9690; font-size: 10px; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(270px, .85fr); gap: 17px; margin-top: 20px; }
.panel { padding: 21px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.text-link { color: var(--green); font-size: 11px; font-weight: 700; }
.club-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; }
.club-card { overflow: hidden; transition: transform .18s, box-shadow .18s; }
.club-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px #243d3010; }
.club-cover { min-height: 104px; padding: 15px; display: flex; align-items: flex-start; justify-content: space-between; background: var(--club-color, #eaf3ec); }
.club-emoji { font-size: 34px; }
.category-tag { padding: 5px 8px; border-radius: 999px; background: #ffffffc7; color: #53625a; font-size: 9px; font-weight: 700; }
.club-info { padding: 14px; }
.club-info h3 { margin: 0; font-size: 13px; }
.club-info p { min-height: 34px; margin: 7px 0 12px; color: var(--muted); font-size: 10px; line-height: 1.6; }
.club-meta { display: flex; align-items: center; gap: 6px; color: #85918a; font-size: 10px; }
.club-actions { margin-top: 13px; display: flex; justify-content: space-between; align-items: center; }
.event-list { display: grid; gap: 12px; }
.event-row { display: flex; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f3f1; }
.event-row:last-child { padding-bottom: 0; border: 0; }
.date-tile { flex: 0 0 45px; height: 49px; display: grid; align-content: center; justify-items: center; border-radius: 9px; background: #edf6f1; color: var(--green); }
.date-tile strong { font-size: 16px; line-height: 1.1; }
.date-tile small { margin-top: 3px; font-size: 8px; text-transform: uppercase; }
.event-details { min-width: 0; }
.event-details strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
.event-details span { display: block; margin-top: 5px; color: var(--muted); font-size: 10px; }
.pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 999px; background: #edf6f1; color: var(--green); font-size: 9px; font-weight: 700; }
.pill.gray { background: #f1f3f2; color: #717d76; }
.activity-list { display: grid; gap: 12px; }
.activity-card { padding: 17px; display: flex; align-items: center; gap: 15px; }
.activity-date { flex: 0 0 54px; height: 58px; display: grid; place-content: center; justify-items: center; border-radius: 11px; background: #f0f6f2; color: var(--green); }
.activity-date strong { font-size: 20px; line-height: 1.1; }
.activity-date small { margin-top: 4px; font-size: 9px; }
.activity-copy { min-width: 0; flex: 1; }
.activity-copy h3 { margin: 0; font-size: 14px; }
.activity-copy p { margin: 6px 0; color: var(--muted); font-size: 11px; }
.activity-actions { display: flex; align-items: center; gap: 8px; }
.toolbar { display: flex; align-items: center; gap: 9px; }
.search-input, .form-field input, .form-field select, .form-field textarea { width: 100%; min-height: 40px; padding: 0 12px; border: 1px solid #e4eae6; border-radius: 8px; outline: none; background: #fff; color: var(--ink); }
.search-input:focus, .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #69a98a; box-shadow: 0 0 0 3px #1d765516; }
.search-wrap { position: relative; width: min(250px, 100%); }
.search-wrap input { padding-left: 34px; }
.search-symbol { position: absolute; top: 11px; left: 12px; color: #9aa49f; }
.empty-state { padding: 36px 15px; text-align: center; color: var(--muted); font-size: 12px; }
.modal-backdrop { position: fixed; inset: 0; z-index: 12; display: grid; place-items: center; padding: 20px; background: #13231b77; }
.modal { width: min(560px, 100%); max-height: min(90vh, 760px); overflow: auto; padding: 23px; border-radius: 15px; background: #fff; box-shadow: 0 20px 60px #10281e35; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.modal-header h2 { margin: 0; font-size: 19px; }
.modal-close { width: 32px; height: 32px; border: 0; border-radius: 8px; background: #f3f5f4; color: #58665f; font-size: 18px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
.form-field { display: grid; gap: 6px; color: #59665f; font-size: 11px; font-weight: 700; }
.form-field.full { grid-column: 1 / -1; }
.form-field textarea { min-height: 85px; padding: 10px 12px; resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 19px; }
.manage-section { margin-top: 19px; padding: 20px; }
.manage-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid #eff2f0; }
.manage-row:last-child { border-bottom: 0; }
.manage-row-main { min-width: 0; flex: 1; }
.manage-row-main strong { display: block; font-size: 12px; }
.manage-row-main small { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; }
.row-emoji { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 11px; background: var(--mint); font-size: 20px; }
.toast { position: fixed; right: 24px; bottom: 24px; z-index: 20; padding: 12px 16px; border-radius: 9px; background: #183c2d; color: white; box-shadow: 0 8px 24px #0e271b2b; font-size: 12px; }
.v-enter-active, .v-leave-active { transition: opacity .2s, transform .2s; }
.v-enter-from, .v-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 1000px) { .page-container { padding: 29px 25px 55px; } .topbar { padding: 0 25px; } .club-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 760px) { :root { --sidebar-width: 0px; } .sidebar { display: none; } .main-shell { margin-left: 0; } .topbar { height: 60px; padding: 0 18px; } .profile-chip { font-size: 0; } .profile-chip small, .chevron { display: none; } .profile-chip .avatar { font-size: 12px; } .page-container { padding: 24px 17px 95px; } .mobile-nav { position: fixed; inset: auto 0 0; z-index: 8; display: grid; grid-template-columns: repeat(4, 1fr); padding: 8px 5px calc(8px + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: #fff; } .mobile-nav a { display: grid; justify-items: center; gap: 4px; color: #89948e; font-size: 9px; font-weight: 600; } .mobile-nav a span { font-size: 18px; } .mobile-nav a.active { color: var(--green); } .dashboard-grid { grid-template-columns: 1fr; } .stat-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; } .stat-card { padding: 14px; } .stat-value { font-size: 24px; } }
@media (max-width: 520px) { .page-heading { align-items: flex-start; flex-direction: column; } .page-heading > .button { align-self: stretch; } .club-grid { grid-template-columns: 1fr; } .club-card { display: grid; grid-template-columns: 95px 1fr; } .club-cover { min-height: 100%; align-items: center; flex-direction: column; justify-content: center; gap: 8px; } .club-emoji { font-size: 30px; } .club-info p { min-height: 0; } .activity-card { align-items: flex-start; flex-wrap: wrap; } .activity-actions { width: 100%; justify-content: flex-end; } .toolbar { width: 100%; } .search-wrap { flex: 1; } .form-grid { grid-template-columns: 1fr; } .form-field.full { grid-column: auto; } }
</style>
