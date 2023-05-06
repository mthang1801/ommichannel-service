import { Body, Controller, Get, HttpCode, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { SkipAuth } from 'src/common/guards/customMetadata';
import { SignInDto } from 'src/dtos/requests/auth/signIn.dto';
import { SignUpDto } from 'src/dtos/requests/auth/signup.dto';

import { ProviderTypeEnum } from 'src/common/constants/enum';

import { TransactionParam } from 'src/common/decorators/transaction-param.decorator';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';

import { ActivateAccountDto } from 'src/dtos/requests/auth/activateAccount.dto';
import { ReactivateAccountDto } from 'src/dtos/requests/auth/reactivateAccount.dto';
import { RecoveryAccountDto } from 'src/dtos/requests/auth/recoveryAccount.dto';

import messages from 'src/common/constants/messages';
import { SignInProviderDto } from 'src/dtos/requests/auth/signInGoogle.dto';
import { UpdatePwdRecoveryAccountDto } from 'src/dtos/requests/auth/updatePwdFromRecoveryAccount.dto';
import { SigninResponseDto } from 'src/dtos/responses/auth/signin.dto';
import { AuthService } from 'src/services/auth.service';

import { Query } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiBody, ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { urlConfig } from 'src/configs/configs';
import { IResponseMessage } from 'src/interfaces/responses/message.interface';
import { ICheckUserExist } from 'src/interfaces/user.interface';

@Controller('auth')
@ApiTags('Authentication')
@ApiBearerAuth('Authorization')
@ApiHeaders([
	{
		name: 'Authorization',
		description: 'Access Token',
		example: 'accessToken',
		required: true
	},
	{
		name: 'x-auth-uuid',
		example: 'xAuthUUID',
		required: true
	},
	{
		name: 'Content-Type',
		example: 'application/json'
	}
])
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@SkipAuth()
	@ApiOperation({ summary: 'Đăng ký tài khoản' })
	@ApiBody({ type: SignUpDto })
	@Post('signup')
	async signup(@Body() data: SignUpDto): Promise<{ message: string }> {
		await this.authService.signUp(data);
		return {
			message: messages.auth.userSignUpSuccess
		};
	}

	@ApiOperation({ summary: 'Đăng xuất tài khoản' })
	@HttpCode(200)
	@Post('signout')
	async signout(@Req() req: Request): Promise<void> {
		await this.authService.signout(req);
	}

	@SkipAuth()
	@ApiOperation({ summary: 'Đăng nhập tài khoản' })
	@Post('signin')
	@HttpCode(200)
	async signin(@Body() data: SignInDto): Promise<SigninResponseDto> {
		return this.authService.signIn( data);
	}

	@SkipAuth()
	@ApiOperation({ summary: 'Kích hoạt tài khoản' })
	@UseInterceptors(TransactionInterceptor)
	@Get('activate-account')
	@HttpCode(200)
	async activateAccount(
		@TransactionParam() transaction: Transaction,
		@Res() res: Response,
		@Query() data: ActivateAccountDto
	) {
		try {
			await this.authService.activateAccount(data, transaction);
			return res.status(200).redirect(`${urlConfig.website}sign-in`);
		} catch (error) {
			return res
				.status(error.status)
				.redirect(`${urlConfig.website}sign-in?success=false&message=${error.response}`);
		}
	}

	@SkipAuth()	
	@ApiOperation({ summary: 'Gửi yêu cầu Kích hoạt lại tài khoản' })
	@Post('reactivate-account')
	@HttpCode(200)
	async reactivateAccount(
		@Body() data: ReactivateAccountDto,	
		@Req() req : Request
	): Promise<IResponseMessage> {
		await this.authService.reactivateAccount(data, req);
		return {
			message: messages.auth.recoveryAccount
		};
	}

	@ApiOperation({ summary: 'Kiểm tra Tài khoản đăng nhập gg hoặc fb đã tồn tại hay chưa' })
	@Post('check-exist')
	@SkipAuth()
	@HttpCode(200)
	async checkUserExist(@Body('email') email: string, @Res() res: Response): Promise<ICheckUserExist> {
		const response = await this.authService.checkUserExist(email);
		return res.status(200).json(response);
	}

	@ApiOperation({ summary: 'Kiểm tra token hợp lệ' })
	@Get('verify-token')
	@HttpCode(200)
	async verifyToken(@Req() req: Request): Promise<void> {
		await this.authService.verifyToken(req["user"])
	}

	@SkipAuth()	
	@ApiOperation({ summary: 'Yêu cầu Khôi phục tài khoản/ mật khẩu' })
	@Post('recovery-account')
	@HttpCode(200)
	async recoveryAccount(
		@Body() data: RecoveryAccountDto,		
		@Req() req : Request
	): Promise<IResponseMessage> {
		await this.authService.recoveryAccount(data, req);
		return {
			message: messages.auth.recoveryAccount
		};
	}

	@SkipAuth()
	@UseInterceptors(TransactionInterceptor)
	@ApiOperation({ summary: 'Cập nhật mật khẩu bị quên' })
	@Post('update-password-recovery-account')
	@HttpCode(200)
	async updatePasswordRecoveryAccount(
		@Body() data: UpdatePwdRecoveryAccountDto,
		@TransactionParam() transaction: Transaction
	): Promise<IResponseMessage> {
		await this.authService.updatePasswordRecoveryAccount(data, transaction);
		return {
			message: messages.auth.updatePasswordSuccess
		};
	}

	@SkipAuth()
	@ApiOperation({ summary: 'Đăng nhập tài khoản qua Google' })
	@ApiBody({ type: SignInProviderDto })
	@Post('signin/google')
	async signInGoogle(@Body() data: SignInProviderDto, @TransactionParam() transaction): Promise<SigninResponseDto> {
		return this.authService.signInProvider(data, ProviderTypeEnum.LOGIN_GOOGLE);
	}

	@SkipAuth()
	@ApiOperation({ summary: 'Đăng nhập tài khoản qua Facebook' })
	@ApiBody({ type: SignInProviderDto })
	@Post('signin/facebook')
	async signInFacebook(@Body() data: SignInProviderDto): Promise<SigninResponseDto> {
		return await this.authService.signInProvider(data, ProviderTypeEnum.LOGIN_FACEBOOK);
	}
}
