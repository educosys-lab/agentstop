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

export const template_2 = (data: TemplateDataType) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume Template 2</title>
    <style>
      * {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-size: 12pt;
        color: #000000;
        padding: 1in;
        width: 8.5in; /* Letter size for ATS compatibility */
        background-color: #ffffff;
      }
      h1 {
        font-size: 20pt;
        font-weight: bold;
        margin-bottom: 8pt;
      }
      h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 12pt;
        margin-bottom: 6pt;
        border-bottom: 1px solid #000000;
      }
      h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 8pt;
        margin-bottom: 4pt;
      }
      p {
        margin-bottom: 4pt;
        line-height: 1.5;
      }
      .section {
        margin-bottom: 12pt;
      }
      .contact-item {
        margin-bottom: 4pt;
      }
      .achievement {
        margin-left: 20pt;
        margin-bottom: 2pt;
      }
      @media print {
        body {
          margin: 0;
          padding: 1in;
          width: 8.5in;
          height: 11in;
        }
        @page {
          size: Letter;
          margin: 0;
        }
      }
    </style>
  </head>
  <body>
    <h1>${data.name}</h1>
    <p>${data.title}</p>
    <div class="section">
      <h2>Contact Information</h2>
      <p class="contact-item">Mobile: ${data.mobile}</p>
      <p class="contact-item">Email: ${data.email}</p>
      <p class="contact-item">Address: ${data.address}</p>
      <p class="contact-item">Website: ${data.website}</p>
      <p class="contact-item">LinkedIn: ${data.linkedin}</p>
    </div>
    <div class="section">
      <h2>Summary</h2>
      <p>${data.summary}</p>
    </div>
    <div class="section">
      <h2>Education</h2>
      ${data.educations
			.map(
				(education) => `
          <div>
            <h3>${education.degree}</h3>
            <p>${education.institution}</p>
            <p>${education.date}</p>
          </div>
        `,
			)
			.join('')}
    </div>
    <div class="section">
      <h2>Experience</h2>
      ${data.experiences
			.map(
				(experience) => `
          <div>
            <h3>${experience.title}</h3>
            <p>${experience.company} | ${experience.date}</p>
            ${experience.achievements.map((achievement) => `<p class="achievement">- ${achievement}</p>`).join('')}
          </div>
        `,
			)
			.join('')}
    </div>
    <div class="section">
      <h2>Skills</h2>
      ${data.skills.map((skill) => `<p>${skill.category}: ${skill.skills}</p>`).join('')}
    </div>
    <div class="section">
      <h2>Languages</h2>
      <p>${data.languages}</p>
    </div>
  </body>
</html>
`;
