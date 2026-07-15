import { $Enums, prisma } from "@repo/database";
import { JsonValue } from "../../../packages/database/generated/client/runtime/client";
import { sendGmail } from "./gmail";

type update = {
    createdAt: Date;
    id: string;
    status: $Enums.ExecutionStatus;
    executionId: string;
    stepId: string;
    inputPayload: JsonValue | null;
    outputPayload: JsonValue | null;
    errorMessage: string | null;
}
export async function executeGmail(response: update, prevStepId: string, workflowId: string) {
    try {
        const res = await prisma.workflowStep.findFirst({
            where: {
                id: response.stepId
            }
        })
        if (!res) throw new Error("Step Doesnt Exsist");
        const settings = res.settings as Record<string, any>;
        const payload = (response.inputPayload as Record<string, any>) ?? {};
        const resolved = Object.fromEntries(
            Object.entries(settings).map(([key, value]) => [
                key,
                typeof value === "string"
                    ? resolveTemplate(value, prevStepId, payload)
                    : value,
            ])
        );
        const credential = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
            }, select: {
                creator: { select: { accessToken: true, refreshToken: true } }
            }
        })
        if (!credential?.creator.accessToken || !credential.creator.refreshToken) return;
        const result = await sendGmail({
            accessToken: credential.creator.accessToken,
            refreshToken: credential.creator.refreshToken,

            from: resolved.from,
            to: resolved.to,
            subject: resolved.subject,
            body: resolved.body,
        });
        
        await prisma.executionLog.update({
            where: {
                id: response.id,
            },
            data: {
                status: "COMPLETED",
                outputPayload: "SENT",
            },
        });

    } catch (error:any) {
        throw new Error(error)
    }
}
function resolveTemplate(
    value: string,
    stepId: string,
    payload: Record<string, any>
) {
    return value.replace(
        new RegExp(`{{${stepId}\\.([^}]+)}}`, "g"),
        (_, field) => String(payload[field] ?? "")
    );
}