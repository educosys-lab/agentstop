import { motion } from 'framer-motion';

import { cn } from '@/utils/theme.util';
import { TemplateType } from '../_types/template.type';
import { cardVariants } from '@/app/(landing-page)/_utils/framer-variant';

import { useTemplate } from '../_hook/useTemplate.hook';

import { Button } from '@/components/ui/button';
import { ImageElement } from '@/components/elements/ImageElement';
// import { useRouter } from 'next/navigation';

type TemplateCardProps = {
	template: TemplateType;
};

export const TemplateCard = ({ template }: TemplateCardProps) => {
	const { onCreateMissionFromTemplate } = useTemplate();
	// const router = useRouter();

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.5 }}
			variants={cardVariants}
			whileHover={{ y: -8, scale: 1.03 }}
			className="group relative rounded-2xl bg-gradient-to-br from-blue-400 to-red-400 p-px transition-all duration-300"
			// onClick={() => router.push(`/template/detail/${template.id}`)}
		>
			<div className="gradient-dark relative flex h-full flex-col rounded-[15px] p-5 backdrop-blur-sm">
				<div className="flex shrink-0 items-center">
					{template.icons.slice(0, 7).map((icon, index) => (
						<ImageElement
							key={index}
							src={icon}
							alt={`${template.title}-icon`}
							className={cn('size-10', index > 0 && 'ml-[-10px]')}
						/>
					))}
				</div>

				<h3 className="mt-3 line-clamp-2 text-lg font-bold leading-tight text-white sm:text-xl">
					{template.title}
				</h3>

				<p className="mb-3 mt-1.5 line-clamp-3 text-sm text-blue-200 sm:text-base">{template.notes}</p>

				<div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
					<span className="inline-block truncate rounded-full bg-indigo-600 bg-opacity-50 px-2 py-1 text-xs font-semibold text-indigo-200 sm:px-3">
						{template.category} / {template.subCategory}
					</span>
				</div>

				<Button
					onClick={(e) => {
						e.stopPropagation();
						onCreateMissionFromTemplate(template.id);
					}}
					className="mt-5 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 sm:text-base sm:rounded-xl whitespace-normal break-words text-center"
					variant="wrapper"
				>
					Create Mission From Template
				</Button>
			</div>
		</motion.div>
	);
};
