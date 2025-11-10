import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { encryptString } from '@/utils/security.util';
import { RESOLVER } from '@/constants/resolver.constant';
import { URLS } from '@/constants/url.constant';
import { MODAL_IDS } from '@/constants/modal.constant';
import { SigninUserType } from '@/types/user.type';

import { useUser } from '@/hooks/useUser.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';

import { useModal } from '@/providers/Modal.provider';
import { userActions } from '@/store/features/user.slice';
import { REGEX } from '@/constants/regex.constant';

const signinSchema = z.object({
	emailOrUsername: RESOLVER({ field: 'Email' }),
	password: RESOLVER({ field: 'Password' }),
});

export const useSignin = () => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { openModal, closeModal } = useModal();
	const { signinUser } = useUser();
	const user = useAppSelector((state) => state.userState.user);

	const userSigninForm = useForm<Omit<SigninUserType, 'type'>>({
		defaultValues: { emailOrUsername: '', password: '' },
		mode: 'onSubmit',
		resolver: zodResolver(signinSchema),
	});

	const { handleSubmit, reset, watch, setValue } = userSigninForm;

	const [isLoading, setIsLoading] = useState<'email' | 'google' | null>(null);
	const [isCheckingSession, setIsCheckingSession] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const onSigninClick = () => {
		if (!user) return openModal(MODAL_IDS.SIGNIN);
		setIsCheckingSession(true);
		return router.push(URLS.DASHBOARD);
	};

	const onSigninUser = async (data: Omit<SigninUserType, 'type'>) => {
		if (isLoading) return;
		setIsLoading('email');
		setErrorMessage('');

		const isEmail = data.emailOrUsername.includes('@');
		const isValidEmail = isEmail ? REGEX.EMAIL.test(data.emailOrUsername) : true;

		if (!isValidEmail) {
			setErrorMessage('Please provide a valid email or username!');
			setIsLoading(null);
			return;
		}

		const encryptedPassword = await encryptString({ value: data.password, caller: 'useSignin' });
		if (!encryptedPassword) {
			setErrorMessage('Error encrypting password!');
			return;
		}

		const response = await signinUser({
			type: 'cred',
			emailOrUsername: data.emailOrUsername,
			password: encryptedPassword,
		});

		if (!response.isError) {
			const { ssoConfig, ...rest } = response.data;
			dispatch(userActions.setValue({ user: rest, ssoConfig, lastSynced: Date.now() }));

			toast.success('Signin successful');
			router.push(URLS.DASHBOARD);
			onModalClose();
		} else {
			setErrorMessage(response.message);
			toast.error(response.message || 'An error occurred during signin, please try again!');
			setIsLoading(null);
		}
	};

	const onNoAccountSignupClick = () => {
		closeModal(MODAL_IDS.SIGNIN);
		openModal(MODAL_IDS.SIGNUP);
	};

	const onModalClose = () => {
		reset();
		setErrorMessage('');
		setShowPassword(false);
		setIsLoading(null);
		setIsCheckingSession(false);
		closeModal(MODAL_IDS.SIGNIN);
	};

	useEffect(() => {
		setErrorMessage('');
	}, [JSON.stringify(watch())]);

	return {
		isLoading,
		isCheckingSession,
		handleSubmit,
		watch,
		setValue,
		errorMessage,
		onSigninClick,
		onSigninUser,
		onModalClose,
		showPassword,
		setShowPassword,
		onNoAccountSignupClick,
	};
};
