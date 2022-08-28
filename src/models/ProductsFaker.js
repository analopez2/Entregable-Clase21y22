import MemoryContainer from '../contenedores/MemoryContainer.js';
import { generateProducts } from '../utils/utils.js';

class ProductsFaker extends MemoryContainer {
  constructor() {
    super();
  }

  populate(quantity = 5) {
    const newProducts = [];
    for (let i = 0; i < quantity; i++) {
      let newProduct = generateProducts();
      this.save(newProduct);
      newProducts.push(newProduct);
    }

    return newProducts;
  }
}

export default ProductsFaker;
