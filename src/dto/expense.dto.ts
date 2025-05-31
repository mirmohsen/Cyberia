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
