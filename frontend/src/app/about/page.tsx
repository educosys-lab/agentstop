// app/about/page.tsx
import React from 'react';

export default function AboutPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-16">
			<h1 className="mb-6 text-center text-4xl font-bold">About Us</h1>

			<p className="mb-4 text-lg">
				<strong>Amikee Tech Private Ltd</strong> is the team behind <strong>Agentstop.ai</strong> — a powerful
				platform to build, manage, and scale AI agents through mission-based missions.
			</p>

			<p className="mb-4 text-lg">
				We are on a mission to simplify automation by letting intelligent agents handle repetitive and complex
				tasks through a clean, visual interface. Whether you are automating marketing, customer support, DevOps,
				or data missions — Agentstop gives you the tools to make it happen, fast.
			</p>

			<p className="mb-4 text-lg">
				Founded with a vision to democratize AI automation, we are passionate about helping developers, teams,
				and businesses build smarter systems without complexity.
			</p>

			<p className="mb-4 text-lg">
				Have questions, feedback, or want to work with us? Reach out anytime at:
				<a href="mailto:team@agentstop.ai" className="ml-1 text-blue-600 hover:underline">
					team@agentstop.ai
				</a>
				.
			</p>

			<p className="mt-10 text-center text-sm text-gray-500">
				© {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.
			</p>
		</main>
	);
}
