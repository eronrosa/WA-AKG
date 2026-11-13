import { NextResponse } from "next/server";

/** Maximum upload size in bytes, from MAX_UPLOAD_SIZE_MB (default 50). */
export function getMaxUploadMb(): number {
    const parsed = Number(process.env.MAX_UPLOAD_SIZE_MB);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

/** Returns a 413 response when the uploaded file exceeds MAX_UPLOAD_SIZE_MB, otherwise null. */
export function checkUploadSize(file: File | null | undefined): NextResponse | null {
    if (!file) return null;
    const maxMb = getMaxUploadMb();
    if (file.size > maxMb * 1024 * 1024) {
        const message = `file exceeds the ${maxMb} MB limit`;
        return NextResponse.json({ status: false, message, error: message }, { status: 413 });
    }
    return null;
}
