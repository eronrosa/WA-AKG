import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 30 * 60 * 1000;

const schema = z.object({ email: z.string().email() });

/**
 * Generates a single-use password reset link. Because the app does not send e-mail,
 * the link is written to the server log. The response never reveals whether the e-mail exists.
 */
export async function POST(request: NextRequest) {
    const enabled = process.env.ENABLE_RATE_LIMITING !== "false";
    if (enabled && isRateLimited(`forgot:${getClientIp(request)}`, 5)) {
        return NextResponse.json({ status: false, error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ status: false, error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

        await prisma.$transaction([
            prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
            prisma.passwordResetToken.create({
                data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
            }),
        ]);

        const baseUrl = (process.env.BASE_URL || request.nextUrl.origin).replace(/\/$/, "");
        const link = `${baseUrl}/auth/reset?token=${rawToken}`;
        logger.warn("Auth", `Password reset requested for ${email}. Link (valid 30 min): ${link}`);
    }

    return NextResponse.json({
        status: true,
        message: "If the email is registered, a reset link was generated. Check the server logs.",
    });
}
