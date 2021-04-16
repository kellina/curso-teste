const express = require('express');

module.exports = (app) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        // Consulta ao banco de dados usando o knex
        app.services.user.findAll()
            .then((result) => res.status(200).json(result))
            .catch((err) => next(err));
    });

    router.post('/', async (req, res, next) => {
        // O 2º param do insert é o return, o '*' signif que ira retonar tudo do body.
        // neste caso retornará um array para o result
        try {
            const result = await app.services.user.save(req.body);
            return res.status(201).json(result[0]);
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
