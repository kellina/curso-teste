module.exports = (app) => {
    const findAll = (req, res) => {
        // Consulta ao banco de dados usando o knex
        app.services.user.findAll()
            .then((result) => res.status(200).json(result));
    };

    const create = async (req, res) => {
        // O 2º param do insert é o return, o '*' signif que ira retonar tudo do body.
        // neste caso retornará um array para o result
        try {
            const result = await app.services.user.save(req.body);
            return res.status(201).json(result[0]);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    };

    return { findAll, create };
};
