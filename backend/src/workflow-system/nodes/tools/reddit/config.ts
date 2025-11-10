import { NodeConfigType, NodeAiGeneratePropsType } from 'src/workflow-system/workflow-system.type';

export const redditToolConfig: NodeConfigType[] = [];

export const redditToolAiGenerateProps: NodeAiGeneratePropsType = {
	query: 'str',
};

export const redditToolAiPrompt = `VERY IMPORTANT:
Schema-specific rules:
- Use only values mentioned by the user. Never invent or guess data.
- Do not include formatting characters like *, #, or [] in values.
- 'query' must be a non-empty string representing the search term (e.g., "ai").
`;
