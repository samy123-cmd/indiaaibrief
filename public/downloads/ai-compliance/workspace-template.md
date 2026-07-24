# AI Compliance Workspace Template
**IndiaAIBrief · Duplicate into Notion, Linear, or Google Sheets**

Use three boards. Keep them short. Update weekly until your first enterprise pilot.

---

## Board 1 — Data inventory

| ID | Dataset | Personal? | Purpose | System of record | Retention | Deletion owner | Status |
|----|---------|-----------|---------|------------------|-----------|----------------|--------|
| D1 | | Yes/No | | | | | Open / Done |
| D2 | | | | | | | |
| D3 | | | | | | | |

**Definition of Done:** every personal dataset has purpose + retention + owner.

---

## Board 2 — Vendor diligence

| Vendor | Role (LLM / hosting / analytics) | Region | Sees PII? | DPA on file? | Deletion SLA | Score 1–5 | Owner | Next review |
|--------|----------------------------------|--------|-----------|--------------|--------------|-----------|-------|-------------|
| | | | | | | | | |
| | | | | | | | | |

**Definition of Done:** primary LLM + cloud + logging vendors scored; DPA flags green or mitigated.

---

## Board 3 — Escalation & oversight

| Workflow | Risk tier | Auto decision? | Human role | Override SLA | Log location | On-call | Last drill |
|----------|-----------|----------------|------------|--------------|--------------|---------|------------|
| | High/Limited/Minimal | Yes/No | | | | | |
| | | | | | | | |

**Definition of Done:** every High workflow has override + log path; on-call named.

---

## Weekly ritual (30 minutes)

1. Close or assign any Open rows in Board 1
2. Re-score any vendor that changed region or pricing
3. Pick one High workflow and verify a sample log line exists
4. Update the one-page risk memo if the product changed

---

## One-page risk memo (paste into Docs)

**Product:**  
**Customer segment:**  
**AI workflows:**  
**Data types:**  
**Risk tier(s):**  
**Human oversight:**  
**Hosting / vendors:**  
**Known gaps / mitigations:**  
**Contact:**  

---

— IndiaAIBrief · Duplicate freely for internal use with kit license
