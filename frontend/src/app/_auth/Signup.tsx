'use client';

import { motion } from 'framer-motion';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';

import { MODAL_IDS } from '@/constants/modal.constant';

import { useSignup } from './hooks/useSignup.hook';

import { useModal } from '@/providers/Modal.provider';

import { ButtonElement } from '@/components/elements/ButtonElement';

export default function Signup() {
	const {
		isLoading,
		handleSubmit,
		onSignupUser,
		watch,
		setValue,
		errorMessage,
		showPassword,
		setShowPassword,
		onSignupModalClose,
		onAlreadyHaveAccountClick,
	} = useSignup();
	const { activeModals } = useModal();

	if (!activeModals.includes(MODAL_IDS.SIGNUP)) return null;
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
					onClick={onSignupModalClose}
					variant="wrapper"
					title="Close"
					className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
				>
					<FiX size={24} />
				</ButtonElement>

				<div className="mb-8 text-center">
					<h2 className="gradient-primary-light bg-clip-text text-3xl font-bold text-transparent">Welcome</h2>
					<p className="text-muted">Secure signup</p>
				</div>

				<form onSubmit={handleSubmit(onSignupUser)} className="flex flex-col gap-2.5">
					<div className="group relative">
						<div className="gradient-primary absolute -inset-0.5 rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-75" />
						<div className="relative flex items-center rounded-xl border border-border bg-gray-800 p-4 transition-colors group-focus-within:border-primary">
							<FiMail className="mr-3 text-xl text-muted" />
							<input
								type="email"
								value={watch('email')}
								onChange={(event) => setValue('email', event.target.value)}
								autoFocus
								placeholder="Enter your email"
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

					<div className="grid grid-cols-2 gap-2">
						<div className="group relative">
							<div className="gradient-primary absolute -inset-0.5 rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-75" />
							<div className="relative flex items-center rounded-xl border border-border bg-gray-800 p-4 transition-colors group-focus-within:border-primary">
								<FiUser className="mr-3 shrink-0 text-xl text-muted" />
								<input
									placeholder="First name"
									value={watch('firstName')}
									onChange={(event) => setValue('firstName', event.target.value)}
									className="bg-transparent placeholder-muted-dark outline-none"
								/>
							</div>
						</div>

						<div className="group relative">
							<div className="gradient-primary absolute -inset-0.5 rounded-xl opacity-0 blur transition duration-300 group-hover:opacity-75" />
							<div className="relative flex items-center rounded-xl border border-border bg-gray-800 p-4 transition-colors group-focus-within:border-primary">
								<FiUser className="mr-3 shrink-0 text-xl text-muted" />
								<input
									placeholder="Last name"
									value={watch('lastName')}
									onChange={(event) => setValue('lastName', event.target.value)}
									className="bg-transparent placeholder-muted-dark outline-none"
								/>
							</div>
						</div>
					</div>

					{errorMessage && <p className="!mt-5 text-sm text-destructive">Error: {errorMessage}</p>}

					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<ButtonElement
							type="submit"
							isLoading={isLoading === 'email'}
							title="Signup"
							className="gradient-primary !mt-8 w-full rounded-xl py-4 font-semibold transition-transform disabled:cursor-not-allowed disabled:opacity-50"
						>
							Signup
						</ButtonElement>
					</motion.div>

					<ButtonElement
						onClick={onAlreadyHaveAccountClick}
						title="Already have an account? Sign in here!"
						variant={'wrapper'}
						className="mx-auto mt-2 text-sm transition-all hover:text-primary"
					>
						Already have an account? Sign in here!
					</ButtonElement>
				</form>
			</motion.div>
		</div>
	);
}
