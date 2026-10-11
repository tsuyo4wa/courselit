import { learningPath, resumeLessonId } from "../learning-navigation";
import { Constants } from "@courselit/common-models";
import type { CourseFrontend } from "@/app/(with-contexts)/course/[slug]/[id]/helpers";

describe("learning navigation", () => {
    const course = {
        firstLesson: "intro",
        groups: [
            { rank: 2, lessons: [{ lessonId: "second" }] },
            {
                rank: 1,
                lessons: [{ lessonId: "intro" }, { lessonId: "first" }],
            },
        ],
    } as CourseFrontend;
    it("starts at the first unfinished lesson in curriculum order", () => {
        expect(resumeLessonId(course)).toBe("intro");
        expect(resumeLessonId(course, ["intro"])).toBe("first");
        expect(resumeLessonId(course, ["intro", "first"])).toBe("second");
        expect(course.groups[0].rank).toBe(2);
    });
    it("lets a completed course be reviewed without resetting progress", () => {
        expect(resumeLessonId(course, ["intro", "first", "second"])).toBe(
            "intro",
        );
    });
    it("uses a course learning link and keeps bundles at the course list", () => {
        expect(
            learningPath(Constants.MembershipEntityType.COURSE, "id", "course"),
        ).toBe("/course/course/id?learn=true");
        expect(
            learningPath(Constants.MembershipEntityType.COMMUNITY, "bundle"),
        ).toBe("/dashboard/my-content/products");
        expect(
            learningPath(
                Constants.MembershipEntityType.COURSE,
                "deleted-course",
            ),
        ).toBe("/dashboard/my-content/products");
    });
});
