"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCookie, setCookie } from "@/lib/client-cookie";
import { useRouter } from "next/navigation";

interface Session {
    id: string;
    sessionId: string;
    name: string;
    status: string;
}

interface SessionContextType {
    sessions: Session[];
    sessionId: string;
    setSessionId: (id: string) => void;
    refreshSessions: () => Promise<void>;
    loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionId, setSessionIdState] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                const responseData = await res.json();
                const data = responseData?.data || [];
                // Filter connected only? Or showing all but disabled?
                // Logic: Only show CONNECTED in selector for "Active" operations.
                // Show all sessions so users can manage disconnected ones (e.g. webhooks, settings)
                setSessions(data);

                // Sync with cookie
                const cookieId = getCookie("sessionId");
                if (cookieId && data.find((s: Session) => s.sessionId === cookieId)) {
                    setSessionIdState(cookieId);
                } else if (data.length > 0) {
                    // Default to first
                    const first = data[0].sessionId;
                    setSessionIdState(first);
                    setCookie("sessionId", first);
                } else {
                    setSessionIdState("");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();

        // The list used to load only once. A session created or deleted afterwards, or a
        // load that failed while the server was restarting, left every page saying
        // "no session selected" until a manual reload. Keep it fresh instead.
        const interval = setInterval(fetchSessions, 30000);
        const onVisible = () => {
            if (document.visibilityState === "visible") fetchSessions();
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", fetchSessions);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", fetchSessions);
        };
    }, []);

    const setSessionId = (id: string) => {
        setSessionIdState(id);
        setCookie("sessionId", id); // Sync Cookie
        router.refresh(); // Sync Server Components
    };

    return (
        <SessionContext.Provider value={{ sessions, sessionId, setSessionId, refreshSessions: fetchSessions, loading }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}
