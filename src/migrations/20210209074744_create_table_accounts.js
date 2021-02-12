exports.up = (knex) => {
    return knex.schema.createTable('accounts', (table) => {
        table.increments('id').primary();
        table.string('name').notNull();
        table.integer('user_id').references('id').inTable('users').notNull();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTable('accounts');
};

// CRIANDO ARQUIVO DE MIGRACAO e criando tabelas
// No terminal:
// node_modules/.bin/knex migrate:make create_table_accounts --env test
// node_modules/.bin/knex migrate:latest --env test
// node_modules/.bin/knex migrate:rollback --env test
// node_modules/.bin/knex migrate:latest --env test (executa esse comando novamente)
