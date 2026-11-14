import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden" }, { status: 403 });
        }

        // Get the database Session ID (cuid) from the sessionId string
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: 'Session not found' }, { status: 404 });
        }

        // Query params: limit (1-200, default 50), page (default 1),
        // filter (all | private | groups), search (JID, name or push name)
        const query = request.nextUrl.searchParams;
        const limit = parseInt(query.get("limit") || "50", 10);
        const page = parseInt(query.get("page") || "1", 10);
        const filterParam = query.get("filter");
        if (filterParam && !["all", "private", "groups"].includes(filterParam)) {
            return NextResponse.json({ status: false, message: "Invalid filter. Use all, private or groups", error: "Invalid filter" }, { status: 400 });
        }

        const result = await ChatService.getChatsPage(session.id, {
            limit: Number.isFinite(limit) ? limit : 50,
            page: Number.isFinite(page) ? page : 1,
            filter: (filterParam as "all" | "private" | "groups" | null) || undefined,
            search: query.get("search") || undefined,
        });
        const totalPages = Math.max(Math.ceil(result.total / result.limit), 1);

        return NextResponse.json({
            status: true,
            message: "Chats fetched successfully",
            data: result.chats,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages,
                hasMore: result.page < totalPages,
            },
        });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch chats", error: 'Failed to fetch chats' }, { status: 500 });
    }
}
