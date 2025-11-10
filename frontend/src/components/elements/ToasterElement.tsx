import { Toaster } from 'sonner';
import { CircleCheckIcon, CircleXIcon, InfoIcon } from 'lucide-react';

export default function ToasterElement() {
	return (
		<Toaster
			position="bottom-right"
			closeButton={true}
			offset={{ bottom: 20, right: 20 }}
			toastOptions={{
				classNames: {
					toast: 'border-0 data-[expanded=true]:lift-10 gap-x-2.5 border-t-4 border-muted test-base',
					closeButton:
						'transition-all absolute size-max p-1 my-auto inset-[12px_16px_auto_auto] transform-none bg-muted',
					info: 'border-primary',
					success: 'border-success',
					error: 'border-destructive',
				},
			}}
			icons={{
				info: <InfoIcon className="size-6 rounded-full fill-primary text-background" />,
				success: <CircleCheckIcon className="size-6 rounded-full fill-success text-background" />,
				error: <CircleXIcon className="size-6 rounded-full fill-destructive text-background" />,
			}}
		/>
	);
}
