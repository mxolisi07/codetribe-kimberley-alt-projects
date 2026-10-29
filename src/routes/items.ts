import { IncomingMessage, ServerResponse } from 'http'
import { getItems, getItemsById, addItem, updateItem, deleteItem } from '../controllers/items'
import { ItemFields } from '../models/items'

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

const validateItemFields = (data: any, requireAll: boolean) => {
    const errors: string[] = [];
    const values: Partial<ItemFields> = {};
    const input = data ?? {};

    const checkText = (field: "name" | "unit" | "category" | "notes", allowEmpty = false) => {
        const value = input[field];
        if (value === undefined && !requireAll) return;
        if (typeof value !== "string" || (!allowEmpty && value.trim() === "")) {
            errors.push(`${field} must be ${allowEmpty ? "a string" : "a non-empty string"}`);
            return;
        }
        values[field] = value.trim();
    };

    checkText("name");

    const { quantity, purchasedStatus } = input;

    if (quantity !== undefined || requireAll) {
        if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
            errors.push("quantity must be a number greater than 0");
        } else {
            values.quantity = quantity;
        }
    }

    if (purchasedStatus !== undefined || requireAll) {
        if (typeof purchasedStatus !== "boolean") {
            errors.push("purchasedStatus must be true or false");
        } else {
            values.purchasedStatus = purchasedStatus;
        }
    }

    checkText("unit");
    checkText("category");
    checkText("notes", true);

    return { errors, values };
};

export const itemsRoute = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url?.startsWith("/items")) return;

    const path = req.url!.split("?")[0] ?? "";
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

        const { errors, values } = validateItemFields(body, false);

        if (errors.length === 0 && Object.keys(values).length === 0) {
            errors.push("provide at least one of: name, quantity, purchasedStatus, unit, category, notes");
        }
        if (errors.length > 0) {
            return sendJson(res, 400, { error: "Validation failed", details: errors });
        }

        return sendJson(res, 200, updateItem(id, values));
    }

    if (req.method === "DELETE" && hasId) {
        const id = Number(idPart);
        if (!Number.isInteger(id)) {
            return sendJson(res, 400, { error: "Invalid item Id" });
        }
        if (!deleteItem(id)) {
            return sendJson(res, 404, { error: "Item not found" });
        }

        res.writeHead(204);
        return res.end();
    }

    if (req.method === "POST") {
        let body: any;
        try {
            body = await readJson(req);
        } catch {
            return sendJson(res, 400, { error: "Invalid JSON payload" });
        }

        const { errors, values } = validateItemFields(body, true);
        if (errors.length > 0) {
            return sendJson(res, 400, { error: "Validation failed", details: errors });
        }

        return sendJson(res, 201, addItem(values as ItemFields));
    }

    sendJson(res, 405, { error: "Method not allowed on /items" });
};