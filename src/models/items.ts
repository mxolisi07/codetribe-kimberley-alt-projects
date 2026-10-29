export interface Item {
    id: number;
    name: string;
    quantity: number;
    purchasedStatus: boolean;
    unit: string;
    category: string;
    notes: string;
}

export type ItemFields = Omit<Item, "id">;