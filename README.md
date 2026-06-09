# Databricks Apps · Art of the Possible React Prototype

This is a lightweight Vite + React front-end prototype for three Databricks Apps demos:

1. Real-Time Operations Resolution Center
2. Autonomous Growth & Margin Optimizer
3. Enterprise Decision Fabric & Custom MCP Hub

The prototype is intentionally front-end only. It demonstrates the user, logic, data, and infrastructure layers with different colors, plus interactive architecture cards, step-through traces, capability paths, scenario sliders, and a writeback ledger.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

## Files

- `src/main.jsx` — all React components and demo data
- `src/styles.css` — visual system and layer colors
- `package.json` — Vite scripts and dependencies

## Suggested Databricks mapping

- User layer: Databricks App UI, reviewers, approvers, operators
- Logic layer: agents, policies, workflows, optimization, simulation, finite-state transitions
- Data layer: Unity Catalog tables, Genie Spaces, features, decision ledger, ground truth
- Infrastructure layer: Databricks Apps, SQL Warehouse, Lakeflow Jobs, Model Serving, MCP, Lakebase
