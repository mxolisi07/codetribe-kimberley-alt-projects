import http, { IncomingMessage, ServerResponse } from "http";
import { itemsRoute } from "./routes/items";
import { NotFoundError } from "./utils/errors";
import { handleError, sendSuccess } from "./utils/response";

const PORT = 3000;

const requestListener = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        if (req.url === "/" && req.method === "GET") {
            return sendSuccess(res, 200, { message: "Hello World" });
        }

        const handled = await itemsRoute(req, res);
        if (!handled) {
            throw new NotFoundError(`Route ${req.method} ${req.url} not found`);
        }
    } catch (err) {
        handleError(res, err);
    }
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});