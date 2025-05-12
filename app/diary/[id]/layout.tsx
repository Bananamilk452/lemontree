import DefaultLayout from "~/layouts/default";

export default function DiaryIdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
