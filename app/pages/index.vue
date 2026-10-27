<script setup lang="ts">
const { clubs, activities, sortedActivities, currentStudentId } = useClubStore();
const { useStateUser } = useAuth();
const user = useStateUser();
const myClubs = computed(() => clubs.value.filter((club) => club.memberIds.includes(currentStudentId.value)));
const upcomingActivities = computed(() => sortedActivities.value.filter((activity) => activity.date >= new Date().toISOString().slice(0, 10)).slice(0, 3));
const myActivityCount = computed(() => activities.value.filter((activity) => activity.attendeeIds.includes(currentStudentId.value)).length);
</script>

<template>
	<div>
		<section class="welcome-banner">
			<div class="welcome-copy">
				<p class="eyebrow">THỨC DẬY ĐAM MÊ CỦA BẠN</p>
				<h1>Mỗi sở thích,<br /><span>một cộng đồng.</span></h1>
				<p>Khám phá điều bạn yêu thích, gặp gỡ những người bạn mới và cùng tạo nên những trải nghiệm đáng nhớ.</p>
				<NuxtLink to="/clubs" class="button welcome-button">Khám phá câu lạc bộ <span>→</span></NuxtLink>
			</div>
			<div class="welcome-art" aria-hidden="true">
				<div class="art-sun"></div><div class="art-circle circle-one">🎨</div><div class="art-circle circle-two">🤖</div><div class="art-circle circle-three">🌱</div>
				<div class="art-orbit"></div><div class="art-caption">Cùng nhau<br />tỏa sáng ✦</div>
			</div>
		</section>

		<div class="page-heading dashboard-title">
			<div><p class="eyebrow">KHÔNG GIAN HỌC SINH</p><h1>Chào {{ user?.name || "bạn" }}, hôm nay bạn muốn làm gì?</h1><p>Tham gia hoạt động mới và khám phá cộng đồng quanh bạn.</p></div>
			<NuxtLink class="button secondary" to="/activities">Xem lịch hoạt động <span>→</span></NuxtLink>
		</div>

		<section class="stat-grid" aria-label="Thống kê câu lạc bộ">
			<article class="card stat-card"><div class="stat-top"><span>Câu lạc bộ</span><span class="stat-icon">✳</span></div><div class="stat-value">{{ clubs.length }}</div><div class="stat-foot">Cộng đồng đang hoạt động</div></article>
			<article class="card stat-card"><div class="stat-top"><span>CLB của tôi</span><span class="stat-icon">♙</span></div><div class="stat-value">{{ myClubs.length }}</div><div class="stat-foot">Nơi bạn đang là thành viên</div></article>
			<article class="card stat-card"><div class="stat-top"><span>Hoạt động sắp tới</span><span class="stat-icon">▦</span></div><div class="stat-value">{{ upcomingActivities.length }}</div><div class="stat-foot">Sự kiện đang chờ bạn</div></article>
			<article class="card stat-card"><div class="stat-top"><span>Lịch đã đăng ký</span><span class="stat-icon">✓</span></div><div class="stat-value">{{ myActivityCount }}</div><div class="stat-foot">Hoạt động bạn sẽ tham gia</div></article>
		</section>

		<section class="dashboard-grid">
			<div class="card panel">
				<div class="panel-heading"><div><h2 class="section-title">Câu lạc bộ nổi bật</h2><p class="section-subtitle">Tìm cộng đồng phù hợp với bạn</p></div><NuxtLink to="/clubs" class="text-link">Tất cả CLB →</NuxtLink></div>
				<div class="club-grid dashboard-clubs"><ClubCard v-for="club in clubs.slice(0, 3)" :key="club.id" :club="club" /></div>
			</div>
			<div class="card panel">
				<div class="panel-heading"><div><h2 class="section-title">Sắp diễn ra</h2><p class="section-subtitle">Đừng bỏ lỡ hoạt động thú vị</p></div><NuxtLink to="/activities" class="text-link">Xem lịch →</NuxtLink></div>
				<div v-if="upcomingActivities.length" class="event-list">
					<NuxtLink v-for="activity in upcomingActivities" :key="activity.id" to="/activities" class="event-row">
						<div class="date-tile"><strong>{{ new Date(`${activity.date}T12:00:00`).toLocaleDateString("vi-VN", { day: "2-digit" }) }}</strong><small>{{ new Date(`${activity.date}T12:00:00`).toLocaleDateString("vi-VN", { month: "short" }).replace(".", "") }}</small></div>
						<div class="event-details"><strong>{{ activity.title }}</strong><span>{{ activity.time }} · {{ activity.location }}</span></div>
					</NuxtLink>
				</div>
				<div v-else class="empty-state">Chưa có hoạt động nào sắp diễn ra.</div>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
.welcome-banner { min-height: 238px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: space-between; padding: 28px 40px; border-radius: 16px; background: #eaf4ee; }
.welcome-copy { position: relative; z-index: 1; max-width: 470px; }
.welcome-copy h1 { margin: 0; color: #183c2d; font-size: clamp(29px, 3.4vw, 43px); letter-spacing: -1.7px; line-height: 1.08; }
.welcome-copy h1 span { color: #43856a; }
.welcome-copy > p:not(.eyebrow) { max-width: 405px; margin: 11px 0 17px; color: #66796e; font-size: 12px; line-height: 1.65; }
.welcome-button { background: #1d7655; }
.welcome-art { width: 310px; height: 205px; position: absolute; right: 7%; top: 16px; }
.art-sun { position: absolute; width: 136px; height: 136px; top: 25px; left: 87px; border-radius: 50%; background: #d3e8d9; }
.art-orbit { position: absolute; inset: 14px 40px 8px; border: 1px dashed #9bc2a9; border-radius: 50%; transform: rotate(-20deg); }
.art-circle { position: absolute; z-index: 1; display: grid; place-items: center; width: 54px; height: 54px; border: 4px solid #fff; border-radius: 17px; box-shadow: 0 5px 15px #35594518; font-size: 26px; }
.circle-one { top: 9px; left: 49px; background: #fff1df; transform: rotate(-10deg); }
.circle-two { top: 36px; right: 31px; background: #fff; transform: rotate(9deg); }
.circle-three { bottom: 13px; left: 70px; background: #f1f8e9; transform: rotate(8deg); }
.art-caption { position: absolute; right: 22px; bottom: 27px; color: #4c8066; font-size: 12px; font-weight: 800; line-height: 1.5; transform: rotate(-5deg); }
.dashboard-title { margin: 31px 0 20px; align-items: center; }
.dashboard-title h1 { font-size: 23px; letter-spacing: -.7px; }
.dashboard-title > div > p:not(.eyebrow) { margin-top: 6px; }
.dashboard-clubs { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
.dashboard-clubs .club-cover { min-height: 78px; }
.dashboard-clubs .club-emoji { font-size: 27px; }
.dashboard-clubs .club-info { padding: 11px; }
.dashboard-clubs .club-info p { min-height: 49px; font-size: 9px; }
.dashboard-clubs .club-actions { margin-top: 10px; }
.dashboard-clubs .pill { font-size: 8px; }
@media (max-width: 1100px) { .welcome-art { right: 0; opacity: .8; } .dashboard-clubs { grid-template-columns: 1fr; } .dashboard-clubs .club-card { display: grid; grid-template-columns: 85px 1fr; } .dashboard-clubs .club-cover { min-height: 100%; align-items: center; flex-direction: column; justify-content: center; gap: 8px; } .dashboard-clubs .club-info p { min-height: 0; } }
@media (max-width: 760px) { .welcome-banner { min-height: 230px; padding: 25px 22px; } .welcome-art { right: -120px; opacity: .35; } .welcome-copy { max-width: 100%; } .dashboard-title { align-items: flex-start; } .dashboard-title > .button { display: none; } }
</style>
