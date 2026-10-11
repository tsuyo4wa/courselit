import { checkoutStrings } from "@/config/strings";

const template = `
doctype html
html(lang="ja")
    head
        meta(charset="UTF-8")
    body(style="font-family: sans-serif; line-height: 1.9; color: #292524; padding: 24px; max-width: 600px; margin: auto;")
        h1(style="font-size: 22px;") ${checkoutStrings.enrollmentMailHeading}
        p= title
        p ${checkoutStrings.enrollmentMailBody}
        p(style="margin: 28px 0;")
            a(href=loginLink style="display: inline-block; padding: 12px 24px; background: #334155; color: white; border-radius: 8px; text-decoration: none;") ${checkoutStrings.startLearning}
        p ${checkoutStrings.enrollmentMailLogin}
        p ${checkoutStrings.nextVisit}
        p
            a(href=listLink) ${checkoutStrings.dashboard}
`;

export default template;
