import { canUploadLearnerMedia } from "../learner-media";
import { UIConstants } from "@courselit/common-models";
const learner = {
    email: "learner@example.com",
    permissions: [
        UIConstants.permissions.manageMedia,
        UIConstants.permissions.enrollInCourse,
    ],
};
describe("learner media gate", () => {
    it("keeps compatible defaults for other schools", () =>
        expect(canUploadLearnerMedia({}, learner)).toBe(true));
    it("denies OFF even though learners have media:manage", () =>
        expect(
            canUploadLearnerMedia({ learnerUploadsEnabled: false }, learner),
        ).toBe(false));
    it("preserves owner access", () =>
        expect(
            canUploadLearnerMedia(
                { learnerUploadsEnabled: false },
                learner,
                learner.email,
            ),
        ).toBe(true));
    it("preserves staff access", () =>
        expect(
            canUploadLearnerMedia(
                { learnerUploadsEnabled: false },
                { permissions: [UIConstants.permissions.manageCourse] },
            ),
        ).toBe(true));
    it("does not show uploads before profile is loaded", () =>
        expect(canUploadLearnerMedia({}, null)).toBe(false));
});
