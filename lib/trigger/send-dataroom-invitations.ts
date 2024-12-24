import { client } from "@/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";

type InvitationPayload = {
	dataroomId: string;
	userIds: string[];
};

export const sendDataroomInvitationsTask = task({
	id: "send-dataroom-invitations",
	retry: { maxAttempts: 3 },
	queue: {
		concurrencyLimit: 5,
	},
	run: async (payload: InvitationPayload) => {
		const { dataroomId, userIds } = payload;

		for (const userId of userIds) {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/send-dataroom-view-invitation`,
				{
					method: "POST",
					body: JSON.stringify({ dataroomId, userId }),
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
					},
				}
			);

			if (!response.ok) {
				logger.error("Failed to send invitation", { dataroomId, userId });
				return;
			}

			const { message } = await response.json();
			logger.info("Invitation sent", { dataroomId, userId, message });
		}
	},
});
