import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common/decorators';
import { Request } from 'express';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { UserService } from 'src/services/user.service';
import { User } from 'src/models/user.model';
import { UpdateUserProfileDto } from 'src/dtos/requests/user/updateUserProfile.dto';

@Controller('user-profiles')
export class UserProfileController {
	constructor(private readonly userService: UserService) {}

	@Put()
	async updateUserSystem(@Req() req: Request, @Body() data: UpdateUserProfileDto): Promise<void | any> {
		const { userId } = req['user'] as IUserAuth;
		return this.userService.updateUserProfile(userId, data);
	}

	@Get()
	async getUserProfileById(@Req() req: Request, @Param('id') id: number): Promise<User> {
		const { userId } = req['user'] as IUserAuth;
		return this.userService.getUserProfileById(userId);
	}
}
