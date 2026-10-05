/**
 * ============================================================================
 * NEUROSYMBOLIC COGNITIVE MESH - MATHEMATICAL HYPERGRAPH SIMULATION ENGINE
 * Hypergraph Geometry: Barycenter Force Clustering, Convex Hull Envelopes & Energy Waves
 * ============================================================================
 */

(function (window) {
  'use strict';

  class MathematicalHypergraphEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.vertices = [];
      this.hyperedges = [];
      this.activeProofPath = [];
      this.animId = null;

      // Transform
      this.transform = { x: 0, y: 0, scale: 1.0 };
      this.draggedVertex = null;
      this.hoveredItem = null;
      this.isPanning = false;
      this.panStart = { x: 0, y: 0 };
      this.wavePhase = 0;

      // Physics parameters
      this.kRep = 3600;
      this.kHyper = 0.055;
      this.damping = 0.86;

      this.initDefaultDomainHypergraph();
      this.attachEvents();
      this.startLoop();
    }

    initDefaultDomainHypergraph() {
      // Vertices: entities, predicates, and sovereign concepts
      this.vertices = [
        { id: 'v_satellite_telemetry', label: 'Satellite: Telemetry Stream', type: 'sensor', x: -240, y: -140, vx: 0, vy: 0, r: 16 },
        { id: 'v_signal_anomaly', label: 'Anomaly: Spectral Jamming', type: 'event', x: -280, y: 20, vx: 0, vy: 0, r: 18 },
        { id: 'v_grid_frequency', label: 'Substation: 50Hz Drift', type: 'sensor', x: -220, y: 160, vx: 0, vy: 0, r: 16 },
        
        { id: 'v_rule_coordinated_cyber', label: 'Rule: Coordinated Attack', type: 'rule', x: -60, y: -70, vx: 0, vy: 0, r: 20 },
        { id: 'v_adversary_apt', label: 'Threat Actor: APT-SILENT_VIPER', type: 'entity', x: -40, y: 80, vx: 0, vy: 0, r: 22 },
        { id: 'v_infrastructure_target', label: 'Target: Regional Power Grid', type: 'asset', x: 120, y: -120, vx: 0, vy: 0, r: 22 },

        { id: 'v_defense_mitigation', label: 'Countermeasure: Islanding', type: 'action', x: 280, y: -40, vx: 0, vy: 0, r: 24 },
        { id: 'v_verified_theorem', label: 'Theorem: Grid Survival Guaranteed', type: 'theorem', x: 300, y: 120, vx: 0, vy: 0, r: 26 }
      ];

      // Hyperedges (connecting >= 2 vertices in an n-ary logical relationship)
      this.hyperedges = [
        {
          id: 'he_detection',
          label: 'HE_Detection (Telemetry, Anomaly, Drift)',
          vertexIds: ['v_satellite_telemetry', 'v_signal_anomaly', 'v_grid_frequency'],
          color: 'rgba(34, 211, 238, 0.22)',
          stroke: '#22d3ee',
          active: true
        },
        {
          id: 'he_correlation',
          label: 'HE_Correlation (Anomaly, CoordinatedAttack, APT)',
          vertexIds: ['v_signal_anomaly', 'v_rule_coordinated_cyber', 'v_adversary_apt'],
          color: 'rgba(251, 113, 133, 0.22)',
          stroke: '#fb7185',
          active: true
        },
        {
          id: 'he_threat_impact',
          label: 'HE_Impact (CoordinatedAttack, Target, APT)',
          vertexIds: ['v_rule_coordinated_cyber', 'v_infrastructure_target', 'v_adversary_apt'],
          color: 'rgba(245, 158, 11, 0.22)',
          stroke: '#fbbf24',
          active: true
        },
        {
          id: 'he_formal_proof',
          label: 'HE_Proof (Target, Islanding, Theorem)',
          vertexIds: ['v_infrastructure_target', 'v_defense_mitigation', 'v_verified_theorem'],
          color: 'rgba(16, 185, 129, 0.28)',
          stroke: '#00ff88',
          active: true
        }
      ];

      // Center view
      const rect = this.canvas.getBoundingClientRect();
      this.transform.x = (rect.width || this.canvas.width) / 2;
      this.transform.y = (rect.height || this.canvas.height) / 2;
    }

    startLoop() {
      const step = () => {
        this.update();
        this.render();
        this.wavePhase = (this.wavePhase + 0.04) % (Math.PI * 2);
        this.animId = requestAnimationFrame(step);
      };
      this.animId = requestAnimationFrame(step);
    }

    update() {
      const n = this.vertices.length;

      // Pairwise vertex repulsion
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const u = this.vertices[i];
          const v = this.vertices[j];
          const dx = v.x - u.x;
          const dy = v.y - u.y;
          let distSq = dx * dx + dy * dy;
          if (distSq < 10) distSq = 10;
          const dist = Math.sqrt(distSq);
          const f = this.kRep / distSq;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;

          if (u !== this.draggedVertex) {
            u.vx -= fx;
            u.vy -= fy;
          }
          if (v !== this.draggedVertex) {
            v.vx += fx;
            v.vy += fy;
          }
        }
      }

      // Hyperedge Barycenter Attraction
      this.hyperedges.forEach(he => {
        const memberVertices = this.vertices.filter(v => he.vertexIds.includes(v.id));
        if (memberVertices.length < 2) return;

        // Compute barycenter
        let bx = 0, by = 0;
        memberVertices.forEach(v => { bx += v.x; by += v.y; });
        bx /= memberVertices.length;
        by /= memberVertices.length;
        he.barycenter = { x: bx, y: by };

        // Pull members toward barycenter
        memberVertices.forEach(v => {
          if (v === this.draggedVertex) return;
          const dx = bx - v.x;
          const dy = by - v.y;
          v.vx += dx * this.kHyper;
          v.vy += dy * this.kHyper;
        });
      });

      // Integrate velocities
      for (let i = 0; i < n; i++) {
        const u = this.vertices[i];
        if (u === this.draggedVertex) continue;
        u.vx *= this.damping;
        u.vy *= this.damping;
        u.x += u.vx;
        u.y += u.vy;
      }
    }

    render() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || this.canvas.width;
      const h = rect.height || this.canvas.height;

      if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
      }

      const ctx = this.ctx;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(this.transform.x, this.transform.y);
      ctx.scale(this.transform.scale, this.transform.scale);

      // Draw Hyperedge Convex Hulls / Envelopes
      this.hyperedges.forEach(he => {
        const members = this.vertices.filter(v => he.vertexIds.includes(v.id));
        if (members.length < 2) return;

        ctx.beginPath();
        // Compute convex hull points with margin
        const hull = this.computeConvexHull(members.map(m => ({ x: m.x, y: m.y })));
        if (hull.length > 2) {
          ctx.moveTo(hull[0].x, hull[0].y);
          for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i].x, hull[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = he.color;
          ctx.fill();

          ctx.strokeStyle = he.stroke;
          ctx.lineWidth = he.active ? 2.2 : 1.2;
          ctx.shadowColor = he.stroke;
          ctx.shadowBlur = he.active ? 14 : 4;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Connect members to barycenter with glowing energy pulses
        if (he.barycenter) {
          members.forEach((m, idx) => {
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(he.barycenter.x, he.barycenter.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Energy Wave Dot
            const progress = (Math.sin(this.wavePhase + idx) + 1) / 2;
            const px = m.x + (he.barycenter.x - m.x) * progress;
            const py = m.y + (he.barycenter.y - m.y) * progress;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = he.stroke;
            ctx.shadowColor = he.stroke;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Draw Barycenter core
          ctx.beginPath();
          ctx.arc(he.barycenter.x, he.barycenter.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = he.stroke;
          ctx.fill();
        }
      });

      // Draw Vertices
      this.vertices.forEach(v => {
        const isHovered = v === this.hoveredItem;
        const isDragged = v === this.draggedVertex;

        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);

        if (v.type === 'theorem') {
          ctx.fillStyle = '#062d1d';
          ctx.strokeStyle = '#00ff88';
          ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        } else if (v.type === 'event' || v.type === 'rule') {
          ctx.fillStyle = '#2d0e16';
          ctx.strokeStyle = '#fb7185';
          ctx.shadowColor = 'rgba(251, 113, 133, 0.8)';
        } else if (v.type === 'action') {
          ctx.fillStyle = '#261b07';
          ctx.strokeStyle = '#fbbf24';
          ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        } else {
          ctx.fillStyle = '#081c22';
          ctx.strokeStyle = '#22d3ee';
          ctx.shadowColor = 'rgba(34, 211, 238, 0.7)';
        }

        ctx.lineWidth = isHovered || isDragged ? 3 : 2;
        ctx.shadowBlur = isHovered ? 18 : 8;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = '600 10.5px "JetBrains Mono", monospace';
        ctx.fillStyle = isHovered ? '#ffffff' : '#d1fae5';
        ctx.textAlign = 'center';
        ctx.fillText(v.label, v.x, v.y + v.r + 14);
      });

      ctx.restore();
    }

    computeConvexHull(points) {
      if (points.length < 3) return points;
      // Expand points slightly by margin for visual capsule
      const margin = 28;
      const expanded = [];
      points.forEach(p => {
        expanded.push({ x: p.x - margin, y: p.y - margin });
        expanded.push({ x: p.x + margin, y: p.y - margin });
        expanded.push({ x: p.x + margin, y: p.y + margin });
        expanded.push({ x: p.x - margin, y: p.y + margin });
      });

      expanded.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

      const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

      const lower = [];
      for (let i = 0; i < expanded.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], expanded[i]) <= 0) {
          lower.pop();
        }
        lower.push(expanded[i]);
      }

      const upper = [];
      for (let i = expanded.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], expanded[i]) <= 0) {
          upper.pop();
        }
        upper.push(expanded[i]);
      }

      upper.pop();
      lower.pop();
      return lower.concat(upper);
    }

    attachEvents() {
      const getPos = e => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const wx = (mx - this.transform.x) / this.transform.scale;
        const wy = (my - this.transform.y) / this.transform.scale;
        return { mx, my, wx, wy };
      };

      this.canvas.addEventListener('mousedown', e => {
        const { mx, my, wx, wy } = getPos(e);
        const hit = this.vertices.find(v => {
          const dx = v.x - wx;
          const dy = v.y - wy;
          return dx * dx + dy * dy <= v.r * v.r;
        });

        if (hit) {
          this.draggedVertex = hit;
        } else {
          this.isPanning = true;
          this.panStart = { x: mx - this.transform.x, y: my - this.transform.y };
        }
      });

      window.addEventListener('mousemove', e => {
        const { mx, my, wx, wy } = getPos(e);

        if (this.draggedVertex) {
          this.draggedVertex.x = wx;
          this.draggedVertex.y = wy;
          this.draggedVertex.vx = 0;
          this.draggedVertex.vy = 0;
        } else if (this.isPanning) {
          this.transform.x = mx - this.panStart.x;
          this.transform.y = my - this.panStart.y;
        } else {
          const hit = this.vertices.find(v => {
            const dx = v.x - wx;
            const dy = v.y - wy;
            return dx * dx + dy * dy <= v.r * v.r;
          });
          this.hoveredItem = hit || null;
          this.canvas.style.cursor = hit ? 'grab' : 'default';
        }
      });

      window.addEventListener('mouseup', () => {
        this.draggedVertex = null;
        this.isPanning = false;
      });

      this.canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        this.transform.scale = Math.max(0.35, Math.min(3.0, this.transform.scale * factor));
      }, { passive: false });
    }

    resetCamera() {
      const rect = this.canvas.getBoundingClientRect();
      this.transform = {
        x: (rect.width || this.canvas.width) / 2,
        y: (rect.height || this.canvas.height) / 2,
        scale: 1.0
      };
    }
  }

  window.MathematicalHypergraphEngine = MathematicalHypergraphEngine;
})(window);
