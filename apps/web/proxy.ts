import { NextResponse, type NextRequest } from "next/server";
import { getBackendAddress } from "@/app/actions";
import { auth } from "./auth";
import { isBlogRoute } from "./lib/blog-feature";
import { COURSE_VIEWER_CURRENT_URL_HEADER } from "./lib/course-viewer-session-params";

export async function proxy(request: NextRequest) {
  const requestHeaders = request.headers;
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (!forwardedProto && request.nextUrl.protocol) {
    requestHeaders.set(
      "x-forwarded-proto",
      request.nextUrl.protocol.replace(":", ""),
    );
  }

  // Inbound email is addressed to a shared reply domain. Its tenant is
  // resolved from the opaque reply token, not the request host.
  if (request.nextUrl.pathname.startsWith("/api/inbound-email/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/course/")) {
    requestHeaders.set(
      COURSE_VIEWER_CURRENT_URL_HEADER,
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
  }

  const backend = await getBackendAddress(requestHeaders);

  if (request.nextUrl.pathname === "/healthy") {
    return Response.json({ success: true });
  }

  try {
    const response = await fetch(`${backend}/verify-domain`);

    if (!response.ok) {
      throw new Error();
    }

    const resp = await response.json();

    if (resp.blogEnabled === false && isBlogRoute(request.nextUrl.pathname)) {
      return new NextResponse(
        '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="robots" content="noindex"><title>ページが見つかりません</title><body style="font:16px/1.9 sans-serif;padding:40px;max-width:640px;margin:auto"><h1 style="font-size:24px">このページはご利用いただけません</h1><p>ブログ機能はOFFになっています。</p><a href="/">トップページへ</a></body></html>',
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    requestHeaders.set("domain", resp.domain);
    requestHeaders.set("domainId", resp.domainId);
    requestHeaders.set("domainEmail", resp.domainEmail);
    // Headers require byte-safe values; preserve Unicode titles via percent encoding.
    requestHeaders.set(
      "domainTitle",
      encodeURIComponent(resp.domainTitle || ""),
    );
    requestHeaders.set(
      "hideCourseLitBranding",
      resp.hideCourseLitBranding || false,
    );
    if (resp.ssoTrustedDomain) {
      requestHeaders.set("ssoTrustedDomain", resp.ssoTrustedDomain);
    }

    if (request.nextUrl.pathname === "/favicon.ico") {
      try {
        if (resp.logo) {
          const response = await fetch(resp.logo);
          if (response.ok) {
            const blob = await response.blob();
            return new NextResponse(blob, {
              headers: {
                "content-type": "image/webp",
              },
            });
          } else {
            return NextResponse.rewrite(
              new URL(`/default-favicon.ico`, request.url),
            );
          }
        } else {
          return NextResponse.rewrite(
            new URL(`/default-favicon.ico`, request.url),
          );
        }
      } catch (err) {
        return NextResponse.rewrite(
          new URL(`/default-favicon.ico`, request.url),
        );
      }
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const session = await auth.api.getSession({
        headers: requestHeaders,
      });
      if (!session) {
        return NextResponse.redirect(
          new URL(
            `/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`,
            request.url,
          ),
        );
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: err.message },
      { status: 404 },
    );
  }
}

export const config = {
  matcher: [
    "/",
    "/favicon.ico",
    "/api/:path*",
    "/healthy",
    "/contact",
    "/course/:path*",
    "/blog/:path*",
    "/post/:path*",
    "/p/:path*",
    "/dashboard/:path*",
  ],
};
