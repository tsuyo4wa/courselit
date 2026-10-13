import mongoose from "mongoose";
import { z } from "zod";
import DomainModel from "@models/Domain";
import CourseModel from "@models/Course";
import CommunityModel from "@models/Community";
import { invalidateDomainCache } from "@/lib/domain-cache";
import type { Domain } from "@models/Domain";

export const launchReviewInput = z
    .object({
        revision: z.string().regex(/^[a-f0-9]{64}$/),
        pages: z
            .object({
                home: z.string().max(60000),
                recruitment: z.string().max(60000),
                signup: z.string().max(20000),
            })
            .strict(),
        hiddenProductIds: z
            .array(z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/))
            .max(100),
    })
    .strict();
let indexed: Promise<unknown> | undefined;
function collection() {
    if (!mongoose.connection.db) throw new Error("Database unavailable");
    return mongoose.connection.db.collection("launch_reviews");
}
export async function saveLaunchReview(
    domain: Domain,
    input: z.infer<typeof launchReviewInput>,
) {
    const ids = Array.from(new Set(input.hiddenProductIds));
    const count =
        (await CourseModel.countDocuments({
            domain: domain._id,
            courseId: { $in: ids },
        })) +
        (await CommunityModel.countDocuments({
            domain: domain._id,
            communityId: { $in: ids },
            deleted: false,
        }));
    if (count !== ids.length) throw new Error("Unknown product");
    const store = collection();
    indexed ||= store
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
        .catch((e) => {
            indexed = undefined;
            throw e;
        });
    await indexed;
    await store.updateOne(
        { _id: domain._id },
        {
            $set: {
                pages: input.pages,
                revision: input.revision,
                expiresAt: new Date(Date.now() + 7 * 86400000),
            },
        },
        { upsert: true },
    );
    // Scope to the verified owner; update only catalog visibility, never credentials or roles.
    const result = await DomainModel.updateOne(
        { _id: domain._id, email: domain.email, deleted: false },
        { $set: { "settings.catalogHiddenProductIds": ids } },
    );
    if (result.matchedCount !== 1) throw new Error("School unavailable");
    invalidateDomainCache(domain.name);
}
export async function getLaunchReview(domain: Domain) {
    const data = await collection().findOne({
        _id: domain._id,
        expiresAt: { $gt: new Date() },
    });
    if (!data) return null;
    const parsed = launchReviewInput.shape.pages.safeParse(data.pages);
    return parsed.success
        ? { pages: parsed.data, revision: data.revision as string }
        : null;
}
