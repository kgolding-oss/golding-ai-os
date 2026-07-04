# Enterprise Governance Layer

Milestone 20 adds a first-class Enterprise Governance Layer without redesigning the existing GAIOS architecture. It builds on Executive Command, Chief of Staff, AI Workforce, Plugin System, Knowledge Graph, Organizational Memory, and the Model Router.

## Organization Model

The governed hierarchy is:

1. Executive Command
2. Chief of Staff
3. Executive Office
4. Departments: Legal, Funding, Finance, Research, Knowledge, Media, Operations, Property, Education, Partnerships, Volunteer Management, and Future Departments

Each department may contain teams, agents, workflows, and plugins. The runtime model in `lib/governance` represents these as measurable governance units so future departments can be added without changing the enterprise shell.

## Department KPIs

Every department reports the same KPI framework:

- Tasks Completed
- Pending Work
- Blocked Work
- Average Completion Time
- Approval Wait Time
- Automation Success Rate
- Knowledge Usage
- Cost
- Health
- Risk Score
- Confidence
- Recommendation Accuracy

## Accountability Boundary

GAIOS may prepare recommendations, drafts, packets, scorecards, and reviews. It must not send external emails, submit grants, file legal documents, initiate payments, perform connector writes, or run destructive file operations without the proper policy outcome and human approval.

## Mac Knowledge Compatibility

No Mac indexing is implemented in this milestone. Governance adds only future hooks for Mac Knowledge Vault audit evidence, local-source attestation, and policy-aware source usage.
