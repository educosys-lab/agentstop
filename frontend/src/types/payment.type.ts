export type PaymentType = {
	provider: PaymentProviderType;
	orderId?: string;
	subscriptionId?: string;
	amount: number; // Amount in the smallest currency unit (e.g., Paisa for Rupees)
	currency: string;
	status: PaymentStatusType;
	creationTime: number;
};

export const CURRENCY = {
	INR: 'INR',
} as const;

export type CurrencyType = (typeof CURRENCY)[keyof typeof CURRENCY];

export const PAYMENT_PROVIDER = {
	RAZORPAY: 'razorpay',
	STRIPE: 'stripe',
	PHONEPE: 'phonepe',
} as const;

export type PaymentProviderType = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

export const PAYMENT_STATUS = {
	PENDING: 'pending',
	COMPLETED: 'completed',
	FAILED: 'failed',
} as const;

export type PaymentStatusType = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_FREQUENCY = {
	MONTHLY: 'monthly',
	YEARLY: 'yearly',
} as const;

export type PaymentFrequencyType = (typeof PAYMENT_FREQUENCY)[keyof typeof PAYMENT_FREQUENCY];

export type CreateOrderType = {
	emailOrUsername: string;
	provider: PaymentProviderType;
	amount: number;
	currency: string;
	packageDetails: {
		name: string;
		details: string;
		interval?: PaymentFrequencyType;
	};
};

export type VerifyTransactionType = {
	emailOrUsername: string;
	provider: PaymentProviderType;
	razorpayPaymentId: string;
	razorpayPaymentSignature: string;
} & ({ orderId: PaymentType['orderId'] } | { subscriptionId: PaymentType['subscriptionId'] });

export type RazorpayPaymentResponseType = {
	razorpay_payment_id: string;
	razorpay_subscription_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
};
