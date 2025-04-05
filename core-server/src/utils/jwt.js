import jwt from "jsonwebtoken";
import conf from "../config/config.js";

const JWT_SECRET =
	process.env.JWT_SECRET || "ayush_maholiya_22je0216_xyz_asdfghjkl";
const JWT_EXPIRATION = "2d";

/*
 * Generate JWT Token
 * @param {Object} payload - User information to be encoded in the token
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
	return jwt.sign(payload, conf.jwtSecret, {
		expiresIn: conf.jwtExpiration,
	});
};

/*
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {Object|false} Decoded token or false if invalid
 */
export const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

// /*
//  * Hash password
//  * @param {string} password - Plain text password
//  * @returns {Promise<string>} Hashed password
//  */
// export const hashPassword = async (password) => {
// 	const salt = await bcrypt.genSalt(10);
// 	return bcrypt.hash(password, salt);
// };

// /*
//  * Compare password
//  * @param {string} inputPassword - Plain text password
//  * @param {string} hashedPassword - Hashed password from database
//  * @returns {Promise<boolean>} Password match result
//  */
// export const comparePassword = async (inputPassword, hashedPassword) => {
// 	return bcrypt.compare(inputPassword, hashedPassword);
// };
