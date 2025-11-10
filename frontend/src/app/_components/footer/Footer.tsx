'use client';

// import { motion } from 'framer-motion';
import { FiLinkedin, FiInstagram } from 'react-icons/fi';
import { RiDiscordLine } from "react-icons/ri";

import { LinkElement } from '@/components/elements/LinkElement';
// import { ButtonElement } from '@/components/elements/ButtonElement';

export default function Footer() {
	return (
		<footer className="mt-auto border-t bg-dark">
			<div className="mx-auto max-w-6xl px-6 pb-12 pt-16">
				<div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-6 lg:col-span-2">
						<h3 className="gradient-primary-light bg-clip-text text-2xl font-bold text-transparent">
							Agentstop
						</h3>
						<p className="max-w-md text-gray-400">
						Join our Discord for product updates, automation tips, feature requests, bug reports, and exclusive offers.
						</p>

						{/* <form className="flex flex-col gap-2.5 sm:flex-row sm:gap-2">
							<input
								type="email"
								placeholder="Enter your email"
								required
								className="min-w-0 rounded-lg border border-border bg-input px-5 py-3 placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
							/>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<ButtonElement
									type="submit"
									title="Subscribe"
									variant="wrapper"
									className="gradient-primary rounded-lg p-3 font-medium text-foreground transition-transform"
								>
									Subscribe
								</ButtonElement>
							</motion.div>
						</form> */}
						<h4 className="mb-4 mt-6 font-semibold text-foreground">Connect</h4>
							<div className="mb-6 flex space-x-4">
								<a
									href="https://www.linkedin.com/company/107157800"
									target="_blank"
  									rel="noopener noreferrer"
									aria-label="LinkedIn"
									className="hover:text-primary-light text-muted transition-colors"
								>
									<FiLinkedin size={22} />
								</a>
								<a
									href="https://www.instagram.com/agentstop.ai"
									target="_blank"
  									rel="noopener noreferrer"
									aria-label="Instagram"
									className="hover:text-primary-light text-muted transition-colors"
								>
									<FiInstagram size={22} />
								</a>
								<a
									href="https://discord.gg/MkSBnXRTxZ"
									target="_blank"
  									rel="noopener noreferrer"
									aria-label="Discord"
									className="hover:text-primary-light text-muted transition-colors -mt-[2.5px]"
								>
									<RiDiscordLine size={27} />
								</a>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-8 md:col-span-1 lg:col-span-2">
						<div>
							<h4 className="mb-4 font-semibold text-foreground">Product</h4>
							<ul className="space-y-3 text-muted">
								<li>
									<LinkElement
										href="#features"
										title="Features"
										className="transition-colors hover:text-foreground"
									>
										Features
									</LinkElement>
								</li>
								<li>
									<LinkElement
										href="#pricing"
										title="Pricing"
										className="transition-colors hover:text-foreground"
									>
										Pricing
									</LinkElement>
								</li>
							</ul>

							<h4 className="mb-4 mt-6 font-semibold text-foreground">Legal</h4>
							<ul className="space-y-3 text-muted">
								<li>
									<LinkElement
										href="/privacypolicy"
										title="Privacy Policy"
										className="transition-colors hover:text-foreground"
									>
										Privacy Policy
									</LinkElement>
								</li>
								<li>
									<LinkElement
										href="/termsofservices"
										title="Terms of Services"
										className="transition-colors hover:text-foreground"
									>
										Terms of Services
									</LinkElement>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="mb-4 font-semibold text-foreground">Company</h4>
							<ul className="space-y-3 text-muted">
								<li>
									<LinkElement
										href="/about"
										title="About Us"
										className="transition-colors hover:text-foreground"
									>
										About Us
									</LinkElement>
								</li>
								<li>
									<LinkElement
										href="/contact"
										title="Contact"
										className="transition-colors hover:text-foreground"
									>
										Contact
									</LinkElement>
								</li>
							</ul>

						</div>
					</div>
				</div>

				<div className="mt-12 border-t border-gray-800/50 pt-8 text-center text-sm text-muted">
					<p>© {new Date().getFullYear()} Amikee Tech Private Ltd. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
