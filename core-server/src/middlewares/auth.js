import { verifyToken, apiError, asyncHandler } from "../utils/index.js";
import { findById } from "../services/auth.js";

/**
 * Middleware to check JWT token presence and validity.
 */
// const authenticateToken = (req, res, next) => {
// 	try {
// 		const token = req.headers.authorization?.split(" ")[1];

// 		if (!token) throw new apiError(401, "Unauthorized");

// 		req.user = verifyToken(token);
// 		next();
// 	} catch (error) {
// 		next(new apiError(403, "Forbidden: Invalid token"));
// 	}
// };

// /**
//  * Middleware to authenticate user via JWT token and fetch user details.
//  */
// const authToken = async (req, res, next) => {
// 	try {
// 		const token =
// 			req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

// 		if (!token) throw new apiError(401, "Unauthorized: No token provided");

// 		const decoded = verifyToken(token);
// 		if (!decoded?.id) throw new apiError(401, "Unauthorized: Invalid token");

// 		const user = await findById(decoded.id);
// 		if (!user) throw new apiError(401, "Unauthorized: User not found");

// 		req.user = user;
// 		next();
// 	} catch (error) {
// 		next(new apiError(401, "Invalid token"));
// 	}
// };

const authorize = asyncHandler(async (req, _, next) => {
	try {
		const token =
			req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			throw new apiError(401, "No token found!");
		}

		const decodedToken = verifyToken(token);

		const user = await findById(decodedToken.id);

		if (!user) {
			throw new apiError(404, "User not found! Invalid token!");
		}

		req.user = user;

		next();
	} catch (error) {
		throw new apiError(401, "Invalid token!");
	}
});

export { /*authenticateToken, authToken,*/ authorize };
