import mongoose from "mongoose";
import { z } from "zod";

export const policyReviewInput = z
    .object({
        terms: z.string().max(50000).startsWith("# 利用規約"),
        privacy: z.string().max(50000).startsWith("# プライバシーポリシー"),
        consultationHtml: z.string().max(150000).optional(),
    })
    .strict();
let indexed: Promise<unknown> | undefined;
function collection() {
    if (!mongoose.connection.db) throw new Error("Database unavailable");
    return mongoose.connection.db.collection("policy_reviews");
}
export async function savePolicyReview(
    domain: any,
    content: z.infer<typeof policyReviewInput>,
) {
    const store = collection();
    indexed ||= store
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
        .catch((e) => {
            indexed = undefined;
            throw e;
        });
    await indexed;
    // Temporary, tenant-scoped review only. Auto-cleanup after 7 days; never
    // consulted by public pages. Expiry also blocks reads before TTL cleanup.
    await store.updateOne(
        { _id: domain._id },
        {
            $set: {
                terms: content.terms,
                privacy: content.privacy,
                consultationHtml: content.consultationHtml || null,
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 86400000),
            },
        },
        { upsert: true },
    );
}
export async function getPolicyReview(domain: any) {
    const data = await collection().findOne({
        _id: domain._id,
        expiresAt: { $gt: new Date() },
    });
    if (
        !data ||
        typeof data.terms !== "string" ||
        typeof data.privacy !== "string"
    )
        return null;
    const content: z.infer<typeof policyReviewInput> = {
        terms: data.terms as string,
        privacy: data.privacy as string,
    };
    if (
        typeof data.consultationHtml === "string" &&
        data.consultationHtml.length <= 150000
    )
        content.consultationHtml = data.consultationHtml;
    return content;
}
