import axios from 'axios';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { convertFileToBase64 } from '@/utils/file.util';

import { useUser } from './useUser.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { userActions } from '@/store/features/user.slice';

export const useAws = () => {
	const dispatch = useAppDispatch();
	const { updateUser } = useUser();
	const user = useAppSelector((state) => state.userState.user);

	const uploadData = async ({ file, fileMetadata }: { file: File; fileMetadata: Record<string, any> | null }) => {
		try {
			if (!user) {
				toast.error('User not found!');
				return;
			}

			const base64File = await convertFileToBase64(file);

			const response = await axios.post('/api/upload', {
				file: base64File,
				fileName: file.name,
				email: user.email,
			});
			if (response.data.error) {
				toast.error(response.data.error);
				return;
			}

			const updateUserData = await updateUser({
				files: [
					{
						id: uuidv4(),
						fileName: file.name,
						originalFileName: file.name,
						url: response.data,
						uploadTime: Date.now(),
						metadata: fileMetadata || {},
					},
				],
			});
			if (updateUserData.isError) {
				toast.error(updateUserData.message);
				return;
			}

			const { ssoConfig, ...rest } = updateUserData.data;
			dispatch(userActions.setValue({ user: rest, ssoConfig, lastSynced: Date.now() }));
			toast.success('File uploaded successfully');
		} catch (error) {
			console.error('Error uploading file', error);
			toast.error('Error uploading file');
		}
	};

	return { uploadData };
};
