import { ContenedorMongoDb } from '../../contenedores/ContenedorMongoDb.js';
import { MensajesSchema } from '../../db/mongoDb/MensajesSchema.js';

class MensajesDaoMongoDb extends ContenedorMongoDb {
  constructor() {
    super('mensajes', MensajesSchema);
  }
}

export { MensajesDaoMongoDb };
