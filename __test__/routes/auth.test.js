const request = require('supertest');
const app = require('../../src/app');

test('Deve criar usuário via signup', () => {
    return request(app)
        .post('/auth/signup')
        .send({
            name: 'Walter',
            email: `${Date.now()}@mail.com`,
            password: '123456',
        })
        .then((resp) => {
            expect(resp.status).toBe(201);
            expect(resp.body.name).toBe('Walter');
            expect(resp.body).toHaveProperty('email');
            expect(resp.body).not.toHaveProperty('password');
        });
});

test('Deve receber token ao logar', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user
        .save({ name: 'Walter', email: mail, password: '123456' })
        .then(() => request(app)
            .post('/auth/signin')
            .send({ email: mail, password: '123456' }))
        .then((resp) => {
            expect(resp.status).toBe(200);
            expect(resp.body).toHaveProperty('token');
        });
});

test('Não deve autenticar usuário com senha errada', () => {
    const mail = `${Date.now()}@mail.com`;
    return app.services.user
        .save({ name: 'Walter', email: mail, password: '123456' })
        .then(() => request(app)
            .post('/auth/signin')
            .send({ email: mail, password: '654321' }))
        .then((resp) => {
            expect(resp.status).toBe(400);
            expect(resp.body.error).toBe('usuário ou senha inválido.');
        });
});

test('Não deve autenticar usuário que não existe', () => {
    return request(app)
        .post('/auth/signin')
        .send({ email: 'naoexiste@mail.com', password: '654321' })
        .then((resp) => {
            expect(resp.status).toBe(400);
            expect(resp.body.error).toBe('usuário ou senha inválido.');
        });
});

test('Não deve acessar uma rota protegida sem token', () => {
    return request(app)
        .get('/v1/users')
        .then((resp) => {
            expect(resp.status).toBe(401);
        });
});
