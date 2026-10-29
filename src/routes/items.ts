import { IncomingMessage, ServerResponse } from 'http'
import { getItems, getItemsById, addItem, updateItem, deleteItem } from '../controllers/items'

const sendJson = (res: ServerResponse, status: number, body: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
};

const readJson = (req: IncomingMessage): Promise<any> =>
    new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", () => {
            try { resolve(JSON.parse(body)); }
            catch { reject(new Error("Invalid JSON")); }
        });
        req.on("error", reject);
    });

export const itemsRoute = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url?.startsWith("/items")) return;

    const path = req.url?.split("?")[0] ?? "";
    const parts = path.split("/");
    const idPart = parts[2];
    const hasId = idPart !== undefined && idPart !== "";

    if (req.method === "GET" && !hasId) {
        return sendJson(res, 200, getItems());
    }

    if (req.method === "GET" && hasId) {
        const id = Number(idPart);
        if (!Number.isInteger(id)) {
            return sendJson(res, 400, { error: "Invalid item Id" });
        }
        const item = getItemsById(id);
        if (!item) {
            return sendJson(res, 404, { error: "Item not found" });
        }
        return sendJson(res, 200, item);
    }

    if (req.method === "PUT" && hasId) {
        const id = Number(idPart);
        if (!Number.isInteger(id)) {
            return sendJson(res, 400, { error: "Invalid item Id" });
        }

        if (!getItemsById(id)) {
            return sendJson(res, 404, { error: "Item not found" });
        }

        let body: any;
        try {
            body = await readJson(req);
        } catch {
            return sendJson(res, 400, { error: "Invalid JSON payload" });
        }

        const { name, quantity, purchasedStatus } = body ?? {};
        const errors: string[] = [];
        const updates: { name?: string; quantity?: number; purchasedStatus?: boolean } = {};

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                errors.push("name must be a non-empty string");
            } else {
                updates.name = name.trim();
            }
        }
        if (quantity !== undefined) {
            if (typeof quantity !== "number" || quantity <= 0) {
                errors.push("quantity must be a number greater than 0");
            } else {
                updates.quantity = quantity;
            }
        }
        if (purchasedStatus !== undefined) {
            if (typeof purchasedStatus !== "boolean") {
                errors.push("purchasedStatus must be true or false");
            } else {
                updates.purchasedStatus = purchasedStatus;
            }
        }

        if (errors.length === 0 && Object.keys(updates).length === 0) {
            errors.push("provide at least one of: name, quantity, purchasedStatus");
        }
        if (errors.length > 0) {
            return sendJson(res, 400, { error: "Validation failed", details: errors });
        }

        return sendJson(res, 200, updateItem(id, updates));
    }

    if (req.method === "DELETE" && hasId) {
        const id = Number(idPart);
        if (!Number.isInteger(id)) {
            return sendJson(res, 400, { error: "Invalid item Id" });
        }

        const deleted = deleteItem(id);
        if (!deleted) {
            return sendJson(res, 404, { error: "Item not found" });
        }

        res.writeHead(204);
        return res.end();
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            let parsed: any;
            try {
                parsed = JSON.parse(body);
            } catch {
                return sendJson(res, 400, { error: "Invalid JSON payload" });
            }

            const { name, quantity, purchasedStatus } = parsed ?? {};
            const errors: string[] = [];

            if (typeof name !== "string" || name.trim() === "") {
                errors.push("name is required and must be a non-empty string");
            }
            if (typeof quantity !== "number" || quantity <= 0) {
                errors.push("quantity is required and must be a number greater than 0");
            }
            if (typeof purchasedStatus !== "boolean") {
                errors.push("purchasedStatus is required and must be true or false");
            }

            if (errors.length > 0) {
                return sendJson(res, 400, { error: "Validation failed", details: errors });
            }

            const newItem = addItem(name.trim(), quantity, purchasedStatus);
            return sendJson(res, 201, newItem);
        });
        return;
    }

    sendJson(res, 405, { error: "Method not allowed on /items" });
};