import DefaultLayout from "~/layouts/default";

export default function ListPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
