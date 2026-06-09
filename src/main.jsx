import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  Database,
  GitBranch,
  Layers3,
  MessageSquareText,
  Network,
  Pause,
  Play,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import "./styles.css";

const layerMeta = {
  user: {
    label: "User layer",
    short: "people, approvals, workflow UI",
    colorClass: "layer-user",
    icon: UserRoundCheck,
  },
  logic: {
    label: "Logic layer",
    short: "agents, policies, workflows, simulation",
    colorClass: "layer-logic",
    icon: BrainCircuit,
  },
  data: {
    label: "Data layer",
    short: "tables, features, vectors, writeback",
    colorClass: "layer-data",
    icon: Database,
  },
  infra: {
    label: "Infrastructure layer",
    short: "Databricks Apps, Jobs, Model Serving, MCP",
    colorClass: "layer-infra",
    icon: ServerCog,
  },
};

const demos = [
  {
    id: "ops",
    eyebrow: "App 01",
    title: "Real-Time Operations Resolution Center",
    subtitle:
      "Detect SLA risk, explain root cause, simulate fixes, route approvals, execute, and learn.",
    goal: "Prevent customer-impacting failures before they breach SLA.",
    mode: "Constrained agent inside a deterministic workflow",
    accent: "ops",
    metricLabel: "SLA risk avoided",
    metricValue: "$220K",
    status: "Approval required",
    cards: [
      { layer: "user", title: "Ops command center", body: "Triage queue, case owner, approval panel, customer comms draft." },
      { layer: "logic", title: "Exception workflow", body: "Detect → classify → root-cause → simulate → approve → execute → verify." },
      { layer: "data", title: "Streaming + warehouse data", body: "Orders, telemetry, carrier events, inventory, customer priority, historical incidents." },
      { layer: "infra", title: "Databricks resources", body: "Apps UI, Lakeflow Jobs, SQL Warehouse, Model Serving, Genie Space, Lakebase writeback." },
    ],
    steps: [
      { label: "Alert", layer: "data", detail: "Streaming order events show Northeast SLA risk rising above threshold.", writes: ["alert_id", "entity", "severity", "detected_at"] },
      { label: "Explain", layer: "logic", detail: "Genie drilldown identifies late inbound inventory and carrier delay as dominant causes.", writes: ["root_cause", "confidence", "supporting_queries"] },
      { label: "Simulate", layer: "logic", detail: "Run three remediation options: expedite, reroute, split shipment.", writes: ["scenario_id", "expected_cost", "expected_sla_gain", "risk"] },
      { label: "Approve", layer: "user", detail: "Finance approval required because expedite cost exceeds threshold.", writes: ["approval_request", "approver", "rationale"] },
      { label: "Execute", layer: "infra", detail: "Lakeflow Job pushes approved reroute plan to fulfillment and carrier systems.", writes: ["job_run_id", "action_payload", "idempotency_key"] },
      { label: "Learn", layer: "data", detail: "Actual outcome and override comments become ground truth for the next model cycle.", writes: ["actual_sla", "business_impact", "ground_truth_label"] },
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
    title: "Autonomous Growth & Margin Optimizer",
    subtitle:
      "A metric-seeking planning app that explores data, predicts outcomes, simulates options, optimizes plans, and asks humans for decisions.",
    goal: "Recover margin while protecting revenue, inventory health, and customer experience.",
    mode: "Fully agentic, goal-seeking app with approval boundaries",
    accent: "optimizer",
    metricLabel: "Expected margin lift",
    metricValue: "+143 bps",
    status: "Scenario review",
    cards: [
      { layer: "user", title: "Planning cockpit", body: "VP goal, category-manager review, finance/legal approvals, experiment launch decision." },
      { layer: "logic", title: "Goal-seeking agent", body: "Hypothesize → query → forecast → simulate → optimize → recommend → monitor." },
      { layer: "data", title: "Business semantic layer", body: "Sales, margin, elasticity, inventory, cohorts, promo calendar, vendor funding, constraints." },
      { layer: "infra", title: "Databricks resources", body: "Genie Space, SQL Warehouse, Model Serving, Jobs, MLflow traces, Lakebase decision ledger." },
    ],
    steps: [
      { label: "Set goal", layer: "user", detail: "Business owner sets target: recover 150 bps of gross margin this quarter.", writes: ["goal", "metric", "constraints", "owner"] },
      { label: "Explore", layer: "logic", detail: "Agent uses Genie to identify categories with margin leakage and demand resilience.", writes: ["hypothesis", "query_trace", "evidence"] },
      { label: "Predict", layer: "logic", detail: "Forecast demand, churn, inventory exposure, and revenue impact for each candidate action.", writes: ["forecast_id", "confidence_interval", "feature_snapshot"] },
      { label: "Optimize", layer: "logic", detail: "Choose plan that maximizes expected margin subject to brand, legal, inventory, and customer constraints.", writes: ["candidate_plan", "constraint_check", "expected_value"] },
      { label: "Approve", layer: "user", detail: "Human approves plan because it changes customer-facing prices and promotion depth.", writes: ["approval", "comments", "risk_acceptance"] },
      { label: "Monitor", layer: "data", detail: "Actual lift, revenue impact, and customer response are written back as ground truth.", writes: ["experiment_result", "actual_lift", "lesson_learned"] },
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
    id: "fabric",
    eyebrow: "App 03",
    title: "Enterprise Decision Fabric & Custom MCP Hub",
    subtitle:
      "A mostly headless Databricks App that exposes governed tools, state machines, decision memory, and writeback APIs to other apps and agents.",
    goal: "Make every app and agent safer, reusable, auditable, and stateful.",
    mode: "Headless app + custom MCP server + reusable workflow services",
    accent: "fabric",
    metricLabel: "Reusable tools exposed",
    metricValue: "14",
    status: "MCP server online",
    cards: [
      { layer: "user", title: "Admin & review console", body: "Tool registry, policy review, lifecycle stages, approval queues, audit search." },
      { layer: "logic", title: "MCP tool layer", body: "get_context, ask_genie, simulate_scenario, check_policy, record_decision, write_ground_truth." },
      { layer: "data", title: "Decision memory", body: "Cases, comments, approvals, risks, recommendations, next steps, ground truth, traces." },
      { layer: "infra", title: "Databricks resources", body: "Custom MCP hosted as Databricks App, managed MCPs, Unity Catalog, AI Gateway, Lakebase." },
    ],
    steps: [
      { label: "Register", layer: "logic", detail: "Declare tools, schemas, permissions, and audit tier for each business capability.", writes: ["tool_name", "schema", "owner", "audit_tier"] },
      { label: "Call", layer: "infra", detail: "Another Databricks App or agent calls the custom MCP server as a governed tool provider.", writes: ["caller_app", "tool_call_id", "auth_context"] },
      { label: "Check", layer: "logic", detail: "Policy checks Unity Catalog permissions, risk tier, allowed side effects, and approval rules.", writes: ["policy_decision", "denied_fields", "approval_required"] },
      { label: "Act", layer: "logic", detail: "Tool executes: fetch context, run forecast, ask Genie, simulate scenario, or create workflow item.", writes: ["task_run", "artifact", "result"] },
      { label: "Transition", layer: "user", detail: "Finite-state workflow advances after required human and system outputs are present.", writes: ["from_state", "to_state", "actor", "required_outputs"] },
      { label: "Remember", layer: "data", detail: "Decision, rationale, comments, risk, next step, and outcome are persisted for future apps.", writes: ["decision", "rationale", "feedback", "ground_truth"] },
    ],
    scenario: {
      title: "Governed tool exposure",
      sliders: [
        { key: "tools", label: "Tools exposed", min: 1, max: 30, value: 14, suffix: "" },
        { key: "policy", label: "Policy strictness", min: 0, max: 100, value: 72, suffix: "%" },
        { key: "reuse", label: "Cross-app reuse", min: 0, max: 100, value: 63, suffix: "%" },
      ],
      formula: (v) => ({
        outcome: Math.round(v.tools * (1 + v.reuse / 55)),
        risk: Math.max(1, Math.round(34 - v.policy * 0.21 - v.reuse * 0.05)),
        cost: Math.round(10 + v.tools * 1.4 + v.policy * 0.05),
      }),
      labels: { outcome: "app integrations", risk: "governance gap", cost: "ops overhead" },
    },
    graph: [
      ["App A", "Custom MCP", "infra"],
      ["Custom MCP", "Policy checker", "logic"],
      ["Policy checker", "Unity Catalog", "data"],
      ["Custom MCP", "Genie / SQL / AI Search", "data"],
      ["Custom MCP", "Decision ledger", "data"],
      ["Reviewer", "State transition", "user"],
    ],
  },
];

function clampStep(index, steps) {
  return Math.max(0, Math.min(index, steps.length - 1));
}

function App() {
  const [activeDemoId, setActiveDemoId] = useState("ops");
  const [selectedLayer, setSelectedLayer] = useState("logic");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const demo = useMemo(() => demos.find((d) => d.id === activeDemoId), [activeDemoId]);
  const currentStep = demo.steps[step];

  const initialSliders = useMemo(() => {
    return Object.fromEntries(demo.scenario.sliders.map((s) => [s.key, s.value]));
  }, [demo]);
  const [sliderState, setSliderState] = useState(initialSliders);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    setSelectedLayer("logic");
    setSelectedNode(null);
    setSliderState(initialSliders);
  }, [activeDemoId, initialSliders]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep((s) => {
        if (s >= demo.steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [playing, demo.steps.length]);

  const scenario = demo.scenario.formula(sliderState);
  const selectedLayerMeta = layerMeta[selectedLayer];
  const SelectedLayerIcon = selectedLayerMeta.icon;

  return (
    <main className={`app-shell theme-${demo.accent}`}>
      <section className="hero">
        <div>
          <div className="kicker">Databricks Apps · interactive architecture prototypes</div>
          <h1>Data + AI native apps: art of the possible</h1>
          <p>
            Three front-end React demos showing app UX, architecture layers, agent behavior,
            analytical reasoning, simulation, workflow state, and writeback.
          </p>
        </div>
        <div className="hero-card">
          <Sparkles size={22} />
          <strong>Shared design language</strong>
          <span>Click layers, run the workflow trace, tune the simulator, and inspect writeback.</span>
        </div>
      </section>

      <nav className="demo-tabs" aria-label="Demo selector">
        {demos.map((item) => (
          <button
            key={item.id}
            className={item.id === demo.id ? "active" : ""}
            onClick={() => setActiveDemoId(item.id)}
          >
            <span>{item.eyebrow}</span>
            {item.title}
          </button>
        ))}
      </nav>

      <section className="title-grid">
        <div className="title-copy">
          <div className="eyebrow">{demo.eyebrow}</div>
          <h2>{demo.title}</h2>
          <p>{demo.subtitle}</p>
          <div className="chips">
            <span><CircleDot size={15} /> Goal: {demo.goal}</span>
            <span><Workflow size={15} /> {demo.mode}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <Activity size={20} />
            <span>{demo.status}</span>
          </div>
          <strong>{demo.metricValue}</strong>
          <small>{demo.metricLabel}</small>
        </div>
      </section>

      <section className="legend-panel">
        {Object.entries(layerMeta).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={key}
              className={`legend-chip ${meta.colorClass} ${selectedLayer === key ? "selected" : ""}`}
              onClick={() => setSelectedLayer(key)}
            >
              <Icon size={17} />
              <span>{meta.label}</span>
            </button>
          );
        })}
      </section>

      <section className="architecture-grid">
        <div className="panel large-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Layered architecture</span>
              <h3>Infrastructure, data, logic, and user layers</h3>
            </div>
            <div className={`layer-pill ${selectedLayerMeta.colorClass}`}>
              <SelectedLayerIcon size={16} /> {selectedLayerMeta.label}
            </div>
          </div>

          <div className="layer-stack">
            {demo.cards.map((card) => {
              const meta = layerMeta[card.layer];
              const Icon = meta.icon;
              return (
                <button
                  key={card.title}
                  className={`layer-card ${meta.colorClass} ${selectedLayer === card.layer ? "active" : ""}`}
                  onMouseEnter={() => setSelectedLayer(card.layer)}
                  onClick={() => setSelectedLayer(card.layer)}
                >
                  <div className="layer-icon"><Icon size={22} /></div>
                  <div>
                    <strong>{card.title}</strong>
                    <p>{card.body}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="layer-explainer">
            <strong>{selectedLayerMeta.label}</strong>
            <span>{selectedLayerMeta.short}</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading compact">
            <div>
              <span className="section-label">Interactive graph</span>
              <h3>Capability path</h3>
            </div>
            <Network size={20} />
          </div>
          <div className="capability-graph">
            {demo.graph.map(([from, to, layer], idx) => {
              const meta = layerMeta[layer];
              const active = selectedNode === idx;
              return (
                <button
                  key={`${from}-${to}-${idx}`}
                  className={`edge-row ${meta.colorClass} ${active ? "active" : ""}`}
                  onClick={() => {
                    setSelectedNode(idx);
                    setSelectedLayer(layer);
                  }}
                >
                  <span>{from}</span>
                  <ArrowRight size={16} />
                  <span>{to}</span>
                </button>
              );
            })}
          </div>
          <div className="node-details">
            {selectedNode === null ? (
              <span>Click a path to inspect the layer that owns it.</span>
            ) : (
              <span>
                <strong>{demo.graph[selectedNode][0]}</strong> hands off to <strong>{demo.graph[selectedNode][1]}</strong> through the {layerMeta[demo.graph[selectedNode][2]].label.toLowerCase()}.
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="workflow-grid">
        <div className="panel large-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Step-through trace</span>
              <h3>What happens when the app runs?</h3>
            </div>
            <div className="transport">
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
                {playing ? "Pause" : "Play"}
              </button>
              <button onClick={() => setStep((s) => clampStep(s - 1, demo.steps))}>Back</button>
              <button onClick={() => setStep((s) => clampStep(s + 1, demo.steps))}>Forward</button>
              <button onClick={() => { setStep(0); setPlaying(false); }}><RefreshCcw size={15} /> Reset</button>
            </div>
          </div>

          <div className="timeline">
            {demo.steps.map((s, idx) => {
              const meta = layerMeta[s.layer];
              return (
                <button
                  key={s.label}
                  className={`timeline-step ${meta.colorClass} ${idx === step ? "active" : ""} ${idx < step ? "done" : ""}`}
                  onClick={() => { setStep(idx); setSelectedLayer(s.layer); }}
                >
                  <span>{idx < step ? <CheckCircle2 size={16} /> : idx === step ? <CircleDot size={16} /> : idx + 1}</span>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className={`active-step ${layerMeta[currentStep.layer].colorClass}`}>
            <div>
              <span className="section-label">Current step</span>
              <h3>{currentStep.label}</h3>
              <p>{currentStep.detail}</p>
            </div>
            <div className="writeback-list">
              <strong>Writeback</strong>
              {currentStep.writes.map((w) => <span key={w}>{w}</span>)}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading compact">
            <div>
              <span className="section-label">Scenario control</span>
              <h3>{demo.scenario.title}</h3>
            </div>
            <GitBranch size={20} />
          </div>

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
      </section>

      <section className="panel ledger-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">Decision ledger</span>
            <h3>Comments, decisions, risk, next steps, and ground truth</h3>
          </div>
          <ShieldCheck size={21} />
        </div>
        <div className="ledger-grid">
          {demo.steps.slice(0, step + 1).map((s, idx) => (
            <div key={`${s.label}-${idx}`} className={`ledger-row ${layerMeta[s.layer].colorClass}`}>
              <span>{idx + 1}</span>
              <strong>{s.label}</strong>
              <p>{s.writes.join(" · ")}</p>
            </div>
          ))}
        </div>
        {step < demo.steps.length - 1 && (
          <div className="ledger-empty">
            <AlertTriangle size={16} /> Continue the trace to see more durable records.
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
