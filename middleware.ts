import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!process.env.AUTH_SECRET) {
    console.warn("[middleware] AUTH_SECRET tidak diset — menggunakan fallback development secret");
  }
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || "gacoan_secret_key_2026",
  });

  // Jika sudah login dan mencoba akses /login -> redirect ke dashboard sesuai role
  if (pathname === "/login" && token) {
    const role = token.role as string;
    if (role === "admin") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "kasir") return NextResponse.redirect(new URL("/kasir", req.url));
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Proteksi route /kasir (hanya Kasir & Admin)
  if (pathname.startsWith("/kasir")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const role = token.role as string;
    if (role !== "kasir" && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Proteksi route /admin (hanya Admin)
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const role = token.role as string;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/kasir", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/kasir/:path*", "/admin/:path*"],
};
