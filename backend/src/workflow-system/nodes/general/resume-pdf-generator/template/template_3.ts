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

export const template_3 = (data: TemplateDataType) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume Template 3</title>
    <style>
      * {
        font-family: 'Times New Roman', serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-size: 11pt;
        color: #000000;
        padding: 1in;
        width: 8.5in;
        background-color: #ffffff;
        line-height: 1.2;
      }

      .header {
        text-align: left;
        margin-bottom: 20pt;
      }

      .name {
        font-size: 28pt;
        font-weight: bold;
        margin-bottom: 4pt;
        color: #000000;
      }

      .contact-info {
        font-size: 11pt;
        margin-bottom: 2pt;
      }

      .section-title {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 16pt;
        margin-bottom: 8pt;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid #000000;
        padding-bottom: 2pt;
      }

      .company-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 2pt;
      }

      .company-name {
        font-size: 11pt;
        font-weight: bold;
      }

      .date-location {
        font-size: 11pt;
        font-weight: bold;
        text-align: right;
      }

      .job-title {
        font-size: 11pt;
        font-style: italic;
        margin-bottom: 4pt;
      }

      .achievement {
        margin-left: 16pt;
        margin-bottom: 4pt;
        position: relative;
      }

      .achievement::before {
        content: "•";
        position: absolute;
        left: -12pt;
        font-weight: bold;
      }

      .education-item {
        margin-bottom: 12pt;
      }

      .education-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }

      .degree {
        font-size: 11pt;
        font-weight: bold;
      }

      .education-date {
        font-size: 11pt;
        font-weight: bold;
      }

      .institution {
        font-size: 11pt;
        margin-bottom: 2pt;
      }

      .education-details {
        margin-left: 16pt;
      }

      .education-details::before {
        content: "•";
        position: absolute;
        left: -12pt;
        font-weight: bold;
      }

      .other-section {
        margin-bottom: 8pt;
      }

      .other-item {
        margin-bottom: 4pt;
      }

      .other-item::before {
        content: "•";
        margin-right: 8pt;
        font-weight: bold;
      }

      .experience-item {
        margin-bottom: 16pt;
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
    <div class="header">
      <div class="name">${data.name}</div>
      <div class="contact-info">${data.email} | ${data.mobile} | ${data.address}</div>
    </div>

    <div class="section">
      <div class="section-title">EXPERIENCE</div>
      ${data.experiences
			.map(
				(experience) => `
            <div class="experience-item">
              <div class="company-header">
                <div class="company-name">${experience.company}</div>
                <div class="date-location">${experience.date}</div>
              </div>
              <div class="job-title">${experience.title}</div>
              ${experience.achievements.map((achievement) => `<div class="achievement">${achievement}</div>`).join('')}
            </div>
          `,
			)
			.join('')}
    </div>

    <div class="section">
      <div class="section-title">EDUCATION</div>
      ${data.educations
			.map(
				(education) => `
            <div class="education-item">
              <div class="education-header">
                <div class="degree">${education.institution}</div>
                <div class="education-date">${education.date}</div>
              </div>
              <div class="institution">${education.degree}</div>
            </div>
          `,
			)
			.join('')}
    </div>

    <div class="section">
      <div class="section-title">OTHER</div>
      ${data.skills.map((skill) => `<div class="other-item"><strong>${skill.category}:</strong> ${skill.skills}</div>`).join('')}
      <div class="other-item"><strong>Languages:</strong> ${data.languages}</div>
    </div>
  </body>
</html>
`;
