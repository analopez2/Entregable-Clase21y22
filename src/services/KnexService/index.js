import knex from 'knex';
import { config } from '../../config/index.js';
import { DATASETS } from './datasets/index.js';

const KnexMySQL = knex(config.knex.mysql);
const KnexSqlite = knex(config.knex.sqlite);

const addDatasets = async (knexConnector, data, tableName) => {
  await knexConnector.insert(data).into(tableName);
};

const createProductTable = async () => {
  try {
    const tableExist = await KnexMySQL.schema.hasTable('productos');
    if (tableExist) return;

    await KnexMySQL.schema.createTable('productos', (table) => {
      table.increments('id');
      table.string('title');
      table.integer('price');
      table.string('thumbnail');
    });

    await addDatasets(KnexMySQL, DATASETS.productos, 'productos');
  } catch (error) {
    console.error(error);
  }
};

const createMessagesTable = async () => {
  try {
    const tableExist = await KnexSqlite.schema.hasTable('mensajes');
    if (tableExist) return;

    await KnexSqlite.schema.createTable('mensajes', (table) => {
      table.increments('id');
      table.string('email');
      table.integer('text');
      table.string('timestamp');
    });

    await addDatasets(KnexSqlite, DATASETS.mensajes, 'mensajes');
  } catch (error) {
    console.error(error);
  }
};

const init = async () => {
  await createProductTable();
  await createMessagesTable();
};

const KnexService = {
  init,
  KnexMySQL,
  KnexSqlite,
};

export { KnexService };
