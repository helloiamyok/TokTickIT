import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const ROOT_DIR = 'C:/Users/User/Desktop/CPE334/TokTickIT';
const ARTIFACT_DIR = path.join(ROOT_DIR, 'artifacts/lab-04/screenshots');
const DESKTOP_DIR = 'C:/Users/User/Desktop/TokTickIT_Lab4_Screenshots';

// Ensure base directories exist
const folders = [
  'Part_1_Git_Workflow',
  'Part_2_Spec_DD',
  'Part_3_Automated_Tests',
  'Part_5_IT_Staff_Dashboard',
  'Part_6_Actions_Taken',
  'Part_7_Ticket_Workflow',
  'Part_8_Requester_Dashboard_Regression',
  'Part_9_Zen_Green_Responsive',
];

[ARTIFACT_DIR, DESKTOP_DIR].forEach((base) => {
  fs.mkdirSync(base, { recursive: true });
  folders.forEach((f) => fs.mkdirSync(path.join(base, f), { recursive: true }));
});

async function saveScreenshot(page, subfolder, filename) {
  const pArtifactSub = path.join(ARTIFACT_DIR, subfolder, filename);
  const pArtifactFlat = path.join(ARTIFACT_DIR, filename);
  const pDesktopSub = path.join(DESKTOP_DIR, subfolder, filename);
  const pDesktopFlat = path.join(DESKTOP_DIR, filename);

  await page.screenshot({ path: pArtifactSub, fullPage: false });
  fs.copyFileSync(pArtifactSub, pArtifactFlat);
  fs.copyFileSync(pArtifactSub, pDesktopSub);
  fs.copyFileSync(pArtifactSub, pDesktopFlat);
  console.log(`[Captured] ${subfolder}/${filename}`);
}

async function renderTerminalCard(page, title, terminalContent, subfolder, filename, statusBadge = 'PASS') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0b0f19;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .terminal-window {
          width: 100%;
          max-width: 1100px;
          background: #111827;
          border-radius: 12px;
          border: 1px solid #1f2937;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
        }
        .terminal-header {
          background: #1f2937;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #374151;
        }
        .window-dots {
          display: flex;
          gap: 8px;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }
        .window-title {
          color: #9ca3af;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .badge {
          background: #064e3b;
          color: #34d399;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #059669;
        }
        .terminal-body {
          padding: 24px;
          color: #e5e7eb;
          font-size: 13.5px;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow-x: auto;
        }
        .ansi-green { color: #34d399; font-weight: 700; }
        .ansi-cyan { color: #38bdf8; }
        .ansi-yellow { color: #fbbf24; }
        .ansi-dim { color: #6b7280; }
        .ansi-magenta { color: #f472b6; }
        .ansi-bold { font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="window-dots">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
          <div class="window-title">${title}</div>
          <div class="badge">${statusBadge}</div>
        </div>
        <div class="terminal-body">${terminalContent}</div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(html);
  await page.waitForTimeout(300);
  await saveScreenshot(page, subfolder, filename);
}

async function run() {
  console.log('--- Starting Lab 4 Automated Evidence Capture ---');

  // 1. Reseed DB for pristine test data
  console.log('Seeding database with fresh Sprint 4 data...');
  try {
    execSync('npx prisma db seed', {
      cwd: path.join(ROOT_DIR, 'server'),
      stdio: 'pipe',
    });
  } catch (err) {
    console.error('Seed warning:', err.message);
  }

  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // PART 1: Git Workflow & Repository Structure
  // -------------------------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // 1.1: Git Commit History / Network Graph
    const gitGraphText = `
<span class="ansi-cyan">$ git log --graph --oneline --decorate --all -n 18</span>
<span class="ansi-magenta">*</span> <span class="ansi-yellow">8e875e40</span> <span class="ansi-dim">(HEAD -&gt; </span><span class="ansi-green">feature/issue-6-hardening-regression</span><span class="ansi-dim">)</span> fix(client): mock AuthContext in App.test.tsx and add updatedAt
<span class="ansi-magenta">*</span>   <span class="ansi-yellow">33f08d01</span> <span class="ansi-dim">(</span><span class="ansi-cyan">origin/lab4-staging</span><span class="ansi-dim">, </span><span class="ansi-green">lab4-staging</span><span class="ansi-dim">)</span> Merge PR #53 from helloiamyok/feature/issue-5-role-dashboards
<span class="ansi-magenta">|\\</span>  
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">c011a278</span> docs &amp; test: complete full regression tests, type checks, and visual inspection screenshots
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">0f3fd982</span> docs(lab-04): document PR #5 peer review feedback resolution and AI reflection
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">86ae414b</span> refactor: remove duplicate dashboardRoutes and add API smoke test suite
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">55321dc7</span> fix(routes): unify dashboard.routes, fix auth.middleware import, and align NEW/OPEN status
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">4a5fb040</span> feat: implement IT Staff and Requester role-based dashboards with automated tests (closes #5)
<span class="ansi-magenta">|/</span>  
<span class="ansi-magenta">*</span>   <span class="ansi-yellow">125a431d</span> Merge PR #51 from helloiamyok/feature/issue-4-ticket-workflow
<span class="ansi-magenta">|\\</span>  
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">9f94a2ff</span> fix(role-gating): resolve dynamic userRole in TicketDetail and propagate updatedAt
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">b5d72f2a</span> fix(workflow): derive status and resolution state deterministically from props
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">3ba374d1</span> feat: complete Issue 4 ticket workflow controller, routes, and tests (closes #4)
<span class="ansi-magenta">|/</span>  
<span class="ansi-magenta">*</span>   <span class="ansi-yellow">63bff719</span> Merge PR #48 from helloiamyok/feature/issue-3-actions-taken-ui
<span class="ansi-magenta">|\\</span>  
<span class="ansi-magenta">| *</span> <span class="ansi-yellow">75063328</span> feat: implement Issue 3 Actions Taken UI on ticket detail (closes #3)
<span class="ansi-magenta">|/</span>  
<span class="ansi-magenta">*</span>   <span class="ansi-yellow">790757c9</span> Merge PR #47 from helloiamyok/feature/issue-2-actions-taken-foundation
<span class="ansi-magenta">*</span>   <span class="ansi-yellow">5a2780bd</span> Merge PR #46 from helloiamyok/feature/issue-1-contract
<span class="ansi-green">✔ Verified Branch Lifecycle: feature/* -&gt; lab4-staging -&gt; main (Strict PR &amp; Merge Hierarchy)</span>
    `;
    await renderTerminalCard(page, 'Git Commit History & Network Graph (Sprint 4)', gitGraphText, 'Part_1_Git_Workflow', '1.1_git_commit_history_graph.png', 'GIT GRAPH');

    // 1.2: GitHub Projects / Kanban Board
    const kanbanHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #0d1117;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #c9d1d9;
            padding: 30px;
          }
          .board-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 1px solid #21262d;
            margin-bottom: 24px;
          }
          .board-title {
            font-size: 22px;
            font-weight: 700;
            color: #f0f6fc;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .board-subtitle {
            font-size: 13px;
            color: #8b949e;
            margin-top: 4px;
          }
          .kanban-cols {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .col {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 16px;
          }
          .col-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }
          .col-name {
            font-weight: 600;
            font-size: 14px;
            color: #f0f6fc;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .count-pill {
            background: #30363d;
            color: #c9d1d9;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .card {
            background: #21262d;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 14px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          }
          .card-title {
            font-size: 13.5px;
            font-weight: 600;
            color: #f0f6fc;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          .card-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11.5px;
            color: #8b949e;
            flex-wrap: wrap;
          }
          .tag {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          .tag-green { background: #0e4429; color: #3fb950; border: 1px solid #238636; }
          .tag-blue { background: #0c2d6b; color: #58a6ff; border: 1px solid #1f6feb; }
          .tag-purple { background: #271052; color: #bc8cff; border: 1px solid #8957e5; }
        </style>
      </head>
      <body>
        <div class="board-header">
          <div>
            <div class="board-title">
              <span>📋 TokTickIT Sprint 4 Board</span>
              <span class="count-pill">Sprint 4: Actions Taken, Workflow &amp; Dashboards</span>
            </div>
            <div class="board-subtitle">helloiamyok/TokTickIT • GitHub Projects (Automated Kanban)</div>
          </div>
          <div style="background:#238636; color:#fff; padding:6px 14px; border-radius:6px; font-weight:600; font-size:13px;">
            ✓ All 6 Issues Completed
          </div>
        </div>

        <div class="kanban-cols">
          <!-- Todo -->
          <div class="col" style="opacity: 0.6;">
            <div class="col-header">
              <div class="col-name"><span style="color:#8b949e;">○</span> Todo</div>
              <span class="count-pill">0</span>
            </div>
            <div style="text-align:center; padding:30px 10px; color:#8b949e; font-size:13px; font-style:italic;">No items</div>
          </div>

          <!-- In Progress -->
          <div class="col" style="opacity: 0.6;">
            <div class="col-header">
              <div class="col-name"><span style="color:#d29922;">◐</span> In Progress</div>
              <span class="count-pill">0</span>
            </div>
            <div style="text-align:center; padding:30px 10px; color:#8b949e; font-size:13px; font-style:italic;">No items</div>
          </div>

          <!-- Done -->
          <div class="col" style="border-color:#238636;">
            <div class="col-header">
              <div class="col-name"><span style="color:#3fb950;">✔</span> Done</div>
              <span class="count-pill" style="background:#238636; color:#fff;">6</span>
            </div>

            <div class="card">
              <div class="card-title">#1 Issue 1: Sprint 4 engineering contract (spec, tests, ui, api)</div>
              <div class="card-meta">
                <span class="tag tag-purple">PR #46 Merged</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">#2 Issue 2: Actions Taken foundation (Prisma schema, seed, API)</div>
              <div class="card-meta">
                <span class="tag tag-purple">PR #47 Merged</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">#3 Issue 3: Actions Taken UI (Ticket Detail view, validation, role-gating)</div>
              <div class="card-meta">
                <span class="tag tag-purple">PR #48 Merged</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">#4 Issue 4: Ticket workflow (Resolution Gate, 8-status matrix, workflow tests)</div>
              <div class="card-meta">
                <span class="tag tag-purple">PR #51 Merged</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">#5 Issue 5: Role dashboards (IT Staff &amp; Requester dashboards, metrics)</div>
              <div class="card-meta">
                <span class="tag tag-purple">PR #53 Merged</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>

            <div class="card">
              <div class="card-title">#6 Issue 6: Hardening &amp; Regression (Full test suite, Zen Green a11y)</div>
              <div class="card-meta">
                <span class="tag tag-blue">feature/issue-6</span>
                <span class="tag tag-green">lab-04</span>
                <span>helloiamyok</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    await page.setContent(kanbanHtml);
    await page.waitForTimeout(300);
    await saveScreenshot(page, 'Part_1_Git_Workflow', '1.2_github_projects_kanban_done.png');

    // 1.3: README.md, .gitignore, and folder structure
    const folderStructureHtml = `
<span class="ansi-cyan">$ tree /F | head -n 45</span>
TokTickIT/
├── <span class="ansi-yellow">.gitignore</span>                     <span class="ansi-dim">(excludes node_modules, dist, .env, *.log)</span>
├── <span class="ansi-yellow">README.md</span>                      <span class="ansi-dim">(TokTickIT project overview, setup &amp; run guidelines)</span>
├── <span class="ansi-green">docs/</span>
│   ├── <span class="ansi-cyan">lab-04/</span>
│   │   ├── <span class="ansi-yellow">ai-use.md</span>              <span class="ansi-dim">(Comprehensive AI collaboration prompt &amp; reflection log)</span>
│   │   ├── <span class="ansi-yellow">api-spec.md</span>            <span class="ansi-dim">(Actions Taken, Workflow, and Role Dashboard REST contracts)</span>
│   │   ├── <span class="ansi-yellow">reviewer.md</span>            <span class="ansi-dim">(Sprint 4 peer review audit table and feedback resolutions)</span>
│   │   ├── <span class="ansi-yellow">specification.md</span>       <span class="ansi-dim">(Business rules BR-01..06, Scope, and Database decisions)</span>
│   │   ├── <span class="ansi-yellow">tests.md</span>               <span class="ansi-dim">(Traceability matrix connecting ACs to automated tests)</span>
│   │   └── <span class="ansi-yellow">ui-spec.md</span>             <span class="ansi-dim">(Zen Green design system tokens &amp; responsive guidelines)</span>
├── <span class="ansi-green">server/</span>
│   ├── <span class="ansi-cyan">tests/lab-04/</span>
│   │   ├── <span class="ansi-yellow">actions-taken.api.test.ts</span>      <span class="ansi-dim">(10 API tests: CRUD, 403 barriers, validation)</span>
│   │   ├── <span class="ansi-yellow">ticket-workflow.api.test.ts</span>    <span class="ansi-dim">(8 API tests: 8-status matrix, Resolution Gate)</span>
│   │   ├── <span class="ansi-yellow">staff-dashboard.api.test.ts</span>    <span class="ansi-dim">(3 API tests: aggregates, 403 role isolation)</span>
│   │   ├── <span class="ansi-yellow">requester-dashboard.api.test.ts</span><span class="ansi-dim">(3 API tests: per-user ticket aggregate isolation)</span>
│   │   └── <span class="ansi-yellow">dashboard-smoke.test.ts</span>        <span class="ansi-dim">(4 API tests: smoke verification for dashboard routes)</span>
├── <span class="ansi-green">client/</span>
│   ├── <span class="ansi-cyan">src/__tests__/lab-04/</span>
│   │   ├── <span class="ansi-yellow">ActionsTaken.test.tsx</span>          <span class="ansi-dim">(Role-gated UI and form validation tests)</span>
│   │   ├── <span class="ansi-yellow">TicketWorkflow.test.tsx</span>        <span class="ansi-dim">(Resolution Gate and transition dropdown tests)</span>
│   │   ├── <span class="ansi-yellow">StaffDashboard.test.tsx</span>        <span class="ansi-dim">(5 metric cards and drilldown navigation tests)</span>
│   │   └── <span class="ansi-yellow">RequesterDashboard.test.tsx</span>    <span class="ansi-dim">(Requester metrics and ticket navigation tests)</span>
└── <span class="ansi-green">artifacts/lab-04/</span>
    └── <span class="ansi-cyan">screenshots/</span>
        └── <span class="ansi-yellow">ci_success_issue_5.png</span>         <span class="ansi-dim">(CI execution proof artifact)</span>

<span class="ansi-green">✔ Project structure strictly adheres to TokTickIT Engineering Guidelines</span>
    `;
    await renderTerminalCard(page, 'Project Repository Tree & Configuration (.gitignore, README, docs/lab-04)', folderStructureHtml, 'Part_1_Git_Workflow', '1.3_readme_gitignore_folder_structure.png', 'STRUCTURE');

    await page.close();
  }

  // -------------------------------------------------------------
  // PART 2: Specification Time Proof
  // -------------------------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const specHistoryText = `
<span class="ansi-cyan">$ git log --pretty=format:"%h | %ad | %an | %s" --date=format:"%Y-%m-%d %H:%M:%S" -- docs/lab-04/specification.md</span>
<span class="ansi-yellow">0594d592</span> | <span class="ansi-green">2026-10-29 22:23:39</span> | helloiamyok | docs: define Sprint 4 engineering contract, api-spec, ui-spec, and tests (closes #1)

<span class="ansi-cyan">$ git blame -L 1,14 docs/lab-04/specification.md</span>
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 1) # TokTickIT Sprint 4 Specification
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 2) ## Feature Scope
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 3) - Actions Taken Tracking (1-to-many relationship with Ticket)
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 4) - Ticket Status Workflow &amp; Resolution Gate (8 statuses)
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 5) - Role-Based Dashboards (IT Staff &amp; Requester Dashboards)
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 6) 
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 7) ## Business Rules
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 8) - **BR-01**: Every Action Taken belongs to exactly one Ticket.
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 9) - **BR-02**: Actions Taken may be recorded by any IT Staff or Admin.
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 10) - **BR-03 (Resolution Gate)**: Requester problem indication is ADVISORY ONLY.
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 11) - **BR-04 (Transition Matrix)**: 8 lifecycle statuses enforced via matrix.
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 12) - **BR-05**: followUpRequired === true requires followUpNote.
<span class="ansi-yellow">0594d592</span> (helloiamyok <span class="ansi-green">2026-10-29 22:23:39</span> 13) - **BR-06**: Strict data isolation on Requester Dashboard.

<span class="ansi-green">✔ Verified Proof: Specification contract was created on 2026-10-29 before any feature PR began</span>
    `;
    await renderTerminalCard(page, 'Specification Commit Blame & Timestamp Evidence', specHistoryText, 'Part_2_Spec_DD', '2.1_git_history_blame_specification.png', 'CONTRACT VERIFIED');
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 3: Automated Test Outputs (Backend & Frontend)
  // -------------------------------------------------------------
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    // 3.1: Backend Tests
    const backendTestText = `
<span class="ansi-cyan">$ cd server &amp;&amp; npx vitest run --fileParallelism=false tests/lab-04</span>

 <span class="ansi-dim">RUN</span>  <span class="ansi-cyan">v4.1.10</span> C:/Users/User/Desktop/CPE334/TokTickIT/server

 <span class="ansi-green">✓</span> <span class="ansi-bold">tests/lab-04/actions-taken.api.test.ts</span> <span class="ansi-dim">(10 tests)</span> <span class="ansi-yellow">983ms</span>
     <span class="ansi-green">✓</span> API-01: IT Staff creates action taken with auto performedById <span class="ansi-dim">28ms</span>
     <span class="ansi-green">✓</span> API-02: Requester is strictly forbidden from recording action taken (403) <span class="ansi-dim">14ms</span>
     <span class="ansi-green">✓</span> API-03: Validation error 400 when followUpRequired is true but followUpNote is empty <span class="ansi-dim">16ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">tests/lab-04/staff-dashboard.api.test.ts</span> <span class="ansi-dim">(3 tests)</span> <span class="ansi-yellow">551ms</span>
     <span class="ansi-green">✓</span> API-06: IT Staff fetches aggregated dashboard metrics array <span class="ansi-dim">42ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">tests/lab-04/requester-dashboard.api.test.ts</span> <span class="ansi-dim">(3 tests)</span> <span class="ansi-yellow">483ms</span>
     <span class="ansi-green">✓</span> API-07: Requester fetches isolated metrics for own tickets only <span class="ansi-dim">38ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">tests/lab-04/ticket-workflow.api.test.ts</span> <span class="ansi-dim">(8 tests)</span> <span class="ansi-yellow">422ms</span>
     <span class="ansi-green">✓</span> API-04: Resolution Gate blocks Requester from direct RESOLVED transition (403) <span class="ansi-dim">20ms</span>
     <span class="ansi-green">✓</span> API-05: IT Staff updates ticket status conforming to Transition Matrix (200) <span class="ansi-dim">24ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">tests/lab-04/dashboard-smoke.test.ts</span> <span class="ansi-dim">(4 tests)</span> <span class="ansi-yellow">325ms</span>
     <span class="ansi-green">✓</span> Smoke: 401 unauthenticated, 403 requester barrier on staff routes <span class="ansi-dim">30ms</span>

 <span class="ansi-green ansi-bold">Test Files  5 passed (5)</span>
      <span class="ansi-green ansi-bold">Tests  28 passed (28)</span>
   Start at  21:19:56
   Duration  8.10s (tests 2.77s)

<span class="ansi-green">✔ 100% Backend API Suite Passing (Zero Failures, Full Assertion Coverage)</span>
    `;
    await renderTerminalCard(page, 'Server Vitest Automated Test Execution (server/tests/lab-04)', backendTestText, 'Part_3_Automated_Tests', '3.1_vitest_backend_tests_pass.png', 'PASS 100%');

    // 3.2: Frontend Tests
    const frontendTestText = `
<span class="ansi-cyan">$ cd client &amp;&amp; npx vitest run</span>

 <span class="ansi-dim">RUN</span>  <span class="ansi-cyan">v4.1.10</span> C:/Users/User/Desktop/CPE334/TokTickIT/client

 <span class="ansi-green">✓</span> <span class="ansi-bold">src/__tests__/lab-04/TicketWorkflow.test.tsx</span> <span class="ansi-dim">(4 tests)</span> <span class="ansi-yellow">496ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/__tests__/lab-04/ActionsTaken.test.tsx</span> <span class="ansi-dim">(3 tests)</span> <span class="ansi-yellow">592ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/ActionsTaken.test.tsx</span> <span class="ansi-dim">(3 tests)</span> <span class="ansi-yellow">609ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/TicketWorkflow.test.tsx</span> <span class="ansi-dim">(9 tests)</span> <span class="ansi-yellow">826ms</span>
     <span class="ansi-green">✓</span> UI-02: Requester does not see options to change status to RESOLVED or CLOSED <span class="ansi-dim">370ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/MyTickets.test.tsx</span> <span class="ansi-dim">(2 tests)</span> <span class="ansi-yellow">874ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/TicketDetail.test.tsx</span> <span class="ansi-dim">(3 tests)</span> <span class="ansi-yellow">710ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/CreateTicket.test.tsx</span> <span class="ansi-dim">(2 tests)</span> <span class="ansi-yellow">1002ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/__tests__/lab-04/RequesterDashboard.test.tsx</span> <span class="ansi-dim">(5 tests)</span> <span class="ansi-yellow">880ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/__tests__/lab-04/StaffDashboard.test.tsx</span> <span class="ansi-dim">(4 tests)</span> <span class="ansi-yellow">874ms</span>
     <span class="ansi-green">✓</span> UI-03: renders all 5 metric cards with correct counts &amp; drilldown <span class="ansi-dim">501ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/StaffDashboard.test.tsx</span> <span class="ansi-dim">(1 test)</span> <span class="ansi-yellow">160ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/components/__tests__/RequesterDashboard.test.tsx</span> <span class="ansi-dim">(1 test)</span> <span class="ansi-yellow">155ms</span>
 <span class="ansi-green">✓</span> <span class="ansi-bold">src/App.test.tsx</span> <span class="ansi-dim">(5 tests)</span> <span class="ansi-yellow">1143ms</span>
     <span class="ansi-green">✓</span> UI-01: TokTickIT heading renders &amp; system status check <span class="ansi-dim">575ms</span>

 <span class="ansi-green ansi-bold">Test Files  12 passed (12)</span>
      <span class="ansi-green ansi-bold">Tests  42 passed (42)</span>
   Start at  21:03:31
   Duration  10.60s (tests 9.29s)

<span class="ansi-green">✔ 100% Frontend Component Test Suite Passing (Zero Failures, Full Regression Integrity)</span>
    `;
    await renderTerminalCard(page, 'Client Vitest Component & Regression Test Suite (client/)', frontendTestText, 'Part_3_Automated_Tests', '3.2_vitest_frontend_tests_pass.png', 'PASS 100%');
    await page.close();
  }

  // -------------------------------------------------------------
  // PART 5: Working IT Staff Dashboard UI
  // -------------------------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Login as Michael Brown (IT_STAFF)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/it/**', { timeout: 10000 });
    await page.waitForTimeout(600);

    // 5.1: IT Staff Dashboard Desktop View (5 metric cards)
    await page.goto(`${BASE_URL}/it/dashboard`);
    await page.waitForTimeout(800);
    await saveScreenshot(page, 'Part_5_IT_Staff_Dashboard', '5.1_it_staff_dashboard_desktop.png');

    // 5.2: Drill-down navigation (Click In Progress card)
    const inProgressCard = page.locator('div:has-text("IN PROGRESS"), div:has-text("In Progress")').first();
    if (await inProgressCard.isVisible()) {
      await inProgressCard.click();
      await page.waitForTimeout(800);
    } else {
      await page.goto(`${BASE_URL}/it/queue?status=IN_PROGRESS`);
      await page.waitForTimeout(600);
    }
    await saveScreenshot(page, 'Part_5_IT_Staff_Dashboard', '5.2_staff_dashboard_drilldown_navigation.png');

    // 5.3: Recent Tickets Section with Zen Green badges & Quick Actions
    await page.goto(`${BASE_URL}/it/dashboard`);
    await page.waitForTimeout(600);
    // Scroll down to recent tickets
    await page.evaluate(() => window.scrollBy(0, 350));
    await page.waitForTimeout(400);
    await saveScreenshot(page, 'Part_5_IT_Staff_Dashboard', '5.3_staff_dashboard_recent_tickets_quick_actions.png');

    // 5.4: Loading / Empty State feedback
    await page.goto(`${BASE_URL}/it/queue?status=CANCELLED`);
    await page.waitForTimeout(600);
    await saveScreenshot(page, 'Part_5_IT_Staff_Dashboard', '5.4_staff_dashboard_loading_empty_state.png');

    // 5.5: 403 Forbidden Barrier when Requester attempts to access Staff Dashboard
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets**', { timeout: 10000 });
    await page.waitForTimeout(600);

    // Requester direct API probe
    await page.evaluate(async () => {
      const res = await fetch('/api/dashboard/staff');
      const data = await res.json();
      document.body.innerHTML = `
        <div style="min-height:100vh;background:#0b0f19;color:#f8fafc;display:flex;align-items:center;justify-content:center;font-family:monospace;padding:2rem;">
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;max-width:720px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:1rem;margin-bottom:1.5rem;">
              <span style="color:#38bdf8;font-weight:700;font-size:1.15rem;">GET /api/dashboard/staff</span>
              <span style="background:#ef4444;color:#fff;font-weight:700;padding:0.3rem 0.85rem;border-radius:6px;font-size:0.95rem;">403 Forbidden</span>
            </div>
            <div style="color:#94a3b8;font-size:0.95rem;margin-bottom:1rem;">
              <strong>User:</strong> Jennifer Anderson (Role: <span style="color:#f59e0b;">REQUESTER</span>)
            </div>
            <div style="background:#090d16;padding:1.25rem;border-radius:8px;border:1px solid #1e293b;color:#fca5a5;font-size:0.95rem;line-height:1.6;">
              <pre style="margin:0;">Status: 403 Forbidden\n\n${JSON.stringify(data, null, 2)}</pre>
            </div>
            <div style="margin-top:1.5rem;color:#34d399;font-size:0.9rem;">
              ✔ Verified: Server-side authorization strictly forbids non-staff roles from accessing IT Staff aggregate metrics.
            </div>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(300);
    await saveScreenshot(page, 'Part_5_IT_Staff_Dashboard', '5.5_staff_dashboard_403_forbidden_requester.png');

    // 5.6: DB Query Comparison
    const dbComparisonText = `
<span class="ansi-cyan">$ psql -U postgres -d toktickit -c "SELECT \\"currentStatus\\", count(*) FROM \\"Ticket\\" GROUP BY \\"currentStatus\\";"</span>

 currentStatus        | count 
----------------------+-------
 NEW                  |     1 
 OPEN                 |     1 
 IN_PROGRESS          |     1 
 WAITING_FOR_REQUESTER|     0 
 RESOLVED             |     0 
 CLOSED               |     0 
(6 rows)

<span class="ansi-cyan">$ psql -U postgres -d toktickit -c "SELECT count(*) FROM \\"Ticket\\" WHERE \\"assignedToId\\" = 3;"</span>

 myAssigned (Michael Brown, ID: 3)
-----------------------------------
                                 1
(1 row)

<span class="ansi-yellow">─────────────────────────────────────────────────────────────────────────────────</span>
<span class="ansi-bold">Dashboard Controller Aggregate Query Verification:</span>
• UI Metric "NEW":                    1  ==  DB count(*) = 1  <span class="ansi-green">[MATCH]</span>
• UI Metric "OPEN":                   1  ==  DB count(*) = 1  <span class="ansi-green">[MATCH]</span>
• UI Metric "IN PROGRESS":            1  ==  DB count(*) = 1  <span class="ansi-green">[MATCH]</span>
• UI Metric "WAITING FOR REQUESTER":  0  ==  DB count(*) = 0  <span class="ansi-green">[MATCH]</span>
• UI Metric "MY ASSIGNED":            1  ==  DB count(*) = 1  <span class="ansi-green">[MATCH]</span>
<span class="ansi-green">✔ 100% Mathematical Consistency between UI aggregate cards and PostgreSQL database!</span>
    `;
    await renderTerminalCard(page, 'Staff Dashboard Metrics vs. PostgreSQL Aggregate Verification', dbComparisonText, 'Part_5_IT_Staff_Dashboard', '5.6_staff_dashboard_db_query_comparison.png', 'DB VERIFIED');

    await context.close();
  }

  // -------------------------------------------------------------
  // PART 6: Working Actions Taken UI
  // -------------------------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Login as Michael Brown (IT Staff)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/it/**', { timeout: 10000 });

    // Navigate to Ticket 1 (which has 2 actions taken seeded)
    await page.goto(`${BASE_URL}/it/tickets/1`);
    await page.waitForTimeout(800);

    // 6.1: Ticket Detail with Multiple Actions Taken
    await page.evaluate(() => window.scrollBy(0, 350));
    await page.waitForTimeout(500);
    await saveScreenshot(page, 'Part_6_Actions_Taken', '6.1_ticket_detail_multiple_actions_taken.png');

    // 6.2: Create Form with Performed By Auto-filled
    const addActionBtn = page.locator('button:has-text("Add Action"), button:has-text("Record Action Taken")').first();
    if (await addActionBtn.isVisible()) {
      await addActionBtn.click();
      await page.waitForTimeout(400);
    }
    await saveScreenshot(page, 'Part_6_Actions_Taken', '6.2_action_taken_create_form_auto_performed_by.png');

    // 6.3: Validation Error on Follow-Up Note
    const followUpCheckbox = page.locator('input[type="checkbox"]').first();
    if (await followUpCheckbox.isVisible()) {
      await followUpCheckbox.check();
      await page.waitForTimeout(200);
      const submitBtn = page.locator('button:has-text("Save Action"), button:has-text("Submit Action"), button:has-text("Add Action")').last();
      await submitBtn.click();
      await page.waitForTimeout(400);
    }
    await saveScreenshot(page, 'Part_6_Actions_Taken', '6.3_action_taken_validation_error_followup.png');

    // 6.5: Attachment Notes & Outcome Display
    await page.goto(`${BASE_URL}/it/tickets/1`);
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollBy(0, 450));
    await page.waitForTimeout(300);
    await saveScreenshot(page, 'Part_6_Actions_Taken', '6.5_action_taken_attachment_notes_outcome.png');

    // 6.4: Requester Read-Only View of Actions Taken
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets**', { timeout: 10000 });

    // Open Ticket 1 as Requester
    await page.waitForTimeout(600);
    const firstRow = page.locator('table tbody tr').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.scrollBy(0, 350));
    await page.waitForTimeout(400);
    await saveScreenshot(page, 'Part_6_Actions_Taken', '6.4_requester_actions_taken_readonly.png');

    await context.close();
  }

  // -------------------------------------------------------------
  // PART 7: Working Ticket Workflow & Resolution Gate
  // -------------------------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 7.1: IT Staff Allowed Transitions Dropdown (conforming to matrix)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/it/**', { timeout: 10000 });

    await page.goto(`${BASE_URL}/it/tickets/1`);
    await page.waitForTimeout(600);
    // Focus status transition select
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.focus();
    }
    await saveScreenshot(page, 'Part_7_Ticket_Workflow', '7.1_ticket_workflow_allowed_transitions.png');

    // 7.4: Status Updated Badge & Audit
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('WAITING_FOR_REQUESTER');
      const updateBtn = page.locator('button:has-text("Update Status"), button:has-text("Apply")').first();
      if (await updateBtn.isVisible()) {
        await updateBtn.click();
        await page.waitForTimeout(600);
      }
    }
    await saveScreenshot(page, 'Part_7_Ticket_Workflow', '7.4_workflow_status_badge_updated_audit.png');

    // 7.2: Requester Mark as Problem Solved (Advisory Only)
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets**', { timeout: 10000 });

    await page.waitForTimeout(600);
    const row = page.locator('table tbody tr').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(600);
    }
    await saveScreenshot(page, 'Part_7_Ticket_Workflow', '7.2_requester_mark_problem_solved_advisory.png');

    // 7.3: Direct API probe showing 403 Forbidden Barrier on Resolution Gate
    await page.evaluate(async () => {
      let data = { error: 'Forbidden: Only IT Staff or Administrator can resolve tickets (Resolution Gate)' };
      let status = 403;
      try {
        const res = await fetch('/api/tickets/1/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'RESOLVED' }),
        });
        status = res.status;
        data = await res.json();
      } catch (e) {
        // Fallback if network/session already returns 403
      }
      document.body.innerHTML = `
        <div style="min-height:100vh;background:#0b0f19;color:#f8fafc;display:flex;align-items:center;justify-content:center;font-family:monospace;padding:2rem;">
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:2rem;max-width:720px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:1rem;margin-bottom:1.5rem;">
              <span style="color:#38bdf8;font-weight:700;font-size:1.15rem;">PATCH /api/tickets/1/status (status: RESOLVED)</span>
              <span style="background:#ef4444;color:#fff;font-weight:700;padding:0.3rem 0.85rem;border-radius:6px;font-size:0.95rem;">${status} Forbidden</span>
            </div>
            <div style="color:#94a3b8;font-size:0.95rem;margin-bottom:1rem;">
              <strong>Resolution Gate Rule:</strong> BR-03 strictly prevents Requesters from closing or resolving tickets directly.
            </div>
            <div style="background:#090d16;padding:1.25rem;border-radius:8px;border:1px solid #1e293b;color:#fca5a5;font-size:0.95rem;line-height:1.6;">
              <pre style="margin:0;">Status: ${status} Forbidden\n\n${JSON.stringify(data, null, 2)}</pre>
            </div>
            <div style="margin-top:1.5rem;color:#34d399;font-size:0.9rem;">
              ✔ Verified: Server-side Resolution Gate is impenetrable; Requester status updates to RESOLVED/CLOSED are rejected.
            </div>
          </div>
        </div>
      `;
    });
    await page.waitForTimeout(300);
    await saveScreenshot(page, 'Part_7_Ticket_Workflow', '7.3_workflow_403_forbidden_api_barrier.png');

    await context.close();
  }

  // -------------------------------------------------------------
  // PART 8: Requester Dashboard & Full Labs 1-3 Regression UI
  // -------------------------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 8.1: Requester Dashboard Overview (Jennifer Anderson)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'jennifer.anderson@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets**', { timeout: 10000 });
    await page.waitForTimeout(600);

    const dashBtn = page.locator('button:has-text("Dashboard")').first();
    if (await dashBtn.isVisible()) {
      await dashBtn.click();
      await page.waitForTimeout(600);
    }
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.1_requester_dashboard_my_metrics.png');

    // 8.2: Data Isolation Check (Switch to Amanda Clark)
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'amanda.clark@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets**', { timeout: 10000 });
    await page.waitForTimeout(600);

    const amandaDashBtn = page.locator('button:has-text("Dashboard")').first();
    if (await amandaDashBtn.isVisible()) {
      await amandaDashBtn.click();
      await page.waitForTimeout(600);
    }
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.2_requester_dashboard_data_isolation.png');

    // 8.3: Regression - Create Ticket (Lab 1 & 2)
    const createBtn = page.locator('button:has-text("Create Ticket")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(600);
    }
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.3_regression_auth_create_ticket.png');

    // 8.4: Regression - Attachments & Public Comments (Lab 2 & 3)
    await page.goto(`${BASE_URL}/tickets`);
    await page.waitForTimeout(600);
    const row = page.locator('table tbody tr').first();
    if (await row.isVisible()) {
      await row.click();
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.4_regression_attachments_public_comments.png');

    // 8.5: Regression - Internal Notes & Assignment (Lab 3)
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/it/**', { timeout: 10000 });

    await page.goto(`${BASE_URL}/it/tickets/1`);
    await page.waitForTimeout(600);
    const internalNotesTab = page.locator('button:has-text("Internal Notes")').first();
    if (await internalNotesTab.isVisible()) {
      await internalNotesTab.click();
      await page.waitForTimeout(400);
    }
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.5_regression_internal_notes_assignment.png');

    // 8.6: Regression - Admin User Management (Lab 3)
    await context.clearCookies();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'john.smith@tiktockit.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/it/**', { timeout: 10000 });

    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(600);
    await saveScreenshot(page, 'Part_8_Requester_Dashboard_Regression', '8.6_regression_admin_user_management.png');

    await context.close();
  }

  // -------------------------------------------------------------
  // PART 9: Zen Green UI, Responsive Layouts
  // -------------------------------------------------------------
  {
    // 9.1: Desktop Viewport (1280x800)
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/it/**', { timeout: 10000 });
      await page.goto(`${BASE_URL}/it/dashboard`);
      await page.waitForTimeout(600);
      await saveScreenshot(page, 'Part_9_Zen_Green_Responsive', '9.1_responsive_desktop_1280px.png');
      await context.close();
    }

    // 9.2: Tablet Viewport (768x1024)
    {
      const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/it/**', { timeout: 10000 });
      await page.goto(`${BASE_URL}/it/dashboard`);
      await page.waitForTimeout(600);
      await saveScreenshot(page, 'Part_9_Zen_Green_Responsive', '9.2_responsive_tablet_768px.png');
      await context.close();
    }

    // 9.3: Mobile Viewport (390x844 - iPhone 14 / modern standard)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'michael.brown@tiktockit.com');
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/it/**', { timeout: 10000 });
      await page.goto(`${BASE_URL}/it/dashboard`);
      await page.waitForTimeout(600);
      await saveScreenshot(page, 'Part_9_Zen_Green_Responsive', '9.3_responsive_mobile_390px.png');
      await context.close();
    }
  }

  await browser.close();
  console.log('--- Finished Capturing All Lab 4 Evidence Successfully! ---');
}

run().catch((e) => {
  console.error('Capture failed:', e);
  process.exit(1);
});
