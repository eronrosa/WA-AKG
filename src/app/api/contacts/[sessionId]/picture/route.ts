import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { getAccessibleSessions } from "@/lib/session-access";
import { waManager } from "@/modules/whatsapp/manager";
import { getProfilePictureUrl, isValidPictureJid } from "@/lib/profile-picture";

const fail = (message: string, status: number) =>
    NextResponse.json({ status: false, message, error: message }, { status });

/**
 * GET /api/contacts/{jid}/picture
 *
 * Profile picture URL of a contact (…@s.whatsapp.net) or group (…@g.us).
 * The folder is named [sessionId] only because Next.js requires one slug name per
 * path level; in this route that segment carries the JID.
 *
 * The session is taken from ?sessionId=…, or, when omitted, from the caller's only
 * connected session.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    let jid: string | null = null;
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return fail("Unauthorized", 401);

        jid = decodeURIComponent((await params).sessionId);
        if (!isValidPictureJid(jid)) {
            return fail("Invalid JID. Use 5511999999999@s.whatsapp.net for a contact or 120363...@g.us for a group", 400);
        }

        let sessionId = request.nextUrl.searchParams.get("sessionId");
        if (sessionId) {
            if (!(await canAccessSession(user.id, user.role, sessionId))) {
                return fail("Forbidden - Cannot access this session", 403);
            }
            if (!waManager.getInstance(sessionId)?.socket) return fail("Session not ready", 503);
        } else {
            const sessions = await getAccessibleSessions(user.id, user.role);
            const connected = sessions.filter((s) => waManager.getInstance(s.sessionId)?.status === "CONNECTED");
            if (connected.length === 0) return fail("No connected WhatsApp session", 503);
            if (connected.length > 1) {
                return fail("More than one session is connected. Add ?sessionId=<id> to choose one", 400);
            }
            sessionId = connected[0].sessionId;
        }

        const pictureUrl = await getProfilePictureUrl(sessionId, jid);
        return NextResponse.json({ status: true, data: { jid, pictureUrl } });
    } catch (error) {
        console.error("Contact picture error:", error);
        // The contract is "never 500 because of the picture": report no picture instead.
        return NextResponse.json({ status: true, data: { jid, pictureUrl: null } });
    }
}
