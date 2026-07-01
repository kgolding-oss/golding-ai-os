# GAIOS Architecture

GAIOS remains an approval-gated, auditable operating system. Milestone 10 extends the existing dashboard, agent, workflow, knowledge, autonomy, connector, and persistence layers with a Law Library operational registry rather than replacing them.

```mermaid
flowchart TB
  UI[Next.js Dashboard] --> OS[Law Library OS Registry]
  UI --> Agents[Agent Runtime]
  Agents --> COS[Chief of Staff]
  COS --> Divisions[Operational Divisions]
  Divisions --> Knowledge[Knowledge OS]
  Divisions --> Approvals[Approval Engine]
  Approvals --> Audit[Audit Logs]
```
