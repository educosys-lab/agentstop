import { URLS } from '@/constants/url.constant';

import { LinkElement } from '@/components/elements/LinkElement';
import { ImageElement } from '@/components/elements/ImageElement';

export default function GoogleAuthDocs() {
	return (
		<div className="w-full">
			<h1 className="text-center">Google Auth</h1>
			<p className="mt-2 text-center">Follow the steps below to get access token and refresh token from Google</p>

			<div className="my-10 h-px w-full bg-muted-dark" />

			<p className="font-medium">----- Step 1 -----</p>
			<p className="mt-1.5">
				Click the Google OAuth link -{' '}
				<LinkElement
					href={URLS.GOOGLE_OAUTH}
					target="_blank"
					title="Google OAuth"
					className="font-semibold text-primary"
				>
					Google OAuth
				</LinkElement>
			</p>

			<p className="mt-16 font-medium">----- Step 2 -----</p>
			<p className="mt-1.5">Click the "Authorize APIs" button.</p>
			<ImageElement src={`${URLS.IMAGES}/google-auth/1.webp`} alt="Authorize API" className="mt-2 rounded-lg" />

			<p className="mt-5">We take the following permissions from Google</p>
			<ol className="list-disc pl-5">
				<li>userinfo.email - To get the email of the user</li>
				<li>userinfo.profile - To get profile information like name, picture, etc. of the user</li>
				<li>calendar.events - To read/write calender events in the user's calendar</li>
				<li>gmail.modify - To read/write emails in the user's gmail</li>
				<li>
					drive - To read/write files in the user's drive. This includes Google Docs, Sheets, Slides, etc.
				</li>
				<li>script.deployments - To deploy Google Apps Script projects</li>
				<li>script.projects - To deploy Google Apps Script projects</li>
			</ol>

			<p className="mt-5">----- NOTE -----</p>
			<p className="mt-1.5">
				We don't check any data that user has not given us permission to access. All your sensitive data is
				encrypted and stored safely. You can revoke access at any time from your Google Account settings, or
				delete the saved tokens and all the data associated with it from our app as well. Any sensitive data is
				deleted from our servers on deletion of the account.
			</p>

			<p className="mt-16 font-medium">----- Step 3 -----</p>
			<p className="mt-1.5">Login to your Google Account or select the account you want to use.</p>
			<div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
				<ImageElement
					src={`${URLS.IMAGES}/google-auth/2B.webp`}
					alt="Login to your Google Account"
					className="mt-2 rounded-lg"
				/>
				<ImageElement
					src={`${URLS.IMAGES}/google-auth/2A.webp`}
					alt="Select the Google account"
					className="mt-2 rounded-lg"
				/>
			</div>

			<p className="mt-16 font-medium">----- Step 4 -----</p>
			<p className="mt-1.5">Continue to the next step.</p>
			<ImageElement src={`${URLS.IMAGES}/google-auth/3.webp`} alt="Continue" className="mt-2 rounded-lg" />

			<p className="mt-16 font-medium">----- Step 5 -----</p>
			<p className="mt-1.5">
				Select all the permissions that are required. You can also review the permissions that are required.
			</p>
			<div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
				<ImageElement
					src={`${URLS.IMAGES}/google-auth/4.webp`}
					alt="Select all the permissions"
					className="mt-2 rounded-lg"
				/>
				<ImageElement
					src={`${URLS.IMAGES}/google-auth/5.webp`}
					alt="Review the permissions"
					className="mt-2 rounded-lg"
				/>
			</div>

			<p className="mt-16 font-medium">----- Step 6 -----</p>
			<p className="mt-1.5">Continue to the next step.</p>
			<ImageElement src={`${URLS.IMAGES}/google-auth/6.webp`} alt="Continue" className="mt-2 rounded-lg" />

			<p className="mt-16 font-medium">----- Step 7 -----</p>
			<p className="mt-1.5">
				You'll be redirected to the Google OAuth page. There is no need to change any settings or
				configurations. Click on "Exchange authorization code for tokens" button.
			</p>
			<ImageElement
				src={`${URLS.IMAGES}/google-auth/7.webp`}
				alt="Exchange authorization code for tokens"
				className="mt-2 rounded-lg"
			/>

			<p className="mt-16 font-medium">----- Step 8 -----</p>
			<p className="mt-1.5">
				You will automatically be forwarded to the 3rd step. Click on the Step 2 tab to continue.
			</p>
			<ImageElement
				src={`${URLS.IMAGES}/google-auth/8.webp`}
				alt="Click on the Step 2 tab"
				className="mt-2 rounded-lg"
			/>

			<p className="mt-16 font-medium">----- Step 9 -----</p>
			<p className="mt-1.5">
				Copy the access token and refresh token and paste it in the corresponding fields in the app.
			</p>
			<ImageElement
				src={`${URLS.IMAGES}/google-auth/9.webp`}
				alt="Copy the access token and refresh token"
				className="mt-2 rounded-lg"
			/>
		</div>
	);
}
