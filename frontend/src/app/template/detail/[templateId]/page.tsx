'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, Download } from 'lucide-react';

import { URLS } from '@/constants/url.constant';
import { TemplateType } from '../../_types/template.type';

import { LinkElement } from '@/components/elements/LinkElement';
import { useTemplate } from '../../_hook/useTemplate.hook';
import { Button } from '@/components/ui/button';

const NavBar = dynamic(() => import('../../../_components/navigation/NavBar'), { ssr: false });

export default function TemplateDetailPage() {
	const { templateId } = useParams();
	const [template, setTemplate] = useState<TemplateType | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { onCreateMissionFromTemplate } = useTemplate();

	useEffect(() => {
		const fetchTemplate = async () => {
			try {
				const response = await fetch(`${URLS.API}/template/all`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data: TemplateType[] = await response.json();
				if (!data || data.length === 0) {
					throw new Error('No templates received');
				}
				const selectedTemplate = data.find((t) => t.id === templateId);
				if (!selectedTemplate) {
					throw new Error(`Template with ID ${templateId} not found`);
				}
				setTemplate(selectedTemplate);
			} catch (error) {
				setError(
					error && typeof error === 'object' && 'message' in error
						? (error as { message: string }).message
						: 'Failed to load template',
				);
			}
		};
		if (templateId) fetchTemplate();
	}, [templateId]);

	if (error) return <div className="w-full bg-background-dark p-4 text-white">Error: {error}</div>;
	if (!template) return <div className="w-full bg-background-dark p-4 text-white"></div>;

	return (
		<div className="flex min-h-screen w-full flex-col bg-background-dark font-sans text-white">
			<NavBar page={'others'} />

			<div className="mx-auto mt-[72px] flex w-full max-w-7xl grow">
				<div className="flex w-full flex-col">
					<LinkElement
						href={URLS.TEMPLATE}
						title="Go to Templates"
						className="ml-5 mt-5 flex items-center gap-1.5 text-sm transition-all hover:text-primary"
					>
						<ArrowLeftIcon className="size-4" /> <span className="hidden md:inline">Templates</span>
					</LinkElement>

					<div className="flex grow flex-col items-center px-4 py-6 sm:px-6 sm:py-10 lg:ml-0 lg:px-8">
						<header className="mb-8 mt-12 w-full max-w-full sm:mb-12 lg:mt-0">
							<h1 className="mb-3 text-3xl font-extrabold leading-tight text-blue-100 sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
								{template.title}
							</h1>
						</header>

						<div className="flex w-full max-w-7xl flex-col items-center lg:flex-row lg:items-start lg:justify-between lg:gap-48">
							<div className="w-full lg:w-2/3">
								<p className="mb-6 max-w-2xl text-base text-blue-200 opacity-90 sm:px-0 sm:text-lg md:text-xl">
									{template.notes}
								</p>
								<div className="mb-6 mt-12 flex items-center justify-between">
									<span className="inline-block truncate rounded-full bg-indigo-600 bg-opacity-50 px-2 py-1 text-xs font-semibold text-indigo-200 sm:px-3">
										{template.category} / {template.subCategory}
									</span>
									<span className="flex shrink-0 items-center text-xs text-blue-200 sm:text-sm">
										<Download size={14} className="mr-1 text-sky-300" /> {template.used}
									</span>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										onCreateMissionFromTemplate(template.id);
									}}
									className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 sm:rounded-xl sm:text-base"
									variant="wrapper"
								>
									Create Mission From Template
								</Button>
							</div>

							<div className="mt-6 flex shrink-0 flex-row lg:mt-0 lg:w-1/3 lg:justify-end">
								{template.icons.map((icon, index) => (
									<img
										key={index}
										src={icon}
										alt={`${template.title}-icon-${index}`}
										className="ml-[-10px] size-24 rounded-full border-2 border-blue-400"
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer className="px-4 py-4 text-center text-xs text-blue-200 opacity-70 sm:text-sm">
				<p>© {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.</p>
			</footer>
		</div>
	);
}
