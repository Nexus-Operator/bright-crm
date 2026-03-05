import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCode } from "@/lib/dialpad";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=missing_params", request.url)
      );
    }

    const userId = state;

    // Exchange code for tokens
    const tokens = await exchangeCode(code);

    // Upsert Integration record
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "dialpad" } },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
      create: {
        userId,
        provider: "dialpad",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
    });

    return NextResponse.redirect(
      new URL("/settings/integrations?connected=dialpad", request.url)
    );
  } catch (error) {
    console.error("Dialpad callback error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=callback_failed", request.url)
    );
  }
}
