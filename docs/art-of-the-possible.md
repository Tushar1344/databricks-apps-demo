# Art of the Possible — 3 canonical Databricks App examples

Databricks is a data + AI native application platform: Unity Catalog as the single
source of governed truth, Model Serving for AI, Lakeflow Jobs for durable execution,
Genie for conversational analytics, and Lakebase for low-latency app state. This
document proposes **three canonical apps** that demonstrate the art of the possible
on that platform.

The hard part of a "showcase" is restraint. It is tempting to cram every capability
into every app, but then the *pattern* a customer is meant to take away gets lost in
the feature list. So this spec follows three rules:

1. **Each app has exactly one anchor pattern** (plus one or two supporting patterns),
   and an explicit list of what it **deliberately omits**. The omissions are the point:
   they keep each demo legible.
2. **Writeback and human-in-the-loop (HITL) are cross-cutting principles**, shown
   *inside* all three apps rather than as standalone demos.
3. **Genie is always a capability inside a workflow**, never a standalone "chat with
   your data" app — matching how analytical drill-down actually shows up in real work.

We also drop the "Enterprise Decision Fabric / custom-MCP-hub" concept from the
original brief: it overlaps with platform governance tooling on the near-term roadmap.
Headless operation and tool-hosting (MCP) get a single honest sentence per app, with
no governance framing.

The three apps sit along a deliberate **app-shape spectrum**:

| | App 1 | App 2 | App 3 |
|---|---|---|---|
| **Shape** | constrained agent in a workflow | fully agentic, goal-seeking | human workflow with agent assist |
| **Who drives** | rules drive; agent assists on exception; human approves | agent drives; human sets goal & approves | humans drive every transition; agent assists |
| **Vertical** | supply chain / logistics | retail / CPG | financial services |

The three anchors are **MECE on purpose**. *Mutually exclusive:* each app owns exactly
one distinct pattern, and the "deliberately omits" lists are the boundaries that keep
them from blurring into each other. *Collectively exhaustive:* together they span the
capability space in the coverage matrix below, where every capability has a single
**primary** owner. No app is a feature dump, and no pattern is homeless.

**The verticals are just flavor.** Supply chain, retail, and financial services are
illustrative skins chosen to make each demo concrete — the underlying patterns are
deliberately simple enough to generalize. Each app section ends with a *"Generalizes to"*
line showing the same shape in other domains.

---

## App 1 — Real-Time Operations Watchtower

> *Vertical: supply chain / logistics*

**Anchor pattern:** real-time monitoring & alerting → a *constrained* agent engaged
only when deterministic rules fail → human approval before anything with real-world
cost is executed.

This is the most tightly leashed of the three apps. Most of the time it is not "AI" at
all — it is streaming telemetry and threshold rules. The agent only wakes up when a
rule or anomaly model fires, and even then it is bounded: it explains, proposes a
*small* set of remediations, and stops. A human approves anything expensive.

### Flow

1. **Monitor** — Structured Streaming / DLT pipelines ingest live signals (shipment
   ETAs, warehouse throughput, carrier feeds, IoT temperature). Lakehouse Monitoring
   tracks metrics against expectations.
2. **Alert** — a deterministic rule or anomaly model breaches threshold (e.g. a
   refrigerated lane is trending toward a temperature excursion; a DC is falling behind
   SLA). This is the trigger — not a human asking a question.
3. **Explain** — the agent drills into root cause using **Genie** against the governed
   operational tables ("which carrier, which lane, since when, correlated with what").
   Genie's reasoning is surfaced to the operator, not hidden.
4. **Simulate** — the agent proposes **a few bounded remediation options** (reroute via
   carrier B; expedite a partial shipment; hold and re-cool), each with predicted cost,
   ETA impact, and confidence. *Bounded* is deliberate — this is not open-ended
   optimization.
5. **Approve (HITL)** — if projected cost or customer impact exceeds policy, the action
   pauses for human approval. Below the threshold, it can auto-execute. The policy line
   is explicit and visible.
6. **Execute** — an approved remediation runs as a **Lakeflow Job** (book the carrier,
   dispatch the work order).
7. **Learn** — the **actual** outcome is written back as ground truth: did the reroute
   land on time, what did it really cost. This feeds both the anomaly models and the
   operator's trust in future suggestions.

### What it shows
Real-time ingestion + alerting engine; a constrained agent that only acts on exception;
a clean agent↔human handoff at a policy boundary; Genie used for root-cause reasoning
*within* the incident; writeback of real outcomes as ground truth.

### What it deliberately omits
Full autonomy (the agent never freely acts above the policy line); multi-user lifecycle
/ finite-state machine (this is single-operator); full scenario optimization (only a few
bounded options, not a solver sweeping a space).

### Databricks mapping
Structured Streaming / DLT (ingest), Lakehouse Monitoring + alerts (detection), Genie
Space (root cause), Model Serving (anomaly / ETA forecast endpoints), Lakeflow Jobs
(execution), Unity Catalog (governed operational data), Lakebase (incident state +
writeback), Databricks App UI (the watchtower).

### Writeback & HITL specifics
- **Writeback:** every incident persists the alert, the agent's explanation, the
  options it weighed, the human's decision, and the *measured* outcome vs. prediction.
- **HITL:** the policy threshold (cost / customer-impact) is the explicit approval
  boundary; everything above it stops for a human.

*Headless note:* the same monitoring + remediation logic can run unattended (auto-approve
below threshold) or expose its "explain incident" tool to another app.

*Generalizes to:* the constrained-agent-on-exception + real-time shape is the same in
fraud operations, network / SRE incident response, and energy-grid monitoring — only the
signals and remediations change.

---

## App 2 — Autonomous Margin Optimizer

> *Vertical: retail / CPG*

**Anchor pattern:** a fully agentic, goal-seeking app that runs the
**predict → simulate → optimize** loop under business constraints and uncertainty.

Where App 1 keeps the agent on a short leash, this app hands it the wheel. A human sets
a *goal* and *guardrails*; the agent does the analytical work end to end and comes back
with a recommended plan. The human's job moves from "do the analysis" to "set the
objective and approve the customer-facing result."

### Flow

1. **Set goal (human)** — e.g. *"+150 bps gross margin this quarter, protect total
   revenue and customer-experience scores."* Constraints are explicit: price-change
   ceilings, brand floors, inventory limits.
2. **Explore** — the agent uses **Genie** + the semantic layer to find where margin is
   leaking and which categories are elastic enough to move.
3. **Predict** — call **Model Serving** forecast endpoints for demand, price elasticity,
   and churn risk per segment.
4. **Simulate** — generate *many* candidate scenarios (price / promo / inventory mixes),
   running them as **Lakeflow Jobs** so the sweep scales.
5. **Optimize** — select the plan that maximizes expected margin **subject to** the
   constraints and within an acknowledged uncertainty band.
6. **Approve (HITL)** — because the output is customer-facing pricing, a human approves
   (or edits) before anything goes live.
7. **Monitor / Learn** — track **actual** lift against the prediction; write the realized
   outcome back as ground truth and into **agent memory**, so the next run starts smarter.

### What it shows
Full agency: the agent plans, calls tools, and uses memory across runs; the complete
predict-simulate-optimize loop under constraints and uncertainty; Genie reasoning during
exploration; HITL on the customer-facing decision; writeback of realized lift.

### What it deliberately omits
Real-time streaming entry (this runs periodic / batch — there is no live event firing
it); multi-user finite-state machine (one analyst-owner per goal, not a role relay).

### Databricks mapping
Genie Space + Unity Catalog semantic layer (explore), SQL Warehouse (analytics), Model
Serving (forecast endpoints), Lakeflow Jobs (scenario sweeps), MLflow traces
(observability of the agent's runs), agent memory in Lakebase / Delta, Databricks App
cockpit (goal-setting + plan review).

### Writeback & HITL specifics
- **Writeback:** the goal, the scenarios considered, the chosen plan with its rationale,
  and the **measured** lift vs. forecast all persist — plus agent memory that carries
  learnings between runs.
- **HITL:** approval gate on customer-facing prices; the human can accept, edit, or
  reject the recommended plan.

*Headless note:* the optimizer can run on a schedule and hand its recommended plan to a
pricing system via API, with the approval step enforced or waived by policy.

*Generalizes to:* the goal-seeking predict→simulate→optimize loop is the same in
marketing-spend allocation, supply / inventory allocation, and yield / revenue
management — only the objective and constraints change.

---

## App 3 — Customer Onboarding & KYC Desk

> *Vertical: financial services*

**Anchor pattern:** a **multi-user finite-state machine**. The onboarding lifecycle moves
through stages owned by *different roles*, where each transition has required
inputs/outputs that gate it. Agents **assist** at every stage (extract, pre-screen,
draft) but **humans drive the transitions** — appropriate for a regulated, auditable
process.

This is the human-workflow end of the spectrum. The "intelligence" is in the structure:
who can move the case forward, what evidence is required to do so, and a complete record
of who did what and why.

### States (and who owns each)

1. **Application submitted** — *customer / relationship manager.* Application captured;
   case opened.
2. **Document & identity verification** — *operations analyst.* The agent extracts and
   validates documents (ID, proof of address) via Model Serving; the analyst confirms or
   rejects.
3. **Risk & compliance review** — *compliance officer.* The agent pre-screens against
   sanctions / PEP lists and drafts a risk summary; the officer reviews and adds
   judgment.
4. **Approval / escalation** — *approver.* HITL decision: approve, escalate, or
   **loop back to "need more info"** (an explicit backward transition to an earlier
   state).
5. **Activation** — *system.* A **Lakeflow Job** provisions the account.

Each state carries an **SLA timer** — a light real-time tie-in that flags cases aging
past their target without making the whole app streaming-driven.

### What it shows
A genuine multi-user FSM with role-based handoffs and gated transitions; **writeback as a
first-class citizen** — comments, decisions, risks, next steps, recommendations, ground
truth, and a full audit trail of who did what when; agent-as-assistant (never
autonomous); Genie for light analyst lookups during review.

### What it deliberately omits
Autonomous goal-seeking (humans drive every transition); scenario optimization; heavy
real-time (SLA timers only, not a streaming engine).

### Databricks mapping
Lakebase (the state machine + decision memory + audit log), Unity Catalog (governed
customer data with row/column controls), Genie (analyst lookups), Model Serving (document
extraction + risk scoring), Lakeflow Jobs (provisioning on activation), Databricks App UI
with **role-based views** (each role sees its queue and permitted actions).

### Writeback & HITL specifics
- **Writeback:** this app is *mostly* writeback. Every transition records the actor,
  timestamp, inputs reviewed, the agent's draft, the human's decision and comments,
  flagged risks, and required next steps — a complete, queryable audit trail.
- **HITL:** every forward transition is a human action; the approval state can loop the
  case backward when evidence is insufficient.

*Headless note:* the same state machine can expose transition actions as tools so an
upstream system (or another app) can submit applications or query case status.

*Generalizes to:* the multi-user FSM with agent-assist is the same shape in claims
adjudication, loan underwriting, and clinical / patient intake — only the states, roles,
and gating evidence change.

---

## Cross-cutting principles

These appear in all three apps by design, which is why none of them is its own demo:

- **Writeback / decision memory.** Every app persists context, comments, feedback,
  decisions, risks, next steps, recommendations, and **ground truth** (predicted vs.
  actual). This is what turns a demo into a system that gets better over time.
- **Human-in-the-loop.** Each app has at least one explicit approval / handoff boundary,
  and that boundary is *visible* — a policy threshold (App 1), a customer-facing gate
  (App 2), or every transition (App 3).
- **Genie inside workflows.** Analytical drill-down always happens within a task, never
  as a standalone "ask the database" app.
- **Data + AI native foundation.** Unity Catalog is the single source of truth, Model
  Serving is the AI layer, Lakeflow Jobs are durable execution, and Lakebase is app
  state. The same primitives recur in all three.
- **App-shape spectrum.** Constrained-agent → fully-agentic → human-workflow-with-assist.
  Any of these can also run **headless** or expose its capabilities as tools to another
  app.

---

## Capability coverage matrix

Mapping the six capability themes from the original brief across the three apps. Every
capability has at least one owner, and each anchor pattern is **primary** in exactly one
app — no two apps claim the same anchor, and nothing is orphaned.

| Capability (from brief) | App 1 — Watchtower | App 2 — Optimizer | App 3 — KYC Desk |
|---|---|---|---|
| Constrained agent in workflow | **primary** | — | — |
| Fully agentic goal-seeking | — | **primary** | — |
| Agent-assist in human workflow / handoff | ✓ (approval) | ✓ (approval) | **primary** |
| Genie analytical reasoning / drill-down | ✓ | ✓ | ✓ (light) |
| Predict / simulate / optimize | ✓ (bounded) | **primary** | — |
| Writeback (decisions, ground truth, …) | ✓ | ✓ | **primary** |
| Real-time monitoring & alerting | **primary** | — | ✓ (SLA timers) |
| Multi-user FSM lifecycle | — | — | **primary** |
| Headless / custom MCP | one-line note across all three apps | | |

---

## Prototype impact (out of scope)

The existing React prototype in this repo is **not modified** by this spec. This document
is a standalone, shareable concept. It is written so that it *could* drive a rebuild of
the prototype — each app's flow/states map directly onto a step-through with a decision
ledger and a collapsible architecture view — but that rebuild is a possible follow-up,
not part of this deliverable.
