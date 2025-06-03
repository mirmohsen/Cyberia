import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateSavingGoalDto, UpdateSavingGoalDto } from '../../dto/saving.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import {
	createSaving,
	deleteSavingById,
	exportSavingAsPDF,
	getSavingGoalsByUser,
	updateSavingById,
} from '../../model/finance/saving.model';
import mongoose, { Types } from 'mongoose';

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Saving goal management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSavingGoalDto:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         user:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "665a86311375f208fee1647c"
 *         title:
 *           type: string
 *           description: Title of the saving goal
 *           example: "Vacation Fund"
 *         targetAmount:
 *           type: number
 *           description: Target amount to save
 *           example: 5000
 *         currentAmount:
 *           type: number
 *           description: Amount already saved
 *           example: 1500
 *         deadline:
 *           type: string
 *           format: date
 *           description: Deadline to reach the goal
 *           example: "2025-12-31"
 *         note:
 *           type: string
 *           description: Optional note
 *           example: "Trip to Europe"
 *
 *     SavingResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665c44eabcf37ad9c25b2ddf"
 *         user:
 *           type: string
 *           example: "665a86311375f208fee1647c"
 *         title:
 *           type: string
 *           example: "Vacation Fund"
 *         targetAmount:
 *           type: number
 *           example: 5000
 *         currentAmount:
 *           type: number
 *           example: 1500
 *         deadline:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         note:
 *           type: string
 *           example: "Trip to Europe"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-02T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-02T10:00:00.000Z"
 *         __v:
 *           type: number
 *           example: 0
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "validation failed"
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
 * /saving/create:
 *   post:
 *     summary: Create a new saving goal
 *     tags: [Savings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSavingGoalDto'
 *     responses:
 *       201:
 *         description: Saving goal successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingResponse'
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
		const savingDto = plainToInstance(CreateSavingGoalDto, req.body);

		const errors = await validate(savingDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(savingDto.user);
		if (!userExists) {
			res.status(404).json({
				message: 'User ID does not exist',
			});
			return;
		}

		const createdSaving = await createSaving(savingDto);
		res.status(201).json(createdSaving);
	} catch (error) {
		console.error('Create income error:', error);
		next(error);
	}
};

/**
 * @swagger
 * tags:
 *   name: Savings
 *   description: Saving goals management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SavingGoal:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Buy a Laptop"
 *         targetAmount:
 *           type: number
 *           example: 1500
 *         currentAmount:
 *           type: number
 *           example: 400
 *         deadline:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T00:00:00.000Z"
 *         note:
 *           type: string
 *           example: "Saving for a MacBook"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:19:19.484Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:19:19.484Z"
 *         progress:
 *           type: number
 *           example: 27
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal server error"
 */

/**
 * @swagger
 * /saving/find/{userId}:
 *   get:
 *     summary: Get saving goals by user ID
 *     tags: [Savings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: "665e909713847e9d15f9c123"
 *     responses:
 *       200:
 *         description: List of saving goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SavingGoal'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */

export const finds = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.params.userId;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			res.status(400).json({ message: 'Invalid user ID' });
			return;
		}

		const goals = await getSavingGoalsByUser(userId);
		res.status(200).json(goals);
		return;
	} catch (error) {
		console.error('Error fetching saving goals:', error);
		next(error);
	}
};

/**
 * @swagger
 * /saving/update:
 *   put:
 *     summary: Update a saving goal
 *     tags: [Savings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - savingId
 *             properties:
 *               savingId:
 *                 type: string
 *                 description: The ID of the saving goal to update
 *                 example: "665e909713847e9d15f9c456"
 *               user:
 *                 type: string
 *                 description: ID of the user (optional)
 *                 example: "665e909713847e9d15f9c123"
 *               title:
 *                 type: string
 *                 description: Title of the saving goal
 *                 example: "Emergency Fund"
 *               targetAmount:
 *                 type: number
 *                 description: Target amount to save
 *                 example: 5000
 *               currentAmount:
 *                 type: number
 *                 description: Current amount saved
 *                 example: 1200
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Deadline for the saving goal
 *                 example: "2025-12-31T00:00:00.000Z"
 *               note:
 *                 type: string
 *                 description: Additional notes
 *                 example: "Top priority goal"
 *     responses:
 *       200:
 *         description: Saving goal successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavingGoal'
 *       400:
 *         description: Missing saving ID or validation failed
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Savings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "665e909713847e9d15f9c456"
 *         user:
 *           type: string
 *           example: "665e909713847e9d15f9c123"
 *         title:
 *           type: string
 *           example: "Emergency Fund"
 *         targetAmount:
 *           type: number
 *           example: 5000
 *         currentAmount:
 *           type: number
 *           example: 1200
 *         deadline:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T00:00:00.000Z"
 *         note:
 *           type: string
 *           example: "Top priority goal"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-01T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-02T15:00:00.000Z"
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal server error"
 */

export const update = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const savingId = req.body.savingId;
		if (!savingId) {
			res.status(400).json({ message: 'Missing saving ID' });
			return;
		}

		const dto = plainToInstance(UpdateSavingGoalDto, req.body);
		const errors = await validate(dto);
		if (errors.length > 0) {
			res.status(400).json({ message: 'Validation failed', errors });
			return;
		}

		const updatedSaving = await updateSavingById(savingId, dto);

		res.status(200).json(updatedSaving);
	} catch (error) {
		console.error('Update saving error:', error);
		next(error);
	}
};

/**
 * @swagger
 * /saving/remove/{savingId}:
 *   delete:
 *     summary: Delete a saving goal by ID
 *     tags: [Savings]
 *     parameters:
 *       - in: path
 *         name: savingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the saving goal to delete
 *         example: "665e909713847e9d15f9c456"
 *     responses:
 *       200:
 *         description: Saving goal successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Saving goal deleted
 *                 data:
 *                   $ref: '#/components/schemas/SavingGoal'
 *       400:
 *         description: Missing or invalid saving ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing or invalid saving ID
 *       404:
 *         description: Saving goal not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Saving goal not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */

export const deleteSaving = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const savingIdParam = req.params.savingId;

		if (!savingIdParam || typeof savingIdParam !== 'string') {
			res.status(400).json({ message: 'Missing or invalid saving ID' });
			return;
		}

		const savingObjectId = new Types.ObjectId(savingIdParam);

		const deletedSaving = await deleteSavingById(savingObjectId);
		if (!deletedSaving) {
			res.status(404).json({ message: 'Saving goal not found' });
			return;
		}

		res
			.status(200)
			.json({ message: 'Saving goal deleted', data: deletedSaving });
		return;
	} catch (error) {
		console.error('Delete Saving error:', error);
		next(error);
	}
};

export async function exportSavingReport(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const userId = req.query.userId as string;
		if (!userId) {
			res.status(400).json({ message: 'Missing userId' });
			return;
		}

		const filters = {
			title: req.query.title as string,
			minTargetAmount: req.query.minTargetAmount
				? Number(req.query.minTargetAmount)
				: undefined,
			maxTargetAmount: req.query.maxTargetAmount
				? Number(req.query.maxTargetAmount)
				: undefined,
			minCurrentAmount: req.query.minCurrentAmount
				? Number(req.query.minCurrentAmount)
				: undefined,
			maxCurrentAmount: req.query.maxCurrentAmount
				? Number(req.query.maxCurrentAmount)
				: undefined,
			startDeadline: req.query.startDeadline as string,
			endDeadline: req.query.endDeadline as string,
		};

		const pdfBuffer = await exportSavingAsPDF(userId, filters);

		res.set({
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'attachment; filename="saving-report.pdf"',
		});
		res.send(pdfBuffer);
	} catch (error) {
		console.error('Export PDF error:', error);
		res.status(500).json({ message: 'Failed to export saving report' });
		next(error);
	}
}
