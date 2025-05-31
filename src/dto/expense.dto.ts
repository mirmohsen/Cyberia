import { Type } from 'class-transformer';
import {
	IsDate,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateExpenseDto {
	@IsMongoId()
	user!: ObjectId;

	@IsNumber()
	amount!: number;

	@IsString()
	description!: string;

	@Type(() => Date)
	@IsDate()
	date!: Date;

	@IsString()
	@IsOptional()
	note?: string;
}

export class UpdateExpenseDto {
	@IsOptional()
	@IsMongoId()
	user?: string;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	amount?: number;

	@IsString()
	description?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	date?: Date;

	@IsOptional()
	@IsString()
	note?: string;
}
