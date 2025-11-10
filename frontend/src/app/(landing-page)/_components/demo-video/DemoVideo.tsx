'use client';

import { motion } from 'framer-motion';
// import { FiPlay } from 'react-icons/fi';
import ReactPlayer from 'react-player';

import { sectionVariants } from '../../_utils/framer-variant';

// import { ButtonElement } from '@/components/elements/ButtonElement';

export default function DemoVideo() {
	return (
		<section id="demovideo" className="bg-background-dark px-6 py-24">
			<div className="mx-auto max-w-5xl text-center">
				<motion.h2
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.5 }}
					variants={sectionVariants}
					className="mb-12 text-4xl font-bold md:text-5xl"
				>
					See Agentstop in Action
				</motion.h2>

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.7 }}
					className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg"
				>
					<ReactPlayer url="https://youtu.be/ko1NSHC1jdo" controls={true} className="!size-full" />

					{/* <div className="absolute inset-0 flex items-center justify-center">
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<ButtonElement
								title="Play demo video"
								variant="wrapper"
								className="rounded-full bg-white/10 p-6 text-white backdrop-blur-md transition-all hover:bg-white/20 md:p-8"
							>
								<FiPlay className="h-10 w-10 md:h-12 md:w-12" />
							</ButtonElement>
						</motion.div>{' '}
					</div> */}
				</motion.div>
			</div>
		</section>
	);
}
