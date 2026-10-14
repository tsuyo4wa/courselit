/** Management chrome must not recolor learner screens, builders or public previews. */
export function isAdminWorkspace(path: string | null): boolean {
    if (!path?.startsWith("/dashboard/")) return false;
    if (/^\/dashboard\/(my-content|profile|notifications)(\/|$)/.test(path))
        return false;
    if (
        /\/preview(\/|$)/.test(path) ||
        /^\/dashboard\/[^/]*-preview(\/|$)/.test(path)
    )
        return false;
    if (/^\/dashboard\/community\//.test(path) && !path.includes("/manage"))
        return false;
    if (/^\/dashboard\/(page|mail)\//.test(path)) return false;
    return true;
}
