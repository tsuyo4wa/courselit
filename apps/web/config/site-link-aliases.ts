// Content compatibility only: these are NOT trusted login/CSRF/DNS origins.
// Tenant names are stable DB identifiers, not the public subdomain. Keep former
// hosts here after a move so old Page bodies and publication snapshots still work.
export const siteLinkAliases: Readonly<Record<string, readonly string[]>> = {
    main: [
        "https://school.namakemono.info",
        "https://namakemono-courselit.onrender.com",
    ],
};
