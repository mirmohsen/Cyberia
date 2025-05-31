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

export class UpdateIncomeDto {
	@IsOptional()
	@IsMongoId()
	user?: string;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	amount?: number;

	@IsOptional()
	@IsString()
	source?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	date?: Date;

	@IsOptional()
	@IsString()
	note?: string;
}
