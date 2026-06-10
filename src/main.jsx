import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Database,
  GitBranch,
  Layers3,
  Network,
  Pause,
  Play,
  Radar,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Tooltip,
} from "recharts";
import "./styles.css";

const layerMeta = {
  user: {
    label: "User",
    short: "people, approvals, workflow UI",
    owns: "Decisions, approvals, and the human-in-the-loop surface.",
    colorClass: "layer-user",
    icon: UserRoundCheck,
  },
  logic: {
    label: "Logic",
    short: "agents, policies, workflows, simulation",
    owns: "What an action means, which policy fires, and how the plan is chosen.",
    colorClass: "layer-logic",
    icon: BrainCircuit,
  },
  data: {
    label: "Data",
    short: "tables, features, vectors, writeback",
    owns: "The durable truth — records written back and learned from.",
    colorClass: "layer-data",
    icon: Database,
  },
  infra: {
    label: "Infra",
    short: "Databricks Apps, Jobs, Model Serving, MCP",
    owns: "Durable execution: Jobs, SQL Warehouse, Model Serving, MCP.",
    colorClass: "layer-infra",
    icon: ServerCog,
  },
};

const layerOrder = ["user", "logic", "data", "infra"];

const demos = [
  {
    id: "ops",
    eyebrow: "App 01",
    title: "Real-Time Operations Watchtower",
    subtitle: "Monitor live, alert on breach, explain it, simulate bounded fixes, route approval, execute, and learn.",
    goal: "Catch customer-impacting failures before they breach SLA.",
    mode: "Constrained agent inside a real-time workflow",
    accent: "ops",
    metricLabel: "SLA risk avoided",
    metricValue: "$220K",
    status: "Approval required",
    agent: "Watchtower agent",
    users: "Operations managers, supply-chain analysts, on-call leads",
    interaction: "Watch live risk, open an incident, review the agent's bounded options, approve or reject the fix.",
    services: ["Structured Streaming", "Lakehouse Monitoring", "Genie", "Model Serving", "Lakeflow Jobs", "Unity Catalog", "Lakebase"],
    cards: [
      { layer: "user", title: "Ops command center", body: "Triage queue, case owner, approval panel, customer comms draft." },
      { layer: "logic", title: "Exception workflow", body: "Detect → classify → root-cause → simulate → approve → execute → verify." },
      { layer: "data", title: "Streaming + warehouse data", body: "Orders, telemetry, carrier events, inventory, customer priority, history." },
      { layer: "infra", title: "Databricks resources", body: "Apps UI, Lakeflow Jobs, SQL Warehouse, Model Serving, Genie, Lakebase." },
    ],
    steps: [
      { label: "Monitor", layer: "data", actor: "Streaming pipeline", detail: "Structured Streaming tracks lane temperature, ETAs, and DC throughput against expected bands.", writes: ["stream_offset", "metric", "expected_band"] },
      { label: "Alert", layer: "data", actor: "Monitoring rule", detail: "A refrigerated Northeast lane breaches its SLA-risk threshold — the trigger fires automatically, no human asked.", writes: ["alert_id", "entity", "severity", "detected_at"], event: { type: "alert", from: "Lakehouse Monitoring", body: "Refrigerated Northeast lane crossed its SLA-risk threshold. No human asked — the rule fired on its own." } },
      { label: "Explain", layer: "logic", actor: "Agent · Genie", detail: "The constrained agent drills in via Genie: late inbound inventory and a carrier delay are the dominant causes.", writes: ["root_cause", "confidence", "supporting_queries"] },
      { label: "Simulate", layer: "logic", actor: "Agent", detail: "Agent proposes three bounded options — expedite, reroute, split shipment — each with cost, ETA gain, and risk.", writes: ["scenario_id", "expected_cost", "expected_sla_gain", "risk"], event: { type: "ask", from: "Watchtower agent", body: "I found three bounded fixes — expedite, reroute, or split shipment. Reroute gives the best ETA gain within budget. Want me to prep it for approval?" } },
      { label: "Approve", layer: "user", actor: "Human · ops manager", detail: "Expedite cost exceeds policy, so the action pauses for human approval before anything executes.", writes: ["approval_request", "approver", "rationale"], event: { type: "approval", from: "Watchtower agent", body: "The reroute plan is ready, but its cost exceeds policy. Approve and I'll execute it through a Lakeflow Job." } },
      { label: "Execute", layer: "infra", actor: "System · Lakeflow Job", detail: "A Lakeflow Job pushes the approved reroute plan to fulfillment and carrier systems.", writes: ["job_run_id", "action_payload", "idempotency_key"] },
      { label: "Learn", layer: "data", actor: "System · writeback", detail: "Actual outcome and the approver's comments become ground truth for the next model cycle.", writes: ["actual_sla", "business_impact", "ground_truth_label"] },
    ],
    scenario: {
      title: "Resolution simulator",
      sliders: [
        { key: "expedite", label: "Expedite budget", min: 0, max: 100, value: 40, suffix: "%" },
        { key: "reroute", label: "Reroute aggressiveness", min: 0, max: 100, value: 65, suffix: "%" },
        { key: "manual", label: "Manual review strictness", min: 0, max: 100, value: 50, suffix: "%" },
      ],
      formula: (v) => ({
        outcome: Math.round(48 + v.expedite * 0.18 + v.reroute * 0.32 - v.manual * 0.04),
        risk: Math.max(4, Math.round(38 - v.manual * 0.18 - v.reroute * 0.06)),
        cost: Math.round(12 + v.expedite * 0.45 + v.reroute * 0.22),
      }),
      labels: { outcome: "SLA recovery", risk: "residual risk", cost: "incremental cost" },
    },
    sessions: ["Lane NE-12", "Lane SW-04", "DC Atlanta", "DC Reno", "Order #88213", "Order #90455"],
    graph: [
      ["Streaming events", "Delta tables", "data"],
      ["Genie root cause", "Constrained agent", "logic"],
      ["Scenario simulator", "Policy gate", "logic"],
      ["Approval packet", "Ops manager", "user"],
      ["Lakeflow job", "External systems", "infra"],
    ],
  },
  {
    id: "optimizer",
    eyebrow: "App 02",
    title: "Autonomous Margin Optimizer",
    subtitle: "A goal-seeking app that explores data, forecasts, simulates, optimizes, and asks humans to decide.",
    goal: "Recover margin while protecting revenue, inventory health, and CX.",
    mode: "Fully agentic, goal-seeking app with approval boundaries",
    accent: "optimizer",
    metricLabel: "Expected margin lift",
    metricValue: "+143 bps",
    status: "Scenario review",
    agent: "Margin agent",
    users: "Category managers, pricing & revenue teams, finance approvers",
    interaction: "Set a margin goal and guardrails, review the agent's recommended plan, approve before any price changes.",
    services: ["Genie", "SQL Warehouse", "Model Serving", "Lakeflow Jobs", "MLflow", "Unity Catalog", "Lakebase"],
    cards: [
      { layer: "user", title: "Planning cockpit", body: "VP goal, category-manager review, finance/legal approvals, launch decision." },
      { layer: "logic", title: "Goal-seeking agent", body: "Hypothesize → query → forecast → simulate → optimize → recommend → monitor." },
      { layer: "data", title: "Business semantic layer", body: "Sales, margin, elasticity, inventory, cohorts, promo calendar, constraints." },
      { layer: "infra", title: "Databricks resources", body: "Genie, SQL Warehouse, Model Serving, Jobs, MLflow traces, Lakebase ledger." },
    ],
    steps: [
      { label: "Set goal", layer: "user", actor: "Human · VP", detail: "Business owner sets the target: recover 150 bps of gross margin this quarter while protecting revenue and CX.", writes: ["goal", "metric", "constraints", "owner"] },
      { label: "Explore", layer: "logic", actor: "Agent · Genie", detail: "Agent uses Genie to find categories with margin leakage and enough demand resilience to move.", writes: ["hypothesis", "query_trace", "evidence"] },
      { label: "Predict", layer: "logic", actor: "Agent · Model Serving", detail: "Model Serving forecasts demand, elasticity, and churn for each candidate action.", writes: ["forecast_id", "confidence_interval", "feature_snapshot"] },
      { label: "Simulate", layer: "logic", actor: "Agent · Jobs", detail: "Agent runs many price, promo, and inventory scenarios as parallel Lakeflow Jobs.", writes: ["scenario_id", "scenario_count", "score_distribution"] },
      { label: "Optimize", layer: "logic", actor: "Agent", detail: "It selects the plan that maximizes expected margin under brand, legal, and inventory constraints.", writes: ["chosen_plan", "constraint_check", "expected_margin"], event: { type: "ask", from: "Margin agent", body: "I selected the plan that maximizes margin under your brand, legal, and inventory guardrails. Want to review it before we go to finance?" } },
      { label: "Approve", layer: "user", actor: "Human · finance", detail: "Because the plan changes customer-facing prices, a human approves, edits, or rejects it.", writes: ["approval", "comments", "risk_acceptance"], event: { type: "approval", from: "Margin agent", body: "Plan lifts margin +143 bps within guardrails and changes customer-facing prices. Approve to launch the experiment?" } },
      { label: "Monitor", layer: "data", actor: "System · writeback", detail: "Actual lift and customer response are written back as ground truth and into agent memory.", writes: ["experiment_result", "actual_lift", "lesson_learned"] },
    ],
    scenario: {
      title: "Optimization sandbox",
      sliders: [
        { key: "price", label: "Price movement", min: 0, max: 100, value: 32, suffix: "%" },
        { key: "promo", label: "Promo intensity", min: 0, max: 100, value: 54, suffix: "%" },
        { key: "inventory", label: "Inventory constraint", min: 0, max: 100, value: 68, suffix: "%" },
      ],
      formula: (v) => ({
        outcome: Math.round(70 + v.price * 0.95 + v.promo * 0.2 - Math.abs(v.inventory - 60) * 0.35),
        risk: Math.max(3, Math.round(20 + v.price * 0.21 - v.promo * 0.08 + Math.max(0, v.inventory - 70) * 0.25)),
        cost: Math.round(18 + v.promo * 0.52 + v.inventory * 0.08),
      }),
      labels: { outcome: "margin bps", risk: "customer risk", cost: "promo cost" },
    },
    sessions: ["Beverages", "Snacks", "Home & Kitchen", "Region West", "Promo Q3", "Apparel"],
    graph: [
      ["Goal memory", "Agent planner", "logic"],
      ["Genie questions", "SQL results", "data"],
      ["Forecast endpoint", "Scenario jobs", "infra"],
      ["Optimization policy", "Recommendation", "logic"],
      ["Finance approval", "Experiment launch", "user"],
    ],
  },
  {
    id: "kyc",
    eyebrow: "App 03",
    title: "Customer Onboarding & KYC Desk",
    subtitle: "A multi-user lifecycle: roles hand the case off stage by stage, agents assist, humans drive every transition.",
    goal: "Onboard a new customer correctly, compliantly, and on the clock.",
    mode: "Multi-user finite-state machine with agent assist",
    accent: "kyc",
    metricLabel: "Median time to decision",
    metricValue: "2.4 days",
    status: "Awaiting approval",
    agent: "KYC agent",
    users: "Onboarding ops analysts, compliance officers, approvers",
    interaction: "Pick up a case in your queue, review the agent's draft, then advance the state or loop it back for more info.",
    services: ["Lakebase", "Unity Catalog", "Genie", "Model Serving", "Lakeflow Jobs"],
    cards: [
      { layer: "user", title: "Role-based queues", body: "Customer/RM intake, ops-analyst queue, compliance desk, approver inbox — each role sees only its stage and permitted actions." },
      { layer: "logic", title: "FSM + agent assist", body: "A state machine gates each transition on required inputs; agents extract docs, pre-screen sanctions/PEP, and draft risk summaries." },
      { layer: "data", title: "Decision memory & audit", body: "Cases, comments, decisions, risks, recommendations, ground truth, and a full who-did-what audit trail." },
      { layer: "infra", title: "Databricks resources", body: "Lakebase (state + audit), Unity Catalog (governed customer data), Model Serving (doc extraction, risk), Lakeflow Jobs (provisioning)." },
    ],
    steps: [
      { label: "Apply", layer: "user", actor: "Human · customer / RM", detail: "Application is captured and a case opens; the SLA clock starts on the first state.", writes: ["case_id", "applicant", "product", "submitted_at"] },
      { label: "Verify docs", layer: "logic", actor: "Human · ops analyst (agent-assist)", detail: "The agent extracts and validates ID and proof of address; the ops analyst confirms or rejects to advance the case.", writes: ["doc_extract", "id_match_score", "analyst_decision"] },
      { label: "Risk review", layer: "logic", actor: "Human · compliance (agent-assist)", detail: "The agent pre-screens sanctions and PEP lists and drafts a risk summary; the compliance officer adds judgment.", writes: ["sanctions_hits", "pep_flag", "risk_summary_draft", "officer_notes"], event: { type: "ask", from: "KYC agent", body: "Pre-screen done — 0 sanctions hits and no PEP match. I've drafted a risk summary. Add your judgment before it advances?" } },
      { label: "Approve", layer: "user", actor: "Human · approver", detail: "Approver decides: approve, escalate, or loop the case back to an earlier state for more information.", writes: ["decision", "conditions", "loopback_reason", "approver"], event: { type: "approval", from: "KYC agent", body: "Case is complete and within SLA. Approve to activate the account, or loop it back for more information." } },
      { label: "Activate", layer: "infra", actor: "System · Lakeflow Job", detail: "On approval, a Lakeflow Job provisions the account and notifies the customer.", writes: ["job_run_id", "account_id", "activated_at"] },
      { label: "Audit", layer: "data", actor: "System · Lakebase", detail: "Every transition — actor, decision, comments, risks, and final ground truth — is persisted as a queryable audit trail.", writes: ["audit_trail", "ground_truth", "cycle_time"] },
    ],
    scenario: {
      title: "SLA & risk posture",
      sliders: [
        { key: "strictness", label: "Doc-check strictness", min: 0, max: 100, value: 60, suffix: "%" },
        { key: "risk", label: "Risk threshold", min: 0, max: 100, value: 55, suffix: "%" },
        { key: "auto", label: "Auto-clear ceiling", min: 0, max: 100, value: 40, suffix: "%" },
      ],
      formula: (v) => ({
        outcome: Math.max(0, Math.round(18 + v.auto * 0.55 - v.strictness * 0.12)),
        risk: Math.max(2, Math.round(32 + v.auto * 0.22 - v.risk * 0.2 - v.strictness * 0.08)),
        cost: Math.round(34 + v.strictness * 0.4 + v.risk * 0.18 - v.auto * 0.15),
      }),
      labels: { outcome: "auto-cleared %", risk: "residual risk", cost: "escalations / wk" },
    },
    sessions: ["Case #4821", "Case #4822", "Case #5103", "Case #5109", "Vela Ltd", "N. Okoro"],
    graph: [
      ["Application", "Doc verification", "user"],
      ["Agent extract", "Ops analyst", "logic"],
      ["Sanctions / PEP screen", "Compliance officer", "logic"],
      ["Risk summary", "Approver", "user"],
      ["Provisioning job", "Account live", "infra"],
      ["Decision memory", "Audit trail", "data"],
    ],
  },
  {
    id: "learfield",
    showcase: true,
    eyebrow: "Customer · Learfield",
    title: "Sponsorship Seller Prospecting",
    subtitle: "Turn a target brand or category into a ranked, evidence-backed prospect packet — grounded in governed Fanbase data.",
    goal: "Move sellers from “I have a target brand” to “here are the best school/fanbase opportunities, the evidence, and the outreach narrative.”",
    mode: "Governed Decision App with an agentic workbench",
    accent: "learfield",
    metricLabel: "Time to build a prospect list",
    metricValue: "−68%",
    status: "Seller review",
    agent: "Prospecting agent",
    users: "Sponsorship sellers, sales managers, insights analysts",
    interaction: "Select or upload a target brand list, review the agent's ranked school/audience fits and talking points, then export a prospect packet.",
    services: ["Fanbase data", "Genie", "AI/BI Dashboards", "Model Serving", "Unity Catalog", "Lakebase", "CRM"],
    cards: [
      { layer: "user", title: "Seller workbench", body: "Brand-list intake, ranked opportunities, evidence drill-down, talking points, and prospect-packet export." },
      { layer: "logic", title: "Match & scoring engine", body: "Match brands to Fanbase segments → score school / market / audience fit → explain top drivers → draft talking points." },
      { layer: "data", title: "Governed Fanbase layer", body: "Fan segments, school audiences, donor & ticketing behavior, geography, sponsor penetration, and campaign precedent." },
      { layer: "infra", title: "Databricks resources", body: "Apps UI, Genie, Model Serving (scoring), Unity Catalog (governed definitions), Lakebase (run state + artifacts)." },
    ],
    steps: [
      { label: "Select brands", layer: "user", actor: "Human · sponsorship seller", detail: "Seller uploads or selects a target brand list; a prospecting run opens and territory and permissions are checked.", writes: ["run_id", "brand_list", "category_mapping", "territory"] },
      { label: "Validate", layer: "logic", actor: "Agent · Unity Catalog", detail: "The agent dedupes accounts, maps categories, and applies suppression rules so restricted or unavailable data never reaches scoring.", writes: ["deduped_accounts", "category_match", "suppressed", "data_freshness"] },
      { label: "Match audience", layer: "logic", actor: "Agent · Genie", detail: "The agent matches each brand to governed Fanbase segments and school audiences through Genie.", writes: ["segment_overlap", "audience_size", "mapping_confidence"] },
      { label: "Score fit", layer: "logic", actor: "Agent · Model Serving", detail: "Model Serving scores school / market / audience fit and explains the top drivers behind every rank.", writes: ["fit_score", "score_drivers", "coverage", "scoring_version"], event: { type: "ask", from: "Prospecting agent", body: "I ranked the top schools by fit and captured why each scored high. Want to review the evidence before I draft talking points?" } },
      { label: "Draft packet", layer: "logic", actor: "Agent", detail: "The agent generates talking points, an audience-overlap summary, and a source-data snapshot for the top opportunities.", writes: ["talking_points", "overlap_summary", "data_snapshot"] },
      { label: "Review & export", layer: "user", actor: "Human · sales manager", detail: "Manager edits the packet and approves export; CRM writeback stays manual in v1 so the business can trust the recommendations first.", writes: ["seller_edits", "approval", "export_target"], event: { type: "approval", from: "Prospecting agent", body: "The prospect packet is ready with talking points and evidence. Approve to export it — CRM writeback stays manual in v1." } },
      { label: "Track outcome", layer: "data", actor: "System · writeback", detail: "Pursued / won / lost / deferred feedback is written back as ground truth to improve future scoring.", writes: ["outreach_status", "outcome_label", "scoring_feedback"] },
    ],
    scenario: {
      title: "Prospect scoring sandbox",
      sliders: [
        { key: "audience", label: "Audience fit weight", min: 0, max: 100, value: 62, suffix: "%" },
        { key: "geography", label: "Geography weight", min: 0, max: 100, value: 45, suffix: "%" },
        { key: "whitespace", label: "Sponsor whitespace weight", min: 0, max: 100, value: 55, suffix: "%" },
      ],
      formula: (v) => ({
        outcome: Math.min(99, Math.round(40 + v.audience * 0.4 + v.whitespace * 0.18 + v.geography * 0.1)),
        risk: Math.max(4, Math.round(36 - v.audience * 0.12 - v.geography * 0.1)),
        cost: Math.round(6 + v.audience * 0.12 + v.whitespace * 0.1),
      }),
      labels: { outcome: "top fit score", risk: "coverage risk", cost: "qualified prospects" },
    },
    sessions: ["QSR · Region SE", "Banking · Big Ten", "Auto · Pac-12", "Apparel · SEC", "Telecom · ACC", "Grocery · Big 12"],
    graph: [
      ["Brand list", "Governed match", "data"],
      ["Genie audience overlap", "Fit scoring", "logic"],
      ["Model scoring", "Score drivers", "logic"],
      ["Prospect packet", "Manager review", "user"],
      ["Export", "CRM / outcome tracking", "infra"],
    ],
  },
];

const eventName = (s) => `${s.layer}.${s.label.toLowerCase().replace(/\s+/g, "_")}`;
const stripPrefix = (actor) =>
  actor.replace(/^(Agent|Human|System)\s·\s/, "").replace(/\s*\(agent-assist\)/, "");
const clockNow = () => new Date().toLocaleTimeString("en-GB");
// Resolve a step's actor into { name, type } for the system panel.
// Agent-assist steps are credited to the app's named agent; bare "Agent" too.
const resolveActor = (actor, agentName) => {
  if (actor.includes("agent-assist") || actor === "Agent") return { name: agentName, type: "agent" };
  if (actor.startsWith("Agent")) return { name: stripPrefix(actor), type: "agent" };
  if (actor.startsWith("Human")) return { name: stripPrefix(actor), type: "user" };
  return { name: stripPrefix(actor), type: "system" };
};

/* ---- chart data, reactive to sandbox sliders + the current step ---- */
const OPS_THRESHOLD = 78;
function opsSeries(v, step) {
  const pts = [];
  for (let i = 0; i < 12; i++) {
    let val = 44 + Math.sin(i / 1.7) * 5 + (i % 2) * 3;
    if (step >= 2 && i >= 6) val += (i - 5) * (5 + v.reroute * 0.04); // anomaly builds after Alert
    if (step >= 6 && i >= 9) val -= (v.expedite * 0.3 + v.reroute * 0.25) * (i - 8); // remediation tail
    pts.push({ t: `T-${11 - i}`, value: Math.max(16, Math.round(val)) });
  }
  return pts;
}
function optimizerBars(v) {
  return [
    { name: "Price", value: Math.round(v.price * 0.95) },
    { name: "Promo", value: Math.round(v.promo * 0.5) },
    { name: "Inventory", value: Math.round(60 - Math.abs(v.inventory - 60) * 0.6) },
  ];
}
function kycBars(v) {
  return [
    { name: "ID match", value: Math.round(60 + v.strictness * 0.35) },
    { name: "Sanctions", value: Math.round(10 + (100 - v.risk) * 0.12) },
    { name: "PEP", value: Math.round(6 + (100 - v.risk) * 0.08) },
  ];
}
function learfieldBars(v) {
  return [
    { name: "Audience", value: Math.round(40 + v.audience * 0.55) },
    { name: "Geography", value: Math.round(28 + v.geography * 0.5) },
    { name: "Whitespace", value: Math.round(24 + v.whitespace * 0.6) },
  ];
}

const tipStyle = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  borderRadius: 8,
  border: "1px solid #dcdfdd",
};

function ScreenVisual({ demo, step, sliderState, scenario }) {
  if (demo.id === "ops") {
    const data = opsSeries(sliderState, step);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="opsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3621" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#ff3621" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#8a969b" }} interval={2} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8a969b" }} domain={[0, 120]} axisLine={false} tickLine={false} width={34} />
          <ReferenceLine y={OPS_THRESHOLD} stroke="#c9270f" strokeDasharray="5 4" label={{ value: "SLA-risk threshold", fontSize: 10, fill: "#c9270f", position: "insideTopRight" }} />
          <Tooltip contentStyle={tipStyle} />
          <Area type="monotone" dataKey="value" stroke="#ff3621" strokeWidth={2} fill="url(#opsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  const vizConfig = {
    optimizer: { bars: optimizerBars(sliderState), gauge: scenario.outcome, max: 250, fill: "#ff3621", labelKey: "outcome", colors: ["#ff3621", "#ff8a76", "#1b3139"] },
    kyc: { bars: kycBars(sliderState), gauge: scenario.risk, max: 60, fill: "#2272b4", labelKey: "risk", colors: ["#2272b4", "#00a972", "#445e6b"] },
    learfield: { bars: learfieldBars(sliderState), gauge: scenario.outcome, max: 100, fill: "#7c5cff", labelKey: "outcome", colors: ["#7c5cff", "#a78bff", "#4a93d6"] },
  };
  const cfg = vizConfig[demo.id] || vizConfig.optimizer;
  const bars = cfg.bars;
  const gaugeValue = cfg.gauge;
  const gaugeMax = cfg.max;
  const gaugeFill = cfg.fill;
  const gaugeLabel = demo.scenario.labels[cfg.labelKey];
  const barColors = cfg.colors;

  return (
    <div className="dual-viz">
      <div className="viz-gauge">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="64%" outerRadius="100%" data={[{ value: Math.min(gaugeMax, gaugeValue), fill: gaugeFill }]} startAngle={210} endAngle={-30}>
            <PolarAngleAxis type="number" domain={[0, gaugeMax]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={9} background={{ fill: "#eceae4" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="gauge-center">
          <strong>{gaugeValue}</strong>
          <span>{gaugeLabel}</span>
        </div>
      </div>
      <ResponsiveContainer width="50%" height="100%">
        <BarChart data={bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#8a969b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#8a969b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(27,49,57,0.05)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {bars.map((b, i) => <Cell key={b.name} fill={barColors[i % barColors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function App() {
  const [view, setView] = useState("gallery"); // "gallery" | "detail"
  const [activeDemoId, setActiveDemoId] = useState("ops");
  const [step, setStep] = useState(0); // 0 = idle, 1..N = executed steps
  const [playing, setPlaying] = useState(false);
  const [archLayer, setArchLayer] = useState("logic");
  const [selectedNode, setSelectedNode] = useState(null);

  // ---- System panel: live activity feed (decoupled from the device run) ----
  const [feedLive, setFeedLive] = useState(true);
  const [feed, setFeed] = useState([]);
  const [feedFilter, setFeedFilter] = useState("all");
  const [recordsTotal, setRecordsTotal] = useState(0);
  const seqRef = useRef(0);

  const demo = useMemo(() => demos.find((d) => d.id === activeDemoId), [activeDemoId]);
  const total = demo.steps.length;

  const makeEvent = () => {
    const s = demo.steps[Math.floor(Math.random() * demo.steps.length)];
    const session = demo.sessions[Math.floor(Math.random() * demo.sessions.length)];
    const who = resolveActor(s.actor, demo.agent);
    seqRef.current += 1;
    return {
      id: seqRef.current,
      time: clockNow(),
      session,
      actorName: who.name,
      type: who.type,
      layer: s.layer,
      label: s.label,
      fields: s.writes,
      records: s.writes.length,
      approval: s.event?.type === "approval",
    };
  };

  const initialSliders = useMemo(
    () => Object.fromEntries(demo.scenario.sliders.map((s) => [s.key, s.value])),
    [demo]
  );
  const [sliderState, setSliderState] = useState(initialSliders);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setArchLayer("logic");
    setSelectedNode(null);
    setSliderState(initialSliders);
    // reset + seed the live feed for the new app
    seqRef.current = 0;
    const seed = Array.from({ length: 4 }, makeEvent).reverse();
    setFeed(seed);
    setRecordsTotal(seed.reduce((n, e) => n + e.records, 0));
    setFeedLive(true);
  }, [activeDemoId, initialSliders]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((s) => {
        if (s >= total) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1150);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  // live activity stream — synthetic concurrent events across sessions
  useEffect(() => {
    if (!feedLive) return;
    const timer = window.setInterval(() => {
      const ev = makeEvent();
      setFeed((f) => [ev, ...f].slice(0, 14));
      setRecordsTotal((n) => n + ev.records);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [feedLive, activeDemoId]);

  const executed = demo.steps.slice(0, step);
  const currentStep = step > 0 ? demo.steps[step - 1] : null;
  const stepMeta = currentStep ? layerMeta[currentStep.layer] : null;
  const recordCount = executed.reduce((n, s) => n + s.writes.length, 0);
  const scenario = demo.scenario.formula(sliderState);

  // ---- System panel derivations ----
  const roster = useMemo(() => {
    const byType = { agent: new Map(), user: new Map() };
    demo.steps.forEach((s) => {
      const who = resolveActor(s.actor, demo.agent);
      if (who.type === "agent" || who.type === "user") {
        if (!byType[who.type].has(who.name)) byType[who.type].set(who.name, s.layer);
      }
    });
    return {
      agents: [...byType.agent].map(([name, layer]) => ({ name, layer })),
      users: [...byType.user].map(([name, layer]) => ({ name, layer })),
    };
  }, [demo]);

  const loadByActor = feed.reduce((acc, e) => {
    acc[e.actorName] = (acc[e.actorName] || 0) + 1;
    return acc;
  }, {});
  const hotActor = feed.length ? feed[0].actorName : null;
  const pendingApprovals = feed.filter((e) => e.approval).length;
  const visibleFeed = feed.filter((e) => feedFilter === "all" || e.type === feedFilter);
  const auditRows = feed.slice(0, 6);

  const togglePlay = () => {
    if (step >= total) setStep(0);
    setPlaying((p) => !p);
  };
  const goto = (n) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(n, total)));
  };
  const openApp = (id) => {
    setActiveDemoId(id);
    setStep(0);
    setPlaying(false);
    setView("detail");
    window.scrollTo({ top: 0 });
  };
  const backToGallery = () => {
    setPlaying(false);
    setView("gallery");
    window.scrollTo({ top: 0 });
  };

  /* ---------------------------- Gallery ---------------------------- */
  const renderTile = (item) => (
    <button
      key={item.id}
      className={`tile theme-${item.accent}`}
      onClick={() => openApp(item.id)}
    >
      <span className="tile-accent" aria-hidden="true" />
      <div className="tile-head">
        <span className="tile-eyebrow">{item.eyebrow}</span>
        <span className="tile-status"><CircleDot size={12} /> {item.status}</span>
      </div>
      <h3 className="tile-title">{item.title}</h3>
      <p className="tile-sub">{item.subtitle}</p>
      <span className="tile-tag"><Workflow size={13} /> {item.mode}</span>
      <div className="tile-foot">
        <div className="tile-metric">
          <strong>{item.metricValue}</strong>
          <small>{item.metricLabel}</small>
        </div>
        <span className="tile-open">Open app <ArrowRight size={15} /></span>
      </div>
    </button>
  );

  if (view === "gallery") {
    return (
      <main className="shell">
        <header className="masthead">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Databricks Apps
          </div>
          <div className="eyebrow">Art of the possible · app gallery</div>
          <h1>A gallery of data + AI native apps.</h1>
          <p className="lede">
            Each tile is one Databricks App, anchored on a distinct pattern across a spectrum —
            constrained agent, fully autonomous, and human-driven workflow. Open one to watch it
            run on screen, step by step.
          </p>
        </header>

        <section className="gallery">
          <span className="section-label">Apps</span>
          <div className="gallery-grid">
            {demos.filter((d) => !d.showcase).map((item) => renderTile(item))}
          </div>
        </section>

        {demos.some((d) => d.showcase) && (
          <section className="gallery showcase">
            <span className="section-label">Customer showcase</span>
            <p className="section-note">A real customer scenario, framed as one of these apps — built from Learfield's business loops.</p>
            <div className="gallery-grid">
              {demos.filter((d) => d.showcase).map((item) => renderTile(item))}
            </div>
          </section>
        )}
      </main>
    );
  }

  /* ---------------------------- Detail ----------------------------- */
  return (
    <main className={`shell theme-${demo.accent}`}>
      <div className="detail-top">
        <button className="back-btn" onClick={backToGallery}>
          <ArrowLeft size={15} /> All apps
        </button>
        <div className="brand brand-mini">
          <span className="brand-mark" aria-hidden="true" />
          Databricks Apps
        </div>
      </div>

      <section className="title-row">
        <div className="title-copy">
          <span className="tile-eyebrow">{demo.eyebrow}</span>
          <h2>{demo.title}</h2>
          <p>{demo.subtitle}</p>
          <div className="chips">
            <span><CircleDot size={14} /> {demo.goal}</span>
            <span><Workflow size={14} /> {demo.mode}</span>
          </div>
        </div>
        <div className="metric-chip">
          <div className="metric-top"><Activity size={16} /> {demo.status}</div>
          <strong>{demo.metricValue}</strong>
          <small>{demo.metricLabel}</small>
        </div>
      </section>

      <div className="detail-stack">
        {/* ----- About this app (above the screen) ----- */}
        <div className="detail-card detail-card-top">
          <span className="section-label">About this app</span>
          <dl>
            <div className="dc-row"><dt>Purpose</dt><dd>{demo.goal}</dd></div>
            <div className="dc-row"><dt>Pattern</dt><dd>{demo.mode}</dd></div>
            <div className="dc-row"><dt>Who uses it</dt><dd>{demo.users}</dd></div>
            <div className="dc-row"><dt>Key interaction</dt><dd>{demo.interaction}</dd></div>
          </dl>
          <div className="dc-services">
            <span className="dc-services-label">Databricks</span>
            <div className="svc-chips">
              {demo.services.map((s) => <span key={s} className="svc-chip">{s}</span>)}
            </div>
          </div>
        </div>

        {/* ----- Computer view: the app running on screen ----- */}
        <section className="screen-wrap">
          <div className="screen-bar">
            <span className="section-label">Inside the app</span>
            <div className="transport">
              <button className="primary" onClick={togglePlay}>
                {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? "Pause" : "Play"}
              </button>
              <button onClick={() => goto(step - 1)} disabled={step === 0}>Back</button>
              <button onClick={() => goto(step + 1)} disabled={step >= total}>Forward</button>
              <button onClick={() => goto(0)}><RefreshCcw size={14} /> Reset</button>
            </div>
          </div>

          <div className="device">
            <div className="device-bar">
              <span className="device-dots"><i /><i /><i /></span>
              <span className="device-url">{demo.id}.databricksapps.com</span>
              <span className={`device-live ${playing ? "on" : ""}`}>
                <Activity size={12} /> {playing ? "running" : "ready"}
              </span>
            </div>

            <div className="device-screen">
              <div className="screen-head">
                <div className="screen-title">{demo.title}</div>
                <span className={`screen-pill ${stepMeta ? stepMeta.colorClass : ""}`}>
                  {currentStep ? `${currentStep.label} · ${currentStep.actor}` : "Idle"}
                </span>
              </div>

              {currentStep?.event?.type === "alert" && (
                <div className="screen-alert" role="alert">
                  <span className="screen-alert-icon"><Bell size={15} /></span>
                  <div className="screen-alert-body">
                    <span className="screen-alert-from">{currentStep.event.from}</span>
                    <p>{currentStep.event.body}</p>
                  </div>
                  <span className="screen-alert-tag">Alert</span>
                </div>
              )}

              <div className="screen-rail">
                {demo.steps.map((s, idx) => {
                  const n = idx + 1;
                  const active = n === step;
                  const passed = n < step;
                  return (
                    <button
                      key={s.label}
                      className={`rstep ${layerMeta[s.layer].colorClass} ${active ? "active" : ""} ${passed ? "passed" : ""}`}
                      onClick={() => goto(n)}
                      title={s.label}
                    >
                      <span className="rstep-dot">
                        {passed ? <CheckCircle2 size={13} /> : active ? <CircleDot size={13} /> : n}
                      </span>
                      <span className="rstep-label">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="screen-chart" key={`${demo.id}-chart`}>
                <ScreenVisual demo={demo} step={step} sliderState={sliderState} scenario={scenario} />
              </div>

              {currentStep?.event && currentStep.event.type !== "alert" ? (
                <div className={`chat-bubble ${currentStep.event.type === "approval" ? "approval" : ""}`}>
                  <span className="chat-avatar"><Bot size={15} /></span>
                  <div className="chat-body">
                    <span className="chat-from">{currentStep.event.from}</span>
                    <p>{currentStep.event.body}</p>
                    {currentStep.event.type === "approval" && (
                      <div className="chat-actions">
                        <button type="button" className="chat-approve"><Check size={13} /> Approve</button>
                        <button type="button" className="chat-reject">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`screen-note ${stepMeta ? stepMeta.colorClass : ""}`}>
                  {currentStep ? (
                    <>
                      <span className="screen-note-label">Step {step} / {total} · {currentStep.label}</span>
                      <p>{currentStep.detail}</p>
                    </>
                  ) : (
                    <>
                      <span className="screen-note-label">Ready</span>
                      <p>Press Play, or open Tweak inputs below — the screen updates live and each step writes durable records.</p>
                    </>
                  )}
                </div>
              )}

              <details className="screen-sandbox">
                <summary className="screen-sandbox-head">
                  <span className="sandbox-summary-left">
                    <GitBranch size={14} />
                    <span className="section-label">Tweak inputs</span>
                  </span>
                  <span className="sandbox-hint">drag a control — the chart above updates live</span>
                  <ChevronRight size={15} className="sandbox-chevron" />
                </summary>
                <div className="sandbox-inner">
                  <div className="sliders">
                    {demo.scenario.sliders.map((slider) => (
                      <label key={slider.key}>
                        <span>{slider.label}</span>
                        <strong>{sliderState[slider.key]}{slider.suffix}</strong>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          value={sliderState[slider.key]}
                          onChange={(e) => setSliderState({ ...sliderState, [slider.key]: Number(e.target.value) })}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="scenario-results">
                    <div><strong>{scenario.outcome}</strong><span>{demo.scenario.labels.outcome}</span></div>
                    <div><strong>{scenario.risk}</strong><span>{demo.scenario.labels.risk}</span></div>
                    <div><strong>{scenario.cost}</strong><span>{demo.scenario.labels.cost}</span></div>
                  </div>
                </div>
              </details>

              <div className="screen-foot">
                <span><strong>{step}</strong> / {total} steps</span>
                <span><strong>{recordCount}</strong> records written</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- System panel: live activity across every user, agent & job ---------- */}
      <details className="arch run-collapse" open>
        <summary>
          <span className="arch-summary-left">
            <Radar size={17} />
            <span>
              <strong>System panel</strong>
              <small>Live activity across every user, agent, and job in this app</small>
            </span>
          </span>
          <ChevronRight className="arch-chevron" size={18} />
        </summary>

        <div className="arch-body">
          <div className="device admin-device">
            <div className="device-bar">
              <span className="device-dots"><i /><i /><i /></span>
              <span className="device-url">{demo.id}.databricksapps.com/admin</span>
              <span className={`device-live ${feedLive ? "on" : ""}`}>
                <Activity size={12} /> {feedLive ? "streaming" : "paused"}
              </span>
            </div>
            <div className="device-screen admin-screen">
          <section className="adminpanel">
            <div className="admin-statusbar">
              <div className="admin-kpi">
                <span className="kpi-num">{roster.agents.length}</span>
                <span className="kpi-label"><Bot size={12} /> active agents</span>
              </div>
              <div className="admin-kpi">
                <span className="kpi-num">{roster.users.length}</span>
                <span className="kpi-label"><UserRoundCheck size={12} /> active users</span>
              </div>
              <div className="admin-kpi">
                <span className="kpi-num">{pendingApprovals}</span>
                <span className="kpi-label"><ShieldCheck size={12} /> pending approvals</span>
              </div>
              <div className="admin-kpi">
                <span className="kpi-num">{recordsTotal.toLocaleString()}</span>
                <span className="kpi-label"><Database size={12} /> records written</span>
              </div>
            </div>

            <div className="admin-grid">
              <div className="admin-feed">
                <div className="admin-feed-head">
                  <span className="section-label">Live activity</span>
                  <div className="trail-tabs">
                    {[["all", "all"], ["agent", "agents"], ["user", "people"], ["system", "systems"]].map(([k, label]) => (
                      <button
                        key={k}
                        className={`trail-tab ${feedFilter === k ? "active" : ""}`}
                        onClick={() => setFeedFilter(k)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button className="feed-toggle" onClick={() => setFeedLive((v) => !v)}>
                    {feedLive ? <Pause size={13} /> : <Play size={13} />} {feedLive ? "Pause" : "Resume"}
                  </button>
                </div>
                <div className="feed-panel">
                  {visibleFeed.length === 0 ? (
                    <div className="feed-empty">// no {feedFilter === "all" ? "" : `${feedFilter} `}activity in view</div>
                  ) : (
                    visibleFeed.map((e, i) => (
                      <div className={`feed-line ${i === 0 ? "fresh" : ""}`} key={e.id}>
                        <span className="f-time">{e.time}</span>
                        <span className="f-session">{e.session}</span>
                        <span className={`f-actor actor-${e.type}`}>{e.actorName}</span>
                        <span className={`f-event tcol-${e.layer}`}>{eventName(e)}</span>
                        <span className="f-fields">{e.fields.join(" · ")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <aside className="admin-roster">
                <div className="roster-group">
                  <div className="roster-head"><Bot size={14} /> Agents</div>
                  {roster.agents.map((a) => (
                    <div key={a.name} className={`roster-row ${layerMeta[a.layer].colorClass}`}>
                      <span className={`live-dot ${hotActor === a.name ? "hot" : ""}`} />
                      <span className="roster-name">{a.name}</span>
                      <span className="roster-load">{loadByActor[a.name] || 0}</span>
                    </div>
                  ))}
                </div>
                <div className="roster-group">
                  <div className="roster-head"><UserRoundCheck size={14} /> People</div>
                  {roster.users.map((u) => (
                    <div key={u.name} className={`roster-row ${layerMeta[u.layer].colorClass}`}>
                      <span className={`live-dot ${hotActor === u.name ? "hot" : ""}`} />
                      <span className="roster-name">{u.name}</span>
                      <span className="roster-load">{loadByActor[u.name] || 0}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className="cledger">
              <div className="cledger-head">
                <ShieldCheck size={15} />
                <span className="section-label">Audit trail</span>
                <span className="cledger-count">{recordsTotal.toLocaleString()} records</span>
              </div>
              <div className="cledger-list">
                {auditRows.map((e) => (
                  <div key={e.id} className={`cledger-row ${layerMeta[e.layer].colorClass}`}>
                    <span className="cl-session">{e.session}</span>
                    <span className="cl-label">{e.label}</span>
                    <span className="cl-fields">{e.fields.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
            </div>
          </div>
        </div>
      </details>

      {/* ---------- Architecture, for the curious ---------- */}
      <details className="arch">
        <summary>
          <span className="arch-summary-left">
            <Layers3 size={17} />
            <span>
              <strong>Architecture, for the curious</strong>
              <small>The four layers and the capability graph behind the run</small>
            </span>
          </span>
          <ChevronRight className="arch-chevron" size={18} />
        </summary>

        <div className="arch-body">
          <div className="stack-wrap">
            <div className="stack-col">
              {layerOrder.map((layer) => {
                const meta = layerMeta[layer];
                const Icon = meta.icon;
                return (
                  <button
                    key={layer}
                    className={`stack-band ${meta.colorClass} ${archLayer === layer ? "active" : ""}`}
                    onMouseEnter={() => setArchLayer(layer)}
                    onClick={() => setArchLayer(layer)}
                  >
                    <Icon size={16} />
                    <span className="stack-band-name">{meta.label} layer</span>
                    <span className="stack-band-sub">{meta.short}</span>
                  </button>
                );
              })}
            </div>
            <div className={`stack-panel ${layerMeta[archLayer].colorClass}`}>
              <div className="stack-panel-eyebrow">{layerMeta[archLayer].label} layer</div>
              <div className="stack-panel-title">
                {demo.cards.find((c) => c.layer === archLayer).title}
              </div>
              <p className="stack-panel-desc">{demo.cards.find((c) => c.layer === archLayer).body}</p>
              <div className="stack-role"><strong>Owns:</strong> {layerMeta[archLayer].owns}</div>
              <div className="stack-steps">
                <span className="stack-steps-label">Steps on this layer</span>
                <div className="stack-step-chips">
                  {demo.steps.filter((s) => s.layer === archLayer).map((s) => (
                    <span key={s.label}>{s.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cap">
            <div className="cap-heading">
              <span className="section-label">Capability path</span>
              <Network size={16} />
            </div>
            <div className="cap-graph">
              {demo.graph.map(([from, to, layer], idx) => {
                const meta = layerMeta[layer];
                const active = selectedNode === idx;
                return (
                  <button
                    key={`${from}-${to}-${idx}`}
                    className={`edge-row ${meta.colorClass} ${active ? "active" : ""}`}
                    onClick={() => { setSelectedNode(idx); setArchLayer(layer); }}
                  >
                    <span>{from}</span>
                    <ArrowRight size={14} />
                    <span>{to}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </details>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
