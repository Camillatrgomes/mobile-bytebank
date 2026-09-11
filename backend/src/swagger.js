const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Contas',
      version: '1.0.0',
      description: 'Documentação da API de Contas',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
    
      }
    },
    security: [
      {
        BearerAuth: [], // Define que toda rota utilizará este esquema como padrão
      },
    ],
    // URL relativa: o Swagger UI resolve contra a origem que serviu /docs,
    // então funciona tanto em localhost quanto no ambiente publicado (Azure)
    // sem precisar chumbar host. Um SWAGGER_SERVER_URL pode sobrescrever.
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || '/',
        description: 'Servidor',
      },
    ],
  },
  apis: ['./src/routes.js'], // arquivos que contêm anotações do swagger
};

const specs = swaggerJsdoc(options);
module.exports = specs;