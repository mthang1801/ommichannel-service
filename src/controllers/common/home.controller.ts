import { Controller, Get, Req, Res, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipAuth } from 'src/common/guards/customMetadata';

@Controller()
@ApiTags('Home')
export class HomeController {
	@Version(VERSION_NEUTRAL)
	@Get()
	@SkipAuth()
	get(@Res() res: Response, @Req() req: Request) {
		console.log(13);
		const message = `OMS API, ${new Date().toLocaleDateString('vn')}`;
		
		return res.status(200).render('home', { url: "https://omswsdev.ntlogistics.vn/api/v1/docs" });
	}
}
