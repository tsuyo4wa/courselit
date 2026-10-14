import { publicSiteOrigin } from "@/lib/portable-site-url";
import {
    Constants,
    Domain,
    Membership,
    PaymentPlan,
} from "@courselit/common-models";
import mongoose from "mongoose";
import MembershipModel from "@models/Membership";
import UserModel from "@models/User";
import CourseModel from "@models/Course";
import CommunityModel from "@models/Community";
import { getEmailFrom } from "@courselit/utils";
import pug from "pug";
import template from "@/templates/learning-welcome";
import { checkoutStrings } from "@/config/strings";
import { learningPath } from "@/lib/learning-navigation";
import { addMailJob } from "./queue";
import { error } from "./logger";

// Transactional enrollment mail only. No mailing-list/sequence enrollment.
// Atomically claim one attempt per membership, including concurrent webhooks.
// Failed or interrupted attempts remain visible for deliberate manual review.
export async function sendLearningWelcome(
    domain: Domain & { _id: mongoose.Types.ObjectId },
    membership: Membership,
    plan: PaymentPlan,
) {
    if (
        membership.status !== Constants.MembershipStatus.ACTIVE ||
        plan.internal ||
        membership.isIncludedInPlan
    )
        return;
    try {
        const user = await UserModel.findOne({
            domain: domain._id,
            userId: membership.userId,
        });
        const course =
            membership.entityType === Constants.MembershipEntityType.COURSE
                ? await CourseModel.findOne({
                      domain: domain._id,
                      courseId: membership.entityId,
                  })
                : null;
        const community =
            membership.entityType === Constants.MembershipEntityType.COMMUNITY
                ? await CommunityModel.findOne({
                      domain: domain._id,
                      communityId: membership.entityId,
                  })
                : null;
        const title = course?.title || community?.name;
        const origin = publicSiteOrigin(domain);
        if (!user?.email || !title || !origin) return;
        const path = learningPath(
            membership.entityType,
            membership.entityId,
            course?.slug,
        );
        const claimed = await MembershipModel.findOneAndUpdate(
            {
                domain: domain._id,
                membershipId: membership.membershipId,
                status: Constants.MembershipStatus.ACTIVE,
                learningEmailAttemptedAt: { $exists: false },
            },
            { $set: { learningEmailAttemptedAt: new Date() } },
        );
        if (!claimed) return;
        try {
            await addMailJob({
                to: [user.email],
                subject: `${checkoutStrings.enrollmentMailSubject}${title}`,
                body: pug.render(template, {
                    title,
                    loginLink: `${origin}/login?redirect=${encodeURIComponent(path)}`,
                    listLink: `${origin}/dashboard/my-content/products`,
                }),
                from: getEmailFrom({
                    name: domain.settings?.title || domain.name,
                    email: process.env.EMAIL_FROM || "",
                }),
            });
            await MembershipModel.updateOne(
                { domain: domain._id, membershipId: membership.membershipId },
                { $set: { learningEmailSentAt: new Date() } },
            );
        } catch {
            await MembershipModel.updateOne(
                { domain: domain._id, membershipId: membership.membershipId },
                { $set: { learningEmailFailedAt: new Date() } },
            );
            error("Learning welcome delivery failed", {
                membershipId: membership.membershipId,
            });
        }
    } catch {
        // Email must never roll back an already granted learning entitlement.
        error("Learning welcome preparation failed", {
            membershipId: membership.membershipId,
        });
    }
}
