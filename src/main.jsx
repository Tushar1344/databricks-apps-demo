import React, { useEffect, useMemo, useState } from "react";
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
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  UserRoundCheck,
  Workflow,
  Zap,
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
    graph: [
      ["Application", "Doc verification", "user"],
      ["Agent extract", "Ops analyst", "logic"],
      ["Sanctions / PEP screen", "Compliance officer", "logic"],
      ["Risk summary", "Approver", "user"],
      ["Provisioning job", "Account live", "infra"],
      ["Decision memory", "Audit trail", "data"],
    ],
  },
];

const eventName = (s) => `${s.layer}.${s.label.toLowerCase().replace(/\s+/g, "_")}`;
const stamp = (i) => `03:14:${String(2 + i * 3).padStart(2, "0")}`;

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

  const isOpt = demo.id === "optimizer";
  const bars = isOpt ? optimizerBars(sliderState) : kycBars(sliderState);
  const gaugeValue = isOpt ? scenario.outcome : scenario.risk;
  const gaugeMax = isOpt ? 250 : 60;
  const gaugeFill = isOpt ? "#ff3621" : "#2272b4";
  const gaugeLabel = isOpt ? demo.scenario.labels.outcome : demo.scenario.labels.risk;
  const barColors = isOpt ? ["#ff3621", "#ff8a76", "#1b3139"] : ["#2272b4", "#00a972", "#445e6b"];

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
  const [trailLayer, setTrailLayer] = useState("all");
  const [archLayer, setArchLayer] = useState("logic");
  const [selectedNode, setSelectedNode] = useState(null);

  const demo = useMemo(() => demos.find((d) => d.id === activeDemoId), [activeDemoId]);
  const total = demo.steps.length;

  const initialSliders = useMemo(
    () => Object.fromEntries(demo.scenario.sliders.map((s) => [s.key, s.value])),
    [demo]
  );
  const [sliderState, setSliderState] = useState(initialSliders);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setTrailLayer("all");
    setArchLayer("logic");
    setSelectedNode(null);
    setSliderState(initialSliders);
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

  const executed = demo.steps.slice(0, step);
  const currentStep = step > 0 ? demo.steps[step - 1] : null;
  const stepMeta = currentStep ? layerMeta[currentStep.layer] : null;
  const recordCount = executed.reduce((n, s) => n + s.writes.length, 0);
  const scenario = demo.scenario.formula(sliderState);

  const firingLayer = currentStep ? currentStep.layer : null;
  const firedLayers = new Set(executed.map((s) => s.layer));
  const layerCounts = layerOrder.reduce((acc, l) => {
    acc[l] = executed.filter((s) => s.layer === l).reduce((n, s) => n + s.writes.length, 0);
    return acc;
  }, {});
  const trail = executed
    .map((s, i) => ({ ...s, idx: i }))
    .filter((s) => trailLayer === "all" || s.layer === trailLayer);

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
            {demos.map((item) => (
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
            ))}
          </div>
        </section>
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

      {/* ---------- Day in the life: step-through + command-line trail ---------- */}
      <details className="arch run-collapse">
        <summary>
          <span className="arch-summary-left">
            <Workflow size={17} />
            <span>
              <strong>Day in the life</strong>
              <small>Step the app through its decision and watch each action break down on the command line</small>
            </span>
          </span>
          <ChevronRight className="arch-chevron" size={18} />
        </summary>

        <div className="arch-body">
          <section className="run">
            <div className="run-header">
              <div>
                <span className="section-label">Step-through</span>
                <h3>Each step writes a durable record</h3>
              </div>
              <div className="transport">
                <button className="primary" onClick={togglePlay}>
                  {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? "Pause" : "Play"}
                </button>
                <button onClick={() => goto(step - 1)} disabled={step === 0}>Back</button>
                <button onClick={() => goto(step + 1)} disabled={step >= total}>Forward</button>
                <button onClick={() => goto(0)}><RefreshCcw size={14} /> Reset</button>
                <span className="progress"><strong>{step}</strong> / {total} steps</span>
              </div>
            </div>

            <div className="step-strip">
              {demo.steps.map((s, idx) => {
                const meta = layerMeta[s.layer];
                const n = idx + 1;
                const active = n === step;
                const passed = n < step;
                return (
                  <button
                    key={s.label}
                    className={`step ${meta.colorClass} ${active ? "active" : ""} ${passed ? "passed" : ""}`}
                    onClick={() => goto(n)}
                  >
                    <span className="step-num">
                      {passed ? <CheckCircle2 size={15} /> : active ? <CircleDot size={15} /> : n}
                    </span>
                    <span className="step-label">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="run-body">
              <div className="fanout">
                <div className={`orchestrator ${firingLayer ? "firing" : ""}`} key={`orch-${step}`}>
                  <Zap size={16} />
                  <strong>Orchestrator</strong>
                  <span>{currentStep ? currentStep.label : "idle"}</span>
                </div>
                <div className="fan-line" />
                <div className="fan-systems">
                  {layerOrder.map((layer) => {
                    const meta = layerMeta[layer];
                    const Icon = meta.icon;
                    const fired = firedLayers.has(layer);
                    const isFiring = firingLayer === layer;
                    return (
                      <div
                        key={isFiring ? `${layer}-${step}` : layer}
                        className={`fan-card ${meta.colorClass} ${fired ? "fired" : ""} ${isFiring ? "firing" : ""}`}
                      >
                        <div className="fan-dot" />
                        <Icon size={18} />
                        <strong>{meta.label}</strong>
                        <small>{fired ? `${layerCounts[layer]} records` : "—"}</small>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="run-detail">
                <div className={`narration ${currentStep ? layerMeta[currentStep.layer].colorClass : ""}`}>
                  {currentStep ? (
                    <>
                      <div className="narration-label">
                        Step {step} · {currentStep.label}
                        {currentStep.actor ? <span className="narration-actor">{currentStep.actor}</span> : null}
                      </div>
                      <p>{currentStep.detail}</p>
                    </>
                  ) : (
                    <>
                      <div className="narration-label">Ready</div>
                      <p>Press <strong>Play</strong> or step forward. Each step writes durable records and lights up the layer it touches.</p>
                    </>
                  )}
                </div>

                <div className="trail-tabs">
                  {["all", ...layerOrder].map((l) => {
                    const label = l === "all" ? "all" : layerMeta[l].label.toLowerCase();
                    const hasUpdate = l !== "all" && firingLayer === l;
                    return (
                      <button
                        key={l}
                        className={`trail-tab ${trailLayer === l ? "active" : ""} ${hasUpdate ? "has-update" : ""}`}
                        onClick={() => setTrailLayer(l)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="trail-panel">
                  {trail.length === 0 ? (
                    <div className="trail-empty">
                      {step === 0 ? "// no records written yet — start the run" : "// no records on this layer yet"}
                    </div>
                  ) : (
                    trail.map((s) => (
                      <div className={`trail-line ${s.idx === step - 1 ? "fresh" : ""}`} key={s.idx}>
                        <span className="t-time">[{stamp(s.idx)}]</span>{" "}
                        <span className={`t-event tcol-${s.layer}`}>{eventName(s)}</span>{" "}
                        <span className="t-fields">{s.writes.join(" · ")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="cledger">
              <div className="cledger-head">
                <ShieldCheck size={15} />
                <span className="section-label">Decision ledger</span>
                <span className="cledger-count">{recordCount} records</span>
              </div>
              {executed.length === 0 ? (
                <div className="cledger-empty">Run the app to fill the ledger.</div>
              ) : (
                <div className="cledger-list">
                  {executed.map((s, idx) => (
                    <div key={`${s.label}-${idx}`} className={`cledger-row ${layerMeta[s.layer].colorClass} ${idx === step - 1 ? "fresh" : ""}`}>
                      <span className="cl-num">{idx + 1}</span>
                      <span className="cl-label">{s.label}</span>
                      <span className="cl-fields">{s.writes.join(" · ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
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
