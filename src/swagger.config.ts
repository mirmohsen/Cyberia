import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Cyberia',
			version: '1.0.0',
			description: 'API documentation for finance project',
		},
		servers: [
			{
				url: 'http://localhost:8000/api-docs',
			},
		],
	},
	apis: ['./src/router/v1/*.ts', './src/controller/*/*.ts', './src/model/*/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
