export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: string[]
    ) {
        super(message);
        this.name = new.target.name;
    }
}

// 400: the client sent bad input
export class BadRequestError extends HttpError {
    constructor(message = "Bad request", details?: string[]) {
        super(400, message, details);
    }
}

// 404: the thing the client asked for doesn't exist
export class NotFoundError extends HttpError {
    constructor(message = "Not found") {
        super(404, message);
    }
}

// 405: the URL exists but not for this HTTP method
export class MethodNotAllowedError extends HttpError {
    constructor(message = "Method not allowed") {
        super(405, message);
    }
}