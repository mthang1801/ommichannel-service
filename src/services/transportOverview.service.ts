import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
	DeliveryOverviewEnum,
	DeliveryStatusEnglishEnum,
	OrderStatusEnum,
	ShippingUnitIdsEnum,
	TrasportCODStatusEnum
} from 'src/common/constants/enum';
import { isSpecialAdminByRoleCode } from 'src/common/guards/auth';
import { sequelize } from 'src/configs/db';
import { CodAndCarriageBillOverviewDto } from 'src/dtos/requests/codAndCarriageBill/codAndCarriageBillOverviewQueryParam.dto';
import { OrderDeliveryOverviewQueryParamDto } from 'src/dtos/requests/order/orderDeliveryOverviewQueryParam.dto';
import { ReportDeliveryQueryParamDto } from 'src/dtos/requests/order/reportDeliveryQueryParam.dto';
import {
	CodAndCarriageBillDto,
	CodAndCarriageBillOverviewResponseDto
} from 'src/dtos/responses/codAndCarriageBill/codAndCarriageBillOverview.dto';
import { DeliveryStatusDto } from 'src/dtos/responses/order/deliveryOverview.dto';
import { ProportionDeliveryShippingFeeByShippingUnitDto } from 'src/dtos/responses/order/proportionDeliveryShippingFeeByShippingUnit.dto';
import { IUserAuth } from 'src/interfaces/userAuth.interface';
import { previousDaysFromNow } from 'src/utils/dates.utils';
import { getKeyByValue, typeOf } from 'src/utils/functions.utils';
import { OrderService } from './order.service';

@Injectable()
export class TransportOverviewService {
	constructor(@Inject(forwardRef(() => OrderService)) private readonly orderService: OrderService) {}
	async getTransportOverviewStatuses(
		{ sellerId, roleCode }: IUserAuth,
		queryParams: OrderDeliveryOverviewQueryParamDto
	): Promise<DeliveryStatusDto> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = OrderDeliveryOverviewQueryParamDto.getOrderDeliveryOverviewQueryParam(
			sellerId,
			queryParams,
			isSpecialAdmin
		);

		const fromString = this.transportOverviewStatusesFromString(whereClause);
		const sqlQuery = `SELECT * FROM ${fromString}`;

		const [[result]] = await sequelize.query(sqlQuery);
		return result as DeliveryStatusDto;
	}

	transportOverviewStatusesFromString(whereClause: string): string {
		return [
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingPackingAmount,
				OrderStatusEnum['Chờ đóng gói']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingPackingCount,
				OrderStatusEnum['Chờ đóng gói']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.packagedAmount,
				OrderStatusEnum['Đã đóng gói']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.packagedCount,
				OrderStatusEnum['Đã đóng gói']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingPickingUpAmount,
				OrderStatusEnum['Chờ lấy hàng']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingPickingUpCount,
				OrderStatusEnum['Chờ lấy hàng']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliveryAmount,
				OrderStatusEnum['Đang giao hàng']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliveryCount,
				OrderStatusEnum['Đang giao hàng']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.transportingAmount,
				OrderStatusEnum['Đang vận chuyển']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.transportingCount,
				OrderStatusEnum['Đang vận chuyển']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliverySuccessAmount,
				OrderStatusEnum['Giao thành công']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliverySuccessCount,
				OrderStatusEnum['Giao thành công']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliveryFailAmount,
				OrderStatusEnum['Lỗi giao hàng']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.deliveryFailCount,
				OrderStatusEnum['Lỗi giao hàng']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingDeliveryAgainAmount,
				OrderStatusEnum['Chờ giao lại']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.waitingDeliveryAgainCount,
				OrderStatusEnum['Chờ giao lại']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.returningAmount,
				OrderStatusEnum['Đang chuyển hoàn']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.returningCount,
				OrderStatusEnum['Đang chuyển hoàn']
			),
			this.orderService.reportTotalAmountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.returnedAmount,
				OrderStatusEnum['Đã chuyển hoàn']
			),
			this.orderService.reportCountDeliveryOverviewQueryString(
				whereClause,
				DeliveryOverviewEnum.returnedCount,
				OrderStatusEnum['Đã chuyển hoàn']
			)
		].join(', ');
	}

	async getCodAndCarriageOverview(
		{ roleCode, sellerId }: IUserAuth,
		queryParams: CodAndCarriageBillOverviewDto
	): Promise<CodAndCarriageBillOverviewResponseDto> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = CodAndCarriageBillOverviewDto.getCodAndCarriageBillOverviewQueryParam(
			sellerId,
			queryParams,
			isSpecialAdmin
		);

		const sqlString = Object.values(TrasportCODStatusEnum)
			.map((forControlStatusId: number) =>
				typeOf(forControlStatusId) === 'number'
					? this.codAndCarriageOverviewSelectString(forControlStatusId, whereClause)
					: undefined
			)
			.filter(Boolean)
			.join(' UNION ALL ');

		const response = await sequelize.query(sqlString, { logging: true });
		const details = response[0] as CodAndCarriageBillDto[];
		const summary = details.reduce(
			(acc, ele: CodAndCarriageBillDto) => {
				acc.billCount += Number(ele.billCount);
				acc.COD += Number(ele.COD);
				acc.shippingFee += Number(ele.shippingFee);
				return acc;
			},
			{
				billCount: 0,
				COD: 0,
				shippingFee: 0
			}
		);
		return {
			details,
			summary
		};
	}

	codAndCarriageOverviewSelectString(statusId: TrasportCODStatusEnum, whereClause: string) {
		const statusWhereClause = [];
		switch (statusId) {
			case TrasportCODStatusEnum['Chờ thu hộ']:
				{
					statusWhereClause.push(
						`order_status_id IN (${[
							DeliveryStatusEnglishEnum.Packaging,
							DeliveryStatusEnglishEnum.Packaged,
							DeliveryStatusEnglishEnum.WaitingPickup
						].join(',')})`
					);
				}
				break;
			case TrasportCODStatusEnum['Đang thu hộ']:
				{
					statusWhereClause.push(
						`order_status_id IN (${[
							DeliveryStatusEnglishEnum.Delivery,
							DeliveryStatusEnglishEnum.Transporting
						].join(',')})`
					);
				}
				break;
			case TrasportCODStatusEnum['Đã thu hộ']: {
				statusWhereClause.push(`order_status_id IN (${[DeliveryStatusEnglishEnum.DeliverySuccess].join(',')})`);
			}
		}

		const forControlStatusName = getKeyByValue(TrasportCODStatusEnum, statusId);

		return `
			SELECT 
				for_control_status,
				IFNULL(count(*),0) as billCount, 
				IFNULL(SUM(cod) + 0E0,0) as COD, 
				IFNULL(SUM(shipping_fee + 0E0),0) as shippingFee,
				'${forControlStatusName}' as forControlStatusName
			FROM order_deliveries 
			WHERE ${[whereClause, ...statusWhereClause].filter(Boolean).join(' AND ')}
			GROUP BY for_control_status, forControlStatusName
		`;
	}

	async reportProportionByShippingUnit({
		sellerId,
		roleCode
	}: IUserAuth): Promise<ProportionDeliveryShippingFeeByShippingUnitDto> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = `seller_id = ${sellerId}`;
		const shippingUnitIds = Object.values(ShippingUnitIdsEnum).filter(
			(item) => typeOf(item) === 'number'
		) as number[];

		const fromString = [
			`(SELECT IFNULL(SUM(shipping_fee) + 0E0,0) as shipping_fee FROM order_deliveries WHERE ${[
				whereClause
			]}) as SUMMARY`,
			...shippingUnitIds.map((shippingUnitId: number) => {
				const key = getKeyByValue(ShippingUnitIdsEnum, shippingUnitId);
				return `(SELECT IFNULL(SUM(shipping_fee) + 0E0,0) as shipping_fee FROM order_deliveries WHERE ${[
					whereClause,
					`shipping_unit_id = ${shippingUnitId}`
				]
					.filter(Boolean)
					.join(' AND ')}) AS ${key} `;
			})
		].join(', ');
		const selectString = shippingUnitIds
			.map((shippingUnitId: number) => {
				const key = getKeyByValue(ShippingUnitIdsEnum, shippingUnitId);
				return `IFNULL(CAST(${key}.shipping_fee / SUMMARY.shipping_fee as decimal(12,2)) + 0E0, 0) as proportion_of_${key}`;
			})
			.join(', ');
		const sqlQuery = `SELECT ${selectString} FROM ${fromString}`;
		const [[response]] = await sequelize.query(sqlQuery, { logging: true });

		return response as ProportionDeliveryShippingFeeByShippingUnitDto;
	}

	async reportDeliveryByWeek(
		{ roleCode, sellerId }: IUserAuth,
		queryParams: ReportDeliveryQueryParamDto
	): Promise<any> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = ReportDeliveryQueryParamDto.getReportDeliveryQueryParam(
			sellerId,
			queryParams,
			isSpecialAdmin
		);

		const shippingUnitIds: number[] = queryParams.shipping_unit_id
			? [queryParams.shipping_unit_id]
			: (Object.values(ShippingUnitIdsEnum).filter((item) => typeOf(item) === 'number') as number[]);

		const sqlQuery = Array.from({ length: 7 })
			.map((_, i: number) => {
				const fromString = [
					...shippingUnitIds.map((shippingUnitId: number) => {
						const key = getKeyByValue(ShippingUnitIdsEnum, shippingUnitId);
						return (
							`(SELECT IFNULL(COUNT(*), 0) as orderCount FROM order_deliveries WHERE ` +
							[
								whereClause,
								`shipping_unit_id = ${shippingUnitId}`,
								`DATE(created_at) = '${previousDaysFromNow(i)}'`
							]
								.filter(Boolean)
								.join(' AND ') +
							`) AS ${key}`
						);
					})
				].join(', ');
				const selectString = shippingUnitIds
					.map((shippingUnitId: number) => {
						const key = getKeyByValue(ShippingUnitIdsEnum, shippingUnitId);
						return `${key}.orderCount as ${key}`;
					})
					.join(', ');
				return `SELECT ${selectString} FROM ${fromString}`;
			})
			.join('\nUNION ALL\n');

		const [response] = await sequelize.query(sqlQuery, { logging: true });

		const result = {};
		response.forEach((value, index) => {
			const getDate = previousDaysFromNow(index);
			result[getDate] = value;
		});
		return result;
	}

	async reportProportionShippingFee({ sellerId, roleCode }: IUserAuth, shippingStatusId: number): Promise<any> {
		const isSpecialAdmin = isSpecialAdminByRoleCode(roleCode);
		const whereClause = `seller_id = ${sellerId}`;
		const shippingStatusIds: number[] = shippingStatusId
			? [shippingStatusId]
			: (Object.values(DeliveryStatusEnglishEnum).filter((item) => typeOf(item) === 'number') as number[]);
		const sqlQuery = Array.from({ length: 7 })
			.map((_, i: number) => {
				const fromString = [
					`(SELECT IFNULL(COUNT(shipping_fee), 1) as shipping_fee FROM order_deliveries WHERE ${[
						whereClause,
						`DATE(created_at) = '${previousDaysFromNow(i)}'`
					]
						.filter(Boolean)
						.join(' AND ')}) AS SUMMARY`,
					...shippingStatusIds.map((shippingStatusId: number) => {
						const key = getKeyByValue(DeliveryStatusEnglishEnum, shippingStatusId);
						return (
							`(SELECT IFNULL(COUNT(shipping_fee), 0) as shipping_fee FROM order_deliveries WHERE ` +
							[
								whereClause,
								`order_status_id = ${shippingStatusId}`,
								`DATE(created_at) = '${previousDaysFromNow(i)}'`
							]
								.filter(Boolean)
								.join(' AND ') +
							`) AS ${key}`
						);
					})
				].join(', ');
				const selectString = shippingStatusIds
					.map((shippingStatusId: number) => {
						const key = getKeyByValue(DeliveryStatusEnglishEnum, shippingStatusId);
						return `${key}.shipping_fee as ${key}`;
					})
					.join(', ');

				return `SELECT ${selectString} FROM (${fromString})`;
			})
			.join('\nUNION ALL\n');

		const [response] = await sequelize.query(sqlQuery);
		const result = {};
		response.forEach((value, index) => {
			const getDate = previousDaysFromNow(index);
			result[getDate] = value;
		});
		return result;
	}
}
