// creates standardized success responses
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
        // server has status codes like informational, client, response etc
    }
}

export { ApiResponse };