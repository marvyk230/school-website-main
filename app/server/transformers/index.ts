import { User } from "~/types/user";

// remove the password from the user object
export const userTransformer = (user: User) => {
	const { password: _password, ...rest } = user;
	return rest;
};
