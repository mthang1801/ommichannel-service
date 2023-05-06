import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { Workbook } from 'exceljs';
import { workSheetName } from 'src/common/constants/constant';
import { productExportConfig, PRODUCT_HEADER_ROW_NUM } from 'src/common/constants/excel/product';
import messages from 'src/common/constants/messages';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { isEmptyObject } from '../utils/functions.utils';
import { ProductService } from './product.service';

@Injectable()
export class ImportService {
	constructor(@Inject(forwardRef(() => ProductService)) private readonly productService: ProductService) {}

	async importProduct(user: IUserAuth, file: Express.Multer.File) {
		const wb = new Workbook();
		const ws = await wb.xlsx.readFile(file.path);

		const wsSampleProduct = ws.getWorksheet(workSheetName.sampleProduct);
		const mappedData = [];

		wsSampleProduct.eachRow((row, rowNumber) => {
			if (rowNumber > 2) {
				const rowData = {};
				row.eachCell((cell, colNumber) => {
					const currentCol = cell.address.replace(/\d+/g, '');
					if (productExportConfig.get('headerProductColumns')[`${currentCol}${PRODUCT_HEADER_ROW_NUM}`]?.fieldName) {
						rowData[
							productExportConfig.get('headerProductColumns')[`${currentCol}${PRODUCT_HEADER_ROW_NUM}`].fieldName
						] = cell.value;
					}
				});
				if (!isEmptyObject(rowData)) {
					mappedData.push(rowData);
				}
			}
		});

		if (!mappedData.length) {
			throw new HttpException(messages.product.importEmptyProduct, HttpStatus.BAD_REQUEST);
		}

		await this.productService.importProducts(user, mappedData);
	}
}
