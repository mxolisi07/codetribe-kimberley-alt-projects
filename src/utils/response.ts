import { ServerResponse } from "http";
import { HttpError } from "../utils/errors";

const sendJson = (res: ServerResponse, status: number, body: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
};

export const sendSuccess = <T>(res: ServerResponse, status: number, data: T) => {
    sendJson(res, status, { success: true, data });
};

// 204 must not have a body
export const sendNoContent = (res: ServerResponse) => {
    res.writeHead(204);
    res.end();
};

// The single place where every error becomes a response
export const handleError = (res: ServerResponse, err: unknown) => {
    // A response was already started, so we can't send another one
    if (res.headersSent) {
        res.end();
        return;
    }

    if (err instanceof HttpError) {
        sendJson(res, err.status, {
            success: false,
            error: {
                message: err.message,
                ...(err.details && { details: err.details }),
            },
        });
        return;
    }

    // Anything unexpected: log it, but don't leak internals to the client
    console.error(err);
    sendJson(res, 500, {
        success: false,
        error: { message: "Internal server error" },
    });
};