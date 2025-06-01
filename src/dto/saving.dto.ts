import {
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

export class CreateSavingGoalDto {
	@IsMongoId()
	@IsNotEmpty()
	user!: ObjectId;

	@IsOptional()
	@IsString()
	title!: string;

	@IsOptional()
	@IsNumber()
	targetAmount!: number;

	@IsOptional()
	@IsNumber()
	currentAmount!: number;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	deadline?: Date;

	@IsOptional()
	@IsString()
	note?: string;
}

export class UpdateSavingGoalDto {
	@IsMongoId()
	@IsNotEmpty()
	user?: ObjectId;

	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsNumber()
	targetAmount?: number;

	@IsOptional()
	@IsNumber()
	currentAmount?: number;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	deadline?: Date;

	@IsOptional()
	@IsString()
	note?: string;
}
