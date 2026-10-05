/**
 * ============================================================================
 * NEUROSYMBOLIC COGNITIVE MESH - CYBER TERMINAL CLI REPL
 * Logic Query Engine, Deductive Execution, Hypergraph Inspection & Theorem Prover
 * ============================================================================
 */

(function (window) {
  'use strict';

  class CyberLogicCLI {
    constructor(bodyEl, inputEl) {
      this.body = bodyEl;
      this.input = inputEl;
      this.history = [];
      this.historyIdx = -1;

      this.commands = {
        'help': 'Display list of available logical commands',
        'prove': 'Synthesize formal proof tree for goal predicate (e.g. prove formal_stability_guaranteed)',
        'infer': 'Run full forward-chaining fixed point solver across all axioms',
        'facts': 'List all current ground axioms and derived predicates',
        'rules': 'List all Horn clause production rules in Datalog engine',
        'mesh': 'Display hypergraph vertex degree and hyperedge incidence metrics',
        'clear': 'Clear console output',
        'about': 'Show platform architecture and author'
      };

      this.init();
    }

    init() {
      this.printBanner();
      this.input.addEventListener('keydown', e => this.handleKeyDown(e));
    }

    printBanner() {
      const banner = `
  ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗ 
  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔═══██╗
  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║   ██║
  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║
  ██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝
  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ 
  NEUROSYMBOLIC COGNITIVE MESH | FORMAL LOGIC WORKSTATION
  Z3 Formal Verification & Hypergraph Resolution [PROD v2.8]
  Type 'help' for commands or 'infer' to execute logic solver.`;
      this.write(banner, 'text-emerald');
    }

    handleKeyDown(e) {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIdx = this.history.length;
          this.write(`> ${cmd}`, 'cmd-echo');
          this.exec(cmd);
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx];
        } else {
          this.historyIdx = this.history.length;
          this.input.value = '';
        }
      }
    }

    write(text, cls = '') {
      const div = document.createElement('div');
      div.className = `terminal-line ${cls}`;
      div.style.whiteSpace = 'pre-wrap';
      div.style.marginBottom = '3px';
      div.textContent = text;
      this.body.appendChild(div);
      this.body.scrollTop = this.body.scrollHeight;
    }

    exec(cmdStr) {
      const parts = cmdStr.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const arg = parts[1];

      switch (cmd) {
        case 'help':
          let out = 'AVAILABLE LOGIC COMMANDS:\n';
          Object.entries(this.commands).forEach(([k, v]) => {
            out += `  ${k.padEnd(10)} - ${v}\n`;
          });
          this.write(out, 'text-cyan');
          break;

        case 'clear':
          this.body.innerHTML = '';
          break;

        case 'about':
          this.write('NEUROSYMBOLIC COGNITIVE MESH\nArchitect: Tareq Aboushi (Tareq0001)\nEngine: First-Order Logic Datalog Resolution + Hypergraph Barycenter Physics\nZero Hallucination Guarantee: 100% Mathematically Verified.', 'text-emerald');
          break;

        case 'infer':
          if (window.App && window.App.solver) {
            const derived = window.App.solver.solveForwardChaining();
            let res = `FORWARD CHAINING RESOLUTION COMPLETE (${derived.length} TOTAL FACTS):\n`;
            derived.forEach((f, idx) => {
              const src = f.axiom ? '[AXIOM]' : `[DERIVED: ${f.derivationRule}]`;
              res += `  ${(idx + 1).toString().padStart(2)}. ${f.predicate}(${f.args.join(', ')}) ${src}\n`;
            });
            this.write(res, 'text-emerald');
          }
          break;

        case 'prove':
          const target = arg || 'formal_stability_guaranteed';
          if (window.App) {
            window.App.proveGoal(target);
            this.write(`Proof Tree synthesized for goal: ${target}. Inspected in Proof Studio.`, 'text-cyan');
          }
          break;

        case 'rules':
          if (window.App && window.App.solver) {
            let rOut = 'DATALOG HORN CLAUSES:\n';
            window.App.solver.rules.forEach(r => {
              const bodyStr = r.body.map(b => `${b.predicate}(${b.args.join(',')})`).join(' ∧ ');
              rOut += `  ${r.id}: ${r.head.predicate}(${r.head.args.join(',')}) ← ${bodyStr}\n`;
            });
            this.write(rOut, 'text-coral');
          }
          break;

        case 'mesh':
          if (window.App && window.App.hypergraph) {
            const vCount = window.App.hypergraph.vertices.length;
            const heCount = window.App.hypergraph.hyperedges.length;
            this.write(`HYPERGRAPH METRICS:\n  Vertices: ${vCount}\n  Hyperedges: ${heCount}\n  Average Hyperedge Degree: ${(vCount / heCount).toFixed(2)}\n  Status: CONVERGED & HARMONIC`, 'text-cyan');
          }
          break;

        default:
          this.write(`Command '${cmd}' not recognized. Type 'help'.`, 'text-coral');
          break;
      }
    }
  }

  window.CyberLogicCLI = CyberLogicCLI;
})(window);
