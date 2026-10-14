import mongoose from "mongoose";
import type { FunnelRecord } from "@/lib/funnel-types";
const schema = new mongoose.Schema<FunnelRecord>(
    {
        domainId: { type: String, required: true },
        funnelId: { type: String, required: true },
        name: { type: String, required: true },
        courseId: { type: String, required: true },
        entries: { type: mongoose.Schema.Types.Mixed, default: [] },
        active: { type: Boolean, default: false },
        archived: { type: Boolean, default: false },
        version: { type: Number, default: 1 },
        publication: mongoose.Schema.Types.Mixed,
        previous: { type: mongoose.Schema.Types.Mixed, default: [] },
        publishedAt: Date,
    },
    { timestamps: true },
);
schema.index({ domainId: 1, funnelId: 1 }, { unique: true });
schema.index({ domainId: 1, "entries.pageId": 1 });
schema.index({ domainId: 1, active: 1, "publication.pages.pageId": 1 });
export default (mongoose.models.Funnel as mongoose.Model<FunnelRecord>) ||
    mongoose.model<FunnelRecord>("Funnel", schema);
