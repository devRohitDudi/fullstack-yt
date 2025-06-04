class ApiResponse {
    constructor(statusCode, message = "success", data) {
        this.statusCode = statusCode;
        this.data = data || null;
        this.message = message;
        this.success = statusCode < 400;
    }
}
export { ApiResponse };
