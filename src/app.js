const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test);

// Como o express captura os middlewares pelo caminho usando next...
// app.get('/users', (req, res, next) => {
//     console.log('Passei aqui!');
//     next();
// });

consign({ cwd: 'src', verbose: false })
    .include('./config/middlewares.js')
    .then('./services')
    .then('./routes')
    .then('./config/routes.js')
    .into(app);

app.get('/', (req, res) => {
    res.status(200).send();
});

app.use((req, res) => {
    res.status(200).send('Não conheço essa requisição!');
});


// Para substituir o knexLogger se preferir:
// app.db
//     .on('query', (query) => {
//         console.log({
//             sql: query.sql,
//             bindings: query.bindings ? query.bindings.join(',') : '',
//         });
//     })
//     .on('query-response', (response) => {
//         console.log(response);
//     })
//     .on('error', (error) => console.log(error));

module.exports = app;
