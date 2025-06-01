import 'reflect-metadata';
import express from 'express';
import { swaggerSpec, swaggerUi } from './swagger.config';
import 'dotenv/config';
import router from './router/v1/router';

import './model/setup/mongodb';
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use('/api', router);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
	console.log(`---> server up on port:${port}`);
});
