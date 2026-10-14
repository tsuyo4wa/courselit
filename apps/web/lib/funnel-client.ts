export async function funnelRequest(body?: unknown) {
    const r = await fetch("/api/funnels", {
        method: body ? "POST" : "GET",
        cache: "no-store",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await r.json();
    if (!r.ok)
        throw new Error(
            data.error ||
                "保存できませんでした。再読み込みして確認してください。",
        );
    return data;
}
