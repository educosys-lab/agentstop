import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { validateNodeConfigs } from '../utils/validateNodeConfigs.util';
import { NodeConfigType } from '../../../types/tool-node-config.type';
import { WorkflowType } from '@/app/workflow/_types/workflow.type';

import { useWorkflow } from '@/app/workflow/_hooks/useWorkflow.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { useWorkflowEditor } from '../../../hooks/useWorkflowEditor.hook';
import { useGoogle } from '@/hooks/useGoogle.hook';
import { useUser } from '@/hooks/useUser.hook';
import { workflowStoreSynced } from '@/app/workflow/_store/workflow-synced.store';
import { workflowActions } from '@/store/features/workflow.slice';
import { workflowStore } from '@/app/workflow/_store/workflow.store';

export type FormDataType = {
	[key: string]: { value: any; error: string };
};

export const useNodeConfig = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const userState = useAppSelector((state) => state.userState);
	const workflow = useAppSelector((state) => state.workflowState.workflow);

	const { updateAndSyncWorkflow } = useWorkflow();
	const { selectedNodeIds, selectedNodeType, isLive, selectedNodes } = useWorkflowEditor();
	const { getGoogleDataToShow, collectDataFromSearchParams } = useGoogle();
	const { deleteUserSsoConfig } = useUser();
	const setWSValue = workflowStore((state) => state.setWSValue);

	const nodesData = workflowStoreSynced((state) => state.nodesData);

	const [selectedNodeConfig, setSelectedNodeConfig] = useState<NodeConfigType[] | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormDataType>({});

	const selectedSsoConfig = userState.ssoConfig?.find((item) => item.id === formData['selectedSsoAccountId']?.value);

	const handleGoogleSignInClick = async () => {
		if (!workflow || selectedNodeIds.length < 1) return;

		try {
			router.push(`/api/auth/google?origin=${window.location.href}&nodeId=${selectedNodeIds[0]}`);
		} catch (error) {
			console.error('Error during Google sign-in:', error);
			toast.error('Error during Google sign-in!');
		}
	};

	const handleLinkedInSignInClick = async () => {
		if (!workflow || selectedNodeIds.length < 1) return;

		try {
			router.push(`/api/auth/linkedin?origin=${window.location.href}&nodeId=${selectedNodeIds[0]}`);
		} catch (error) {
			console.error('Error during LinkedIn sign-in:', error);
			toast.error('Error during LinkedIn sign-in!');
		}
	};

	const onUpdateFormData = (data: { [key: string]: any }) => {
		const dataToUpdate = Object.keys(data).reduce((acc, key) => {
			acc[key] = { value: data[key], error: '' };
			return acc;
		}, {} as FormDataType);

		setFormData((prev) => ({ ...prev, ...dataToUpdate }));
	};

	const handleCopyWebhookUrl = async () => {
		if (!workflow) return;

		try {
			let textToCopy = '';
			const selectedNode = selectedNodes[0];

			if (selectedNode.type === 'whatsapp-trigger') {
				textToCopy = `${process.env.NEXT_PUBLIC_API_URL}/webhook/whatsapp/${workflow.id}/${selectedNodes[0].id}`;
			} else if (selectedNode.type === 'whatsapp-tool') {
				textToCopy = `${process.env.NEXT_PUBLIC_API_URL}/webhook/whatsapp-tool/${workflow.id}/${selectedNodes[0].id}`;
			} else if (selectedNode.type === 'rag') {
				textToCopy = `${process.env.NEXT_PUBLIC_API_URL}/webhook/${workflow.id}`;
			} else {
				return;
			}

			await navigator.clipboard.writeText(textToCopy);
			toast.success('Webhook URL copied!');
		} catch (error) {
			console.error('Failed to copy text:', error);
		}
	};

	const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!workflow || !selectedNodeType || !selectedNodeConfig || selectedNodeIds.length !== 1) return;

		if (isLive) return toast.error('You cannot edit config in live mode!');

		setIsLoading(true);

		const formattedFormData = Object.keys(formData).reduce(
			(acc, key) => {
				const value = formData[key].value;
				acc[key] = value;
				return acc;
			},
			{} as WorkflowType['config'],
		);

		const validateResult = validateNodeConfigs({
			nodeType: selectedNodeType,
			data: formattedFormData,
			skipEmptyFields: true,
		});

		if (typeof validateResult !== 'boolean' && Object.keys(validateResult).length > 0) {
			const currentFormData = { ...formData };

			Object.keys(validateResult).forEach((key) => {
				const errorMessage = validateResult[key];
				if (currentFormData[key]) currentFormData[key].error = errorMessage;
				else currentFormData[key] = { value: '', error: errorMessage };
			});

			setFormData(currentFormData);
			// toast.error('Please fill all required fields correctly!');
			// setIsLoading(false);
			// return;
		}

		const response = await updateAndSyncWorkflow({
			updates: { config: [{ nodeId: selectedNodeIds[0], updates: formattedFormData }] },
			isLive,
		});

		if (!response?.isError) toast.success('Node config saved successfully!');
		else if (response?.message) toast.error(response.message);
		setIsLoading(false);
	};

	const onDeleteGoogleConfig = async (configId: string | undefined) => {
		if (!configId) return;

		const response = await deleteUserSsoConfig(configId);
		if (response.isError) return;

		setFormData((prev) => ({
			...prev,
			selectedSsoAccountId: { value: '', error: '' },
			access_token: { value: '', error: '' },
			refresh_token: { value: '', error: '' },
			selectedSsoEmail: { value: '', error: '' },
			file_id: { value: '', error: '' },
		}));
	};

	useEffect(() => {
		if (!userState.ssoConfig) return;

		const firstConfig = userState.ssoConfig[0];
		if (!firstConfig) return;

		setFormData((prev) => ({
			...prev,
			selectedSsoAccountId: { value: firstConfig.id, error: '' },
			access_token: { value: firstConfig.access_token, error: '' },
			refresh_token: { value: firstConfig.refresh_token, error: '' },
			selectedSsoEmail: { value: firstConfig.email, error: '' },
		}));

		getGoogleDataToShow(firstConfig);
	}, [userState.ssoConfig, formData['selectedSsoAccountId']?.value]);

	useEffect(() => {
		collectDataFromSearchParams();
	}, []);

	useEffect(() => {
		if (!workflow || !nodesData || !userState.ssoConfig) return;
		if (!selectedNodeType || selectedNodeIds.length !== 1) {
			setFormData({});
			setSelectedNodeConfig([]);
			return;
		}

		const selectedNodeData = nodesData.find((node) => node.metadata.type === selectedNodeType);
		if (!selectedNodeData) return;

		const savedConfig = workflow.config?.[selectedNodeIds[0]] || {};

		const newFormData = selectedNodeData.config.reduce((acc, item) => {
			if (['select-google-docs', 'select-google-sheets', 'image'].includes(item.type)) return acc;

			acc[item.name] = {
				value: typeof savedConfig[item.name] !== 'undefined' ? savedConfig[item.name] : item.defaultValue || '',
				error: '',
			};
			return acc;
		}, {} as FormDataType);

		for (const key in savedConfig) {
			if (!newFormData[key]) {
				newFormData[key] = { value: savedConfig[key], error: '' };
			}
		}

		if (!savedConfig['selectedSsoAccountId']) {
			const firstConfig = userState.ssoConfig[0];
			if (firstConfig) {
				newFormData['selectedSsoAccountId'] = { value: firstConfig.id, error: '' };
				newFormData['access_token'] = { value: firstConfig.access_token, error: '' };
				newFormData['refresh_token'] = { value: firstConfig.refresh_token, error: '' };
				newFormData['selectedSsoEmail'] = { value: firstConfig.email, error: '' };
			}
		}

		if (!selectedSsoConfig) {
			const config = userState.ssoConfig[0];
			if (config) {
				newFormData['selectedSsoAccountId'] = { value: config.id, error: '' };
				newFormData['access_token'] = { value: config.access_token, error: '' };
				newFormData['refresh_token'] = { value: config.refresh_token, error: '' };
				newFormData['selectedSsoEmail'] = { value: config.email, error: '' };
			}
		}

		setSelectedNodeConfig(selectedNodeData.config);
		setFormData(newFormData);

		if (workflow.config && !workflow.config[selectedNodeIds[0]]) {
			const formattedData = Object.keys(newFormData).reduce(
				(acc, key) => {
					acc[key] = newFormData[key].value;
					return acc;
				},
				{} as WorkflowType['config'],
			);

			dispatch(
				workflowActions.updateWorkflow({ config: { nodeId: selectedNodeIds[0], updates: formattedData } }),
			);
		}
	}, [selectedNodeIds[0], nodesData]);

	useEffect(() => {
		if (selectedNodeIds.length === 0) setWSValue({ isConfigBarOpen: false });
	}, [selectedNodeIds]);

	return {
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
	};
};
