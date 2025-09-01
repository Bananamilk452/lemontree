import DefaultLayout from "~/layouts/default";

export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
