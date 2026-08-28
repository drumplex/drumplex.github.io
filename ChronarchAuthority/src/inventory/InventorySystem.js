export class InventorySystem {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
    console.log(`[INVENTORY] Added item: ${item.name}`);
  }

  hasItem(id) {
    return this.items.some(i => i.id === id);
  }

  getItems() {
    return this.items;
  }
}
