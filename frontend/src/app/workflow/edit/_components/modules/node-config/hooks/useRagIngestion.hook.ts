import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { convertDocsToBase64 } from '@/utils/file.util';
import { SourceType } from '@/types/rag.type';
import { SelectContentType } from '@/components/elements/SelectElement';

import { workflowStore } from '@/app/workflow/_store/workflow.store';
import { useRag } from '@/hooks/useRag.hook';
import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useWorkflowEditor } from '../../../hooks/useWorkflowEditor.hook';
import { useAppSelector } from '@/store/hook/redux.hook';
import { FormDataType } from './useNodeConfig.hook';

const sourceTypeOptions: SelectContentType[] = [
	{ value: 'url', label: 'URL' },
	{ value: 'text', label: 'Text' },
	{ value: 'pdf', label: 'PDF' },
	{ value: 'docx', label: 'DOCX' },
	{ value: 'ppt', label: 'PPT' },
	{ value: 'json', label: 'JSON' },
];

export const useRagIngestion = ({ formData }: { formData: FormDataType }) => {
	const user = useAppSelector((state) => state.userState.user);
	const ragSourceNames = workflowStore((state) => state.ragSourceNames);
	const setWSValue = workflowStore((state) => state.setWSValue);
	const { getUserRagSourceNames, ragIngestion, deleteUserRagSource } = useRag();
	const { updateAndSyncWorkflow } = useWorkflow();
	const { selectedNodeIds, isLive } = useWorkflowEditor();

	const [isIngesting, setIsIngesting] = useState(false);
	const [querySourceName, setQuerySourceName] = useState<{ value: string; label: string }[]>([]);
	const [sourceType, setSourceType] = useState<SourceType>('url');
	const [sourceName, setSourceName] = useState('');
	const [data, setData] = useState('');
	const [ragError, setRagError] = useState<Record<string, string>>({});
	const [crawlFullWebsite, setCrawlFullWebsite] = useState('false');

	useEffect(() => {
		if (ragSourceNames !== null) return;

		const getUserRagData = async () => {
			const response = await getUserRagSourceNames();
			if (response.isError) return;
			setWSValue({ ragSourceNames: response.data });
		};

		getUserRagData();
	}, []);

	useEffect(() => {
		if (!formData?.sourceName?.value) return;
		setQuerySourceName(formData.sourceName.value.map((item: string) => ({ value: item, label: item })));
	}, [formData?.sourceName?.value]);

	const onUpdateQuerySourceName = async ({
		data,
		action,
	}: {
		data: { value: string; label: string }[];
		action: 'add' | 'remove-single' | 'remove';
	}) => {
		if (action === 'add') setQuerySourceName((prev) => [...prev, ...data]);
		else if (action === 'remove-single') {
			setQuerySourceName((prev) => prev.filter((item) => item.value !== data[0].value));
		} else setQuerySourceName(data);
	};

	useEffect(() => {
		const updatedQuerySourceNameInDb = async () => {
			const response = await updateAndSyncWorkflow({
				updates: {
					config: [
						{
							nodeId: selectedNodeIds[0],
							updates: { sourceName: querySourceName.map((item) => item.value) },
						},
					],
				},
				isLive,
			});

			if (!response?.isError) toast.success('Node config saved successfully!');
			else if (response?.message) toast.error(response.message);
		};

		updatedQuerySourceNameInDb();
	}, [querySourceName]);

	const onIngestData = async () => {
		if (!user) return;

		toast.loading('Ingesting data...', { id: 'ingesting-data' });
		setIsIngesting(true);
		setRagError({});

		const ingestionData: Record<string, unknown> = {
			source_name: sourceName,
			source_type: sourceType,
			data,
			user_email: user.email,
		};
		if (sourceType === 'url') ingestionData.crawl_full_website = crawlFullWebsite;

		const response = await ragIngestion(ingestionData);
		if (response.isError) {
			toast.error(response.message);
			setIsIngesting(false);
			toast.dismiss('ingesting-data');
			return;
		}

		toast.success('Data ingested successfully!');
		setWSValue({ ragSourceNames: response.data });
		setIsIngesting(false);
		toast.dismiss('ingesting-data');
	};

	const onUploadFile = async (file?: File) => {
		if (!file) return;
		if (!['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(file.name.split('.').pop() || '')) {
			toast.error('Invalid file type!');
			return;
		}

		try {
			toast.loading('Reading file...', { id: 'reading-file' });

			const fileBase64Data = await convertDocsToBase64(file);
			setData(fileBase64Data);
			toast.success('File read successfully!');
		} catch (error) {
			console.error('error', error);
			toast.error('Error reading file');
		} finally {
			toast.dismiss('reading-file');
		}
	};

	const onDeleteSource = async (data: { value: string; label: string }) => {
		if (!data.value) return;
		toast.loading('Deleting data...', { id: 'deleting-data' });

		const response = await deleteUserRagSource(data.value);
		if (response.isError) {
			toast.error(response.message);
			toast.dismiss('deleting-data');
			return;
		}

		setWSValue({ ragSourceNames: ragSourceNames?.filter((name) => name !== data.value) || [] });
		await onUpdateQuerySourceName({ data: [data], action: 'remove-single' });

		toast.success('Data deleted successfully!');
		toast.dismiss('deleting-data');
	};

	const ragSourceNameOptions = (ragSourceNames || []).map((name) => ({ value: name, label: name }));

	return {
		querySourceName,
		onUpdateQuerySourceName,
		sourceType,
		setSourceType,
		sourceName,
		setSourceName,
		sourceTypeOptions,
		data,
		setData,
		ragError,
		onIngestData,
		ragSourceNameOptions,
		isIngesting,
		onUploadFile,
		crawlFullWebsite,
		setCrawlFullWebsite,
		onDeleteSource,
	};
};
