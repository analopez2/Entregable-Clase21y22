import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { DATE_UTILS } from './utils/index.js';
import { DbContainer } from './Api/DbContainer.js';
import { KnexService } from './services/index.js';
import { productRouter } from './routers/productRouter.js';

const MessagesApi = new DbContainer(KnexService.KnexSqlite, 'mensajes');
const ProductsApi = new DbContainer(KnexService.KnexMySQL, 'productos');

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const PORT = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/productos', productRouter);

io.on('connection', async (socket) => {
  console.log(`Nuevo cliente conectado ${socket.id}`);

  socket.emit('mensajes', await MessagesApi.getAll());

  socket.on('mensajeNuevo', async ({ email, text }) => {
    const message = { email, text, timestamp: DATE_UTILS.getTimestamp() };
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
