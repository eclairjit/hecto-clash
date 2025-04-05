/*
    Class to create Response Object

    Structure of Response Object:
        status: number
        data: any
        message: string (default: "Success")
        success boolean

    Constructor Parameters:
        status: number - The HTTP status code for the error
        data: any - The data to be sent as API response
        message (optional) - A descriptive response message (default: "Success")
 */

class apiResponse {
	constructor(status, data, message = "Success") {
		this.status = status;
		this.data = data;
		this.message = message;
		this.success = status < 400;
	}
}

export default apiResponse;
