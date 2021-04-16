const jwt = require('jwt-simple');
const express = require('express');
const bcrypt = require('bcrypt');
const ValidationError = require('../errors/ValidationError');

const secret = 'secret!';

module.exports = (app) => {
    const router = express.Router();

    router.post('/signin', (req, res, next) => {
        app.services.user.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) throw new ValidationError('usuário ou senha inválido.');
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    const payload = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    };
                    const token = jwt.encode(payload, secret);
                    res.status(200).json({ token });
                } else throw new ValidationError('usuário ou senha inválido.');
            }).catch((error) => next(error));
    });

    router.post('/signup', async (req, res, next) => {
        try {
            const result = await app.services.user.save(req.body);
            return res.status(201).json(result[0]);
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
