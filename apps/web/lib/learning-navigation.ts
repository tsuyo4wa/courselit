import { Constants, MembershipEntityType } from "@courselit/common-models";
import type { CourseFrontend } from "@/app/(with-contexts)/course/[slug]/[id]/helpers";

export function learningPath(
    type: MembershipEntityType,
    id: string,
    slug?: string,
): string {
    return type === Constants.MembershipEntityType.COURSE && slug
        ? `/course/${encodeURIComponent(slug)}/${encodeURIComponent(id)}?learn=true`
        : "/dashboard/my-content/products";
}

export function resumeLessonId(
    course: CourseFrontend,
    completedLessons: string[] = [],
): string {
    const lessons = [...course.groups]
        .sort((a, b) => a.rank - b.rank)
        .flatMap((group) => group.lessons);
    return (
        lessons.find((lesson) => !completedLessons.includes(lesson.lessonId))
            ?.lessonId || course.firstLesson
    );
}
