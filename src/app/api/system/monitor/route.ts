import { NextResponse, NextRequest } from "next/server";
import si from "systeminformation";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Ensure this route is dynamic
export const dynamic = "force-dynamic";

// systeminformation shells out to PowerShell/WMI on Windows (~2s per call) while the
// dashboard polls every 3s, so cache what rarely changes and share one live snapshot.
const SNAPSHOT_TTL_MS = 5_000;
const DISK_TTL_MS = 60_000;

let osInfoPromise: ReturnType<typeof si.osInfo> | null = null;
let diskCache: { at: number; value: Awaited<ReturnType<typeof si.fsSize>> } | null = null;
let snapshotCache: { at: number; value: Awaited<ReturnType<typeof readSnapshot>> } | null = null;
let snapshotInFlight: ReturnType<typeof readSnapshot> | null = null;

async function readDisks() {
    if (diskCache && Date.now() - diskCache.at < DISK_TTL_MS) return diskCache.value;
    const value = await si.fsSize();
    diskCache = { at: Date.now(), value };
    return value;
}

async function readSnapshot() {
    osInfoPromise ??= si.osInfo();
    const [cpu, mem, os, fsSize, networkStats] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        osInfoPromise,
        readDisks(),
        si.networkStats()
    ]);
    return { cpu, mem, os, fsSize, networkStats };
}

// Serve the last snapshot immediately and refresh it in the background once stale;
// only the very first request after startup waits for a full read.
async function getSnapshot() {
    if (snapshotCache && Date.now() - snapshotCache.at < SNAPSHOT_TTL_MS) return snapshotCache.value;
    const refresh = refreshSnapshot();
    if (!snapshotCache) return refresh;
    refresh.catch(error => console.error("Monitor background refresh failed:", error));
    return snapshotCache.value;
}

function refreshSnapshot() {
    snapshotInFlight ??= readSnapshot()
        .then(value => {
            snapshotCache = { at: Date.now(), value };
            return value;
        })
        .finally(() => {
            snapshotInFlight = null;
        });
    return snapshotInFlight;
}

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(req);
        if (!auth) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        // Global monitor needs SUPERADMIN
        if (auth.role !== "SUPERADMIN") {
            return NextResponse.json({ status: false, message: "Forbidden - Superadmin only" }, { status: 403 });
        }

        const { cpu, mem, os, fsSize, networkStats } = await getSnapshot();

        // Calculate Process (Node.js) Memory
        const processMemory = process.memoryUsage();

        const data = {
            cpu: {
                load: cpu.currentLoad,
                cores: cpu.cpus.map(c => c.load),
            },
            memory: {
                total: mem.total,
                used: mem.active,
                free: mem.available,
                swapTotal: mem.swaptotal,
                swapUsed: mem.swapused,
            },
            disk: fsSize.map(disk => ({
                fs: disk.fs,
                mount: disk.mount,
                size: disk.size,
                used: disk.used,
                usePercent: disk.use
            })),
            network: networkStats.map(net => ({
                iface: net.iface,
                rx_sec: net.rx_sec,
                tx_sec: net.tx_sec,
                state: net.operstate
            })).filter(net => net.state === "up" || net.rx_sec > 0 || net.tx_sec > 0),
            os: {
                platform: os.platform,
                distro: os.distro,
                release: os.release,
                uptime: si.time().uptime
            },
            process: {
                uptime: process.uptime(),
                heapTotal: processMemory.heapTotal,
                heapUsed: processMemory.heapUsed,
                rss: processMemory.rss,
            }
        };

        return NextResponse.json({
            status: true,
            message: "System metrics fetched successfully",
            data
        });

    } catch (error: any) {
        console.error("Monitor API Error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
