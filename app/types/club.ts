export interface Club {
	id: string;
	name: string;
	category: string;
	emoji: string;
	color: string;
	description: string;
	teacher: string;
	meeting: string;
	memberIds: string[];
	leaderId?: string | null;
	activityCount?: number;
}

export interface ClubActivity {
	id: string;
	clubId: string;
	title: string;
	description: string;
	date: string;
	time: string;
	location: string;
	attendeeIds: string[];
	attendanceIds: string[];
}

export interface ClubData {
	clubs: Club[];
	activities: ClubActivity[];
}
