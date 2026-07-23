import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Win-o-Learn API',
    description: 'API documentation for Win-o-Learn Hackathon Platform',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
