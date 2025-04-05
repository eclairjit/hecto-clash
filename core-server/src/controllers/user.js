import { asyncHandler, apiResponse, apiError } from "../utils/index.js";
// import { signupUser, loginUser } from "../services/auth.js";
import { loginOrSignUpUser } from "../services/auth.js";
import { defaultProfilePic } from "../constants.js";

const options = {
	httpOnly: true,
	secure: true,
};

/*
 * @desc    User Signup/Login
 * @route   POST /api/v1/user/login
 * @access  Public
 */

const Login = asyncHandler(async (req, res) => {
	const { email, username, profilePic } = req.body;

	if (!email || !username) {
		throw new apiError(400, "Email and Username are required");
	}

	const { user, token } = await loginOrSignUpUser(
		email,
		username,
		profilePic || defaultProfilePic
	);

	if (!user) {
		throw new apiError(400, "Error logging in or signing up");
	}

	if (!token) {
		throw new apiError(400, "Error generating token");
	}

	return res
		.status(200)
		.cookie("token", token, options)
		.json(new apiResponse(200, "User logged in successfully.", user));
});

// /*
//  * @desc    User Signup
//  * @route   POST /api/v1/user/signup
//  * @access  Public
//  */
// const Signup = asyncHandler(async (req, res) => {
// 	const { email, username, profilePic } = req.body;

// 	if (!email || !username) {
// 		throw new apiError(400, "Email and Username are required");
// 	}

// 	const { user, token } = await signupUser(
// 		email,
// 		username,
// 		age,
// 		profilePic || defaultProfilePic,
// 		auth0Token
// 	);

// 	return res
// 		.status(201)
// 		.json(
// 			new apiResponse(201, "User signed up successfully.", { user, token })
// 		);
// });

// /*
//  * @desc    User Login
//  * @route   POST /api/v1/user/login
//  * @access  Public
//  */
// const Login = asyncHandler(async (req, res) => {
// 	const { email, auth0Token } = req.body;

// 	if (!email || !auth0Token) {
// 		throw new apiError(400, "Email and Auth0 Token are required");
// 	}

// 	const { user, token } = await loginUser(email, auth0Token);

// 	return res
// 		.status(200)
// 		.json(
// 			new apiResponse(200, "User logged in successfully.", { user, token })
// 		);
// });

// export default { Signup, Login };

const User = {
	Login,
};

export default User;
