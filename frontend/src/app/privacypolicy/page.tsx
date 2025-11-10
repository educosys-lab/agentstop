'use client';

import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('../_components/navigation/NavBar'));

export default function PrivacyPage() {
	return (
		<>
			<NavBar page="others" />
			<div className="mx-auto w-full grow bg-background-dark px-6 pb-12 pt-24 text-white">
				<div className="mx-auto max-w-4xl space-y-6">
					<h1 className="text-center text-3xl font-semibold">Privacy Policy</h1>

					<p>
						<strong>Effective Date:</strong> June 1, 2025
						<br />
						This Privacy Policy explains how <strong>Agentstop.ai</strong> (operated by{' '}
						<strong>Amikee Tech Private Ltd</strong>) collects, uses, and protects your information —
						including data accessed through your Google account — when you use our platform at{' '}
						<a
							href="https://agentstop.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-400 underline"
						>
							agentstop.ai
						</a>
						.
					</p>

					<h2 className="text-xl font-semibold">1. What Information We Collect</h2>
					<ul className="ml-4 list-inside list-disc">
						<li>
							<strong>Personal Info:</strong> Name, email, photo (via Google), phone (optional), billing
							details, IP address.
						</li>
						<li>
							<strong>Google Data:</strong> With your permission, access to Gmail (read/send), Calendar
							(view/add), Drive (Sheets & Docs).
						</li>
						<li>
							<strong>Usage Data:</strong> Device type, browser, pages visited, and session diagnostics.
						</li>
						<li>
							<strong>Cookies:</strong> Used for session tracking and improving functionality.
						</li>
					</ul>

					<h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
					<ul className="ml-4 list-inside list-disc">
						<li>Authenticate your Google account.</li>
						<li>Execute missions you configure (e.g. send Gmail, update Sheets).</li>
						<li>Improve platform performance and comply with legal rules.</li>
					</ul>

					<h2 className="text-xl font-semibold">3. Why We Request Google Scopes</h2>
					<p>
						Scopes are requested so you can automate missions like sending emails, creating events, or
						updating Sheets. These permissions are limited to the features you explicitly use.
					</p>

					<h2 className="text-xl font-semibold">4. Data Sharing & Storage</h2>
					<ul className="ml-4 list-inside list-disc">
						<li>We do not sell or share your personal or Google data.</li>
						<li>Tokens are securely stored and encrypted.</li>
						<li>You can disconnect your Google account at any time.</li>
					</ul>

					<h2 className="text-xl font-semibold">5. Your Rights</h2>
					<ul className="ml-4 list-inside list-disc">
						<li>Request access or deletion of your data.</li>
						<li>Delete your account or disconnect Google.</li>
						<li>
							Email us at{' '}
							<a href="mailto:team@agentstop.ai" className="text-blue-400 underline">
								team@agentstop.ai
							</a>{' '}
							for any data concerns.
						</li>
					</ul>

					<h2 className="text-xl font-semibold">6. Data Security</h2>
					<p>
						We follow industry-standard practices to protect your data, though no method is completely
						secure.
					</p>

					<h2 className="text-xl font-semibold">7. Children’s Privacy</h2>
					<p>This platform is not intended for children under 13. We do not knowingly collect their data.</p>

					<h2 className="text-xl font-semibold">8. Compliance with Google API Policies</h2>
					<p>
						Agentstop.ai’s use of information received from Google APIs adheres to the{' '}
						<a
							href="https://developers.google.com/terms/api-services-user-data-policy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-400 underline"
						>
							Google API Services User Data Policy
						</a>
						, including the Limited Use requirements.
					</p>
					<p>
						We do <strong>not</strong> use Google user data to develop, improve, or train generalized
						artificial intelligence (AI) or machine learning (ML) models.
					</p>

					<h2 className="text-xl font-semibold">10. Contact Us</h2>
					<p>
						<strong>Company:</strong> Amikee Tech Private Ltd
						<br />
						<strong>Address:</strong> Insta Office, Sarjapur, Bengaluru, Karnataka 560035, India
						<br />
						<strong>Email:</strong>{' '}
						<a href="mailto:team@agentstop.ai" className="text-blue-400 underline">
							team@agentstop.ai
						</a>
					</p>
				</div>
			</div>
		</>
	);
}
