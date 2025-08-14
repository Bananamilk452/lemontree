import { cn } from "~/utils";

export function MainContainer({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn("p-6", className)} {...props}>
      {children}
    </main>
  );
}
