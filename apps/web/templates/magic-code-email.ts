import { checkoutStrings, finalUiText } from "@/config/strings";
const magicCodeEmail = `
doctype html
html
    head
        style(type='text/css').     
            .courselit-branding-container {
                margin: 40px 0px;
            }
            .courselit-branding-cta {
                text-decoration: none;
                color: #000000;
                padding: 6px 10px;
                background-color: #FFFFFF;
                border: 1px solid;
                border-radius: 6px;
                text-align: center;
            }
    body
        p   #{code} ${checkoutStrings.codeMail}
        p
            strong ${checkoutStrings.codeMailImportant}
            |   ${checkoutStrings.codeMailWarning}
        if !hideCourseLitBranding
            div(class="courselit-branding-container")
                a(
                    href="https://courselit.app"
                    target="_blank"
                    class="courselit-branding-cta"
                ) ${finalUiText["Powered by"]} <strong> CourseLit </strong>
`;

export default magicCodeEmail;
