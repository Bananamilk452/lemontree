import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
