import { prisma } from ".";
import { User, ID } from "~/types/user";
import bcrypt from "bcryptjs";

// create a new user
export const createUser = async (userData: User) => {
	const password = userData.password;
	if (!password) {
		throw createError({ statusCode: 400, statusMessage: "password is required" });
	}

	return prisma.user.create({
		data: {
			username: userData.username.trim().toLowerCase(),
			email: userData.email.trim().toLowerCase(),
			name: userData.name?.trim() || null,
			profileImage: userData.profileImage || null,
			password: await bcrypt.hash(password, 12),
			role: "STUDENT",
		},
	});
};

// get a user by username
export const getUserByUsername = (username: string) => {
	return prisma.user.findUnique({
		where: {
			username: username.trim().toLowerCase(),
		},
	});
};

export const getUserByEmail = (email: string) => {
	return prisma.user.findUnique({
		where: { email: email.trim().toLowerCase() },
	});
};

// get a user by id
export const getUserById = (id: ID) => {
	return prisma.user.findUnique({
		where: {
			id,
		},
	});
};
