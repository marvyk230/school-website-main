import type { Club, ClubActivity } from "~/types/club";

const emptyClubs = (): Club[] => [];
const emptyActivities = (): ClubActivity[] => [];

const getErrorMessage = (error: unknown) => {
	if (error && typeof error === "object" && "data" in error) {
		const data = error.data;
		if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") {
			return data.statusMessage;
		}
	}
	return "Không thể hoàn thành thao tác. Vui lòng thử lại.";
};

export const useClubStore = () => {
	const clubs = useState<Club[]>("club-connect-clubs", emptyClubs);
	const activities = useState<ClubActivity[]>("club-connect-activities", emptyActivities);
	const membershipStatuses = useState<Record<string, string>>("club-connect-memberships", () => ({}));
	const loading = useState<boolean>("club-connect-loading", () => false);
	const toast = useState<string>("club-connect-toast", () => "");
	const { useStateUser } = useAuth();
	const user = useStateUser();

	let toastTimer: ReturnType<typeof setTimeout> | undefined;
	const notify = (message: string) => {
		toast.value = message;
		if (import.meta.client) {
			if (toastTimer) clearTimeout(toastTimer);
			toastTimer = setTimeout(() => (toast.value = ""), 2600);
		}
	};

	const run = async <T>(action: () => Promise<T>, successMessage?: string): Promise<T | null> => {
		try {
			const result = await action();
			if (successMessage) notify(successMessage);
			return result;
		} catch (error) {
			notify(getErrorMessage(error));
			return null;
		}
	};

	const loadData = async () => {
		loading.value = true;
		try {
			const [clubData, activityData] = await Promise.all([$fetch<Club[]>("/api/clubs"), $fetch<ClubActivity[]>("/api/activities")]);
			clubs.value = clubData;
			activities.value = activityData;
			if (user.value) {
				const memberships = await useFetchApi<Array<{ clubId: string; status: string }>>("/api/clubs/memberships");
				membershipStatuses.value = Object.fromEntries(memberships.map(({ clubId, status }) => [clubId, status]));
			} else {
				membershipStatuses.value = {};
			}
		} catch (error) {
			notify(getErrorMessage(error));
		} finally {
			loading.value = false;
		}
	};

	const saveClub = async (club: Omit<Club, "id" | "memberIds"> & { id?: string }) => {
		const response = await run(() => club.id
			? useFetchApi<Club>(`/api/clubs/${club.id}`, { method: "PATCH", body: club })
			: useFetchApi<Club>("/api/clubs", { method: "POST", body: club }));
		if (response) {
			notify(club.id ? "Đã cập nhật câu lạc bộ." : "Đã tạo câu lạc bộ mới.");
			await loadData();
		}
	};

	const deleteClub = async (id: string) => {
		const response = await run(() => useFetchApi(`/api/clubs/${id}`, { method: "DELETE" }));
		if (response) {
			notify("Đã xóa câu lạc bộ và các hoạt động liên quan.");
			await loadData();
		}
	};

	const saveActivity = async (activity: Omit<ClubActivity, "id" | "attendeeIds" | "attendanceIds"> & { id?: string }) => {
		const response = await run(() => activity.id
			? useFetchApi<ClubActivity>(`/api/activities/${activity.id}`, { method: "PATCH", body: activity })
			: useFetchApi<ClubActivity>("/api/activities", { method: "POST", body: activity }));
		if (response) {
			notify(activity.id ? "Đã cập nhật hoạt động." : "Đã tạo hoạt động mới.");
			await loadData();
		}
	};

	const deleteActivity = async (id: string) => {
		const response = await run(() => useFetchApi(`/api/activities/${id}`, { method: "DELETE" }));
		if (response) {
			notify("Đã xóa hoạt động.");
			await loadData();
		}
	};

	const toggleMembership = async (club: Club) => {
		if (!user.value) {
			notify("Vui lòng đăng nhập để tham gia câu lạc bộ.");
			await navigateTo("/login");
			return;
		}
		const status = membershipStatuses.value[club.id];
		const response = await run(() => useFetchApi<{ status?: string }>(`/api/clubs/${club.id}/membership`, {
			method: status === "ACTIVE" || status === "PENDING" ? "DELETE" : "POST",
		}));
		if (response) {
			if (status === "ACTIVE") notify(`Đã rời CLB ${club.name}.`);
			else if (status === "PENDING") notify("Đã hủy yêu cầu tham gia.");
			else notify("Đã gửi yêu cầu tham gia. Vui lòng chờ CLB duyệt.");
			await loadData();
		}
	};

	const toggleActivityRegistration = async (activity: ClubActivity) => {
		if (!user.value) {
			notify("Vui lòng đăng nhập để đăng ký hoạt động.");
			await navigateTo("/login");
			return;
		}
		const registered = activity.attendeeIds.includes(user.value.id!);
		const response = await run(() => useFetchApi(`/api/activities/${activity.id}/registration`, {
			method: registered ? "DELETE" : "POST",
		}));
		if (response) {
			notify(registered ? "Đã hủy đăng ký hoạt động." : "Đăng ký hoạt động thành công.");
			await loadData();
		}
	};

	const toggleAttendance = async (activity: ClubActivity, userId: string) => {
		const attended = activity.attendanceIds.includes(userId);
		const response = await run(() => useFetchApi(`/api/activities/${activity.id}/attendance`, {
			method: "PUT",
			body: { userId, attended: !attended },
		}));
		if (response) {
			activity.attendanceIds = attended
				? activity.attendanceIds.filter((id) => id !== userId)
				: [...activity.attendanceIds, userId];
			notify("Đã cập nhật điểm danh.");
		}
	};

	const clubById = (id: string) => clubs.value.find((club) => club.id === id);
	const sortedActivities = computed(() => [...activities.value].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));

	return {
		clubs,
		activities,
		membershipStatuses,
		loading,
		toast,
		user,
		currentStudentId: computed(() => user.value?.id ?? ""),
		sortedActivities,
		clubById,
		loadData,
		saveClub,
		deleteClub,
		saveActivity,
		deleteActivity,
		toggleMembership,
		toggleActivityRegistration,
		toggleAttendance,
	};
};
