/*
    Class to create Error Object

    Structure of Error Object:
        status: number
        message: string (default: "Something went wrong!")
        data: null
        success: boolean (fixed: false)
        errors: array
        stack: string (optional)

    Constructor Parameters:
        status: number - The HTTP status code for the error
        message: string (optional) - A descriptive error message (default: "Something went wrong!")
        errors: array (optional) - Additional error details (default: [])
        stack: string (optional) - Custom stack trace (default: auto-generated)
 */

class apiError extends Error {
	constructor(
		status,
		message = "Something went wrong!",
		errors = [],
		stack = ""
	) {
		super(message);
		this.status = status;
		this.message = message;
		this.data = null;
		this.success = false;
		this.errors = errors;

		stack
			? (this.stack = stack)
			: Error.captureStackTrace(this, this.constructor);
	}
}

export default apiError;
