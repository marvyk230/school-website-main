<script setup lang="ts">
import type { ClubActivity } from "~/types/club";

const props = defineProps<{
	activity: ClubActivity;
}>();
const { currentStudentId, clubById, toggleActivityRegistration } = useClubStore();
const club = computed(() => clubById(props.activity.clubId));
const registered = computed(() => props.activity.attendeeIds.includes(currentStudentId.value));
const dateParts = computed(() => {
	const date = new Date(`${props.activity.date}T12:00:00`);
	return {
		day: date.toLocaleDateString("vi-VN", { day: "2-digit" }),
		month: date.toLocaleDateString("vi-VN", { month: "short" }).replace(".", ""),
	};
});
</script>

<template>
	<article class="card activity-card">
		<div class="activity-date"><strong>{{ dateParts.day }}</strong><small>{{ dateParts.month }}</small></div>
		<div class="activity-copy">
			<h3>{{ activity.title }}</h3>
			<p>{{ club?.emoji }} {{ club?.name ?? "Câu lạc bộ" }} · {{ activity.time }} · {{ activity.location }}</p>
			<span class="pill gray">{{ activity.attendeeIds.length }} người tham gia</span>
		</div>
		<div class="activity-actions">
			<button class="button small" :class="registered ? 'secondary' : ''" @click="toggleActivityRegistration(activity)">
				{{ registered ? "Đã đăng ký" : "Đăng ký" }}
			</button>
		</div>
	</article>
</template>
