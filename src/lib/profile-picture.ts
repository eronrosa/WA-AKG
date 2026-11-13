import { waManager } from "@/modules/whatsapp/manager";
import { logger } from "./logger";

/** Contact (phone or LID) and group JIDs accepted for profile picture lookups. */
const JID_PATTERN = /^[\w.:-]+@(s\.whatsapp\.net|lid|g\.us)$/;

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;
const cache = new Map<string, { url: string | null; expiresAt: number }>();

export function isValidPictureJid(jid: string): boolean {
    return JID_PATTERN.test(jid);
}

/**
 * Returns the WhatsApp profile picture URL of a contact or group, or null when there is no
 * picture, it is hidden by privacy settings, the session is not connected, or the lookup
 * fails or times out. Never throws. Results are cached for a few minutes because this runs
 * for every received message.
 */
export async function getProfilePictureUrl(sessionId: string, jid: string, timeoutMs = 4000): Promise<string | null> {
    if (!jid || !isValidPictureJid(jid)) return null;

    const cacheKey = `${sessionId}:${jid}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.url;

    const socket = waManager.getInstance(sessionId)?.socket;
    if (!socket) return null;

    let url: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        const lookup = socket.profilePictureUrl(jid, "image");
        const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
        });
        url = (await Promise.race([lookup, timeout])) || null;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // A timeout says nothing about the picture, so do not cache it as "no picture".
        if (message === "timeout") {
            logger.debug("ProfilePicture", `Lookup timed out for ${jid}`);
            return null;
        }
        // Anything else (404 item-not-found, 401 not-authorized) means no picture is available.
        url = null;
    } finally {
        if (timer) clearTimeout(timer);
    }

    if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
    cache.set(cacheKey, { url, expiresAt: Date.now() + CACHE_TTL_MS });
    return url;
}
