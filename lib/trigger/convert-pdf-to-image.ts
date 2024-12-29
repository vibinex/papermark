import { client } from "@/trigger";
import { logger, retry, task } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { getFile } from "@/lib/files/get-file";

type ConvertPayload = {
	documentVersionId: string;
	versionNumber?: number;
	teamId: string;
	documentId: string;
};

export const convertPdfToImageTask = task({
	id: "convert-pdf-to-image",
	retry: { maxAttempts: 3 },
	queue: {
		concurrencyLimit: 10,
	},
	run: async (payload: ConvertPayload) => {
		const { documentVersionId, teamId, documentId, versionNumber } = payload;

		// 1. get file url from document version
		const documentVersion = await prisma.documentVersion.findUnique({
			where: { id: documentVersionId },
			select: { file: true, storageType: true, numPages: true },
		});

		if (!documentVersion) {
			logger.error("File not found", { payload });
			return;
		}

		// 2. get signed url from file
		const signedUrl = await getFile({
			type: documentVersion.storageType,
			data: documentVersion.file,
		});

		if (!signedUrl) {
			logger.error("Failed to get signed url", { payload });
			return;
		}

		let numPages = documentVersion.numPages;

		// skip if the numPages are already defined
		if (!numPages || numPages === 1) {
			// 3. send file to api/convert endpoint in a task and get back number of pages
			const response = await retry.fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/mupdf/get-pages`,
				{
					method: "POST",
					body: JSON.stringify({ url: signedUrl }),
					headers: { "Content-Type": "application/json" },
				}
			);

			if (!response.ok) {
				logger.error("Failed to get number of pages", { signedUrl, response });
				return;
			}

			const { numPages: fetchedNumPages } = (await response.json()) as { numPages: number };
			numPages = fetchedNumPages;
		}

		// 4. iterate through pages and upload to blob in a task
		for (let i = 0; i < numPages; ++i) {
			const currentPage = i + 1;
			const response = await retry.fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/api/mupdf/convert-page`,
				{
					method: "POST",
					body: JSON.stringify({
						documentVersionId,
						pageNumber: currentPage,
						url: signedUrl,
						teamId,
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
					},
				}
			);

			if (!response.ok) {
				logger.error("Failed to convert page", { currentPage });
				return;
			}

			const { documentPageId } = (await response.json()) as {
				documentPageId: string;
			};
			logger.info(`Created document page for page ${currentPage}`, {
				documentPageId,
				payload,
			});
		}

		await prisma.documentVersion.update({
			where: { id: documentVersionId },
			data: { numPages, hasPages: true, isPrimary: true },
		});

		if (versionNumber) {
			await prisma.documentVersion.updateMany({
				where: {
					documentId: documentId,
					versionNumber: {
						not: versionNumber,
					},
				},
				data: {
					isPrimary: false,
				},
			});
		}

		await fetch(
			`${process.env.NEXTAUTH_URL}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}&documentId=${documentId}`
		);

		logger.info("Processing complete", { documentId, documentVersionId, teamId });
	},
});