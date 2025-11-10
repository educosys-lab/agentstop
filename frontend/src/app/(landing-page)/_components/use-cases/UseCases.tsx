'use client';

import { motion } from 'framer-motion';

import { cardVariants, sectionVariants } from '../../_utils/framer-variant';

const useCases = [
	{ title: 'Customer Support Agents', description: 'Automate responses & ticket handling with AI agents.' },
	{ title: 'Data Processing Agents', description: 'Build agents to transform and move data seamlessly.' },
	{ title: 'Marketing Automation', description: 'Orchestrate campaigns with trigger-based agent actions.' },
	{ title: 'DevOps & IT Agents', description: 'Automate deployments, monitoring, and incident response.' },
];

export default function UseCases() {
	return (
		<section className="bg-background-dark px-6 py-24" id="use-cases">
			<div className="mx-auto max-w-6xl">
				<motion.h2
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.5 }}
					variants={sectionVariants}
					className="mb-16 text-center text-4xl font-bold md:text-5xl"
				>
					Powering Innovation Across Industries
				</motion.h2>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{useCases.map((useCase, i) => (
						<motion.div
							key={useCase.title}
							custom={i}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, amount: 0.5 }}
							variants={cardVariants}
							whileHover={{ y: -8, scale: 1.03 }}
							className="gradient-blue-red group relative rounded-2xl p-px transition-all duration-300"
						>
							<div className="relative flex h-full flex-col rounded-[15px] bg-gray-800/90 p-8 backdrop-blur-sm">
								<div className="mb-4 text-2xl font-semibold text-primary-light">0{i + 1}</div>
								<h3 className="mb-3 grow text-xl font-semibold text-foreground">{useCase.title}</h3>
								<p className="text-muted">{useCase.description}</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
