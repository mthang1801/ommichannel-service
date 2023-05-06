import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
	ImportGoodInputStatus,
	ImportGoodPaymentMethodEnum,
	ImportGoodPaymentStatus,
	ImportGoodTransactionStatus
} from 'src/common/constants/enum';
import { CreateImportGoodDto } from 'src/dtos/requests/importGood/createImportGood.dto';
import { ImportGoodQueryParamsDto } from 'src/dtos/requests/importGood/importGoodQueryParams.dto';
import { UpdateImportGoodDto } from 'src/dtos/requests/importGood/updateImportGood.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { ImportGood } from 'src/models/importGood.model';
import { ImportGoodDetail } from 'src/models/importGoodDetail.model';
import { ImportGoodLog } from 'src/models/importGoodLogs.model';
import { Product } from 'src/models/product.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Seller } from 'src/models/seller.model';
import { Supplier } from 'src/models/supplier.model';
import { Warehouse } from 'src/models/warehouse.model';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import {
	getPageOffsetLimit,
	parseDataSqlizeResponse,
	generateRandomString,
	isEmptyObject
} from 'src/utils/functions.utils';
import { ProductService } from './product.service';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import {
	excelExportFilePath,
	initSetupWorkbook,
	genValuesSerialNo,
	getIdByDynamicDataList
} from 'src/utils/exceljs.helper';
import { exportFileNames, workSheetName } from 'src/common/constants/constant';
import { Workbook, Worksheet } from 'exceljs';
import { importGoodExportConfig } from 'src/common/constants/excel/importGood';
import { IMPORT_GOOD_SUP_HEADER_ROW_NUM } from 'src/common/constants/excel/importGood';
import { IMPORT_GOOD_HEADER_ROW_NUM } from 'src/common/constants/excel/importGood';
import * as fsExtra from 'fs-extra';
import messages from 'src/common/constants/messages';
import { ImportImportGoodDto } from 'src/dtos/requests/importGood/importImportGood.dto';
import { getKeyByValue } from 'src/utils/functions.utils';
import { WarehouseService } from 'src/services/warehouse.service';
import { UserService } from 'src/services/user.service';
import { SupplierService } from 'src/services/supplier.service';

@Injectable()
export class ImportGoodService {
	constructor(
		@InjectModel(ImportGood)
		private readonly ImportGoodModel: typeof ImportGood,
		@InjectModel(Supplier)
		private readonly SupplierModel: typeof Supplier,
		@InjectModel(ImportGoodDetail)
		private readonly ImportGoodDetailModel: typeof ImportGoodDetail,
		@InjectModel(ImportGoodLog)
		private readonly ImportGoodLogModel: typeof ImportGoodLog,
		@InjectModel(Seller)
		private readonly SellerModel: typeof Seller,
		@InjectModel(Product)
		private readonly ProductModel: typeof Product,
		@InjectModel(ProductInventory)
		private readonly ProductInventoryModel: typeof ProductInventory,
		@InjectModel(Warehouse)
		private readonly WarehouseModel: typeof Warehouse,
		@Inject(forwardRef(() => ProductService))
		private readonly productService: ProductService,
		@Inject(forwardRef(() => WarehouseService))
		private readonly warehouseService: WarehouseService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => SupplierService))
		private readonly supplierService: SupplierService
	) {}

	async importImportGood(user: IUserAuth, file: Express.Multer.File) {
		const wb = new Workbook();
		const ws = await wb.xlsx.readFile(file.path);

		const wsSampleImportGood = ws.getWorksheet(workSheetName.importGoodList);
		const mappedData = [];

		wsSampleImportGood.eachRow((row, rowNumber) => {
			if (rowNumber > 2) {
				const rowData = {};
				row.eachCell((cell, colNumber) => {
					const currentCol = cell.address.replace(/\d+/g, '');
					if (
						importGoodExportConfig.get('headerImportGoodColumns')[
							`${currentCol}${IMPORT_GOOD_HEADER_ROW_NUM}`
						]?.fieldName
					) {
						rowData[
							importGoodExportConfig.get('headerImportGoodColumns')[
								`${currentCol}${IMPORT_GOOD_HEADER_ROW_NUM}`
							].fieldName
						] = cell.value;
					}
				});
				if (!isEmptyObject(rowData)) {
					mappedData.push(rowData);
				}
			}
		});

		if (!mappedData.length) {
			throw new HttpException(messages.importGood.importEmptyImportGood, HttpStatus.BAD_REQUEST);
		}

		await this.importImportGoods(user, mappedData);
	}

	async importImportGoods(user: IUserAuth, importGoodList: ImportImportGoodDto[]): Promise<any> {
		await this.checkImportImportGoodValidation(user, importGoodList);
		await this.createImportGoodImport(user, importGoodList);
	}

	async checkImportImportGoodValidation({ roleCode, sellerId }: IUserAuth, data: ImportImportGoodDto[]) {
		// const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		for (const importGood of data) {
			if (!importGood.supplier) {
				throw new HttpException(messages.importGood.supplierShouldNotEmpty, HttpStatus.BAD_REQUEST);
			}

			if (!importGood.products) {
				throw new HttpException(messages.importGood.productShouldNotEmpty, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async createImportGoodImport(user: IUserAuth, importGoodList: ImportImportGoodDto[]): Promise<void> {
		const { sellerId, userId, roleCode } = user;
		for (const detail of importGoodList) {
			const supplier = await this.SupplierModel.findOne({
				where: { seller_id: sellerId, supplier_name: detail.supplier }
			});
			let warehouse;
			if (detail.warehouse) {
				warehouse = await this.WarehouseModel.findOne({
					where: { seller_id: sellerId, warehouse_name: detail.warehouse }
				});
			}
			let importGoodData = {
				...detail,
				supplier_id: supplier?.id,
				warehouse_id: warehouse?.id,
				payment_method: getKeyByValue(ImportGoodPaymentMethodEnum, detail.payment_method)
			};

			let products = detail.products.split(';');
			let importGoodDetails = [];
			for (const product of products) {
				const productInfo = await this.ProductModel.findOne({
					where: { seller_id: sellerId, sku: product.split(',')[0] }
				});
				const tempProduct = {
					sku: productInfo.sku,
					product_id: productInfo.id,
					product: productInfo.product_name,
					qty: product.split(',')[1],
					price: product.split(',')[2],
					unit_id: 1
				};
				importGoodDetails.push(tempProduct);
			}

			importGoodData['details'] = importGoodDetails;

			await this.createImportGood(importGoodData, user);
		}
	}

	async exportImportGoodSample(user: IUserAuth) {
		const filePath = excelExportFilePath(user.sellerId, exportFileNames.sampleImportGood);

		const wb = this.getImportGoodWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.sampleImportGood);

		genValuesSerialNo(ws, 'AD');

		this.mergeCellStyleRowForImportGoodSample(ws);

		this.defineColumnsSubHeaderForImportGoodSample(ws);

		this.defineColumnsHeaderForImportGoodSample(ws);

		await this.getRelatedDatavalidationsForImportGoodSample(user, ws);

		await this.checkAndCreateDirectoryNotExist(filePath);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	async checkAndCreateDirectoryNotExist(filePath: string) {
		const splitedFilePath = filePath.split('\\').length > 1 ? filePath.split('\\') : filePath.split('/');
		const targetDir = splitedFilePath.slice(0, -1).join('/');
		if (!(await fsExtra.exists(targetDir))) {
			await fsExtra.mkdir(targetDir, { recursive: true });
		}
	}

	defineColumnsSubHeaderForImportGoodSample(ws: Worksheet) {
		Object.entries(importGoodExportConfig.get('columnsSubHeader')).forEach(([cell, cellValue]) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
			});
		});
	}

	defineColumnsHeaderForImportGoodSample(ws: Worksheet) {
		Object.entries(importGoodExportConfig.get('headerImportGoodColumns')).forEach(([cell, cellValue], i) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
				if (k === 'width') {
					ws.columns[i].width = v as any;
				}
				if (k === 'wraptext') {
					ws.columns[i].alignment = { wrapText: true };
				}
			});
		});
	}

	async getRelatedDatavalidationsForImportGoodSample(user: IUserAuth, ws: Worksheet) {
		// const [categoriesList, catalogList] = await Promise.all([
		// 	(
		// 		await this.categoryService.getCategoryList({ status: 1 }, user)
		// 	).data.map(({ id, category_name }) => `[${id}] - ${category_name}`),
		// 	(
		// 		await this.catalogService.getCatalogsList(user, { status: true })
		// 	).data.map(({ id, catalog_name }) => `[${id}] - ${catalog_name}`)
		// ]);
		const { sellerId } = user;

		const [warehouseList, staffList, supplierList] = await Promise.all([
			(
				await this.warehouseService.getWarehousesList(sellerId, { status: 'true' })
			).data.map(({ warehouse_name }) => warehouse_name),
			(await this.userService.getUserSystemList(user, { status: 'true' })).data.map(({ fullname }) => fullname),
			(
				await this.supplierService.getSupplierList(sellerId, { status: 'true' })
			).data.map(({ supplier_name }) => supplier_name)
		]);

		const dynamicDataValidations = importGoodExportConfig.get('dataValidations')(
			warehouseList,
			staffList,
			supplierList
		);
		Object.entries(dynamicDataValidations).forEach(([colName, colDataValidation]) => {
			ws.getColumn(colName as any).eachCell({ includeEmpty: true }, (cell, _) => {
				ws.getCell(cell.address).dataValidation = colDataValidation as any;
			});
		});
	}

	mergeCellStyleRowForImportGoodSample(ws: Worksheet) {
		Object.values(importGoodExportConfig.get('mergedColsList')).forEach((value: string[]) => {
			ws.mergeCells(value.join(':'));
		});
		ws.getRow(IMPORT_GOOD_SUP_HEADER_ROW_NUM).height = 30;
		ws.getRow(IMPORT_GOOD_HEADER_ROW_NUM).height = 20;
		ws.getRow(IMPORT_GOOD_HEADER_ROW_NUM).alignment = {
			horizontal: 'left',
			vertical: 'middle'
		};
	}

	getImportGoodWorkbook() {
		const wb = new Workbook();
		initSetupWorkbook(wb);
		return wb;
	}

	getWorkSheet(wb: Workbook, wsName: string) {
		return wb.addWorksheet(wsName, {
			pageSetup: { orientation: 'landscape', paperSize: 9 }
		});
	}

	async createImportGood(data, user: IUserAuth): Promise<void | ImportGood | any> {
		const { sellerId, userId, roleCode } = user;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		let total_amount = 0;
		for (const detail of data.details) {
			total_amount += detail.price * detail.qty;
		}

		const payload = {
			...data,
			seller_id: sellerId,
			import_good_code: 'NTL' + generateRandomString(5).toUpperCase(),
			total_amount
		};

		if (data.input_status && data.input_status == ImportGoodInputStatus['Đã nhập kho']) {
			if (!data.warehouse_id) {
				throw new HttpException('Vui lòng chọn kho.', HttpStatus.NOT_ACCEPTABLE);
			}

			if (!data.input_by) {
				const seller = await this.SellerModel.findOne({
					where: { id: sellerId }
				});
				payload['input_by'] = seller.seller_name;
			}
			if (!data.input_at) {
				payload['input_at'] = formatMySQLTimeStamp();
			}
		}

		if (data.payment_status && data.payment_status == ImportGoodPaymentStatus['Đã thanh toán']) {
			if (!data.payment_by) {
				const seller = await this.SellerModel.findOne({
					where: { id: sellerId }
				});
				payload['payment_by'] = seller.seller_name;
			}
			if (!data.payment_at) {
				payload['payment_at'] = formatMySQLTimeStamp();
			}
		}

		const importGood = await this.ImportGoodModel.create(payload as any);

		for (const detail of data.details) {
			const detailData = {
				...detail,
				total_price: detail.price * detail.qty,
				import_good_id: importGood.id
			};

			await this.ImportGoodDetailModel.create(detailData as any);
			await this.ProductModel.update({ import_price: detail.price }, { where: { id: detail.product_id } });
		}

		if (
			importGood.input_status == ImportGoodInputStatus['Đã nhập kho'] &&
			importGood.payment_status == ImportGoodPaymentStatus['Đã thanh toán']
		) {
			await this.ImportGoodModel.update(
				{
					transaction_status: ImportGoodTransactionStatus['Đã hoàn thành']
				},
				{ where: { id: importGood.id } }
			);
		}

		if (data.input_status && data.input_status == ImportGoodInputStatus['Đã nhập kho']) {
			let new_qty_import_warehouse = 0;
			const importGoodDetails = parseDataSqlizeResponse(
				await this.ImportGoodDetailModel.findAll({
					where: { import_good_id: importGood.id }
				})
			);
			const listsProductIds = importGoodDetails.map(({ product_id }) => Number(product_id));

			await Promise.all([
				...importGoodDetails.map(async (detail) => {
					const logData = {
						import_good_id: detail.import_good_id,
						sku: detail.sku,
						product_id: detail.product_id,
						product: detail.product,
						qty: detail.qty,
						unit_id: detail.unit_id,
						price: detail.price,
						total_price: detail.total_price,
						supplier_id: importGood.supplier_id,
						warehouse_id: importGood.warehouse_id,
						imported_at: importGood.input_at,
						imported_by: importGood.input_by
					};
					await this.ImportGoodLogModel.create(logData as any);

					// Cập nhật số lượng tồn
					new_qty_import_warehouse += detail.qty;
					const product = await this.ProductModel.findOne({
						where: {
							seller_id: isSpecialAdmin ? null : sellerId,
							id: detail.product_id
						}
					});
					await this.ProductModel.update(
						{
							virtual_stock_quantity: product.virtual_stock_quantity + detail.qty
						},
						{
							where: {
								seller_id: isSpecialAdmin ? null : sellerId,
								id: detail.product_id
							}
						}
					);

					const productInventory = parseDataSqlizeResponse(
						await this.ProductInventoryModel.findOne({
							where: {
								seller_id: isSpecialAdmin ? null : sellerId,
								product_id: detail.product_id,
								warehouse_id: data.warehouse_id
							}
						})
					);

					if (productInventory) {
						await this.ProductInventoryModel.update(
							{ qty: productInventory.qty + detail.qty },
							{
								where: {
									seller_id: isSpecialAdmin ? null : sellerId,
									product_id: detail.product_id,
									warehouse_id: data.warehouse_id
								}
							}
						);
					} else {
						const productInventoryData = {
							seller_id: isSpecialAdmin ? null : sellerId,
							product_id: detail.product_id,
							warehouse_id: data.warehouse_id,
							qty: detail.qty
						};
						await this.ProductInventoryModel.create(productInventoryData);
					}
				}),
				this.productService.insertWarehouseIdIntoWarehousesList(importGood.warehouse_id, listsProductIds)
			]);

			//Cập nhật tổng số lượng tồn của kho
			let currentWarehouse = await this.WarehouseModel.findOne({ where: { id: data.warehouse_id } });
			await this.WarehouseModel.update(
				{ qty_in_stock: currentWarehouse.qty_in_stock + new_qty_import_warehouse },
				{ where: { id: data.warehouse_id } }
			);
		}
		return importGood;
	}

	async updateImportGood(user: IUserAuth, id: number, data: UpdateImportGoodDto): Promise<any> {
		// let total_amount = 0;
		// for (let detail of data.details) {
		// 	total_amount += detail.price * detail.qty;
		// }

		const { sellerId, userId, roleCode } = user;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);

		const checkImportGood = await this.ImportGoodModel.findOne({
			where: { id, seller_id: sellerId }
		});

		if (!checkImportGood) {
			throw new HttpException('Không tìm thấy.', HttpStatus.NOT_FOUND);
		}

		const newData = {
			...data
		};

		if (data.input_status && data.input_status == ImportGoodInputStatus['Đã nhập kho']) {
			if (!data.warehouse_id) {
				throw new HttpException('Vui lòng chọn kho.', HttpStatus.NOT_ACCEPTABLE);
			}

			if (!data.input_by) {
				const seller = await this.SellerModel.findOne({
					where: { id: sellerId }
				});
				newData['input_by'] = seller.seller_name;
			}
			if (!data.input_by) {
				newData['input_at'] = formatMySQLTimeStamp();
			}
		}

		if (data.payment_status && data.payment_status == ImportGoodPaymentStatus['Đã thanh toán']) {
			if (!data.payment_by) {
				const seller = await this.SellerModel.findOne({
					where: { id: sellerId }
				});
				newData['payment_by'] = seller.seller_name;
			}
			if (!data.payment_at) {
				newData['payment_at'] = formatMySQLTimeStamp();
			}
		}

		if (data.payment_status && data.payment_status == ImportGoodPaymentStatus['Đã thanh toán']) {
			newData['payment_at'] = formatMySQLTimeStamp();
		}

		await this.ImportGoodModel.update(newData, { where: { id } });

		const currentImportGood = parseDataSqlizeResponse(
			await this.ImportGoodModel.findOne({
				where: { id, seller_id: sellerId }
			})
		);

		if (
			currentImportGood.input_status == ImportGoodInputStatus['Đã nhập kho'] &&
			currentImportGood.payment_status == ImportGoodPaymentStatus['Đã thanh toán']
		) {
			await this.ImportGoodModel.update(
				{
					transaction_status: ImportGoodTransactionStatus['Đã hoàn thành']
				},
				{ where: { id } }
			);
		}

		if (data.input_status && data.input_status == ImportGoodInputStatus['Đã nhập kho']) {
			let new_qty_import_warehouse = 0;
			const importGoodDetails = parseDataSqlizeResponse(
				await this.ImportGoodDetailModel.findAll({
					where: { import_good_id: id }
				})
			);
			const listsProductIds = importGoodDetails.map(({ product_id }) => Number(product_id));

			await Promise.all([
				...importGoodDetails.map(async (detail) => {
					const logData = {
						import_good_id: detail.import_good_id,
						sku: detail.sku,
						product_id: detail.product_id,
						product: detail.product,
						qty: detail.qty,
						unit_id: detail.unit_id,
						price: detail.price,
						total_price: detail.total_price,
						supplier_id: currentImportGood.supplier_id,
						warehouse_id: currentImportGood.warehouse_id,
						imported_at: currentImportGood.input_at,
						imported_by: currentImportGood.input_by
					};
					await this.ImportGoodLogModel.create(logData as any);

					// Cập nhật số lượng tồn
					new_qty_import_warehouse += detail.qty;

					const product = await this.ProductModel.findOne({
						where: {
							seller_id: isSpecialAdmin ? null : sellerId,
							id: detail.product_id
						}
					});
					await this.ProductModel.update(
						{
							virtual_stock_quantity: product.virtual_stock_quantity + detail.qty
						},
						{
							where: {
								seller_id: isSpecialAdmin ? null : sellerId,
								id: detail.product_id
							}
						}
					);

					const productInventory = parseDataSqlizeResponse(
						await this.ProductInventoryModel.findOne({
							where: {
								seller_id: isSpecialAdmin ? null : sellerId,
								product_id: detail.product_id,
								warehouse_id: data.warehouse_id
							}
						})
					);

					if (productInventory) {
						await this.ProductInventoryModel.update(
							{ qty: productInventory.qty + detail.qty },
							{
								where: {
									seller_id: isSpecialAdmin ? null : sellerId,
									product_id: detail.product_id,
									warehouse_id: data.warehouse_id
								}
							}
						);
					} else {
						const productInventoryData = {
							seller_id: isSpecialAdmin ? null : sellerId,
							product_id: detail.product_id,
							warehouse_id: data.warehouse_id,
							qty: detail.qty
						};
						await this.ProductInventoryModel.create(productInventoryData);
					}
				}),
				this.productService.insertWarehouseIdIntoWarehousesList(currentImportGood.warehouse_id, listsProductIds)
			]);

			//Cập nhật tổng số lượng tồn của kho
			let currentWarehouse = await this.WarehouseModel.findOne({ where: { id: data.warehouse_id } });
			await this.WarehouseModel.update(
				{ qty_in_stock: currentWarehouse.qty_in_stock + new_qty_import_warehouse },
				{ where: { id: data.warehouse_id } }
			);
		}

		// await this.ImportGoodDetailModel.destroy({
		// 	where: { import_good_id: id }
		// });

		// for (let detail of data.details) {
		// 	const detailData = {
		// 		...detail,
		// 		total_price: detail.price * detail.qty,
		// 		import_good_id: id
		// 	};
		// 	console.log(detailData);
		// 	await this.ImportGoodDetailModel.create(detailData as any);
		// }
	}

	async getImportGoodList(
		seller_id,
		queryParams: ImportGoodQueryParamsDto
	): Promise<ResponseAbstractList<ImportGood>> {
		const { q, transaction_status, supplier_id, payment_status, input_status, from_date, to_date } = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					import_good_code: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (transaction_status) {
			_whereClause = {
				..._whereClause,
				transaction_status
			};
		}
		if (supplier_id) {
			_whereClause = {
				..._whereClause,
				supplier_id
			};
		}
		if (payment_status) {
			_whereClause = {
				..._whereClause,
				payment_status
			};
		}
		if (input_status) {
			_whereClause = {
				..._whereClause,
				input_status
			};
		}
		if (from_date || to_date) {
			if (!from_date) {
				_whereClause = {
					..._whereClause,
					created_at: { [Op.lte]: to_date }
				};
			} else if (!to_date) {
				_whereClause = {
					..._whereClause,
					created_at: { [Op.gte]: from_date }
				};
			} else {
				_whereClause = {
					..._whereClause,
					created_at: { [Op.between]: [from_date, to_date] }
				};
			}
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.ImportGoodModel.findAndCountAll({
				where: _whereClause,
				include: [{ model: Seller }, { model: Supplier }, { model: Warehouse }, { model: ImportGoodDetail }],
				order: [['updated_at', 'DESC']],
				offset,
				limit,
				distinct: true
			})
		);
		console.log(offset);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getImportGoodById(id): Promise<ImportGood> {
		return this.ImportGoodModel.findOne({
			where: { id },
			include: [{ model: Seller }, { model: Supplier }, { model: Warehouse }, { model: ImportGoodDetail }]
		});
	}
}
