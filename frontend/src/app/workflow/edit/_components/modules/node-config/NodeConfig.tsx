import { Fragment } from 'react';
import { InfoIcon, PlusIcon, RotateCwIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { FiX } from 'react-icons/fi';
import Select from 'react-select';

import { isObject } from 'lodash';
import { cn } from '@/utils/theme.util';
import { IMAGES } from '@/constants/image.constant';

import { useNodeConfig } from './hooks/useNodeConfig.hook';
import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useWorkflowEditor } from '../../hooks/useWorkflowEditor.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { useGoogle } from '@/hooks/useGoogle.hook';
import { useRagIngestion } from './hooks/useRagIngestion.hook';

import {
	// SelectContentGroupType,
	// SelectContentType,
	SelectElement,
} from '@/components/elements/SelectElement';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { TextAreaElement } from '@/components/elements/TextAreaElement';
import { InputElement } from '@/components/elements/InputElement';
import { ImageElement } from '@/components/elements/ImageElement';
import { Loader } from '@/components/elements/LoaderElement';
import { DatePickerElement } from '@/components/elements/DatePickerElement';
import NodeConfigLabel from './modules/Label';
import { TooltipElement } from '@/components/elements/TooltipElement';
import { LinkElement } from '@/components/elements/LinkElement';
import { InputLabelElement } from '@/components/elements/InputLabelElement';

export default function NodeConfig() {
	const userState = useAppSelector((state) => state.userState);
	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const { isLive, selectedNodes } = useWorkflowEditor();
	const { getGoogleDataToShow } = useGoogle();
	const googleFiles = workflowStore((state) => state.googleFiles);
	const isConfigBarOpen = workflowStore((state) => state.isConfigBarOpen);
	const setWSValue = workflowStore((state) => state.setWSValue);
	const {
		selectedNodeConfig,
		handleGoogleSignInClick,
		handleLinkedInSignInClick,
		onUpdateFormData,
		onFormSubmit,
		formData,
		isLoading,
		onDeleteGoogleConfig,
		selectedSsoConfig,
		handleCopyWebhookUrl,
	} = useNodeConfig();
	const {
		isIngesting,
		querySourceName,
		onUpdateQuerySourceName,
		sourceType,
		setSourceType,
		sourceName,
		setSourceName,
		sourceTypeOptions,
		ragError,
		data,
		setData,
		onIngestData,
		ragSourceNameOptions,
		onDeleteSource,
		onUploadFile,
		crawlFullWebsite,
		setCrawlFullWebsite,
	} = useRagIngestion({ formData });

	const isWhatsAppTriggerSelected = selectedNodes.length === 1 && selectedNodes[0].type === 'whatsapp-trigger';
	const isWhatsAppToolSelected = selectedNodes.length === 1 && selectedNodes[0].type === 'whatsapp-tool';
	const isRagToolSelected = selectedNodes.length === 1 && selectedNodes[0].type === 'rag';

	const copyUrl = ({ title, description, link }: { title: string; description: string; link?: string }) => (
		<div className="flex items-center gap-1 text-sm">
			<p>
				{title}:{' '}
				<ButtonElement
					variant="wrapper"
					title="Copy webhook URL"
					onClick={() => handleCopyWebhookUrl()}
					className="text-base font-semibold text-primary hover:text-primary/80"
				>
					Click to COPY
				</ButtonElement>
			</p>
			<TooltipElement
				trigger={<InfoIcon className="size-[18px] shrink-0 fill-muted-dark stroke-background stroke-[3px]" />}
				content={
					<p className="flex max-w-sm flex-col gap-2">
						<span>{description}</span>
						{link && (
							<LinkElement
								href={link}
								target="_blank"
								rel="noopener noreferrer"
								title={title}
								className="text-primary"
							>
								{link}
							</LinkElement>
						)}
					</p>
				}
			/>
		</div>
	);

	if (!userState.user || !isConfigBarOpen || !workflow) return null;
	return (
		<div className="relative h-full w-[320px] shrink-0 space-y-7 overflow-auto border-l-2 bg-background/10 px-4 py-6">
			<ButtonElement
				onClick={() => setWSValue({ isConfigBarOpen: false })}
				variant="wrapper"
				title="Close"
				className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
			>
				<FiX size={24} />
			</ButtonElement>

			{!selectedNodeConfig && <p>Select Tool for Config</p>}

			{isRagToolSelected && (
				<div className="flex w-full flex-col gap-5">
					{copyUrl({
						title: 'Webhook URL',
						description: 'Copy and paste this URL in the apiEndpoint field in the embedded chat.',
					})}

					<p className="font-medium">Source for Query</p>
					{ragSourceNameOptions.length > 0 ? (
						<div className="relative">
							<InputLabelElement
								label={
									<NodeConfigLabel
										label="Source name"
										isRequired={true}
										helperText="Select source name"
									/>
								}
							/>
							<Select
								value={querySourceName}
								onChange={(item) =>
									onUpdateQuerySourceName({
										data: item as { value: string; label: string }[],
										action: 'remove',
									})
								}
								options={ragSourceNameOptions}
								components={{
									Option: (props) => {
										return (
											<div
												onClick={() =>
													onUpdateQuerySourceName({ data: [props.data], action: 'add' })
												}
												className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/25"
											>
												{props.children}
												<ButtonElement
													onClick={(event) => {
														event.stopPropagation();
														onDeleteSource(props.data);
													}}
													title="Delete source"
													variant="outline"
													size={'icon'}
													className="group relative z-50 ml-auto size-7 shrink-0 border-0"
												>
													<Trash2Icon className="size-4 shrink-0 group-hover:text-destructive" />
												</ButtonElement>
											</div>
										);
									},
								}}
								isMulti={true}
								backspaceRemovesValue={true}
								isDisabled={isLive}
								isSearchable={true}
								placeholder="Select source name"
								noOptionsMessage={() => 'No source found, please ingest data first!'}
								className="multi-select mt-1"
								classNamePrefix="multi-select"
							/>
						</div>
					) : (
						<p className="text-sm font-medium">No source found, please ingest data first!</p>
					)}

					<div className="my-5 h-0.5 bg-muted/25" />
					<p className="font-medium">Ingest RAG Data</p>

					<InputElement
						value={sourceName}
						onChange={(event) => setSourceName(event.target.value)}
						disabled={isLive}
						label={<NodeConfigLabel label="Source name" isRequired={true} helperText="Enter source name" />}
						placeholder="Enter source name"
						message={ragError['sourceName']}
						isError={!!ragError['sourceName']}
						inputClassName="break-words"
						containerClassName="mt-2"
					/>
					<SelectElement
						value={sourceType}
						onChange={setSourceType}
						triggerText="Select source type"
						content={sourceTypeOptions}
						label={
							<NodeConfigLabel label="Source type" isRequired={true} helperText="Select source type" />
						}
						message={ragError['sourceName']}
						isError={!!ragError['sourceName']}
						triggerClassName="break-all py-2"
						viewportClassName="max-w-[300px]"
						containerClassName="w-full"
					/>
					{sourceType === 'url' && (
						<>
							<InputElement
								value={data as string}
								onChange={(event) => setData(event.target.value)}
								disabled={isLive}
								label={<NodeConfigLabel label="URL" isRequired={true} helperText="Enter URL" />}
								placeholder="Enter URL"
								message={ragError['data']}
								isError={!!ragError['data']}
								inputClassName="break-words"
							/>
							<SelectElement
								value={crawlFullWebsite}
								onChange={setCrawlFullWebsite}
								triggerText="Select crawl settings"
								content={[
									{ value: 'true', label: 'Crawl full website' },
									{ value: 'false', label: 'Crawl only the current page' },
								]}
								label={
									<NodeConfigLabel
										label="Crawl settings"
										isRequired={true}
										helperText="Select crawl settings"
									/>
								}
								message={ragError['crawlFullWebsite']}
								isError={!!ragError['crawlFullWebsite']}
								triggerClassName="break-all py-2"
								viewportClassName="max-w-[300px]"
								containerClassName="w-full"
							/>
						</>
					)}
					{['text'].includes(sourceType) && (
						<TextAreaElement
							value={data as string}
							onChange={(event) => setData(event.target.value)}
							disabled={isLive}
							label={<NodeConfigLabel label="Data" isRequired={true} helperText="Enter data" />}
							placeholder="Enter data"
							message={ragError['data']}
							isError={!!ragError['data']}
							autoAdjustHeight={true}
						/>
					)}
					{['pdf', 'docx', 'doc', 'pptx', 'ppt', 'json'].includes(sourceType) && (
						<InputElement
							type="file"
							onChange={(event) => onUploadFile(event.target.files?.[0])}
							disabled={isLive}
							accept={
								sourceType === 'pdf'
									? '.pdf'
									: sourceType === 'docx'
										? '.docx,.doc'
										: sourceType === 'ppt'
											? '.pptx,.ppt'
											: '.json'
							}
							label={<NodeConfigLabel label="File" isRequired={true} helperText="Upload file" />}
							placeholder="Upload file"
							message={ragError['file']}
							isError={!!ragError['file']}
						/>
					)}

					<ButtonElement
						onClick={onIngestData}
						disabled={isLive}
						isLoading={isIngesting}
						title="Ingest Data"
						size="sm"
						className="mt-5 w-full"
					>
						Ingest Data
					</ButtonElement>
				</div>
			)}

			{selectedNodeConfig && selectedNodeConfig.length < 1 && !isRagToolSelected && (
				<p className="text-center">No Config needed</p>
			)}

			{isLoading ? (
				<div className="flex items-center justify-center">
					<Loader />
				</div>
			) : (
				selectedNodeConfig &&
				selectedNodeConfig.length > 0 &&
				!isRagToolSelected && (
					<form onSubmit={onFormSubmit} className="flex w-full flex-col gap-5">
						{selectedNodeConfig.map((data, index) => {
							let component = null;
							let button = null;
							let showField = true;

							const isSensitive =
								('validation' in data &&
									data.validation.find((item) => item.field === data.name)?.isSensitiveData) ||
								false;

							if (data.showWhen) {
								const valueOfTheField = formData[data.showWhen.field]?.value;
								const valueToCheck = data.showWhen.value;
								if (valueOfTheField !== valueToCheck) showField = false;
							}

							const isRequired =
								('validation' in data &&
									data.validation.find((item) => item.field === data.name)?.required) ||
								false;

							let helperText = '';
							let helperLink = '';

							if (typeof data.description === 'string') helperText = data.description;

							if (isObject(data.description) && !Array.isArray(data.description)) {
								helperText = data.description.text || '';
								helperLink = data.description.url || '';
							}

							if (Array.isArray(data.description)) {
								data.description.find((item) => {
									const field = item.showWhen.field;

									if (item.showWhen.value === formData[field]?.value) {
										helperText = item.text;
										helperLink = item.url || '';
									} else if (item.showWhen.validValues) {
										if (item.showWhen.validValues.includes(formData[field]?.value)) {
											helperText = item.text;
											helperLink = item.url || '';
										}
									}
								});
							}

							if (!showField) return null;

							if (data.type === 'text') {
								component = (
									<InputElement
										value={formData[data.name]?.value}
										onChange={(event) => onUpdateFormData({ [data.name]: event.target.value })}
										disabled={isLive}
										label={
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										}
										type={isSensitive ? 'password' : 'text'}
										placeholder={data.placeholder}
										message={formData[data.name]?.error}
										isError={!!formData[data.name]?.error}
										inputClassName="break-words"
									/>
								);
							}

							if (data.type === 'textarea') {
								component = (
									<TextAreaElement
										value={formData[data.name]?.value}
										onChange={(event) => onUpdateFormData({ [data.name]: event.target.value })}
										disabled={isLive}
										label={
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										}
										type={isSensitive ? 'password' : 'text'}
										placeholder={data.placeholder}
										message={formData[data.name]?.error}
										isError={!!formData[data.name]?.error}
										autoAdjustHeight={true}
									/>
								);
							}

							if (data.type === 'select' && data.options) {
								component = (
									<SelectElement
										value={formData[data.name]?.value}
										onChange={(value) => onUpdateFormData({ [data.name]: value })}
										disabled={isLive}
										triggerText={data.placeholder || ``}
										content={data.options}
										label={
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										}
										message={formData[data.name]?.error}
										isError={!!formData[data.name]?.error}
										triggerClassName="py-2"
										viewportClassName="max-w-[300px]"
										containerClassName="w-full"
									/>
								);
							}

							if (
								['select-google-account', 'select-google-docs', 'select-google-sheets'].includes(
									data.type,
								)
							) {
								const userSsoConfig = userState.ssoConfig;
								if (!userSsoConfig || userSsoConfig.length === 0) return null;

								const onSelectGoogleAccount = (value: string) => {
									const selectedConfig = userSsoConfig.find((item) => item.id === value);
									if (!selectedConfig) return;

									onUpdateFormData({
										selectedSsoAccountId: selectedConfig.id,
										access_token: selectedConfig.access_token,
										refresh_token: selectedConfig.refresh_token,
										selectedSsoEmail: selectedConfig.email,
									});

									if (!googleFiles || !googleFiles[selectedConfig.email]) {
										getGoogleDataToShow(selectedConfig);
									}
								};

								const selectAccountContent = userSsoConfig.map((option) => ({
									id: option.id,
									label: `${option.name} (${option.email})`,
									value: option.id,
								}));

								const googleDocuments = googleFiles
									? googleFiles[formData['selectedSsoEmail']?.value] || []
									: [];

								let selectFileContent: { id: string; label: string; value: string }[] | null = null;

								if (data.type === 'select-google-docs') {
									const filteredData = googleDocuments.filter(
										(item) => item.mimeType === 'application/vnd.google-apps.document',
									);
									selectFileContent = filteredData.map((item) => ({
										id: item.id,
										value: item.id,
										label: item.name,
									}));
								}
								if (data.type === 'select-google-sheets') {
									const filteredData = googleDocuments.filter(
										(item) => item.mimeType === 'application/vnd.google-apps.spreadsheet',
									);
									selectFileContent = filteredData.map((item) => ({
										id: item.id,
										value: item.id,
										label: item.name,
									}));
								}

								const onSelectGoogleFile = (value: string) => {
									if (!selectFileContent) return;

									const selectedFile = selectFileContent.find((item) => item.id === value);
									if (!selectedFile) return;

									onUpdateFormData({
										file_id: selectedFile.id,
										file_name: selectedFile.label,
									});
								};

								component = (
									<>
										<div className="flex w-full items-center gap-2">
											<SelectElement
												value={selectedSsoConfig?.id}
												onChange={onSelectGoogleAccount}
												disabled={isLive}
												triggerText="Select google account"
												content={selectAccountContent}
												label={
													<NodeConfigLabel
														label="Google account"
														isRequired={isRequired}
														helperText="Select google account from which you want to list files"
													/>
												}
												message={formData['selectedAccount']?.error}
												isError={!!formData['selectedAccount']?.error}
												triggerClassName="break-all py-2"
												viewportClassName="max-w-[300px]"
												containerClassName="w-full"
											/>

											<div className={cn('mt-6 flex items-center gap-2')}>
												<ButtonElement
													onClick={() => getGoogleDataToShow(selectedSsoConfig)}
													disabled={!selectedSsoConfig || isLive}
													title="Refresh files from selected account"
													variant="outline"
													size={'icon'}
													className={cn(
														'size-10 shrink-0 gap-1 border-success',
														data.type === 'select-google-account' && 'hidden',
													)}
												>
													<RotateCwIcon className="size-4 shrink-0" />
												</ButtonElement>
												<ButtonElement
													onClick={() => onDeleteGoogleConfig(selectedSsoConfig?.id)}
													disabled={!selectedSsoConfig || isLive}
													title="Delete account from list"
													variant="outline"
													size={'icon'}
													className="size-10 shrink-0 gap-1 border-destructive hover:border-destructive hover:bg-destructive/30"
												>
													<Trash2Icon className="size-4 shrink-0" />
												</ButtonElement>
											</div>
										</div>

										{selectedSsoConfig && selectFileContent && (
											<SelectElement
												value={formData['file_id']?.value}
												onChange={onSelectGoogleFile}
												disabled={isLive || selectFileContent.length === 0}
												triggerText={
													selectFileContent.length === 0
														? 'There are no files, please refresh'
														: 'Select file'
												}
												content={selectFileContent}
												label={
													<NodeConfigLabel
														label="File"
														isRequired={isRequired}
														helperText="Select google document on which you want to perform action"
													/>
												}
												message={formData['selectedAccount']?.error}
												isError={!!formData['selectedAccount']?.error}
												triggerClassName="break-all py-2"
												viewportClassName="max-w-[300px]"
												containerClassName="w-full"
											/>
										)}
									</>
								);
							}

							if (data.type === 'radio' && data.options) {
								const message = formData[data.name]?.error;
								const isError = !!formData[data.name]?.error;

								component = (
									<div className="flex flex-col gap-2">
										<Label asChild>
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										</Label>

										<RadioGroup
											value={formData[data.name].value}
											onValueChange={(value) => onUpdateFormData({ [data.name]: value })}
											disabled={isLive}
										>
											{data.options.map((option) => (
												<div key={option.value} className="flex items-center gap-2">
													<RadioGroupItem id={option.value} value={option.value} />
													<Label htmlFor={option.value} className="truncate text-sm">
														{option.label}
													</Label>
												</div>
											))}
										</RadioGroup>

										{message && (
											<p
												className={cn(
													'input-message',
													`${isError ? 'input-error-message' : 'input-success-message'}`,
												)}
											>
												{message}
											</p>
										)}
									</div>
								);
							}

							if (data.type === 'checkbox' && data.options) {
								const message = formData[data.name]?.error;
								const isError = !!formData[data.name]?.error;

								component = (
									<div className="flex flex-col gap-2">
										<Label asChild>
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										</Label>

										{data.options.map((option) => (
											<div key={option.value} className="flex items-center gap-2">
												<Checkbox
													key={data.name}
													id={option.value}
													checked={formData[data.name]?.value.includes(option.value)}
													onCheckedChange={(value) => {
														const currentValues = formData[data.name]?.value
															.split(',')
															.filter((value: string) => value);

														if (!value) {
															return onUpdateFormData({
																[data.name]: currentValues
																	.filter((value: string) => value !== option.value)
																	.join(','),
															});
														}

														if (currentValues.length === 0) {
															return onUpdateFormData({
																[data.name]: option.value,
															});
														} else {
															return onUpdateFormData({
																[data.name]: [...currentValues, option.value].join(','),
															});
														}
													}}
													disabled={isLive}
												/>
												<Label htmlFor={option.value} className="truncate text-sm">
													{option.label}
												</Label>
											</div>
										))}

										{message && (
											<p
												className={cn(
													'input-message',
													`${isError ? 'input-error-message' : 'input-success-message'}`,
												)}
											>
												{message}
											</p>
										)}
									</div>
								);
							}

							if (data.type === 'date-time') {
								component = (
									<DatePickerElement
										type="datetime"
										label={
											<NodeConfigLabel
												label={data.label}
												isRequired={isRequired}
												helperText={helperText}
												helperLink={helperLink}
											/>
										}
										value={formData[data.name]?.value || ''}
										onChange={(date) => onUpdateFormData({ [data.name]: date })}
										outputFormat="iso"
										message={formData[data.name]?.error}
										isError={!!formData[data.name]?.error}
										timeTriggerClassName="w-16 px-2"
									/>
								);
							}

							if (data.type === 'image') {
								let source = '';

								if (typeof data.src === 'string') source = data.src;

								if (Array.isArray(data.src)) {
									data.src.find((item) => {
										const field = item.showWhen.field;

										if (item.showWhen.value === formData[field]?.value) {
											source = item.value;
										} else if (item.showWhen.validValues) {
											if (item.showWhen.validValues.includes(formData[field]?.value)) {
												source = item.value;
											}
										}
									});
								}

								component = (
									<div className="flex flex-col gap-2">
										<NodeConfigLabel
											label={data.label}
											isRequired={isRequired}
											helperText={helperText}
											helperLink={helperLink}
										/>
										<ImageElement src={source} alt={data.label} className="rounded-lg" />
									</div>
								);
							}

							if (data.showButton) {
								const valueOfTheField = formData[data.showButton?.field]?.value;
								const valueToCheck = data.showButton.value;

								if (valueOfTheField === valueToCheck) {
									button = (
										<div className="space-y-1.5">
											<p className="text-xs text-muted">
												Note: Select existing Google account from below or Signin with a
												different account.
											</p>

											<div className="flex items-center gap-2">
												<ButtonElement
													onClick={() => {
														if (data.showButton?.type === 'google') {
															handleGoogleSignInClick();
														} else if (data.showButton?.type === 'linkedin') {
															handleLinkedInSignInClick();
														} else console.log('Unsupported auth type');
													}}
													disabled={!!selectedSsoConfig || isLive}
													variant="outline"
													size={'sm'}
													title={data.showButton.type}
													className={cn('h-10 w-full gap-2')}
												>
													{data.showButton.type === 'google'
														? selectedSsoConfig
															? 'Connected'
															: 'Signin with Google'
														: ''}

													{data.showButton.type === 'linkedin'
														? selectedSsoConfig
															? 'Connected'
															: 'Signin with LinkedIn'
														: ''}

													<ImageElement
														src={IMAGES.ICONS.GOOGLE}
														alt={'Google'}
														className={cn(data.showButton.type !== 'google' && 'hidden')}
													/>
													<ImageElement
														src={IMAGES.ICONS.LINKEDIN}
														alt={'LinkedI'}
														className={cn(data.showButton.type !== 'linkedin' && 'hidden')}
													/>
												</ButtonElement>

												<ButtonElement
													onClick={() => {
														if (data.showButton?.type === 'google') {
															handleGoogleSignInClick();
														} else if (data.showButton?.type === 'linkedin') {
															handleLinkedInSignInClick();
														} else console.log('Unsupported auth type');
													}}
													disabled={isLive}
													variant="outline"
													size={'icon'}
													title="Remove selected google account"
													className={cn(
														'size-10 shrink-0 border-success',
														!selectedSsoConfig && 'hidden',
													)}
												>
													<PlusIcon className="size-5" />
												</ButtonElement>
											</div>
										</div>
									);
								}
							}

							return (
								<Fragment key={index}>
									{(isWhatsAppTriggerSelected || isWhatsAppToolSelected) &&
										index === 0 &&
										copyUrl({
											title: 'Callback URL',
											description:
												'Used to receive WhatsApp message events (like incoming messages). Copy and paste this URL in the Callback URL field in the WhatsApp > API Setup section of your Meta Developer Dashboard.',
											link: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/',
										})}

									{component}
									{button}
								</Fragment>
							);
						})}

						<ButtonElement
							isLoading={isLoading}
							disabled={isLoading || isLive}
							type="submit"
							title="Save"
							size={'sm'}
							className="mt-3 w-full gap-1.5"
						>
							<SaveIcon className="size-5" />
							Save
						</ButtonElement>
					</form>
				)
			)}
		</div>
	);
}
