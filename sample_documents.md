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

---

## 📄 Document 4: Real-Time Vector Data Pipeline & HNSW Indexing Strategy

**Title**: `Vector Data Pipeline & Indexing Strategy`  
**Filename**: `vector_pipeline_indexing_spec.txt`  
**Tags**: `vector, pgvector, rag, indexing, data_pipeline`  

### Content to Copy into Knowledge Base:
```text
REAL-TIME VECTOR DATA PIPELINE & HNSW INDEXING SPECIFICATION

1. Ingestion Pipeline & Chunking Strategy
Incoming unstructured documents (PDF, DOCX, Markdown) pass through Apache Kafka topic 'doc-ingestion-events'. Documents are split using RecursiveCharacterTextSplitter with a target chunk size of 500 tokens and 50 token overlap. Text chunks are normalized to UTF-8 and sanitized of control characters before embedding generation.

2. Vector Embedding Generation
Each chunk is embedded using Google Gemini text-embedding-004 model, outputting 768-dimensional floating point vectors. Embeddings are stored in PostgreSQL using pgvector data type column `embedding vector(768)`.

3. HNSW Index Optimization
To ensure sub-50ms vector search latency across 10,000,000+ vector chunks, PostgreSQL tables utilize Hierarchical Navigable Small World (HNSW) indexes:
CREATE INDEX idx_document_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
The runtime search parameter `hnsw.ef_search` is configured to 40 in PostgreSQL connection pool defaults.

4. Garbage Collection & Index Maintenance
Deleted documents issue a soft-delete event in Redis cache. Physical deletion of vector rows occurs during nightly batch cleanup at 02:00 UTC. REINDEX INDEX CONCURRENTLY is executed weekly to prevent index bloat.
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What chunk size and overlap are used by the RecursiveCharacterTextSplitter?"*
- *"What are the HNSW index parameters configured for vector search in PostgreSQL?"*
- *"When does physical deletion of soft-deleted vector rows take place?"*

---

## 📄 Document 5: Enterprise AI Safety, Ethics & PII Governance Guidelines

**Title**: `Enterprise AI Safety & PII Governance`  
**Filename**: `ai_safety_governance_2026.txt`  
**Tags**: `ai, safety, ethics, pii, governance`  

### Content to Copy into Knowledge Base:
```text
ENTERPRISE AI SAFETY, ETHICS & PII GOVERNANCE GUIDELINES (2026)

Section 1: Automatic PII Redaction
All user prompts entering LLM processing pipelines must pass through the Microsoft Presidio PII Anonymizer filter. Social Security Numbers (SSN), Credit Card Numbers (PAN), and Personal Identity Cards are masked with token placeholders (e.g., [REDACTED_SSN]) before transmitting queries to external LLM provider APIs (Gemini, OpenAI).

Section 2: Hallucination & Factuality Checks
LLM responses produced by RAG workflows must undergo grounding checks. Answers must include direct citations linking back to indexed document chunks (`metadata.documentId`). If the confidence score of retrieved context falls below 0.65 cosine similarity, the AI agent must respond with: "I could not find sufficient verified context in company documentation to answer your question."

Section 3: Content Moderation & Safety Filters
System prompts enforce strict guardrails blocking unsafe inputs. Any user attempt to perform prompt injection, jailbreaking, or request toxic content triggers an immediate audit log entry in Datadog Security Signals and terminates the chat session.

Section 4: Audit Logging & Model Transparency
All LLM inputs, prompt templates, retrieved document chunks, and model responses are logged to LangSmith for observability. Retention period for LangSmith telemetry data is set to 90 days for compliance audits.
```

### 💡 Sample Questions to Ask the AI Agent:
- *"How does the system handle PII like Social Security Numbers before sending prompts to external APIs?"*
- *"What similarity score threshold is required for RAG grounding before the agent declines to answer?"*
- *"How long is LangSmith telemetry data retained for compliance audits?"*

---

## 📄 Document 6: Public Developer API Rate Limiting & Authentication Protocol

**Title**: `Developer API Authentication & Rate Limiting`  
**Filename**: `api_developer_protocol.txt`  
**Tags**: `api, developer, security, auth, gateway`  

### Content to Copy into Knowledge Base:
```text
PUBLIC DEVELOPER API AUTHENTICATION & RATE LIMITING PROTOCOL

1. API Key Provisioning & Authentication
External developers must authenticate via API Key passed in the HTTP request header `X-API-Key` or via OAuth 2.0 Client Credentials flow. API keys are generated via Developer Portal and hashed in PostgreSQL using Argon2id (memory parameter 64MB, 3 iterations).

2. Tiered Rate Limiting & Quotas
- Free Tier: Limited to 100 requests per hour (RPH) and 1,000 requests per day. Burst limit: 5 requests per second.
- Pro Tier: Limited to 5,000 requests per hour and 50,000 requests per day. Burst limit: 25 requests per second.
- Enterprise Tier: Dedicated custom quota up to 100,000 requests per hour with 99.99% uptime guarantee.

3. Error Codes & Rate Limit Headers
When rate limits are exceeded, the API Gateway returns HTTP 429 Too Many Requests with the following response headers:
- `X-RateLimit-Limit`: Maximum allowed requests in current window
- `X-RateLimit-Remaining`: Remaining request quota in current window
- `X-RateLimit-Reset`: Unix timestamp when quota resets
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What hashing algorithm is used to store API keys in PostgreSQL?"*
- *"What are the request limits for the Pro Tier accounts?"*
- *"Which HTTP headers are returned when a developer exceeds their rate limit?"*

---

## 📄 Document 7: Multi-Region Disaster Recovery & Database Failover Runbook

**Title**: `Multi-Region DR & Database Failover Runbook`  
**Filename**: `disaster_recovery_runbook.txt`  
**Tags**: `devops, dr, postgresql, failover, aws`  

### Content to Copy into Knowledge Base:
```text
MULTI-REGION DISASTER RECOVERY & DATABASE FAILOVER RUNBOOK

1. Disaster Recovery Objectives
- Recovery Time Objective (RTO): < 15 minutes for complete regional failover.
- Recovery Point Objective (RPO): < 30 seconds data loss for asynchronous PostgreSQL replication.

2. Architecture Overview
Primary region resides in AWS us-east-1 (N. Virginia), with standby hot-dr region in AWS us-west-2 (Oregon). PostgreSQL database utilizes AWS Aurora Global Database with cross-region read replicas.

3. Automatic Failover Trigger Criteria
AWS Route 53 Health Checks perform HTTP ping tests every 10 seconds against /healthz endpoint. If primary region fails 3 consecutive health checks (30 seconds total outage), Route 53 DNS automatically reroutes traffic to the standby region in us-west-2.

4. Post-Failover Reconciliation Procedure
Once failover completes:
1. Promote Aurora us-west-2 read replica to primary writer node using AWS CLI.
2. Invalidate Cloudflare CDN edge cache across all global zones.
3. Run automated integrity check script `npm run db:verify-replication` to confirm vector index integrity.
```

### 💡 Sample Questions to Ask the AI Agent:
- *"What are our target RTO and RPO metrics for multi-region disaster recovery?"*
- *"Which AWS regions serve as primary and standby hot-dr locations?"*
- *"How many consecutive failed health checks trigger automatic DNS rerouting in Route 53?"*
