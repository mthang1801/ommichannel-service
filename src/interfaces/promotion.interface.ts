export interface IPromotionEntityDetail {
	program_id: number;
	seller_id: number;
	promotion_entity_id: number;
	quantity_from?: number;
	quantity_to?: number;
	total_price_from?: number;
	total_price_to?: number;
	discount_amount?: number;
	discount_type?: number;
	max_use_quantity?: number;
	used?: number;
}
