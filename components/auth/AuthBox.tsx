import { cn } from "~/utils";

export function AuthBox({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex w-96 flex-col gap-4 rounded-xl bg-white p-8 shadow-lg max-w-[calc(100dvw-24px)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AuthBoxTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h1"> & { children: React.ReactNode }) {
  return (
    <h1 className={cn("text-lg font-bold", className)} {...props}>
      {children}
    </h1>
  );
}

export function AuthBoxDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"p"> & { children: React.ReactNode }) {
  return (
    <p className={cn("text-sm text-gray-600", className)} {...props}>
      {children}
    </p>
  );
}
