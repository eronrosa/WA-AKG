import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";

const fail = (message: string, status: number) =>
    NextResponse.json({ status: false, message, error: message }, { status });

/**
 * POST /api/chat/{sessionId}/{jid}/history
 *
 * Asks the phone for messages older than the oldest one stored for this chat (WhatsApp
 * "history sync on demand"). The request is asynchronous: the phone answers later and the
 * messages are saved by the normal history handler, so read them afterwards with
 * GET /api/chat/{sessionId}/{jid}?before=... The connection and stored messages are untouched.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return fail("Unauthorized", 401);

        const { sessionId, jid } = await params;
        const decodedJid = decodeURIComponent(jid);

        if (!(await canAccessSession(user.id, user.role, sessionId))) {
            return fail("Forbidden - Cannot access this session", 403);
        }

        const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
        if (!session) return fail("Session not found", 404);

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket || instance.status !== "CONNECTED") return fail("Session not connected", 503);

        const body = await request.json().catch(() => ({}));
        const parsedCount = parseInt(String(body?.count ?? 50), 10);
        const count = Math.min(Math.max(Number.isFinite(parsedCount) ? parsedCount : 50, 1), 50);

        const oldest = await prisma.message.findFirst({
            where: { sessionId: session.id, remoteJid: decodedJid },
            orderBy: { timestamp: "asc" },
            select: { keyId: true, fromMe: true, timestamp: true },
        });
        if (!oldest) {
            return fail("No stored message for this chat. On-demand history needs at least one message as a starting point", 404);
        }

        const requestId = await instance.socket.fetchMessageHistory(
            count,
            { remoteJid: decodedJid, id: oldest.keyId, fromMe: oldest.fromMe },
            oldest.timestamp.getTime()
        );

        return NextResponse.json({
            status: true,
            message: "History requested. The phone answers asynchronously; read the chat again in a few seconds",
            data: { jid: decodedJid, requested: count, olderThan: oldest.timestamp.toISOString(), requestId },
        }, { status: 202 });
    } catch (error) {
        console.error("History request error:", error);
        return fail("Failed to request history from the phone", 500);
    }
}
