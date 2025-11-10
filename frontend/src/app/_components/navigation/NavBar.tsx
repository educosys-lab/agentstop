'use client';

import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Transition, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { FiGrid, FiList, FiLogOut } from 'react-icons/fi';
import { RiBarChartLine, RiFileTextLine, RiWhatsappLine } from 'react-icons/ri';

import { cn } from '@/utils/theme.util';
import { IMAGES } from '@/constants/image.constant';
import { URLS } from '@/constants/url.constant';

import { useSignin } from '@/app/_auth/hooks/useSignin.hook';
import { useSignup } from '@/app/_auth/hooks/useSignup.hook';
import { signOutUser } from '@/hooks/useUser.hook';
import { useAppDispatch, useAppSelector } from '@/store/hook/redux.hook';
import { dashboardActions } from '@/store/features/dashboard.slice';

import { LinkElement } from '@/components/elements/LinkElement';
import { ButtonElement } from '@/components/elements/ButtonElement';
import { ImageElement } from '@/components/elements/ImageElement';

type NavBarPropsType = {
	page?: 'landing' | 'dashboard' | 'others';
};

export default function NavBar({ page }: NavBarPropsType) {
	const dispatch = useAppDispatch();
	const { isCheckingSession, onSigninClick } = useSignin();
	const { onSignupClick } = useSignup();

	const user = useAppSelector((state) => state.userState.user);
	const view = useAppSelector((state) => state.dashboardState.view);

	const [activeSection, setActiveSection] = useState('');

	const setView = (view: 'grid' | 'list') => {
		dispatch(dashboardActions.setValue({ view }));
	};

	useEffect(() => {
		const sections = Array.from(document.querySelectorAll('section[id]')) as HTMLElement[];

		const onScroll = () => {
			const sectionPositions = sections.map((section) => ({
				id: section.id,
				top: section.getBoundingClientRect().top,
				height: section.getBoundingClientRect().height,
			}));

			const bestSection = sectionPositions
				.filter((section) => section.top < window.innerHeight / 3 && section.top > -(section.height - 200))
				.sort((a, b) => a.top - b.top)
				.pop();

			if (bestSection) setActiveSection(bestSection.id);
			else setActiveSection('');
		};

		onScroll();

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}, []);

	const logoSrc = IMAGES.BRAND.LOGO.startsWith('/') ? IMAGES.BRAND.LOGO : `/${IMAGES.BRAND.LOGO}`;

	return (
		<nav className="fixed top-0 z-50 h-18 w-full bg-black/25 backdrop-blur-md">
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 py-4">
				<LinkElement href={user ? URLS.DASHBOARD : URLS.HOME} title="Agentstop" className="flex items-center">
					<ImageElement src={logoSrc} alt="Agentstop" className="size-10 object-contain" />
					<motion.h1
						animate={{
							textShadow: [
								'0px 0px 4px rgba(59, 130, 246, 0)',
								'0px 0px 12px rgba(59, 130, 246, 0.7)',
								'0px 0px 12px rgba(217, 70, 239, 0.7)',
								'0px 0px 4px rgba(217, 70, 239, 0)',
							],
						}}
						transition={{
							textShadow: {
								duration: 2.5,
								ease: 'easeInOut',
								repeat: Infinity,
								repeatType: 'mirror',
							},
						}}
						className={cn(
							'gradient-primary hidden bg-clip-text text-2xl font-bold text-transparent laptop:inline-block',
						)}
					>
						Agentstop
					</motion.h1>
				</LinkElement>

				<div className="flex items-center space-x-6">
					{page === 'landing' && (
						<div className="hidden space-x-6 text-sm md:flex laptop:text-base">
							<LinkElement
								href="#features"
								title="Features"
								className={cn(
									'text-muted transition-all hover:text-foreground',
									activeSection === 'features' && 'font-medium text-light',
								)}
							>
								Features
							</LinkElement>
							<LinkElement
								href="#use-cases"
								title="Use Cases"
								className={cn(
									'text-muted transition-all hover:text-foreground',
									activeSection === 'use-cases' && 'font-medium text-light',
								)}
							>
								Use Cases
							</LinkElement>
							<LinkElement
								href="#pricing"
								title="Pricing"
								className={cn(
									'text-muted transition-all hover:text-foreground',
									activeSection === 'pricing' && 'font-medium text-light',
								)}
							>
								Pricing
							</LinkElement>
							<LinkElement
								href={URLS.TEMPLATE}
								target="_blank"
								title="Templates"
								className={cn(
									'text-muted transition-all hover:text-foreground',
									activeSection === 'template' && 'font-medium text-light',
								)}
							>
								Templates
							</LinkElement>
							{/* <LinkElement
								href={URLS.DOCUMENTATION}
								title="Documentation"
								className={cn(
									'text-muted transition-all hover:text-foreground',
									activeSection === 'documentation' && 'font-medium text-light',
								)}
							>
								Docs
							</LinkElement> */}
						</div>
					)}

					{(page === 'dashboard' || page === 'others') && (
						<div className="flex items-center gap-2">
							<ButtonElement
								onClick={() => (view === 'grid' ? setView('list') : setView('grid'))}
								title={view === 'grid' ? 'List view' : 'Grid view'}
								variant={'wrapper'}
								className={cn(
									'hidden rounded-lg p-2 transition-all hover:bg-light/25 sm:flex',
									page === 'others' && '!hidden',
								)}
							>
								{view === 'grid' ? <FiList size={20} /> : <FiGrid size={20} />}
							</ButtonElement>

							<LinkElement
								href={URLS.WHATSAPP_CAMPAIGN}
								title="Whatsapp Campaign"
								variant={'wrapper'}
								className={cn(
									'flex rounded-lg p-2 transition-all hover:bg-light/25',
									page === 'others' && '!hidden',
								)}
							>
								<RiWhatsappLine size={20} />
							</LinkElement>

							<LinkElement
								href={URLS.CAMPAIGN_ANALYTICS}
								title="Campaign Analytics"
								variant={'wrapper'}
								className={cn(
									'flex rounded-lg p-2 transition-all hover:bg-light/25',
									page === 'others' && '!hidden',
								)}
							>
								<RiBarChartLine size={20} />
							</LinkElement>

							<LinkElement
								href={URLS.TEMPLATE}
								target="_blank"
								title="Templates"
								className={cn(
									'flex rounded-lg p-2 transition-all hover:bg-light/25',
									activeSection === 'template' && 'font-medium text-light',
								)}
							>
								<RiFileTextLine size={20} />
							</LinkElement>
						</div>
					)}

					<div className="hidden h-6 w-px bg-border sm:flex" />

					{user ? (
						<div className="flex items-center gap-2">
							<Menu as="div" className="relative">
								<MenuButton className="flex items-center gap-2 rounded-full bg-gray-800 p-2 transition-colors hover:bg-gray-700">
									<div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-full">
										<span className="font-medium">{user.firstName.slice(0, 1)}</span>
									</div>
								</MenuButton>

								<Transition
									as={Fragment}
									enter="transition ease-out duration-100"
									enterFrom="transform opacity-0 scale-95"
									enterTo="transform opacity-100 scale-100"
									leave="transition ease-in duration-75"
									leaveFrom="transform opacity-100 scale-100"
									leaveTo="transform opacity-0 scale-95"
								>
									<MenuItems className="absolute right-0 mt-2 w-max origin-top-right rounded-lg bg-gray-800 shadow-lg focus:outline-none">
										<div className="p-1">
											{/* <MenuItem>
												<ButtonElement
													title="Settings"
													variant={'wrapper'}
													className="group flex w-full items-center justify-start gap-2 rounded-md py-2 pl-3 pr-6 text-sm hover:bg-gray-700"
												>
													<FiSettings size={16} /> Settings
												</ButtonElement>
											</MenuItem> */}

											<MenuItem>
												<ButtonElement
													onClick={signOutUser}
													title="Logout"
													variant={'wrapper'}
													className="group flex w-full items-center justify-start gap-2 rounded-md py-2 pl-3 pr-6 text-sm hover:bg-gray-700"
												>
													<FiLogOut size={16} /> Logout
												</ButtonElement>
											</MenuItem>
										</div>
									</MenuItems>
								</Transition>
							</Menu>
						</div>
					) : (
						<div className="space-x-3 md:flex">
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<ButtonElement
									onClick={onSigninClick}
									disabled={isCheckingSession}
									title="Signin"
									variant="wrapper"
									className="rounded-lg bg-gray-800 px-4 py-2 transition-all"
								>
									Sign In
								</ButtonElement>
							</motion.div>

							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<ButtonElement
									onClick={onSignupClick}
									disabled={isCheckingSession}
									title="Get started free"
									variant="wrapper"
									className="gradient-primary hidden rounded-lg px-4 py-2 font-medium transition-all md:block"
								>
									Get Started Free
								</ButtonElement>
							</motion.div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
