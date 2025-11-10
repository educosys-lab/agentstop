'use client';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { LinkElement } from '@/components/elements/LinkElement';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
	return (
		<div className="flex h-dvh min-h-[800px] flex-col items-center justify-center gap-4 p-5 text-center">
			<p className="text-lg font-semibold text-destructive">Error 500</p>
			<h2 className="text-6xl text-destructive">...Oops...</h2>
			<p className="max-w-xl text-lg">
				There is an unexpected error. Please try again. If the error persists, please contact us.
			</p>

			<div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
				<LinkElement
					href="mailto:support@educosys.com"
					title="Contact support"
					variant={'outline'}
					className="w-40"
				>
					Contact support
				</LinkElement>
				<ButtonElement onClick={() => reset()} title="Reload" className="w-40">
					Reload
				</ButtonElement>
			</div>
		</div>
	);
}
