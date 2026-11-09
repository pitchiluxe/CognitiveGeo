# CognitiveGeo

A vanilla JavaScript, Vite, and Three.js global AI infrastructure explorer. Includes a dotted 3D Earth, model runtime clusters, animated communication and threat paths, sample sovereign zones, a compute timeline, city infrastructure schematics, and adaptive performance monitoring.

Created by **Erick Omari**. [Website](https://pitchiluxe.github.io/CognitiveGeo/) · [Windows download](https://github.com/pitchiluxe/CognitiveGeo/releases/latest/download/CognitiveGeo-Setup.exe) · [Releases](https://github.com/pitchiluxe/CognitiveGeo/releases).

## Client studio: from an idea to a delivered project

Choose **Plan a client project** on an idea or country-service detail to prefill a prospect's brief, then enter the actual organization. **Client studio** has seven connected sections:

- **Customer pipeline:** organization, country, stage, public source and your review date, permitted contact details, next dated action, project brief, notes, and an opt-out flag. Opt-outs block outreach drafting. Records on the globe use country anchors, not exact client addresses. Stages do not establish a buying commitment.
- **Proposals:** create an editable customer-specific proposal with scope, acceptance, schedule, proposed USD fees, responsibilities and exclusions. Save/copy/download Markdown. Outreach templates are drafts only. Optional local Ollama refinement sends only the selected organization name, idea, problem, MVP, outcome and safeguards, after Generate is clicked. Contact details, research notes and IAM uploads are excluded. AI output stays separate until explicitly appended. No message, signature or tender submission is sent.
- **Opportunity radar:** fetch paginated public World Bank procurement metadata through a fixed-host adapter. Awarded/closed records, planning notices, expired dates and missing deadlines are distinguished. Budgets are deliberately unknown rather than extracted from award prices. Verify original documents, amendments, local deadline time and eligibility. UNGM is a clearly labeled official-source handoff, not a connected feed. A notice can prefill a researched prospect; it does not become a confirmed client.
- **Pilot results:** record baseline/result, unit, whether higher/lower is better, comparable task volume, explicit USD value per unit, period cost, measurement source and status. Zero baselines have no percentage change. Monetary value is a user-supplied scenario; the tool does not establish causation, attributable savings or customer acceptance.
- **Build workspace:** track acceptance tasks and evidence. Pass requires an evidence note or link and is labeled self-reported. Download a ZIP containing a runnable loopback-only Node.js review-queue starter, persistent work items, a basic test, the selected brief, coding-agent assignment and acceptance checklist. The domain workflow, production authentication, AI integrations and deployment still need implementation. Repository/deployment links are entered by the user and are not independently verified; downloading does not create a repository or deploy an application.
- **IAM assessment:** inspect a minimal authorized CSV (5 MB / 5,000 rows), using explicit read-only rules for privileged accounts without MFA, missing owners, terminated-but-active accounts, stale active logins and duplicate IDs. Missing fields remain unknown. Account rows stay in memory, never enter AI prompts or the workspace backup, and can be cleared. A downloaded assessment is user-controlled. No account is changed and findings are not proof of compromise or a compliance certification.
- **Local partners:** maintain a sourced directory of implementation, training, language-review and support providers. Four DRC public-source research starting points are included separately from your records. Provider descriptions, credentials, references, availability and commercial suitability require verification; there is no endorsement or confirmed partnership.

Studio data is stored in browser localStorage on this device, separately per website/desktop origin; it is not encrypted team storage or cloud synchronization. Export JSON backups and restore them through validation and an explicit replacement button. Backups are limited to 5 MB; each collection is limited to 1,000 records. Invalid imports do not replace current data, and conflicting writes from another tab are rejected. Storage failures leave changes in memory with an export warning. Do not enter passwords, private keys or access tokens. Shared map URLs do not transfer private workspace records.

`src/studio-data.js`, `src/iam-assessment.js`, `src/procurement-data.js` and `src/build-workspace.js` contain the tested data/assessment/export rules. `src/client-studio.js` is the UI. `server/procurement.js` is shared by the Vite development adapter, Electron loopback server and Vercel `api/procurement.js`. Only public keyword queries are sent to the World Bank; raw notice HTML and individual contact fields are not returned to the client. GitHub Pages attempts the public source directly and shows explicit errors if cross-origin access is unavailable.

## Website and Windows edition

The matching landing page is `index.html`; the interactive atlas is `app.html`. Both are included in the production build. The Windows x64 edition bundles the atlas, its datasets, the local Ollama connection, and the public model-registry proxy. Ollama must be installed and running separately. The website's public model search connects directly to Hugging Face; local generation is available in the Windows edition or the local development server.

Run `npm run desktop` to open the desktop edition locally. Run `npm run package:win` to build `release/CognitiveGeo-Setup.exe`, its blockmap, and `latest.yml`; run `npm run release:checksums` to generate SHA256SUMS.txt. The assisted installer creates shortcuts and lets users choose an installation folder. The app serves its bundled files only on loopback port 35471, keeping saved browser data consistent across launches. Its renderer is isolated and has no direct Node.js access.

Every push to `main` runs two GitHub Actions workflows: GitHub Pages deploys the landing page and web atlas, and the Windows workflow tests, builds, and publishes a new GitHub Release with installer, update feed, blockmap, and checksums. The release version uses the source major/minor plus the source patch plus the Windows workflow run number. Change the source major/minor for a new release series. A successful release is required before clients can discover an update; a push alone is not a published update.

Installed apps check for updates after startup, every six hours while open, and on focus after fifteen minutes. Help → Check for updates checks immediately. New versions produce an in-app banner and a Windows notification when notifications are enabled. Users choose Download, then Restart & install; downloads and installation are not forced. Shortlists and imported data stay on the computer. The public release feed requires no GitHub login.

The first releases are unsigned because no Windows signing certificate has been supplied; Windows may show an unknown-publisher warning. To sign future CI builds, configure repository secrets `WINDOWS_CERTIFICATE` (electron-builder CSC_LINK format) and `WINDOWS_CERTIFICATE_PASSWORD`. Keep signing material out of source control. Update signature verification has not been disabled.

The multi-resolution Windows ICO and matching PNG/SVG are in `desktop/resources/` and `public/brand/`. `scripts/build-icon.py` regenerates them with Pillow.

## Country opportunities and country-name tags

**Countries & needs** covers 193 UN member states plus the Holy See and State of Palestine (195 entries). Territories and other disputed-status jurisdictions are outside this explicit roster. Search by name/ISO code, filter by region or opportunity sector, or choose **Explore DRC**. Each country has dated national internet-use and electricity-access observations where available, delivery constraints, buyer categories, 14 reusable proposed services, illustrative setup/subscription pricing, and a revenue calculator. Four services concern IAM: joiner/mover/leaver workflows, access certification, privileged access requests, and inclusive account-onboarding support. Open a proposal's launch agent for its build prompts and customer playbook; export country research or an individual opportunity as JSON.

Country coverage is geographic; it is not a claim that every country's market gaps, laws, clients, AI deployments, or willingness to pay have been researched. Service patterns are general hypotheses adapted with country metadata. Countries without reviewed deployment examples explicitly say so. Positive-use examples for Kenya/Tanzania and India are sourced separately; the DRC civil-servant registry is labeled a digital foundation, not an AI deployment. DRC has an editorial first-buyer sequence, locally validated language guidance, and a 90-day pilot-to-recurring-service plan. Potential clients are organization types, not confirmed leads. National reform requires institutions, infrastructure, accountability, and evidence from multiple deployments.

The map's **Country names** checkbox shows/hides country-name tags in every app view, remembers the preference on this device, and hides labels behind the Earth or in city view. Tags avoid overlap and increase in density on zoom. Country names also appear on the landing globe. Labels and country opportunity markers use representative national coordinates, not exact capitals or known installations. Additional Layers includes country-opportunity and IAM-proposal anchors.

`public/countries.json` is an attributed snapshot: adapted geography from [mledoze/countries](https://github.com/mledoze/countries) under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/); national indicators from World Bank WDI (ITU internet-use series and World Bank/ESMAP electricity-access series) under CC BY 4.0. Observation years and database update dates are retained; missing values stay unknown. The geographic data's Vatican City membership flag is corrected to observer status. This adapted country database is distributed under ODbL 1.0, with indicator-source attribution retained; this notice does not relicense the app's code. Rebuild the snapshot with `node scripts/refresh-country-data.mjs` and inspect the roster/data before publishing. Internet below 50% and electricity below 70% trigger transparent delivery-planning heuristics, not demand or profitability scores.

Country service patterns and the DRC plan are in `src/country-opportunity-data.js`; the interface is `src/country-opportunities.js`. Infrastructure indicators cannot establish purchasing power, actual site reliability, or commercial success. Prices and costs are editable hypotheses; setup income is excluded from recurring-revenue calculations.

## AI atlas, ideas, and data centers

The left panel now has nine tabs:

- **Runtimes** keeps the original simulated compute and threat views.
- **AI atlas** maps 62 curated AI products, model families, and historical projects, including creator attribution, official links, sources, and review dates. Search by product, creator, or city; filter by category, region, access, or historical/modern era. Nearby profiles are grouped on the globe; click a count marker to choose a profile. This is not every AI ever created. Pins are approximate representative company/research hubs, not inference servers, exact offices, or proof of local product availability.
- **Ideas** contains 20 original product concepts, 60 illustrative market pins, target buyers, measurable benefits, suggested AI tools, distribution and sharing mechanisms, MVPs, and validation checklists. Market assessments are editorial hypotheses, not measured sales rankings or investment recommendations. Each market's score is the unweighted mean of four 1–5 assumptions (buyer budget, addressable reach, pilot feasibility, distribution fit), multiplied by 20.
- **Data centers** maps 65 sourced facility, campus, and selected regional-program records across Google, Microsoft, Equinix, and AWS. Filter by operator, region, and last-reported phase. Operational, under construction, commissioning, in development, announced, and unclear are distinct statuses. A future opening target does not establish construction. Building completion does not establish operational opening. This starter index is not a census of all data centers, and many operators are not yet covered.

Save entries to a browser-local shortlist and filter to saved entries. Compare two or three AI profiles or ideas side by side. Download filtered JSON lists, share filtered view URLs, or export an idea launch brief with the current revenue scenario and checklist progress. A local preview share link requires the same app to be running at that address; deploy the static build to share publicly. Shortlists, imported facility data, and checklists are not transmitted and are not encoded in shared URLs.

The revenue calculator uses user-editable USD assumptions: accounts × monthly price gives monthly revenue, multiplied by 12 for annual revenue. Variable cost is subtracted for gross profit; entered fixed costs are also subtracted for the operating estimate. It calculates the account count required for $1M annual revenue. This assumes constant paying accounts and excludes churn, acquisition ramp, taxes, financing, refunds, and unmodeled expenses. The initial prices and costs are illustrative assumptions, not vendor quotes. Neither revenue nor virality is guaranteed.

### Expand the data-center inventory

Download **Template** in the Data centers tab, populate it with sourced records, and choose **Import JSON / GeoJSON**. A JSON array or exported object with `entries` uses `[latitude, longitude]`. A GeoJSON `FeatureCollection` uses Point geometry in standard `[longitude, latitude]` order, with the other fields in `properties`. Required fields are `id`, `name`, `operator`, `city`, `country`, `region`, `coordinates`, `status`, `reportedOn` (valid `YYYY-MM-DD`), and `sourceUrl` (HTTPS). Region identifiers are `americas`, `europe`, `asia`, `africa`, and `oceania`; use one of the exact status labels above with initial capitalization as shown in the app/template. Optional fields are `description`, `targetOpening`, `locationNote`, `reviewedOn`, and `provenance`.

Imports are validated before mutation, limited to 20 MB / 20,000 records, labeled user-provided, and merged by ID. Matching facility IDs replace existing records in this browser; remove imports to restore the bundled baseline. Browser storage can be limited, so export a backup. Large map inventories use instanced marker geometry. Imported records have not been independently verified. Data Center Map's external directory/dataset link is included for broader coverage; its data is not bundled, scraped, or integrated, and licensing must be handled separately.

Source snapshots were reviewed on **2026-11-08**. `reportedOn` is the known publication date or, for an undated directory, the review date; it is not a live inspection. All facility positions are approximate city/county centroids, and a campus may have multiple buildings or phases. For example, the newer SG6 opening announcement overrides its older expansion timeline, and Vaughan's completed building remains labeled commissioning because the operator says it is not yet operational. Always check the linked source for subsequent changes.

Discovery data is stored in `public/catalog.json`, `public/opportunities.json`, and `public/datacenters.json`. Update those files to maintain or extend the index. Official product/creator sources are embedded per record. OECD SME AI research and the World Bank digital report provide general opportunity context; they do not validate individual ideas, local demand, scores, or forecasts.

## Models, history, map overlays, and Ollama

### Idea launch agent

The Ideas panel's **Generate 20 random ideas** button creates 20 distinct randomized variations of the curated concepts, with 60 illustrative pilot-market pins. Each result supports the launch agent, revenue scenarios, comparison, shortlist, and export. The next batch avoids the immediately previous combinations. The latest batch and recent variations are restored from browser storage; saved generated concepts are retained when generating again. Use **Show ideas** to switch between the latest batch, all ideas, and curated originals. These are local template remixes, explicitly labeled separately from Ollama-generated output; no model or web research runs when the button is clicked. Pilot locations and commercial assumptions are inherited hypotheses, not evidence of demand. Export a backup if device storage is unavailable. A shared URL alone does not transfer a generated concept to another device.

Select an idea and choose **Open idea launch agent** in its details. Choose its pilot market, target weeks, and your requirements. The ready-to-use starter pack includes a product blueprint, master implementation prompt, six specialist agent briefs, and a customer playbook covering niche research, first contact, follow-ups, discovery, a scoped pilot, onboarding, acceptance, and customer support. Each pack uses that idea's actual MVP, buyer, risk, outcome, and market rationale. Copy individual sections into your coding/planning agent or download the complete Markdown pack.

Starter packs are contextual templates, available on the hosted website without a model connection. **Refine with your local AI agent** connects to installed local Ollama models in the Windows edition or local development server. It adds a separately labeled AI draft with requirements, implementation, outreach, rollout, and risks. Incomplete results are rejected; cancellation or failure preserves the starter pack. Entered requirements go only to that local model when Generate is clicked; no contacts are researched or messages sent automatically. No new platform is built or deployed by this UI. Review plans and use the prompts with an agent that has the appropriate tools. Downloads keep the pack; it is not persisted automatically.

Idea background reading uses the official OECD publication page and World Bank full-report PDF, plus permanent DOI alternatives. These are external sources; their availability and access restrictions remain controlled by the publishers.

**Models** searches live public Hugging Face repositories through a fixed-host local preview proxy. Results are paginated (50 per page); no model weights are downloaded. Publisher hubs are mapped only when they are present in the curated `public/publishers.json` table. Unknown publisher locations remain searchable but are not pinned. Public repositories do not cover every private, deleted, or unpublished AI, and publisher locations are not exact training or serving sites. The AI atlas retains source-linked profiles for proprietary products such as ChatGPT, Claude, Grok, and Gemini.

**History & learn** contains 16 selected historical/learning cards, with a 1950–2026 range control and a six-week suggested learning roadmap. Representative research/event cities are distinguished from exact creation locations. The final guidance card is not presented as a historical breakthrough. Sources and learning links appear in the app.

**Generated** displays the current Ollama-generated map for this browser session and supports JSON export. Use **OLLAMA Generate** at the upper-right of the map. Start the locally installed Ollama service and ensure at least one suitable local generation model is installed; use the studio’s installed-model dropdown and Reconnect button. Cloud and embedding models are excluded from that dropdown. No weights are downloaded automatically. Larger models can be slower, and structured-output quality varies by model. Requests can be canceled and time out after three minutes. A failure does not change the map.

The model receives the entered prompt and a compact set of public catalog records, not imported facility data. Research mode is constrained to existing catalog record IDs; factual pin names, source links, coordinates, and statuses are copied from those records, not invented by the model. Commentary is still unverified, and Ollama does not browse the web. Invention mode produces speculative proposals anchored to supplied pilot cities. It does not establish novelty, feasibility, local demand, deployment, profit, or world-changing impact. Export results to keep them beyond this session.

The map’s **Layers** button adds eight optional overlays: AI engines, open-weight models, the current public registry results with known hubs, operating data centers, construction/commissioning, development/announced projects, invention pilot cities, and historical milestones. These combine with the current base view; nearby records have a chooser when clicked. Original simulated runtime and threat layers remain in the Runtimes panel.

Model selection uses dropdowns: the runtime panel has local model families plus shortcuts to hosted-engine creator profiles; the AI atlas has a model-family dropdown and an engine dropdown for ChatGPT, Anthropic Claude, Grok, and Google Gemini. Hosted engines are not represented as local Ollama deployments.

### Local API setup

`vite.config.js` proxies only `/api/ollama/tags` and `/api/ollama/generate` to `http://127.0.0.1:11434`. The app must run on the same computer as that Ollama service. `/api/model-registry` forwards to the public Hugging Face model listing endpoint. This avoids requiring changes to Ollama CORS or network exposure settings. Restart Vite after changing proxy configuration. Ollama must remain running for generation.

A static `dist/` deployment retains the bundled atlas, history, ideas, and data centers but does **not** include the Vite proxies. GitHub Pages registry search uses the public Hugging Face API directly. Local generation on a hosted website requires an appropriately secured backend; a hosted server’s `127.0.0.1` is not a visitor’s computer. The Windows edition includes a loopback-only bridge to the user's Ollama service. Connection errors are shown explicitly rather than replaced by simulated model responses.

Official references: [Ollama generate API](https://docs.ollama.com/api/generate), [structured outputs](https://docs.ollama.com/capabilities/structured-outputs), [installed model listing](https://docs.ollama.com/api/tags), and [Hugging Face Hub API](https://huggingface.co/docs/hub/api).

## Run locally

1. Install Node.js 22 or newer.
2. Open a terminal in this project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the Local URL printed by Vite (usually http://127.0.0.1:5173).

For a production build, run `npm run build`. The deployable static output is in `dist/`. Run `npm run preview` to check it locally. No API keys, environment variables, backend, or React installation are required. Google Fonts is optional; local font fallbacks work without it. Geographic geometry is bundled from world-atlas, so the globe does not depend on a remote map or texture service.

## Controls

- Drag the globe to orbit, scroll or use +/− to zoom, and use Reset to return to the initial view.
- Click a globe marker or a hub in the list to inspect hardware, model speeds, context allocations, and gateway security.
- Search by city, country, or cluster ID. Region and model family filters combine with search. Press `/` to focus search.
- Toggle AI clusters, attack trajectories, and sample compliance rings independently. Color runtime nodes by gateway security, token speed, context size, or VRAM footprint.
- Use Threat intelligence to view sample security events.
- Select a timeline year or press Play. 2022–2026 values are synthetic scenarios; 2027–2030 values use a 49% annual growth assumption. These are not historical observations or validated forecasts.
- Inspect city infrastructure opens a procedural 3D schematic with data center and edge-device blocks. Return to globe restores the selected city's global position.
- The location button uses the browser's permission prompt, then draws a sample flight path from the returned location to the demo inference hub. Coordinates stay in this browser session and are not transmitted to a server.
- Export snapshot downloads JSON including year, layers, filters, selected cluster, and matching data. The header download exports the filtered cluster array in the original schema.
- Click the avatar for auto-rotation and bloom settings. The question mark explains the demo.

## Data and scope

`public/data.json` uses the requested schema exactly, including both provided records and 16 additional synthetic hubs. Coordinates are **[latitude, longitude]**. The model identifiers are scenario labels supplied in the brief, not a verified catalog of released models. Metric totals derive from mock records; runtime vector counts and throughput are modeled. Security events update on a local timer, not from a live feed.

This application does not scan networks, discover exposed APIs, or collect real threat intelligence. Sample compliance rings are illustrative cluster footprints, not authoritative jurisdictional boundaries. The city view is a deterministic infrastructure schematic, not satellite imagery, real street view, or surveyed building footprints. Real monitoring, historical data, compliance maps, and street imagery require authorized upstream data and service integrations.

## Architecture

- `src/globe.js` — `GlobeScene`: WebGL scene, OrbitControls, bundled geographic geometry, shader atmosphere, bloom postprocessing, picking, batched runtime points, packet paths, geometry LOD, procedural city view, and resource cleanup.
- `src/telemetry.js` — `TelemetryAPI`: fetches and validates the mock cluster dataset. Also provides pure filter and projection functions.
- `src/main.js` — `TrackerUI`: UI state, event binding, accessible controls, filtering, details, exports, and the Agent Doctor HUD.
- `src/style.css` — responsive console layout, design tokens, keyboard focus, and reduced-motion support.
- `src/discovery.js` / `src/discovery-data.js` — directory and idea UI, validated loading, filtering, saved lists, comparisons, share links, launch briefs, and revenue modeling.
- `src/facilities.js` / `src/facility-data.js` — sourced facility UI, phase filters, strict JSON/GeoJSON imports, persistence, and exports.
- `src/discovery.css` / `src/responsive.css` — responsive explorer and comparison layouts.

## Performance

12,846 runtime vectors render in one `THREE.Points` batch at the 2026 baseline, increasing to 63,316 in the 2030 scenario. Earlier years reduce the batch draw range. The globe selects between two geometry detail levels by camera distance. Land geometry and procedural textures are created once; stars and packets reuse buffers/geometries. Agent Doctor samples actual render rate and lowers pixel ratio in steps when it falls below 42 FPS, with a 0.75 floor. Rendering pauses when the tab is hidden. Auto-rotation and packet motion respect reduced-motion preferences. Heap figures use Chromium's optional `performance.memory` API and display N/A elsewhere.

60 FPS is a target, not a hardware-independent guarantee. On slower GPUs the HUD reports the measured frame rate and adaptive quality. The visual stack uses bloom and shader atmosphere; ambient occlusion is not included because the global map uses emissive/unlit geometry. City buildings use edge outlines to keep the schematic legible.

## Verify

Run `npm test` for dataset integrity, combined filters, and timeline projections. Run `npm run build` to verify production bundling. A WebGL-capable browser with hardware acceleration is recommended. If WebGL is unavailable, the app retains searchable cluster details, filters, timeline, and exports with a clear map error.

Geographic source: world-atlas / Natural Earth (public domain). Package licenses remain with their respective authors.
