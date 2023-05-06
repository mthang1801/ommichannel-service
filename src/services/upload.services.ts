import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fsExtra from 'fs-extra';
import { uploadConfig } from 'src/configs/configs';
import { UploadFileDto } from 'src/dtos/requests/upload.request.dto';

@Injectable()
export class UploadService {
	constructor() {}
	async uploadFiles(data: UploadFileDto, files: Array<Express.Multer.File>) {
		if (!files.length) return;
		const formData: any = new FormData();
		for (const file of files) {
			formData.append('files', await fsExtra.createReadStream(file.path));
		}

		formData.append('object', data.object);
		formData.append('object_id', data.object_id);
		if (data.object_type) {
			formData.append('object_type', data.object_type);
		}

		const config: any = {
			method: 'post',
			url: uploadConfig.uploadAPI,
			headers: {
				...formData.getHeaders(),
				'Content-Type': 'multipart/form-data',
				['auth-uuid']: uploadConfig.cdnSecurityUploadUrl
			},
			data: formData
		};

		try {
			const response: any = await axios(config);

			if (!response?.data) {
				throw new HttpException('Upload không thành công, CDN không phản hồi', 500);
			}
			console.log(response);
			const result = response.data.data.map((data) => data);

			return result;
		} catch (error) {
			if (error?.response?.status == 413) {
				throw new HttpException('Upload không thành công, kích thước file quá lớn.', 413);
			}
			throw new HttpException(
				`Có lỗi xảy ra : ${error?.response?.data?.message || error?.response?.data || error.message}`,
				error?.response?.status || error.status
			);
		} finally {
			await Promise.all(
				files.map(async (file) => {
					await fsExtra.unlink(file.path);
				})
			);
		}
	}

	async getFile(q: string) {
		return `${uploadConfig.cdnUrl}/${q}`;
	}
}
