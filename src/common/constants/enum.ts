export enum Status {
	ACTIVE = 'A',
	INACTIVE = 'I',
	LOCKED = 'L'
}

export enum BooleanStatus {
	NO = 0,
	YES = 1
}

export enum AuthProvider {
	GOOGLE = 'GOOGLE',
	FACEBOOK = 'FACEBOOK',
	SYSTEM = 'SYSTEM'
}

export enum AuthTokenType {
	REGISTER = 1,
	RECOVERY_ACCOUNT = 2,
	SIGN_IN = 3
}

export enum PlatformEnum {
	'Haravan' = 1,
	'Lazada' = 2,
	'Tiki' = 3,
	'Shopee' = 4,
	'KiotViet' = 5,
	'Yes24h' = 6,
	'Sendo' = 7,
	'POS' = 8,
	'Website' = 9,
	'Zalo' = 18268186,
	'Facebook' = 18268187,
	'Google' = 18268188,
	'Instagram' = 18268189,
	'Youtube' = 18268190
}

export enum RoleEnum {
	'Admin' = 'Admin',
	'Manager' = 'Manager',
	'Moderator' = 'Moderator',
	'Customer' = 'Customer',
	'User' = 'User'
}

export enum UserTypeEnum {
	admin = 99,
	vendor = 0
}

export enum IsDeactiveAccountEnum {
	'False' = 0,
	'True' = 1
}

export enum HttpMethodsEnum {
	'POST' = 'POST',
	'GET' = 'GET',
	'PUT' = 'PUT',
	'DELETE' = 'DELETE'
}

export enum HttpMessageResponseByMethodsEnum {
	'POST' = 'Tạo thành công.',
	'GET' = 'Lấy dữ liệu thành công.',
	'PUT' = 'Cập nhật thành công.',
	'DELETE' = 'Xoá thành công.'
}

export enum UserStatusEnum {
	'Active' = '1',
	'Disabled' = '0'
}

export enum AccountTypeEnum {
	'SYSTEM' = 1,
	'GOOGLE' = 2,
	'FACEBOOK' = 3
}

export enum UserGenderEnum {
	'Male' = 'Male',
	'Female' = 'Female',
	'Others' = 'Others'
}

export enum TokenType {
	'ACCESS_TOKEN' = 'ACCESS_TOKEN'
}

export enum UserAccountStatusActionTypeEnum {
	'ACTIVATE_ACCOUNT' = '1',
	'REACTIVATE_ACCOUNT' = '2',
	'RECOVERY_ACCOUNT' = '3',
	'LOGIN_GOOGLE' = '4',
	'LOGIN_FACEBOOK' = '5'
}

export enum ProviderTypeEnum {
	'LOGIN_GOOGLE' = '4',
	'LOGIN_FACEBOOK' = '5'
}

export enum UserRoleEnum {
	'SellerAdmin' = 'Seller Admin',
	'NTAdmin' = 'NTAdmin'
}
export enum UserRoleCodeEnum {
	'SellerAdmin' = 'seller_admin',
	'NTAdmin' = 'nt_admin'
}

export enum AttributeTypeEnum {
	'TextOrNumber' = '1',
	'Radio' = '2',
	'Checkbox' = '3'
}

export enum AttributeFilterTypeEnum {
	'Checkbox' = '1',
	'DataSelector' = '2',
	'NumberSlide' = '3',
	'Color' = '4'
}

export enum CustomerRankingEnum {
	'Thành viên' = '1',
	'Bạc' = '2',
	'Vàng' = '3',
	'Kim cương' = '4'
}

export enum CustomerAddressTypesEnum {
	'Home' = '1',
	'Organization' = '2'
}

export enum CustomerTypeEnum {
	'Normal' = '1',
	'Wholesale' = '2',
	'Retail' = '3',
	'Supplier' = '4'
}

export enum AttributePurposeEnum {
	'ProductSearchViaFilters' = '1',
	'VariationsAsSeperateProducts' = '2',
	'VariationAsOneProduct' = '3',
	'Brand,Author,Etc' = '4'
}

export enum ModuleFunctionActionTypesEnum {
	'VIEWS' = '__VIEWS',
	'CREATE' = '__CREATE',
	'UPDATE' = '__UPDATE',
	'IMPORT' = '__IMPORT',
	'EXPORT' = '__EXPORT',
	'UPDATE_STATUS' = '__UPDATE_STATUS',
	'UPDATE_INDEX' = '__UPDATE_INDEX',
	'UPDATE_ATTRIBUTE_INDEX' = '__UPDATE_ATTRIBUTE_INDEX',
	'VIEW_DETAIL' = '__VIEW_DETAIL',
	'CANCEL' = '__CANCEL',
	'REPORT_STATUS' = '__REPORT_STATUS',
	'VIEW_LOGS' = '__VIEW_LOGS',
	'UPDATE_PRODUCT_CATEGORY' = '__UPDATE_PRODUCT_CATEGORY',
	'UPDATE_ATTRIBUTE_CATEGORY' = '__UPDATE_ATTRIBUTE_CATEGORY',
	'UPDATE_CATALOG_CATEGORY' = '__UPDATE_CATALOG_CATEGORY',
	'VIEW_DELIVERY_DETAIL' = '__VIEW_DELIVERY_DETAIL'
}

export enum ProductTypeEnum {
	'Normal' = '1',
	'IMEI' = '2',
	'Combo' = '3',
	'Service' = '4'
}

export enum ProductStatusEnum {
	'Mới' = '1',
	'Đang bán' = '2',
	'Hết hàng' = '3',
	'Ngừng bán' = '4',
	'Đặt trước' = '5'
}

export enum ProductLevelEnum {
	'Configure' = '1',
	'Variation' = '2',
	'Independence' = '3'
}

export enum PathUrlObjectTypeEnum {
	'PRODUCT' = 'PRODUCT',
	'CUSTOMER' = 'CUSTOMER'
}

export enum OrderStatusEnum {
	'Mới' = 1,
	'Thanh toán thất bại' = 2,
	'Đã xác nhận' = 3,
	'Thanh toán thành công' = 4,
	'Chờ đóng gói' = 5,
	'Đã đóng gói' = 6,
	'Chờ lấy hàng' = 7,
	'Đang vận chuyển' = 8,
	'Đang giao hàng' = 9,
	'Giao thành công' = 10,
	'Lỗi giao hàng' = 11,
	'Chờ giao lại' = 12,
	'Đang chuyển hoàn' = 13,
	'Đã chuyển hoàn' = 14,
	'Hoàn thành' = 15,
	'Đã Huỷ' = 16,
	'Yêu cầu huỷ' = 17
}

export enum DeliveryStatusEnum {
	'Chờ đóng gói' = 5,
	'Đã đóng gói' = 6,
	'Chờ lấy hàng' = 7,
	'Đang vận chuyển' = 8,
	'Đang giao hàng' = 9,
	'Giao thành công' = 10,
	'Lỗi giao hàng' = 11,
	'Chờ giao lại' = 12,
	'Đang chuyển hoàn' = 13,
	'Đã chuyển hoàn' = 14
}

export enum DeliveryStatusEnglishEnum {
	'Packaging' = 5,
	'Packaged' = 6,
	'WaitingPickup' = 7,
	'Transporting' = 8,
	'Delivery' = 9,
	'DeliverySuccess' = 10,
	'DeliveryFail' = 11,
	'WaitingDeliveryAgain' = 12,
	'Returning' = 13,
	'Returned' = 14
}

export enum GroupOrderStatusEnum {
	InProgress = 'InProgress',
	Confirmed = 'Confirmed',
	Packaged = 'Packaged',
	Shipping = 'Shipping',
	ShippingFailure = 'ShippingFailure',
	Closed = 'Closed'
}

export enum PaymentStatusEnum {
	'Chưa thanh toán' = '1',
	'Thanh toán một phần' = '2',
	'Đã thanh toán' = '3',
	'Thanh toán thất bại' = '4'
}

export enum CarriageForward {
	'Shop trả' = '1',
	'Người nhận trả' = '2'
}

export enum DeliveryRequestEnum {
	'Cho xem hàng, không cho thử' = 1,
	'Cho xem hàng, cho thử' = 2,
	'Không cho xem hàng' = 3
}

export enum DiscountTypeEnum {
	'Fixed' = '1',
	'Percentage' = '2'
}

export enum ExceptionCodeEnum {
	'JsonWebTokenError' = 408,
	'TokenExpiredError' = 408
}

export enum ShippingUnitIdsEnum {
	'NTL' = 1,
	'NTX' = 2
}

export enum NTLPaymentMethodEnum {
	'Người gửi thanh toán ngay' = 10,
	'Người gửi thanh toán sau' = 11,
	'Người nhận thanh toán ngay' = 20
}

export enum NTLShippingUnitServiceEnum {
	'Chuyển phát nhanh' = 10,
	'Hoả tốc' = 11,
	'Đường bộ' = 20,
	'MES' = 21
}

export enum NTLShippingUnitStatusesEnum {
	'Chờ lấy hàng-Waiting' = 2,
	'Đã lấy hàng-KCB' = 3,
	'Đã giao hàng-FBC' = 4,
	'Huỷ-GBV' = 6,
	'Không phát được-FUD' = 7,
	'Đang chuyển hoàn-NRT' = 9,
	'Đã chuyển hoàn-MRC' = 10,
	'Sự cố giao hàng-QIU' = 11
}

export enum WarehouseStaffLevelEnum {
	'Quản lý' = 1,
	'Nhân viên' = 2
}

export enum PaymentMethodEnum {
	'Tiền mặt' = 1,
	'Transfer' = 2,
	'Swipe' = 3,
	'COD' = 4,
	'Tiền dư' = 5
}

export enum VoucherTypeEnum {
	'Giảm theo số tiền' = 1,
	'Giảm theo %' = 2
}

export enum CouponDiscountTypeEnum {
	'Giảm theo %' = 1,
	'Giảm theo số tiền' = 2
}

export enum ProductTabEnum {
	'Thông tin sản phẩm' = 1,
	'SEO' = 2,
	'Sản phẩm con' = 3,
	'Bảo hành & vận chuyển' = 4,
	'Sticker' = 5,
	'Nhóm sản phẩm' = 6
}

export enum ProductLogTypeEnum {
	'Tạo sản phẩm' = 1,
	'Cập nhật sản phẩm' = 2,
	'Xoá sản phẩm' = 3
}

export enum CargoTypeEnum {
	'Decument' = 1,
	'Goods' = 2
}

export enum ImportGoodInputStatus {
	'Chưa nhập kho' = 1,
	'Đã nhập kho' = 2
}

export enum ImportGoodPaymentStatus {
	'Chưa thanh toán' = 1,
	'Đã thanh toán' = 2
}

export enum ImportGoodTransactionStatus {
	'Đang giao dịch' = 1,
	'Đã hoàn thành' = 2
}

export enum InventoryReceiptStatusEnum {
	'Đang kiểm hàng' = 1,
	'Đã kiểm hàng' = 2,
	'Đã huỷ' = 3
}

export enum InventoryReceiptStatusEnumString {
	'Đang kiểm hàng' = '1',
	'Đã kiểm hàng' = '2',
	'Đã huỷ' = '3'
}

export enum InventoryReceiptDetailListFilter {
	'Chưa kiểm' = 1,
	'Khớp' = 2,
	'Lệch' = 3
}

export enum GeneralSettingObjTypeEnum {
	'text' = 'text',
	'select' = 'select',
	'checkbox' = 'checkbox',
	'radio' = 'radio',
	'multiSelect' = 'multiSelect',
	'number' = 'number'
}

export enum CodAndCarriageBillStatusEnum {
	'Đang đối soát' = 1,
	'Đã đối soát' = 2,
	'Đã huỷ' = 3
}

export enum CodAndPostageBillPaymentStatusEnum {
	'Chưa thanh toán' = 1,
	'Đã thanh toán' = 2
}

export enum CodAndCarriageBillPaymentMethodEnum {
	'Tiền mặt' = 1,
	'Chuyển khoản' = 2
}

export enum ImportGoodPaymentMethodEnum {
	'Tiền mặt' = 1,
	'Chuyển khoản' = 2
}

export enum ImportGoodPaymentMethodEnumString {
	'Tiền mặt' = '1',
	'Chuyển khoản' = '2'
}

export enum CodAndCarriageBillLogActionStatusEnum {
	'Tạo phiếu đối soát' = 1,
	'Đang đối soát' = 2,
	'Chỉnh sửa phiếu đối soát' = 3,
	'Đã đối soát' = 4,
	'In phiếu đối soát' = 5
}

export enum PersonPayDeliveryFee {
	'Người gửi thanh toán sau' = 1,
	'Người nhận thanh toán' = 2,
	'Người gửi thanh toán ngay' = 3
}

export enum DeliveryPaymentMethodEnum {
	'Người gửi thanh toán sau' = 11,
	'Người nhận thanh toán' = 20,
	'Người gửi thanh toán ngay' = 10
}

export enum ProductInventoryOperatorEnum {
	'Add' = 1,
	'Substract' = 2
}

export enum sellerSettingIdEnum {
	'Company' = 1,
	'Check out' = 15,
	'E-mails' = 26,
	'Thumbnails' = 34
}

export enum ServicePackageExpiryTypeEnum {
	day = 'day',
	month = 'month',
	year = 'year'
}

export enum DeliveryOverviewEnum {
	waitingPackingAmount = 'waitingPackingAmount',
	waitingPackingCount = 'waitingPackingCount',
	packagedAmount = 'packagedAmount',
	packagedCount = 'packagedCount',
	waitingPickingUpAmount = 'waitingPickingUpAmount',
	waitingPickingUpCount = 'waitingPickingUpCount',
	transportingAmount = 'transportingAmount',
	transportingCount = 'transportingCount',
	deliveryAmount = 'deliveryAmount',
	deliveryCount = 'deliveryCount',
	deliverySuccessAmount = 'deliverySuccessAmount',
	deliverySuccessCount = 'deliverySuccessCount',
	deliveryFailAmount = 'deliveryFailAmount',
	deliveryFailCount = 'deliveryFailCount',
	waitingDeliveryAgainAmount = 'waitingDeliveryAgainAmount',
	waitingDeliveryAgainCount = 'waitingDeliveryAgainCount',
	returningAmount = 'returningAmount',
	returningCount = 'returningCount',
	returnedAmount = 'returnedAmount',
	returnedCount = 'returnedCount'
}

export enum TrasportCODStatusEnum {
	'Chờ thu hộ' = 1,
	'Đang thu hộ' = 2,
	'Đã thu hộ' = 3
}

export enum PromotionProgramTypeEnum {
	'Discount' = 1,
	'Gift' = 2,
	'Service' = 2
}

export enum CouponProgramLimitTypeEnum {
	'Không giới hạn' = 0,
	'Mỗi mã được sử dụng' = 1,
	'Mỗi KH được sử dụng tối đa' = 2,
	'Áp dụng cho đơn giá trị từ' = 3,
	'Áp dụng chung với các KM khác' = 4
}

export enum CouponApplyForTypeEnum {
	'All Products' = 1,
	'Category' = 2,
	'Specific Product' = 3
}

export enum PromotionApplyTypeEnum {
	'All Products' = 1,
	'Category' = 2,
	'Specific Product' = 3
}

export enum CustomerHistoryPointOperatorEnum {
	'add' = 1,
	'subtract' = 2
}

export enum CustomerHistoryPointRefSourceEnum {
	order = 1
}

export enum CouponApplyTypeEnum {
	'Tất cả sản phẩm' = 1,
	'Danh mục' = 2,
	'Sản phẩm' = 3
}

export enum PromotionStatusEnum {
	'Chưa kích hoạt' = 1,
	'Hoạt động' = 2,
	'Tạm dừng' = 3,
	'Ngừng hoạt động' = 4
}

export enum CouponStatusEnum {
	'Chưa kích hoạt' = 1,
	'Hoạt động' = 2,
	'Tạm dừng' = 3,
	'Ngừng hoạt động' = 4
}

export enum DayOfWeekEnum {
	'Sunday' = 0,
	'Monday' = 2,
	'Tuesday' = 3,
	'Wednesday' = 4,
	'Thursday' = 5,
	'Friday' = 6,
	'Saturday' = 7
}

export enum MonthOfYearEnum {
	'January' = 1,
	'February' = 2,
	'March' = 3,
	'April' = 4,
	'May' = 5,
	'June' = 6,
	'July' = 7,
	'August' = 8,
	'September' = 9,
	'October' = 10,
	'November' = 11,
	'December' = 12
}
