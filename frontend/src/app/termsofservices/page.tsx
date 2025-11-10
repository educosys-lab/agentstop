'use client';

import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('../_components/navigation/NavBar'));

export default function PrivacyPage() {
	return (
		<>
			<NavBar page={'others'} />
			<div className="mx-auto w-full grow bg-background-dark px-6 pb-12 pt-24">
				<div className="mx-auto max-w-4xl space-y-3">
					<h3 className="text-center">Terms of Service</h3>
					<p>
						Terms of Service
						<br />
						Effective Date: June 20, 2025
						<br />
						Company: Amikee Tech Private Ltd
						<br />
						Contact Email: team@agentstop.ai
						<br />
						Address: Insta Office, Sarjapur, Bengaluru, Karnataka, PIN 560035, India
						<br />
						<br />
						1. Acceptance of Terms
						<br />
						By accessing or using the Agentstop.ai website, products, and services ("Service"), you agree to
						be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not
						use the Service.
						<br />
						<br />
						2. Description of Service
						<br />
						Agentstop.ai provides a SaaS platform designed to [briefly describe functionality, e.g., “manage
						and execute AI missions via customizable agents”]. We reserve the right to modify or discontinue
						the Service (or any part of it) at any time, with or without notice.
						<br />
						<br />
						3. Eligibility
						<br />
						You must be at least 13 years old to use the Service. By using the Service, you represent and
						warrant that:
						<br />
						You are legally eligible to enter into this agreement.
						<br />
						All information you provide is accurate and up to date.
						<br />
						<br />
						4. User Accounts
						<br />
						To access certain features, you may need to create an account. You are responsible for
						maintaining the confidentiality of your login credentials and all activities under your account.
						Notify us immediately of any unauthorized use.
						<br />
						<br />
						5. Acceptable Use
						<br />
						You agree not to:
						<br />
						Use the Service for any illegal or unauthorized purpose.
						<br />
						Modify, reverse engineer, or attempt to gain unauthorized access to the platform.
						<br />
						Transmit malicious code or engage in any activity that disrupts or damages the Service.
						<br />
						<br />
						6. Subscription & Payment
						<br />
						Access to certain features may require a paid subscription. By subscribing, you agree to the
						applicable fees and billing terms. All subscriptions are set to auto-renew by default at the end
						of each billing cycle unless canceled before the renewal date. You may cancel your subscription
						at any time through your account settings.
						<br />
						Please note: We do not offer any refunds for payments made. Once a payment is processed, it is
						non-refundable, regardless of usage or cancellation timing. By using our Service, you
						acknowledge and agree to this no-refund policy.
						<br />
						<br />
						7. Intellectual Property
						<br />
						All content, trademarks, service marks, and software on Agentstop.ai are the property of
						Agentstop.ai or its licensors. You may not reproduce, distribute, or exploit any part of the
						Service without our prior written consent.
						<br />
						<br />
						8. Termination
						<br />
						We reserve the right to suspend or terminate your account at any time, with or without notice,
						if you violate these Terms or misuse the Service.
						<br />
						<br />
						9. Disclaimer of Warranties
						<br />
						The Service is provided "as is" and "as available". We make no warranties, expressed or implied,
						regarding the reliability, availability, or suitability of the Service.
						<br />
						<br />
						10. Limitation of Liability
						<br />
						To the fullest extent permitted by law, Agentstop.ai shall not be liable for any indirect,
						incidental, special, or consequential damages, including lost profits, arising from your use of
						the Service.
						<br />
						<br />
						11. Indemnification
						<br />
						You agree to indemnify and hold harmless Agentstop.ai, its affiliates, and their respective
						officers, directors, and employees from any claims or damages resulting from your use of the
						Service or violation of these Terms.
						<br />
						<br />
						12. Governing Law
						<br />
						These Terms shall be governed by the laws of the Republic of India. Any legal action arising
						from these Terms shall be brought in the courts located in Bengaluru, Karnataka.
						<br />
						<br />
						13. Changes to These Terms
						<br />
						We reserve the right to update or modify these Terms at any time. We will notify users of
						significant changes. Continued use of the Service after changes means you accept the revised
						Terms.
						<br />
						<br />
						14. Contact
						<br />
						If you have any questions about these Terms, please contact us:
						<br />
						<br />
						Email: team@agentstop.ai
						<br />
						Company Name: Amikee Tech Private Ltd
						<br />
						Address: Insta Office, Sarjapur, Bengaluru, Karnataka, PIN 560035, India
					</p>
				</div>
			</div>
		</>
	);
}
