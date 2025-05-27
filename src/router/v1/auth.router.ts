import express from 'express';
import { signup } from '../../controller/user/user.controller';

const router = express.Router();

router.post('/signup', signup as express.RequestHandler);

export default router;
