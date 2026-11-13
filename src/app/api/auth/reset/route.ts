import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
    token: z.string().min(10),
    password: z.string().min(8),
});

export async function POST(request: NextRequest) {
    const enabled = process.env.ENABLE_RATE_LIMITING !== "false";
    if (enabled && isRateLimited(`reset:${getClientIp(request)}`, 10)) {
        return NextResponse.json({ status: false, error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json({ status: false, error: "Invalid token or password (minimum 8 characters)" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt.getTime() < Date.now()) {
        if (record) await prisma.passwordResetToken.delete({ where: { tokenHash } }).catch(() => {});
        return NextResponse.json({ status: false, error: "This link is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
        prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return NextResponse.json({ status: true, message: "Password updated." });
}
