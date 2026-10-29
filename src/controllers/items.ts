import { Item, ItemFields } from "../models/items"

let items: Item[] = []

let currentId = 1

export const getItems = (): Item[] => {
    return items;
}

export const getItemsById = (id: number): Item | undefined => {
    const item = items.find((item) => item.id === id )
    return item;
}

export const addItem = (data: ItemFields ): Item => {
    const newItem: Item = {id: currentId++, ...data}
    items.push(newItem)
    return newItem;
}

export const updateItem = (
  id: number, updates: Partial<ItemFields>): Item | undefined => {
  const item = getItemsById(id);
  if (!item) return undefined;

  Object.assign(item, updates);
  return item;
}

export const deleteItem = (id: number): boolean => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    return true;
}