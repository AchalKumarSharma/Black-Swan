import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const location = response.headers.get("location");
  if (location && location.includes("/login")) {
    const url = new URL(location, request.url);
    if (!url.searchParams.has("mode")) {
      url.searchParams.set("mode", "signin");
      return NextResponse.redirect(url, { headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: ["/workspace", "/workspace/:path*"],
};
