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
    title: "Real-Time Operations Watchtower",
    subtitle: "Monitor live, alert on breach, explain it, simulate bounded fixes, route approval, execute, and learn.",
    goal: "Catch customer-impacting failures before they breach SLA.",
    mode: "Constrained agent inside a real-time workflow",
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
      { label: "Monitor", layer: "data", actor: "Streaming pipeline", detail: "Structured Streaming tracks lane temperature, ETAs, and DC throughput against expected bands.", writes: ["stream_offset", "metric", "expected_band"] },
      { label: "Alert", layer: "data", actor: "Monitoring rule", detail: "A refrigerated Northeast lane breaches its SLA-risk threshold — the trigger fires automatically, no human asked.", writes: ["alert_id", "entity", "severity", "detected_at"] },
      { label: "Explain", layer: "logic", actor: "Agent · Genie", detail: "The constrained agent drills in via Genie: late inbound inventory and a carrier delay are the dominant causes.", writes: ["root_cause", "confidence", "supporting_queries"] },
      { label: "Simulate", layer: "logic", actor: "Agent", detail: "Agent proposes three bounded options — expedite, reroute, split shipment — each with cost, ETA gain, and risk.", writes: ["scenario_id", "expected_cost", "expected_sla_gain", "risk"] },
      { label: "Approve", layer: "user", actor: "Human · ops manager", detail: "Expedite cost exceeds policy, so the action pauses for human approval before anything executes.", writes: ["approval_request", "approver", "rationale"] },
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
      { label: "Optimize", layer: "logic", actor: "Agent", detail: "It selects the plan that maximizes expected margin under brand, legal, and inventory constraints.", writes: ["chosen_plan", "constraint_check", "expected_margin"] },
      { label: "Approve", layer: "user", actor: "Human · finance", detail: "Because the plan changes customer-facing prices, a human approves, edits, or rejects it.", writes: ["approval", "comments", "risk_acceptance"] },
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
    cards: [
      { layer: "user", title: "Role-based queues", body: "Customer/RM intake, ops-analyst queue, compliance desk, approver inbox — each role sees only its stage and permitted actions." },
      { layer: "logic", title: "FSM + agent assist", body: "A state machine gates each transition on required inputs; agents extract docs, pre-screen sanctions/PEP, and draft risk summaries." },
      { layer: "data", title: "Decision memory & audit", body: "Cases, comments, decisions, risks, recommendations, ground truth, and a full who-did-what audit trail." },
      { layer: "infra", title: "Databricks resources", body: "Lakebase (state + audit), Unity Catalog (governed customer data), Model Serving (doc extraction, risk), Lakeflow Jobs (provisioning)." },
    ],
    steps: [
      { label: "Apply", layer: "user", actor: "Human · customer / RM", detail: "Application is captured and a case opens; the SLA clock starts on the first state.", writes: ["case_id", "applicant", "product", "submitted_at"] },
      { label: "Verify docs", layer: "logic", actor: "Human · ops analyst (agent-assist)", detail: "The agent extracts and validates ID and proof of address; the ops analyst confirms or rejects to advance the case.", writes: ["doc_extract", "id_match_score", "analyst_decision"] },
      { label: "Risk review", layer: "logic", actor: "Human · compliance (agent-assist)", detail: "The agent pre-screens sanctions and PEP lists and drafts a risk summary; the compliance officer adds judgment.", writes: ["sanctions_hits", "pep_flag", "risk_summary_draft", "officer_notes"] },
      { label: "Approve", layer: "user", actor: "Human · approver", detail: "Approver decides: approve, escalate, or loop the case back to an earlier state for more information.", writes: ["decision", "conditions", "loopback_reason", "approver"] },
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
          Three Databricks App demos along one spectrum — constrained agent, fully autonomous,
          human-driven workflow. Press play and follow the decision: each step writes a durable
          record, fans out across the stack, and lands in the ledger.
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
