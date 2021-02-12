// Esse objeto vai encapsular os problemas (erros) que terei na aplicação

module.exports = function ValidationError(message) {
    this.name = 'ValidationError';
    this.message = message;
};
