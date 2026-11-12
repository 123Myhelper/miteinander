import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const [, prefix] = request.nextUrl.pathname.split("/");
  requestHeaders.set(
    "x-myhelper-page-locale",
    prefix === "en" || prefix === "fr" ? prefix : "de",
  );

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|.*\\.[^/]+$).*)",
};
