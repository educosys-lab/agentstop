'use client';

import { motion } from 'framer-motion';
import { FiChevronRight, FiPlay } from 'react-icons/fi';
import ReactPlayer from 'react-player';

import { sectionVariants } from '../../_utils/framer-variant';
import { URLS } from '@/constants/url.constant';

import { useSignup } from '@/app/_auth/hooks/useSignup.hook';

import { ButtonElement } from '@/components/elements/ButtonElement';
import { LinkElement } from '@/components/elements/LinkElement';

export default function Hero() {
	const { onSignupClick } = useSignup();

	return (
		<section className="relative overflow-hidden bg-dark px-6 pb-24 pt-40 text-center">
			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 laptop:grid-cols-2">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={sectionVariants}
					className="flex flex-col justify-center"
				>
					<h1 className="mb-6 text-4xl font-bold !leading-tight md:text-5xl">
						<span className="gradient-primary-light bg-clip-text text-transparent [text-shadow:0_0_15px_theme(colors.blue.400/0.4)]">
							Agentstop
							<br />
						</span>
						Let AI Do the Work
					</h1>
					<p className="mx-auto mb-12 max-w-3xl text-lg text-muted">
						The one-stop solution for building, managing, and deploying powerful AI agents and missions.
						Automate anything, faster.
					</p>

					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
							<ButtonElement
								onClick={onSignupClick}
								title="Start building free"
								variant={'wrapper'}
								className="gradient-primary group relative flex items-center justify-center overflow-hidden rounded-full px-8 py-4 font-semibold shadow-lg transition-all hover:shadow-blue-500/30"
							>
								<span className="relative z-10">Start Building Free</span>
								<FiChevronRight className="relative z-10 ml-2 inline" size={20} />
							</ButtonElement>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05, y: -2, borderColor: 'rgb(107 114 128)' }}
							whileTap={{ scale: 0.95 }}
						>
							<LinkElement
								href="#demovideo"
								title="Watch Demo"
								className="flex items-center justify-center gap-2"
							>
								<ButtonElement
									title="Watch demo"
									variant={'wrapper'}
									className="hover:foreground flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-4 text-muted backdrop-blur-sm transition-all hover:bg-background"
								>
									<FiPlay /> Watch Demo
								</ButtonElement>
							</LinkElement>
						</motion.div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="mt-7 max-w-5xl rounded-2xl laptop:mt-0"
				>
					<div className="overflow-hidden rounded-xl">
						{/* <ImageElement
							src={IMAGES.LANDING.WORKFLOW_PREVIEW}
							alt="Agent Mission Interface Preview"
							className="block h-auto w-full"
						/> */}

						<ReactPlayer
							url={`${URLS.VIDEOS}/landingPageAnimation.webm`}
							playing
							loop
							muted
							className="!size-full"
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
