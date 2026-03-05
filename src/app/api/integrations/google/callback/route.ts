import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getOAuth2Client } from "@/lib/google";

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
    const oauth2Client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's email from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || null;

    // Upsert Integration record
    await prisma.integration.upsert({
      where: { userId_provider: { userId, provider: "google" } },
      update: {
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        email,
      },
      create: {
        userId,
        provider: "google",
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        email,
      },
    });

    return NextResponse.redirect(
      new URL("/settings/integrations?connected=google", request.url)
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=callback_failed", request.url)
    );
  }
}
