import express from 'express';
import 'dotenv/config';

import './model/setup/mongodb';
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
	res.end('welcome to task cyberia');
});

app.listen(port, () => {
	console.log(`---> server up on port:${port}`);
});
