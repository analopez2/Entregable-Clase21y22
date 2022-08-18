const DEV_PORT = 8080;

const config = {
  knex: {
    mysql: {
      client: 'mysql',
      connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        database: 'ecommerce',
      },
    },
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: './src/db/ecommerce.sqlite',
      },
      useNullAsDefault: true,
    },
  },
  server: {
    PORT: process.env.PORT || DEV_PORT,
  },
};

export { config };
