const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

// Para criar usuario e conta
const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
    // Limpar as tabelas para depois inserir dados
    await app.db('transactions').del();
    await app.db('accounts').del();
    await app.db('users').del();
    const users = await app.db('users').insert(
        [
            {
                name: 'User #1',
                email: 'user@mail.com',
                password:
                    '$2b$10$lB5JHg2rE3ET8YolJ3Ds8OOhI.DbNjWYQceQKaJeBflvepNkA8w0O',
            },
            {
                name: 'User #2',
                email: 'user2@mail.com',
                password:
                    '$2b$10$lB5JHg2rE3ET8YolJ3Ds8OOhI.DbNjWYQceQKaJeBflvepNkA8w0O',
            },
        ],
        '*',
    );
    [user, user2] = users;

    delete user.password;
    user.token = jwt.encode(user, 'Segredo');

    const accs = await app.db('accounts').insert(
        [
            { name: 'Acc #1', user_id: user.id },
            { name: 'Acc #2', user_id: user2.id },
        ],
        '*',
    );
    [accUser, accUser2] = accs;
});

test('Deve listar apenas as transações do usuário', () => {
    // Para isso eu preciso ter: 2 usuários, 2 contas e pelo menos 2 transações
    return app
        .db('transactions')
        .insert([
            {
                description: 'T1',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser.id,
            },
            {
                description: 'T2',
                date: new Date(),
                amount: 300,
                type: 'O',
                acc_id: accUser2.id,
            },
        ])
        .then(() => request(app)
            .get(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.body).toHaveLength(1);
                expect(res.body[0].description).toBe('T1');
            }));
});

test('Deve inserir uma transação com sucesso', () => {
    return request(app)
        .post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new T',
            date: new Date(),
            amount: 100,
            type: 'I',
            acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser.id);
            expect(res.body.amount).toBe('100.00');
        });
});

test('Transações de entrada devem ser positivas', () => {
    return request(app)
        .post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new T',
            date: new Date(),
            amount: -100,
            type: 'I',
            acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser.id);
            expect(res.body.amount).toBe('100.00');
        });
});

test('Transações de saída devem ser negativas', () => {
    return request(app)
        .post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new T',
            date: new Date(),
            amount: 100,
            type: 'O',
            acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toBe(201);
            expect(res.body.acc_id).toBe(accUser.id);
            expect(res.body.amount).toBe('-100.00');
        });
});

describe('Ao tentar inserir uma transação inválida', () => {
    const testTemplate = (newData, errorMessage) => {
        return request(app)
            .post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({
                description: 'new T',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser.id,
                ...newData,
            })
            .then((res) => {
                expect(res.status).toBe(400);
                expect(res.body.error).toBe(errorMessage);
            });
    };

    test('Não deve inserir sem descrição', () => testTemplate({ description: null }, 'Descrição é um atributo obrigatório'));
    test('Não deve inserir sem valor', () => testTemplate({ amount: null }, 'Valor é um atributo obrigatório'));

    test('Não deve inserir uma transação sem data', () => testTemplate({ date: null }, 'Data é um atributo obrigatório'));
    test('Não deve inserir uma transação sem conta', () => testTemplate({ acc_id: null }, 'Conta é um atributo obrigatório'));
    test('Não deve inserir uma transação sem tipo', () => testTemplate({ type: null }, 'Tipo é um atributo obrigatório'));
    test('Não deve inserir uma transação com tipo inválido', () => testTemplate({ type: 'A' }, 'Tipo inválido'));
});

test('Deve retornar uma transação por ID', () => {
    return app
        .db('transactions')
        .insert(
            {
                description: 'T ID',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser.id,
            },
            ['id'],
        )
        .then((trans) => request(app)
            .get(`${MAIN_ROUTE}/${trans[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.body.id).toBe(trans[0].id);
                expect(res.body.description).toBe('T ID');
            }));
});

test('Deve alterar uma transação', () => {
    return app
        .db('transactions')
        .insert(
            {
                description: 'to update',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser.id,
            },
            ['id'],
        )
        .then((trans) => request(app)
            .put(`${MAIN_ROUTE}/${trans[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .send({ description: 'updated' })
            .then((res) => {
                expect(res.status).toBe(200);
                expect(res.body.description).toBe('updated');
            }));
});

test('Deve remover uma transação', () => {
    return app
        .db('transactions')
        .insert(
            {
                description: 'to delete',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser.id,
            },
            ['id'],
        )
        .then((trans) => request(app)
            .delete(`${MAIN_ROUTE}/${trans[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(204);
            }));
});

test('Não deve manipular uma transição de outro usuário', () => {
    return app
        .db('transactions')
        .insert(
            {
                description: 'to delete',
                date: new Date(),
                amount: 100,
                type: 'I',
                acc_id: accUser2.id,
            },
            ['id'],
        )
        .then((trans) => request(app)
            .delete(`${MAIN_ROUTE}/${trans[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .then((res) => {
                expect(res.status).toBe(403);
                expect(res.body.error).toBe(
                    'Este recurso não pertence ao usuário',
                );
            }));
});