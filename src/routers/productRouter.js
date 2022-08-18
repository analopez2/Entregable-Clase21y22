import { Router } from 'express';
import {
  productNotFound,
  prorductWasDeleted,
  invalidBody,
} from '../consts/index.js';
import { DbContainer } from '../Api/DbContainer.js';
import { KnexService } from '../services/index.js';

const productRouter = Router();
const ProductApi = new DbContainer(KnexService.KnexMySQL, 'productos');

productRouter.get('/', async (req, res) => {
  try {
    const response = await ProductApi.getAll();

    if (!response) res.send({ error: productNotFound });

    res.json(response);
  } catch (error) {
    res.json({ error: error.message });
  }
});

productRouter.post('/', async (req, res) => {
  try {
    const { title, price, thumbnail } = req.body;

    if ((!title, !price, !thumbnail)) {
      throw { error: invalidBody };
    }

    const product = { title, price, thumbnail };

    const productSaved = await ProductApi.save(product);
    res.json(productSaved);
  } catch (error) {
    res.json({ error: error.message });
  }
});

productRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductApi.getById(id);

    if (!product) {
      throw { error: productNotFound };
    }

    res.json(product);
  } catch (error) {
    res.json({ error: error.message });
  }
});

productRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, thumbnail } = req.body;

    if ((!title, !price, !thumbnail)) {
      throw { error: invalidBody };
    }

    const product = { title, price, thumbnail };

    const productUpdate = await ProductApi.update(product, id);

    res.json(productUpdate);
  } catch (error) {
    res.json({ error: error.message });
  }
});

productRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductApi.getById(id);
    if (!product) {
      throw { error: productNotFound };
    }
    const productDelete = await ProductApi.deleteById(id);

    res.json({
      mensaje: prorductWasDeleted,
      productoEliminado: product,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

export { productRouter };
