
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/database";
import { authOptions } from "../../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { message: "Authorization code missing" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    const { tokens } = await oauth2Client.getToken(code);

    const gmailApp = await prisma.apps.findFirst({
      where: {
        name: "Gmail",
      },
    });

    if (!gmailApp) {
      return NextResponse.json(
        { message: "Gmail app not found" },
        { status: 404 }
      );
    }

    await prisma.appCredential.upsert({
      where: {
        userId_appId: {
          userId: session.user.userId,
          appId: gmailApp.id,
        },
      },
      create: {
        userId: session.user.userId,
        appId: gmailApp.id,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/`
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Google integration failed",
      },
      {
        status: 500,
      }
    );
  }
}