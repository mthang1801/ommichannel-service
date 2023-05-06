export const AMQPExchange = {
	SendEmail: 'send_mail',
	OrderDelivery: 'order_delivery'
};

export const AMQPRoutingKey = {
	SendEmailSignUp: 'send_mail.signup',
	SendEmailReactivate: 'send_mail.reactivate',
	SendEmailRecoveryAccount: 'send_mail.recovery_account',
	UpdateOrderDeliveryFromNTL: 'order_delivery.ntl'
};

export const AMQPQueue = {
	SendEmailSignUp: 'signup_queue',
	SendEmailReactivate: 'reactivate_queue',
	SendEmailRecoveryAccount: 'recovery_account_queue',
	UpdateOrderDeliveryFromNTL: 'ntl_delivery_queue'
};

export const AMQPChannelNames = {
	'OMS-channel-1': 'OMS-channel-1'
};

export const AMQPQueueNames = {
	Signup: 'signup'
};
