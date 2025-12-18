import { Skeleton } from "../ui/skeleton";

interface ChatMessageProps {
  message: string;
}

export function ChatAgentMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-4/5 rounded-lg border p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {message}
      </div>
    </div>
  );
}

export function ChatUserMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex w-full justify-end">
      <div className="max-w-4/5 rounded-lg border p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {message}
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
