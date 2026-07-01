import { convexAuthNextjsMiddleware, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  const pathname = request.nextUrl.pathname;

  if (!isAuthenticated && pathname === "/") {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  if (isAuthenticated && pathname === "/login") {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: ["/", "/login", "/api/auth/:path*"],
};
