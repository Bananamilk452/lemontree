import { Skeleton } from "../ui/skeleton";

interface ChatMessageProps {
  message: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return <div className="rounded-lg border p-3 text-sm">{message}</div>;
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
