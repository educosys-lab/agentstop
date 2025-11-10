import { TemplateType } from '../_types/template.type';

import { TemplateCard } from './TemplateCard';

type TemplateGridProps = {
	templates: TemplateType[];
};

export const TemplateGrid = ({ templates }: TemplateGridProps) => {
	return (
		<main className="grid w-full grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
			{templates.length > 0 ? (
				templates.map((template) => <TemplateCard key={template.id} template={template} />)
			) : (
				<div className="col-span-full py-8 text-center text-lg text-blue-200 opacity-80 sm:py-12 sm:text-xl">
					No templates found matching your criteria.
				</div>
			)}
		</main>
	);
};
