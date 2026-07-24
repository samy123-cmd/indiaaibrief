# AI Compliance Playbook for Indian MSMEs
**IndiaAIBrief · AI Compliance Starter Kit**  
Version 1.0 · Practical hygiene, not legal advice

---

## Direct answer

Indian MSMEs shipping AI (chatbots, OCR, lead scoring, copilots) need three artefacts before a BFSI, health, or government pilot: (1) a data purpose map under DPDP, (2) a risk tier + human oversight path for high-impact decisions, and (3) a vendor / hosting memo buyers can attach to an RFP. This playbook is the shortest path to those three.

---

## Who this is for

- Founders and CTOs at Indian product companies under ~₹50L ARR selling AI features
- MSMEs adding AI to existing SaaS without a full-time compliance hire
- Teams answering enterprise security questionnaires for the first time

**Not for:** regulated banks building models in-house, law firms drafting opinions, or EU AI Act conformity assessments.

---

## 1. The India-first stack of questions

Answer these before you fine-tune anything:

1. What personal data touches training, prompts, logs, or RAG indexes?
2. What is the purpose of each dataset (and is that purpose documented)?
3. Where does inference run (India region / overseas / hybrid)?
4. Which decisions can materially affect a person (credit, hiring, health, benefits)?
5. Who can override the model, and how is that logged?
6. Which subprocessors see Indian personal data?
7. What do you delete when a user exercises rights under DPDP?

If you cannot answer 1–7 in one sitting, stop shipping and finish the checklist first.

---

## 2. DPDP-aware data practices (minimum bar)

### 2.1 Inventory
Maintain a living table:

| Dataset | Source | Personal? | Purpose | Retention | Deletion owner |
|---------|--------|-----------|---------|-----------|----------------|
| Support tickets | Zendesk export | Yes | Fine-tune support bot | 12 months | CTO |
| Call transcripts | CRM | Yes | QA scoring | 90 days | Ops |

### 2.2 Purpose limitation
Do not reuse customer support transcripts for marketing models without a fresh purpose record and, where required, notice/consent path.

### 2.3 Cross-border
List every vendor that stores or processes personal data outside India. Attach DPA language and a short “why this vendor” note for enterprise buyers.

### 2.4 Logs
Separate: (a) product analytics, (b) model debug logs, (c) security audit logs. Debug logs often contain prompts with PII — treat them as personal data.

---

## 3. Risk tiers (buyer language)

Enterprise RFPs in India increasingly copy MeitY-style language. Use a simple four-tier map for **workflows**, not models:

| Tier | Example | Controls |
|------|---------|----------|
| Unacceptable | Fully automated denial of essential services with no appeal | Do not ship |
| High | Credit limit suggestion, triage that delays care | Human review, immutable logs, documented override |
| Limited | Chatbot answering product FAQs with citations | Disclosure, feedback button, escalation path |
| Minimal | Internal code autocomplete on non-customer data | Standard SDLC |

Write the tier on the product one-pager. Buyers notice when you cannot.

---

## 4. Human oversight pattern

For every high-tier workflow:

1. **Trigger** — when the model score / decision fires
2. **Queue** — who sees it (role, SLA)
3. **Override** — how they change the outcome
4. **Record** — model version, input hash, output, reviewer ID, timestamp
5. **Appeal** — how the end user contests the decision (if consumer-facing)

Copy-ready log fields: `model_version`, `prompt_hash`, `output_hash`, `reviewer_id`, `decision`, `ts_utc`.

---

## 5. Vendor diligence (Indian SaaS reality)

Before you paste an OpenAI / Anthropic / cloud key into production:

- [ ] Subprocessor list published to customers on request
- [ ] Data residency option documented (even if “not available — mitigation = …”)
- [ ] Deletion / export SLA in writing
- [ ] Security questionnaire completed once and versioned
- [ ] Incident contact + 72h customer notice plan

Score vendors 1–5 on: residency, deletion, audit access, India support hours, price predictability.

---

## 6. RFP response pack (what wins deals)

Keep a folder with:

1. One-page risk memo (product, tier, data types, oversight)
2. Logging policy appendix (fields + retention)
3. Data map excerpt (no secrets)
4. Subprocessor table
5. Escalation owner name + email

Do not send a 40-slide “AI ethics” deck. Send the five artefacts above.

---

## 7. 30-day implementation sequence

**Week 1** — Inventory datasets + vendors; assign deletion owners.  
**Week 2** — Tier your top three customer-facing workflows; add override paths.  
**Week 3** — Standardise log fields; turn off PII in debug by default.  
**Week 4** — Assemble RFP pack; dry-run a fake BFSI questionnaire.

---

## 8. Contrarian note

Most Indian MSMEs fail RFPs because of **missing artefacts**, not missing model accuracy. A mediocre model with a clean data map and oversight path beats a better model with “we take privacy seriously” on slide 12.

---

## 9. Templates included in this kit

- `ai-compliance-checklist.md` — 47 controls to walk before a pilot
- `workspace-template.md` — boards for inventory, vendors, escalations (import into Notion / Linear / Sheets)

---

## Disclaimer

This playbook is operational guidance for Indian MSMEs. It is not legal advice and does not replace counsel for regulated deals, cross-border transfers, or sectoral law (RBI, IRDAI, CDSCO, etc.).

— IndiaAIBrief · indiaaibrief.com
