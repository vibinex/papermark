import { client } from "@/trigger";
import { logger, task } from "@trigger.dev/sdk/v3";

type NotificationPayload = {
	userId: string;
	message: string;
};

export const sendNotificationTask = task({
	id: "send-notification",
	retry: { maxAttempts: 3 },
	queue: {
		concurrencyLimit: 5,
	},
	run: async (payload: NotificationPayload) => {
		const { userId, message } = payload;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/jobs/send-notification`,
			{
				method: "POST",
				body: JSON.stringify({ userId, message }),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
				},
			}
		);

		if (!response.ok) {
			logger.error("Failed to send notification", { payload });
			return;
		}

		const { message: responseMessage } = await response.json();
		logger.info("Notification sent", { userId, message: responseMessage });
	},
});
