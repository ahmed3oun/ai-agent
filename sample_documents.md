# Sample Enterprise Test Documents & Testing Guide

Use these realistic enterprise documents to test your platform's **RAG Ingestion (pgvector)** and **LangGraph AI Agent**.

---

## 📄 Document 1: Enterprise Microservices Security Architecture Guide

**Title**: `Microservices Security Architecture`  
**Filename**: `microservices_security_v2.txt`  
**Tags**: `architecture, security, microservices, auth`  

### Content to Copy into Knowledge Base:
```text
OVERVIEW OF MICROSERVICES SECURITY ARCHITECTURE (V2.4)

1. Authentication & Token Management
All public HTTP requests to microservices must terminate at the API Gateway (Kong / Envoy). The API Gateway is responsible for validating incoming OAuth 2.0 / OIDC Bearer tokens issued by Keycloak or Auth0. Upon successful token validation, the API Gateway strips sensitive headers and injects a signed internal JSON Web Token (JWT) containing caller identity (sub), tenant ID (tenant_id), and user roles (roles). Microservices within the internal VPC trust only tokens signed by the API Gateway's internal RSA-4096 private key.

2. Database Encryption & Access Controls
Database connections from NestJS microservices to PostgreSQL must use TLS 1.3 with mutual authentication (mTLS). Sensitive personally identifiable information (PII) such as email, phone numbers, and home addresses must be encrypted at rest using AES-256-GCM before database insertion. Vector embeddings stored in pgvector tables do not contain raw PII but must adhere to database row-level security (RLS) policies scoped by tenant_id.

3. Zero Trust Service-to-Service Communication
Inter-service RPC communication utilizes gRPC over HTTP/2 encrypted via mTLS. SPIFFE/SPIRE identification workloads automatically issue short-lived SVID X.509 certificates to each service instance with a maximum lifetime of 12 hours. Automatic certificate rotation occurs every 6 hours without service interruption.

4. Rate Limiting and Anomaly Detection
The API Gateway enforces rate limiting per tenant tier: Standard tier accounts are capped at 500 requests per minute (RPM), while Enterprise tier accounts allow up to 5,000 RPM. Any tenant exceeding 150% of their burst threshold triggers an automatic 15-minute IP quarantine managed by Cloudflare Web Application Firewall (WAF).
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What algorithm is used to encrypt PII data before saving it to PostgreSQL?"*
- *"How often are SPIFFE/SPIRE SVID X.509 certificates rotated for inter-service RPC?"*
- *"What happens if a tenant exceeds 150% of their rate limit burst threshold?"*

---

## 📄 Document 2: Global Remote Work & Expense Reimbursement Policy

**Title**: `Global Remote Work & Expense Policy`  
**Filename**: `remote_work_policy_2026.txt`  
**Tags**: `hr, policy, expenses, remote`  

### Content to Copy into Knowledge Base:
```text
GLOBAL REMOTE WORK AND EXPENSE REIMBURSEMENT POLICY (2026 REVISION)

Section 1: Home Office Equipment Stipend
All full-time remote employees are eligible for a one-time Home Office Setup Stipend of up to $1,200 USD (or local currency equivalent) upon onboarding. This stipend covers ergonomic chairs, external monitors, standing desk converters, and noise-canceling headsets. Equipment receipts must be submitted via Concur within 45 calendar days of employment start date.

Section 2: Monthly Connectivity Allowance
To cover high-speed fiber internet and mobile data usage, remote staff will receive a recurring monthly stipend of $85 USD included directly in the mid-month payroll cycle. No itemized expense submission is required for the monthly connectivity allowance.

Section 3: Travel & Offsite Budget Guidelines
When traveling for company offsite events or client meetings, hotel accommodations are capped at $250 USD per night (excl. local taxes) for domestic travel and $380 USD per night for international destinations. Daily meal per diem is capped at $75 USD per day. Alcohol expenses require prior manager approval and are capped at $25 per meal.

Section 4: Hardware Refresh Cycle
Laptops (Apple MacBook Pro 16" or Dell XPS 15) remain company property and are eligible for automatic hardware refresh every 36 months. Devices out of warranty must be returned via pre-paid Courier within 14 days of receiving a replacement device.
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What is the maximum hotel accommodation budget per night for international travel?"*
- *"How much is the home office setup stipend and how many days do employees have to submit receipts?"*
- *"Do I need to submit receipts for the monthly internet allowance?"*

---

## 📄 Document 3: SaaS Platform SLA & Incident Escalation Runbook

**Title**: `SaaS SLA & Incident Escalation Runbook`  
**Filename**: `sla_incident_runbook.txt`  
**Tags**: `devops, sre, incident, sla, support`  

### Content to Copy into Knowledge Base:
```text
SAAS PLATFORM SLA & SEVERITY-1 INCIDENT ESCALATION RUNBOOK

1. Service Level Agreements (SLAs)
The SaaS platform targets a monthly Uptime SLA of 99.95% (excluding scheduled maintenance windows). Scheduled maintenance windows must be announced at least 72 hours in advance and occur between 01:00 UTC and 04:00 UTC on Sundays.

2. Incident Severity Classifications
- Severity 1 (P1 - Critical): Complete core system outage affecting >20% of active enterprise customers. Target Response Time: < 15 minutes. Target Resolution Time: < 2 hours.
- Severity 2 (P2 - High): Major feature degradation with no available workaround. Target Response Time: < 30 minutes. Target Resolution Time: < 6 hours.
- Severity 3 (P3 - Medium): Minor issue or UI glitch with documented workaround. Target Response Time: < 4 hours.

3. On-Call Escalation Chain for P1 Incidents
When a P1 incident is detected via Datadog or PagerDuty:
Step 1: Primary On-Call SRE Engineer acknowledges the alert within 5 minutes.
Step 2: If unacknowledged within 10 minutes, PagerDuty automatically escalates to Secondary On-Call SRE and Lead Engineering Manager.
Step 3: Incident Commander creates a dedicated Slack war room (#inc-p1-YYYYMMDD) and initiates an automated status page update at status.platform.com.
Step 4: Post-Mortem Blameless RCA (Root Cause Analysis) document must be published to Notion within 48 hours of incident resolution.
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What is our target uptime SLA and when are scheduled maintenance windows allowed?"*
- *"What are the target response and resolution times for a Severity 1 (P1) incident?"*
- *"How quickly must a post-mortem RCA document be published after a P1 incident is resolved?"*
