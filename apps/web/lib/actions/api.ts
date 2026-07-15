"use server"
import bcrypt from "bcryptjs";
import { $Enums, Prisma, prisma, WorkflowStep } from "@repo/database";
import { JsonValue } from "../../../../packages/database/generated/client/runtime/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
type Ok<T> = T extends void ? { ok: true } : { ok: true; value: T };
type Err<E> = {
    ok: false;
    error: E;
};
const Ok = <T>(value?: T extends void ? void : T): Ok<T> => {
    return (typeof value === 'undefined' ? { ok: true } : { ok: true, value }) as Ok<T>;
};
const Err = <E>(error: E): Err<E> => ({ ok: false, error });
type Result<T, E = string> = Ok<T> | Err<E>;
export type RegisterReturn = Result<{ message: string; status: number; data: RegisterPayload }, string>
export type RegisterPayload = {
    name: string | null;
    userId: string;
    email: string | null;
    image: string | null;
    createdWorkflows: {
        name: string;
        id: string;
        description: string | null;
    }[] | null;
}

type WorkflowPayload = {
    name: string;
    id: string;
    description: string | null;
    version: string;
    steps: {
        workflowId: string;
        id: string;
        appId: string | null;
        webhookSlug: string | null;
        type: $Enums.StepType;
        settings: JsonValue;
        nextStepId: string | null;
    }[];
};


export async function getWorkflow(workflowId: string): Promise<Result<{ status: boolean; message: string; data: WorkflowPayload }, string>> {
    const data = await getServerSession(authOptions);
    const userId = data?.user?.userId;
    if (!userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            select: {
                id: true,
                name: true,
                description: true, version: true,
                steps: true,
            },

        });
        if (!workflow) {
            console.log("Workflow not found.");
            return Err("Workflow not found.");
        }
        const orderedSteps = await orderSteps(workflow.steps);
        return Ok({
            status: true,
            message: "Workflow retrieved successfully",
            data: {
                ...workflow,
                steps:orderedSteps
            },
        });
    } catch (error) {
        console.error("Error retrieving workflow from DB:", error);
        return Err("Error retrieving workflow from DB.");

    }

}
type data = {
    name: string;
    description: string;
}
type newWorkflow = {
    name: string;
    description: string | null;
    id: string;
    version: string;
    steps: {
        id: string;
    }[];
}
export type newWorkflowReturn = Result<{ status: boolean; message: string; data: newWorkflow }, string>;

export async function createWorkflow(workflowData: data): Promise<newWorkflowReturn> {
    const data = await getServerSession(authOptions);
    const userId = data.user.userId;
    if (!userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const newWorkflow = await prisma.workflow.create({
            data: {
                name: workflowData.name,
                creator: {
                    connect: { userId: userId },
                },
                description: workflowData.description, steps: {
                    create: {
                        type: "TRIGGER",
                    }
                }
            }, select: {
                id: true,
                name: true,
                description: true,
                version: true,
                steps: {
                    where: {
                        type: "TRIGGER"
                    },
                    take: 1,
                    select: {
                        id: true,
                    }
                },
            }
        });
        console.log("Workflow created in DB:", newWorkflow);
        return Ok({
            status: true,
            message: "Workflow created successfully",
            data: newWorkflow,
        });
    }
    catch (error) {
        console.error("Error creating workflow in DB:", error);
        return Err("Error creating workflow in DB.");
    }
}
export async function register(type: "SIGNIN" | "SIGNUP", email: string,
    password: string, name?: string): Promise<RegisterReturn> {
    try {
        if (!email || !password || (type == "SIGNUP" && !name)) {
            return Err("Email, password and name are required for registration");
        };
        const user = await prisma.user.findUnique({ where: { email }, include: { createdWorkflows: { select: { id: true, name: true, description: true } } } });
        if (user) {
            if (user.password == null) {
                const bypass = bcrypt.hashSync(password, 10);
                const response = await prisma.user.update({ where: { email }, data: { password: bypass }, select: { email: true, userId: true, image: true, name: true, createdWorkflows: { select: { id: true, name: true, description: true } } } });
                return Ok({
                    message: "Password updated successfully",
                    status: 200,
                    data: response
                })
            } else {
                const isValid = bcrypt.compareSync(password, user.password);
                if (isValid) {
                    const data: {
                        name: string | null;
                        userId: string;
                        email: string;
                        image: string | null;
                        createdWorkflows: {
                            id: string;
                            name: string;
                            description: string | null;
                        }[] | null;
                    } = {
                        userId: user.userId,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        createdWorkflows: user.createdWorkflows.map((workflow) => ({
                            id: workflow.id,
                            name: workflow.name,
                            description: workflow.description,
                        })),
                    }
                    return Ok({
                        message: "User signed in successfully",
                        status: 200,
                        data
                    })
                } else {
                    return Err("Invalid password");
                }
            }
        }
        const createdUser = await prisma.user.create({
            data: {
                email,
                password: bcrypt.hashSync(password, 10),
                name: name || null,
            },
            select: {
                email: true,
                userId: true,
                image: true,
                name: true,
                createdWorkflows: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        });
        return Ok({
            message: "User registered successfully",
            status: 201,
            data: createdUser,
        });


    } catch (error) {
        return Err(error instanceof Error ? error.message : "An unexpected error occurred");
    }
}
type NewWorkflowStep = {
    workflowId: string,
    appId: string,
    type: $Enums.StepType,
    settings: Prisma.InputJsonValue,
    webhookslug?: string
    previousStep?: string
    exsistingStepId?: string
    eventId?: string
}





type AppMetadata = {
    type: "WEBHOOK";
};
export async function saveworkflowstep(workflowdata: NewWorkflowStep): Promise<Result<any, string>> {
    const data = await getServerSession(authOptions);
    console.log("Workflow Data:", workflowdata);
    if (!data?.user?.userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const searchApp = await prisma.apps.findUnique({
            where: {
                id: workflowdata.appId
            }
        });
        if (searchApp == null) {
            return Err("App Not Found");
        }
        const metadata = searchApp?.metadata as AppMetadata;
        if (metadata.type == "WEBHOOK" && workflowdata.webhookslug != null) {
            workflowdata.settings
            const createstep = await prisma.workflowStep.upsert({
                where: {
                    id: workflowdata.exsistingStepId || "",
                },
                update: {
                    workflowId: workflowdata.workflowId,
                    type: workflowdata.type,
                    appId: workflowdata.appId,
                    settings: workflowdata.settings,
                    webhookSlug: workflowdata.webhookslug,
                    eventId: workflowdata.eventId
                },
                create: {
                    workflowId: workflowdata.workflowId,
                    type: workflowdata.type,
                    appId: workflowdata.appId,
                    settings: workflowdata.settings,
                    webhookSlug: workflowdata.webhookslug,
                    eventId: workflowdata.eventId
                }
            })
            return Ok({
                status: true,
                message: "Workflowstep saved successfully",
                data: createstep,
            });
        }
        if (workflowdata.type == "ACTION") {
            const step = await prisma.$transaction(async (tx) => {
                const createdStep = await tx.workflowStep.upsert({
                    where: {
                        id: workflowdata.exsistingStepId || "",
                    },
                    update: {
                        workflowId: workflowdata.workflowId,
                        type: workflowdata.type,
                        appId: workflowdata.appId,
                        settings: workflowdata.settings, eventId: workflowdata.eventId

                    },
                    create: {
                        workflowId: workflowdata.workflowId,
                        type: workflowdata.type,
                        appId: workflowdata.appId,
                        settings: workflowdata.settings, eventId: workflowdata.eventId

                    },
                });
                if (workflowdata.previousStep) {
                    await tx.workflowStep.update({
                        where: {
                            id: workflowdata.previousStep,
                        },
                        data: {
                            nextStep: {
                                connect: {
                                    id: createdStep.id,
                                },
                            },
                        },
                    });
                }

                return createdStep;
            });
            return Ok({
                status: true,
                message: "Workflow saved successfully",
                data: step,
            });
        }
        if (workflowdata.type == "TRIGGER") {
            const createstep = await prisma.workflowStep.upsert({
                where: {
                    id: workflowdata.exsistingStepId || "",
                },
                update: {
                    workflowId: workflowdata.workflowId,
                    type: workflowdata.type,
                    appId: workflowdata.appId,
                    settings: workflowdata.settings, eventId: workflowdata.eventId

                },
                create: {
                    workflowId: workflowdata.workflowId,
                    type: workflowdata.type,
                    appId: workflowdata.appId,
                    settings: workflowdata.settings, eventId: workflowdata.eventId

                }
            })
            return Ok({
                status: true,
                message: "Workflow saved successfully",
                data: createstep,
            });
        }
        return Ok({
            status: false,
            message: "Something went wrong",
        });
    } catch (error) {
        console.log(error)
        return Err("Something Went Wrong ");
    }
}

// export async function saveApp (){
//     try {

//         const save = await prisma.apps.create({
//            data :{
//                image : "https://cdn-icons-png.flaticon.com/512/281/281769.png",
//                name : "Gmail",
//                metadata : {
//                    to : "string",
//                    subject : "string",
//                    body : "string"
//                },
//            }
//         })
//         const save2 = await prisma.apps.create({
//            data :{
//                name: "Webhook",
//                metadata : {
//                    type : "WEBHOOK",
//                    url : "string",
//                    method : "string",
//                },image : "https://img.icons8.com/?size=100&id=32917&format=png&color=000000",
//            }
//         })
//     } catch (error) {
//         console.log(error)
//     }
// }
export async function deleteWorkflowStep(stepId: string): Promise<Result<{ status: boolean; message: string; deletedStepId: string }, string>> {
    const data = await getServerSession(authOptions);
    if (!data?.user?.userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {

        const res = await prisma.$transaction(async (tx) => {
            const step = await tx.workflowStep.findUnique({
                where: { id: stepId },
                include: {
                    previousStep: true,
                    nextStep: true,
                },
            });

            if (!step) {
                throw new Error("Workflow step not found");
            }

            if (step.type === "TRIGGER") {
                throw new Error("Trigger cannot be deleted.");
            }

            if (step.previousStep) {
                await tx.workflowStep.update({
                    where: {
                        id: step.previousStep.id,
                    },
                    data: {
                        nextStep: step.nextStep
                            ? {
                                connect: {
                                    id: step.nextStep.id,
                                },
                            }
                            : {
                                disconnect: true,
                            },
                    },
                });
            }

            await tx.workflowStep.delete({
                where: {
                    id: step.id,
                },
            });

            return step.id;
        });
        return Ok({
            status: true,
            message: "Workflow step deleted successfully",
            deletedStepId: res,
        });
    } catch (error) {
        console.error("Error deleting workflow step:", error);
        return Err("Error deleting workflow step.");
    }
}
export async function getstepId(workflowId: string): Promise<Result<{ status: boolean; message: string; stepId: string | null }, string>> {
    const data = await getServerSession(authOptions);
    if (!data?.user?.userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const step = await prisma.workflowStep.create({
            data: {
                workflowId: workflowId,
                type: "ACTION",
            }, select: {
                id: true,
            }
        });
        return Ok({
            status: true,
            message: "Step ID retrieved successfully",
            stepId: step.id,
        });
    } catch (error) {
        console.error("Error retrieving step ID:", error);
        return Err("Error retrieving step ID.");
    }
}
export async function createActionreturnId(workflowId: string, parentId: string): Promise<Result<{ status: boolean; message: string; stepId: string }, string>> {
    const data = await getServerSession(authOptions);
    if (!data?.user?.userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const createStep = await prisma.workflowStep.create({
            data: {
                workflowId,
                type: "ACTION",
            },
            select: {
                id: true,
            },
        });

        await prisma.workflowStep.update({
            where: {
                id: parentId,
            },
            data: {
                nextStep: {
                    connect: {
                        id: createStep.id,
                    },
                },
            },
        });
        return Ok({
            status: true,
            message: "Action step created successfully",
            stepId: createStep.id,
        });
    }
    catch (error) {
        console.error("Error creating action step:", error);
        return Err("Error creating action step.");
    }
}
export async function getExecutionPayloads(workflowId: string): Promise<Err<string> | {
    success: boolean;
    data: {
        id: string;
        startedAt: Date;
        triggerData: Prisma.JsonValue;
    }[];
    message?: undefined;
} | {
    success: boolean;
    message: string;
    data?: undefined;
}> {
    const data = await getServerSession(authOptions);
    if (!data?.user?.userId) {
        // if (!userIdfornonOauth)
        return Err("Authentication failed: User not found.");
    }
    try {
        const executions = await prisma.executions.findMany({
            where: {
                workflowId,
                isTest: true,
            },
            orderBy: {
                startedAt: "desc",
            },
            take: 10,
            select: {
                id: true,
                triggerData: true,
                startedAt: true,
            },
        });

        return {
            success: true,
            data: executions,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: "Failed to fetch execution payloads.",
        };
    }
}
// export async function sendToZapier() {
//   const res = await fetch(
//     "https://localhost:3000/api/webhook/1tnk9dd5tyd/",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: "Sachin",
//         email: "sachinsinghania165@gmail.com",
//         message: "Hello from my workflow builder!",
//       }),
//     }
//   );

//   const data = await res.json();

//   console.log(data);
// }

export async function getAppConnections(): Promise<Err<string> | {
    ok: true;
    value: {
        credentials: {
            appId: string;
            accountEmail: string;
        }[];
    };
}> {
    try {

        const data = await getServerSession(authOptions);
        const userId = data?.user?.userId
        if (!userId) {
            // if (!userIdfornonOauth)
            return Err("Authentication failed: User not found.");
        }
        const credentials = (
            await prisma.appCredential.findMany({
                where: {
                    userId,
                },
                select: {
                    appId: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            })
        ).map((c) => ({
            appId: c.appId,
            accountEmail: c.user.email,
        }));

        return Ok({
            credentials
        });
    } catch (error) {
        console.log(error)
        return Err("Something went wrong")
    }
}
export async function orderSteps(steps: WorkflowStep[]) {
  const stepMap = new Map(steps.map((step) => [step.id, step]));

  const ordered: WorkflowStep[] = [];

  let current = steps.find((step) => step.type === "TRIGGER");

  while (current) {
    ordered.push(current);

    if (!current.nextStepId) break;

    current = stepMap.get(current.nextStepId);
  }

  return ordered;
}