import { Type } from 'class-transformer';
import {
	IsDate,
	IsMongoId,
	IsNumber,
	isNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateIncomeDto {
	@IsMongoId()
	user!: ObjectId;

	@IsNumber()
	amount!: number;

	@IsString()
	@IsOptional()
	source?: string;

	@Type(() => Date)
	@IsDate()
	date!: Date;

	@IsString()
	@IsOptional()
	note?: string;
}
