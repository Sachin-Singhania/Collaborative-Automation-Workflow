# Collaborative Workflow Automation

A scalable workflow automation platform inspired by **Zapier** and **n8n**, allowing users to visually build workflows that connect multiple applications through triggers and actions.
<img width="1593" height="730" alt="image" src="https://github.com/user-attachments/assets/f87e24b6-396c-422b-8206-e6ed026ef04f" />
## System Design

<img width="1096" height="556" alt="Screenshot 2026-06-12 152153" src="https://github.com/user-attachments/assets/63d6208f-2bf3-4fb0-9ff4-77d2f7acdc82" />

## Features

- 🎨 Drag-and-drop workflow builder using React Flow
- ⚡ Real-time collaborative workflow editing
- 🔗 OAuth integration with third-party applications
- 📩 Gmail integration
- 🌐 Webhook triggers
- 📦 Queue-based execution using Redis
- ⚙️ Distributed worker architecture
- 📜 Execution history and step-by-step logs
- 🔄 Dynamic field mapping between workflow steps
- 🚀 Monorepo architecture with Turborepo

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Flow
- Zustand
- NextAuth

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)
- Redis
- Google APIs
- OAuth 2.0

### Infrastructure

- Turborepo
- Docker (optional)
- Redis
- Worker Service

---

# Architecture

```
                 Webhook
                     │
                     ▼
          Create Execution
                     │
                     ▼
               PostgreSQL
                     │
                     ▼
                 Redis Queue
                     │
      ┌──────────────┴──────────────┐
      ▼                             ▼
 Worker 1                      Worker 2
      │                             │
      ▼                             ▼
 Execute One Step            Execute One Step
      │                             │
      └──────────────┬──────────────┘
                     ▼
              Execution Logs
```

Each worker executes **only one workflow step**.

After completing a step:

- stores execution output
- creates execution log
- pushes the next step into Redis
- marks execution completed if no next step exists

---

# Workflow Execution

```
Webhook Trigger
      │
      ▼
Execution Created
      │
      ▼
Trigger Executed
      │
      ▼
Action 1
      │
      ▼
Action 2
      │
      ▼
Completed
```

---

# Dynamic Mapping

Previous step outputs can be referenced anywhere using:

```
{{stepId.field}}
```

Example

```
Hello {{3a8be8ad.customer}}

Payment Amount:
{{3a8be8ad.amount}}
```

which becomes

```
Hello Sachin

Payment Amount:
499
```

---

# Execution Model

Every execution maintains

- Status
- Trigger Payload
- Execution Logs
- Step Outputs

Execution states

```
PENDING
   │
   ▼
RUNNING
   │
   ├────────► FAILED
   │
   ▼
COMPLETED
```

---

# Folder Structure

```
apps/
    web/
    worker/

packages/
    database/
    ui/
```

---

# OAuth

Each application stores its own credentials.

Example

- Gmail
- Slack
- Discord
- Notion

Access tokens are automatically refreshed using OAuth refresh tokens.

---

# Queue Processing

Redis stores lightweight jobs.

```
{
    executionId,
    workflowId,
    stepId,
    previousStepId
}
```

Workers fetch the latest execution state directly from PostgreSQL.

---

# Future Integrations

- Gmail
- Discord
- Slack
- Notion
- Google Sheets
- Trello
- HTTP Request
- Delay Node
- AI Nodes
- Conditions
- Loops

---

# Future Improvements

- Parallel workflow execution
- Retry mechanism
- Dead Letter Queue
- Workflow versioning
- Scheduled workflows
- Rate limiting
- Metrics Dashboard
- Worker Autoscaling
- Conditional branching
- AI-powered workflow generation

---

# Installation

```bash
git clone https://github.com/yourusername/collaborative-workflow.git

cd collaborative-workflow

npm install
```

Configure environment variables

```
DATABASE_URL=

REDIS_URL=

NEXTAUTH_SECRET=

NEXTAUTH_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
```

Run development server

```bash
npm run dev
```

Run worker

```bash
npm run worker
```

---

# Motivation

The goal of this project is to understand and implement the architecture behind modern workflow automation platforms such as Zapier and n8n, with a strong focus on scalability, distributed execution, extensibility, and real-world production design.

---

# License

MIT
