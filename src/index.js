import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { DATE_UTILS } from './utils/index.js';
import { DbContainer } from './contenedores/DbContainer.js';
import { MensajesDaoMongoDb } from './daos/mensajes/MensajesDaoMongoDb.js';
import { KnexService } from './services/index.js';
import { productRouter } from './routers/productRouter.js';
import ProductsFaker from './models/ProductsFaker.js';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import { normalizedObject } from './utils/schema-normalizr.js';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MessagesApi = new MensajesDaoMongoDb();
const ProductsApi = new DbContainer(KnexService.KnexMySQL, 'productos');

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const PORT = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/productos', productRouter);

app.engine('hbs', handlebars.engine());
app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'hbs');

const productsFaker = new ProductsFaker();

app.get('/api/productos-test', async (req, res) => {
  try {
    let productos = await productsFaker.getAll();
    if (productos.length > 0) {
      res.render('products', { products: productos });
    } else {
      productsFaker.populate();
      let productos = await productsFaker.getAll();
      res.render('products', { products: productos });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: 'error', error: 'No se pudieron encontrar productos' });
  }
});

const originalMsj = {
  id: 'mensajes',
  mensajes: [],
};

io.on('connection', async (socket) => {
  console.log(`Nuevo cliente conectado ${socket.id}`);
  originalMsj.mensajes = await MessagesApi.getAll();

  const normalizedMsjObject = normalizedObject(originalMsj);

  const size_original = JSON.stringify(originalMsj).length;
  const size_normalized = JSON.stringify(normalizedMsjObject).length;
  const percentaje = (size_normalized * 100) / size_original;

  socket.emit('mensajes', normalizedMsjObject, Math.round(percentaje));

  socket.on('mensajeNuevo', async (message) => {
    message.timestamp = DATE_UTILS.getTimestamp();
    await MessagesApi.save(message);

    io.sockets.emit('mensajes', await MessagesApi.getAll());
  });

  socket.emit('products', await ProductsApi.getAll());

  socket.on('add-product', async (data) => {
    await ProductsApi.save(data);

    io.sockets.emit('products', await ProductsApi.getAll());
  });
});

KnexService.init();
const server = httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
server.on('error', (error) => {
  console.error(`Error en el servidor ${error}`);
});
