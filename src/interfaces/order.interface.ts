export interface IReportOrderStatuses {
	inProgressCount: number;
	confirmedCount: number;
	packagedCount: number;
	shippingCount: number;
	failShipCount: number;
	completedCount: number;
	inProgressAmount: number;
	confirmedAmount: number;
	packagedAmount: number;
	shippingAmount: number;
	failShipAmount: number;
	completedAmount: number;
	newOrderCount: number;
	failPaymentCount: number;
	successPaymentCount: number;
	waitingPackagedCount: number;
	waitingForGoodsCount: number;
	transportingCount: number;
	deliveryCount: number;
	successfulDeliveryCount: number;
	errorDeliveryCount: number;
	waitingDeliveryAgainCount: number;
	movingBack: number;
}

export interface IOrderDateTime {
	delivery_date?: Date;
	confirmed_at?: Date;
	packaged_at?: Date;
	push_shipping_at?: Date;
	delivery_at?: Date;
	delivery_success_at?: Date;
	returned_at?: Date;
	canceled_at?: Date;
	closed_at?: Date;
}

export interface IOrderMoneyAmount {
	totalQuantityAmount: number;
	totalMoneyAmount: number;
	finalTotalMoneyAmount: number;
	totalDiscountMoneyAmount: number;
}

export interface IOrderDeliveryStatus {
	deliveryStatusId?: number;
	deliveryStatusName?: string;
}

export interface INTLOrderDeliveryPayload {
	delivery_status_id: number;
	delivery_status_name: string;
	order_status_id: number;
	order_status_name: string;
	delivery_push_at?: Date;
	push_shipping_at?: Date;
	delivery_failed_at?: Date;
	returning_at?: Date;
	returned_at?: Date;
	delivery_success_at?: Date;
	picked_up_at?: Date;
	delivery_canceled_at?: Date;
}
export interface INTLOrderDeliveryLogPayload {
	seller_id: number;
	order_id: number;
	order_delivery_id: number;
	order_code: string;
	delivery_code: string;
	delivery_status_id: number;
	delivery_status_name: string;
	order_status_id: number;
	order_status_name: string;
	shipping_fee: number;
	weight: number;
	partial: string;
	reason: string;
	delivery_change_status_at: Date;
	delivery_push_at: Date;
}
