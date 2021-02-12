const request = require('supertest');
const app = require('../../src/app');

const mail = `${Date.now()}@mail.com`;
// O request(app) retorna uma promise que pode ser tratada usando o .then

test('Deve listar todos os usuários', () => {
    return request(app).get('/users')
        .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('Deve iserir usuário com sucesso', () => {
    return request(app).post('/users')
        .send({ name: 'Walter Mitty', email: mail, password: '123456' })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Walter Mitty');
        });
});

test('Não deve inserir usuário sem nome', () => {
    return request(app).post('/users')
        .send({ email: mail, password: '123456' })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Nome é um atributo obrigatório');
        });
});

// Outra forma de tratar a promise é com async await
test('Não deve inserir usuário sem email', async () => {
    const result = await request(app).post('/users')
        .send({ name: 'Walter Mitty', password: '123456' });
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usuario sem senha', (done) => {
    request(app).post('/users')
        .send({ name: 'Walter Mitty', email: mail })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Senha é um atributo obrigatório');
            done();
        });
});

test('Não deve inserir usuário com email existente', () => {
    return request(app).post('/users')
        .send({ name: 'Walter Mitty', email: mail, password: '123456' })
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Já existe usuário cadastrado');
        });
});
