<script setup lang="ts">
import type { Club } from "~/types/club";

const props = defineProps<{
	club: Club;
	showJoin?: boolean;
}>();
const { currentStudentId, membershipStatuses, toggleMembership } = useClubStore();
const status = computed(() => membershipStatuses.value[props.club.id] ?? (props.club.memberIds.includes(currentStudentId.value) ? "ACTIVE" : ""));
const joined = computed(() => status.value === "ACTIVE");
const membershipLabel = computed(() => status.value === "ACTIVE" ? "Đã tham gia" : status.value === "PENDING" ? "Đang chờ duyệt · Hủy" : status.value === "REJECTED" ? "Gửi lại yêu cầu" : "Tham gia +");
</script>

<template>
	<article class="card club-card">
		<div class="club-cover" :style="{ '--club-color': club.color }">
			<span class="club-emoji">{{ club.emoji }}</span>
			<span class="category-tag">{{ club.category }}</span>
		</div>
		<div class="club-info">
			<h3>{{ club.name }}</h3>
			<p>{{ club.description }}</p>
			<div class="club-meta"><span>♙</span> {{ club.memberIds.length }} thành viên <span>·</span> {{ club.meeting }}</div>
			<div class="club-actions">
				<span class="pill gray">GV: {{ club.teacher }}</span>
				<button v-if="showJoin" class="button small" :class="joined ? 'secondary' : ''" @click="toggleMembership(club)">
					{{ membershipLabel }}
				</button>
				<NuxtLink class="text-link" :to="`/clubs/${club.id}`">Chi tiết <span aria-hidden="true">→</span></NuxtLink>
			</div>
		</div>
	</article>
</template>
