import { UserType } from 'src/user/user.type';
import { WorkflowType } from 'src/workflow/workflow.type';
import { InteractType, PublicInteractType, omittedInteractFields } from './interact.type';
import { DefaultReturnType } from 'src/shared/types/return.type';

export function getPublicInteractData(props: {
	userId: string;
	interact: InteractType;
	workflow: WorkflowType;
	interactUsers: UserType[];
}): DefaultReturnType<PublicInteractType> {
	const { userId, interact, workflow, interactUsers } = props;

	const updatedInteract: Record<string, any> = { ...interact };

	const updatedMembers: PublicInteractType['members'] = [];
	const userMessages: PublicInteractType['messages'] = [];

	let error: DefaultReturnType<any> | null = null;

	for (const member of interact.members) {
		const selectedUser = interactUsers.find((user) => user.id === member.userId);
		if (!selectedUser) {
			error = {
				userMessage: 'Member data not found!',
				error: 'Member data not found!',
				errorType: 'InternalServerErrorException',
				errorData: { workflowId: interact.workflowId },
				trace: ['getPublicInteractData - interact.members.forEach'],
			};
			break;
		}

		updatedMembers.push({
			name: `${selectedUser.firstName} ${selectedUser.lastName}`,
			username: selectedUser.username,
			image: selectedUser.image,
		});
	}

	if (error) return error;

	const userJoinTime = userId ? interact.members.find((member) => member.userId === userId)?.joinTime : undefined;

	if (userId && !userJoinTime) {
		return {
			userMessage: 'User not found in chat members!',
			error: 'User not found in chat members!',
			errorType: 'InternalServerErrorException',
			errorData: { workflowId: interact.workflowId },
			trace: ['getPublicInteractData - if (userId && !userJoinTime)'],
		};
	}

	let filteredMessages: InteractType['messages'] = [];
	if (userJoinTime) {
		filteredMessages = interact.messages.filter((message) => message.createTime > userJoinTime);
	} else {
		filteredMessages = interact.messages;
	}

	for (const message of filteredMessages) {
		if (message.senderId === 'system') {
			userMessages.push({
				id: message.id,
				createTime: message.createTime,
				name: 'System',
				username: 'system',
				content: message.content,
				format: message.format,
			});
			continue;
		}

		const selectedUser = interactUsers.find((user) => user.id === message.senderId);
		if (!selectedUser) {
			return {
				userMessage: 'User of message not found!',
				error: 'User of message not found!',
				errorType: 'InternalServerErrorException',
				errorData: { workflowId: interact.workflowId },
				trace: ['getPublicInteractData - interactUsers.find'],
			};
		}

		userMessages.push({
			id: message.id,
			createTime: message.createTime,
			name: `${selectedUser.firstName} ${selectedUser.lastName}`,
			username: selectedUser.username,
			content: message.content,
			format: message.format,
		});
	}

	omittedInteractFields.forEach((field) => delete updatedInteract[field]);
	delete updatedInteract.messages;

	updatedInteract.members = updatedMembers;
	updatedInteract.messages = userMessages;
	updatedInteract.workflowTitle = workflow.title;
	updatedInteract.status = workflow.status;

	return updatedInteract as PublicInteractType;
}
