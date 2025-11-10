'use client';

import { motion } from 'framer-motion';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useSignin } from './hooks/useSignin.hook';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';

export default function Signin() {
	const {
		isLoading,
		handleSubmit,
		onSigninUser,
		watch,
		setValue,
		errorMessage,
		showPassword,
		setShowPassword,
		onModalClose,
		onNoAccountSignupClick,
	} = useSignin();
	const { activeModals } = useModal();

	if (!activeModals.includes(MODAL_IDS.SIGNIN)) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
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
						Welcome Back
					</h2>
					<p className="text-muted">Secure authentication</p>
				</div>

				<form onSubmit={handleSubmit(onSigninUser)} className="flex flex-col gap-2.5">
					<div className="group relative">
						<div className="gradient-primary absolute -inset-0.5 rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-75" />
						<div className="relative flex items-center rounded-xl border border-border bg-gray-800 p-4 transition-colors group-focus-within:border-primary">
							<FiMail className="mr-3 text-xl text-muted" />
							<input
								type="emailOrUsername"
								value={watch('emailOrUsername')}
								onChange={(event) => setValue('emailOrUsername', event.target.value)}
								autoFocus
								placeholder="Enter your email/username"
								className="flex-1 bg-transparent placeholder-muted-dark outline-none"
							/>
						</div>
					</div>

					<div className="group relative">
						<div className="gradient-primary absolute -inset-0.5 rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-75" />
						<div className="relative flex items-center rounded-xl border border-border bg-gray-800 p-4 transition-colors group-focus-within:border-primary">
							<FiLock className="mr-3 text-xl text-muted" />
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
								value={watch('password')}
								onChange={(event) => setValue('password', event.target.value)}
								className="flex-1 bg-transparent placeholder-muted-dark outline-none"
							/>

							<ButtonElement
								onClick={() => setShowPassword((prev) => !prev)}
								title="View password"
								variant={'wrapper'}
							>
								{showPassword ? <FiEye /> : <FiEyeOff />}
							</ButtonElement>
						</div>
					</div>

					{errorMessage && <p className="!mt-5 text-sm text-destructive">Error: {errorMessage}</p>}

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<ButtonElement
							type="submit"
							isLoading={isLoading === 'email'}
							title="Signin"
							variant={'wrapper'}
							className="gradient-primary !mt-8 w-full rounded-xl py-4 font-semibold transition-transform disabled:cursor-not-allowed disabled:opacity-50"
						>
							Signin
						</ButtonElement>
					</motion.div>

					<ButtonElement
						onClick={onNoAccountSignupClick}
						title="No account? Signup here!"
						variant={'wrapper'}
						className="mx-auto mt-2 text-sm transition-all hover:text-primary"
					>
						No account? Signup here!
					</ButtonElement>
				</form>
			</motion.div>
		</div>
	);
}
