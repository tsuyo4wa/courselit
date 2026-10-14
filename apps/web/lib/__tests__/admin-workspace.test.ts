import { isAdminWorkspace } from "../admin-workspace";
it.each([
    "/dashboard/overview",
    "/dashboard/products",
    "/dashboard/funnels",
    "/dashboard/funnels/example",
    "/dashboard/appointments",
    "/dashboard/settings/general",
    "/dashboard/community/example/manage",
])("uses the shared management palette on %s", (path) =>
    expect(isAdminWorkspace(path)).toBe(true),
);
it.each([
    null,
    "/",
    "/lp/example",
    "/dashboard/my-content/products",
    "/dashboard/profile",
    "/dashboard/notifications",
    "/dashboard/community/example",
    "/dashboard/appointments/preview",
    "/dashboard/funnels/example/preview/ad",
    "/dashboard/policy-preview",
    "/dashboard/launch-preview",
    "/dashboard/contact-preview",
    "/dashboard/page/example",
    "/dashboard/mail/template/example",
])("preserves the public or learner palette on %s", (path) =>
    expect(isAdminWorkspace(path)).toBe(false),
);
