class MemoryContainer {
  constructor() {
    this.elements = [];
  }

  getAll() {
    return this.elements;
  }

  getById(id) {
    const product = this.elements.find((p) => p.id == id);
    return product;
  }

  save(product) {
    product.id = this.newId();
    this.elements.push(product);

    return product;
  }

  update(product, id) {
    const index = this.elements.findIndex((p) => p.id == id);

    if (index === -1) return { error: true };

    this.elements[index] = {
      ...this.elements[index],
      ...product,
    };

    return this.elements[index];
  }

  deleteById(id) {
    const index = this.elements.findIndex((p) => p.id == id);

    if (index === -1) return { error: true };

    this.elements = this.elements.filter((p) => p.id != id);

    return { error: false };
  }

  existsProduct(id) {
    let product = this.elements.find((p) => p.id == id);
    if (product != undefined) {
      return { error: true };
    } else {
      return { error: false };
    }
  }

  validateProduct(product) {
    if (
      product.title != null &&
      product.price != null &&
      product.thumbnail != null
    ) {
      return { error: true };
    } else {
      return { error: false };
    }
  }

  //#region private
  newId() {
    let id = 1;
    if (this.elements.length > 0) {
      id = this.elements[this.elements.length - 1].id + 1;
    }

    return id;
  }
  //#endregion
}

export { MemoryContainer };
