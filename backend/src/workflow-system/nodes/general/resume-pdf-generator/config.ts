import { NodeAiGeneratePropsType, NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { templateOptions } from './resume-pdf-generator.data';

export const resumePdfGeneratorConfig: NodeConfigType[] = [
	{
		name: 'template_type',
		label: 'Resume Template',
		description: 'Select the resume template to use for PDF generation.',
		type: 'select',
		placeholder: 'Select template',
		defaultValue: 'template_1',
		options: templateOptions,
		validation: [
			{
				field: 'template_type',
				label: 'Template type',
				type: 'string',
				required: true,
				validValues: templateOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'image',
		label: 'Image',
		description: 'Preview of the selected template.',
		type: 'image',
		src: [
			{
				value: templateOptions[0].preview,
				showWhen: { field: 'template_type', value: templateOptions[0].value },
			},
			{
				value: templateOptions[1].preview,
				showWhen: { field: 'template_type', value: templateOptions[1].value },
			},
			{
				value: templateOptions[2].preview,
				showWhen: { field: 'template_type', value: templateOptions[2].value },
			},
		],
	},
];

export const resumePdfGeneratorAiGenerateProps: NodeAiGeneratePropsType = {
	image_ifAny: 'str',
	name: 'str',
	title: 'str',
	summary: 'str',
	mobile: 'str',
	email: 'str',
	address: 'str',
	website_ifAny: 'str',
	linkedin_ifAny: 'str',
	educations: 'str',
	experiences: 'str',
	skills: 'str',
	languages: 'str',
};

export const resumePdfGeneratorAiPrompt = `VERY IMPORTANT:
Return a plain JSON string containing resume details based solely on user-provided values. The output must be a valid JSON object (e.g., {"key": "value"}) with NO wrapping tags like <function>, NO function calls, NO tool calls, NO code blocks (e.g., \`\`\`json), NO markdown, NO extra text, comments, or explanations. The output must be parseable by JSON.parse() and match the provided schema exactly.
Schema-specific rules:
- All fields are strings. Fields marked '_ifAny' (image_ifAny, website_ifAny, linkedin_ifAny) are optional and must be "_" if not provided.
- 'email' must be a valid email address if provided, otherwise "_".
- 'educations' is a JSON-stringified array of objects, each with 'degree' (string), 'institution' (string), and 'date' (string, e.g., "2020-2023"). If no education is provided, return "[{\"degree\": \"_\", \"institution\": \"_\", \"date\": \"_\"}]".
- 'experiences' is a JSON-stringified array of objects, each with 'title' (string), 'company' (string), 'date' (string), and 'achievements' (array of strings). If no experience is provided or only partial data is given, return "[{\"title\": \"_\", \"company\": \"_\", \"date\": \"_\", \"achievements\": [\"_\"]}]" or include only the provided entries with "_" for missing fields within each object.
- 'skills' is a JSON-stringified array of objects, each with 'category' (string) and 'skills' (comma-separated string). If no skills are provided, return "[{\"category\": \"_\", \"skills\": \"_\"}]".
- 'languages' is a comma-separated string of language names (e.g., "English, Spanish"). If no languages are provided, return "_".
- Use only values explicitly provided by the user. Do NOT invent, guess, or add placeholder data beyond "_" as specified.
- If user input includes an instruction like "just use these things only and generate the resume let other things be empty," set all unprovided fields to "_" as described above, rather than empty strings or arrays.
- Do NOT include warnings or logs in the output; handle them internally.
- Do NOT use formatting characters like *, #, [], or extra whitespace in string values.
- Ensure all string values are properly escaped (e.g., quotes within strings as \").
Example valid output with full data (no "let other things be empty" instruction):
{
  "image_ifAny": "",
  "name": "John Doe",
  "title": "Software Engineer",
  "summary": "Experienced software engineer with 5 years of expertise in full-stack development, specializing in JavaScript and Python.",
  "mobile": "+1-555-123-4567",
  "email": "john.doe@example.com",
  "address": "123 Main Street, San Francisco, CA 94105",
  "website_ifAny": "https://johndoe.com",
  "linkedin_ifAny": "https://linkedin.com/in/johndoe",
  "educations": "[{\"degree\": \"Bachelor of Science in Computer Science\", \"institution\": \"Stanford University\", \"date\": \"2015-2019\"}]",
  "experiences": "[{\"title\": \"Senior Software Engineer\", \"company\": \"TechCorp\", \"date\": \"2020-Present\", \"achievements\": [\"Led development of a scalable web application, increasing user retention by 30.\", \"Optimized backend services, reducing latency by 25.\"]}, {\"title\": \"Junior Software Engineer\", \"company\": \"StartUp Inc.\", \"date\": \"2019-2020\", \"achievements\": [\"Developed RESTful APIs for mobile applications.\", \"Collaborated on agile teams to deliver features on tight deadlines.\"]}]",
  "skills": "[{\"category\": \"Programming Languages\", \"skills\": \"JavaScript, Python, Java\"}, {\"category\": \"Frameworks\", \"skills\": \"React, Node.js, Django\"}]",
  "languages": "English, Spanish"
}
Example valid output with partial data and "let other things be empty" (some fields missing, triggering completeness rule):
{
  "image_ifAny": "_",
  "name": "_",
  "title": "_",
  "summary": "_",
  "mobile": "_",
  "email": "_",
  "address": "_",
  "website_ifAny": "_",
  "linkedin_ifAny": "_",
  "educations": "[{\"degree\": \"_\", \"institution\": \"_\", \"date\": \"_\"}]",
  "experiences": "[{\"title\": \"_\", \"company\": \"_\", \"date\": \"_\", \"achievements\": [\"_\"]}]",
  "skills": "[{\"category\": \"_\", \"skills\": \"_\"}]",
  "languages": "_"
}
`;
