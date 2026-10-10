"use client";
import { finalUiText } from "@/config/strings";

import DashboardContent from "@components/admin/dashboard-content";
import { UIConstants } from "@courselit/common-models";
import {
    Button2,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@courselit/components-library";
import { HEADER_HELP } from "@ui-config/strings";
const { permissions } = UIConstants;

const breadcrumbs = [{ label: HEADER_HELP, href: "#" }];

export default function Page() {
    return (
        <DashboardContent
            breadcrumbs={breadcrumbs}
            permissions={[
                permissions.manageAnyCourse,
                permissions.manageCourse,
                permissions.manageUsers,
                permissions.manageSite,
                permissions.manageCommunity,
                permissions.manageSettings,
            ]}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-semibold mb-4">{HEADER_HELP}</h1>
            </div>
            <p className="mb-8 text-slate-600">
                {
                    finalUiText[
                        "If you need a helping hand, we are out there for you."
                    ]
                }
            </p>
            <div className="flex flex-col lg:!flex-row gap-4 mb-16">
                <Card className="lg:!w-1/3">
                    <CardHeader>
                        <CardTitle>{finalUiText["Documentation"]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            {
                                finalUiText[
                                    "Our documentation contains tutorials on how to do everything in CourseLit."
                                ]
                            }
                        </p>
                    </CardContent>
                    <CardFooter>
                        <a href="https://docs.courselit.app" target="_blank">
                            <Button2 variant="secondary">
                                {finalUiText["See documentation"]}
                            </Button2>
                        </a>
                    </CardFooter>
                </Card>
                <Card className="lg:!w-1/3">
                    <CardHeader>
                        <CardTitle>{finalUiText["Ask in Discord"]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            {
                                finalUiText[
                                    "Come ask your questions directly from the team. We are quite active there."
                                ]
                            }
                        </p>
                    </CardContent>
                    <CardFooter>
                        <a
                            href="https://discord.com/invite/GR4bQsN"
                            target="_blank"
                        >
                            <Button2 variant="secondary">
                                {finalUiText["Open Discord"]}
                            </Button2>
                        </a>
                    </CardFooter>
                </Card>
                <Card className="lg:!w-1/3">
                    <CardHeader>
                        <CardTitle>{finalUiText["Found a bug?"]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            {
                                finalUiText[
                                    "We encourage you to raise an issue so that we can make the product better for everyone."
                                ]
                            }
                        </p>
                    </CardContent>
                    <CardFooter>
                        <a
                            href="https://discord.com/channels/727630561895514212/1244954638747303946"
                            target="_blank"
                        >
                            <Button2 variant="secondary">
                                {finalUiText["Post an issue"]}
                            </Button2>
                        </a>
                    </CardFooter>
                </Card>
            </div>
            <div>
                <h2 className="font-semibold text-2xl mb-4">
                    {finalUiText["Priority Support"]}
                </h2>
                <p>
                    {
                        finalUiText[
                            "In case you need to get in touch with the team to get help faster, we offer"
                        ]
                    }
                    <strong>{finalUiText["paid"]}</strong>
                    {finalUiText["support. Please reach out to us on"]}{" "}
                    <a
                        href="mailto:support@courselit.app"
                        className="underline"
                    >
                        {finalUiText["CourseLit Support"]}
                    </a>{" "}
                    {finalUiText["with your requirements ."]}
                </p>
            </div>
        </DashboardContent>
    );
}
