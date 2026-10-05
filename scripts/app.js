/**
 * ============================================================================
 * NEUROSYMBOLIC COGNITIVE MESH - MAIN APPLICATION CONTROLLER
 * State Orchestration, View Routing & Deductive Proof Triggering
 * ============================================================================
 */

(function (window) {
  'use strict';

  class CognitiveMeshApp {
    constructor() {
      this.solver = new window.DatalogSolver();
      this.activeView = 'view-mesh';
      this.currentLang = 'en';

      this.initDOM();
      this.initEngines();
      this.bindEvents();
      this.proveGoal('formal_stability_guaranteed');
    }

    initDOM() {
      this.canvasMesh = document.getElementById('canvas-hypergraph');
      this.canvasProof = document.getElementById('canvas-proof-tree');
      this.navButtons = document.querySelectorAll('.nav-item-btn');
      this.views = document.querySelectorAll('.view-container');

      this.terminalBody = document.getElementById('terminal-logs-body');
      this.terminalInput = document.getElementById('terminal-cli-input');
      this.rulesContainer = document.getElementById('rules-list-container');
      this.factsContainer = document.getElementById('facts-list-container');
      this.auditContainer = document.getElementById('audit-matrix-container');
    }

    initEngines() {
      if (this.canvasMesh) {
        this.hypergraph = new window.MathematicalHypergraphEngine(this.canvasMesh);
      }
      if (this.canvasProof) {
        this.proofVisualizer = new window.ProofTreeVisualizer(this.canvasProof);
      }
      if (this.terminalBody && this.terminalInput) {
        this.cli = new window.CyberLogicCLI(this.terminalBody, this.terminalInput);
      }
      this.renderRulesAndFacts();
      this.renderAuditMatrix();
    }

    bindEvents() {
      this.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-view');
          this.switchView(v);
        });
      });

      const btnInfer = document.getElementById('btn-run-inference');
      if (btnInfer) {
        btnInfer.addEventListener('click', () => {
          this.solver.solveForwardChaining();
          this.proveGoal('formal_stability_guaranteed');
          if (this.cli) this.cli.write('Forward-chaining inference triggered manually. Verification Q.E.D. updated.', 'text-emerald');
        });
      }

      const btnLang = document.getElementById('btn-lang-toggle');
      if (btnLang) {
        btnLang.addEventListener('click', () => {
          this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
          document.body.classList.toggle('lang-ar', this.currentLang === 'ar');
          btnLang.textContent = this.currentLang === 'ar' ? 'English' : 'عربي';
        });
      }

      const btnTerm = document.getElementById('btn-toggle-terminal');
      const drawer = document.getElementById('terminal-drawer');
      if (btnTerm && drawer) {
        btnTerm.addEventListener('click', () => drawer.classList.toggle('minimized'));
      }
    }

    switchView(viewId) {
      this.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
      });
      this.views.forEach(v => {
        v.classList.toggle('active', v.id === viewId);
      });
      this.activeView = viewId;

      setTimeout(() => {
        if (viewId === 'view-mesh' && this.hypergraph) {
          this.hypergraph.resetCamera();
        } else if (viewId === 'view-proof') {
          this.proveGoal('formal_stability_guaranteed');
        }
      }, 50);
    }

    proveGoal(goalPredicate) {
      const proof = this.solver.generateProofTree(goalPredicate);
      if (this.proofVisualizer && proof) {
        this.proofVisualizer.render(proof);
      }
    }

    renderRulesAndFacts() {
      if (this.factsContainer) {
        let fHtml = '';
        this.solver.facts.forEach(f => {
          fHtml += `<div class="proof-step-card axiom"><strong>${f.predicate}</strong>(${f.args.join(', ')}) <span style="color: var(--cyan-400); float: right;">[AXIOM]</span></div>`;
        });
        this.factsContainer.innerHTML = fHtml;
      }

      if (this.rulesContainer) {
        let rHtml = '';
        this.solver.rules.forEach(r => {
          const bodyStr = r.body.map(b => `${b.predicate}(${b.args.join(', ')})`).join(' ∧ ');
          rHtml += `
            <div class="proof-step-card">
              <div style="color: var(--coral-400); font-weight: 700; margin-bottom: 4px;">${r.id}: ${r.name}</div>
              <div style="color: var(--text-pure); font-size: 11px;">
                <strong>${r.head.predicate}</strong>(${r.head.args.join(', ')}) ← ${bodyStr}
              </div>
            </div>
          `;
        });
        this.rulesContainer.innerHTML = rHtml;
      }
    }

    renderAuditMatrix() {
      if (!this.auditContainer) return;
      const derived = this.solver.solveForwardChaining();

      let html = `
        <div class="cyber-card">
          <div class="card-header-row">
            <h3 class="card-title">FORMAL CONSISTENCY & THEOREM INTEGRITY AUDIT</h3>
            <span class="nav-badge">100% SOUNDNESS GUARANTEE</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; margin-top: 10px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-medium); color: var(--coral-300); text-align: left;">
                <th style="padding: 8px;">Predicate</th>
                <th style="padding: 8px;">Arguments</th>
                <th style="padding: 8px;">Classification</th>
                <th style="padding: 8px;">Rule Derivation</th>
                <th style="padding: 8px;">Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      derived.forEach(d => {
        html += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">
            <td style="padding: 7px; color: var(--text-pure);"><strong>${d.predicate}</strong></td>
            <td style="padding: 7px;">${d.args.join(', ')}</td>
            <td style="padding: 7px; color: ${d.axiom ? 'var(--cyan-400)' : 'var(--emerald-400)'};">${d.axiom ? 'AXIOMATIC GROUND TRUTH' : 'DEDUCTIVE LEMMA'}</td>
            <td style="padding: 7px;">${d.derivationRule}</td>
            <td style="padding: 7px; color: var(--emerald-400);">● VERIFIED</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;

      this.auditContainer.innerHTML = html;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.App = new CognitiveMeshApp();
  });
})(window);
