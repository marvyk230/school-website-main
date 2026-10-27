<script setup lang="ts">
const { clubs, currentStudentId } = useClubStore();
const search = ref("");
const category = ref("Tất cả");
const categories = computed(() => ["Tất cả", ...new Set(clubs.value.map((club) => club.category))]);
const filteredClubs = computed(() => clubs.value.filter((club) => {
	const matchesSearch = `${club.name} ${club.description} ${club.teacher}`.toLocaleLowerCase("vi").includes(search.value.toLocaleLowerCase("vi"));
	return matchesSearch && (category.value === "Tất cả" || club.category === category.value);
}));
const myClubsCount = computed(() => clubs.value.filter((club) => club.memberIds.includes(currentStudentId.value)).length);
</script>

<template>
	<div>
		<div class="page-heading">
			<div><p class="eyebrow">TÌM ĐỒNG ĐỘI CỦA BẠN</p><h1>Câu lạc bộ</h1><p>Khám phá sở thích mới, kết nối với bạn bè và cùng nhau tạo nên điều tuyệt vời.</p></div>
			<span class="pill">♙ {{ myClubsCount }} CLB của tôi</span>
		</div>
		<div class="club-toolbar">
			<div class="search-wrap"><span class="search-symbol">⌕</span><input v-model="search" class="search-input" placeholder="Tìm câu lạc bộ..." aria-label="Tìm câu lạc bộ" /></div>
			<select v-model="category" class="category-select" aria-label="Lọc theo lĩnh vực"><option v-for="item in categories" :key="item">{{ item }}</option></select>
			<span class="result-count">{{ filteredClubs.length }} câu lạc bộ</span>
		</div>
		<div v-if="filteredClubs.length" class="club-grid all-clubs"><ClubCard v-for="club in filteredClubs" :key="club.id" :club="club" show-join /></div>
		<div v-else class="card empty-state">Không tìm thấy câu lạc bộ phù hợp.</div>
		<div class="join-note"><span>💡</span><p><strong>Mỗi hành trình bắt đầu từ một lời chào.</strong><br />Bạn có thể tham gia nhiều CLB và đăng ký hoạt động yêu thích ngay tại đây.</p></div>
	</div>
</template>

<style scoped>
.club-toolbar { display: flex; align-items: center; gap: 10px; margin: 23px 0 18px; }
.category-select { min-height: 40px; padding: 0 30px 0 12px; border: 1px solid #e4eae6; border-radius: 8px; background: white; color: #52615a; font-size: 11px; }
.result-count { margin-left: auto; color: #849089; font-size: 11px; }
.all-clubs { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
.all-clubs .club-info p { min-height: 50px; }
.join-note { display: flex; align-items: center; gap: 13px; margin-top: 21px; padding: 15px 18px; border-radius: 11px; background: #f0f6f2; color: #587264; font-size: 11px; line-height: 1.65; }
.join-note > span { font-size: 22px; }
.join-note p { margin: 0; }
.join-note strong { color: #2a5a43; }
@media(max-width: 950px) { .all-clubs { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media(max-width: 520px) { .all-clubs { grid-template-columns: 1fr; } .club-toolbar { flex-wrap: wrap; } .club-toolbar .search-wrap { flex: 1 1 100%; } }
</style>
