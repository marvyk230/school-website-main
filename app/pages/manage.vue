<script setup lang="ts">
import type { Club, ClubActivity } from "~/types/club";

const {
	clubs,
	activities,
	loading,
	sortedActivities,
	currentStudentId,
	clubById,
	loadData,
	saveClub,
	deleteClub,
	saveActivity,
	deleteActivity,
	toggleAttendance,
	toast,
	user,
} = useClubStore();

const auth = useAuth();
const section = ref<"clubs" | "activities" | "attendance" | "memberships" | "accounts">("activities");
const authorized = ref(false);
const modal = ref<"club" | "activity" | null>(null);
const editingId = ref<string | null>(null);
const clubForm = ref({ name: "", category: "Nghệ thuật", emoji: "✨", color: "#eaf3ec", description: "", teacher: "", meeting: "" });
const activityForm = ref({ clubId: "", title: "", description: "", date: "", time: "15:30", location: "" });
const selectedActivityId = ref("");
const attendanceMembers = ref<Array<{ id: string; name: string; username: string; registered: boolean; attended: boolean }>>([]);
const membershipRequests = ref<Array<{
	id: string;
	createdAt: string;
	user: { id: string; name: string | null; username: string; email: string };
	club: { id: string; name: string; emoji: string };
}>>([]);
const accounts = ref<Array<{
	id: string;
	username: string;
	email: string;
	name: string | null;
	role: "ADMIN" | "STAFF" | "CLUB_LEADER" | "STUDENT";
	mustChangePassword: boolean;
	_count: { leadingClubs: number };
}>>([]);
const temporaryPassword = ref<{ username: string; value: string } | null>(null);
const leaderCandidates = computed(() => accounts.value.filter((account) => account.role === "CLUB_LEADER" || account.role === "ADMIN"));

const selectedActivity = computed(() => activities.value.find((item) => item.id === selectedActivityId.value));

async function loadAttendance(activityId: string) {
	if (!activityId) {
		attendanceMembers.value = [];
		return;
	}
	try {
		const result = await useFetchApi<{ members: typeof attendanceMembers.value }>(`/api/activities/${activityId}/attendance`);
		attendanceMembers.value = result.members;
	} catch (error) {
		attendanceMembers.value = [];
		const statusCode =
			error && typeof error === "object" && "statusCode" in error
				? error.statusCode
				: undefined;
		if (statusCode !== 401 && statusCode !== 403) {
			notifyAttendanceError();
		}
	}
}

function notifyAttendanceError() {
	toast.value = "Không tải được danh sách điểm danh. Vui lòng thử lại.";
}

async function updateAttendance(activity: ClubActivity, memberId: string) {
	await toggleAttendance(activity, memberId);
	await loadAttendance(activity.id);
}

async function loadMembershipRequests() {
	try {
		membershipRequests.value = await useFetchApi<typeof membershipRequests.value>("/api/memberships");
	} catch {
		toast.value = "Không tải được yêu cầu tham gia. Vui lòng thử lại.";
	}
}

async function reviewMembership(id: string, decision: "approve" | "reject") {
	try {
		await useFetchApi(`/api/memberships/${id}`, { method: "PATCH", body: { decision } });
		toast.value = decision === "approve" ? "Đã duyệt thành viên." : "Đã từ chối yêu cầu tham gia.";
		await Promise.all([loadMembershipRequests(), loadData()]);
	} catch (error) {
		toast.value = error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "statusMessage" in error.data && typeof error.data.statusMessage === "string"
			? error.data.statusMessage
			: "Không thể xử lý yêu cầu. Vui lòng thử lại.";
	}
}

async function loadAccounts() {
	try {
		accounts.value = await useFetchApi<typeof accounts.value>("/api/admin/users");
	} catch {
		toast.value = "Không tải được danh sách tài khoản.";
	}
}

async function updateAccountRole(account: (typeof accounts.value)[number], event: Event) {
	const role = (event.target as HTMLSelectElement).value;
	if (!["ADMIN", "STAFF", "CLUB_LEADER", "STUDENT"].includes(role)) return;
	try {
		const updated = await useFetchApi<(typeof accounts.value)[number]>(`/api/admin/users/${account.id}`, {
			method: "PATCH",
			body: { role },
		});
		Object.assign(account, updated);
		toast.value = "Đã cập nhật vai trò tài khoản.";
	} catch (error) {
		await loadAccounts();
		toast.value = error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "statusMessage" in error.data && typeof error.data.statusMessage === "string"
			? error.data.statusMessage
			: "Không thể cập nhật vai trò. Vui lòng thử lại.";
	}
}

async function resetAccountPassword(account: (typeof accounts.value)[number]) {
	if (!window.confirm(`Tạo mật khẩu tạm thời mới cho tài khoản "${account.username}"? Mật khẩu hiện tại sẽ không còn dùng được.`)) return;
	try {
		const result = await useFetchApi<{ temporaryPassword: string }>(`/api/admin/users/${account.id}/reset-password`, {
			method: "POST",
		});
		temporaryPassword.value = { username: account.username, value: result.temporaryPassword };
		account.mustChangePassword = true;
		toast.value = "Đã tạo mật khẩu tạm thời. Hãy gửi riêng cho người dùng.";
	} catch (error) {
		toast.value = error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "statusMessage" in error.data && typeof error.data.statusMessage === "string"
			? error.data.statusMessage
			: "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
	}
}

async function copyTemporaryPassword() {
	if (!temporaryPassword.value) return;
	try {
		await navigator.clipboard.writeText(temporaryPassword.value.value);
		toast.value = "Đã sao chép mật khẩu tạm thời.";
	} catch {
		toast.value = "Không sao chép được. Hãy chọn và sao chép mật khẩu hiển thị.";
	}
}

async function assignClubLeader(club: Club) {
	try {
		await useFetchApi(`/api/admin/clubs/${club.id}/leader`, {
			method: "PATCH",
			body: { leaderId: club.leaderId ?? null },
		});
		toast.value = "Đã cập nhật chủ nhiệm câu lạc bộ.";
		await loadData();
	} catch (error) {
		toast.value = error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "statusMessage" in error.data && typeof error.data.statusMessage === "string"
			? error.data.statusMessage
			: "Không thể phân công chủ nhiệm. Vui lòng thử lại.";
		await loadData();
	}
}

onMounted(async () => {
	const signedIn = await auth.initAuth();
	if (!signedIn) {
		await navigateTo({ path: "/login", query: { redirect: "/manage" } });
		return;
	}
	if (!["ADMIN", "STAFF", "CLUB_LEADER"].includes(user.value?.role ?? "")) {
		await navigateTo("/");
		return;
	}
	authorized.value = true;
	await Promise.all([
		loadData(),
		loadMembershipRequests(),
		...(user.value?.role === "ADMIN" ? [loadAccounts()] : []),
	]);
	if (!selectedActivityId.value && activities.value.length) {
		selectedActivityId.value = sortedActivities.value[0].id;
	}
});

function openClub(club?: Club) {
	editingId.value = club?.id ?? null;
	clubForm.value = club
		? { name: club.name, category: club.category, emoji: club.emoji, color: club.color, description: club.description, teacher: club.teacher, meeting: club.meeting }
		: { name: "", category: "Nghệ thuật", emoji: "✨", color: "#eaf3ec", description: "", teacher: "", meeting: "" };
	modal.value = "club";
}

function startCreateClub() {
	section.value = "clubs";
	openClub();
}

function submitClub() {
	saveClub({ ...clubForm.value, ...(editingId.value ? { id: editingId.value } : {}) });
	modal.value = null;
}

function openActivity(activity?: ClubActivity) {
	editingId.value = activity?.id ?? null;
	activityForm.value = activity
		? { clubId: activity.clubId, title: activity.title, description: activity.description, date: activity.date, time: activity.time, location: activity.location }
		: { clubId: clubs.value[0]?.id ?? "", title: "", description: "", date: "", time: "15:30", location: "" };
	modal.value = "activity";
}

function submitActivity() {
	saveActivity({ ...activityForm.value, ...(editingId.value ? { id: editingId.value } : {}) });
	modal.value = null;
}

function confirmDeleteClub(club: Club) {
	if (window.confirm(`Xóa "${club.name}" và các hoạt động liên quan?`)) deleteClub(club.id);
}

function confirmDeleteActivity(activity: ClubActivity) {
	if (window.confirm(`Xóa hoạt động "${activity.title}"?`)) deleteActivity(activity.id);
}

watch(activities, (items) => {
	if (!items.some((item) => item.id === selectedActivityId.value)) selectedActivityId.value = items[0]?.id ?? "";
}, { immediate: true });

watch(selectedActivityId, (id) => {
	if (import.meta.client && user.value) void loadAttendance(id);
});
</script>

<template>
	<div v-if="authorized">
		<div class="page-heading">
			<div><p class="eyebrow">KHÔNG GIAN BAN ĐIỀU HÀNH</p><h1>Quản lý câu lạc bộ</h1><p>Tổ chức hoạt động, quản lý thành viên và theo dõi sự tham gia.</p></div>
			<div class="heading-actions">
				<button v-if="user?.role === 'ADMIN'" class="button" @click="startCreateClub">＋ Thêm câu lạc bộ</button>
				<span class="pill">● {{ user?.role === "ADMIN" ? "Quản trị viên" : user?.role === "STAFF" ? "Cán bộ phụ trách" : "Chủ nhiệm CLB" }}</span>
			</div>
		</div>

		<div class="manage-stats">
			<div class="card manage-stat"><span>CLB đang hoạt động</span><strong>{{ clubs.length }}</strong></div>
			<div class="card manage-stat"><span>Tổng thành viên CLB</span><strong>{{ clubs.reduce((sum, club) => sum + club.memberIds.length, 0) }}</strong></div>
			<div class="card manage-stat"><span>Hoạt động đã lên lịch</span><strong>{{ activities.length }}</strong></div>
			<div class="card manage-stat"><span>Lượt đăng ký hoạt động</span><strong>{{ activities.reduce((sum, activity) => sum + activity.attendeeIds.length, 0) }}</strong></div>
		</div>

		<div class="manage-tabs">
			<button :class="{ active: section === 'activities' }" @click="section = 'activities'">▦ Hoạt động</button>
			<button :class="{ active: section === 'clubs' }" @click="section = 'clubs'">✳ Câu lạc bộ</button>
			<button :class="{ active: section === 'attendance' }" @click="section = 'attendance'">✓ Điểm danh</button>
			<button :class="{ active: section === 'memberships' }" @click="section = 'memberships'">♙ Duyệt thành viên <span v-if="membershipRequests.length">({{ membershipRequests.length }})</span></button>
			<button v-if="user?.role === 'ADMIN'" :class="{ active: section === 'accounts' }" @click="section = 'accounts'">⚙ Phân quyền</button>
		</div>

		<section v-if="section === 'activities'" class="card manage-section">
			<div class="panel-heading"><div><h2 class="section-title">Danh sách hoạt động</h2><p class="section-subtitle">Tạo lịch, cập nhật thông tin hoặc quản lý người tham gia.</p></div><button class="button small" @click="openActivity()">＋ Tạo hoạt động</button></div>
			<div v-if="!loading && sortedActivities.length">
				<div v-for="activity in sortedActivities" :key="activity.id" class="manage-row">
					<div class="row-emoji">{{ clubById(activity.clubId)?.emoji ?? "📌" }}</div>
					<div class="manage-row-main"><strong>{{ activity.title }}</strong><small>{{ clubById(activity.clubId)?.name ?? "CLB đã xóa" }} · {{ new Date(`${activity.date}T12:00:00`).toLocaleDateString("vi-VN") }} · {{ activity.time }} · {{ activity.location }}</small></div>
					<span class="pill gray">{{ activity.attendeeIds.length }} đăng ký</span>
					<button class="button small outline" @click="openActivity(activity)">Sửa</button>
					<button class="button small danger" aria-label="Xóa hoạt động" @click="confirmDeleteActivity(activity)">×</button>
				</div>
			</div>
			<div v-else-if="!loading" class="empty-state">Chưa có hoạt động. Tạo hoạt động đầu tiên để bắt đầu.</div>
		</section>

		<section v-else-if="section === 'clubs'" class="card manage-section">
			<div class="panel-heading"><div><h2 class="section-title">Câu lạc bộ</h2><p class="section-subtitle">Thông tin, lịch sinh hoạt và thành viên của các CLB.</p></div><button class="button small" @click="openClub()">＋ Tạo câu lạc bộ</button></div>
			<div v-if="clubs.length">
				<div v-for="club in clubs" :key="club.id" class="manage-row">
					<div class="row-emoji" :style="{ background: club.color }">{{ club.emoji }}</div>
					<div class="manage-row-main"><strong>{{ club.name }}</strong><small>{{ club.category }} · {{ club.memberIds.length }} thành viên · {{ club.meeting }} · {{ club.teacher }}</small></div>
					<label v-if="user?.role === 'ADMIN'" class="leader-select"><span>Chủ nhiệm</span><select v-model="club.leaderId" @change="assignClubLeader(club)"><option :value="null">Chưa phân công</option><option v-for="candidate in leaderCandidates" :key="candidate.id" :value="candidate.id">{{ candidate.name || candidate.username }}</option></select></label>
					<button class="button small outline" @click="openClub(club)">Sửa</button>
					<button class="button small danger" aria-label="Xóa câu lạc bộ" @click="confirmDeleteClub(club)">×</button>
				</div>
			</div>
			<div v-else-if="!loading" class="empty-state">Chưa có câu lạc bộ. Tạo CLB đầu tiên để bắt đầu.</div>
		</section>

		<section v-else-if="section === 'attendance'" class="card manage-section">
			<div class="panel-heading"><div><h2 class="section-title">Điểm danh hoạt động</h2><p class="section-subtitle">Theo dõi danh sách đăng ký và xác nhận thành viên có mặt.</p></div></div>
			<div v-if="activities.length" class="attendance-controls">
				<label class="form-field"><span>Chọn hoạt động</span><select v-model="selectedActivityId"><option v-for="activity in sortedActivities" :key="activity.id" :value="activity.id">{{ activity.title }}</option></select></label>
				<div v-if="selectedActivity" class="attendance-summary"><span>{{ selectedActivity.attendeeIds.length }} đăng ký</span><strong>{{ selectedActivity.attendanceIds.length }} có mặt</strong></div>
				<div v-if="attendanceMembers.length">
					<div v-for="member in attendanceMembers" :key="member.id" class="manage-row">
						<span class="avatar attendance-avatar">{{ (member.name || member.username).slice(0, 1) }}</span>
						<div class="manage-row-main"><strong>{{ member.name || member.username }}</strong><small>{{ member.username }}<span v-if="!member.registered"> · Chưa đăng ký</span></small></div>
						<button class="button small" :disabled="!member.registered" :class="member.attended ? 'secondary' : 'outline'" @click="selectedActivity && updateAttendance(selectedActivity, member.id)">{{ member.attended ? "✓ Có mặt" : member.registered ? "Đánh dấu có mặt" : "Chưa đăng ký" }}</button>
					</div>
				</div>
				<div v-else class="empty-state">Chưa có thành viên đăng ký hoạt động này.</div>
			</div>
			<div v-else-if="!loading" class="empty-state">Tạo hoạt động trước để mở danh sách điểm danh.</div>
		</section>

		<section v-else-if="section === 'memberships'" class="card manage-section">
			<div class="panel-heading"><div><h2 class="section-title">Yêu cầu tham gia câu lạc bộ</h2><p class="section-subtitle">Xem thông tin học sinh và duyệt hoặc từ chối yêu cầu.</p></div><button class="button small outline" @click="loadMembershipRequests">Làm mới</button></div>
			<div v-if="membershipRequests.length">
				<div v-for="request in membershipRequests" :key="request.id" class="manage-row">
					<span class="avatar attendance-avatar">{{ (request.user.name || request.user.username).slice(0, 1).toUpperCase() }}</span>
					<div class="manage-row-main"><strong>{{ request.user.name || request.user.username }}</strong><small>{{ request.user.username }} · {{ request.user.email }}</small></div>
					<span class="pill gray">{{ request.club.emoji }} {{ request.club.name }}</span>
					<button class="button small" @click="reviewMembership(request.id, 'approve')">Duyệt</button>
					<button class="button small danger" @click="reviewMembership(request.id, 'reject')">Từ chối</button>
				</div>
			</div>
			<div v-else class="empty-state">Không có yêu cầu đang chờ duyệt.</div>
		</section>

		<section v-else-if="section === 'accounts' && user?.role === 'ADMIN'" class="card manage-section">
			<div class="panel-heading"><div><h2 class="section-title">Tài khoản và phân quyền</h2><p class="section-subtitle">Cấp vai trò nhân viên hoặc chủ nhiệm trước khi phân công vào CLB.</p></div><button class="button small outline" @click="loadAccounts">Làm mới</button></div>
			<div v-if="accounts.length">
				<div v-for="account in accounts" :key="account.id" class="manage-row">
					<span class="avatar attendance-avatar">{{ (account.name || account.username).slice(0, 1).toUpperCase() }}</span>
					<div class="manage-row-main"><strong>{{ account.name || account.username }}</strong><small>{{ account.username }} · {{ account.email }}<span v-if="account._count.leadingClubs"> · Chủ nhiệm {{ account._count.leadingClubs }} CLB</span></small></div>
					<span v-if="account.mustChangePassword" class="pill reset-status">Cần đổi mật khẩu</span>
					<select :value="account.role" class="role-select" aria-label="Vai trò tài khoản" @change="updateAccountRole(account, $event)">
						<option value="STUDENT">Học sinh</option>
						<option value="STAFF">Cán bộ phụ trách</option>
						<option value="CLUB_LEADER">Chủ nhiệm CLB</option>
						<option value="ADMIN">Quản trị viên</option>
					</select>
					<button class="button small outline" @click="resetAccountPassword(account)">Đặt lại mật khẩu</button>
				</div>
			</div>
			<div v-else class="empty-state">Chưa có tài khoản để hiển thị.</div>
		</section>

		<p class="demo-disclaimer">Thao tác được lưu vào cơ sở dữ liệu của hệ thống và hiển thị với các tài khoản khác.</p>

		<div v-if="modal" class="modal-backdrop" @click.self="modal = null">
			<div class="modal" role="dialog" aria-modal="true">
				<div class="modal-header"><div><p class="eyebrow">{{ editingId ? "CẬP NHẬT THÔNG TIN" : "THÊM MỚI" }}</p><h2>{{ modal === "club" ? (editingId ? "Chỉnh sửa câu lạc bộ" : "Tạo câu lạc bộ") : (editingId ? "Chỉnh sửa hoạt động" : "Tạo hoạt động") }}</h2></div><button class="modal-close" aria-label="Đóng" @click="modal = null">×</button></div>

				<form v-if="modal === 'club'" @submit.prevent="submitClub">
					<div class="form-grid">
						<label class="form-field full">Tên câu lạc bộ<input v-model.trim="clubForm.name" required maxlength="80" placeholder="Ví dụ: CLB Nhiếp ảnh" /></label>
						<label class="form-field">Lĩnh vực<select v-model="clubForm.category"><option>Nghệ thuật</option><option>Học thuật</option><option>Khoa học</option><option>Thể thao</option><option>Tình nguyện</option><option>Kỹ năng</option><option>Khác</option></select></label>
						<label class="form-field">Biểu tượng emoji<input v-model.trim="clubForm.emoji" required maxlength="8" /></label>
						<label class="form-field full">Mô tả<textarea v-model.trim="clubForm.description" required maxlength="240" placeholder="Giới thiệu ngắn về câu lạc bộ" /></label>
						<label class="form-field">Giáo viên phụ trách<input v-model.trim="clubForm.teacher" required maxlength="80" /></label>
						<label class="form-field">Lịch sinh hoạt<input v-model.trim="clubForm.meeting" required maxlength="60" placeholder="Thứ 4 · 15:30" /></label>
						<label class="form-field">Màu nhận diện<input v-model="clubForm.color" type="color" /></label>
					</div>
					<div class="modal-actions"><button type="button" class="button outline" @click="modal = null">Hủy</button><button type="submit" class="button">{{ editingId ? "Lưu thay đổi" : "Tạo câu lạc bộ" }}</button></div>
				</form>

				<form v-else @submit.prevent="submitActivity">
					<div class="form-grid">
						<label class="form-field full">Câu lạc bộ tổ chức<select v-model="activityForm.clubId" required><option disabled value="">Chọn câu lạc bộ</option><option v-for="club in clubs" :key="club.id" :value="club.id">{{ club.emoji }} {{ club.name }}</option></select></label>
						<label class="form-field full">Tên hoạt động<input v-model.trim="activityForm.title" required maxlength="100" placeholder="Ví dụ: Ngày hội câu lạc bộ" /></label>
						<label class="form-field">Ngày tổ chức<input v-model="activityForm.date" type="date" required /></label>
						<label class="form-field">Giờ bắt đầu<input v-model="activityForm.time" type="time" required /></label>
						<label class="form-field full">Địa điểm<input v-model.trim="activityForm.location" required maxlength="100" placeholder="Phòng đa năng, sân trường..." /></label>
						<label class="form-field full">Mô tả<textarea v-model.trim="activityForm.description" required maxlength="300" placeholder="Nội dung và thông tin cần chuẩn bị" /></label>
					</div>
					<div class="modal-actions"><button type="button" class="button outline" @click="modal = null">Hủy</button><button type="submit" class="button">{{ editingId ? "Lưu thay đổi" : "Tạo hoạt động" }}</button></div>
				</form>
			</div>
		</div>

		<div v-if="temporaryPassword" class="modal-backdrop" @click.self="temporaryPassword = null">
			<section class="modal temporary-password-modal" role="dialog" aria-modal="true" aria-labelledby="temporary-password-title">
				<div class="modal-header">
					<div><p class="eyebrow">MẬT KHẨU CHỈ HIỆN LẦN NÀY</p><h2 id="temporary-password-title">Đặt lại mật khẩu thành công</h2></div>
					<button class="modal-close" aria-label="Đóng" @click="temporaryPassword = null">×</button>
				</div>
				<p>Tài khoản: <strong>{{ temporaryPassword.username }}</strong></p>
				<code class="temporary-password-value">{{ temporaryPassword.value }}</code>
				<p class="temporary-password-warning">Hãy gửi mật khẩu này riêng cho người dùng. Mật khẩu không được lưu dưới dạng có thể xem lại; người dùng sẽ phải đổi ngay sau khi đăng nhập.</p>
				<div class="modal-actions">
					<button class="button outline" @click="copyTemporaryPassword">Sao chép</button>
					<button class="button" @click="temporaryPassword = null">Đã lưu an toàn</button>
				</div>
			</section>
		</div>
	</div>

	<div v-else class="card empty-state">Đang kiểm tra quyền truy cập…</div>
</template>

<style scoped>
.manage-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.heading-actions { display: flex; align-items: center; gap: 10px; }
.manage-stat { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 17px; color: #78837e; font-size: 10px; }
.manage-stat strong { color: #1d7655; font-size: 24px; }
.manage-tabs { display: flex; gap: 5px; margin: 20px 0 12px; padding: 4px; width: fit-content; border: 1px solid #e9eeeb; border-radius: 9px; background: white; }
.manage-tabs button { min-height: 34px; padding: 0 13px; border: 0; border-radius: 6px; background: transparent; color: #7a867f; font-size: 10px; font-weight: 700; }
.manage-tabs button.active { background: #edf6f1; color: #1d7655; }
.manage-section { padding: 20px; }
.attendance-controls > .form-field { max-width: 430px; margin: 3px 0 13px; }
.attendance-summary { display: flex; gap: 8px; margin: 10px 0; color: #75827a; font-size: 11px; }
.attendance-summary strong { color: #1d7655; }
.attendance-avatar { flex: 0 0 35px; font-size: 12px; }
.leader-select { display: grid; gap: 4px; min-width: 150px; color: #78837e; font-size: 9px; }
.leader-select select, .role-select { min-height: 34px; padding: 0 8px; border: 1px solid #e4eae6; border-radius: 6px; background: white; color: #52615a; font-size: 10px; }
.role-select { min-width: 145px; }
.reset-status { color: #805826; background: #fff5e8; }
.temporary-password-modal > p { color: #78837e; font-size: 11px; line-height: 1.6; }
.temporary-password-value { display: block; padding: 14px; border: 1px solid #e4eae6; border-radius: 8px; background: #f7f9f7; color: #1d7655; font-size: 18px; font-weight: 750; letter-spacing: 1px; user-select: all; }
.temporary-password-warning { margin-bottom: 0; }
.demo-disclaimer { margin: 14px 0; color: #929d96; font-size: 10px; line-height: 1.6; }
@media(max-width: 900px) { .manage-stats { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media(max-width: 520px) { .heading-actions { align-items: flex-end; flex-direction: column-reverse; } .manage-tabs { width: 100%; justify-content: space-between; flex-wrap: wrap; } .manage-tabs button { flex: 1 1 38%; padding: 0 5px; } .manage-section { padding: 14px; } .manage-row { flex-wrap: wrap; } .manage-row-main { flex-basis: calc(100% - 60px); } .manage-row > .pill { margin-left: 50px; } .leader-select, .role-select { margin-left: 48px; } }
</style>
