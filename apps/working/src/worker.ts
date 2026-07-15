import { $Enums, prisma } from "@repo/database";
import { QUEUE_NAME, sample } from "./const";
import { JsonValue } from "../../../packages/database/generated/client/runtime/client";
import { redis } from ".";
import { executeGmail } from "./executeApp";

export async function workerProcess(obj: sample) {
    try {
        if (!obj.stepId) {
            const updateexecutionstatus = await prisma.executions.update({
                where: {
                    id: obj.executionid
                }, data: {
                    status: "RUNNING", startedAt: new Date()
                }, select: {
                    id: true, triggerData: true, workflowId: true
                }
            });
            const res = await getStepWithWorkflowId(obj.workflowId);
            if (!res) throw new Error("NO SUCH STEP FOUND");
            triggerstart(res, updateexecutionstatus)
        } else {
            const res = await getStep(obj.stepId);
            if (!res) throw new Error("NO SUCH STEP FOUND");
            actionstart(res, obj);
        }
    } catch (error:any) {
        console.log(error)
        throw new Error(error);
    }
}
interface res {
    workflowId: string;
    id: string;
    appId: string | null;
    webhookSlug: string | null;
    eventId: string | null;
    type: $Enums.StepType;
    settings: JsonValue;
    nextStepId: string | null;
}
interface updateexecutionstatus {
    triggerData: JsonValue;
    workflowId: string;
    id: string;
}
async function actionstart(currentStep: res, obj: sample) {
    try {
        if (!currentStep.appId || !obj.prevstepId) {
            throw new Error("APP DOESNT EXSIST");
        };
        const app = await checkApp(currentStep.appId);
        const id = obj.prevstepId;
        switch (app.name) {
            case "Gmail": {
                const prevData = await prisma.executionLog.findFirst({
                    where: {
                        stepId: id,
                    }, select: {
                        outputPayload: true
                    }
                })
                if (!prevData?.outputPayload) throw new Error("No such Payload exsist");
                const update = await prisma.executionLog.create({
                    data: {
                        executionId: obj.executionid,
                        stepId: currentStep.id,
                        status: "RUNNING",
                        inputPayload: prevData.outputPayload,
                    },
                });
               const response= await executeGmail(update,id,obj.workflowId)
                break;
            }

            default:
                break;
        }

    } catch (error:any) {
        console.log(error)
        throw new Error(error)
    }
}

async function triggerstart(currentStep: res, execution: updateexecutionstatus) {
    try {
        let payload = execution.triggerData ?? undefined;
        if (!currentStep.appId) {
            throw new Error("APP DOESNT EXSIST");
        };
        const app = await checkApp(currentStep.appId);
        switch (app.name) {
            case "Webhook": {
                await prisma.executionLog.create({
                    data: {
                        executionId: execution.id,
                        stepId: currentStep.id,
                        status: "COMPLETED",
                        inputPayload: payload,
                        outputPayload: payload,
                    },
                });

                if (currentStep.nextStepId) {
                    await redis.lPush(
                        QUEUE_NAME,
                        JSON.stringify({
                            executionId: execution.id,
                            workflowId: execution.workflowId,
                            stepId: currentStep.nextStepId,
                            prevstepId: currentStep.id
                        })
                    );
                } else {
                    await prisma.executions.update({
                        where: {
                            id: execution.id,
                        },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                        },
                    });
                }

                break;
            }
            default:
                break;
        }

    } catch (err:any) {
        console.error(err);
        throw new Error(err);
    }
}
async function getStep(stepId: string) {
    try {
        let currentStep = await prisma.workflowStep.findFirst({
            where: {
                id: stepId,
            },
        });
        return currentStep;
    } catch (error:any) {
        console.error(error);

        throw new Error(error);

    }
}
async function getStepWithWorkflowId(workflowId: string) {
    try {
        let currentStep = await prisma.workflowStep.findFirst({
            where: {
                workflowId,
                type: "TRIGGER",
            },
        });
        return currentStep;
    } catch (error:any) {
        console.error(error);

        throw new Error(error);
    }
}
async function checkApp(appId: string) {
    const app = await prisma.apps.findUnique({
        where: {
            id: appId
        }, select: {
            name: true,
            id: true
        }
    })
    if (!app) {
        throw new Error("APP DOESNT EXSIST");
    }
    return app;
}