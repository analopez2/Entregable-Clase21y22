import { normalize, schema, denormalize } from 'normalizr';

const schemaAuthor = new schema.Entity('authors', {}, { idAttribute: 'email' });
const schemaMensajes = new schema.Entity('mensajes', {
  author: schemaAuthor,
});
const schemaListMensajes = new schema.Entity('listMensajes', {
  mensajes: [schemaMensajes],
});

const normalizedObject = (msj) => normalize(msj, schemaListMensajes);

export { normalizedObject };
