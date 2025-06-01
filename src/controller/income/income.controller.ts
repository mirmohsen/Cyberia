import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateIncomeDto, UpdateIncomeDto } from '../../dto/income.dto';
import {
	createIncome,
	deleteIncomeById,
	findIncomes,
	updateIncomeById,
} from '../../model/finance/income.model';
import { userExistById } from '../../model/user/user.model';
import { Types } from 'mongoose';

/**
 * @swagger
 * tags:
 *   name: Incomes
 *   description: Income management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateIncomeDto:
 *       type: object
 *       required:
 *         - user
 *         - amount
 *         - date
 *       properties:
 *         user:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "683a86311375f208fee1647c"
 *         amount:
 *           type: number
 *           description: Income amount
 *           example: 1331111
 *         source:
 *           type: string
 *           description: Income source (optional)
 *           example: "Freelance"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of income
 *           example: "2025-05-30T00:00:00.000Z"
 *         note:
 *           type: string
 *           description: Optional note for income
 *           example: "Client paid for May project"
 *
 *     IncomeResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "683a86311375f208fee1647c"
 *             email:
 *               type: string
 *               example: "new@gmail.com"
 *             username:
 *               type: string
 *               example: "test1"
 *             password:
 *               type: string
 *               example: "$2b$10$83UhOMt9I4eCjKbMYLw5Ne41WqI9Q2cM0G.pdD6YxuE9SXpvwv9LO"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2025-05-31T04:31:45.189Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2025-05-31T04:31:45.189Z"
 *             __v:
 *               type: number
 *               example: 0
 *         amount:
 *           type: number
 *           example: 1331111
 *         source:
 *           type: string
 *           example: "Freelance"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-05-30T00:00:00.000Z"
 *         note:
 *           type: string
 *           example: "Client paid for May project"
 *         _id:
 *           type: string
 *           example: "683c4547584c8d0b879d45a4"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:19:19.484Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:19:19.484Z"
 *         __v:
 *           type: number
 *           example: 0
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties:
 *               type: string
 *
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "User ID does not exist"
 */

/**
 * @swagger
 * /incomes:
 *   post:
 *     summary: Create a new income record
 *     tags: [Incomes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIncomeDto'
 *     responses:
 *       201:
 *         description: Income successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncomeResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: User ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 */
export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const incomeDto = plainToInstance(CreateIncomeDto, req.body);

		const errors = await validate(incomeDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'Validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(incomeDto.user);
		if (!userExists) {
			res.status(404).json({ message: 'User ID does not exist' });
			return;
		}

		const createdIncome = await createIncome(incomeDto);
		res.status(201).json(createdIncome);
	} catch (error) {
		console.error('Create income error:', error);
		next(error);
	}
};

/**
 * @swagger
 * tags:
 *   name: Incomes
 *   description: Income management endpoints
 *
 * components:
 *   parameters:
 *     UserIdQueryParam:
 *       in: query
 *       name: userId
 *       required: true
 *       schema:
 *         type: string
 *         example: "683a86311375f208fee1647c"
 *       description: MongoDB ObjectId of the user
 *     PageQueryParam:
 *       in: query
 *       name: page
 *       required: false
 *       schema:
 *         type: integer
 *         default: 1
 *         example: 1
 *       description: Page number for pagination
 *     LimitQueryParam:
 *       in: query
 *       name: limit
 *       required: false
 *       schema:
 *         type: integer
 *         default: 10
 *         example: 10
 *       description: Number of items per page
 *     SourceQueryParam:
 *       in: query
 *       name: source
 *       required: false
 *       schema:
 *         type: string
 *         example: "Freelance"
 *       description: Filter incomes by source
 *     MinAmountQueryParam:
 *       in: query
 *       name: minAmount
 *       required: false
 *       schema:
 *         type: number
 *         example: 1000
 *       description: Minimum amount filter
 *     MaxAmountQueryParam:
 *       in: query
 *       name: maxAmount
 *       required: false
 *       schema:
 *         type: number
 *         example: 5000
 *       description: Maximum amount filter
 *     StartDateQueryParam:
 *       in: query
 *       name: startDate
 *       required: false
 *       schema:
 *         type: string
 *         format: date-time
 *         example: "2025-01-01T00:00:00.000Z"
 *       description: Start date filter
 *     EndDateQueryParam:
 *       in: query
 *       name: endDate
 *       required: false
 *       schema:
 *         type: string
 *         format: date-time
 *         example: "2025-12-31T23:59:59.000Z"
 *       description: End date filter
 *
 *   schemas:
 *     IncomeSummary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "683ad4664579583e0a437e92"
 *         title:
 *           type: string
 *           example: "Buy a new laptop"
 *         targetAmount:
 *           type: number
 *           example: 1500
 *         currentAmount:
 *           type: number
 *           example: 300
 *         deadline:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T23:59:59.000Z"
 *         note:
 *           type: string
 *           example: "Saving monthly from salary"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-31T10:05:26.373Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-31T10:05:26.373Z"
 *         progress:
 *           type: number
 *           example: 20
 *
 *     PaginatedIncomeResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IncomeSummary'
 *
 *     InvalidUserIdResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Invalid or missing userId"
 */

/**
 * @swagger
 * /incomes:
 *   get:
 *     summary: Get paginated income records filtered by query parameters
 *     tags: [Incomes]
 *     parameters:
 *       - $ref: '#/components/parameters/UserIdQueryParam'
 *       - $ref: '#/components/parameters/PageQueryParam'
 *       - $ref: '#/components/parameters/LimitQueryParam'
 *       - $ref: '#/components/parameters/SourceQueryParam'
 *       - $ref: '#/components/parameters/MinAmountQueryParam'
 *       - $ref: '#/components/parameters/MaxAmountQueryParam'
 *       - $ref: '#/components/parameters/StartDateQueryParam'
 *       - $ref: '#/components/parameters/EndDateQueryParam'
 *     responses:
 *       200:
 *         description: Paginated income records
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedIncomeResponse'
 *       400:
 *         description: Invalid or missing userId query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvalidUserIdResponse'
 */
export const finds = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const userIdParam = req.query.userId;
		if (!userIdParam || typeof userIdParam !== 'string') {
			res.status(400).json({ message: 'Invalid or missing userId' });
			return;
		}

		const userId = userIdParam;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const filters = {
			source: req.query.source as string,
			minAmount: req.query.minAmount
				? parseFloat(req.query.minAmount as string)
				: undefined,
			maxAmount: req.query.maxAmount
				? parseFloat(req.query.maxAmount as string)
				: undefined,
			startDate: req.query.startDate
				? new Date(req.query.startDate as string)
				: undefined,
			endDate: req.query.endDate
				? new Date(req.query.endDate as string)
				: undefined,
		};

		const result = await findIncomes(userId, page, limit, filters);
		res.status(200).json(result);
	} catch (error) {
		console.error('Controller error in finds:', error);
		next(error);
	}
};

/**
 * @swagger
 * tags:
 *   name: Incomes
 *   description: Income management endpoints
 *
 * components:
 *   schemas:
 *     UpdateIncomeDto:
 *       type: object
 *       required:
 *         - incomeId
 *       properties:
 *         incomeId:
 *           type: string
 *           description: MongoDB ObjectId of the income to update
 *           example: "683c4547584c8d0b879d45a4"
 *         user:
 *           type: string
 *           description: (Optional) MongoDB ObjectId of the user
 *           example: "683a86311375f208fee1647c"
 *         amount:
 *           type: number
 *           description: (Optional) Updated income amount
 *           example: 1500000
 *         source:
 *           type: string
 *           description: (Optional) Updated income source
 *           example: "Contract"
 *         date:
 *           type: string
 *           format: date-time
 *           description: (Optional) Updated income date
 *           example: "2025-06-15T00:00:00.000Z"
 *         note:
 *           type: string
 *           description: (Optional) Updated note
 *           example: "Adjusted after client revision"
 *
 *     IncomeResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "683a86311375f208fee1647c"
 *             email:
 *               type: string
 *               example: "new@gmail.com"
 *             username:
 *               type: string
 *               example: "test1"
 *             password:
 *               type: string
 *               example: "$2b$10$83UhOMt9I4eCjKbMYLw5Ne41WqI9Q2cM0G.pdD6YxuE9SXpvwv9LO"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2025-05-31T04:31:45.189Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2025-05-31T04:31:45.189Z"
 *             __v:
 *               type: number
 *               example: 0
 *         amount:
 *           type: number
 *           example: 1500000
 *         source:
 *           type: string
 *           example: "Contract"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-06-15T00:00:00.000Z"
 *         note:
 *           type: string
 *           example: "Adjusted after client revision"
 *         _id:
 *           type: string
 *           example: "683c4547584c8d0b879d45a4"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-31T04:31:45.189Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-15T12:00:00.000Z"
 *         __v:
 *           type: number
 *           example: 0
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             additionalProperties:
 *               type: string
 *
 *     NotFoundOrBadRequestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Missing income ID"
 *
 * /incomes:
 *   put:
 *     summary: Update an existing income record
 *     tags: [Incomes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIncomeDto'
 *     responses:
 *       200:
 *         description: Income successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IncomeResponse'
 *       400:
 *         description: Validation failed or missing incomeId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Income not found or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundOrBadRequestResponse'
 */

export const update = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const incomeId = req.body.incomeId;
		if (!incomeId) {
			res.status(400).json({ message: 'Missing income ID' });
			return;
		}

		const dto = plainToInstance(UpdateIncomeDto, req.body);
		const errors = await validate(dto);
		if (errors.length > 0) {
			res.status(400).json({ message: 'Validation failed', errors });
			return;
		}

		const updatedIncome = await updateIncomeById(incomeId, dto);

		res.status(200).json(updatedIncome);
	} catch (error) {
		console.error('Update income error:', error);
		next(error);
	}
};

/**
 * @swagger
 * /incomes:
 *   delete:
 *     summary: Delete an income by ID
 *     tags: [Incomes]
 *     parameters:
 *       - in: query
 *         name: incomeId
 *         required: true
 *         schema:
 *           type: string
 *           description: MongoDB ObjectId of the income to delete
 *           example: "683c4547584c8d0b879d45a4"
 *     responses:
 *       200:
 *         description: Income successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income deleted
 *       400:
 *         description: Missing or invalid income ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid income ID
 *       500:
 *         description: Server error
 */
export const deleteIncome = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const incomeIdParam = req.query.incomeId;

		if (!incomeIdParam || typeof incomeIdParam !== 'string') {
			res.status(400).json({ message: 'Missing or invalid income ID' });
			return;
		}

		const incomeId = new Types.ObjectId(incomeIdParam);

		const deletedIncome = await deleteIncomeById(incomeId);

		res.status(200).json({ message: 'Income deleted' });
		return;
	} catch (error) {
		console.error('Delete Income error:', error);
		next(error);
	}
};
