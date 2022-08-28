import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { DATE_UTILS } from './utils/index.js';
import { DbContainer } from './contenedores/DbContainer.js';
import { KnexService } from './services/index.js';
import { productRouter } from './routers/productRouter.js';
import ProductsFaker from './models/ProductsFaker.js';
import { MensajesDaoMongoDb } from './daos/mensajes/MensajesDaoMongoDb.js';
import handlebars from 'express-handlebars';
import { fileURLToPath } from 'url';
import path from 'path';
import { JOI_VALIDATOR } from './utils/joi-validator.js';
import { MongoDb } from './db/mongoDb/mongodb.js';
import { normalize, schema, denormalize } from 'normalizr';

MongoDb.init();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MessagesApi = new DbContainer(KnexService.KnexSqlite, 'mensajes');
const ProductsApi = new DbContainer(KnexService.KnexMySQL, 'productos');

const MensajesApiMongo = new MensajesDaoMongoDb();

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
const schemaAuthor = new schema.Entity('authors', {});
const schemaMensajes = new schema.Entity('mensajes', {
  author: schemaAuthor,
});
const schemaListMensajes = new schema.Entity('listMensajes', {
  mensajes: [schemaMensajes],
});

app.post('/api/mensajes', async (req, res) => {
  try {
    let authorMsj;
    let mensaje;
    const { author, text } = req.body;
    if (author) {
      const { id, nombre, apellido, edad, alias, avatar } = author;
      authorMsj = await JOI_VALIDATOR.author.validateAsync({
        id,
        nombre,
        apellido,
        edad,
        alias,
        avatar,
      });
    }

    if (text) {
      mensaje = { author: authorMsj, text: text };
    }

    const msjSaved = await MensajesApiMongo.save(mensaje);

    res.send(msjSaved);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/mensajes/normalizr', async (req, res) => {
  try {
    const msj = await MensajesApiMongo.getAll();

    const originalMsj = {
      id: 'mensajes',
      mensajes: [],
    };

    msj.forEach((element) => {
      originalMsj.mensajes.push({
        id: element._id,
        author: element.author,
        text: element.text,
        timestamp: element.timestamp,
      });
    });

    const normalizedMsjObject = normalize(originalMsj, schemaListMensajes);
    const size_original = JSON.stringify(originalMsj).length;
    const size_normalized = JSON.stringify(normalizedMsjObject).length;
    const percentaje = (size_normalized * 100) / size_original;

    res.send({ normalizr: normalizedMsjObject, compression: percentaje });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/mensajes/denormalizr', async (req, res) => {
  try {
    const msj = await MensajesApiMongo.getAll();

    const originalMsj = {
      id: 'mensajes',
      mensajes: [],
    };

    msj.forEach((element) => {
      originalMsj.mensajes.push({
        id: element._id,
        author: element.author,
        text: element.text,
        timestamp: element.timestamp,
      });
    });

    const normalizedMsjObject = normalize(originalMsj, schemaListMensajes);
    const denormalizeMsjObject = denormalize(
      normalizedMsjObject.result,
      schemaListMensajes,
      normalizedMsjObject.entities,
    );

    console.log(JSON.stringify(denormalizeMsjObject, null, '\t'));
    res.send(denormalizeMsjObject);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

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
