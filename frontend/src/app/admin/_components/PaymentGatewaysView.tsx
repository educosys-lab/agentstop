import { Edit3Icon, PlusCircleIcon } from 'lucide-react';

import { ModalType } from '../_types/admin.type';

import { Section } from '../_modules/Section';
import { Button } from '../../../components/ui/button';

type PaymentGatewayFormData = {
	gateway: string;
};

type PaymentGatewaysViewProps = {
	commonActions: { key: string; icon: string; label: string; onClick: () => void }[];
	openModal: (title: string, type: ModalType, modalId: string, initialData?: PaymentGatewayFormData) => void;
};

export const PaymentGatewaysView = ({ commonActions, openModal }: PaymentGatewaysViewProps) => {
	return (
		<Section
			title="Payment Gateways"
			actions={[
				...commonActions.map((action) => (
					<Button key={action.key} variant="outline" size="sm" onClick={action.onClick} className="py-5">
						{action.label}
					</Button>
				)),
				<Button
					key="add"
					onClick={() => openModal('Add Payment Gateway', 'addPaymentGateway', 'add-payment-gateway-modal')}
				>
					<PlusCircleIcon className="mr-2 size-5" />
					Add Gateway
				</Button>,
			]}
		>
			<div className="space-y-4">
				<div className="flex items-center justify-between rounded-lg bg-slate-700 p-4 shadow">
					<div>
						<h3 className="text-lg font-medium text-slate-200">Stripe Integration</h3>
						<p className="text-sm text-slate-400">Status: Active</p>
					</div>
					<Button
						onClick={() =>
							openModal('Edit Stripe Configuration', 'editStripe', 'edit-stripe-modal', {
								gateway: 'Stripe',
							})
						}
						variant="primary"
						size="sm"
					>
						<Edit3Icon className="mr-2 size-5" />
						Edit
					</Button>
				</div>
				<div className="flex items-center justify-between rounded-lg bg-slate-700 p-4 shadow">
					<div>
						<h3 className="text-lg font-medium text-slate-200">PayPal Integration</h3>
						<p className="text-sm text-slate-400">Status: Inactive</p>
					</div>
					<Button
						onClick={() =>
							openModal('Edit PayPal Configuration', 'editPaymentGateway', 'edit-paypal-modal', {
								gateway: 'PayPal',
							})
						}
						variant="primary"
						size="sm"
					>
						<Edit3Icon className="mr-2 size-5" />
						Edit
					</Button>
				</div>
			</div>
		</Section>
	);
};
