import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InventoryReceipt } from 'src/models/inventoryReceipt.model';
import { InventoryReceiptDetail } from 'src/models/inventoryReceiptDetail.model';
import { CreateInventoryReceiptDto } from 'src/dtos/requests/inventoryReceipt/createInventoryReceipt.dto';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import { Seller } from 'src/models/seller.model';
import { UpdateInventoryReceiptDto } from 'src/dtos/requests/inventoryReceipt/updateInventoryReceipt.dto';
import { ProductInventory } from 'src/models/productInventory.model';
import { InventoryReceiptQueryParamsDto } from 'src/dtos/requests/inventoryReceipt/inventoryReceiptQueryParams.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { getPageOffsetLimit, parseDataSqlizeResponse, isEmptyObject, getKeyByValue } from 'src/utils/functions.utils';
import { Op } from 'sequelize';
import { Warehouse } from 'src/models/warehouse.model';
import { InventoryReceiptStatusEnum } from 'src/common/constants/enum';
import { sequelize } from 'src/configs/db';
import { Unit } from 'src/models/unit.model';
import { InventoryReceiptDetailQueryParamsDto } from 'src/dtos/requests/inventoryReceipt/inventoryReceiptDetailQueryParams.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CronJobService } from 'src/services/cronJob.service';
import { excelExportFilePath, genValuesSerialNo, initSetupWorkbook } from 'src/utils/exceljs.helper';
import { exportFileNames, workSheetName } from 'src/common/constants/constant';
import * as fsExtra from 'fs-extra';
import { Worksheet, Workbook } from 'exceljs';
import messages from 'src/common/constants/messages';
import {
	INVENTORY_RECEIPT_HEADER_ROW_NUM,
	INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM,
	inventoryReceiptExportConfig
} from 'src/common/constants/excel/inventoryReceipt';
import { ImportInventoryReceiptDto } from 'src/dtos/requests/inventoryReceipt/importInventoryReceipt.dto';
import { User } from 'src/models/user.model';
import { Product } from 'src/models/product.model';
import { WarehouseService } from 'src/services/warehouse.service';
import { UserService } from 'src/services/user.service';

@Injectable()
export class InventoryReceiptService {
	constructor(
		@InjectModel(InventoryReceipt)
		private readonly InventoryReceiptModel: typeof InventoryReceipt,
		@InjectModel(InventoryReceiptDetail)
		private readonly InventoryReceiptDetailModel: typeof InventoryReceiptDetail,
		@InjectModel(Seller)
		private readonly SellerModel: typeof Seller,
		@InjectModel(User)
		private readonly UserModel: typeof User,
		@InjectModel(Warehouse)
		private readonly WarehouseModel: typeof Warehouse,
		@InjectModel(Product)
		private readonly ProductModel: typeof Product,
		@InjectModel(ProductInventory)
		private readonly ProductInventoryModel: typeof ProductInventory,
		@Inject(forwardRef(() => CronJobService))
		private readonly cronJobService: CronJobService,
		@Inject(forwardRef(() => WarehouseService))
		private readonly warehouseService: WarehouseService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	async importInventoryReceipt(user: IUserAuth, file: Express.Multer.File) {
		const wb = new Workbook();
		const ws = await wb.xlsx.readFile(file.path);

		const wsSampleInventoryReceipt = ws.getWorksheet(workSheetName.inventoryReceiptList);
		const mappedData = [];

		wsSampleInventoryReceipt.eachRow((row, rowNumber) => {
			if (rowNumber > 2) {
				const rowData = {};
				row.eachCell((cell, colNumber) => {
					const currentCol = cell.address.replace(/\d+/g, '');
					if (
						inventoryReceiptExportConfig.get('headerInventoryReceiptColumns')[
							`${currentCol}${INVENTORY_RECEIPT_HEADER_ROW_NUM}`
						]?.fieldName
					) {
						rowData[
							inventoryReceiptExportConfig.get('headerInventoryReceiptColumns')[
								`${currentCol}${INVENTORY_RECEIPT_HEADER_ROW_NUM}`
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
			throw new HttpException(messages.inventoryReceipt.importEmptyInventoryReceipt, HttpStatus.BAD_REQUEST);
		}

		await this.importInventoryReceipts(user, mappedData);
	}

	async importInventoryReceipts(user: IUserAuth, inventoryReceiptList: ImportInventoryReceiptDto[]): Promise<any> {
		await this.checkImportInventoryReceiptValidation(user, inventoryReceiptList);
		await this.createImportGoodImport(user, inventoryReceiptList);
	}

	async checkImportInventoryReceiptValidation({ roleCode, sellerId }: IUserAuth, data: ImportInventoryReceiptDto[]) {
		// const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		for (const invenroryReceipt of data) {
			if (!invenroryReceipt.warehouse) {
				throw new HttpException(messages.inventoryReceipt.warehouseShouldNotEmpty, HttpStatus.BAD_REQUEST);
			}

			if (!invenroryReceipt.inventory_staff) {
				throw new HttpException(messages.inventoryReceipt.inventoryStaffShouldNotEmpty, HttpStatus.BAD_REQUEST);
			}

			if (!invenroryReceipt.products) {
				throw new HttpException(messages.inventoryReceipt.productShouldNotEmpty, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async createImportGoodImport(user: IUserAuth, inventoryReceiptList: ImportInventoryReceiptDto[]): Promise<void> {
		const { sellerId, userId, roleCode } = user;
		for (const detail of inventoryReceiptList) {
			const inventoryStaff = await this.UserModel.findOne({
				where: { seller_id: sellerId, fullname: detail.inventory_staff }
			});

			let warehouse;
			if (detail.warehouse) {
				warehouse = await this.WarehouseModel.findOne({
					where: { seller_id: sellerId, warehouse_name: detail.warehouse }
				});
			}
			let inventoryReceiptData = {
				...detail,
				inventory_staff_id: inventoryStaff?.id,
				warehouse_id: warehouse?.id,
				status: getKeyByValue(InventoryReceiptStatusEnum, detail?.status)
			};

			let products = detail.products.split(';');
			let inventoryReceiptDetails = [];
			for (const product of products) {
				const productInfo = await this.ProductModel.findOne({
					where: { seller_id: sellerId, sku: product.split(',')[0] }
				});

				const tempProduct = {
					sku: productInfo.sku,
					product_id: productInfo.id,
					product: productInfo.product_name,
					qty_in_stock: parseInt(product.split(',')[1]),
					real_qty_in_stock: product.split(',')[2] ? product.split(',')[2] : null,
					differential: product.split(',')[2] ? product.split(',')[3] : null,
					unit_id: 1
				};
				inventoryReceiptDetails.push(tempProduct);
			}

			inventoryReceiptData['details'] = inventoryReceiptDetails;

			await this.createInventoryReceipt(inventoryReceiptData, user);
		}
	}

	async exportInventoryReceiptSample(user: IUserAuth) {
		const filePath = excelExportFilePath(user.sellerId, exportFileNames.sampleInventoryReceipt);

		const wb = this.getImportGoodWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.sampleInventoryReceipt);

		genValuesSerialNo(ws, 'AD');

		this.mergeCellStyleRowForInventoryReceiptSample(ws);

		this.defineColumnsSubHeaderForInventoryReceiptSample(ws);

		this.defineColumnsHeaderForInventoryReceiptSample(ws);

		await this.getRelatedDatavalidationsForInventoryReceiptSample(user, ws);

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

	defineColumnsSubHeaderForInventoryReceiptSample(ws: Worksheet) {
		Object.entries(inventoryReceiptExportConfig.get('columnsSubHeader')).forEach(([cell, cellValue]) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
			});
		});
	}

	defineColumnsHeaderForInventoryReceiptSample(ws: Worksheet) {
		Object.entries(inventoryReceiptExportConfig.get('headerInventoryReceiptColumns')).forEach(
			([cell, cellValue], i) => {
				Object.entries(cellValue).forEach(([k, v]) => {
					ws.getCell(cell)[k] = v;
					if (k === 'width') {
						ws.columns[i].width = v as any;
					}
					if (k === 'wraptext') {
						ws.columns[i].alignment = { wrapText: true };
					}
				});
			}
		);
	}

	async getRelatedDatavalidationsForInventoryReceiptSample(user: IUserAuth, ws: Worksheet) {
		const { sellerId } = user;
		// const [warehouseList, staffList] = await Promise.all([
		// 	(
		// 		await this.warehouseService.getWarehousesList(sellerId, { status: 'true' })
		// 	).data.map(({ id, warehouse_name }) => `[${id}] - ${warehouse_name}`),
		// 	(
		// 		await this.userService.getUserSystemList(user, { status: 'true' })
		// 	).data.map(({ id, fullname }) => `[${id}] - ${fullname}`)
		// ]);

		const [warehouseList, staffList] = await Promise.all([
			(
				await this.warehouseService.getWarehousesList(sellerId, { status: 'true' })
			).data.map(({ warehouse_name }) => warehouse_name),
			(await this.userService.getUserSystemList(user, { status: 'true' })).data.map(({ fullname }) => fullname)
		]);

		const dynamicDataValidations = inventoryReceiptExportConfig.get('dataValidations')(warehouseList, staffList);
		Object.entries(dynamicDataValidations).forEach(([colName, colDataValidation]) => {
			ws.getColumn(colName as any).eachCell({ includeEmpty: true }, (cell, _) => {
				ws.getCell(cell.address).dataValidation = colDataValidation as any;
			});
		});
	}

	mergeCellStyleRowForInventoryReceiptSample(ws: Worksheet) {
		Object.values(inventoryReceiptExportConfig.get('mergedColsList')).forEach((value: string[]) => {
			ws.mergeCells(value.join(':'));
		});
		ws.getRow(INVENTORY_RECEIPT_SUP_HEADER_ROW_NUM).height = 30;
		ws.getRow(INVENTORY_RECEIPT_HEADER_ROW_NUM).height = 20;
		ws.getRow(INVENTORY_RECEIPT_HEADER_ROW_NUM).alignment = {
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

	async createInventoryReceipt(data, user: IUserAuth): Promise<void | InventoryReceipt | any> {
		const { sellerId, userId, roleCode } = user;

		const payload = {
			...data,
			seller_id: sellerId
		};

		const userInfo = await this.UserModel.findOne({ where: { id: userId } });
		payload['created_by'] = userInfo.fullname;

		if (data.status && data.status == InventoryReceiptStatusEnum['Đã kiểm hàng']) {
			payload.inventory_at = formatMySQLTimeStamp();
			payload['balance_staff_id'] = userId;
			payload['balance_at'] = formatMySQLTimeStamp();
		}

		const inventoryReceipt = await this.InventoryReceiptModel.create(payload as any);

		for (const detail of data.details) {
			const detailData = {
				...detail,
				inventory_receipt_id: inventoryReceipt.id
			};

			await this.InventoryReceiptDetailModel.create(detailData as any);
		}

		if (data.status && data.status == InventoryReceiptStatusEnum['Đã kiểm hàng']) {
			for (let detail of data.details) {
				console.log(detail);
				await this.ProductInventoryModel.update(
					{ qty: detail.real_qty_in_stock },
					{ where: { warehouse_id: data.warehouse_id, product_id: detail.product_id } }
				);
			}

			await this.cronJobService.syncInventory();
		}

		return inventoryReceipt;
	}

	async updateInventoryReceipt(user: IUserAuth, id: number, data: UpdateInventoryReceiptDto): Promise<any> {
		const { sellerId, userId, roleCode } = user;

		const currentInventoryReceipt = await this.InventoryReceiptModel.findOne({
			where: { id, seller_id: sellerId }
		});

		if (!currentInventoryReceipt) {
			throw new HttpException('Không tìm thấy phiếu kiểm hàng.', HttpStatus.NOT_FOUND);
		}

		if (currentInventoryReceipt.status == InventoryReceiptStatusEnum['Đã kiểm hàng']) {
			throw new HttpException('Đơn kiểm hàng đã hoàn thành, vui lòng không chỉnh sửa.', HttpStatus.CONFLICT);
		}
		data['inventory_at'] = formatMySQLTimeStamp();

		await this.InventoryReceiptModel.update(data, { where: { id } });

		for (const detail of data.details) {
			const currentDetail = await this.InventoryReceiptDetailModel.findOne({
				where: {
					inventory_receipt_id: id,
					product_id: detail.product_id
				}
			});

			const detailData = {
				...detail,
				differential: detail.real_qty_in_stock - currentDetail.qty_in_stock
			};

			await this.InventoryReceiptDetailModel.update(detailData, {
				where: {
					inventory_receipt_id: id,
					product_id: detail.product_id
				}
			});

			const productInventory = await this.ProductInventoryModel.findOne({
				where: {
					seller_id: sellerId,
					warehouse_id: currentInventoryReceipt.warehouse_id,
					product_id: detail.product_id
				}
			});

			if (productInventory) {
				await this.ProductInventoryModel.update(
					{ qty: detail.real_qty_in_stock },
					{
						where: {
							seller_id: sellerId,
							warehouse_id: currentInventoryReceipt.warehouse_id,
							product_id: detail.product_id
						}
					}
				);
			}
		}

		if (data.more_details && data.more_details.length) {
			for (const detail of data.more_details) {
				const detailData = {
					...detail,
					inventory_receipt_id: id
				};

				await this.InventoryReceiptDetailModel.create(detailData as any);
			}
		}

		if (data.status && data.status == InventoryReceiptStatusEnum['Đã kiểm hàng']) {
			await this.InventoryReceiptModel.update(
				{ balance_staff_id: userId, balance_at: formatMySQLTimeStamp() },
				{ where: { id, seller_id: sellerId } }
			);

			let details = await this.InventoryReceiptDetailModel.findAll({ where: { inventory_receipt_id: id } });

			for (let detail of details) {
				await this.ProductInventoryModel.update(
					{ qty: detail.real_qty_in_stock },
					{ where: { warehouse_id: currentInventoryReceipt.warehouse_id, product_id: detail.product_id } }
				);
			}
			await this.cronJobService.syncInventory();
		}
	}

	async getInventoryReceiptList(
		seller_id,
		queryParams: InventoryReceiptQueryParamsDto
	): Promise<ResponseAbstractList<InventoryReceipt>> {
		const {
			q,
			status,
			warehouse_id,
			from_created_date,
			to_created_date,
			from_inventory_date,
			to_inventory_date,
			from_completed_date,
			to_completed_date
		} = queryParams;
		const { page, offset, limit } = getPageOffsetLimit(queryParams);

		let _whereClause: any = { seller_id };

		if (q) {
			_whereClause = {
				..._whereClause,
				[Op.or]: {
					id: {
						[Op.like]: `%${q}%`
					}
				}
			};
		}

		if (status) {
			_whereClause = {
				..._whereClause,
				status
			};
		}
		if (warehouse_id) {
			_whereClause = {
				..._whereClause,
				warehouse_id
			};
		}
		if (from_created_date && to_created_date) {
			_whereClause = {
				..._whereClause,
				created_at: {
					[Op.between]: [from_created_date, to_created_date]
				}
			};
		}
		if (from_inventory_date && to_inventory_date) {
			_whereClause = {
				..._whereClause,
				inventory_at: {
					[Op.between]: [from_inventory_date, to_inventory_date]
				}
			};
		}
		if (from_completed_date && to_completed_date) {
			_whereClause = {
				..._whereClause,
				balance_at: {
					[Op.between]: [from_completed_date, to_completed_date]
				}
			};
		}

		const { rows, count } = parseDataSqlizeResponse(
			await this.InventoryReceiptModel.findAndCountAll({
				where: _whereClause,
				include: [Warehouse],
				order: [['updated_at', 'DESC']],
				limit,
				offset,
				distinct: true
			})
		);

		return {
			paging: {
				currentPage: page,
				pageSize: limit,
				total: count
			},
			data: rows
		};
	}

	async getInventoryReceiptById(id, seller_id): Promise<InventoryReceipt | any> {
		let countAll = await this.InventoryReceiptDetailModel.count({ where: { inventory_receipt_id: id } });
		let countNotCheck = await this.InventoryReceiptDetailModel.count({
			where: { inventory_receipt_id: id, real_qty_in_stock: null }
		});
		let countMatch = await this.InventoryReceiptDetailModel.count({
			where: { inventory_receipt_id: id, differential: 0 }
		});
		let countNotMatch = await this.InventoryReceiptDetailModel.count({
			where: { inventory_receipt_id: id, differential: { [Op.ne]: 0 } }
		});

		const inventoryReceipt = parseDataSqlizeResponse(
			await this.InventoryReceiptModel.findOne({
				attributes: {
					include: [
						[
							sequelize.literal(
								'(SELECT fullname FROM users InventoryStaff WHERE `InventoryReceipt`.`inventory_staff_id` = `InventoryStaff`.`id`)'
							),
							'inventory_staff'
						],
						[
							sequelize.literal(
								'(SELECT fullname FROM users BalanceStaff WHERE `InventoryReceipt`.`balance_staff_id` = `BalanceStaff`.`id`)'
							),
							'balance_staff'
						]
					]
				},
				where: { id, seller_id },
				include: [Warehouse]
			})
		);

		return {
			...inventoryReceipt,
			countAll,
			countNotCheck,
			countMatch,
			countNotMatch
		};
	}

	async getInventoryReceiptDetailsById(
		id,
		seller_id,
		queryParams: InventoryReceiptDetailQueryParamsDto
	): Promise<any> {
		const { detail_status } = queryParams;

		let _whereClause: any = { inventory_receipt_id: id };

		if (detail_status) {
			if (detail_status == 1) {
				_whereClause = {
					..._whereClause,
					real_qty_in_stock: null
				};
			} else if (detail_status == 2) {
				_whereClause = {
					..._whereClause,
					differential: 0
				};
			} else if (detail_status == 3) {
				_whereClause = {
					..._whereClause,
					differential: { [Op.ne]: 0 }
				};
			}
		}

		return this.InventoryReceiptDetailModel.findAll({
			where: _whereClause,
			include: [Unit]
		});
	}
}
