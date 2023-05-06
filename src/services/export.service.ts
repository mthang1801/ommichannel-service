import { HttpException, Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { HttpStatus } from '@nestjs/common/enums';
import { forwardRef } from '@nestjs/common/utils';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { Workbook, Worksheet } from 'exceljs';
import * as fsExtra from 'fs-extra';
import * as glob from 'glob';
import { cwd } from 'process';
import { exportFileNames, workSheetName } from 'src/common/constants/constant';
import { orderDeliveryExportConfig } from 'src/common/constants/excel/orderDelivery';
import {
	productExportConfig,
	PRODUCT_HEADER_ROW_NUM,
	PRODUCT_SUP_HEADER_ROW_NUM
} from 'src/common/constants/excel/product';
import messages from 'src/common/constants/messages';
import { ExportOrderDeliveriesListDto } from 'src/dtos/requests/exports/export-orderDelivery.dto';
import { ExportProductsListDto } from 'src/dtos/requests/exports/export-products.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { Product } from 'src/models/product.model';
import { excelExportFilePath, genValuesSerialNo, initSetupWorkbook } from 'src/utils/exceljs.helper';
import { OrderDelivery } from '../models/orderDelivery.model';
import { listDataParser } from '../utils/functions.utils';
import { CatalogService } from './catalog.service';
import { CategoryService } from './category.service';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable()
export class ExportService {
	private logger = new Logger(ExportService.name);
	constructor(
		@Inject(forwardRef(() => CategoryService))
		private readonly categoryService: CategoryService,
		@Inject(forwardRef(() => CatalogService))
		private readonly catalogService: CatalogService,
		@Inject(forwardRef(() => ProductService))
		private readonly productService: ProductService,
		@Inject(forwardRef(() => OrderService))
		private readonly orderService: OrderService
	) {}

	async exportProductSample(user: IUserAuth) {
		const filePath = excelExportFilePath(user.sellerId, exportFileNames.sampleProduct);

		const wb = this.getProductWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.sampleProduct);

		genValuesSerialNo(ws, 'AD');

		this.mergeCellStyleRow(ws, productExportConfig.get('mergedColsList'));

		this.defineColumnsSubHeader(ws, productExportConfig.get('columnsSubHeader'));

		this.defineColumnsHeader(ws, productExportConfig.get('headerProductColumns'));

		await this.getRelatedDatavalidationsForProductSample(user, ws);

		await this.checkAndCreateDirectoryNotExist(filePath);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	async exportProductsList(user: IUserAuth, { product_ids }: ExportProductsListDto): Promise<string> {
		const productsList = listDataParser(await this.productService.getByListIds(product_ids));

		if (!productsList.length) {
			throw new HttpException(messages.export.errorEmpty, HttpStatus.BAD_REQUEST);
		}

		const filePath = excelExportFilePath(user.sellerId, exportFileNames.productLists);

		const wb = this.getProductWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.productsList);

		this.mergeCellStyleRow(ws, productExportConfig.get('mergedColsList'));

		this.defineColumnsSubHeader(ws, productExportConfig.get('columnsSubHeader'));

		this.defineColumnsHeader(ws, productExportConfig.get('headerProductColumns'));

		this.embedProductsListIntoWorkSheet(productsList, ws);

		await this.checkAndCreateDirectoryNotExist(filePath);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	embedProductsListIntoWorkSheet(productsList: Product[], ws: Worksheet) {
		productsList.forEach((productItem, idx) => {
			console.log(productItem);
			const exportProductData = Object.entries(productExportConfig.get('productColumnKeys')).map(
				([k, v]: any) => {
					if (v.fieldName === 'category_name') {
						return productItem.categories
							.map(({ category_name }) => category_name)
							.filter(Boolean)
							.join(', ');
					}

					if (v.fieldName === 'catalog_name') {
						return productItem?.catalog?.catalog_name || null;
					}

					if (v.revertData) {
						return v.revertData(productItem[v['fieldName']]);
					}

					return productItem[v['fieldName']];
				}
			);
			ws.getRow(PRODUCT_HEADER_ROW_NUM + idx + 1).values = exportProductData;
		});
	}

	async checkAndCreateDirectoryNotExist(filePath: string) {
		const splitedFilePath = filePath.split('\\').length > 1 ? filePath.split('\\') : filePath.split('/');
		const targetDir = splitedFilePath.slice(0, -1).join('/');
		if (!(await fsExtra.exists(targetDir))) {
			await fsExtra.mkdir(targetDir, { recursive: true });
		}
	}

	defineColumnsSubHeader(ws: Worksheet, columns: any) {
		Object.entries(columns).forEach(([cell, cellValue]) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
			});
		});
	}

	defineColumnsHeader(ws: Worksheet, colums: any) {
		Object.entries(colums).forEach(([cell, cellValue], i) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
				if (k === 'width') {
					ws.columns[i].width = v as any;
				}
			});
		});
	}

	async getRelatedDatavalidationsForProductSample(user: IUserAuth, ws: Worksheet) {
		const [categoriesList, catalogList] = await Promise.all([
			(
				await this.categoryService.getCategoryList({ status: 1 }, user)
			).data.map(({ id, category_name }) => `[${id}] - ${category_name}`),
			(
				await this.catalogService.getCatalogsList(user, { status: true })
			).data.map(({ id, catalog_name }) => `[${id}] - ${catalog_name}`)
		]);

		const dynamicDataValidations = productExportConfig.get('dataValidations')(categoriesList, catalogList);
		Object.entries(dynamicDataValidations).forEach(([colName, colDataValidation]) => {
			ws.getColumn(colName as any).eachCell({ includeEmpty: true }, (cell, _) => {
				ws.getCell(cell.address).dataValidation = colDataValidation as any;
			});
		});
	}

	mergeCellStyleRow(ws: Worksheet, mergedCols: any) {
		Object.values(mergedCols).forEach((value: string[]) => {
			ws.mergeCells(value.join(':'));
		});
		ws.getRow(PRODUCT_SUP_HEADER_ROW_NUM).height = 30;
		ws.getRow(PRODUCT_HEADER_ROW_NUM).height = 20;
		ws.getRow(PRODUCT_HEADER_ROW_NUM).alignment = {
			horizontal: 'left',
			vertical: 'middle'
		};
	}

	getProductWorkbook() {
		const wb = new Workbook();
		initSetupWorkbook(wb);
		return wb;
	}

	getWorkSheet(wb: Workbook, wsName: string) {
		return wb.addWorksheet(wsName, {
			pageSetup: { orientation: 'landscape', paperSize: 9 }
		});
	}

	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	async removeFilesEveryDay() {
		glob(
			`${cwd().replace(/\\/g, '/')}/templates/excels/**/*.{xlsx,pdf,csv,txt}`,
			async (err: string, files: string[]) => {
				if (err) {
					this.logger.error(err, err);
				}

				await Promise.allSettled(
					files.map(async (filePath) => {
						try {
							await fsExtra.unlink(filePath);
						} catch (error) {
							this.logger.error(error, error);
						}
					})
				);
			}
		);
	}

	async exportOrderDelivery(user: IUserAuth, { ids }: ExportOrderDeliveriesListDto): Promise<string> {
		const orderDeliveriesList = listDataParser(await this.orderService.findOrderDeliveriesListByIdsList(ids));
		if (!orderDeliveriesList.length) {
			throw new HttpException(messages.export.errorEmpty, HttpStatus.BAD_REQUEST);
		}
		const filePath = excelExportFilePath(user.sellerId, exportFileNames.orderDeliveriesList);

		const wb = this.getProductWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.orderDeliveriesList);

		this.mergeCellStyleRow(ws, orderDeliveryExportConfig.get('mergedColsList'));

		this.defineColumnsSubHeader(ws, orderDeliveryExportConfig.get('columnsSubHeader'));

		this.defineColumnsHeader(ws, orderDeliveryExportConfig.get('headerProductColumns'));

		this.embedOrderDeliveriesIntoWorkSheet(orderDeliveriesList, ws);

		await this.checkAndCreateDirectoryNotExist(filePath);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	embedOrderDeliveriesIntoWorkSheet(orderDeliveriesList: OrderDelivery[], ws: Worksheet) {
		orderDeliveriesList.forEach((orderDeliveryItem, idx) => {
			const exportProductData = Object.entries(orderDeliveryExportConfig.get('orderDeliveryColumnKeys')).map(
				([k, v]: any) => {
					if (v.fieldName === 'sender_full_address') {
						return [
							orderDeliveryItem.sender_address,
							orderDeliveryItem.sender_province,
							orderDeliveryItem.sender_district,
							orderDeliveryItem.sender_ward
						]
							.filter(Boolean)
							.join(', ');
					}

					if (v.fieldName === 'b_full_address') {
						return [
							orderDeliveryItem.s_address,
							orderDeliveryItem.s_province,
							orderDeliveryItem.s_district,
							orderDeliveryItem.s_ward
						]
							.filter(Boolean)
							.join(', ');
					}

					if (v.fieldName === 'order_details') {
						const orderDetails = orderDeliveryItem.details
							.map(
								({ product_name, sku, quantity, price, discount, final_total_money_amount }) =>
									`Tên SP: ${product_name}, SKU: ${sku}, Đơn giá: ${price}, SL: ${quantity}, Giảm giá: ${discount}. Thành tiền: ${final_total_money_amount}`
							)
							.join('\n-');
						return orderDetails;
					}

					return orderDeliveryItem[v['fieldName']];
				}
			);
			ws.getRow(PRODUCT_HEADER_ROW_NUM + idx + 1).values = exportProductData;
		});
	}
}
