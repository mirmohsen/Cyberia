import mongoose from 'mongoose';
import 'dotenv/config';

// import { mongo } from './config.js';

// const { url, option } = mongo;

// mongoose.connect(url, option);
const mongo = {
	url: process.env.URL_MONGODB,
	option: {
		autoIndex: true,
	},
};

mongoose.connect(mongo.url ?? '', mongo.option);

mongoose.connection.on('error', (err) => {
	console.log(`====>> mongodb connection error: ${err}`);
});

mongoose.connection.once('open', () => {
	console.log(`====>> mongodb successfully connected!`);
});
