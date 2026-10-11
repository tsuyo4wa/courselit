import { finalUiText } from "@/config/strings";
import { NextRequest } from "next/server";
import { getDomain, getUser } from "../initiate/route";
import { auth } from "@/auth";
import { error } from "@/services/logger";
import InvoiceModel from "@models/Invoice";
import Membership from "@models/Membership";
import CourseModel from "@models/Course";
import { Constants } from "@courselit/common-models";
import { learningPath } from "@/lib/learning-navigation";

interface RequestPayload {
    id: string;
}

export async function POST(req: NextRequest) {
    const body: RequestPayload = await req.json();
    const domainName = req.headers.get("domain");

    try {
        const domain = await getDomain(domainName);
        if (!domain) {
            return Response.json(
                { message: "Domain not found" },
                { status: 404 },
            );
        }

        const session = await auth.api.getSession({
            headers: req.headers,
        });
        const user = await getUser(session, domain._id);

        if (!user) {
            return Response.json({}, { status: 401 });
        }

        const { id } = body;

        if (!id) {
            return Response.json({ message: "Bad request" }, { status: 400 });
        }

        const invoice = await InvoiceModel.findOne({
            domain: domain._id,
            invoiceId: id,
        });

        if (!invoice) {
            return Response.json(
                { message: finalUiText["Item not found"] },
                { status: 404 },
            );
        }

        const membership = await Membership.findOne({
            domain: domain._id,
            membershipId: invoice.membershipId,
        });

        if (!membership || membership.userId !== user.userId) {
            return Response.json({}, { status: 401 });
        }

        if (invoice.status !== Constants.InvoiceStatus.PAID)
            return Response.json({ status: invoice.status });
        // A paid invoice may be saved just before its learning grant finishes.
        if (membership.status !== Constants.MembershipStatus.ACTIVE)
            return Response.json({ status: Constants.InvoiceStatus.PENDING });
        const course =
            membership.entityType === Constants.MembershipEntityType.COURSE
                ? await CourseModel.findOne({
                      domain: domain._id,
                      courseId: membership.entityId,
                  })
                : null;
        return Response.json({
            status: invoice.status,
            learningPath: learningPath(
                membership.entityType,
                membership.entityId,
                course?.slug,
            ),
            title: course?.title,
        });
    } catch (err: any) {
        error(`Error verifying invoice: ${err.message}`, {
            domain: domainName,
            body,
            stack: err.stack,
        });
        return Response.json({ message: err.message }, { status: 500 });
    }
}
