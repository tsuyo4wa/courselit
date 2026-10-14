// This HTML is visible only inside the owner's sandboxed review frame.
// The exact destination rewrite prevents the staged public CTA from booking.
export function appointmentReleaseHtml(html: string): string {
    return html.replace(/<a\b[^>]*>/gi, (tag) => {
        let target: string | undefined;
        if (
            /\bhref="https:\/\/school\.namakemono\.info\/appointments"/.test(
                tag,
            )
        )
            target = "/dashboard/appointments/default/preview?sample=1";
        if (
            /\bhref="https:\/\/school\.namakemono\.info\/p\/privacy(?:#consultations)?"/.test(
                tag,
            )
        )
            target = "/dashboard/policy-preview#consultations";
        if (!target) return tag;
        return tag
            .replace(/\s+target=(?:"[^"]*"|'[^']*')/gi, "")
            .replace(/\bhref="[^"]*"/, `href="${target}" target="_top"`);
    });
}
