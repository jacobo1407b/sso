import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';


const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SSO',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              tokenUrl: `${process.env.URL_MAIN}/oauth/token`,
              scopes: {}
            },
            password: {
              tokenUrl: `${process.env.URL_MAIN}/oauth/token`,
              scopes: {}
            },
          }
        }
      },
    }
  },
  apis: [process.cwd() + '/src/routes/*.ts'],
};


const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}