import { Request, Response } from 'express';
import { createUser, findUser, userExist } from '../../model/user/user.model';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateUserDto, LoginUserDto } from '../../dto/user.dto';
import { generateToken } from '../../utils/token';
import { comparePassword } from '../../utils/bcrypt.helper';

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: Validation failed
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */
export const signup = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const dto = plainToInstance(CreateUserDto, req.body);
		await validateOrReject(dto);

		const { email, password, username } = dto;
		const user = await userExist(email);

		if (user) {
			return res.status(409).json({
				statusCode: 409,
				success: false,
				message: 'User already exists',
			});
		}

		const newUser = await createUser({ email, username, password });

		return res.status(201).json({
			statusCode: 201,
			success: true,
			data: newUser,
		});
	} catch (error) {
		if (Array.isArray(error)) {
			const errors = error.map((e: ValidationError) => ({
				property: e.property,
				constraints: e.constraints,
			}));

			return res.status(400).json({
				statusCode: 400,
				success: false,
				message: 'Validation failed',
				errors,
			});
		}

		console.error(error);
		return res.status(500).json({
			statusCode: 500,
			success: false,
			message: 'Internal Server Error',
		});
	}
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64ab2b7edda57a55be21a798
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     username:
 *                       type: string
 *                       example: johndoe
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid email or password
 *       404:
 *         description: User not found
 */

export const login = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const loginDto = plainToInstance(LoginUserDto, req.body);
		await validateOrReject(loginDto);

		const { email, password } = loginDto;

		const checkUser = await userExist(email);
		if (!checkUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		const user = await findUser(email);

		const isMatch = await comparePassword(password, user?.password!);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const token = generateToken({ id: user?._id, email: user?.email });

		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				id: user?._id,
				email: user?.email,
				username: user?.username,
			},
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Invalid input',
			errors: Array.isArray(error)
				? error.map((e) => ({
						property: e.property,
						constraints: e.constraints,
				  }))
				: error instanceof Error
				? error.message
				: 'Internal Server Error',
		});
	}
};
