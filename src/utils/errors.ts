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

export class BadRequestError extends HttpError {
    constructor(message = "Bad request", details?: string[]) {
        super(400, message, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Not found") {
        super(404, message);
    }
}

export class MethodNotAllowedError extends HttpError {
    constructor(message = "Method not allowed") {
        super(405, message);
    }
}