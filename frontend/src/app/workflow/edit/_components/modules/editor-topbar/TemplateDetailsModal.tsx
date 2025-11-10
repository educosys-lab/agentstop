'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { ListCheckIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useAppSelector } from '@/store/hook/redux.hook';
import { useTemplate } from '@/app/template/_hook/useTemplate.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { InputElement } from '@/components/elements/InputElement';
import { TextAreaElement } from '@/components/elements/TextAreaElement';
import { SelectElement } from '@/components/elements/SelectElement';

export default function TemplateDetailsModal() {
	const { addTemplate } = useTemplate();
	const { activeModals, closeModal } = useModal();
	const workflow = useAppSelector((state) => state.workflowState.workflow);
	const allTemplates = workflowStoreSynced((state) => state.workflowTemplates) || [];

	const [isLoading, setIsLoading] = useState(false);
	const [templateDetails, setTemplateDetails] = useState<{ [key: string]: string }>({});
	const [addNewCategory, setAddNewCategory] = useState(false);
	const [addNewSubCategory, setAddNewSubCategory] = useState(false);

	const onInputUpdate = (field: string, value: string) => {
		setTemplateDetails((prevData) => ({ ...prevData, [field]: value }));
	};

	const onModalClose = () => {
		setIsLoading(false);
		setTemplateDetails({});
		closeModal(MODAL_IDS.TEMPLATE_ADD);
	};

	const onSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!workflow) return;

		setIsLoading(true);

		if (!templateDetails.title || !templateDetails.category || !templateDetails.subCategory) {
			setIsLoading(false);
			toast.error('Please fill in all required fields!');
			return;
		}

		const templateData = {
			title: templateDetails.title,
			category: templateDetails.category,
			subCategory: templateDetails.subCategory,
			nodes: workflow.nodes,
			edges: workflow.edges,
			preview: templateDetails.preview,
			notes: templateDetails.notes,
		};

		const response = await addTemplate(templateData);

		setIsLoading(false);
		if (response.data) onModalClose();
	};

	const selectCategoryContent = allTemplates.reduce(
		(acc, template) => {
			if (!acc.some((item) => item.value === template.category)) {
				acc.push({ value: template.category, label: template.category });
			}
			return acc;
		},
		[] as { value: string; label: string }[],
	);

	const selectSubCategoryContent = allTemplates.reduce(
		(acc, template) => {
			if (!acc.some((item) => item.value === template.subCategory)) {
				acc.push({ value: template.subCategory, label: template.subCategory });
			}
			return acc;
		},
		[] as { value: string; label: string }[],
	);

	if (!activeModals.includes(MODAL_IDS.TEMPLATE_ADD)) return null;
	return (
		<div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				transition={{ duration: 0.3, ease: 'easeInOut' }}
				className="relative w-full max-w-md rounded-2xl border border-border bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-xl"
			>
				<ButtonElement
					onClick={onModalClose}
					variant="wrapper"
					title="Close"
					className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
				>
					<FiX size={24} />
				</ButtonElement>

				<div className="mb-8 text-center">
					<h2 className="gradient-primary-light bg-clip-text text-3xl font-bold text-transparent">
						Template
					</h2>
					<p className="text-muted">Add Template Details</p>
				</div>

				<form onSubmit={onSave} className="flex flex-col gap-3">
					<InputElement
						value={templateDetails.title}
						onChange={(event) => onInputUpdate('title', event.target.value)}
						maxLength={40}
						label={
							<p>
								Title <span className="text-destructive">*</span>
							</p>
						}
						autoFocus
						placeholder="Enter template title"
					/>

					<div className="flex w-full items-center gap-2">
						{addNewCategory || selectCategoryContent.length < 1 ? (
							<InputElement
								value={templateDetails.category}
								onChange={(event) => onInputUpdate('category', event.target.value)}
								label={
									<p>
										Category <span className="text-destructive">*</span>
									</p>
								}
								placeholder="Enter template title"
							/>
						) : (
							<SelectElement
								value={templateDetails.category}
								onChange={(value) => onInputUpdate('category', value)}
								triggerText="Select category"
								content={selectCategoryContent}
								label={
									<p>
										Category <span className="text-destructive">*</span>
									</p>
								}
								triggerClassName="break-all py-2.5"
								viewportClassName="max-w-[300px]"
								containerClassName="w-full"
							/>
						)}

						<ButtonElement
							onClick={() => setAddNewCategory((prev) => !prev)}
							disabled={selectCategoryContent.length < 1}
							title={addNewCategory ? 'Select from existing category' : 'Add new category'}
							variant="outline"
							size={'icon'}
							className={'mt-6 size-10 shrink-0 gap-1 border-success'}
						>
							{addNewCategory ? (
								<ListCheckIcon className="size-5 shrink-0" />
							) : (
								<PlusIcon className="size-5 shrink-0" />
							)}
						</ButtonElement>
					</div>

					<div className="flex w-full items-center gap-2">
						{addNewSubCategory || selectSubCategoryContent.length < 1 ? (
							<InputElement
								value={templateDetails.subCategory}
								onChange={(event) => onInputUpdate('subCategory', event.target.value)}
								label={
									<p>
										Sub-Category <span className="text-destructive">*</span>
									</p>
								}
								placeholder="Enter template title"
							/>
						) : (
							<SelectElement
								value={templateDetails.subCategory}
								onChange={(value) => onInputUpdate('subCategory', value)}
								triggerText="Select sub-category"
								content={selectSubCategoryContent}
								label={
									<p>
										Sub-Category <span className="text-destructive">*</span>
									</p>
								}
								triggerClassName="break-all py-2.5"
								viewportClassName="max-w-[300px]"
								containerClassName="w-full"
							/>
						)}

						<ButtonElement
							onClick={() => setAddNewSubCategory((prev) => !prev)}
							disabled={selectSubCategoryContent.length < 1}
							title={addNewSubCategory ? 'Select from existing sub-category' : 'Add new sub-category'}
							variant="outline"
							size={'icon'}
							className={'mt-6 size-10 shrink-0 gap-1 border-success'}
						>
							{addNewSubCategory ? (
								<ListCheckIcon className="size-5 shrink-0" />
							) : (
								<PlusIcon className="size-5 shrink-0" />
							)}
						</ButtonElement>
					</div>

					<InputElement
						value={templateDetails.preview}
						onChange={(event) => onInputUpdate('preview', event.target.value)}
						label={'Preview Image URL'}
						placeholder="Enter template title"
					/>

					<TextAreaElement
						value={templateDetails.notes}
						onChange={(event) => onInputUpdate('notes', event.target.value)}
						maxLength={75}
						label={'Notes'}
						placeholder="Enter notes"
						autoAdjustHeight={true}
					/>

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<ButtonElement
							type="submit"
							isLoading={isLoading}
							title="Save"
							variant={'wrapper'}
							className="gradient-primary !mt-5 w-full rounded-xl py-4 text-base font-semibold transition-transform disabled:cursor-not-allowed disabled:opacity-50"
						>
							Save
						</ButtonElement>
					</motion.div>
				</form>
			</motion.div>
		</div>
	);
}
