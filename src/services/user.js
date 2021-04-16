const bcrypt = require('bcrypt');

const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select(['id', 'name', 'email']);
    };

    const findOne = (filter = {}) => {
        return app.db('users').where(filter).first();
    };

    const getPasswordHash = async (password) => {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    };

    const save = async (user) => {
        if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
        if (!user.email) throw new ValidationError('Email é um atributo obrigatório');
        if (!user.password) throw new ValidationError('Senha é um atributo obrigatório');

        const userDb = await findOne({ email: user.email });
        if (userDb) return { error: 'Já existe usuário cadastrado' };

        // eslint-disable-next-line no-param-reassign
        user.password = await getPasswordHash(user.password);
        return app.db('users').insert(user, ['id', 'name', 'email']);
    };

    return { findAll, findOne, save };
};
