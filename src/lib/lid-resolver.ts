import { prisma } from "./prisma";
import { logger } from "./logger";
import { isLidJid } from "./jid-utils";
import { waManager } from "@/modules/whatsapp/manager";

/**
 * WhatsApp addresses many 1:1 chats by a "linked ID" (123@lid) instead of the phone number.
 * When a message is stored before the phone number is known, the same person ends up split
 * in two chats: one under the phone JID (usually what we sent) and one under the LID (what
 * they sent). These helpers resolve LIDs and merge such chats back under the phone JID.
 */

/** Asks the live WhatsApp connection which phone number a LID belongs to. Null when unknown. */
export async function resolveLidViaSocket(sessionId: string, lid: string): Promise<string | null> {
    if (!isLidJid(lid)) return null;
    try {
        const socket = waManager.getInstance(sessionId)?.socket as any;
        const pn: string | null | undefined = await socket?.signalRepository?.lidMapping?.getPNForLID(lid);
        if (!pn) return null;
        const user = pn.split("@")[0].split(":")[0].replace(/\D/g, "");
        return user ? `${user}@s.whatsapp.net` : null;
    } catch {
        return null;
    }
}

/** Phone JID for a LID using stored contacts first, then the live connection. */
async function resolveLid(sessionId: string, dbSessionId: string, lid: string): Promise<string | null> {
    const contact = await prisma.contact.findFirst({
        where: { sessionId: dbSessionId, OR: [{ jid: lid }, { lid }] },
        select: { jid: true, remoteJidAlt: true },
    });
    if (contact?.remoteJidAlt && contact.remoteJidAlt.endsWith("@s.whatsapp.net")) return contact.remoteJidAlt;
    if (contact?.jid && contact.jid.endsWith("@s.whatsapp.net")) return contact.jid;
    return resolveLidViaSocket(sessionId, lid);
}

const running = new Set<string>();

/**
 * Moves stored messages from LID chats to the matching phone-number chat.
 * Safe to run repeatedly: it only rewrites rows whose LID can be resolved, never deletes
 * anything, and message identity (sessionId + keyId) is unaffected.
 */
export async function mergeLidChats(sessionId: string): Promise<{ lidChats: number; merged: number; messages: number; unresolved: number }> {
    const empty = { lidChats: 0, merged: 0, messages: 0, unresolved: 0 };
    if (running.has(sessionId)) return empty;
    running.add(sessionId);
    try {
        const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
        if (!session) return empty;
        const dbSessionId = session.id;

        const rows = await prisma.message.findMany({
            where: { sessionId: dbSessionId, remoteJid: { endsWith: "@lid" } },
            distinct: ["remoteJid"],
            select: { remoteJid: true },
        });

        let merged = 0, messages = 0, unresolved = 0;
        for (const { remoteJid: lid } of rows) {
            const phoneJid = await resolveLid(sessionId, dbSessionId, lid);
            if (!phoneJid) { unresolved++; continue; }

            const moved = await prisma.message.updateMany({
                where: { sessionId: dbSessionId, remoteJid: lid },
                data: { remoteJid: phoneJid },
            });
            await prisma.message.updateMany({
                where: { sessionId: dbSessionId, senderJid: lid },
                data: { senderJid: phoneJid },
            });
            // Remember the pair so later messages resolve without asking WhatsApp again.
            await prisma.contact.upsert({
                where: { sessionId_jid: { sessionId: dbSessionId, jid: phoneJid } },
                create: { sessionId: dbSessionId, jid: phoneJid, lid },
                update: { lid },
            }).catch(() => {});

            merged++;
            messages += moved.count;
        }

        if (rows.length > 0) {
            logger.info("LID", `Session ${sessionId}: ${merged}/${rows.length} LID chats merged into phone chats (${messages} messages), ${unresolved} unresolved`);
        }
        return { lidChats: rows.length, merged, messages, unresolved };
    } catch (error) {
        logger.error("LID", `Failed to merge LID chats for ${sessionId}`, error);
        return empty;
    } finally {
        running.delete(sessionId);
    }
}
