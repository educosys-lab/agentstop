type TemplateDataType = {
	image: string;
	name: string;
	title: string;
	summary: string;
	mobile: string;
	email: string;
	address: string;
	website: string;
	linkedin: string;
	educations: {
		degree: string;
		institution: string;
		date: string;
	}[];
	experiences: {
		title: string;
		company: string;
		date: string;
		achievements: string[];
	}[];
	skills: {
		category: string;
		skills: string;
	}[];
	languages: string;
};

export const template_1 = (data: TemplateDataType) => `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Resume Template 1</title>
        <style>
            * {
				font-family: 'Poppins', sans-serif;
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			body {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 14px;
				color: #2e2e2e;
				min-height: 100vh;
				padding: 20px;
				background-color: #f5f5f7;
			}
			.head {
				font-size: 45px;
				font-weight: 600;
				line-height: 52px;
			}
			.subHead {
				font-size: 22px;
				font-weight: 500;
				margin-top: 2px;
			}
			.section-title {
				font-size: 18px;
				font-weight: 500;
			}
			.tag {
				font-size: 15px;
				font-weight: 500;
			}
			.big {
				font-size: 16px;
				font-weight: 500;
			}
			.flex-between {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.top-gap {
				margin-top: 5px;
			}
			.top-small-gap {
				margin-top: 2px;
			}
			.resume {
				display: flex;
				width: 210mm; /* A4 width */
				height: 297mm; /* A4 height */
				background-color: #ffffff;
			}
			.left-section {
				color: #ffffff;
				width: 35%;
				height: 100%;
				padding: 30px 40px;
				background-color: #2c323e;
			}
			.profile-img {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 150px;
				height: 150px;
				margin: 20px auto 50px auto;
				overflow: hidden;
				border-radius: 100%;
				background-color: #ffffff;
			}
			.profile-img img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				object-position: top;
			}
			.section-title::after {
				content: '';
				display: block;
				width: 50px;
				height: 2px;
				border-radius: 100px;
				margin-top: 12px;
			}
			.left-section .section-title::after {
				background-color: #ffffff;
			}
			.right-section .section-title::after {
				background-color: #2e2e2e;
			}
			.right-section {
				padding: 50px 45px;
				width: 65%;
				height: 100%;
			}
			.section {
				margin-top: 30px;
			}
			.section-content {
				margin-top: 18px;
			}
			.section-content:not(.no-gap) > div {
				margin-top: 10px;
			}
			.section-content:is(.big-gap) > div:nth-of-type(n + 2) {
				margin-top: 15px;
			}
			html {
				-webkit-print-color-adjust: exact;
			}
			/* Print specific styles */
			@media print {
				body {
					margin: 0;
					padding: 0;
					background: white;
				}
				.resume {
					width: 210mm;
					height: 297mm;
					margin: 0;
					padding: 0;
				}
				@page {
					size: A4;
					margin: 0;
				}
			}
        </style>
    </head>
    <body>
        <div class="resume">
            <div class="left-section">
                <div class="profile-img">
                    <img src="${data.image}" />
                </div>
                <div class="section">
                    <h3 class="section-title">Contact</h3>
                    <div class="section-content">
                        <div>
                            <p class="tag">Mobile</p>
                            <p>${data.mobile}</p>
                        </div>
                        <div>
                            <p class="tag">Email</p>
                            <p>${data.email}</p>
                        </div>
                        <div>
                            <p class="tag">Address</p>
                            <p>${data.address}</p>
                        </div>
                        <div>
                            <p class="tag">Website</p>
                            <p>${data.website}</p>
                        </div>
                        <div>
                            <p class="tag">LinkedIn</p>
                            <p>${data.linkedin}</p>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h3 class="section-title">Education</h3>
                    ${data.educations
						.map(
							(education) => `
                            <div class="section-content">
                                <p class="tag">${education.degree}</p>
                                <p>${education.institution}</p>
                                <p>${education.date}</p>
                            </div>`,
						)
						.join('')}
                </div>
                <div class="section">
                    <h3 class="section-title">Languages</h3>
                    <div class="section-content">
                        <p>${data.languages}</p>
                    </div>
                </div>
            </div>
            <div class="right-section">
                <h1 class="head">
                    ${data.name.split(' ')[0]} <br />
                    ${data.name.split(' ').slice(1).join(' ')}
                </h1>
                <h2 class="subHead">${data.title}</h2>
                <div class="section">
                    <h3 class="section-title">Overview</h3>
                    <div class="section-content">
                        <p>${data.summary}</p>
                    </div>
                </div>
                <div class="section">
                    <h3 class="section-title">Experience</h3>
                    <div class="section-content big-gap">
                        ${data.experiences
							.map(
								(experience) => `
                                <div>
                                    <p class="big">${experience.title}</p>
                                    <div class="flex-between">
                                        <p class="tag">${experience.company}</p>
                                        <p class="tag">${experience.date}</p>
                                    </div>
                                    ${experience.achievements
										.map(
											(achievement, index) =>
												`<p class="${index === 0 ? 'top-gap' : 'top-small-gap'}">
                                                    ${achievement}
                                                </p>`,
										)
										.join('')}
                                </div>`,
							)
							.join('')}
                    </div>
                </div>
                <div class="section">
                    <h3 class="section-title">Skills</h3>
                    <div class="section-content no-gap">
                        ${data.skills
							.map(
								(skill) => `
                                <div>
                                    <span class="tag">${skill.category}: </span>
                                    <span>${skill.skills}</span>
                                </div>`,
							)
							.join('')}
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
