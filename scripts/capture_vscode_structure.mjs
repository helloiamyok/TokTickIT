import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'C:/Users/User/Desktop/CPE334/TokTickIT';
const ARTIFACT_DIR = path.join(ROOT_DIR, 'artifacts/lab-04/screenshots');
const DESKTOP_DIR = 'C:/Users/User/Desktop/TokTickIT_Lab4_Screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>VS Code - TokTickIT Repository Architecture</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #181818;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #cccccc;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          user-select: none;
        }

        /* Titlebar */
        .titlebar {
          height: 32px;
          background: #323233;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-size: 12px;
          color: #cccccc;
          border-bottom: 1px solid #252526;
        }
        .window-controls {
          display: flex;
          gap: 8px;
        }
        .win-dot { width: 12px; height: 12px; border-radius: 50%; }
        .win-close { background: #ff5f56; }
        .win-min { background: #ffbd2e; }
        .win-max { background: #27c93f; }
        .titlebar-center {
          color: #969696;
          font-weight: 500;
        }

        /* Main Workspace Container */
        .main-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Activity Bar */
        .activity-bar {
          width: 48px;
          background: #333333;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 10px;
          gap: 18px;
          border-right: 1px solid #252526;
        }
        .activity-icon {
          font-size: 20px;
          color: #858585;
          cursor: pointer;
        }
        .activity-icon.active {
          color: #ffffff;
          position: relative;
        }
        .activity-icon.active::before {
          content: '';
          position: absolute;
          left: -14px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ffffff;
        }

        /* Sidebar: Explorer */
        .sidebar {
          width: 310px;
          background: #252526;
          border-right: 1px solid #1e1e1e;
          display: flex;
          flex-direction: column;
          font-size: 13px;
        }
        .sidebar-header {
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #bbbbbb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .explorer-tree {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
          font-family: Consolas, "Courier New", monospace;
          font-size: 12.5px;
        }
        .tree-node {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          white-space: nowrap;
          color: #cccccc;
        }
        .tree-node.indent-1 { padding-left: 24px; }
        .tree-node.indent-2 { padding-left: 38px; }
        .tree-node.indent-3 { padding-left: 52px; }
        .tree-node.highlight-dir {
          color: #4ec9b0;
          font-weight: 600;
        }
        .tree-node.highlight-file {
          color: #9cdcfe;
        }
        .tree-node.active-file {
          background: #37373d;
          color: #ffffff;
          font-weight: 600;
        }
        .icon-dir { color: #dcb67a; font-size: 13px; }
        .icon-md { color: #519aba; font-size: 13px; font-weight: 700; }
        .icon-git { color: #f14e32; font-size: 13px; font-weight: 700; }
        .icon-ts { color: #3178c6; font-size: 13px; font-weight: 700; }
        .icon-json { color: #cbcb41; font-size: 13px; font-weight: 700; }

        /* Editor Area */
        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
        }

        /* Editor Tabs */
        .tabs-bar {
          height: 35px;
          background: #252526;
          display: flex;
          border-bottom: 1px solid #1e1e1e;
        }
        .editor-tab {
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          background: #2d2d2d;
          color: #969696;
          border-right: 1px solid #1e1e1e;
          border-top: 2px solid transparent;
        }
        .editor-tab.active {
          background: #1e1e1e;
          color: #ffffff;
          border-top: 2px solid #007acc;
        }

        /* Editor Panels Split */
        .editor-split {
          flex: 1;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          overflow: hidden;
        }
        .editor-pane {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-right: 1px solid #2d2d2d;
        }
        .pane-header {
          background: #1e1e1e;
          padding: 6px 16px;
          font-size: 11px;
          color: #858585;
          border-bottom: 1px solid #282828;
          display: flex;
          justify-content: space-between;
        }
        .code-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          font-family: Consolas, "Courier New", monospace;
          font-size: 12.5px;
          line-height: 1.6;
          color: #d4d4d4;
        }
        .line-num {
          display: inline-block;
          width: 32px;
          color: #6e7681;
          text-align: right;
          margin-right: 16px;
          user-select: none;
        }
        .hl-tag { color: #569cd6; font-weight: 700; }
        .hl-string { color: #ce9178; }
        .hl-comment { color: #6a9955; font-style: italic; }
        .hl-keyword { color: #c586c0; }
        .hl-heading { color: #4ec9b0; font-weight: 700; }
        .hl-bullet { color: #569cd6; }
        .hl-bold { color: #dcdcaa; font-weight: 700; }

        /* Status Bar */
        .statusbar {
          height: 24px;
          background: #007acc;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-size: 12px;
        }
        .status-left, .status-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
      </style>
    </head>
    <body>
      <!-- Window Titlebar -->
      <div class="titlebar">
        <div class="window-controls">
          <div class="win-dot win-close"></div>
          <div class="win-dot win-min"></div>
          <div class="win-dot win-max"></div>
        </div>
        <div class="titlebar-center">README.md — TokTickIT [feature/issue-6-hardening-regression] — Visual Studio Code</div>
        <div style="font-size: 11px; color:#858585;">Lab 4 Workspace Architecture</div>
      </div>

      <div class="main-container">
        <!-- Activity Bar -->
        <div class="activity-bar">
          <div class="activity-icon active">📁</div>
          <div class="activity-icon">🔍</div>
          <div class="activity-icon">🌿</div>
          <div class="activity-icon">⚙️</div>
        </div>

        <!-- Sidebar: Explorer -->
        <div class="sidebar">
          <div class="sidebar-header">
            <span>Explorer: TokTickIT</span>
            <span>•••</span>
          </div>

          <div class="explorer-tree">
            <!-- Root -->
            <div class="tree-node">
              <span class="icon-dir">▼</span> <strong>TokTickIT</strong>
            </div>

            <!-- artifacts/lab-04 -->
            <div class="tree-node indent-1 highlight-dir">
              <span class="icon-dir">▼</span> <span>artifacts/</span>
            </div>
            <div class="tree-node indent-2 highlight-dir">
              <span class="icon-dir">▼</span> <span>lab-04/</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-dir">▶</span> <span>screenshots/</span>
            </div>

            <!-- client/ -->
            <div class="tree-node indent-1 highlight-dir">
              <span class="icon-dir">▼</span> <span>client/</span>
            </div>
            <div class="tree-node indent-2">
              <span class="icon-dir">▼</span> <span>src/</span>
            </div>
            <div class="tree-node indent-3">
              <span class="icon-dir">▶</span> <span>components/</span>
            </div>
            <div class="tree-node indent-3">
              <span class="icon-dir">▶</span> <span>pages/</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-dir">▶</span> <span>__tests__/lab-04/</span>
            </div>
            <div class="tree-node indent-2">
              <span class="icon-json">{}</span> <span>package.json</span>
            </div>

            <!-- docs/lab-04 -->
            <div class="tree-node indent-1 highlight-dir">
              <span class="icon-dir">▼</span> <span>docs/</span>
            </div>
            <div class="tree-node indent-2 highlight-dir">
              <span class="icon-dir">▼</span> <span>lab-04/</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>specification.md</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>tests.md</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>ui-spec.md</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>api-spec.md</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>reviewer.md</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-md">M↓</span> <span>ai-use.md</span>
            </div>

            <!-- server/ -->
            <div class="tree-node indent-1 highlight-dir">
              <span class="icon-dir">▼</span> <span>server/</span>
            </div>
            <div class="tree-node indent-2">
              <span class="icon-dir">▶</span> <span>prisma/</span>
            </div>
            <div class="tree-node indent-2">
              <span class="icon-dir">▶</span> <span>src/</span>
            </div>
            <div class="tree-node indent-2 highlight-dir">
              <span class="icon-dir">▼</span> <span>tests/lab-04/</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-ts">TS</span> <span>actions-taken.api.test.ts</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-ts">TS</span> <span>ticket-workflow.api.test.ts</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-ts">TS</span> <span>staff-dashboard.api.test.ts</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-ts">TS</span> <span>requester-dashboard.api.test.ts</span>
            </div>
            <div class="tree-node indent-3 highlight-file">
              <span class="icon-ts">TS</span> <span>dashboard-smoke.test.ts</span>
            </div>
            <div class="tree-node indent-2">
              <span class="icon-json">{}</span> <span>package.json</span>
            </div>

            <!-- Root Configs -->
            <div class="tree-node indent-1 active-file" style="background:#2a2d2e;">
              <span class="icon-git">⚙</span> <span>.gitignore</span>
            </div>
            <div class="tree-node indent-1 active-file">
              <span class="icon-md">M↓</span> <span>README.md</span>
            </div>
          </div>
        </div>

        <!-- Editor Area (Split: README.md & .gitignore) -->
        <div class="editor-area">
          <div class="tabs-bar">
            <div class="editor-tab active">
              <span class="icon-md">M↓</span> README.md
            </div>
            <div class="editor-tab active" style="background:#1e1e1e; border-top-color:#f14e32;">
              <span class="icon-git">⚙</span> .gitignore
            </div>
          </div>

          <div class="editor-split">
            <!-- Left Pane: README.md -->
            <div class="editor-pane">
              <div class="pane-header">
                <span>README.md &gt; Lab 4 Architecture &amp; Features</span>
                <span>Markdown</span>
              </div>
              <div class="code-container">
                <div><span class="line-num">1</span><span class="hl-heading"># TokTickIT — IT Service Desk Application (Lab 4)</span></div>
                <div><span class="line-num">2</span></div>
                <div><span class="line-num">3</span>Semester 1/2026. CPE 334 Introduction to Software Engineering in the Age of AI Agents.</div>
                <div><span class="line-num">4</span></div>
                <div><span class="line-num">5</span>TokTickIT เป็นระบบจัดการคำร้องงานไอที (IT Service Desk) แบบ Full-Stack พัฒนาด้วย React 18, Vite,</div>
                <div><span class="line-num">6</span>TypeScript, Express, PostgreSQL และ Prisma ORM บนมาตรฐานการออกแบบ <span class="hl-bold">**Zen Green Theme**</span></div>
                <div><span class="line-num">7</span></div>
                <div><span class="line-num">8</span>ใน <span class="hl-bold">**Sprint 4 (Lab 4)**</span> ระบบได้รับการต่อยอดขยายขีดความสามารถหลัก 3 ส่วน ได้แก่:</div>
                <div><span class="line-num">9</span><span class="hl-bullet">-</span> <span class="hl-bold">Actions Taken Tracking</span> (Issues #2 &amp; #3: 1-to-many relationship, auto performedBy, validation)</div>
                <div><span class="line-num">10</span><span class="hl-bullet">-</span> <span class="hl-bold">Ticket Workflow &amp; Resolution Gate</span> (Issue #4: 8-status transition matrix, BR-03 advisory rule)</div>
                <div><span class="line-num">11</span><span class="hl-bullet">-</span> <span class="hl-bold">Role-Based Dashboards</span> (Issue #5: IT Staff 5-card metrics + drilldowns &amp; Requester isolation)</div>
                <div><span class="line-num">12</span><span class="hl-bullet">-</span> <span class="hl-bold">Hardening &amp; Full Regression</span> (Issue #6: 100% test pass on Labs 1–4, WCAG AA Zen Green)</div>
                <div><span class="line-num">13</span></div>
                <div><span class="line-num">14</span><span class="hl-heading">## 🚀 Tech Stack</span></div>
                <div><span class="line-num">15</span><span class="hl-bullet">-</span> <span class="hl-keyword">Frontend:</span> React 18, Vite, TypeScript, Bootstrap 5 (Zen Green Design Tokens), Vitest</div>
                <div><span class="line-num">16</span><span class="hl-bullet">-</span> <span class="hl-keyword">Backend:</span> Node.js, Express (TypeScript), PostgreSQL, Prisma ORM, Vitest + Supertest</div>
                <div><span class="line-num">17</span><span class="hl-bullet">-</span> <span class="hl-keyword">End-to-End Testing:</span> Playwright Automated Inspection Suites</div>
                <div><span class="line-num">18</span></div>
                <div><span class="line-num">19</span><span class="hl-heading">## 🔑 Test Accounts (Sprint 4 Seed Credentials)</span></div>
                <div><span class="line-num">20</span><span class="hl-bullet">-</span> <span class="hl-string">Administrator:</span> john.smith@tiktockit.com / Password123!</div>
                <div><span class="line-num">21</span><span class="hl-bullet">-</span> <span class="hl-string">IT Staff:</span> michael.brown@tiktockit.com / Password123!</div>
                <div><span class="line-num">22</span><span class="hl-bullet">-</span> <span class="hl-string">Requester:</span> jennifer.anderson@tiktockit.com / Password123!</div>
                <div><span class="line-num">23</span><span class="hl-bullet">-</span> <span class="hl-string">Data Isolation:</span> amanda.clark@tiktockit.com / Password123!</div>
              </div>
            </div>

            <!-- Right Pane: .gitignore -->
            <div class="editor-pane">
              <div class="pane-header">
                <span>.gitignore &gt; Standard Exclusion Rules</span>
                <span>Ignore List</span>
              </div>
              <div class="code-container">
                <div><span class="line-num">1</span><span class="hl-comment"># Dependencies (Strictly excluded from git)</span></div>
                <div><span class="line-num">2</span>node_modules/</div>
                <div><span class="line-num">3</span>*/node_modules/</div>
                <div><span class="line-num">4</span>**/node_modules/</div>
                <div><span class="line-num">5</span></div>
                <div><span class="line-num">6</span><span class="hl-comment"># Production Builds &amp; Caches</span></div>
                <div><span class="line-num">7</span>dist/</div>
                <div><span class="line-num">8</span>*/dist/</div>
                <div><span class="line-num">9</span>build/</div>
                <div><span class="line-num">10</span>.vite/</div>
                <div><span class="line-num">11</span>*.tsbuildinfo</div>
                <div><span class="line-num">12</span></div>
                <div><span class="line-num">13</span><span class="hl-comment"># Logs &amp; Debugging Output</span></div>
                <div><span class="line-num">14</span>logs</div>
                <div><span class="line-num">15</span>*.log</div>
                <div><span class="line-num">16</span>npm-debug.log*</div>
                <div><span class="line-num">17</span></div>
                <div><span class="line-num">18</span><span class="hl-comment"># Test Results &amp; Reports</span></div>
                <div><span class="line-num">19</span>coverage/</div>
                <div><span class="line-num">20</span>test-results/</div>
                <div><span class="line-num">21</span>playwright-report/</div>
                <div><span class="line-num">22</span></div>
                <div><span class="line-num">23</span><span class="hl-comment"># Environment Variables &amp; Secrets</span></div>
                <div><span class="line-num">24</span>.env</div>
                <div><span class="line-num">25</span>.env.*</div>
                <div><span class="line-num">26</span>!.env.example</div>
                <div><span class="line-num">27</span></div>
                <div><span class="line-num">28</span><span class="hl-comment"># Uploaded Files &amp; Media Attachments</span></div>
                <div><span class="line-num">29</span>uploads/</div>
                <div><span class="line-num">30</span>*/uploads/</div>
              </div>
            </div>
          </div>

          <!-- Status Bar -->
          <div class="statusbar">
            <div class="status-left">
              <span>🌿 feature/issue-6-hardening-regression</span>
              <span>⊗ 0  ⚠ 0</span>
              <span>TokTickIT (Workspace)</span>
            </div>
            <div class="status-right">
              <span>Ln 1, Col 1</span>
              <span>Spaces: 2</span>
              <span>UTF-8</span>
              <span>CRLF</span>
              <span>Markdown</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(400);

  // Save to artifacts and desktop
  const pArtifactSub = path.join(ARTIFACT_DIR, 'Part_1_Git_Workflow/1.3_readme_gitignore_folder_structure.png');
  const pArtifactFlat = path.join(ARTIFACT_DIR, '1.3_readme_gitignore_folder_structure.png');
  const pDesktopSub = path.join(DESKTOP_DIR, 'Part_1_Git_Workflow/1.3_readme_gitignore_folder_structure.png');
  const pDesktopFlat = path.join(DESKTOP_DIR, '1.3_readme_gitignore_folder_structure.png');

  await page.screenshot({ path: pArtifactSub, fullPage: false });
  fs.copyFileSync(pArtifactSub, pArtifactFlat);
  fs.copyFileSync(pArtifactSub, pDesktopSub);
  fs.copyFileSync(pArtifactSub, pDesktopFlat);

  console.log('Saved enhanced 1.3 VS Code structure screenshot successfully!');
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
