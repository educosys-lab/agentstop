'use client';

import { motion } from 'framer-motion';

import { cardVariants, sectionVariants } from '../../_utils/framer-variant';

const featuresList = [
	{
		title: 'Visual Mission Builder',
		description: 'Drag-and-drop interface with pre-built actions & triggers.',
	},
	{ title: 'Seamless AI Integration', description: 'Connect popular LLMs or use our built-in AI agents.' },
	{ title: 'Real-time Monitoring', description: 'Live monitoring, logging, and debugging for your missions.' },
];

export default function Feature() {
	return (
		<section className="px-6 py-24" id="features">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
					variants={sectionVariants}
					className="mb-20 text-center"
				>
					<h2 className="mb-6 text-4xl font-bold md:text-5xl">Powerful Features for Agentic Automation </h2>
					<p className="mx-auto max-w-2xl text-lg text-muted">
						Everything you need to build, manage, and scale intelligent agents and missions.
					</p>
				</motion.div>
				<div className="grid gap-8 md:grid-cols-3">
					{featuresList.map((feature, i) => (
						<motion.div
							key={feature.title}
							custom={i}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.5 }}
							variants={cardVariants}
							whileHover={{ y: -8, scale: 1.03 }}
							className="gradient-blue-red group relative rounded-2xl p-px transition-all duration-300"
						>
							<div className="relative flex h-full flex-col rounded-[15px] bg-gray-800/90 p-8 backdrop-blur-sm">
								<div className="text-primary-light mb-4 text-3xl font-semibold">0{i + 1}</div>
								<h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
								<p className="text-muted">{feature.description}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
