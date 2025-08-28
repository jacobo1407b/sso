import swaggerUi from 'swagger-ui-express';
import SwaggerParser from "@apidevtools/swagger-parser";
import { Express } from 'express';



/*const swaggerDocument = YAML.load('./src/config/docs/swagger.yaml');
const swaggerSpec = swaggerJsdoc(options);*/

export async function setupSwagger(app: Express): Promise<void> {
  const swaggerDocument = await SwaggerParser.validate('./src/config/docs/swagger.yaml');
  const AUTH_HOST = process.env.URL_MAIN || 'https://auth.example.com';
  swaggerDocument.components.securitySchemes.OAuth2.flows.authorizationCode.authorizationUrl = `${AUTH_HOST}/oauth/authorize`;
  swaggerDocument.components.securitySchemes.OAuth2.flows.authorizationCode.tokenUrl = `${AUTH_HOST}/oauth/token`;
  swaggerDocument.components.securitySchemes.OAuth2.flows.clientCredentials.tokenUrl = `${AUTH_HOST}/oauth/token`;
  swaggerDocument.components.securitySchemes.OAuth2.flows.password.tokenUrl = `${AUTH_HOST}/oauth/token`;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}