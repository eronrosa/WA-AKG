import { prisma } from "@/lib/prisma";
import { resolveToPhoneJid, isLidJid } from "@/lib/jid-utils";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, jid: string }> }
) {
    const { sessionId, jid } = await params;
    const decodedJid = decodeURIComponent(jid);

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // Get the database Session ID (cuid) from the sessionId string
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const dbSessionId = session.id;

        // Query params: limit (1-500, default 100) and before (ISO timestamp) to walk back in history
        const query = request.nextUrl.searchParams;
        const parsedLimit = parseInt(query.get("limit") || "100", 10);
        const limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 100, 1), 500);
        const beforeParam = query.get("before");
        const before = beforeParam ? new Date(beforeParam) : null;
        if (before && Number.isNaN(before.getTime())) {
            return NextResponse.json({ status: false, message: "Invalid 'before'. Use an ISO timestamp", error: "Invalid 'before'" }, { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: {
                sessionId: dbSessionId,
                remoteJid: decodedJid,
                ...(before ? { timestamp: { lt: before } } : {})
            },
            orderBy: { timestamp: 'desc' }, // Fetch NEWEST first
            take: limit + 1 // one extra row tells whether older messages exist
        });

        const hasMore = messages.length > limit;
        if (hasMore) messages.pop();

        // Reverse to show oldest -> newest
        messages.reverse();

        const pagination = {
            limit,
            count: messages.length,
            hasMore,
            // Pass this value as ?before= to get the previous (older) page
            nextBefore: hasMore && messages.length > 0 ? messages[0].timestamp.toISOString() : null,
        };

        // Enrich with participant info if it's a group
        if (decodedJid.endsWith('@g.us')) {
            const group = await prisma.group.findUnique({
                where: {
                    sessionId_jid: {
                        sessionId: dbSessionId,
                        jid: decodedJid
                    }
                },
                select: { participants: true }
            });

            if (group && group.participants) {
                const parts = group.participants as any[];

                const enrichedMessages = messages.map((msg: any) => {
                    const sender = msg.senderJid || msg.remoteJid; // Fallback
                    const participant = parts.find(p => p.id === sender);

                    return {
                        ...msg,
                        sender: participant || sender // Replace or add sender field with object or string
                    };
                });

                return NextResponse.json({ status: true, data: enrichedMessages, pagination });
            }
        }

        return NextResponse.json({ status: true, data: messages, pagination });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ status: false, message: 'Failed to fetch messages', error: 'Failed to fetch messages' }, { status: 500 });
    }
}
