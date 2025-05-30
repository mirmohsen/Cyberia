import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1];

	if (!token) {
		res.status(401).json({
			statusCode: 401,
			success: false,
			message: 'Access token is missing',
		});
		return;
	}

	try {
		const user = jwt.verify(token, JWT_SECRET);
		(req as any).user = user;
		next();
	} catch (err) {
		res.status(403).json({
			statusCode: 403,
			success: false,
			message: 'Invalid or expired token',
		});
	}
};
