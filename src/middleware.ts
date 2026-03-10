import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        // Protect all routes except these specific ones
        "/((?!onboarding|login|register|api/auth|api/onboarding|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|icons).*)",
    ],
};
