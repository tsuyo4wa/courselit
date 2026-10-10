import { ProgressBar } from "./progress-bar";
import type { ContentItem } from "./content";
import {
    ContentCard,
    ContentCardContent,
    ContentCardImage,
    ContentCardHeader,
} from "@courselit/components-library";
import { Constants } from "@courselit/common-models";
import { BadgeCheck, Download } from "lucide-react";
import { BookOpen } from "lucide-react";
import { learnerCardStrings } from "@/config/strings";
import { Badge } from "@components/ui/badge";

interface ContentCardProps {
    item: ContentItem;
}

export function MyContentCard({ item }: ContentCardProps) {
    const { entity, entityType } = item;
    const progress =
        entity.totalLessons && entity.completedLessonsCount
            ? (entity.completedLessonsCount / entity.totalLessons) * 100
            : 0;

    return (
        <ContentCard
            key={item.entity.id}
            href={
                entityType.toLowerCase() ===
                Constants.MembershipEntityType.COURSE
                    ? `/course/${item.entity.slug}/${item.entity.id}`
                    : `/dashboard/community/${item.entity.id}`
            }
        >
            <ContentCardImage
                src={item.entity.featuredImage?.file}
                alt={item.entity.title}
            />
            <ContentCardContent>
                <ContentCardHeader>{item.entity.title}</ContentCardHeader>
                {entityType.toLowerCase() === Constants.CourseType.COURSE ? (
                    <div className="flex justify-between">
                        <Badge variant="secondary">
                            {entity.type === Constants.CourseType.COURSE ? (
                                <BookOpen className="h-4 w-4 mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            {entity.type === Constants.CourseType.COURSE
                                ? learnerCardStrings.course
                                : learnerCardStrings.download}
                        </Badge>
                        {entity.certificateId && (
                            <p className="flex items-center text-sm text-muted-foreground">
                                <BadgeCheck className="h-4 w-4 mr-1" />
                                {learnerCardStrings.certificate}
                            </p>
                        )}
                    </div>
                ) : (
                    ""
                )}
                {entityType.toLowerCase() === Constants.CourseType.COURSE &&
                entity.type === Constants.CourseType.COURSE &&
                entity.totalLessons ? (
                    <div className="space-y-2 mt-4">
                        <ProgressBar value={progress} />
                        <p className="text-sm text-muted-foreground flex justify-between">
                            <span>
                                {learnerCardStrings.progress
                                    .replace(
                                        "{total}",
                                        String(entity.totalLessons),
                                    )
                                    .replace(
                                        "{completed}",
                                        String(entity.completedLessonsCount),
                                    )}
                            </span>
                            <span>{`${Math.round(progress)}%`}</span>
                        </p>
                    </div>
                ) : (
                    ""
                )}
            </ContentCardContent>
        </ContentCard>
    );
}
