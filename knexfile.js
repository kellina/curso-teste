module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: 'postgres',
            database: 'barriga',
            port: '5433',
        },
        migrations: {
            directory: 'src/migrations',
        },
    },
};
