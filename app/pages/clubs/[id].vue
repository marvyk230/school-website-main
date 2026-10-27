<script setup lang="ts">
interface Announcement {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	author: { name: string | null; username: string } | null;
}

interface ClubMember {
	id: string;
	status: string;
	createdAt: string;
	user: { id: string; name: string | null; username: string; email: string };
}

const route = useRoute();
const { clubs, activities, membershipStatuses, user, loadData, toggleMembership } = useClubStore();
const auth = useAuth();
const clubId = computed(() => String(route.params.id));
const club = computed(() => clubs.value.find((item) => item.id === clubId.value));
const clubActivities = computed(() => activities.value.filter((activity) => activity.clubId === clubId.value));
const canManage = computed(() => ["ADMIN", "STAFF", "CLUB_LEADER"].includes(user.value?.role ?? ""));
const membershipStatus = computed(() =>
	membershipStatuses.value[clubId.value] ??
	(club.value?.memberIds.includes(user.value?.id ?? "") ? "ACTIVE" : ""),
);
const canViewAnnouncements = computed(() => membershipStatus.value === "ACTIVE");
const announcements = ref<Announcement[]>([]);
const members = ref<ClubMember[]>([]);
const announcementForm = reactive({ title: "", content: "" });
const loading = ref(true);
const errorMessage = ref("");
const toast = ref("");
const postingAnnouncement = ref(false);
const announcementsRestricted = ref(false);

async function loadAnnouncements() {
	if (!canViewAnnouncements.value) {
		announcements.value = [];
		announcementsRestricted.value = true;
		return;
	}
	try {
		announcements.value = await useFetchApi<Announcement[]>(`/api/clubs/${clubId.value}/announcements`);
		announcementsRestricted.value = false;
	} catch (error) {
		const statusCode =
			error && typeof error === "object" && "statusCode" in error
				? error.statusCode
				: error && typeof error === "object" && "status" in error
					? error.status
					: undefined;
		if (statusCode === 403 || statusCode === 401) {
			announcements.value = [];
			announcementsRestricted.value = true;
			return;
		}
		throw error;
	}
}

async function loadMembers() {
	if (!canManage.value) {
		members.value = [];
		return;
	}
	members.value = await useFetchApi<ClubMember[]>(`/api/clubs/${clubId.value}/members`);
}

async function loadClubPage() {
	loading.value = true;
	errorMessage.value = "";
	try {
		await auth.initAuth();
		await loadData();
		if (!club.value) {
			throw createError({ statusCode: 404, statusMessage: "Không tìm thấy câu lạc bộ." });
		}
		await Promise.all([loadAnnouncements(), loadMembers()]);
	} catch (error) {
		errorMessage.value = getMessage(error);
	}
	finally {
		loading.value = false;
	}
}

async function joinOrLeave() {
	if (!club.value) return;
	await toggleMembership(club.value);
	await loadAnnouncements();
	await loadMembersIfManager();
}

async function loadMembersIfManager() {
	if (!canManage.value) return;
	try {
		await loadMembers();
	} catch (error) {
		errorMessage.value = getMessage(error);
	}
}

async function postAnnouncement() {
	if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
	postingAnnouncement.value = true;
	errorMessage.value = "";
	try {
		await useFetchApi(`/api/clubs/${clubId.value}/announcements`, {
			method: "POST",
			body: { title: announcementForm.title, content: announcementForm.content },
		});
		announcementForm.title = "";
		announcementForm.content = "";
		toast.value = "Đã đăng thông báo cho câu lạc bộ.";
		if (canViewAnnouncements.value) await loadAnnouncements();
	} catch (error) {
		errorMessage.value = getMessage(error);
	} finally {
		postingAnnouncement.value = false;
	}
}

async function reviewMember(member: ClubMember, decision: "approve" | "reject") {
	errorMessage.value = "";
	try {
		await useFetchApi(`/api/memberships/${member.id}`, {
			method: "PATCH",
			body: { decision },
		});
		toast.value = decision === "approve" ? "Đã duyệt thành viên." : "Đã từ chối yêu cầu tham gia.";
		await Promise.all([loadMembers(), loadData()]);
	} catch (error) {
		errorMessage.value = getMessage(error);
	}
}

async function removeMember(member: ClubMember) {
	if (!club.value || !window.confirm(`Xóa "${member.user.name || member.user.username}" khỏi CLB?`)) return;
	errorMessage.value = "";
	try {
		await useFetchApi(`/api/clubs/${clubId.value}/members/${member.user.id}`, { method: "DELETE" });
		toast.value = "Đã xóa thành viên khỏi câu lạc bộ.";
		await Promise.all([loadMembers(), loadData()]);
	} catch (error) {
		errorMessage.value = getMessage(error);
	}
}

async function deleteAnnouncement(announcement: Announcement) {
	if (!window.confirm(`Xóa thông báo "${announcement.title}"?`)) return;
	errorMessage.value = "";
	try {
		await useFetchApi(`/api/clubs/${clubId.value}/announcements/${announcement.id}`, { method: "DELETE" });
		toast.value = "Đã xóa thông báo.";
		await loadAnnouncements();
	} catch (error) {
		errorMessage.value = getMessage(error);
	}
}

function getMessage(error: unknown) {
	if (error && typeof error === "object" && "data" in error) {
		const data = error.data;
		if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") {
			return data.statusMessage;
		}
	}
	return "Không thể tải hoặc cập nhật thông tin. Vui lòng thử lại.";
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

watch(clubId, () => {
	if (import.meta.client) void loadClubPage();
});

onMounted(loadClubPage);
</script>

<template>
	<div v-if="loading && !club" class="card empty-state">Đang tải thông tin câu lạc bộ…</div>
	<div v-else-if="club" class="club-detail">
		<NuxtLink to="/clubs" class="back-link">← Tất cả câu lạc bộ</NuxtLink>
		<section class="club-hero card" :style="{ '--club-color': club.color }">
			<div class="club-hero-icon">{{ club.emoji }}</div>
			<div class="club-hero-info">
				<p class="eyebrow">{{ club.category }}</p>
				<h1>{{ club.name }}</h1>
				<p>{{ club.description }}</p>
				<div class="club-meta">
					<span>♙ {{ club.memberIds.length }} thành viên</span>
					<span>♧ {{ club.meeting }}</span>
					<span>GV phụ trách: {{ club.teacher }}</span>
				</div>
			</div>
			<button v-if="user" class="button join-button" :class="{ secondary: membershipStatus === 'ACTIVE' }" @click="joinOrLeave">
				{{ membershipStatus === "ACTIVE" ? "Đã tham gia · Rời CLB" : membershipStatus === "PENDING" ? "Đang chờ duyệt · Hủy yêu cầu" : "Gửi yêu cầu tham gia" }}
			</button>
			<NuxtLink v-else to="/login" class="button join-button">Đăng nhập để tham gia</NuxtLink>
		</section>

		<p v-if="errorMessage" class="page-error" role="alert">{{ errorMessage }}</p>
		<Transition><p v-if="toast" class="page-toast" role="status">{{ toast }}</p></Transition>

		<div class="club-detail-grid">
			<div class="club-main-column">
				<section class="card detail-section">
					<div class="section-header"><div><h2>Thông báo</h2><p>Cập nhật mới nhất dành cho thành viên CLB.</p></div></div>
					<form v-if="canManage" class="announcement-form" @submit.prevent="postAnnouncement">
						<label class="form-field">Tiêu đề<input v-model.trim="announcementForm.title" maxlength="120" required placeholder="Tiêu đề thông báo" /></label>
						<label class="form-field">Nội dung<textarea v-model.trim="announcementForm.content" maxlength="3000" rows="4" required placeholder="Viết nội dung thông báo cho thành viên..." /></label>
						<button class="button small" :disabled="postingAnnouncement">{{ postingAnnouncement ? "Đang đăng..." : "Đăng thông báo" }}</button>
					</form>
					<div v-if="announcementsRestricted" class="announcement-locked">
						<strong>Thông báo chỉ dành cho thành viên CLB.</strong>
						<p v-if="membershipStatus === 'PENDING'">Yêu cầu tham gia của bạn đang chờ duyệt. Bạn sẽ xem được thông báo sau khi CLB duyệt.</p>
						<p v-else-if="user">Hãy gửi yêu cầu tham gia câu lạc bộ. Sau khi được duyệt, bạn có thể xem các thông báo tại đây.</p>
						<p v-else>Đăng nhập và tham gia câu lạc bộ để xem các thông báo.</p>
					</div>
					<div v-else-if="announcements.length" class="announcement-list">
						<article v-for="announcement in announcements" :key="announcement.id" class="announcement">
							<div class="announcement-heading"><div><h3>{{ announcement.title }}</h3><small>{{ formatDate(announcement.createdAt) }} · {{ announcement.author?.name || announcement.author?.username || "Ban quản lý" }}</small></div><button v-if="canManage" class="button small danger" @click="deleteAnnouncement(announcement)">Xóa</button></div>
							<p>{{ announcement.content }}</p>
						</article>
					</div>
					<div v-else class="empty-state">Chưa có thông báo nào.</div>
				</section>

				<section class="card detail-section">
					<div class="section-header"><div><h2>Hoạt động sắp tới</h2><p>Các sự kiện do câu lạc bộ tổ chức.</p></div></div>
					<div v-if="clubActivities.length" class="activity-list">
						<NuxtLink v-for="activity in clubActivities" :key="activity.id" to="/activities" class="activity-row">
							<span class="activity-date">{{ new Date(`${activity.date}T12:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "short" }) }}</span>
							<span><strong>{{ activity.title }}</strong><small>{{ activity.time }} · {{ activity.location }}</small></span>
							<span class="activity-arrow">→</span>
						</NuxtLink>
					</div>
					<div v-else class="empty-state">Chưa lên lịch hoạt động.</div>
				</section>
			</div>

			<aside v-if="canManage" class="card detail-section members-section">
				<div class="section-header"><div><h2>Thành viên</h2><p>{{ members.filter((member) => member.status === "ACTIVE").length }} thành viên đã duyệt</p></div></div>
				<div v-if="members.length" class="member-list">
					<div v-for="member in members" :key="member.id" class="member-row">
						<span class="avatar">{{ (member.user.name || member.user.username).slice(0, 1).toUpperCase() }}</span>
						<div class="member-info"><strong>{{ member.user.name || member.user.username }}</strong><small>{{ member.user.username }} · {{ member.user.email }}</small><span v-if="member.status === 'PENDING'" class="pending-label">Đang chờ duyệt</span></div>
						<div v-if="member.status === 'PENDING'" class="member-actions"><button class="button small" @click="reviewMember(member, 'approve')">Duyệt</button><button class="button small danger" @click="reviewMember(member, 'reject')">Từ chối</button></div>
						<button v-else class="button small danger" @click="removeMember(member)">Xóa</button>
					</div>
				</div>
				<div v-else class="empty-state">Chưa có học sinh đăng ký tham gia.</div>
			</aside>
			<aside v-else class="card detail-section members-section">
				<div class="section-header"><div><h2>Thông tin tham gia</h2><p>{{ club.memberIds.length }} thành viên đã được duyệt.</p></div></div>
				<p class="member-privacy-note">Danh sách thành viên được hiển thị cho ban quản lý câu lạc bộ.</p>
			</aside>
		</div>
	</div>
	<div v-else class="card empty-state">Không tìm thấy câu lạc bộ.</div>
</template>

<style scoped>
.club-detail { display: grid; gap: 16px; }
.back-link { color: #78837e; font-size: 11px; }
.club-hero { display: flex; align-items: center; gap: 22px; padding: 27px; background: linear-gradient(110deg, var(--club-color), #fff 75%); }
.club-hero-icon { width: 82px; height: 82px; flex: 0 0 82px; display: grid; place-items: center; border: 1px solid #ffffffb8; border-radius: 22px; background: #ffffffa6; font-size: 42px; }
.club-hero-info { flex: 1; min-width: 0; }
.club-hero-info h1 { margin: 0; font-size: clamp(24px, 3vw, 34px); letter-spacing: -1px; }
.club-hero-info > p:not(.eyebrow) { margin: 8px 0 13px; color: #66736c; font-size: 12px; line-height: 1.6; }
.club-meta { display: flex; flex-wrap: wrap; gap: 7px 15px; color: #617168; font-size: 10px; }
.join-button { flex: 0 0 auto; }
.club-detail-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr); align-items: start; gap: 16px; }
.club-main-column { display: grid; gap: 16px; }
.detail-section { padding: 20px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
.section-header h2 { margin: 0; font-size: 16px; }
.section-header p { margin: 5px 0 0; color: #78837e; font-size: 10px; }
.announcement-form { display: grid; gap: 11px; margin-bottom: 17px; padding: 14px; border-radius: 9px; background: #f7f9f7; }
.form-field { display: grid; gap: 6px; color: #52615a; font-size: 10px; font-weight: 650; }
.form-field input, .form-field textarea { width: 100%; padding: 10px; border: 1px solid #e4eae6; border-radius: 7px; background: white; font: inherit; font-weight: 400; resize: vertical; }
.announcement-form > .button { justify-self: start; }
.announcement-locked { padding: 14px; border: 1px solid #f0e2c9; border-radius: 8px; background: #fffaf1; color: #795b2e; font-size: 11px; line-height: 1.6; }
.announcement-locked p { margin: 5px 0 0; }
.announcement-list { display: grid; }
.announcement { padding: 14px 0; border-top: 1px solid #edf0ee; }
.announcement-heading { display: flex; justify-content: space-between; align-items: start; gap: 12px; }
.announcement h3 { margin: 0; font-size: 13px; }
.announcement small, .activity-row small { display: block; margin-top: 5px; color: #87918b; font-size: 9px; }
.announcement > p { margin: 10px 0 0; color: #59665f; font-size: 11px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.activity-list, .member-list { display: grid; }
.activity-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #edf0ee; }
.activity-date { width: 48px; height: 42px; flex: 0 0 48px; display: grid; place-items: center; border-radius: 8px; background: #edf6f1; color: #1d7655; font-size: 10px; font-weight: 700; }
.activity-row > span:nth-child(2) { flex: 1; min-width: 0; }
.activity-row strong { font-size: 11px; }
.activity-arrow { color: #1d7655; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-top: 1px solid #edf0ee; }
.member-info { flex: 1; min-width: 0; }
.member-info strong, .member-info small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.member-info strong { font-size: 10px; }
.member-info small { margin-top: 4px; color: #87918b; font-size: 9px; }
.pending-label { display: inline-block; margin-top: 5px; color: #9c6a22; font-size: 9px; }
.member-actions { display: flex; flex-wrap: wrap; gap: 5px; }
.member-privacy-note { color: #78837e; font-size: 11px; line-height: 1.6; }
.page-error { margin: 0; color: #b94b3a; font-size: 11px; }
.page-toast { position: fixed; right: 24px; bottom: 24px; z-index: 20; padding: 12px 16px; border-radius: 8px; background: #1d7655; color: white; font-size: 11px; }
@media(max-width: 850px) { .club-detail-grid { grid-template-columns: 1fr; } }
@media(max-width: 600px) { .club-hero { align-items: flex-start; flex-wrap: wrap; padding: 20px; } .club-hero-icon { width: 62px; height: 62px; flex-basis: 62px; font-size: 32px; } .club-hero-info { flex-basis: calc(100% - 85px); } .join-button { margin-left: 84px; } .detail-section { padding: 15px; } .member-row { flex-wrap: wrap; } .member-info { flex-basis: calc(100% - 60px); } .member-actions { margin-left: 45px; } }
</style>
