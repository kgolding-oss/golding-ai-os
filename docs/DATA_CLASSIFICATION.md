# Data Classification

GAIOS classifies staged live data before indexing or import.

| Classification        | Use                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `public`              | Approved public-facing material.                                                                  |
| `internal`            | Routine internal operational records.                                                             |
| `confidential`        | Business-sensitive records requiring limited access.                                              |
| `legal_sensitive`     | Legal files, cases, privileged notes, or legal research with sensitivity.                         |
| `financial_sensitive` | Banking, donor, grant, payroll, tax, sponsorship, or budget records.                              |
| `personal_sensitive`  | Personal communications, contacts, calendar details, identity data, or private household records. |
| `restricted`          | Highest-sensitivity records requiring explicit owner approval and minimal exposure.               |

Classifications are used by approval gates, workspace mapping, AI exposure controls, audit events, and dashboard warnings.
