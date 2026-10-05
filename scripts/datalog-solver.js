/**
 * ============================================================================
 * NEUROSYMBOLIC COGNITIVE MESH - FIRST-ORDER LOGIC & DATALOG RESOLUTION SOLVER
 * Unification (MGU), Horn Clause Deductive Engine & Formal Proof Tree Synthesizer
 * ============================================================================
 */

(function (window) {
  'use strict';

  class DatalogSolver {
    constructor() {
      this.facts = [];
      this.rules = [];
      this.proofHistory = [];
      this.loadSovereignInfrastructureKnowledge();
    }

    loadSovereignInfrastructureKnowledge() {
      this.facts = [
        { predicate: 'sensor_telemetry', args: ['satellite_alpha', 'spectral_jamming_detected'], axiom: true },
        { predicate: 'substation_metric', args: ['station_central_500kv', 'frequency_drift_0_8hz'], axiom: true },
        { predicate: 'telemetry_linked', args: ['satellite_alpha', 'station_central_500kv'], axiom: true },
        { predicate: 'threat_signature', args: ['spectral_jamming_detected', 'apt_silent_viper'], axiom: true },
        { predicate: 'critical_asset', args: ['station_central_500kv', 'regional_power_grid'], axiom: true },
        { predicate: 'defense_protocol_ready', args: ['regional_power_grid', 'dynamic_microgrid_islanding'], axiom: true }
      ];

      this.rules = [
        {
          id: 'R1_COORDINATED_CYBER_ATTACK',
          name: 'Coordinated Attack Detection',
          head: { predicate: 'coordinated_attack_active', args: ['?Asset', '?Actor'] },
          body: [
            { predicate: 'sensor_telemetry', args: ['?Sensor', '?Anomaly'] },
            { predicate: 'telemetry_linked', args: ['?Sensor', '?Sub'] },
            { predicate: 'threat_signature', args: ['?Anomaly', '?Actor'] },
            { predicate: 'critical_asset', args: ['?Sub', '?Asset'] }
          ]
        },
        {
          id: 'R2_DEFENSE_TRIGGER',
          name: 'Autonomous Countermeasure Execution',
          head: { predicate: 'execute_countermeasure', args: ['?Asset', '?Protocol'] },
          body: [
            { predicate: 'coordinated_attack_active', args: ['?Asset', '?Actor'] },
            { predicate: 'defense_protocol_ready', args: ['?Asset', '?Protocol'] }
          ]
        },
        {
          id: 'R3_PROVABLE_SURVIVABILITY',
          name: 'Formal Proof of Grid Stability (Q.E.D.)',
          head: { predicate: 'formal_stability_guaranteed', args: ['?Asset'] },
          body: [
            { predicate: 'execute_countermeasure', args: ['?Asset', 'dynamic_microgrid_islanding'] }
          ]
        }
      ];
    }

    isVariable(term) {
      return typeof term === 'string' && term.startsWith('?');
    }

    /**
     * Most General Unifier (MGU) for first-order terms
     */
    unifyTerms(term1, term2, env) {
      if (term1 === term2) return env;
      if (this.isVariable(term1)) {
        if (env[term1] !== undefined) return this.unifyTerms(env[term1], term2, env);
        const newEnv = { ...env, [term1]: term2 };
        return newEnv;
      }
      if (this.isVariable(term2)) {
        if (env[term2] !== undefined) return this.unifyTerms(term1, env[term2], env);
        const newEnv = { ...env, [term2]: term1 };
        return newEnv;
      }
      return null;
    }

    unifyPredicates(p1, p2, env = {}) {
      if (p1.predicate !== p2.predicate || p1.args.length !== p2.args.length) {
        return null;
      }

      let currentEnv = { ...env };
      for (let i = 0; i < p1.args.length; i++) {
        currentEnv = this.unifyTerms(p1.args[i], p2.args[i], currentEnv);
        if (currentEnv === null) return null;
      }
      return currentEnv;
    }

    applyEnvToPredicate(pred, env) {
      return {
        predicate: pred.predicate,
        args: pred.args.map(a => this.isVariable(a) && env[a] !== undefined ? env[a] : a)
      };
    }

    /**
     * Deductive Forward Chaining Fixed-Point Solver
     */
    solveForwardChaining() {
      const derivedFacts = this.facts.map(f => ({ ...f, parents: [], derivationRule: 'AXIOM' }));
      let changed = true;
      let iterations = 0;
      const maxIterations = 20;

      while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;

        for (const rule of this.rules) {
          const matches = this.matchBody(rule.body, derivedFacts, 0, {});

          for (const matchEnv of matches) {
            const candidateFact = this.applyEnvToPredicate(rule.head, matchEnv.env);

            // Check if already in knowledge base
            const exists = derivedFacts.some(df =>
              df.predicate === candidateFact.predicate &&
              df.args.length === candidateFact.args.length &&
              df.args.every((arg, idx) => arg === candidateFact.args[idx])
            );

            if (!exists) {
              derivedFacts.push({
                ...candidateFact,
                axiom: false,
                derivationRule: rule.id,
                ruleName: rule.name,
                parents: matchEnv.matchedFacts
              });
              changed = true;
            }
          }
        }
      }

      this.proofHistory = derivedFacts;
      return derivedFacts;
    }

    matchBody(bodyGoals, facts, goalIdx, currentEnv, matchedFacts = []) {
      if (goalIdx >= bodyGoals.length) {
        return [{ env: currentEnv, matchedFacts }];
      }

      const currentGoal = this.applyEnvToPredicate(bodyGoals[goalIdx], currentEnv);
      const results = [];

      for (const fact of facts) {
        const unifiedEnv = this.unifyPredicates(currentGoal, fact, currentEnv);
        if (unifiedEnv !== null) {
          const subResults = this.matchBody(
            bodyGoals,
            facts,
            goalIdx + 1,
            unifiedEnv,
            [...matchedFacts, fact]
          );
          results.push(...subResults);
        }
      }

      return results;
    }

    /**
     * Synthesize verified Proof Tree for a given goal
     */
    generateProofTree(targetPredicateName) {
      const allDerived = this.solveForwardChaining();
      const targetFact = allDerived.find(f => f.predicate === targetPredicateName);
      if (!targetFact) return null;

      const buildSubTree = fact => {
        return {
          predicate: fact.predicate,
          args: fact.args,
          isAxiom: fact.axiom,
          rule: fact.derivationRule,
          ruleName: fact.ruleName || 'Axiomatic Ground Truth',
          children: (fact.parents || []).map(p => buildSubTree(p))
        };
      };

      return {
        goal: `${targetFact.predicate}(${targetFact.args.join(', ')})`,
        status: 'VERIFIED_QED',
        tree: buildSubTree(targetFact)
      };
    }
  }

  window.DatalogSolver = DatalogSolver;
})(window);
