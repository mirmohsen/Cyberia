import { Schema, model } from 'mongoose';
import { CreateUserDto } from '../../dto/user.dto';
import { hashPassword } from '../../utils/bcrypt.helper';

export const UserSchema = new Schema(
	{
		email: String,
		username: String,
		password: String,
	},
	{ timestamps: true }
);

const userModel = model('User', UserSchema);

export async function userExist(email: string): Promise<boolean> {
	const find = await userModel.findOne({ email });
	return !!find;
}

export async function createUser(createUserDto: CreateUserDto) {
	const hashed = await hashPassword(createUserDto.password);
	const create = await userModel.create({ ...createUserDto, password: hashed });
	return create;
}
