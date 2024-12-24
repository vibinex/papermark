import { client } from "@/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";

type NotificationPayload = {
	dataroomId: string;
	message: string;
};

export const sendDataroomNotificationTask = task({
	id: "send-dataroom-notification",
	retry: { maxAttempts: 3 },
	queue: {
		concurrencyLimit: 5,
	},
	run: async (payload: NotificationPayload) => {
		const { dataroomId, message } = payload;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/send-dataroom-notifications`,
			{
				method: "POST",
				body: JSON.stringify({ dataroomId, message }),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
				},
			}
		);

		if (!response.ok) {
			logger.error("Failed to send dataroom notification", { dataroomId, message });
			return;
		}

		const { message: responseMessage } = await response.json();
		logger.info("Dataroom notification sent", { dataroomId, message: responseMessage });
	},
});
