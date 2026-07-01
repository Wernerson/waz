import { convexAuthNextjsMiddleware, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  const pathname = request.nextUrl.pathname;
  const protectedPaths = new Set(["/", "/leads", "/issues"]);

  if (!isAuthenticated && protectedPaths.has(pathname)) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  if (isAuthenticated && pathname === "/login") {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: ["/", "/leads", "/issues", "/login", "/api/auth/:path*"],
};
