import {
	createUser,
	findUserByEmail,
	findUserById,
	storeToken,
} from "../repositories/user.js";
import { generateToken } from "../utils/jwt.js";

const loginOrSignUpUser = async (email, username, profilePic) => {
	try {
		const existingUser = await findUserByEmail(email);

		if (existingUser) {
			const token = generateToken({
				id: existingUser.id,
				email: existingUser.email,
				type: "user",
			});

			const result = await storeToken(existingUser.id, token);

			if (!result) {
				throw new Error("Error storing token");
			}

			return {
				user: existingUser,
				token,
			};
		}

		const newUser = await createUser(username, email, profilePic);

		const token = generateToken({
			id: newUser.id,
			email: newUser.email,
			type: "user",
		});

		const result = await storeToken(newUser.id, token);

		console.log("Token stored successfully:", result);

		return {
			user: newUser,
			token,
		};
	} catch (error) {
		throw new Error("Error logging in or signing up user: " + error.message);
	}
};

const findById = async (id) => {
	return await findUserById(id);
};

// const signupUser = async (
// 	email,
// 	username,
// 	age,
// 	profilePic = defaultProfilePic
// ) => {
// 	try {
// 		const existingUser = await findUserByEmail(email);
// 		if (existingUser) {
// 			return {
// 				user: existingUser,
// 				message: "User already exists",
// 			};
// 		}

// 		const newUser = await createUser(email, username, age, profilePic);

// 		const token = generateToken({
// 			id: newUser.id,
// 			email: newUser.email,
// 			type: "user",
// 		});

// 		return {
// 			user: {
// 				id: newUser.id,
// 				email: newUser.email,
// 				username: newUser.username,
// 				age: newUser.age,
// 				profile_pic: newUser.profile_pic,
// 				current_rating: newUser.current_rating,
// 			},
// 			token,
// 		};
// 	} catch (error) {
// 		console.error("Signup Error:", error.message);
// 		throw new Error(error.message || "User signup failed");
// 	}
// };

// const loginUser = async (email) => {
// 	try {
// 		const user = await findUserByEmail(email);
// 		if (!user) {
// 			throw new Error("User not found. Please sign up.");
// 		}

// 		const token = generateToken({
// 			id: user.id,
// 			email: user.email,
// 			type: "user",
// 		});

// 		return {
// 			user: {
// 				id: user.id,
// 				email: user.email,
// 				username: user.username,
// 				age: user.age,
// 				profile_pic: user.profile_pic,
// 				current_rating: user.current_rating,
// 			},
// 			token,
// 		};
// 	} catch (error) {
// 		console.error("Login Error:", error.message);
// 		throw new Error(error.message || "User login failed");
// 	}
// };

// export { signupUser, loginUser };

export { loginOrSignUpUser, findById };
