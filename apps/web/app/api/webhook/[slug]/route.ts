import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database"
import { redis } from "../../../../lib/redis";
import { QUEUE_NAME } from "../../../../lib/mockData";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {

        const { slug } = await params;
        const body = await req.json();

        console.log("Webhook Slug:", slug);
        const url = `http://localhost:3000/api/webhook/${slug}/`
        console.log("Payload:", body);

        const checkforwebhook = await prisma.workflowStep.findUnique({
            where: {
                webhookSlug: url
            }, select: {
                workflow: {
                    select: {
                        isPublished: true,
                        id: true
                    }
                },
                id: true
            }
        });
        console.log(checkforwebhook)
        if (checkforwebhook == null) {
            return NextResponse.json(
                {
                    message: "Invalid slug",
                },
                {
                    status: 404,
                }
            );
        }
        try {
            await prisma.executions.create({
                data: {
                    workflowId: checkforwebhook.workflow.id,
                    triggerData: body,
                    status: "PENDING",
                    isTest: !checkforwebhook.workflow.isPublished,
                },
            });
        } catch (error) {
            console.log(error);
            return NextResponse.json(
                { message: "Server Error" },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                message: checkforwebhook.workflow.isPublished
                    ? "Accepted"
                    : "Accepted (Test Execution)",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {
                message: "Server Error",
            },
            {
                status: 501,
            }
        );
    }
}