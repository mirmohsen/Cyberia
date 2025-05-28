import express from 'express';
import { login, signup } from '../../controller/user/user.controller';

const router = express.Router();

router.post('/signup', signup as express.RequestHandler);
router.post('/login', login as express.RequestHandler);


export default router;
