class ApiError extends Error {
    constructor(
        message = "Something went wrong!",
        statusCode,
        error = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = this.errors || error;
        this.success = false;
        this.data = null;
        this.message = message;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
