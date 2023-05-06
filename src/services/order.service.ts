import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Workbook, Worksheet } from 'exceljs';
import { Request } from 'express';
import * as fsExtra from 'fs-extra';
import { Op, Transaction } from 'sequelize';
import {
	defineShippingUnits,
	exportFileNames,
	filterSeperator,
	mappingNTLDeliveiryStatus,
	workSheetName
} from 'src/common/constants/constant';
import {
	CustomerHistoryPointOperatorEnum,
	CustomerHistoryPointRefSourceEnum,
	DeliveryPaymentMethodEnum,
	DeliveryStatusEnum,
	DiscountTypeEnum,
	NTLPaymentMethodEnum,
	NTLShippingUnitStatusesEnum,
	OrderStatusEnum,
	PaymentMethodEnum,
	PaymentStatusEnum,
	PersonPayDeliveryFee,
	PlatformEnum,
	ProductInventoryOperatorEnum,
	ShippingUnitIdsEnum
} from 'src/common/constants/enum';
import {
	productExportConfig,
	PRODUCT_HEADER_ROW_NUM,
	PRODUCT_SUP_HEADER_ROW_NUM
} from 'src/common/constants/excel/product';
import messages from 'src/common/constants/messages';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { shippingUnitConfig } from 'src/configs/configs';
import { sequelize } from 'src/configs/db';
import { DecrementCustomerPointDto } from 'src/dtos/requests/customer/decrementCustomerPoint.dto copy';
import { IncrementCustomerPointDto } from 'src/dtos/requests/customer/incrementCustomerPoint.dto';
import { ReIncrementCustomerPointDto } from 'src/dtos/requests/customer/reIncrementCustomerPoint.dto';
import { ExportProductsListDto } from 'src/dtos/requests/exports/export-products.dto';
import { CreateOrderDto } from 'src/dtos/requests/order/createOrder.dto';
import { NTLUpdateDeliveryDto } from 'src/dtos/requests/order/ntlUpdateDelivery.dto';
import { OrderDeliveryQueryParamsDto } from 'src/dtos/requests/order/orderDeliveryQueryParams.dto';
import { OrderDetailDto } from 'src/dtos/requests/order/orderDetail.dto';
import { OrderQueryParamsDto } from 'src/dtos/requests/order/orderQueryParams.dto';
import { PaymentDetailDto } from 'src/dtos/requests/order/paymentDetail.dto';
import { UpdateOrderDto } from 'src/dtos/requests/order/updateOrder.dto';
import { UpdateOrderStatusDto } from 'src/dtos/requests/order/updateOrderStatus.dto';
import { ResponseAbstractList } from 'src/dtos/responses/abstractList.dto';
import { OrderReportStatusesDto } from 'src/dtos/responses/order/orderReportStatus.dto';
import {
	INTLOrderDeliveryLogPayload,
	INTLOrderDeliveryPayload,
	IOrderDateTime,
	IOrderDeliveryStatus,
	IOrderMoneyAmount
} from 'src/interfaces/order.interface';
import { IShippingUnitNTLResponse } from 'src/interfaces/shippingUnitData.interface';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { CouponDetail } from 'src/models/couponDetails.model';
import { Order } from 'src/models/order.model';
import { OrderDelivery } from 'src/models/orderDelivery.model';
import { OrderDeliveryLog } from 'src/models/orderDeliveryLog.model';
import { OrderDetail } from 'src/models/orderDetail.model';
import { OrderPaymentDetail } from 'src/models/orderPaymentDetail.model';
import { OrderPaymentLog } from 'src/models/orderPaymentLog.model';
import { OrderStatusLog } from 'src/models/orderStatusLog.model';
import { Product } from 'src/models/product.model';
import { Warehouse } from 'src/models/warehouse.model';
import { CatalogService } from 'src/services/catalog.service';
import { CategoryService } from 'src/services/category.service';
import { formatMySQLTimeStamp } from 'src/utils/dates.utils';
import { excelExportFilePath, genValuesSerialNo, initSetupWorkbook } from 'src/utils/exceljs.helper';
import {
	filterData,
	geneUniqueKey,
	genOrderCode,
	getKeyByValue,
	getPageOffsetLimit,
	isEmptyObject,
	listDataParser,
	parseDataSqlizeResponse,
	returnListWithPaging
} from 'src/utils/functions.utils';
import { AMQPExchange, AMQPQueue, AMQPRoutingKey } from '../configs/amqp';
import { AMQPService } from './amqp.service';
import { CustomerService } from './customer.service';
import { ProductService } from './product.service';
import { ShippingUnitService } from './shippingUnit.service';
import { ORDER_SUP_HEADER_ROW_NUM, ORDER_HEADER_ROW_NUM, orderExportConfig } from '../common/constants/excel/order';
import { ExportOrdersListDto } from 'src/dtos/requests/exports/export-orders.dto';
import { OrderStatus } from 'src/models/orderStatus.model';

@Injectable()
export class OrderService {
	private logger = new Logger(OrderService.name);
	constructor(
		@InjectModel(Order)
		private readonly OrderModel: typeof Order,
		@InjectModel(OrderDetail)
		private readonly OrderDetailModel: typeof OrderDetail,
		@InjectModel(OrderPaymentDetail)
		private readonly OrderPaymentDetailModel: typeof OrderPaymentDetail,
		@InjectModel(OrderStatusLog)
		private readonly OrderStatusLogModel: typeof OrderStatusLog,
		@InjectModel(OrderDelivery)
		private readonly OrderDeliveryModel: typeof OrderDelivery,
		@InjectModel(OrderPaymentLog)
		private readonly OrderPaymentLogModel: typeof OrderPaymentLog,
		@InjectModel(OrderDeliveryLog)
		private readonly OrderDeliveryLogModel: typeof OrderDeliveryLog,
		@Inject(forwardRef(() => ShippingUnitService))
		private readonly shippingUnitService: ShippingUnitService,
		@Inject(forwardRef(() => ProductService))
		private readonly productService: ProductService,
		@Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService,
		private readonly amqpService: AMQPService,
		@InjectModel(CouponDetail)
		private readonly CouponDetailModel: typeof CouponDetail,
		@Inject(forwardRef(() => CategoryService))
		private readonly categoryService: CategoryService,
		@Inject(forwardRef(() => CatalogService))
		private readonly catalogService: CatalogService
	) {}

	async getByListIds(ids: number[]): Promise<Order[]> {
		return await this.OrderModel.findAll({
			include: [Warehouse, OrderDetail, OrderPaymentDetail],
			where: { id: { [Op.in]: ids } }
		});
	}

	async exportOrderSample(user: IUserAuth) {
		const filePath = excelExportFilePath(user.sellerId, exportFileNames.sampleProduct);

		const wb = this.getOrderWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.sampleOrder);

		genValuesSerialNo(ws, 'AD');

		this.mergeCellStyleRowForOrderSample(ws);

		this.defineColumnsSubHeaderForOrderSample(ws);

		this.defineColumnsHeaderForOrderSample(ws);

		await this.getRelatedDatavalidationsForOrderSample(user, ws);

		await this.checkAndCreateDirectoryNotExist(filePath);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	async exportOrderList(user: IUserAuth, queryParams: ExportOrdersListDto): Promise<string> {
		const { order_ids } = queryParams;
		const orderList = listDataParser(await this.getByListIds(order_ids));

		if (!orderList.length) {
			throw new HttpException(messages.export.errorEmpty, HttpStatus.BAD_REQUEST);
		}

		const filePath = excelExportFilePath(user.sellerId, exportFileNames.orderLists);

		const wb = this.getOrderWorkbook();

		const ws = this.getWorkSheet(wb, workSheetName.orderList);

		this.mergeCellStyleRowForOrderSample(ws);

		this.defineColumnsSubHeaderForOrderSample(ws);

		this.defineColumnsHeaderForOrderSample(ws);

		this.embedOrderListIntoWorkSheet(orderList, ws);

		await wb.xlsx.writeFile(filePath);

		return filePath;
	}

	embedOrderListIntoWorkSheet(orderList: Order[], ws: Worksheet) {
		orderList.forEach((orderItem, idx) => {
			console.log(orderItem);
			const exportOrderData = Object.entries(orderExportConfig.get('orderColumnKeys')).map(([k, v]: any) => {
				// if (v.fieldName === 'category_name') {
				// 	return orderItem.categories
				// 		.map(({ category_name }) => category_name)
				// 		.filter(Boolean)
				// 		.join(', ');
				// }

				if (v.fieldName === 'warehouse_name') {
					return orderItem.warehouse ? orderItem.warehouse.warehouse_name : null;
				}

				if (v.fieldName === 'total_amount') {
					return orderItem.temp_total_money_amount + orderItem.cod + orderItem.delivery_cod_fee;
				}

				if (v.fieldName === 'products') {
					let products = [];
					for (let detail of orderItem.details) {
						let product =
							'Sản phẩm: ' +
							detail.product_name +
							'-Đơn giá: ' +
							detail.price +
							'-Số lượng: ' +
							detail.quantity +
							'-Chiết khấu: ' +
							detail.discount +
							'-Thành tiền: ' +
							detail.total_money_amount;
						products.push(product);
					}
					return products.join('\n');
				}

				if (v.fieldName === 'payment_detail') {
					let payment_details = [];
					for (let detail of orderItem.order_payment_details) {
						let payment_detail =
							'Phương thức thanh toán: ' +
							detail.payment_method_name +
							'-Thời gian: ' +
							detail.payment_at +
							'-Tham chiếu: ' +
							detail.payment_code +
							'-Số tiền: ' +
							detail.amount;
						payment_details.push(payment_detail);
					}
					return payment_details.join('\n');
				}

				if (v.fieldName === 'remain_amount') {
					return (
						orderItem.temp_total_money_amount +
						orderItem.cod +
						orderItem.delivery_cod_fee -
						orderItem.paid_money_amount
					);
				}

				if (v.fieldName === 's_address') {
					if (!orderItem.s_address) return null;
					return (
						orderItem.s_address +
						', ' +
						orderItem.s_ward +
						', ' +
						orderItem.s_district +
						', ' +
						orderItem.s_province
					);
				}

				if (v.revertData) {
					return v.revertData(orderItem[v['fieldName']]);
				}

				return orderItem[v['fieldName']];
			});
			ws.getRow(ORDER_HEADER_ROW_NUM + idx + 1).values = exportOrderData;
		});
	}

	async checkAndCreateDirectoryNotExist(filePath: string) {
		const splitedFilePath = filePath.split('\\').length > 1 ? filePath.split('\\') : filePath.split('/');
		const targetDir = splitedFilePath.slice(0, -1).join('/');
		if (!(await fsExtra.exists(targetDir))) {
			await fsExtra.mkdir(targetDir, { recursive: true });
		}
	}

	defineColumnsSubHeaderForOrderSample(ws: Worksheet) {
		Object.entries(orderExportConfig.get('columnsSubHeader')).forEach(([cell, cellValue]) => {
			Object.entries(cellValue).forEach(([k, v]) => {
				ws.getCell(cell)[k] = v;
			});
		});
	}

	defineColumnsHeaderForOrderSample(ws: Worksheet) {
		Object.entries(orderExportConfig.get('headerOrderColumns')).forEach(([cell, cellValue], i) => {
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

	async getRelatedDatavalidationsForOrderSample(user: IUserAuth, ws: Worksheet) {
		// const [categoriesList, catalogList] = await Promise.all([
		// 	(
		// 		await this.categoryService.getCategoryList({ status: 1 }, user)
		// 	).data.map(({ id, category_name }) => `[${id}] - ${category_name}`),
		// 	(
		// 		await this.catalogService.getCatalogsList(user, { status: true })
		// 	).data.map(({ id, catalog_name }) => `[${id}] - ${catalog_name}`)
		// ]);

		const dynamicDataValidations = orderExportConfig.get('dataValidations')();
		Object.entries(dynamicDataValidations).forEach(([colName, colDataValidation]) => {
			ws.getColumn(colName as any).eachCell({ includeEmpty: true }, (cell, _) => {
				ws.getCell(cell.address).dataValidation = colDataValidation as any;
			});
		});
	}

	mergeCellStyleRowForOrderSample(ws: Worksheet) {
		Object.values(orderExportConfig.get('mergedColsList')).forEach((value: string[]) => {
			ws.mergeCells(value.join(':'));
		});
		ws.getRow(ORDER_SUP_HEADER_ROW_NUM).height = 30;
		ws.getRow(ORDER_HEADER_ROW_NUM).height = 20;
		ws.getRow(ORDER_HEADER_ROW_NUM).alignment = {
			horizontal: 'left',
			vertical: 'middle'
		};
	}

	getOrderWorkbook() {
		const wb = new Workbook();
		initSetupWorkbook(wb);
		return wb;
	}

	getWorkSheet(wb: Workbook, wsName: string) {
		return wb.addWorksheet(wsName, {
			pageSetup: { orientation: 'landscape', paperSize: 9 }
		});
	}

	async createOrder(data: CreateOrderDto, user: IUserAuth): Promise<Order> {
		const transaction = await sequelize.transaction();
		try {
			const { sellerId, userId } = user;
			const payloadData = filterData<CreateOrderDto>(data);

			const deliveryPaymentBy = this.determineOrderDeliveryPaymentBy(payloadData);
			const { totalQuantityAmount, totalMoneyAmount, finalTotalMoneyAmount, totalDiscountMoneyAmount } =
				this.getOrderMoneyAmount(
					payloadData.details,
					deliveryPaymentBy === PersonPayDeliveryFee['Người nhận thanh toán'] ? payloadData.shipping_fee : 0,
					payloadData.used_point_value,
					payloadData.delivery_cod_fee
				);
			const totalPaidMoneyAmount = this.getTotalPaidMoneyAmount(payloadData.payment_details, data.coupon_value);

			const paymentStatus = this.determineOrderPaymentStatus(
				payloadData.platform_id,
				payloadData.receive_at_store,
				totalPaidMoneyAmount,
				finalTotalMoneyAmount
			);

			const orderStatus = this.determineOrderStatus(payloadData.platform_id, payloadData.receive_at_store);
			const { deliveryStatusId, deliveryStatusName } = this.determineOrderDeliveryStatus(
				payloadData.platform_id,
				payloadData.receive_at_store
			);
			const orderDateTime = this.determineOrderDateTime(orderStatus);
			const paymentMethodIds = this.determineOrderPaymentMethod(payloadData.payment_details);

			const orderPayload = {
				...payloadData,
				...orderDateTime,
				order_code: genOrderCode(geneUniqueKey()),
				order_status_id: orderStatus,
				order_status_name: getKeyByValue(OrderStatusEnum, orderStatus),
				seller_id: sellerId,
				temp_total_money_amount: totalMoneyAmount,
				final_total_money_amount: finalTotalMoneyAmount,
				total_discount_money_amount: totalDiscountMoneyAmount,
				paid_money_amount: totalPaidMoneyAmount,
				cod: finalTotalMoneyAmount - totalPaidMoneyAmount,
				total_quantity: totalQuantityAmount,
				payment_status: paymentStatus,
				payment_status_name: getKeyByValue(PaymentStatusEnum, paymentStatus),
				payment_method_id: paymentMethodIds,
				delivery_status_id: deliveryStatusId,
				delivery_status_name: deliveryStatusName,
				delivery_payment_by: deliveryPaymentBy,
				payment_at: paymentStatus === PaymentStatusEnum['Đã thanh toán'] ? formatMySQLTimeStamp() : null,
				created_by: userId,
				updated_by: userId
			};

			const order = await this.OrderModel.create(orderPayload as any, {
				transaction,
				raw: true
			});

			await Promise.all([
				this.createOrderDetails(sellerId, order.id, payloadData.details, transaction),
				this.createOrderPaymentDetails(sellerId, order.id, payloadData.payment_details, transaction),
				this.createOrderStatusLog(sellerId, order.id, orderStatus, userId, transaction),
				this.createOrderPaymentLog(sellerId, order.id, paymentStatus, transaction),
				...data.details.map(async (productItem) => {
					await this.productService.changeProductInventory(
						productItem.product_id,
						productItem.quantity,
						transaction,
						data.warehouse_id,
						ProductInventoryOperatorEnum.Substract,
						data.receive_at_store
					);
				}),
				this.createCustomerPointFromOrder(order),
				this.decrementCustomerPointFromOrder(order),

				//Trừ số lượng mã coupon
				this.useCoupon(data.coupon_code)
			]);

			await transaction.commit();

			return order;
		} catch (err) {
			await transaction.rollback();
			console.log(err.stack);
			throw new HttpException(err.message, err.status);
		}
	}

	async useCoupon(coupon_code) {
		if (!coupon_code) {
			return;
		}

		const couponDetail = await this.CouponDetailModel.findOne({ where: { coupon_detail_code: coupon_code } });
		if (couponDetail) {
			await this.CouponDetailModel.update(
				{ remain: couponDetail.remain - 1, used: couponDetail.used + 1 },
				{ where: { coupon_detail_code: coupon_code } }
			);
		}
	}

	async decrementInventoryAfterSendingShippingUnit(order: Order, details: OrderDetail[] | OrderDetailDto[]) {
		if (
			![
				OrderStatusEnum['Giao thành công'],
				OrderStatusEnum['Chờ lấy hàng'],
				OrderStatusEnum['Hoàn thành']
			].includes(order.order_status_id)
		)
			return;

		await Promise.all(
			details.map(async (orderDetailItem) => {
				await this.productService.decrementProductInventory(
					orderDetailItem.product_id,
					order.warehouse_id,
					orderDetailItem.quantity
				);
			})
		);
	}

	async incrementInventoryAfterOrderFail(order: Order, details: OrderDetail[]) {
		if (![OrderStatusEnum['Đã Huỷ'], OrderStatusEnum['Đã chuyển hoàn']].includes(order.order_status_id)) return;

		await Promise.all(
			details.map(async (orderDetailItem) => {
				await Promise.all([
					this.productService.incrementVirtualStockQuantity(
						orderDetailItem.product_id,
						orderDetailItem.quantity
					),
					this.productService.incrementProductInventory(
						orderDetailItem.product_id,
						order.warehouse_id,
						orderDetailItem.quantity
					)
				]);
			})
		);
	}

	async createCustomerPointFromOrder(order: Order): Promise<void> {
		if (![OrderStatusEnum['Giao thành công'], OrderStatusEnum['Hoàn thành']].includes(order.order_status_id))
			return;
		const customerPayload: IncrementCustomerPointDto = {
			seller_id: order.seller_id,
			customer_id: order.customer_id,
			description: messages.order.incrementCustomerPoint(order.id),
			ref_id: order.id,
			ref_source: CustomerHistoryPointRefSourceEnum.order,
			type_operator: CustomerHistoryPointOperatorEnum.add,
			goods_total_price: order.final_total_money_amount
		};
		await this.customerService.incrementCustomerPoint(customerPayload);
	}

	async decrementCustomerPointFromOrder(order: Order) {
		if (order.used_point === 0) return;
		const customerPayload: DecrementCustomerPointDto = {
			seller_id: order.seller_id,
			customer_id: order.customer_id,
			description: messages.order.decrementCustomerPoint(order.id),
			ref_id: order.id,
			ref_source: CustomerHistoryPointRefSourceEnum.order,
			type_operator: CustomerHistoryPointOperatorEnum.subtract,
			goods_total_price: order.final_total_money_amount,
			point_value: order.used_point,
			corresponding_amount: order.used_point_value
		};
		await this.customerService.decrementCustomerPoint(customerPayload);
	}

	async reIncrementCustomerPointFromOrderFail(order: Order) {
		if (order.used_point === 0) return;
		const customerPayload: ReIncrementCustomerPointDto = {
			seller_id: order.seller_id,
			customer_id: order.customer_id,
			description: messages.order.incrementCustomerPointDueToOrderFail(order.id),
			ref_id: order.id,
			ref_source: CustomerHistoryPointRefSourceEnum.order,
			type_operator: CustomerHistoryPointOperatorEnum.add,
			goods_total_price: order.final_total_money_amount,
			point_value: order.used_point,
			corresponding_amount: order.used_point_value
		};
		await this.customerService.reIncrementCustomerPoint(customerPayload);
	}

	async createOrderDelivery(orderId: number, target_status_id, transaction: Transaction): Promise<void> {
		const order = await this.OrderModel.findByPk(orderId, { include: [Warehouse] });
		if (!order) {
			throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		}
		const { warehouse } = order.toJSON();
		const payloadCreateDelivery = {
			...order.toJSON(),
			order_id: order.id,
			sender_name: warehouse.warehouse_name,
			sender_phone: warehouse.phone,
			sender_address: warehouse.address,
			sender_ward: warehouse.ward_name,
			sender_district: warehouse.district_name,
			sender_province: warehouse.province_name,
			notes: order.notes,
			current_location: warehouse.province_name,
			order_status_id: target_status_id,
			debit_amount: this.handleDebitAmountForDelivery(order),
			order_status_name: getKeyByValue(OrderStatusEnum, target_status_id),
			packaging_at: formatMySQLTimeStamp()
		};

		delete payloadCreateDelivery.id;

		const orderDelivery = await this.OrderDeliveryModel.create(payloadCreateDelivery as any, { transaction });

		await this.OrderDetailModel.update(
			{ order_delivery_id: orderDelivery.id },
			{ where: { order_id: orderId }, transaction }
		);
	}

	handleDebitAmountForDelivery(order: Order) {
		const getOrderDebitAmount = {
			[ShippingUnitIdsEnum.NTL]: {
				[DeliveryPaymentMethodEnum['Người gửi thanh toán ngay']]: Math.max(
					order.cod - order.delivery_cod_fee,
					0
				),
				[DeliveryPaymentMethodEnum['Người gửi thanh toán sau']]: Math.max(
					order.shipping_fee - order.delivery_cod_fee,
					0
				),
				[DeliveryPaymentMethodEnum['Người gửi thanh toán sau']]: Math.max(
					order.shipping_fee - order.delivery_cod_fee,
					0
				)
			}
		};
		return getOrderDebitAmount[order.shipping_unit_id][order.delivery_service_id];
	}

	determineOrderPaymentMethod(paymentDetails: PaymentDetailDto[]) {
		return paymentDetails
			.map((ele) => {
				return ele.payment_method_id ? `${filterSeperator}${ele.payment_method_id}${filterSeperator}` : null;
			})
			.filter(Boolean)
			.join(',');
	}

	getOrderMoneyAmount(
		orderDetails: OrderDetailDto[],
		shippingFee = 0,
		usedPointValue = 0,
		codFee = 0
	): IOrderMoneyAmount {
		return orderDetails.reduce(
			(acc, ele) => {
				acc.totalQuantityAmount += ele.quantity;
				acc.totalDiscountMoneyAmount += ele.discount || 0;
				acc.totalMoneyAmount += ele.quantity * ele.price;
				acc.finalTotalMoneyAmount += ele.quantity * ele.price - ele.discount;
				return acc;
			},
			{
				totalQuantityAmount: 0,
				totalDiscountMoneyAmount: 0,
				totalMoneyAmount: 0,
				finalTotalMoneyAmount: shippingFee - usedPointValue + codFee
			}
		);
	}

	getTotalPaidMoneyAmount(paymentDetails: PaymentDetailDto[], couponValue: number) {
		return paymentDetails?.length
			? paymentDetails.reduce((acc, ele) => {
					if (ele.payment_method_id !== PaymentMethodEnum.COD) {
						return acc + ele.amount;
					}
					return acc;
			  }, 0)
			: 0;
	}

	getOrderDetailsPayload(orderDetails: OrderDetailDto[], orderId: number, sellerId: number) {
		return orderDetails.reduce((acc: OrderDetailDto[], ele: OrderDetailDto) => {
			const totalMoneyAmount = ele.quantity * ele.price;
			const finalTotalMoneyAmount =
				ele.discount_type === DiscountTypeEnum.Fixed
					? totalMoneyAmount - ele.discount
					: totalMoneyAmount * (100 - ele.discount);
			const orderItemPayload = {
				...ele,
				total_money_amount: totalMoneyAmount,
				final_total_money_amount: finalTotalMoneyAmount,
				order_id: orderId,
				seller_id: sellerId
			};
			acc.push(orderItemPayload);
			return acc;
		}, []);
	}

	async createOrderDetails(
		sellerId: number,
		orderId: number,
		orderDetails: OrderDetailDto[],
		transaction: Transaction
	): Promise<void> {
		const orderDetailPayloads = this.getOrderDetailsPayload(orderDetails, orderId, sellerId);

		await this.OrderDetailModel.bulkCreate(orderDetailPayloads as any[], {
			transaction
		});
	}

	async createOrderPaymentDetails(
		sellerId: number,
		orderId: number,
		orderPaymentDetails: PaymentDetailDto[],
		transaction: Transaction
	): Promise<void> {
		if (orderPaymentDetails) {
			const orderPaymentDetailPayloads = orderPaymentDetails.reduce((acc, ele) => {
				const orderPaymentDetailPayload = {
					...ele,
					order_id: orderId,
					sellerId: sellerId
				};
				acc.push(orderPaymentDetailPayload);
				return acc;
			}, []);
			await this.OrderPaymentDetailModel.bulkCreate(orderPaymentDetailPayloads, { transaction });
		}
	}

	async createOrderStatusLog(
		sellerId: number,
		orderId: number,
		statusId: OrderStatusEnum,
		handledBy: number,
		transaction: Transaction
	): Promise<void> {
		const payloadData = {
			seller_id: sellerId,
			order_id: orderId,
			order_status_id: statusId,
			order_status_name: getKeyByValue(OrderStatusEnum, statusId),
			handled_by: handledBy
		};
		await this.OrderStatusLogModel.create(payloadData, { transaction });
	}

	async createOrderPaymentLog(
		sellerId: number,
		orderId: number,
		statusId: PaymentStatusEnum,
		transaction: Transaction
	): Promise<void> {
		const payloadData = {
			order_id: orderId,
			payment_status: statusId,
			payment_status_name: getKeyByValue(PaymentStatusEnum, statusId),
			seller_id: sellerId
		};
		await this.OrderPaymentLogModel.create(payloadData, { transaction });
	}

	determineOrderStatus(platformId: number, receiveAtStore: boolean) {
		if (platformId === PlatformEnum.POS) {
			if (receiveAtStore) return OrderStatusEnum['Hoàn thành'];
			return OrderStatusEnum['Chờ đóng gói'];
		}

		return OrderStatusEnum['Đã xác nhận'];
	}

	determineOrderPaymentStatus(
		platformId: number,
		receiveAtStore: boolean,
		totalPaidMoneyAmount: number,
		finalTotalMoneyAmount: number
	) {
		// if (totalPaidMoneyAmount > finalTotalMoneyAmount) {
		// throw new HttpException(messages.order.paymentError, HttpStatus.BAD_REQUEST);
		// }

		if (platformId === PlatformEnum.POS && receiveAtStore) {
			return PaymentStatusEnum['Đã thanh toán'];
		}

		if (totalPaidMoneyAmount === 0) {
			return PaymentStatusEnum['Chưa thanh toán'];
		}

		if (totalPaidMoneyAmount === finalTotalMoneyAmount) {
			return PaymentStatusEnum['Đã thanh toán'];
		}

		return PaymentStatusEnum['Thanh toán một phần'];
	}

	determineOrderDeliveryStatus(
		platformId: number,
		receiveAtStore: boolean,
		orderStatusId: DeliveryStatusEnum = null
	): IOrderDeliveryStatus {
		if (platformId === PlatformEnum.POS && receiveAtStore) {
			return {
				deliveryStatusId: DeliveryStatusEnum['Giao thành công'],
				deliveryStatusName: getKeyByValue(DeliveryStatusEnum, DeliveryStatusEnum['Giao thành công'])
			};
		}
		const deliveryStatusId = Object.values(DeliveryStatusEnum).includes(orderStatusId) ? orderStatusId : null;
		const deliveryStatusName = deliveryStatusId ? getKeyByValue(DeliveryStatusEnum, deliveryStatusId) : null;
		return { deliveryStatusId, deliveryStatusName };
	}

	determineOrderDateTime(orderStatus: OrderStatusEnum): IOrderDateTime {
		const createDateTimeWhenStatusMatch = (status: OrderStatusEnum) => {
			if (orderStatus === status) return formatMySQLTimeStamp();
			return undefined;
		};

		return filterData({
			delivery_date: createDateTimeWhenStatusMatch(OrderStatusEnum['Đang vận chuyển']),
			confirmed_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Đã xác nhận']),
			packaged_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Đã đóng gói']),
			push_shipping_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Chờ lấy hàng']),
			delivery_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Đang giao hàng']),
			delivery_success_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Giao thành công']),
			returned_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Đã chuyển hoàn']),
			closed_at: createDateTimeWhenStatusMatch(OrderStatusEnum['Hoàn thành'])
		});
	}

	async updateOrder(user: IUserAuth, orderId: number, data: UpdateOrderDto, transaction: Transaction): Promise<void> {
		const { sellerId: seller_id, userId } = user;
		const payloadData = filterData<UpdateOrderDto>(data);

		const currentOrder = await this.OrderModel.findOne({
			where: { seller_id: seller_id, id: orderId },
			raw: true
		});

		if (!currentOrder) {
			throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		}

		if ([OrderStatusEnum['Đã xác nhận'], OrderStatusEnum['Chờ đóng gói']].includes(currentOrder.order_status_id)) {
			return this.updateNewOrder(user, orderId, currentOrder, payloadData, transaction);
		}
	}

	async updateNewOrder(
		{ userId, sellerId }: any,
		orderId: number,
		currentOrder: Order,
		payloadData: UpdateOrderDto,
		transaction: Transaction
	) {
		const deliveryPaymentBy = this.determineOrderDeliveryPaymentBy(payloadData);
		const { totalQuantityAmount, totalMoneyAmount, finalTotalMoneyAmount, totalDiscountMoneyAmount } =
			this.getOrderMoneyAmount(
				payloadData.details,
				deliveryPaymentBy === PersonPayDeliveryFee['Người nhận thanh toán'] ? payloadData.shipping_fee : 0,
				payloadData.used_point_value,
				payloadData.delivery_cod_fee
			);

		const totalPaidMoneyAmount = this.getTotalPaidMoneyAmount(
			payloadData.payment_details,
			payloadData.coupon_value
		);

		const paymentStatus = this.determineOrderPaymentStatus(
			payloadData.platform_id,
			payloadData.receive_at_store,
			totalPaidMoneyAmount,
			finalTotalMoneyAmount
		);

		const orderStatus = this.determineOrderStatus(payloadData.platform_id, payloadData.receive_at_store);

		const { deliveryStatusId, deliveryStatusName } = this.determineOrderDeliveryStatus(
			payloadData.platform_id,
			payloadData.receive_at_store
		);
		const orderDateTime = this.determineOrderDateTime(orderStatus);
		const paymentMethodIds = this.determineOrderPaymentMethod(payloadData.payment_details);

		const orderPayload = {
			...payloadData,
			...orderDateTime,
			order_status_id: orderStatus,
			order_status_name: getKeyByValue(OrderStatusEnum, orderStatus),
			temp_total_money_amount: totalMoneyAmount,
			final_total_money_amount: finalTotalMoneyAmount,
			total_discount_money_amount: totalDiscountMoneyAmount,
			paid_money_amount: totalPaidMoneyAmount,
			cod: finalTotalMoneyAmount - totalPaidMoneyAmount,
			total_quantity: totalQuantityAmount,
			payment_status: paymentStatus,
			payment_status_name: getKeyByValue(PaymentMethodEnum, paymentStatus),
			payment_method_id: paymentMethodIds,
			payment_at: paymentStatus === PaymentStatusEnum['Đã thanh toán'] ? formatMySQLTimeStamp() : null,
			delivery_payment_by: deliveryPaymentBy,
			delivery_status_id: deliveryStatusId,
			delivery_status_name: deliveryStatusName,
			updated_by: userId
		};

		await this.OrderModel.update(orderPayload, { where: { id: orderId } });

		const orderDetailPayloads = this.getOrderDetailsPayload(payloadData.details, orderId, sellerId);

		if (payloadData.removed_details) {
			await Promise.all(
				payloadData.removed_details.map(async (detailId) => {
					await this.OrderDetailModel.destroy({
						where: { id: detailId },
						transaction
					});
				})
			);
		}

		await this.OrderDetailModel.bulkCreate(orderDetailPayloads as any[], {
			updateOnDuplicate: [
				'order_id',
				'sku',
				'barcode',
				'product_id',
				'product_name',
				'quantity',
				'price',
				'discount',
				'discount_type',
				'total_money_amount',
				'final_total_money_amount'
			],
			transaction
		});

		if (payloadData.removed_payment_details) {
			await Promise.all(
				payloadData.removed_payment_details.map(async (paymentDetailId) => {
					await this.OrderPaymentDetailModel.destroy({
						where: { id: paymentDetailId },
						transaction
					});
				})
			);
		}

		if (payloadData.payment_details) {
			const orderPaymentDetailPayloads = payloadData.payment_details.reduce((acc, ele) => {
				const orderPaymentDetailPayload = {
					...ele,
					order_id: orderId
				};
				acc.push(orderPaymentDetailPayload);
				return acc;
			}, []);
			await this.OrderPaymentDetailModel.bulkCreate(orderPaymentDetailPayloads, {
				transaction,
				updateOnDuplicate: [
					'order_id',
					'payment_method_id',
					'payment_method_name',
					'payment_code',
					'amount',
					'payment_at'
				]
			});
		}

		if (orderStatus !== currentOrder.order_status_id) {
			await this.createOrderStatusLog(sellerId, orderId, orderStatus, userId, transaction);
		}

		if (paymentStatus !== currentOrder.payment_status) {
			await this.createOrderPaymentLog(sellerId, orderId, paymentStatus, transaction);
		}
	}

	async updateOrderStatuses(user: IUserAuth, data: UpdateOrderStatusDto, transaction: Transaction): Promise<any> {
		try {
			const { userId, sellerId } = user;
			const { ids, target_order_status_id, current_order_status_id } = data;
			if (target_order_status_id === current_order_status_id) {
				throw new HttpException(messages.order.currentAndTargetOrderStatusConflict, HttpStatus.BAD_REQUEST);
			}
			const whereClause = this.findOrderStatusFromUpdateOrderStatusesService(current_order_status_id, ids);

			const count = await this.OrderModel.count({
				where: whereClause
			});

			if (count !== ids.length) {
				throw new HttpException(messages.order.currentAndTargetOrderStatusConflict, HttpStatus.BAD_REQUEST);
			}

			this.checkOrderStatusMatch(current_order_status_id, target_order_status_id);

			const orderDateTime: IOrderDateTime = this.determineOrderDateTime(target_order_status_id);

			const updateDefault = (orderId: number, transaction: Transaction) => [
				this.OrderModel.update(
					{
						...orderDateTime,
						order_status_id: target_order_status_id,
						order_status_name: getKeyByValue(OrderStatusEnum, target_order_status_id)
					},
					{ where: { id: orderId }, transaction }
				),
				this.createOrderStatusLog(sellerId, orderId, target_order_status_id, userId, transaction)
			];

			switch (target_order_status_id) {
				case OrderStatusEnum['Chờ đóng gói']: {
					return await Promise.all(
						ids.map(async (orderId) => {
							await Promise.all([
								...updateDefault(orderId, transaction),
								this.createOrderDelivery(orderId, target_order_status_id, transaction)
							]);
						})
					);
				}
				case OrderStatusEnum['Đã đóng gói']: {
					return await Promise.all(
						ids.map(async (orderId) => {
							await Promise.all([
								...updateDefault(orderId, transaction),
								this.updateOrderDeliveryStatusForPackaged(orderId, target_order_status_id, transaction)
							]);
						})
					);
				}
				case OrderStatusEnum['Chờ lấy hàng']: {
					return await Promise.all(
						ids.map(async (orderId) => {
							await Promise.all([
								...updateDefault(orderId, transaction),
								this.UpdateOrderStatusesWaitingDelivery(sellerId, orderId, transaction),
								this.getByOrderIdAndDecrementInventoryAfterSendingShippingUnit(orderId)
							]);
						})
					);
				}
				case OrderStatusEnum['Giao thành công']: {
					return await this.getOrderByListIdsAndIncrCustomerPoin(data.ids);
				}
				case OrderStatusEnum['Hoàn thành']: {
					return await Promise.all([
						...ids.map(async (orderId) => {
							await Promise.all([
								...updateDefault(orderId, transaction),
								this.UpdateOrderClose(orderId, transaction)
							]);
						}),
						this.getOrderByListIdsAndIncrCustomerPoin(data.ids)
					]);
				}
				case OrderStatusEnum['Đã chuyển hoàn']: {
					return await Promise.all(
						ids.map(async (orderId) => {
							await Promise.all([
								...updateDefault(orderId, transaction),
								this.getByOrderIdAndIncrementInventoryAfterOrderFail(orderId),
								this.findByIdAndIncrCustomerPointFromOrderFail(orderId)
							]);
						})
					);
				}
				default: {
					return await Promise.all(
						ids.map(async (orderId) => {
							await Promise.all(updateDefault(orderId, transaction));
						})
					);
				}
			}
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	async findByIdAndIncrCustomerPointFromOrderFail(orderId: number) {
		const order = await this.OrderModel.findByPk(orderId);
		await this.reIncrementCustomerPointFromOrderFail(order);
	}

	async getByOrderIdAndDecrementInventoryAfterSendingShippingUnit(orderId: number) {
		const order = await this.OrderModel.findByPk(orderId, { include: [OrderDetail] });
		if (!order) throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		await this.decrementInventoryAfterSendingShippingUnit(order, order.details);
	}

	async getByOrderIdAndIncrementInventoryAfterOrderFail(orderId: number) {
		const order = await this.OrderModel.findByPk(orderId, { include: [OrderDetail] });
		if (!order) throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		await this.incrementInventoryAfterOrderFail(order, order.details);
	}

	async getOrderByListIdsAndIncrCustomerPoin(orderIds: number[]) {
		const orders = await this.OrderModel.findAll({ where: { id: { [Op.in]: orderIds } } });
		await Promise.all(
			orders.map(async (order) => {
				await this.createCustomerPointFromOrder(order);
			})
		);
	}

	async updateOrderDeliveryStatusForPackaged(
		orderId: number,
		orderStatusId: number,
		transaction: Transaction
	): Promise<void> {
		await this.OrderDeliveryModel.update(
			{
				order_status_id: orderStatusId,
				order_status_name: getKeyByValue(OrderStatusEnum, orderStatusId),
				packaged_at: formatMySQLTimeStamp()
			},
			{ where: { order_id: orderId }, transaction }
		);
	}

	findOrderStatusFromUpdateOrderStatusesService(currentOrderStatusId: number, ids: number[]) {
		const whereClause: any = { id: { [Op.in]: ids } };
		if (currentOrderStatusId === OrderStatusEnum['Thanh toán thành công']) {
			whereClause.order_status_id = OrderStatusEnum['Đã xác nhận'];
		}
		return whereClause;
	}

	async UpdateOrderStatusesWaitingDelivery(
		sellerId: number,
		orderId: number,
		transaction: Transaction
	): Promise<void> {
		try {
			const order = await this.OrderModel.findByPk(orderId, {
				include: [OrderDetail, Warehouse]
			});
			if (!order) {
				throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
			}
			const responseData = await this.shippingUnitService.createBillShippingNTL(sellerId, order.toJSON());
			console.log('----------==-=-=-=-=--===------------------======--=---------');
			console.log(responseData);
			console.log('----------==-=-=-=-=--===------------------======--=---------');
			const payloadUpdateOrder = {
				delivery_id: responseData.bill_id,
				delivery_code: responseData.bill_code,
				delivery_main_fee: responseData.main_fee,
				delivery_cod_fee: responseData.cod_fee,
				delivery_insurance_fee: responseData.insurr_fee,
				delivery_lifting_fee: responseData.lifting_fee,
				delivery_remote_fee: responseData.remote_fee,
				delivery_counting_fee: responseData.counting_fee,
				delivery_packing_fee: responseData.packing_fee,
				push_shipping_at: formatMySQLTimeStamp(),
				order_status_id: OrderStatusEnum['Chờ lấy hàng'],
				order_status_name: getKeyByValue(OrderStatusEnum, OrderStatusEnum['Chờ lấy hàng'])
			};

			const { warehouse } = order.toJSON();

			const payloadCreateDelivery = {
				...order.toJSON(),
				...payloadUpdateOrder,
				order_id: order.id,
				delivery_status_id: NTLShippingUnitStatusesEnum['Chờ lấy hàng-Waiting'],
				delivery_status_name: getKeyByValue(
					NTLShippingUnitStatusesEnum,
					NTLShippingUnitStatusesEnum['Chờ lấy hàng-Waiting']
				),
				sender_name: warehouse.warehouse_name,
				sender_phone: warehouse.phone,
				sender_address: warehouse.address,
				sender_ward: warehouse.ward_name,
				sender_district: warehouse.district_name,
				sender_province: warehouse.province_name,
				notes: order.notes,
				current_location: warehouse.province_name,
				push_shipping_at: formatMySQLTimeStamp()
			};
			delete payloadCreateDelivery.id;
			const orderDeliveryExist = await this.OrderDeliveryModel.findOne({ where: { order_id: orderId } });

			const [_, orderDeliveryResponse]: any = await Promise.all([
				this.OrderModel.update(payloadUpdateOrder, {
					where: { id: orderId },
					transaction
				}),
				orderDeliveryExist
					? this.OrderDeliveryModel.update(payloadCreateDelivery as any, {
							where: { order_id: orderId },
							transaction
					  })
					: this.OrderDeliveryModel.create(payloadCreateDelivery as any, {
							transaction
					  })
			]);

			const orderDeliveryResult = orderDeliveryExist ?? (orderDeliveryResponse as OrderDelivery);

			if (orderDeliveryResult) {
				const payloadCreateDeliveryLog = {
					...orderDeliveryResult.toJSON(),
					...payloadCreateDelivery,
					order_delivery_id: orderDeliveryResult.id
				};
				delete payloadCreateDeliveryLog.id;

				await Promise.all([
					this.OrderDeliveryLogModel.create(payloadCreateDeliveryLog as any, { transaction }),
					this.OrderDetailModel.update(
						{ order_delivery_id: orderDeliveryResult.id },
						{ where: { order_id: orderId }, transaction }
					),
					...order.toJSON().details.map(async (orderItem) => {
						await this.productService.decrementProductQuantityInventory(
							orderItem.product_id,
							order.warehouse_id,
							orderItem.quantity,
							transaction
						);
					})
				]);
			} else {
				throw new HttpException(messages.order.deliveryLogFail, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			console.log(error.stack);
			throw new HttpException(error.message, error.status);
		}
	}

	async UpdateOrderClose(orderId: number, transaction: Transaction) {
		const currentOrder = await this.OrderModel.findByPk(orderId);
		if (+currentOrder.cod !== 0) {
			await Promise.all([
				this.OrderModel.update(
					{
						cod: 0,
						paid_money_amount: currentOrder.final_total_money_amount,
						payment_status: PaymentStatusEnum['Đã thanh toán']
					},
					{ where: { id: orderId }, transaction }
				),
				this.OrderPaymentDetailModel.create(
					{
						order_id: orderId,
						payment_method_id: PaymentMethodEnum.COD,
						payment_method_name: getKeyByValue(PaymentMethodEnum, PaymentMethodEnum.COD),
						amount: currentOrder.cod,
						payment_at: new Date()
					},
					{ transaction }
				)
			]);
		}
	}

	checkOrderStatusMatch(currentStatus: OrderStatusEnum, newStatus: OrderStatusEnum): void {
		let isMatch = false;
		switch (currentStatus) {
			case OrderStatusEnum['Mới']:
				{
					if ([OrderStatusEnum['Đã xác nhận'], OrderStatusEnum['Đã Huỷ']].includes(newStatus)) {
						isMatch = true;
					}
				}
				break;
			case OrderStatusEnum['Đã xác nhận']:
				{
					if (
						[
							OrderStatusEnum['Chờ đóng gói'],
							OrderStatusEnum['Đã đóng gói'],
							OrderStatusEnum['Đã Huỷ'],
							OrderStatusEnum['Hoàn thành']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Chờ đóng gói']:
			case OrderStatusEnum['Đã đóng gói']:
				{
					if (
						[
							OrderStatusEnum['Đã đóng gói'],
							OrderStatusEnum['Chờ lấy hàng'],
							OrderStatusEnum['Đã Huỷ']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Thanh toán thành công']:
				{
					if (
						[
							OrderStatusEnum['Chờ đóng gói'],
							OrderStatusEnum['Đã đóng gói'],
							OrderStatusEnum['Hoàn thành']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;

			case OrderStatusEnum['Chờ lấy hàng']:
				{
					if ([OrderStatusEnum['Đang vận chuyển']].includes(newStatus)) isMatch = true;
				}
				break;
			case OrderStatusEnum['Đang vận chuyển']:
			case OrderStatusEnum['Chờ giao lại']:
				{
					if (
						[
							OrderStatusEnum['Đang giao hàng'],
							OrderStatusEnum['Đang chuyển hoàn'],
							OrderStatusEnum['Đã chuyển hoàn']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Đang giao hàng']:
				{
					if (
						[
							OrderStatusEnum['Giao thành công'],
							OrderStatusEnum['Lỗi giao hàng'],
							OrderStatusEnum['Đang chuyển hoàn'],
							OrderStatusEnum['Đã chuyển hoàn']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Lỗi giao hàng']:
				{
					if (
						[
							OrderStatusEnum['Chờ giao lại'],
							OrderStatusEnum['Đang chuyển hoàn'],
							OrderStatusEnum['Đã chuyển hoàn']
						].includes(newStatus)
					)
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Đang chuyển hoàn']:
			case OrderStatusEnum['Đã chuyển hoàn']:
				{
					if ([OrderStatusEnum['Đã chuyển hoàn'], OrderStatusEnum['Hoàn thành']].includes(newStatus))
						isMatch = true;
				}
				break;
			case OrderStatusEnum['Giao thành công']:
				{
					{
						if ([OrderStatusEnum['Hoàn thành']].includes(newStatus)) isMatch = true;
					}
				}
				break;
		}

		if (isMatch === false) {
			throw new HttpException(messages.order.orderStatusNotMatch, HttpStatus.BAD_REQUEST);
		}
	}

	updateOrderValidation(currentOrder: Order, updateOrder: UpdateOrderDto) {
		if (![OrderStatusEnum.Mới].includes(currentOrder.order_status_id)) {
			[
				'b_fullname',
				'b_phone',
				'b_email',
				'b_dob',
				'b_gender',
				's_fullname',
				's_phone',
				's_email',
				's_province_id',
				's_province',
				's_district_id',
				's_district',
				's_ward_id',
				's_ward',
				's_address',
				'notes',
				'delivery_request'
			].forEach((key) => {
				if (updateOrder[key] !== undefined && updateOrder[key] !== currentOrder[key]) {
					throw new HttpException(messages.order.unableUpdateCustomerInfo, HttpStatus.BAD_REQUEST);
				}
			});

			if (updateOrder?.payment_details?.length) {
				throw new HttpException(messages.order.unableUpdateOrderPayment, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async cancelOrder(user: IUserAuth, orderId: number, transaction: Transaction): Promise<void> {
		const { sellerId, userId } = user;
		const currentOrder = await this.OrderModel.findOne({
			where: { seller_id: sellerId, id: orderId }
		});
		if (!currentOrder) {
			throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		}

		switch (currentOrder.order_status_id) {
			case OrderStatusEnum.Mới:
			case OrderStatusEnum['Thanh toán thất bại']:
			case OrderStatusEnum['Đã xác nhận']:
			case OrderStatusEnum['Chờ đóng gói']: {
				await Promise.all([
					this.OrderModel.update(
						{
							order_status_id: OrderStatusEnum['Đã Huỷ'],
							order_status_name: getKeyByValue(OrderStatusEnum, OrderStatusEnum['Đã Huỷ']),
							canceled_at: new Date(),
							updated_by: userId
						},
						{ where: { id: orderId }, transaction }
					),
					this.createOrderStatusLog(sellerId, orderId, OrderStatusEnum['Đã Huỷ'], userId, transaction),
					this.updateProductQuantityWhenCancelOrder(currentOrder, transaction)
				]);

				return;
			}

			default: {
				throw new HttpException(messages.order.cancelFail, HttpStatus.BAD_REQUEST);
			}
		}
	}

	async updateProductQuantityWhenCancelOrder(currentOrder: Order, transaction: Transaction): Promise<void> {
		const orderDetails = await this.OrderDetailModel.findAll({ where: { order_id: currentOrder.id } });
		await Promise.all(
			orderDetails.map(async (orderItem) => {
				await this.productService.changeProductInventory(
					orderItem.product_id,
					orderItem.quantity,
					transaction,
					currentOrder.warehouse_id,
					ProductInventoryOperatorEnum.Add
				);
			})
		);
	}

	async getOrderList(seller_id, queryParams: OrderQueryParamsDto): Promise<ResponseAbstractList<Order>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const whereClause = OrderQueryParamsDto.getOrdersListQueryParams(seller_id, queryParams);
		const { rows, count } = parseDataSqlizeResponse(
			await this.OrderModel.findAndCountAll({
				where: whereClause,
				include: [{ model: OrderDetail }],
				order: [['updated_at', 'DESC']],
				limit,
				offset,
				distinct: true,
				logging: true
			})
		);
		return returnListWithPaging(page, limit, count, rows);
	}

	async reportOrderStatuses(sellerId: number, queryParams: OrderQueryParamsDto) {
		const queryParamsWhereClause = OrderQueryParamsDto.getReportOrderStatusesQueryParams(sellerId, queryParams);
		console.log(queryParamsWhereClause);
		const fromString = this.fromStringReportOrderStatuses(queryParamsWhereClause);

		const sqlQuery = `
			SELECT * 
			FROM (
				${fromString}
			)
		`;
		const [[result]] = await sequelize.query(sqlQuery, { logging: true });
		return result as OrderReportStatusesDto;
	}

	fromStringReportOrderStatuses(queryParamsWhereClause: string): string {
		return [
			this.reportCountOrderQueryString(queryParamsWhereClause, 'inProgressCount', [
				OrderStatusEnum.Mới,
				OrderStatusEnum['Thanh toán thất bại'],
				OrderStatusEnum['Đã Huỷ']
			]),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'inProgressAmount', [
				OrderStatusEnum.Mới,
				OrderStatusEnum['Thanh toán thất bại'],
				OrderStatusEnum['Đã Huỷ']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'confirmedAndPaymentSuccessCount'),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'confirmedAndPaymentSuccessAmount'),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'confirmedCount'),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'confirmedAmount'),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'packageCount', [
				OrderStatusEnum['Đã đóng gói'],
				OrderStatusEnum['Chờ đóng gói']
			]),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'packageAmount', [
				OrderStatusEnum['Đã đóng gói'],
				OrderStatusEnum['Chờ đóng gói']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'shippingCount', [
				OrderStatusEnum['Chờ lấy hàng'],
				OrderStatusEnum['Đang vận chuyển'],
				OrderStatusEnum['Đang giao hàng'],
				OrderStatusEnum['Giao thành công']
			]),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'shippingAmount', [
				OrderStatusEnum['Chờ lấy hàng'],
				OrderStatusEnum['Đang vận chuyển'],
				OrderStatusEnum['Đang giao hàng'],
				OrderStatusEnum['Giao thành công']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'failShipCount', [
				OrderStatusEnum['Đang chuyển hoàn'],
				OrderStatusEnum['Đã chuyển hoàn']
			]),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'failShipAmount', [
				OrderStatusEnum['Đang chuyển hoàn'],
				OrderStatusEnum['Đã chuyển hoàn'],
				OrderStatusEnum['Lỗi giao hàng']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'completedCount', [OrderStatusEnum['Hoàn thành']]),
			this.reportOrderTotalMoneyAmountQueryString(queryParamsWhereClause, 'completedAmount', [
				OrderStatusEnum['Hoàn thành']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'countNewOrder', [OrderStatusEnum.Mới]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'failPaymentCount', null, [
				PaymentStatusEnum['Thanh toán thất bại']
			]),
			this.reportCountOrderQueryString(
				queryParamsWhereClause,
				'successPaymentCount',
				[OrderStatusEnum['Đã xác nhận']],
				[PaymentStatusEnum['Đã thanh toán']]
			),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'waitingPackagedCount', [
				OrderStatusEnum['Chờ đóng gói']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'packagedCount', [OrderStatusEnum['Đã đóng gói']]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'waitingForGoodsCount', [
				OrderStatusEnum['Chờ lấy hàng']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'transportingCount', [
				OrderStatusEnum['Đang vận chuyển']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'deliveryCount', [
				OrderStatusEnum['Đang giao hàng']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'successfulDeliveryCount', [
				OrderStatusEnum['Giao thành công']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'errorDeliveryCount', [
				OrderStatusEnum['Lỗi giao hàng']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'movingBackCount', [
				OrderStatusEnum['Đang chuyển hoàn']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'movedBackCount', [
				OrderStatusEnum['Đã chuyển hoàn']
			]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'cancelledCount', [OrderStatusEnum['Đã Huỷ']]),
			this.reportCountOrderQueryString(queryParamsWhereClause, 'waitingDeliveryAgain', [
				OrderStatusEnum['Chờ giao lại']
			])
		].join(', ');
	}

	reportCountOrderQueryString(
		originCondition: string,
		alias: string,
		orderStatuses: number[] = [],
		paymentStatuses: string[] = []
	) {
		if (alias === 'confirmedAndPaymentSuccessCount') {
			return ` (SELECT 
				IFNULL(COUNT(*),0) AS confirmedAndPaymentSuccessCount 
			FROM
				orders 
			WHERE ${originCondition} 
				AND ( order_status_id IN (
					${OrderStatusEnum['Đã xác nhận']}		
				) OR (payment_status = ${PaymentStatusEnum['Đã thanh toán']} AND order_status_id IN (${OrderStatusEnum['Đã xác nhận']}) ) )
			) AS confirmedAndPaymentSuccessCount`;
		}

		if (alias === 'confirmedCount') {
			return `(SELECT 
				IFNULL(COUNT(*),0) AS ${alias} 
			  FROM
				orders 
			  WHERE ${originCondition} 
				AND order_status_id IN (
				  ${OrderStatusEnum['Đã xác nhận']}			
				) AND payment_status != ${PaymentStatusEnum['Đã thanh toán']}) AS ${alias}`;
		}

		if (paymentStatuses?.length && orderStatuses?.length) {
			return `
			(SELECT 
				IFNULL(COUNT(*),0) AS ${alias} 
			FROM
				orders 
			WHERE ${originCondition} 
				AND payment_status IN (${paymentStatuses.join(', ')}) AND order_status_id IN (${orderStatuses.join(', ')})
			) AS ${alias}`;
		}

		if (orderStatuses?.length) {
			return `
			(SELECT 
				IFNULL(COUNT(*),0) AS ${alias} 
			FROM
				orders 
			WHERE ${originCondition} 
				AND order_status_id IN (
					${orderStatuses.join(', ')}
				)) AS ${alias}`;
		}

		if (paymentStatuses?.length) {
			return `
			(SELECT 
				IFNULL(COUNT(*),0) AS ${alias}  
			FROM
				orders 
			WHERE ${originCondition} 
				AND payment_status IN (
					${paymentStatuses.join(', ')}
				)) AS ${alias}`;
		}
	}

	reportOrderTotalMoneyAmountQueryString(
		originCondition: string,
		alias: string,
		orderStatuses: number[] = [],
		paymentStatuses: string[] = []
	) {
		if (alias === 'confirmedAndPaymentSuccessAmount') {
			return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount),0) + 0E0 AS confirmedAndPaymentSuccessAmount 
			FROM
				orders 
			WHERE ${originCondition} 
				AND ( order_status_id IN (
					${OrderStatusEnum['Đã xác nhận']}			
					) OR (payment_status = ${PaymentStatusEnum['Đã thanh toán']} AND order_status_id IN (${OrderStatusEnum['Đã xác nhận']}) ) )
			) AS confirmedAndPaymentSuccessAmount
			`;
		}

		if (alias === 'confirmedAmount') {
			return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount), 0) + 0E0 AS confirmedAmount
			FROM
				orders 
			WHERE ${originCondition} 
				AND order_status_id IN (
				  ${OrderStatusEnum['Đã xác nhận']}			
				) AND payment_status != ${PaymentStatusEnum['Đã thanh toán']}) AS confirmedAmount`;
		}

		if (paymentStatuses?.length && orderStatuses?.length) {
			return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount),0) + 0E0 AS ${alias} 
			FROM
				orders 
			WHERE ${originCondition} 
				AND payment_status IN (${paymentStatuses.join(', ')}) AND order_status_id IN (${orderStatuses.join(', ')})
			) AS ${alias}`;
		}

		if (orderStatuses?.length) {
			return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount),0) + 0E0 AS ${alias} 
			FROM
				orders 
			WHERE ${originCondition} 
				AND order_status_id IN (
					${orderStatuses.join(', ')}
				)) AS ${alias}`;
		}

		if (paymentStatuses?.length) {
			return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount),0) + 0E0 AS ${alias} 
			FROM
				orders 
			WHERE ${originCondition} 
				AND payment_status IN (
					${paymentStatuses.join(', ')}
				)) AS ${alias}`;
		}
	}

	getReportOrderStatusesQueryParams(seller_id: number, queryParams: OrderQueryParamsDto) {
		const { q, order_status_id, platform_id, payment_status, payment_method_id, customer_id, from_date, to_date } =
			queryParams;
		let result = [
			{ seller_id },
			{ q },
			{ customer_id },
			{ order_status_id },
			{ platform_id },
			{ payment_method_id },
			{ payment_status }
		]
			.filter((item) => !isEmptyObject(item))
			.map((item) =>
				Object.entries(item)
					.map(([key, val]) => {
						switch (key) {
							case 'q': {
								return [
									`( order_code LIKE '%${val}%'`,
									`b_fullname LIKE '%${val}$%'`,
									`b_phone LIKE '${val}%'`,
									`b_email LIKE '%${val}%' )`
								].join(' OR ');
							}
							default:
								return `${key} = '${val}'`;
						}
					})
					.join(' AND ')
			)
			.join(' AND ');

		if (from_date && to_date) {
			result += ` AND created_at BETWEEN '${from_date}' AND '${to_date}' `;
		}

		return result;
	}

	async getOrderById(id: number, seller_id: number): Promise<Order> {
		const order: any = await this.OrderModel.findOne({
			attributes: {
				include: [
					[
						sequelize.literal(
							'(SELECT fullname FROM users Creator WHERE `Order`.`created_by` = `Creator`.`id`)'
						),
						'created_by_name'
					],
					[
						sequelize.literal(
							'(SELECT fullname FROM users Updater WHERE `Order`.`updated_by` = `Updater`.`id`)'
						),
						'updated_by_name'
					]
				]
			},
			where: { id, seller_id },
			include: [
				OrderDetail,
				OrderPaymentDetail,
				{
					model: OrderStatusLog,
					attributes: {
						include: [
							[
								sequelize.literal(
									'(SELECT fullname FROM users Handler WHERE `order_status_logs`.`handled_by` = `Handler`.`id`)'
								),
								'handled_by_name'
							]
						]
					}
				},
				OrderPaymentLog
			]
		});

		if (!order) {
			throw new HttpException(messages.order.notFound, HttpStatus.NOT_FOUND);
		}

		return order;
	}

	async getOrderLogs(orderId: number): Promise<ResponseAbstractList<OrderStatusLog>> {
		const { rows, count } = await this.OrderStatusLogModel.findAndCountAll({
			where: { order_id: orderId },
			order: [['created_at', 'asc']]
		});
		return {
			paging: {
				currentPage: 1,
				pageSize: count,
				total: count
			},
			data: rows
		};
	}

	async getOrderDeliveriesList(
		user: IUserAuth,
		queryParams: OrderDeliveryQueryParamsDto
	): Promise<ResponseAbstractList<OrderDelivery>> {
		const { page, offset, limit } = getPageOffsetLimit(queryParams);
		const { sellerId, roleCode } = user;
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = OrderDeliveryQueryParamsDto.getWhereClauseQueryParams(
			sellerId,
			queryParams,
			isSpecialAdmin
		);

		const { rows, count } = await this.OrderDeliveryModel.findAndCountAll({
			attributes: {
				include: [
					[
						sequelize.literal(`
						(
							SELECT warehouse_name FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
						)`),
						'warehouse_name'
					],
					[
						sequelize.literal(`
						(
							SELECT warehouse_code FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
						)`),
						'warehouse_code'
					]
				]
			},
			include: [{ model: OrderDeliveryLog, order: [['updated_at', 'desc']] }, { model: OrderDetail }],
			where: whereClause,
			order: [['updated_at', 'desc']],
			offset,
			limit,
			distinct: true,
			logging: true
		});

		return returnListWithPaging(page, limit, count, rows);
	}

	async getOrderDeliveryByDeliveryCode(
		{ sellerId, roleCode }: IUserAuth,
		delivery_code: string
	): Promise<OrderDelivery> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause: any = {
			delivery_code
		};
		if (!isSpecialAdmin) {
			whereClause.seller_id = sellerId;
		}
		const orderDelivery = await this.OrderDeliveryModel.findOne({
			attributes: {
				include: [
					[
						sequelize.literal(`
						(
							SELECT warehouse_name FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
						)`),
						'warehouse_name'
					],
					[
						sequelize.literal(`
						(
							SELECT warehouse_code FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
						)`),
						'warehouse_code'
					]
				]
			},
			where: whereClause,
			include: [OrderDeliveryLog, OrderDetail]
		});
		console.log(orderDelivery);
		if (!orderDelivery) throw new HttpException(messages.order.deliveryNotFound, HttpStatus.NOT_FOUND);
		return orderDelivery;
	}

	checkNTLCallbackNotiValidation(req: Request): void {
		const tokenAuthFromNTL = req.headers['authorization'];
		if (shippingUnitConfig.NTL.token !== tokenAuthFromNTL) {
			throw new HttpException(messages.auth.invalidToken, HttpStatus.UNAUTHORIZED);
		}
	}

	async listenCallbackDilveryFromShippingUnit(shippingUnit: 'ntl' | 'ntx', data: any, req: Request) {
		switch (shippingUnit) {
			case 'ntl':
				return await this.NTLCallbackNotification(data, req);
		}
	}

	async NTLCallbackNotification(data: NTLUpdateDeliveryDto, req: Request): Promise<void> {
		this.logger.log('================ Delivery call =====================');
		this.logger.log(req.headers);
		this.logger.log(req.body);
		this.logger.log('====================================================');
		this.checkNTLCallbackNotiValidation(req);
		this.AMQPNTLCallNotification(data);
	}

	AMQPNTLCallNotification(data: NTLUpdateDeliveryDto) {
		this.amqpService.amqpConnection.publish(
			AMQPExchange.OrderDelivery,
			AMQPRoutingKey.UpdateOrderDeliveryFromNTL,
			Buffer.from(JSON.stringify(data)),
			{ expiration: '60000', persistent: true, type: 'topic' }
		);
	}

	@RabbitSubscribe({
		exchange: AMQPExchange.OrderDelivery,
		routingKey: AMQPRoutingKey.UpdateOrderDeliveryFromNTL,
		queue: AMQPQueue.UpdateOrderDeliveryFromNTL,
		queueOptions: {
			durable: true,
			autoDelete: true
		}
	})
	async updateOrderDeliveryFromNTL(data: NTLUpdateDeliveryDto) {
		try {
			const currentOrder = await this.OrderModel.findOne({
				include: [OrderDetail],
				where: { order_code: data.ref_code, delivery_code: data.bill_no }
			});

			if (!currentOrder) throw new HttpException('Không tìm thấy đơn', 404);

			const { status_id } = data;
			switch (status_id) {
				case NTLShippingUnitStatusesEnum['Chờ lấy hàng-Waiting']: {
					// await this.NTLTrackingOrderDelivery(currentOrder.delivery_code, currentOrder.seller_id);
				}
				default: {
					await Promise.all([
						this.NTLUpdateOrderDelivery(currentOrder, data),
						this.createCustomerPointFromOrder(currentOrder)
					]);
				}
			}
			return new Nack();
		} catch (error) {
			if (Number(error.status) <= 500 && Number(error.status) >= 400) {
				return new Nack(true);
			}
		}
	}

	async NTLTrackingOrderDelivery(orderDeliveryCode: string, sellerId: number) {
		try {
			const sellerShippingData: IShippingUnitNTLResponse =
				await this.shippingUnitService.getShippingDataBySellerId(sellerId, ShippingUnitIdsEnum.NTL);

			const billResponse = await axios({
				method: 'GET',
				url: defineShippingUnits.NTL.api.trackingBill,
				params: { bill_code: orderDeliveryCode },
				headers: {
					username: sellerShippingData.username,
					password: sellerShippingData.password
				}
			});

			const billData = billResponse.data.data;
		} catch (error) {
			throw new HttpException(error.message, error.status);
		}
	}

	async NTLUpdateOrderDelivery(currentOrder: Order, data: NTLUpdateDeliveryDto): Promise<void> {
		const orderPayload: INTLOrderDeliveryPayload = this.NTLOrderDeliveryPayload(data);

		const orderDeliveryLogPayload: INTLOrderDeliveryLogPayload = await this.NTLOrderDeliveryLogPayload(data);

		await Promise.all([
			this.OrderModel.update(orderPayload as any, { where: { id: currentOrder.id } }),
			this.OrderDeliveryModel.update(orderPayload as any, {
				where: { id: orderDeliveryLogPayload.order_delivery_id }
			}),
			this.incrementInventoryAfterOrderFail(currentOrder, currentOrder.details),
			this.OrderDeliveryLogModel.create(orderDeliveryLogPayload as any)
		]);
	}

	NTLOrderDeliveryPayload(data: NTLUpdateDeliveryDto): INTLOrderDeliveryPayload {
		const orderStatusId = Number(mappingNTLDeliveiryStatus[data.status_id]);
		const statusTime = new Date(data.status_time * 1000);
		const pushTime = new Date(data.push_time * 1000);
		const orderPayload: INTLOrderDeliveryPayload = {
			delivery_status_id: data.status_id,
			delivery_status_name: data.status_name,
			delivery_push_at: pushTime,
			order_status_id: orderStatusId,
			order_status_name: getKeyByValue(OrderStatusEnum, orderStatusId)
		};

		switch (data.status_id) {
			case NTLShippingUnitStatusesEnum['Chờ lấy hàng-Waiting']:
				orderPayload.push_shipping_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Không phát được-FUD']:
			case NTLShippingUnitStatusesEnum['Sự cố giao hàng-QIU']:
				orderPayload.delivery_failed_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Đang chuyển hoàn-NRT']:
				orderPayload.returning_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Đã chuyển hoàn-MRC']:
				orderPayload.returned_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Đã giao hàng-FBC']:
				orderPayload.delivery_success_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Đã lấy hàng-KCB']:
				orderPayload.picked_up_at = statusTime;
				break;
			case NTLShippingUnitStatusesEnum['Huỷ-GBV']:
				orderPayload.delivery_canceled_at = statusTime;
				break;
		}
		return orderPayload;
	}

	async NTLOrderDeliveryLogPayload(data: NTLUpdateDeliveryDto): Promise<INTLOrderDeliveryLogPayload> {
		const currentOrderDelivery = await this.OrderDeliveryModel.findOne({
			where: { delivery_code: data.bill_no, order_code: data.ref_code }
		});
		if (!currentOrderDelivery) {
			return;
		}
		const orderStatusId = Number(mappingNTLDeliveiryStatus[data.status_id]);
		const orderDeliveryLogPayload: INTLOrderDeliveryLogPayload = {
			seller_id: currentOrderDelivery.seller_id,
			order_id: currentOrderDelivery.order_id,
			order_delivery_id: currentOrderDelivery.id,
			order_code: data.ref_code,
			delivery_code: data.bill_no,
			delivery_status_id: data.status_id,
			delivery_status_name: data.status_name,
			order_status_id: orderStatusId,
			order_status_name: getKeyByValue(OrderStatusEnum, orderStatusId),
			shipping_fee: data.shipping_fee,
			weight: data.weight,
			partial: data.partial,
			reason: data.reason,
			delivery_change_status_at: new Date(data.status_time * 1000),
			delivery_push_at: new Date(data.push_time * 1000)
		};

		return orderDeliveryLogPayload;
	}

	reportCountDeliveryOverviewQueryString(
		originCondition: string,
		alias: string,
		orderDeliveryStatusId: OrderStatusEnum
	) {
		return `
			(SELECT 
				IFNULL(COUNT(*),0) AS ${alias} 
			FROM
				order_deliveries 
			WHERE ${[originCondition, `order_status_id = ${orderDeliveryStatusId}`].filter(Boolean).join(' AND ')}) AS ${alias}`;
	}
	reportTotalAmountDeliveryOverviewQueryString(
		originCondition: string,
		alias: string,
		orderDeliveryStatusId: OrderStatusEnum
	) {
		return `
			(SELECT 
				IFNULL(SUM(final_total_money_amount + 0E0),0) AS ${alias} 
			FROM
				order_deliveries 
			WHERE ${[originCondition, `order_status_id = ${orderDeliveryStatusId}`].filter(Boolean).join(' AND ')} ) AS ${alias}`;
	}

	determineOrderDeliveryPaymentBy(data: CreateOrderDto | UpdateOrderDto) {
		if (data.receive_at_store || !data.shipping_unit_id || !data.delivery_payment_method_id) return null;
		const deliveryPaymentByObj = {
			[ShippingUnitIdsEnum.NTL]: this.getNTLDeliveryPaymentBy(Number(data.delivery_payment_method_id))
		};

		return deliveryPaymentByObj[data.shipping_unit_id];
	}

	getNTLDeliveryPaymentBy(paymentMethodId: number): number {
		if (
			[
				NTLPaymentMethodEnum['Người gửi thanh toán ngay'],
				NTLPaymentMethodEnum['Người gửi thanh toán sau']
			].includes(paymentMethodId)
		)
			return PersonPayDeliveryFee['Shop trả sau'];
		return PersonPayDeliveryFee['Người nhận thanh toán'];
	}

	async findOrderDeliveriesListByIdsList(ids: number[]): Promise<OrderDelivery[]> {
		return await this.OrderDeliveryModel.findAll({
			attributes: {
				include: [
					[
						sequelize.literal(`
					(
						SELECT warehouse_name FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
					)`),
						'warehouse_name'
					],
					[
						sequelize.literal(`
					(
						SELECT warehouse_code FROM warehouses WHERE warehouses.id = OrderDelivery.warehouse_id
					)`),
						'warehouse_code'
					]
				]
			},
			include: [{ model: OrderDeliveryLog, order: [['updated_at', 'desc']] }, { model: OrderDetail }],
			where: { id: { [Op.in]: ids } },
			order: [['id', 'asc']]
		});
	}
}
