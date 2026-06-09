import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
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
    title: "Real-Time Operations Resolution Center",
    subtitle: "Detect SLA risk, explain it, simulate fixes, route approval, execute, and learn.",
    goal: "Prevent customer-impacting failures before they breach SLA.",
    mode: "Constrained agent inside a deterministic workflow",
    accent: "ops",
    metricLabel: "SLA risk avoided",
    metricValue: "$220K",
    status: "Approval required",
    cards: [
      { layer: "user", title: "Ops command center", body: "Triage queue, case owner, approval panel, customer comms draft." },
      { layer: "logic", title: "Exception workflow", body: "Detect → classify → root-cause → simulate → approve → execute → verify." },
      { layer: "data", title: "Streaming + warehouse data", body: "Orders, telemetry, carrier events, inventory, customer priority, history." },
      { layer: "infra", title: "Databricks resources", body: "Apps UI, Lakeflow Jobs, SQL Warehouse, Model Serving, Genie, Lakebase." },
    ],
    steps: [
      { label: "Alert", layer: "data", detail: "Streaming order events show Northeast SLA risk rising above threshold.", writes: ["alert_id", "entity", "severity", "detected_at"] },
      { label: "Explain", layer: "logic", detail: "Genie drilldown identifies late inbound inventory and carrier delay as dominant causes.", writes: ["root_cause", "confidence", "supporting_queries"] },
      { label: "Simulate", layer: "logic", detail: "Run three remediation options: expedite, reroute, split shipment.", writes: ["scenario_id", "expected_cost", "expected_sla_gain", "risk"] },
      { label: "Approve", layer: "user", detail: "Finance approval required because expedite cost exceeds threshold.", writes: ["approval_request", "approver", "rationale"] },
      { label: "Execute", layer: "infra", detail: "Lakeflow Job pushes the approved reroute plan to fulfillment and carrier systems.", writes: ["job_run_id", "action_payload", "idempotency_key"] },
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
    subtitle: "A goal-seeking app that explores data, forecasts, simulates, optimizes, and asks humans to decide.",
    goal: "Recover margin while protecting revenue, inventory health, and CX.",
    mode: "Fully agentic, goal-seeking app with approval boundaries",
    accent: "optimizer",
    metricLabel: "Expected margin lift",
    metricValue: "+143 bps",
    status: "Scenario review",
    cards: [
      { layer: "user", title: "Planning cockpit", body: "VP goal, category-manager review, finance/legal approvals, launch decision." },
      { layer: "logic", title: "Goal-seeking agent", body: "Hypothesize → query → forecast → simulate → optimize → recommend → monitor." },
      { layer: "data", title: "Business semantic layer", body: "Sales, margin, elasticity, inventory, cohorts, promo calendar, constraints." },
      { layer: "infra", title: "Databricks resources", body: "Genie, SQL Warehouse, Model Serving, Jobs, MLflow traces, Lakebase ledger." },
    ],
    steps: [
      { label: "Set goal", layer: "user", detail: "Business owner sets target: recover 150 bps of gross margin this quarter.", writes: ["goal", "metric", "constraints", "owner"] },
      { label: "Explore", layer: "logic", detail: "Agent uses Genie to find categories with margin leakage and demand resilience.", writes: ["hypothesis", "query_trace", "evidence"] },
      { label: "Predict", layer: "logic", detail: "Forecast demand, churn, inventory exposure, and revenue impact per candidate action.", writes: ["forecast_id", "confidence_interval", "feature_snapshot"] },
      { label: "Optimize", layer: "logic", detail: "Choose the plan that maximizes expected margin under brand, legal, and inventory constraints.", writes: ["candidate_plan", "constraint_check", "expected_value"] },
      { label: "Approve", layer: "user", detail: "Human approves because the plan changes customer-facing prices and promo depth.", writes: ["approval", "comments", "risk_acceptance"] },
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
    subtitle: "A mostly headless app exposing governed tools, state machines, decision memory, and writeback APIs.",
    goal: "Make every app and agent safer, reusable, auditable, and stateful.",
    mode: "Headless app + custom MCP server + reusable workflow services",
    accent: "fabric",
    metricLabel: "Reusable tools exposed",
    metricValue: "14",
    status: "MCP server online",
    cards: [
      { layer: "user", title: "Admin & review console", body: "Tool registry, policy review, lifecycle stages, approval queues, audit search." },
      { layer: "logic", title: "MCP tool layer", body: "get_context, ask_genie, simulate_scenario, check_policy, record_decision." },
      { layer: "data", title: "Decision memory", body: "Cases, comments, approvals, risks, recommendations, ground truth, traces." },
      { layer: "infra", title: "Databricks resources", body: "Custom MCP on Databricks Apps, managed MCPs, Unity Catalog, AI Gateway, Lakebase." },
    ],
    steps: [
      { label: "Register", layer: "logic", detail: "Declare tools, schemas, permissions, and audit tier for each business capability.", writes: ["tool_name", "schema", "owner", "audit_tier"] },
      { label: "Call", layer: "infra", detail: "Another Databricks App or agent calls the custom MCP server as a governed tool provider.", writes: ["caller_app", "tool_call_id", "auth_context"] },
      { label: "Check", layer: "logic", detail: "Policy checks Unity Catalog permissions, risk tier, allowed side effects, and approval rules.", writes: ["policy_decision", "denied_fields", "approval_required"] },
      { label: "Act", layer: "logic", detail: "Tool executes: fetch context, run forecast, ask Genie, simulate, or create a workflow item.", writes: ["task_run", "artifact", "result"] },
      { label: "Transition", layer: "user", detail: "Finite-state workflow advances once required human and system outputs are present.", writes: ["from_state", "to_state", "actor", "required_outputs"] },
      { label: "Remember", layer: "data", detail: "Decision, rationale, comments, risk, and outcome are persisted for future apps.", writes: ["decision", "rationale", "feedback", "ground_truth"] },
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

const eventName = (s) => `${s.layer}.${s.label.toLowerCase().replace(/\s+/g, "_")}`;
const stamp = (i) => `03:14:${String(2 + i * 3).padStart(2, "0")}`;

function App() {
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
  const firingLayer = currentStep ? currentStep.layer : null;
  const firedLayers = new Set(executed.map((s) => s.layer));
  const layerCounts = layerOrder.reduce((acc, l) => {
    acc[l] = executed.filter((s) => s.layer === l).reduce((n, s) => n + s.writes.length, 0);
    return acc;
  }, {});

  const trail = executed
    .map((s, i) => ({ ...s, idx: i }))
    .filter((s) => trailLayer === "all" || s.layer === trailLayer);

  const scenario = demo.scenario.formula(sliderState);

  const togglePlay = () => {
    if (step >= total) setStep(0);
    setPlaying((p) => !p);
  };
  const goto = (n) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(n, total)));
  };

  return (
    <main className={`shell theme-${demo.accent}`}>
      <header className="masthead">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Databricks Apps
        </div>
        <div className="eyebrow">Art of the possible · interactive prototypes</div>
        <h1>Watch a data + AI native app actually run.</h1>
        <p className="lede">
          Three Databricks App demos. Press play and follow the decision: each step writes a
          durable record, fans out across the stack, and lands in the ledger.
        </p>
      </header>

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

      <section className="title-row">
        <div className="title-copy">
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

      {/* ---------- The run: day-in-the-life step-through ---------- */}
      <section className="run">
        <div className="run-header">
          <div>
            <span className="section-label">Day in the life</span>
            <h3>Step the app through its decision</h3>
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
          {/* Side-effect fan-out */}
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

          {/* Narration + dark trail */}
          <div className="run-detail">
            <div className={`narration ${currentStep ? layerMeta[currentStep.layer].colorClass : ""}`}>
              {currentStep ? (
                <>
                  <div className="narration-label">
                    Step {step} · {currentStep.label}
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
      </section>

      {/* ---------- Controls + ledger ---------- */}
      <section className="lower-grid">
        <div className="panel scenario-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Scenario control</span>
              <h3>{demo.scenario.title}</h3>
            </div>
            <GitBranch size={18} />
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

        <div className="panel ledger-panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">Decision ledger</span>
              <h3>Durable records, written as the app decides</h3>
            </div>
            <ShieldCheck size={18} />
          </div>
          {executed.length === 0 ? (
            <div className="ledger-empty">
              <CircleDot size={15} /> Run the trace to watch the ledger fill, one decision at a time.
            </div>
          ) : (
            <div className="ledger-grid">
              {executed.map((s, idx) => (
                <div key={`${s.label}-${idx}`} className={`ledger-row ${layerMeta[s.layer].colorClass} ${idx === step - 1 ? "fresh" : ""}`}>
                  <span className="ledger-num">{idx + 1}</span>
                  <strong>{s.label}</strong>
                  <div className="ledger-fields">
                    {s.writes.map((w) => <code key={w}>{w}</code>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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
