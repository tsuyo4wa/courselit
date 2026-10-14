export class FunnelError extends Error {
    constructor(
        message: string,
        public status = 400,
    ) {
        super(message);
        Object.setPrototypeOf(this, FunnelError.prototype);
    }
}
export function requireFunnelManager(c: { manager: boolean }) {
    if (!c.manager) throw new FunnelError("サイト管理の権限が必要です。", 403);
}
