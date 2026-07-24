# AI Compliance Checklist — 47 controls
**IndiaAIBrief · For Indian MSMEs before BFSI / health / government AI pilots**

Mark each item Done / Partial / N/A. Partial without an owner is Fail.

---

## A. Data & DPDP (1–12)

1. [ ] All datasets used for training, fine-tuning, RAG, or eval are inventoried
2. [ ] Personal vs non-personal data labelled per dataset
3. [ ] Purpose documented for each personal dataset
4. [ ] Lawful ground noted (consent / contract / legitimate use as applicable)
5. [ ] Notice language covers AI processing where required
6. [ ] Retention period defined per dataset
7. [ ] Deletion / anonymisation procedure exists and is tested once
8. [ ] Deletion owner named (role + backup)
9. [ ] Prompt / debug logs classified (may contain PII)
10. [ ] Cross-border processors listed with country
11. [ ] DPA / contract clauses on file for those processors
12. [ ] Data subject request path documented (access / correction / erasure)

## B. Governance & risk (13–24)

13. [ ] Top customer-facing AI workflows listed
14. [ ] Each workflow assigned a risk tier (unacceptable / high / limited / minimal)
15. [ ] No unacceptable-tier workflow in production
16. [ ] High-tier workflows have a human override path
17. [ ] Override SLA defined (e.g. 4 business hours)
18. [ ] Model / prompt version recorded per production release
19. [ ] Immutable decision logs for high-tier outcomes
20. [ ] Log fields include model version, input hash, output, reviewer, timestamp
21. [ ] User-facing disclosure when interacting with AI (where material)
22. [ ] Escalation owner for AI incidents named
23. [ ] Incident customer-notice target ≤ 72 hours
24. [ ] India hosting decision documented for regulated buyers

## C. Vendors & hosting (25–34)

25. [ ] Subprocessor list current (last reviewed date on file)
26. [ ] Primary LLM / API vendor security questionnaire completed
27. [ ] Cloud region(s) for inference and storage documented
28. [ ] Deletion / export SLA from vendor in writing
29. [ ] Vendor support hours compatible with India business day
30. [ ] Keys rotated; no keys in client apps or public repos
31. [ ] Separate prod / staging keys
32. [ ] Rate limits and spend caps configured
33. [ ] Backup vendor or degrade path for outages
34. [ ] Contractual audit / evidence access path known

## D. Product & RFP pack (35–47)

35. [ ] One-page risk memo drafted for the flagship AI feature
36. [ ] Logging policy appendix (1–2 pages) ready to attach
37. [ ] Data map excerpt suitable for customer sharing
38. [ ] Subprocessor table exportable to PDF
39. [ ] Sample RFP answers for “human oversight”
40. [ ] Sample RFP answers for “training on customer data” (yes/no + controls)
41. [ ] Red-team or abuse cases listed for the chatbot / agent
42. [ ] Jailbreak / prompt-injection mitigations noted
43. [ ] Evaluation set excludes production personal data (or is approved)
44. [ ] Accessibility / language coverage noted for Indian users if consumer-facing
45. [ ] Internal training: eng + support know the escalation path
46. [ ] Quarterly review date scheduled for this checklist
47. [ ] Counsel engaged for any regulated vertical deal (if applicable)

---

**Score:** Done ___ / 47 · Partial ___ · N/A ___  
**Reviewer:** _______________ **Date:** _______________

— IndiaAIBrief AI Compliance Starter Kit
