(function (global) {
  'use strict';

  // ============================================================================
  // Optimization / Decision Engine
  // 汎用最適化計算エンジン
  //
  // Problem shape passed to the solver:
  // {
  //   vars:   [ { name, min, max } | { name, options:[..] } ... ],
  //   derived:[ { name, expr } ... ],          // intermediate quantities
  //   constraints: [ 'expr >= 0', ... ],       // boolean expressions
  //   objective: 'expr',
  //   dir: 'max' | 'min',
  //   resolution: n                            // grid points per continuous var
  // }
  // ============================================================================

  // ---------------------------------------------------------------------------
  // 1. Expression engine (tokenizer + parser + evaluator)
  // ---------------------------------------------------------------------------

  var FUNCS = {
    sqrt: Math.sqrt,
    abs: Math.abs,
    exp: Math.exp,
    log: Math.log,
    log10: Math.log10,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    trunc: Math.trunc,
    pow: Math.pow,
    min: Math.min,
    max: Math.max,
    sign: Math.sign,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan
  };

  function tokenize(src) {
    var tokens = [];
    var s = String(src) || '';
    var i = 0;
    var n = s.length;
    while (i < n) {
      var ch = s[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      var d = /[0-9]/.test(ch);
      if (d) {
        var start = i;
        while (i < n && /[0-9.]/.test(s[i])) i++;
        var str = s.slice(start, i);
        if (str.indexOf('.') === str.length - 1) { str = str.slice(0, -1); i--; }
        var num = parseFloat(str);
        if (!isFinite(num)) throw new Error('Invalid number: "' + str + '"');
        tokens.push({ type: 'num', value: num });
        continue;
      }
      if (/[a-zA-Z_]/.test(ch)) {
        var s2 = i;
        while (i < n && /[a-zA-Z0-9_]/.test(s[i])) i++;
        tokens.push({ type: 'id', value: s.slice(s2, i) });
        continue;
      }
      var two = s.substr(i, 2);
      if (two === '<=' || two === '>=' || two === '==' || two === '!=') {
        tokens.push({ type: 'op', value: two });
        i += 2;
        continue;
      }
      if ('+-*/^(),<>'.indexOf(ch) >= 0) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }
      throw new Error('Unexpected character: "' + ch + '"');
    }
    return tokens;
  }

  function parseExpr(src) {
    var tokens = tokenize(src);
    var p = 0;

    function peek() { return tokens[p] || { type: 'end' }; }
    function next() { return tokens[p++] || { type: 'end' }; }
    function expectOp(op) {
      var t = next();
      if (t.type !== 'op' || t.value !== op) {
        throw new Error('Expected "' + op + '"');
      }
      return t;
    }

    function parsePrimary() {
      var t = next();
      if (t.type === 'num') return { k: 'num', v: t.value };
      if (t.type === 'id') {
        var nt = peek();
        if (nt.type === 'op' && nt.value === '(') {
          next();
          var args = [];
          if (!(peek().type === 'op' && peek().value === ')')) {
            args.push(parseCmp());
            while (peek().type === 'op' && peek().value === ',') { next(); args.push(parseCmp()); }
          }
          expectOp(')');
          return { k: 'call', f: t.value, a: args };
        }
        return { k: 'var', n: t.value };
      }
      if (t.type === 'op' && t.value === '(') {
        var e = parseCmp();
        expectOp(')');
        return e;
      }
      if (t.type === 'op' && t.value === '-') {
        return { k: 'neg', e: parsePrimary() };
      }
      if (t.type === 'op' && t.value === '+') {
        return parsePrimary();
      }
      throw new Error('Unexpected token');
    }

    function parsePower() {
      var left = parsePrimary();
      if (peek().type === 'op' && peek().value === '^') {
        next();
        var right = parsePower();
        left = { k: 'bin', op: '^', l: left, r: right };
      }
      return left;
    }

    function parseMul() {
      var left = parsePower();
      while (peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
        var op = next().value;
        var right = parsePower();
        left = { k: 'bin', op: op, l: left, r: right };
      }
      return left;
    }

    function parseAdd() {
      var left = parseMul();
      while (peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        var op = next().value;
        var right = parseMul();
        left = { k: 'bin', op: op, l: left, r: right };
      }
      return left;
    }

    function parseCmp() {
      var left = parseAdd();
      while (peek().type === 'op' && ['<=', '>=', '==', '!=', '<', '>'].indexOf(peek().value) >= 0) {
        var op = next().value;
        var right = parseAdd();
        left = { k: 'cmp', op: op, l: left, r: right };
      }
      return left;
    }

    var ast = parseCmp();
    if (p < tokens.length) throw new Error('Unexpected trailing tokens');
    return ast;
  }

  function evalNode(node, vars) {
    if (node === null || typeof node !== 'object') throw new Error('Bad expression');
    switch (node.k) {
      case 'num': return node.v;
      case 'var': {
        var v = vars[node.n];
        if (typeof v !== 'number') throw new Error('Undefined variable: ' + node.n);
        return v;
      }
      case 'neg': return -evalNode(node.e, vars);
      case 'bin': {
        var l = evalNode(node.l, vars);
        var r = evalNode(node.r, vars);
        switch (node.op) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return r === 0 ? Infinity * l : l / r;
          case '^': return Math.pow(l, r);
        }
        throw new Error('Unknown operator ' + node.op);
      }
      case 'cmp': {
        var a = evalNode(node.l, vars);
        var b = evalNode(node.r, vars);
        switch (node.op) {
          case '<=': return a <= b ? 1 : 0;
          case '>=': return a >= b ? 1 : 0;
          case '<': return a < b ? 1 : 0;
          case '>': return a > b ? 1 : 0;
          case '==': return a === b ? 1 : 0;
          case '!=': return a !== b ? 1 : 0;
        }
      }
      case 'call': {
        var f = FUNCS[node.f];
        if (!f) throw new Error('Unknown function: ' + node.f);
        return f.apply(null, node.a.map(function (x) { return evalNode(x, vars); }));
      }
    }
    throw new Error('Bad expression node');
  }

  function evaluate(ast, vars) { return evalNode(ast, vars); }

  // ---------------------------------------------------------------------------
  // 2. Shared helpers
  // ---------------------------------------------------------------------------

  function isNum(x) { return typeof x === 'number' && isFinite(x); }

  function fmt(x, digits) {
    digits = digits === undefined ? 4 : digits;
    if (!isNum(x)) return '-';
    var r = Number(x.toFixed(digits));
    return r.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  // ---------------------------------------------------------------------------
  // 3. Generic grid search solver (+ local refinement)
  // ---------------------------------------------------------------------------

  var MAX_GRID = 2000000;

  function buildProblem(model) {
    var p = {
      vars: model.vars || [],
      derived: model.derived || [],
      constraints: (model.constraints || []).map(function (c) { return parseExpr(c); }),
      objective: parseExpr(model.objective),
      dir: model.dir === 'min' ? 'min' : 'max',
      resolution: clamp(Math.round(model.resolution) || 60, 2, 1000)
    };
    if (!p.vars.length) throw new Error('At least one variable is required');
    p.objectiveStr = model.objective;
    return p;
  }

  function makeVarsPoint(p, overrides) {
    var vars = {};
    p.vars.forEach(function (v) {
      vars[v.name] = overrides[v.name];
    });
    p.derived.forEach(function (d) { vars[d.name] = evaluate(parseExpr(d.expr), vars); });
    return vars;
  }

  function feasible(p, vars) {
    for (var i = 0; i < p.constraints.length; i++) {
      if (!evalNode(p.constraints[i], vars)) return false;
    }
    return true;
  }

  function objectiveAt(p, vars) { return evalNode(p.objective, vars); }

  function better(p, a, b) {
    // a better than b ?
    if (p.dir === 'max') return a > b;
    return a < b;
  }

  function solveGrid(problemModel) {
    var p;
    try { p = buildProblem(problemModel); }
    catch (e) { return { status: 'error', message: e.message }; }

    // build axes
    var axes = [];
    var names = [];
    var kinds = [];
    for (var i = 0; i < p.vars.length; i++) {
      var v = p.vars[i];
      names.push(v.name);
      var vals;
      if (v.options && v.options.length) {
        vals = v.options.slice();
        kinds.push('disc');
      } else {
        var n = v.max <= v.min ? 2 : p.resolution;
        vals = [];
        for (var k = 0; k <= n; k++) vals.push(v.min + (v.max - v.min) * k / n);
        kinds.push('cont');
      }
      axes.push(vals);
    }

    var total = 1;
    for (var j = 0; j < axes.length; j++) total *= axes[j].length;
    if (total > MAX_GRID) {
      return { status: 'too_large', message: 'Search space is ' + fmt(total, 0) + ' points (over ' + fmt(MAX_GRID, 0) + '). Lower the resolution or reduce variables.', evals: total };
    }

    var best = null;
    var bestVal = p.dir === 'max' ? -Infinity : Infinity;
    var candidates = [];
    var vars = {};
    var overrides = {};

    function consider() {
      var vv = makeVarsPoint(p, overrides);
      if (!feasible(p, vv)) return;
      var val = objectiveAt(p, vv);
      if (better(p, val, bestVal)) {
        bestVal = val;
        best = { values: objCopy(vv), value: val };
      }
      if (candidates.length >= 12) {
        // replace worst
        candidates.sort(cmpCand);
        var worstVal = candidates[candidates.length - 1].value;
        if (better(p, val, worstVal)) {
          candidates.pop();
          candidates.push({ values: objCopy(vv), value: val });
        }
      } else {
        candidates.push({ values: objCopy(vv), value: val });
      }
    }

    function cmpCand(a, b) { return p.dir === 'max' ? b.value - a.value : a.value - b.value; }

    function rec(d) {
      if (d === names.length) {
        consider();
        return;
      }
      var ax = axes[d];
      for (var i = 0; i < ax.length; i++) {
        overrides[names[d]] = ax[i];
        rec(d + 1);
      }
    }
    rec(0);

    if (!best) return { status: 'infeasible', message: 'No feasible solution found. Check the constraints.', evals: total };

    // ---- local refinement (adaptive coordinate line scans) ----
    var fine = objCopy(best.values);
    var scopes = [0.4, 0.08, 0.02, 0.004];
    var SAMP = 40;
    for (var pass = 0; pass < scopes.length; pass++) {
      var improved = false;
      for (var vi = 0; vi < names.length; vi++) {
        if (kinds[vi] !== 'cont') continue;
        var vv = p.vars[vi];
        var span = vv.max - vv.min;
        var half = span * scopes[pass];
        var center = fine[names[vi]];
        var lo = Math.max(vv.min, center - half);
        var hi = Math.min(vv.max, center + half);
        var bestSpot = fine[names[vi]];
        var bestValHere = bestVal;
        for (var si = 0; si <= SAMP; si++) {
          fine[names[vi]] = lo + (hi - lo) * si / SAMP;
          var cobj = linearObjective(makeVarsPoint(p, fine));
          if (cobj !== null && better(p, cobj, bestValHere)) {
            bestValHere = cobj;
            bestSpot = fine[names[vi]];
            improved = true;
          }
        }
        fine[names[vi]] = bestSpot;
        if (bestValHere !== bestVal) {
          bestVal = bestValHere;
          best = { values: makeVarsPoint(p, fine), value: bestVal };
        }
      }
    }

    candidates.sort(cmpCand);
    var top = candidates.slice(0, 8);

    return {
      status: 'ok',
      dir: p.dir,
      objectiveExpr: p.objectiveStr,
      best: { values: best.values, value: best.value },
      candidates: top,
      evals: total,
      names: names
    };

    function linearObjective(vv) {
      if (!feasible(p, vv)) return null;
      try { return objectiveAt(p, vv); } catch (e) { return null; }
    }
  }

  function evalPoint(problemModel, overrides) {
    var p;
    try { p = buildProblem(problemModel); } catch (e) { return { error: e.message }; }
    var vars = makeVarsPoint(p, overrides);
    var isFeasible = feasible(p, vars);
    var val = isFeasible ? objectiveAt(p, vars) : null;
    return { values: vars, feasible: isFeasible, value: val };
  }

  // ---------------------------------------------------------------------------
  // 4. Expected value solver (problem type B)
  // ---------------------------------------------------------------------------

  function solveExpected(alts) {
    var rows = alts.map(function (alt) {
      var sumP = 0;
      alt.outcomes.forEach(function (o) { sumP += Number(o.prob) || 0; });
      var E = 0, mins = Infinity, maxs = -Infinity, varAcc = 0;
      alt.outcomes.forEach(function (o) {
        var p = (sumP > 0 ? (Number(o.prob) || 0) / sumP : 0);
        var v = Number(o.value) || 0;
        E += p * v;
        mins = Math.min(mins, v);
        maxs = Math.max(maxs, v);
      });
      var dev = 0, sumP2 = 0;
      alt.outcomes.forEach(function (o) {
        var p = (sumP > 0 ? (Number(o.prob) || 0) / sumP : 0);
        if (!p) return;
        sumP2 += p;
        dev += p * Math.pow((Number(o.value) || 0) - E, 2);
      });
      var varc = sumP2 > 0 ? dev / sumP2 : 0;
      return { name: alt.name, E: E, sigma: Math.sqrt(varc), min: mins, max: maxs };
    });

    rows.forEach(function (r) { r.E = isNum(r.E) ? Number(r.E.toFixed(10)) : r.E; });
    rows.sort(function (a, b) { return b.E - a.E; });
    var bestName = rows.length ? rows[0].name : null;
    return { ranking: rows, bestName: bestName };
  }

  // ---------------------------------------------------------------------------
  // 5. 0/1 Knapsack by dynamic programming (problem type C)
  // ---------------------------------------------------------------------------

  function solveKnapsack(items, budget) {
    var clean = (items || []).filter(function (it) {
      return it && it.name !== '' && isNum(Number(it.cost)) && isNum(Number(it.value));
    });
    if (!clean.length) return { status: 'error', message: 'Add at least one item.' };
    var B = Math.max(0, Number(budget));
    if (!isNum(B)) return { status: 'error', message: 'Invalid budget.' };

    var SCALE = 100;
    var cap = Math.round(B * SCALE);
    var tooBig = cap > 3000000;

    if (tooBig) {
      return greedySolution(clean, B, true);
    }

    var n = clean.length;
    var dp = new Float64Array(cap + 1);
    var par = new Int32Array(cap + 1);
    for (var i = 0; i <= cap; i++) par[i] = -1;

    for (var it = 0; it < n; it++) {
      var w = Math.max(1, Math.round(Number(clean[it].cost) * SCALE));
      var v = Number(clean[it].value);
      for (var c = cap; c >= w; c--) {
        var nv = dp[c - w] + v;
        if (nv > dp[c]) { dp[c] = nv; par[c] = it; }
      }
    }

    // trace back
    var chosen = [];
    var c2 = cap;
    var guard = 0;
    while (c2 > 0 && par[c2] !== -1 && guard < n) {
      var idx = par[c2];
      chosen.push(idx);
      c2 -= Math.max(1, Math.round(Number(clean[idx].cost) * SCALE));
      guard++;
    }

    var totalCost = chosen.reduce(function (s, k) { return s + Number(clean[k].cost); }, 0);
    var totalValue = chosen.reduce(function (s, k) { return s + Number(clean[k].value); }, 0);

    chosen.reverse();
    return {
      status: 'ok',
      method: 'dp',
      chosen: chosen.map(function (k) { return { name: clean[k].name, cost: Number(clean[k].cost), value: Number(clean[k].value) }; }),
      totalCost: totalCost,
      totalValue: totalValue,
      leftover: B - totalCost,
      note: 'Exact 0/1 knapsack solution by dynamic programming.'
    };

    function greedySolution(items, B, note) {
      var sorted = items.slice().sort(function (a, b) {
        return (Number(b.value) / Number(b.cost)) - (Number(a.value) / Number(a.cost));
      });
      var rem = B, totV = 0, usedC = 0;
      var sel = [];
      for (var i = 0; i < sorted.length; i++) {
        var cc = Number(sorted[i].cost);
        if (cc <= rem) { rem -= cc; totV += Number(sorted[i].value); usedC += cc; sel.push(sorted[i]); }
      }
      return {
        status: 'ok',
        method: 'greedy',
        chosen: sel.map(function (x) { return { name: x.name, cost: Number(x.cost), value: Number(x.value) }; }),
        totalCost: usedC,
        totalValue: totV,
        leftover: rem,
        note: 'Budget too large for exact DP; greedy (value/cost) approximation used. Result may be near-optimal.'
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Merge / evolution value iteration (problem type E)
  //   W[i] = max( value_i , ( -mergeCost_i + sum(p * W[to]) ) / need_i )
  // ---------------------------------------------------------------------------

  function solveMerge(rarities) {
    var list = (rarities || []).filter(function (r) { return r && r.name !== ''; });
    if (!list.length) return { status: 'error', message: 'Add at least one rarity.' };

    var idx = {};
    list.forEach(function (r, i) { idx[r.name] = i; });

    var W = list.map(function (r) { return Number(r.value) || 0; });
    var MAXIT = 300;
    for (var it = 0; it < MAXIT; it++) {
      var delta = 0;
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        var need = Math.max(1, Number(r.need) || 1);
        var cost = Number(r.mergeCost) || 0;
        var mergeV = -Infinity;
        if (r.outcomes && r.outcomes.length) {
          var sumEV = 0;
          var used = false;
          var missing = false;
          r.outcomes.forEach(function (o) {
            var to = idx[o.target];
            if (to === undefined) { missing = true; return; }
            var pr = Number(o.prob) || 0;
            sumEV += pr * W[to];
            used = true;
          });
          if (used && !missing) mergeV = (sumEV - cost) / need;
        }
        var keep = Number(r.value) || 0;
        var nv = Math.max(keep, mergeV === -Infinity ? keep : mergeV);
        delta = Math.max(delta, Math.abs(nv - W[i]));
        W[i] = nv;
      }
      if (delta < 1e-9) break;
    }

    // best action per mergeable rarity
    var actions = [];
    list.forEach(function (r, i) {
      if (!(r.outcomes && r.outcomes.length)) return;
      var need = Math.max(1, Number(r.need) || 1);
      var cost = Number(r.mergeCost) || 0;
      var evOut = 0, ok = true;
      r.outcomes.forEach(function (o) {
        var to = idx[o.target];
        if (to === undefined) return;
        evOut += (Number(o.prob) || 0) * W[to];
      });
      actions.push({
        from: r.name,
        need: need,
        owned: Number(r.count) || 0,
        feasible: (Number(r.count) || 0) >= need,
        evOutPerMerge: evOut - cost,
        gainPerItem: (evOut - cost) / need - W[i],
        gainPerAction: evOut - cost - need * W[i]
      });
    });
    actions.sort(function (a, b) { return b.gainPerAction - a.gainPerAction; });

    var totalNow = 0, totalBest = 0, totalBase = 0;
    list.forEach(function (r, i) {
      var cnt = Number(r.count) || 0;
      totalBase += cnt * (Number(r.value) || 0);
      totalNow += cnt * W[i];
      totalBest = totalNow;
    });

    return {
      status: 'ok',
      rows: list.map(function (r, i) {
        var keep = Number(r.value) || 0;
        var gain = W[i] - keep;
        return {
          name: r.name,
          value: keep,
          count: Number(r.count) || 0,
          W: W[i],
          gain: gain,
          action: gain > 1e-9 ? 'merge' : 'keep',
          need: r.need,
          mergeable: !!((r.outcomes && r.outcomes.length))
        };
      }),
      totalBase: totalBase,
      totalBest: totalBest,
      expectedGain: totalBest - totalBase,
      actions: actions
    };
  }

  // ---------------------------------------------------------------------------
  // 7. Tiny canvas charts
  // ---------------------------------------------------------------------------

  function setupCanvas(canvas) {
    if (!canvas) return null;
    var rect = canvas.parentNode ? canvas.parentNode.getBoundingClientRect() : { width: 600, height: 260 };
    var w = Math.max(200, Math.round(rect.width || 600));
    var h = canvas.getAttribute('data-height') ? parseInt(canvas.getAttribute('data-height'), 10) : 260;
    var dpr = (global.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = '100%';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function niceTicks(min, max, target) {
    if (min === max) { min -= 1; max += 1; }
    var span = max - min;
    var step = Math.pow(10, Math.floor(Math.log10(span / target)));
    var err = span / target / step;
    if (err >= 10) step *= 10;
    else if (err >= 5) step *= 5;
    else if (err >= 2) step *= 2;
    var lo = Math.floor(min / step) * step;
    var hi = Math.ceil(max / step) * step;
    var ticks = [];
    for (var t = lo; t <= hi + step / 2; t += step) {
      var r = Number(t.toFixed(10));
      if (r >= min - step / 2 && r <= max + step / 2) ticks.push(r);
    }
    return ticks;
  }

  function drawLineChart(canvas, points, opts) {
    opts = opts || {};
    var st = setupCanvas(canvas);
    if (!st) return;
    var ctx = st.ctx, w = st.w, h = st.h;
    var marginL = 52, marginR = 12, marginT = 26, marginB = 30;
    var plotW = w - marginL - marginR;
    var plotH = h - marginT - marginB;

    if (!points || !points.length) {
      ctx.fillStyle = '#999';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', w / 2, h / 2);
      return;
    }

    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var xmin = Math.min.apply(null, xs);
    var xmax = Math.max.apply(null, xs);
    var ymin = Math.min.apply(null, ys);
    var ymax = Math.max.apply(null, ys);
    if (opts.zeroLine) { ymin = Math.min(ymin, 0); ymax = Math.max(ymax, 0); }
    if (ymin === ymax) { ymin -= 1; ymax += 1; }

    var xticks = niceTicks(xmin, xmax, 6);
    var yticks = niceTicks(ymin, ymax, 5);

    function X(v) { return marginL + (v - xmin) / (xmax - xmin) * plotW; }
    function Y(v) { return marginT + (ymax - v) / (ymax - ymin) * plotH; }

    // grid + labels
    ctx.font = '10px sans-serif';
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.fillStyle = '#666';
    xticks.forEach(function (t) {
      ctx.beginPath();
      ctx.moveTo(X(t), marginT);
      ctx.lineTo(X(t), marginT + plotH);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(fmt(t, 4), X(t), marginT + plotH + 14);
    });
    yticks.forEach(function (t) {
      ctx.beginPath();
      ctx.moveTo(marginL, Y(t));
      ctx.lineTo(marginL + plotW, Y(t));
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(fmt(t, 4), marginL - 6, Y(t) + 3);
    });

    // zero reference
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.setLineDash([4, 4]);
    if (0 >= ymin && 0 <= ymax) {
      ctx.beginPath();
      ctx.moveTo(marginL, Y(0));
      ctx.lineTo(marginL + plotW, Y(0));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // line
    ctx.strokeStyle = opts.color || '#1976d2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(X(p.x), Y(p.y));
      else ctx.lineTo(X(p.x), Y(p.y));
    });
    ctx.stroke();

    ctx.fillStyle = opts.color || '#1976d2';
    points.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(X(p.x), Y(p.y), 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    if (opts.title) ctx.fillText(opts.title, marginL, 14);
    if (opts.xlabel) { ctx.textAlign = 'center'; ctx.fillText(opts.xlabel, marginL + plotW / 2, h - 2); }
    if (opts.ylabel) { ctx.save(); ctx.translate(12, marginT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(opts.ylabel, 0, 0); ctx.restore(); }
  }

  function drawBarChart(canvas, groups, opts) {
    opts = opts || {};
    var st = setupCanvas(canvas);
    if (!st) return;
    var ctx = st.ctx, w = st.w, h = st.h;
    var marginL = 48, marginR = 10, marginT = 26, marginB = 32;
    var plotW = w - marginL - marginR;
    var plotH = h - marginT - marginB;

    if (!groups || !groups.length) { ctx.fillText('No data', w / 2, h / 2); return; }

    var values = [];
    groups.forEach(function (g) {
      (g.bars || []).forEach(function (b) { values.push(b.value); });
    });
    var vmin = Math.min(0, Math.min.apply(null, values));
    var vmax = Math.max(0, Math.max.apply(null, values));
    if (vmin === vmax) { vmin -= 1; vmax += 1; }
    var bmax = Math.max(Math.abs(vmin), Math.abs(vmax));

    var yticks = niceTicks(vmin, vmax, 5);
    function Y(v) { return marginT + (bmax - v) / (bmax * 2) * plotH; }

    ctx.font = '10px sans-serif';
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.fillStyle = '#666';
    yticks.forEach(function (t) {
      ctx.beginPath();
      ctx.moveTo(marginL, Y(t));
      ctx.lineTo(marginL + plotW, Y(t));
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(fmt(t, 4), marginL - 6, Y(t) + 3);
    });

    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(marginL, Y(0));
    ctx.lineTo(marginL + plotW, Y(0));
    ctx.stroke();

    var slot = plotW / groups.length;
    var barW = Math.min(slot * 0.7, (slot * 0.8) / Math.max(1, groups[0].bars.length || 1));
    groups.forEach(function (g, gi) {
      var cx = marginL + slot * gi + slot / 2;
      var bx = cx - ((g.bars.length) * barW) / 2;
      g.bars.forEach(function (b, bi) {
        var x = bx + bi * barW;
        var vh = Math.abs(b.value) / (bmax * 2) * plotH;
        if (b.value >= 0) {
          ctx.fillStyle = b.color || '#1976d2';
          ctx.fillRect(x, Y(0) - vh, barW - 2, vh);
        } else {
          ctx.fillStyle = b.color || '#e53935';
          ctx.fillRect(x, Y(0), barW - 2, vh);
        }
      });
      ctx.fillStyle = '#333';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.label, cx, marginT + plotH + 14);
    });

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    if (opts.title) ctx.fillText(opts.title, marginL, 14);
  }

  // ---------------------------------------------------------------------------
  // 8. Minor numeric utils
  // ---------------------------------------------------------------------------

  function objCopy(o) {
    var r = {};
    for (var k in o) { if (o.hasOwnProperty(k)) r[k] = o[k]; }
    return r;
  }

  // ---------------------------------------------------------------------------

  global.Opt = {
    parseExpr: parseExpr,
    evalNode: evalNode,
    evaluate: evaluate,
    solveGrid: solveGrid,
    evalPoint: evalPoint,
    solveExpected: solveExpected,
    solveKnapsack: solveKnapsack,
    solveMerge: solveMerge,
    fmt: fmt,
    drawLineChart: drawLineChart,
    drawBarChart: drawBarChart,
    FUNCS: FUNCS
  };

})(window);