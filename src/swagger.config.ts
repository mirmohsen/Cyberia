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
				url: 'http://localhost:8000/api',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
			schemas: {
				Expense: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							example: '665e909713847e9d15f9c37d',
						},
						user: {
							type: 'string',
							example: '665e909713847e9d15f9c123',
						},
						amount: {
							type: 'number',
							example: 1500,
						},
						description: {
							type: 'string',
							example: 'Grocery shopping',
						},
						date: {
							type: 'string',
							format: 'date-time',
							example: '2024-06-01T00:00:00.000Z',
						},
						note: {
							type: 'string',
							example: 'Bought from local market',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							example: '2024-06-01T10:00:00.000Z',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							example: '2024-06-01T12:00:00.000Z',
						},
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: [
		'./src/router/v1/*.ts',
		'./src/controller/*/*.ts',
		'./src/model/*/*.ts',
	],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
