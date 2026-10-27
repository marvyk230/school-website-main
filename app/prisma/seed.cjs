const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const password = () => crypto.randomBytes(18).toString("base64url");
const plusDays = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

const clubs = [
	{ id: "club-art", name: "Mỹ thuật & Sáng tạo", category: "Nghệ thuật", emoji: "🎨", color: "#f8e9dc", description: "Không gian để vẽ, sáng tạo và kể những câu chuyện bằng màu sắc.", teacher: "Cô Nguyễn Thu Hà", meeting: "Thứ 4 · 15:30" },
	{ id: "club-stem", name: "STEM & Robotics", category: "Khoa học", emoji: "🤖", color: "#e5ebf8", description: "Cùng khám phá khoa học, lập trình và chế tạo robot.", teacher: "Thầy Trần Minh Đức", meeting: "Thứ 6 · 15:30" },
	{ id: "club-books", name: "Đọc sách Mở", category: "Học thuật", emoji: "📚", color: "#f5edda", description: "Đọc một cuốn sách hay, chia sẻ một góc nhìn mới.", teacher: "Cô Lê Ngọc Mai", meeting: "Thứ 3 · 16:00" },
	{ id: "club-sport", name: "Cầu lông Năng động", category: "Thể thao", emoji: "🏸", color: "#e2f1e8", description: "Rèn luyện sức khỏe, tinh thần đồng đội và những cú đập cầu đẹp.", teacher: "Thầy Phạm Quốc Bảo", meeting: "Thứ 5 · 16:00" },
	{ id: "club-green", name: "Mầm Xanh", category: "Tình nguyện", emoji: "🌱", color: "#e4f1e5", description: "Bắt đầu từ những việc nhỏ để trường học xanh và thân thiện hơn.", teacher: "Cô Trần Thanh Tâm", meeting: "Thứ 7 · 08:00" },
	{ id: "club-music", name: "Giai điệu Tuổi trẻ", category: "Nghệ thuật", emoji: "🎸", color: "#f1e7f2", description: "Chia sẻ âm nhạc, luyện tập và cùng tạo nên những sân khấu đáng nhớ.", teacher: "Thầy Nguyễn Hoàng Nam", meeting: "Thứ 4 · 16:00" },
];

async function main() {
	let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
	let adminPassword;
	if (!admin) {
		adminPassword = process.env.ADMIN_PASSWORD || password();
		const username = process.env.ADMIN_USERNAME || "admin";
		admin = await prisma.user.create({
			data: {
				username,
				email: process.env.ADMIN_EMAIL || "admin@clubconnect.local",
				name: "Quản trị viên",
				password: await bcrypt.hash(adminPassword, 12),
				role: "ADMIN",
			},
		});
	}

	let demoPassword;
	let demoStudent = await prisma.user.findUnique({ where: { username: "hocsinh01" } });
	if (!demoStudent) {
		demoPassword = password();
		demoStudent = await prisma.user.create({
			data: {
				username: "hocsinh01",
				email: "hocsinh01@clubconnect.local",
				name: "Anh Nguyễn",
				password: await bcrypt.hash(demoPassword, 12),
				role: "STUDENT",
			},
		});
	}

	for (const club of clubs) {
		await prisma.club.upsert({ where: { id: club.id }, create: club, update: {} });
	}

	const students = [demoStudent];
	for (let index = 2; index <= 8; index += 1) {
		const username = `hocsinh${String(index).padStart(2, "0")}`;
		let student = await prisma.user.findUnique({ where: { username } });
		if (!student) {
			student = await prisma.user.create({
				data: {
					username,
					email: `${username}@clubconnect.local`,
					name: ["Minh Anh", "Gia Hân", "Tuấn Kiệt", "Bảo Ngọc", "Đức Minh", "Khánh Linh", "Phương Thảo"][index - 2],
					password: await bcrypt.hash(password(), 12),
					role: "STUDENT",
				},
			});
		}
		students.push(student);
	}

	const memberships = [
		[0, "club-art"], [1, "club-art"], [2, "club-art"],
		[3, "club-stem"], [4, "club-stem"],
		[0, "club-books"], [5, "club-books"],
		[6, "club-sport"], [7, "club-green"], [2, "club-music"],
	];
	for (const [studentIndex, clubId] of memberships) {
		await prisma.clubMembership.upsert({
			where: { userId_clubId: { userId: students[studentIndex].id, clubId } },
			create: { userId: students[studentIndex].id, clubId },
			update: {},
		});
	}

	const activities = [
		{ id: "activity-green", clubId: "club-green", title: "Ngày hội đổi giấy lấy cây", description: "Mang giấy đã qua sử dụng đến đổi lấy một chậu cây nhỏ.", date: plusDays(5), time: "08:00", location: "Sân trường" },
		{ id: "activity-art", clubId: "club-art", title: "Workshop: Màu nước mùa thu", description: "Làm quen với kỹ thuật loang màu và hoàn thiện một tấm thiệp.", date: plusDays(8), time: "15:30", location: "Phòng mỹ thuật" },
		{ id: "activity-stem", clubId: "club-stem", title: "Thử thách robot vượt mê cung", description: "Lắp ráp và lập trình robot để hoàn thành đường đua.", date: plusDays(11), time: "14:00", location: "Phòng thực hành STEM" },
		{ id: "activity-books", clubId: "club-books", title: "Một cuốn sách, nhiều góc nhìn", description: "Cùng thảo luận về cuốn sách được bình chọn trong tháng.", date: plusDays(15), time: "16:00", location: "Thư viện" },
		{ id: "activity-sport", clubId: "club-sport", title: "Giao lưu cầu lông liên CLB", description: "Các trận đấu vui dành cho mọi trình độ, ưu tiên tinh thần đồng đội.", date: plusDays(18), time: "15:00", location: "Nhà đa năng" },
	];
	for (const activity of activities) {
		await prisma.activity.upsert({ where: { id: activity.id }, create: activity, update: {} });
	}

	for (const [activityId, studentIndex] of [
		["activity-green", 0], ["activity-green", 1],
		["activity-art", 0], ["activity-art", 2],
		["activity-stem", 3], ["activity-stem", 4],
		["activity-books", 0], ["activity-books", 5],
		["activity-sport", 6], ["activity-sport", 7],
	]) {
		await prisma.activityRegistration.upsert({
			where: { activityId_userId: { activityId, userId: students[studentIndex].id } },
			create: { activityId, userId: students[studentIndex].id },
			update: {},
		});
	}

	const credentials = [
		...(adminPassword ? [`Admin: ${admin.username} / ${adminPassword}`] : []),
		...(demoPassword ? [`Học sinh demo: ${demoStudent.username} / ${demoPassword}`] : []),
	];
	if (credentials.length) {
		fs.writeFileSync(
			path.join(__dirname, "..", ".admin-credentials.txt"),
			`${credentials.join("\n")}\n`,
			{ encoding: "utf8", mode: 0o600, flag: "wx" },
		);
	}
	console.log(`Đã tạo ${clubs.length} câu lạc bộ, ${activities.length} hoạt động và tài khoản mẫu.`);
	if (credentials.length) console.log(`Thông tin đăng nhập ban đầu được lưu trong ${path.join(__dirname, "..", ".admin-credentials.txt")}`);
}

main()
	.catch((error) => {
		console.error("Không thể tạo dữ liệu mẫu:", error);
		process.exitCode = 1;
	})
	.finally(async () => prisma.$disconnect());
