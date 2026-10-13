import { Profile, SiteInfo, UIConstants } from "@courselit/common-models";
import { checkPermission } from "@courselit/utils";

// media:manage is assigned to ordinary learners too; it is not a staff role.
export function canUploadLearnerMedia(
    settings: Pick<SiteInfo, "learnerUploadsEnabled"> | null | undefined,
    actor: Partial<Profile> | null | undefined,
    ownerEmail?: string,
): boolean {
    if (!actor) return false;
    if (settings?.learnerUploadsEnabled !== false) return true;
    if (ownerEmail && actor.email?.toLowerCase() === ownerEmail.toLowerCase()) {
        return true;
    }
    return checkPermission(actor.permissions || [], [
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
        UIConstants.permissions.manageSite,
        UIConstants.permissions.manageSettings,
        UIConstants.permissions.manageUsers,
        UIConstants.permissions.manageCommunity,
    ]);
}
