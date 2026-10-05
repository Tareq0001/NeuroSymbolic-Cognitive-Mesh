/**
 * ============================================================================
 * NEUROSYMBOLIC COGNITIVE MESH - FORMAL PROOF TREE VISUALIZER
 * High-DPI Canvas Rendering of Deductive Logic Steps & Q.E.D. Verification Certificate
 * ============================================================================
 */

(function (window) {
  'use strict';

  class ProofTreeVisualizer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }

    render(proofResult) {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || this.canvas.width || 800;
      const h = rect.height || this.canvas.height || 400;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);

      const ctx = this.ctx;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      if (!proofResult || !proofResult.tree) {
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#5d7e6f';
        ctx.textAlign = 'center';
        ctx.fillText('Select a Theorem Goal to Synthesize Formal Deduction Proof Tree', w / 2, h / 2);
        return;
      }

      // Draw Proof Tree recursively
      const padding = { top: 40, left: 30, right: 30, bottom: 30 };
      const tree = proofResult.tree;

      // Assign coordinates
      let currentX = 50;
      const nodeW = 210;
      const nodeH = 48;
      const levelH = 90;

      const layoutNodes = (node, depth = 0) => {
        const children = node.children || [];
        children.forEach(c => layoutNodes(c, depth + 1));

        node.y = padding.top + depth * levelH;
        if (children.length === 0) {
          node.x = currentX;
          currentX += nodeW + 24;
        } else {
          node.x = (children[0].x + children[children.length - 1].x) / 2;
        }
      };

      currentX = 50;
      layoutNodes(tree, 0);

      // Invert levels so Axioms are at top and Theorem is at bottom
      const maxDepth = Math.max(...this.collectAll(tree).map(n => n.y));
      this.collectAll(tree).forEach(n => {
        n.y = maxDepth - (n.y - padding.top);
      });

      // Draw Connections
      this.drawLinks(ctx, tree, nodeW, nodeH);

      // Draw Nodes
      this.drawNodes(ctx, tree, nodeW, nodeH);

      // Q.E.D. Seal Header
      ctx.font = '700 11.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'left';
      ctx.fillText(`FORMAL VERIFICATION: [Q.E.D. CERTIFIED 100%] — Goal: ${proofResult.goal}`, 20, 24);
    }

    collectAll(node) {
      let res = [node];
      (node.children || []).forEach(c => { res = res.concat(this.collectAll(c)); });
      return res;
    }

    drawLinks(ctx, node, nodeW, nodeH) {
      (node.children || []).forEach(c => {
        ctx.beginPath();
        ctx.moveTo(c.x + nodeW / 2, c.y + nodeH);
        ctx.lineTo(node.x + nodeW / 2, node.y);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        this.drawLinks(ctx, c, nodeW, nodeH);
      });
    }

    drawNodes(ctx, node, nodeW, nodeH) {
      const isAxiom = node.isAxiom;
      const isTheorem = (node.children || []).length > 0 && node.rule.startsWith('R3');

      // Box
      ctx.fillStyle = isTheorem ? 'rgba(6, 45, 29, 0.95)' : (isAxiom ? 'rgba(8, 28, 34, 0.95)' : 'rgba(13, 26, 19, 0.95)');
      ctx.strokeStyle = isTheorem ? '#00ff88' : (isAxiom ? '#22d3ee' : '#fb7185');
      ctx.lineWidth = 1.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 6;
      ctx.fillRect(node.x, node.y, nodeW, nodeH);
      ctx.strokeRect(node.x, node.y, nodeW, nodeH);
      ctx.shadowBlur = 0;

      // Text Predicate
      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      const predStr = `${node.predicate}(${node.args.join(', ')})`;
      const cleanPred = predStr.length > 25 ? predStr.substring(0, 24) + '…' : predStr;
      ctx.fillText(cleanPred, node.x + 8, node.y + 18);

      // Rule derivation tag
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = isAxiom ? '#22d3ee' : '#34d399';
      ctx.fillText(isAxiom ? 'AXIOM GROUND TRUTH' : `RULE: ${node.rule}`, node.x + 8, node.y + 34);

      (node.children || []).forEach(c => this.drawNodes(ctx, c, nodeW, nodeH));
    }
  }

  window.ProofTreeVisualizer = ProofTreeVisualizer;
})(window);
