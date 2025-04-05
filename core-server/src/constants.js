// Database configuration constants
export const DB_CONNECTION_LIMIT = 10;
export const DB_NAME = "hectoclash";
export const DB_ACQUIRE_TIMEOUT = 10000;
export const DB_IDLE_TIMEOUT = 1800;
export const QUERY_TIMEOUT = 60000;

// Data constants
export const defaultProfilePic =
	"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

// Export everything
export default {
	DB_NAME,
	DB_CONNECTION_LIMIT,
	DB_ACQUIRE_TIMEOUT,
	DB_IDLE_TIMEOUT,
	QUERY_TIMEOUT,
	defaultProfilePic,
};
