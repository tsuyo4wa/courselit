import mongoose from "mongoose";
import DomainModel from "@models/Domain";
import CourseModel from "@models/Course";
import CommunityModel from "@models/Community";
import { getLaunchReview, saveLaunchReview } from "@/services/launch-review";
import { invalidateDomainCache } from "@/lib/domain-cache";
jest.mock("@/lib/domain-cache", () => ({ invalidateDomainCache: jest.fn() }));
const domain = {
    _id: new mongoose.Types.ObjectId(),
    name: "launch-school",
    email: "owner@example.com",
} as any;
const input = {
    revision: "b".repeat(64),
    pages: { home: "home", recruitment: "course", signup: "preview" },
    hiddenProductIds: ["bundle"],
};
const store = {
    createIndex: jest.fn().mockResolvedValue("expiry"),
    updateOne: jest.fn().mockResolvedValue({}),
    findOne: jest.fn(),
};
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mongoose.connection.db!, "collection").mockReturnValue(
        store as any,
    );
    jest.spyOn(CourseModel, "countDocuments").mockResolvedValue(0 as never);
    jest.spyOn(CommunityModel, "countDocuments").mockResolvedValue(1 as never);
    jest.spyOn(DomainModel, "updateOne").mockResolvedValue({
        matchedCount: 1,
    } as never);
});
afterEach(() => {
    jest.restoreAllMocks();
});
it("scopes ids to tenant and updates only listing settings under owner invariant", async () => {
    const before = Date.now();
    await saveLaunchReview(domain, input);
    expect(CommunityModel.countDocuments).toHaveBeenCalledWith({
        domain: domain._id,
        communityId: { $in: ["bundle"] },
        deleted: false,
    });
    expect(DomainModel.updateOne).toHaveBeenCalledWith(
        { _id: domain._id, email: domain.email, deleted: false },
        { $set: { "settings.catalogHiddenProductIds": ["bundle"] } },
    );
    const expiry = store.updateOne.mock.calls[0][1].$set.expiresAt.getTime();
    expect(expiry).toBeGreaterThanOrEqual(before + 7 * 86400000);
    expect(invalidateDomainCache).toHaveBeenCalledWith(domain.name);
});
it("rejects foreign or unknown products without changing preview or settings", async () => {
    (CommunityModel.countDocuments as jest.Mock).mockResolvedValue(0);
    await expect(saveLaunchReview(domain, input)).rejects.toThrow(
        "Unknown product",
    );
    expect(store.updateOne).not.toHaveBeenCalled();
    expect(DomainModel.updateOne).not.toHaveBeenCalled();
});
it("returns no expired draft and includes tenant expiry constraint", async () => {
    store.findOne.mockResolvedValue(null);
    expect(await getLaunchReview(domain)).toBeNull();
    expect(store.findOne).toHaveBeenCalledWith({
        _id: domain._id,
        expiresAt: { $gt: expect.any(Date) },
    });
});
it("does not publish even when saving complete draft HTML", async () => {
    store.findOne.mockResolvedValue({
        pages: input.pages,
        revision: input.revision,
    });
    expect(await getLaunchReview(domain)).toEqual({
        pages: input.pages,
        revision: input.revision,
    });
    expect(DomainModel.updateOne).not.toHaveBeenCalled();
});
