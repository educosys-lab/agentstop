import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { RESOLVER } from '@/constants/resolver.constant';
import { MODAL_IDS } from '@/constants/modal.constant';
import { SignupWithCredentialType } from '@/types/user.type';

import { useUser } from '@/hooks/useUser.hook';

import { useModal } from '@/providers/Modal.provider';
import { encryptString } from '@/utils/security.util';

const signupSchema = z.object({
	email: RESOLVER({ type: 'email', field: 'Email' }),
	password: RESOLVER({ field: 'Password' }),
	firstName: RESOLVER({ field: 'First Name' }),
	lastName: RESOLVER({ field: 'Last Name', isOptional: true }),
});

export const useSignup = () => {
	const { openModal, closeModal } = useModal();
	const { signupUser } = useUser();

	const userSignupForm = useForm<SignupWithCredentialType>({
		defaultValues: { email: '', password: '', firstName: '', lastName: '' },
		mode: 'onSubmit',
		resolver: zodResolver(signupSchema),
	});

	const { handleSubmit, reset, watch, setValue } = userSignupForm;

	const [isLoading, setIsLoading] = useState<'email' | 'google' | null>(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const onSignupClick = () => openModal(MODAL_IDS.SIGNUP);

	const onSignupUser = async (data: SignupWithCredentialType) => {
		if (isLoading) return;
		setIsLoading('email');
		setErrorMessage('');

		const encryptedPassword = await encryptString({ value: data.password, caller: 'useSignup' });
		if (!encryptedPassword) {
			setErrorMessage('Error encrypting password!');
			return;
		}

		const response = await signupUser({
			email: data.email,
			password: encryptedPassword,
			firstName: data.firstName,
			lastName: data.lastName,
		});

		if (!response.isError) {
			toast.success('Account created successfully! Please login to continue.');
			onAlreadyHaveAccountClick();
		} else {
			setErrorMessage(response.message);
			toast.error(response.message || 'An error occurred during signup, please try again!');
		}

		setIsLoading(null);
	};

	const onSignupModalClose = () => {
		reset();
		setErrorMessage('');
		setShowPassword(false);
		setIsLoading(null);
		closeModal(MODAL_IDS.SIGNUP);
	};

	const onAlreadyHaveAccountClick = () => {
		closeModal(MODAL_IDS.SIGNUP);
		openModal(MODAL_IDS.SIGNIN);
	};

	useEffect(() => {
		if (errorMessage) setErrorMessage('');
	}, [JSON.stringify(watch())]);

	return {
		isLoading,
		handleSubmit,
		watch,
		setValue,
		errorMessage,
		onSignupClick,
		onSignupUser,
		onSignupModalClose,
		showPassword,
		setShowPassword,
		onAlreadyHaveAccountClick,
	};
};
