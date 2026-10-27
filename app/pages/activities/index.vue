<script setup lang="ts">
const { clubs, activities, sortedActivities, currentStudentId } = useClubStore();
const selectedClub = ref("Tất cả");
const selectedType = ref("Sắp diễn ra");
const clubOptions = computed(() => ["Tất cả", ...clubs.value.map((club) => club.name)]);
const filteredActivities = computed(() => sortedActivities.value.filter((activity) => {
	const club = clubs.value.find((item) => item.id === activity.clubId);
	const upcoming = activity.date >= new Date().toISOString().slice(0, 10);
	return (selectedClub.value === "Tất cả" || club?.name === selectedClub.value)
		&& (selectedType.value === "Tất cả" || (selectedType.value === "Sắp diễn ra" ? upcoming : activity.attendeeIds.includes(currentStudentId.value)));
}));
const registeredCount = computed(() => activities.value.filter((activity) => activity.attendeeIds.includes(currentStudentId.value)).length);
</script>

<template>
	<div>
		<div class="page-heading">
			<div><p class="eyebrow">LỊCH CỦA CỘNG ĐỒNG</p><h1>Hoạt động & sự kiện</h1><p>Tham gia những trải nghiệm mới và tạo nên kỷ niệm cùng các CLB.</p></div>
			<span class="pill">✓ {{ registeredCount }} đã đăng ký</span>
		</div>
		<div class="activity-toolbar">
			<div class="filter-tabs" role="tablist" aria-label="Lọc hoạt động">
				<button v-for="item in ['Sắp diễn ra', 'Đã đăng ký', 'Tất cả']" :key="item" class="filter-tab" :class="{ active: selectedType === item }" @click="selectedType = item">{{ item }}</button>
			</div>
			<select v-model="selectedClub" class="activity-select" aria-label="Lọc theo câu lạc bộ"><option v-for="item in clubOptions" :key="item">{{ item }}</option></select>
		</div>
		<div v-if="filteredActivities.length" class="activity-list">
			<ActivityCard v-for="activity in filteredActivities" :key="activity.id" :activity="activity" />
		</div>
		<div v-else class="card empty-state">Chưa có hoạt động nào trong danh mục này.</div>
		<div class="activity-help"><span>✦</span><div><strong>Tham gia là một cách để bắt đầu.</strong><p>Bạn có thể hủy đăng ký bất kỳ lúc nào trước khi hoạt động diễn ra.</p></div></div>
	</div>
</template>

<style scoped>
.activity-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 20px 0 14px; }
.filter-tabs { display: flex; gap: 4px; padding: 4px; border: 1px solid #e9eeeb; border-radius: 9px; background: white; }
.filter-tab { min-height: 31px; padding: 0 12px; border: 0; border-radius: 6px; background: transparent; color: #7a867f; font-size: 10px; font-weight: 700; }
.filter-tab.active { background: #edf6f1; color: #1d7655; }
.activity-select { min-height: 39px; max-width: 230px; padding: 0 28px 0 11px; border: 1px solid #e4eae6; border-radius: 8px; background: white; color: #52615a; font-size: 11px; }
.activity-help { display: flex; align-items: flex-start; gap: 12px; margin-top: 19px; padding: 15px; border-radius: 10px; background: #f0f6f2; color: #438064; }
.activity-help > span { font-size: 19px; }
.activity-help strong { font-size: 11px; }
.activity-help p { margin: 5px 0 0; color: #75867d; font-size: 10px; }
@media(max-width: 520px) { .activity-toolbar { align-items: stretch; flex-direction: column; } .filter-tabs { justify-content: space-between; } .filter-tab { flex: 1; padding: 0 5px; } .activity-select { max-width: none; } }
</style>
