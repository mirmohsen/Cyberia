import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateExpenseDto, UpdateExpenseDto } from '../../dto/expense.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import {
	createExpense,
	deleteExpeneseById,
	exportExpenseAsPDF,
	findExpense,
	updateExpenseById,
} from '../../model/finance/expense.model';
import { Types } from 'mongoose';

/**
 * @swagger
 * /expense/create:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - amount
 *               - description
 *               - date
 *             properties:
 *               user:
 *                 type: string
 *                 format: ObjectId
 *                 description: ID of the user creating the expense
 *                 example: "664a6f98c1f4fc36a0f843a2"
 *               amount:
 *                 type: number
 *                 description: Expense amount
 *                 example: 150.75
 *               description:
 *                 type: string
 *                 description: Description of the expense
 *                 example: "Groceries"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the expense
 *                 example: "2025-06-01T10:00:00.000Z"
 *               note:
 *                 type: string
 *                 description: Optional note about the expense
 *                 example: "Weekly shopping at local market"
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "683c5fdddf4c1c5748f2344e"
 *                 user:
 *                   type: string
 *                   example: "664a6f98c1f4fc36a0f843a2"
 *                 amount:
 *                   type: number
 *                   example: 150.75
 *                 description:
 *                   type: string
 *                   example: "Groceries"
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-01T10:00:00.000Z"
 *                 note:
 *                   type: string
 *                   example: "Weekly shopping at local market"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties:
 *                       type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User ID does not exist
 *       500:
 *         description: Server error
 */
export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const expenseDto = plainToInstance(CreateExpenseDto, req.body);

		const errors = await validate(expenseDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'Validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(expenseDto.user);
		if (!userExists) {
			res.status(404).json({
				message: 'User ID does not exist',
			});
			return;
		}

		const createdExpense = await createExpense(expenseDto);
		res.status(201).json(createdExpense);
	} catch (error) {
		console.error('Create expense error', error);
		next(error);
	}
};

/**
 * @swagger
 * /expense/find:
 *   get:
 *     summary: Get expenses by user with optional filters
 *     tags: [Expenses]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *         example: "6652ff493f2e2e2aa0d5b4d1"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount filter
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (inclusive)
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (inclusive)
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Filtered expenses list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 23
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "664cfd2598b9b1a0b92e30fa"
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "6652ff493f2e2e2aa0d5b4d1"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                       amount:
 *                         type: number
 *                         example: 75.50
 *                       description:
 *                         type: string
 *                         example: "Lunch at cafe"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-01T12:00:00.000Z"
 *                       note:
 *                         type: string
 *                         example: "Client meeting"
 *       400:
 *         description: Missing or invalid userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or missing userId
 *       500:
 *         description: Server error
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

		const result = await findExpense(userId, page, limit, filters);
		res.status(200).json(result);
	} catch (error) {
		console.error('Controller error in finds:', error);
		next(error);
	}
};

/**
 * @swagger
 * /expense/update:
 *   put:
 *     summary: Update an existing expense
 *     description: Updates an expense record by its ID. The ID must be provided in the body as `expenseId`.
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expenseId
 *               - description
 *             properties:
 *               expenseId:
 *                 type: string
 *                 description: The ID of the expense to update
 *                 example: 665e909713847e9d15f9c37d
 *               user:
 *                 type: string
 *                 description: User ID (MongoDB ObjectId)
 *                 example: 665e909713847e9d15f9c123
 *               amount:
 *                 type: number
 *                 example: 1500
 *               description:
 *                 type: string
 *                 example: Grocery shopping
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-01T00:00:00.000Z
 *               note:
 *                 type: string
 *                 example: Bought from local market
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Missing or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */

export const update = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const expenseId = req.body.expenseId;
		if (!expenseId) {
			res.status(400).json({ message: 'Missing income ID' });
			return;
		}

		const dto = plainToInstance(UpdateExpenseDto, req.body);
		const errors = await validate(dto);
		if (errors.length > 0) {
			res.status(400).json({ message: 'Validation failed', errors });
			return;
		}

		const updatedIncome = await updateExpenseById(expenseId, dto);

		res.status(200).json(updatedIncome);
	} catch (error) {
		console.error('Update income error:', error);
		next(error);
	}
};

/**
 * @swagger
 * /expense/remove:
 *   delete:
 *     summary: Delete an expense
 *     tags:
 *       - Expenses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expenseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the expense to delete
 *         example: 664d8e76fc13ae5a3f000001
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: expense deleted
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Missing or invalid expense ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export const deleteExpense = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const expenseIdParam = req.query.expenseId;

		if (!expenseIdParam || typeof expenseIdParam !== 'string') {
			res.status(400).json({ message: 'Missing or invalid expense ID' });
			return;
		}

		const expenseId = new Types.ObjectId(expenseIdParam);

		const deleteExpense = await deleteExpeneseById(expenseId);

		res.status(200).json({ message: 'expense deleted', data: deleteExpense });
		return;
	} catch (error) {
		console.error('Delete Income error:', error);
		next(error);
	}
};

export async function handleExportExpensePDF(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const userId = typeof req.query.userId === 'string' ? req.query.userId : '';

		if (!userId || !Types.ObjectId.isValid(userId)) {
			res.status(400).json({ message: 'Invalid user ID' });
			return;
		}

		const filters = {
			minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
			maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
			startDate:
				typeof req.query.startDate === 'string'
					? req.query.startDate
					: undefined,
			endDate:
				typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
		};

		const pdfBuffer = await exportExpenseAsPDF(userId, filters);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'attachment; filename=expense.pdf');
		res.send(pdfBuffer);
	} catch (error) {
		console.error('Failed to export expense PDF:', error);
		res.status(500).json({ message: 'Internal Server Error' });
		next(error);
	}
}
