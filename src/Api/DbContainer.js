class DbContainer {
  constructor(knex, tableName) {
    this.knex = knex;
    this.tableName = tableName;
  }

  async save(element) {
    try {
      let lastInsertId = await this.knex.insert(element).into(this.tableName);
      return lastInsertId[0];
    } catch (error) {
      return error;
    }
  }

  async getAll() {
    try {
      let rows = await this.knex.select('*').from(this.tableName);
      return rows;
    } catch (error) {
      return error;
    }
  }

  async getById(id) {
    try {
      let row = await this.knex
        .select('*')
        .from(this.tableName)
        .where('id', '=', id);
      return row;
    } catch (error) {
      return error;
    }
  }

  async update(element, id) {
    try {
      let elementById = await this.getById(id);
      if (elementById) {
        await this.knex
          .from(this.tableName)
          .where('id', '=', id)
          .update({ ...element.id, ...element });

        let elementUpdate = await this.getById(id);
        return elementUpdate;
      } else {
        throw { error: `Element with Id: ${id} not found` };
      }
    } catch (error) {
      return error;
    }
  }

  async deleteById(id) {
    try {
      await this.knex.from(this.tableName).where('id', '=', id).del();

      let data = await this.getAll();
      return data;
    } catch (error) {
      return error;
    }
  }
}

export { DbContainer };
