import { useDocumentProcessingStatus } from "@/lib/swr/use-document";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ProcessStatusBar({
  documentVersionId,
  className,
}: {
  documentVersionId: string;
  className?: string;
}) {
  const { status, loading, error } =
    useDocumentProcessingStatus(documentVersionId);

  const [progress, setProgress] = useState<number>(0);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (status) {
      const progress = (status.currentPageCount / status.totalPages) * 100;
      setProgress(progress);
      if (progress === 100) {
        setText("Processing complete");
      } else {
        setText(
          `${status.currentPageCount} / ${status.totalPages} pages processed`
        );
      }
    }
  }, [status]);

  if (loading) {
    return (
      <Progress
        value={0}
        text="Processing document..."
        className={cn(
          "w-full rounded-none text-[8px] font-semibold",
          className,
        )}
      />
    );
  }

  if (error && error.status === 404) {
    return (
      <Progress
        value={0}
        text={error.message}
        className={cn(
          "w-full rounded-none text-[8px] font-semibold",
          className,
        )}
      />
    );
  }

  return (
    <Progress
      value={progress}
      text={text}
      className={cn("w-full rounded-none text-[8px] font-semibold", className)}
    />
  );
}
