import { IncomingMessage, ServerResponse } from "http";
import { getItems, getItemsById, addItem, updateItem, deleteItem } from "../controllers/items";
import { ItemFields } from "../models/items";
import { BadRequestError, NotFoundError, MethodNotAllowedError } from "../utils/errors";
import { sendSuccess, sendNoContent } from "../utils/response";

const readJson = (req: IncomingMessage): Promise<any> =>
    new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", () => {
            try { resolve(JSON.parse(body)); }
            catch { reject(new BadRequestError("Invalid JSON payload")); }
        });
        req.on("error", reject);
    });

const parseId = (idPart: string): number => {
    const id = Number(idPart);
    if (!Number.isInteger(id)) throw new BadRequestError("Invalid item Id");
    return id;
};

const findItemOrThrow = (id: number) => {
    const item = getItemsById(id);
    if (!item) throw new NotFoundError("Item not found");
    return item;
};

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

export const itemsRoute = async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    const parts = ((req.url ?? "").split("?")[0] ?? "").split("/");
    if (parts[1] !== "items" || parts.length > 3) return false;

    const hasId = parts[2] !== undefined && parts[2] !== "";
    const method = req.method;

    if (!hasId) {
        if (method === "GET") {
            sendSuccess(res, 200, getItems());
            return true;
        }

        if (method === "POST") {
            const body = await readJson(req);
            const { errors, values } = validateItemFields(body, true);
            if (errors.length > 0) throw new BadRequestError("Validation failed", errors);

            sendSuccess(res, 201, addItem(values as ItemFields));
            return true;
        }

        throw new MethodNotAllowedError("Method not allowed on /items");
    }

    const id = parseId(parts[2]!);

    if (method === "GET") {
        sendSuccess(res, 200, findItemOrThrow(id));
        return true;
    }

    if (method === "PUT") {
        findItemOrThrow(id);
        const body = await readJson(req);
        const { errors, values } = validateItemFields(body, false);

        if (errors.length === 0 && Object.keys(values).length === 0) {
            errors.push("provide at least one of: name, quantity, purchasedStatus, unit, category, notes");
        }
        if (errors.length > 0) throw new BadRequestError("Validation failed", errors);

        sendSuccess(res, 200, updateItem(id, values));
        return true;
    }

    if (method === "DELETE") {
        findItemOrThrow(id);
        deleteItem(id);
        sendNoContent(res);
        return true;
    }

    throw new MethodNotAllowedError("Method not allowed on /items/:id");
};