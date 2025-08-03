import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

import type { auth } from "~/lib/auth";

type Session = typeof auth.$Infer.Session;

const AUTH_PAGES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const res = await ky.get<Session | null>(
    "http://localhost:3000/api/auth/get-session",
    {
      retry: 0,
      headers: {
        cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
    },
  );

  const session = await res.json();

  if (!session) {
    // 같은 페이지로 리디렉션되는 경우를 방지
    if (AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page))) {
      return NextResponse.next();
    }

    // 아니면 로그인 페이지로 리디렉션
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 로그인된 상태에서 로그인 페이지에 접근하는 경우
  else if (
    session &&
    AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page))
  ) {
    // 홈 페이지로 리디렉션
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
