# Client Studio Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Turn a country or idea into a local customer pipeline, reviewable proposal, measured pilot, and delivery workspace.

**Architecture:** Add a Client studio explorer view with seven connected sections. Keep customer records local to the browser with validated JSON backup/restore; retrieve only public procurement data through a fixed-host adapter. Reuse the idea launch agent and country catalog; never send outreach, grant access, deploy projects, or claim supplier verification automatically.

**Tech Stack:** Existing Vite, JavaScript, Three.js, Electron, Node tests, Vercel functions; no new runtime dependency.

**Spec:** User-approved recommendations in this chat: proposal builder, customer pipeline, opportunity radar, pilot results, build workspace, IAM assessment, local partner directory.

## Global Constraints

- Preserve the existing globe, discovery data, country labels, and local Ollama studio.
- Customer data stays on this device; explicit export/import provides portability, not team synchronization.
- Distinguish official notice metadata, user-entered verification, generated drafts, and observed evidence.
- All AI refinements are explicit local Ollama requests; uploaded IAM records never enter prompts or persistent storage.
- No automatic email, tender submission, access change, repository publication, or cloud deployment.

## Review Focus

- Corrupt/oversized imports must fail without replacing existing records.
- Outreach opt-outs must be prominent and block generation of outreach drafts for that prospect.
- Missing IAM fields must remain unknown rather than silently passing a control.
- Procurement deadlines, budgets, and status must retain source evidence and unknown values.
- Negative/zero baselines, unsupported metrics, and unverified builds must not become claimed ROI or passing tests.

## Tasks

1. Add tested pure modules: `src/studio-data.js` (records, proposals, pilots), `src/iam-assessment.js` (CSV and evidence rules), `src/procurement-data.js` (source normalization), `src/build-workspace.js` (downloadable starter files).
2. Add `src/client-studio.js` and `src/client-studio.css`: local CRM; editable proposals and drafts; real notice search/import; pilot evidence; build task/evidence tracker; authorized read-only IAM assessment; user-maintained partner records.
3. Connect country use cases and idea details to prefilled studio forms. Add a ninth explorer tab, map customer/partner country anchors, and preserve all other explorer routes.
4. Add a fixed-host procurement adapter for Vite, Electron, and Vercel. Keep UNGM as an explicit official-source handoff when no licensed feed is connected.
5. Exercise data validation and failure modes with Node tests, build production assets, run desktop/mobile interface checks, update README, commit/push, and verify Vercel and Windows release publication.
