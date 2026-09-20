(() => {
  const UNITS = [
    { id: "guard", name: "Bumper", atk: 2, hp: 5, trigger: "start", text: "Start: +1 ATK partner (self if solo)" },
    { id: "skirmisher", name: "Rivet", atk: 2, hp: 4, trigger: "hurt", text: "Hurt: 1 to attacker, +1 HP partner (self if solo)" },
    { id: "anchor", name: "Jack", atk: 1, hp: 6, trigger: "start", text: "Start: +2 HP partner (self if solo)" },
    { id: "scout", name: "Spotter", atk: 2, hp: 3, trigger: "faint", faintAim: "adjacent", text: "Faint: +1 HP adjacent lane" },
    { id: "bruiser", name: "Sledge", atk: 4, hp: 2, trigger: "hurt", text: "Hurt: 1 to attacker" },
    { id: "medic", name: "Patch", atk: 1, hp: 4, trigger: "faint", faintAim: "partner", text: "Faint: +2 HP partner in this lane" },
    { id: "blade", name: "Torque", atk: 3, hp: 2, trigger: "start", text: "Start: +2 ATK partner (+1 ATK if solo)" },
    { id: "wall", name: "Fender", atk: 2, hp: 6, trigger: "hurt", text: "Hurt: 1 to attacker and 1 to an adjacent enemy front" },
    { id: "crew", name: "Pit", atk: 2, hp: 3, trigger: "faint", faintAim: "partner", text: "Faint: +1 ATK partner in this lane" },
  ];

  const BUY = 3;
  const ROLL = 1;
  const SERVICE = 3;
  const START_GOLD = 9;
  const CAP = 2;
  const VET_ATK = 1;
  const VET_HP = 2;

  const el = {
    gold: document.getElementById("gold"),
    round: document.getElementById("round"),
    record: document.getElementById("record"),
    offers: document.getElementById("offers"),
    board: document.getElementById("board"),
    enemy: document.getElementById("enemy"),
    log: document.getElementById("log"),
    end: document.getElementById("end-screen"),
    endTitle: document.getElementById("end-title"),
    endDetail: document.getElementById("end-detail"),
    shop: document.getElementById("shop-screen"),
    spendWrap: document.getElementById("spend-wrap"),
    spendMap: document.getElementById("spend-map"),
    btnRoll: document.getElementById("btn-roll"),
    btnEnd: document.getElementById("btn-end"),
    btnNext: document.getElementById("btn-next"),
    btnRematch: document.getElementById("btn-rematch"),
  };

  let state = null;
  let selectedOffer = null;
  let freezeIdx = null;
  let sessionStarted = false;

  function ping(key) {
    try {
      const url = "https://abacus.jasoncameron.dev/hit/ship-lab-las/" + encodeURIComponent(key);
      if (navigator.sendBeacon) navigator.sendBeacon(url);
      else fetch(url, { mode: "no-cors", keepalive: true }).catch(() => {});
    } catch (_) {}
  }

  function template(id) {
    return UNITS.find((x) => x.id === id) || UNITS[0];
  }

  function cloneUnit(u) {
    if (u && u.maxHp != null) {
      return {
        id: u.id,
        name: u.name,
        atk: u.atk,
        hp: u.hp,
        maxHp: u.maxHp,
        trigger: u.trigger,
        faintAim: u.faintAim,
        text: u.text,
        veteran: !!u.veteran,
      };
    }
    const t = u.id ? template(u.id) : u;
    return {
      id: t.id,
      name: t.name,
      atk: t.atk,
      hp: t.hp,
      maxHp: t.hp,
      trigger: t.trigger,
      faintAim: t.faintAim,
      text: t.text,
      veteran: false,
    };
  }

  function healUnit(u) {
    return Object.assign({}, u, { hp: u.maxHp });
  }

  function canFuseLane(stack) {
    return (
      stack.length === 2 &&
      stack[0].id === stack[1].id &&
      !stack[0].veteran &&
      !stack[1].veteran
    );
  }

  function randomUnit() {
    return cloneUnit(UNITS[Math.floor(Math.random() * UNITS.length)]);
  }

  function emptyLanes() {
    return [[], [], []];
  }

  function countUnits(lanes) {
    return lanes.reduce((n, stack) => n + stack.length, 0);
  }

  function rollOffers(keepFrozen) {
    const next = [];
    for (let i = 0; i < 4; i++) {
      if (keepFrozen && freezeIdx === i && state.offers[i]) next.push(state.offers[i]);
      else next.push(randomUnit());
    }
    return next;
  }

  function startRun() {
    state = {
      gold: START_GOLD,
      round: 1,
      wins: 0,
      losses: 0,
      phase: "shop",
      offers: rollOffers(false),
      lanes: emptyLanes(),
      enemy: emptyLanes(),
      lastEnemy: emptyLanes(),
      lastYou: emptyLanes(),
      log: [],
      pendingRound: null,
    };
    selectedOffer = null;
    freezeIdx = null;
    el.end.classList.add("hidden");
    el.spendWrap.classList.add("hidden");
    el.shop.classList.remove("hidden");
    render();
  }

  function log(msg, cls) {
    state.log.push({ msg, cls });
    if (state.log.length > 120) state.log.shift();
  }

  function render() {
    el.gold.textContent = "Gold: " + state.gold;
    el.round.textContent = "Round " + state.round;
    el.record.textContent = "W" + state.wins + " – L" + state.losses;

    el.offers.innerHTML = "";
    if (state.phase === "shop") {
      state.offers.forEach((u, i) => {
        if (!u) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "offer" +
          (selectedOffer === i ? " selected" : "") +
          (freezeIdx === i ? " frozen" : "") +
          (isCopyOffer(u, state.lanes) ? " copy" : "");
        btn.innerHTML =
          '<span class="name">' +
          u.name +
          " · " +
          BUY +
          "g" +
          (isCopyOffer(u, state.lanes) ? " · COPY" : "") +
          "</span><span class=\"meta\">" +
          u.atk +
          "/" +
          u.hp +
          " · " +
          u.text +
          (freezeIdx === i ? " · FROZEN" : "") +
          "</span>";
        btn.addEventListener("click", () => onOfferClick(i));
        el.offers.appendChild(btn);
      });
    }

    const placed = countUnits(state.lanes);
    el.btnRoll.disabled = state.phase !== "shop" || state.gold < ROLL;
    el.btnEnd.disabled = state.phase !== "shop" || placed < 1;
    el.btnEnd.title = placed < 1 ? "Place at least 1 unit before fighting" : "";

    el.board.innerHTML = "";
    el.enemy.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      el.board.appendChild(laneEl(i, state.lanes[i], true));
      const showEnemy =
        state.phase === "reveal" || state.phase === "fight"
          ? state.lastEnemy[i]
          : state.enemy[i];
      el.enemy.appendChild(laneEl(i, showEnemy || [], false));
    }

    el.log.innerHTML = state.log
      .map((l) => '<div class="' + (l.cls || "") + '">' + l.msg + "</div>")
      .join("");
    el.log.scrollTop = el.log.scrollHeight;
  }

  function laneEl(i, stack, mine) {
    const div = document.createElement("div");
    const canDrop =
      mine &&
      state.phase === "shop" &&
      selectedOffer !== null &&
      stack.length < CAP;
    div.className = "lane" + (canDrop ? " drop" : "");
    div.innerHTML =
      '<div class="tag">Lane ' +
      (i + 1) +
      " · " +
      stack.length +
      "/" +
      CAP +
      (mine && state.phase === "shop" && stack.length === 2
        ? ' <button type="button" class="swap" data-swap="' + i + '">Swap</button>'
        : "") +
      (mine && state.phase === "shop" && canFuseLane(stack)
        ? ' <button type="button" class="swap fuse" data-fuse="' + i + '">Fuse</button>'
        : "") +
      "</div>";
    const wrap = document.createElement("div");
    wrap.className = "stack";
    if (!stack.length) {
      const empty = document.createElement("div");
      empty.style.color = "var(--muted)";
      empty.style.fontSize = "0.85rem";
      empty.textContent =
        mine && state.phase === "shop"
          ? "Empty — tap to place (max " + CAP + ")"
          : "Empty";
      wrap.appendChild(empty);
    } else {
      stack.forEach((unit, slot) => {
        const u = document.createElement("div");
        u.className = "unit" + (slot === 0 ? " front" : "") + (unit.veteran ? " vet" : "");
        u.innerHTML =
          '<span class="name">' +
          (slot === 0 ? "Front · " : "Back · ") +
          unit.name +
          (unit.veteran ? " · VET" : "") +
          '</span><span class="meta">' +
          unit.atk +
          "/" +
          unit.hp +
          " · " +
          unit.text +
          "</span>" +
          (mine && state.phase === "shop"
            ? '<span class="unit-acts">' +
              '<button type="button" class="act" data-sell>Sell ' +
              BUY +
              "g</button>" +
              '<button type="button" class="act" data-svc' +
              (state.gold < SERVICE ? " disabled" : "") +
              ">Svc " +
              SERVICE +
              "g</button></span>"
            : "");
        if (mine && state.phase === "shop") {
          u.querySelector("[data-sell]").addEventListener("click", (e) => {
            e.stopPropagation();
            sellUnit(i, slot);
          });
          u.querySelector("[data-svc]").addEventListener("click", (e) => {
            e.stopPropagation();
            serviceUnit(i, slot);
          });
        }
        wrap.appendChild(u);
      });
    }
    div.appendChild(wrap);
    const swapBtn = div.querySelector("[data-swap]");
    if (swapBtn) {
      swapBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        swapLane(i);
      });
    }
    const fuseBtn = div.querySelector("[data-fuse]");
    if (fuseBtn) {
      fuseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fuseLane(i);
      });
    }
    if (canDrop) div.addEventListener("click", () => onLaneClick(i));
    return div;
  }

  function onOfferClick(i) {
    if (state.phase !== "shop") return;
    if (selectedOffer === i) {
      freezeIdx = freezeIdx === i ? null : i;
      render();
      return;
    }
    selectedOffer = i;
    render();
  }

  function onLaneClick(i) {
    if (state.phase !== "shop" || selectedOffer === null) return;
    if (state.lanes[i].length >= CAP) {
      log("Lane " + (i + 1) + " is full (max " + CAP + ").");
      render();
      return;
    }
    if (state.gold < BUY) {
      log("Not enough gold.");
      render();
      return;
    }
    const offer = state.offers[selectedOffer];
    state.gold -= BUY;
    state.lanes[i].push(cloneUnit(offer));
    state.offers[selectedOffer] = null;
    if (freezeIdx === selectedOffer) freezeIdx = null;
    selectedOffer = null;
    if (!sessionStarted) {
      sessionStarted = true;
      ping("session_start");
    }
    log("Bought " + offer.name + " into Lane " + (i + 1) + " (slot " + state.lanes[i].length + ").");
    render();
  }

  function sellUnit(lane, slot) {
    if (state.phase !== "shop") return;
    const stack = state.lanes[lane];
    if (!stack[slot]) return;
    const name = stack[slot].name;
    stack.splice(slot, 1);
    state.gold += BUY;
    selectedOffer = null;
    log("Sold " + name + " (+" + BUY + "g refund).");
    render();
  }

  function swapLane(lane) {
    if (state.phase !== "shop") return;
    const stack = state.lanes[lane];
    if (!stack || stack.length < 2) return;
    state.lanes[lane] = [stack[1], stack[0]];
    log("Lane " + (lane + 1) + ": swapped front/back.");
    render();
  }

  function fuseLane(lane) {
    if (state.phase !== "shop") return;
    const stack = state.lanes[lane];
    if (!canFuseLane(stack)) {
      log(
        stack.length === 2 && (stack[0].veteran || stack[1].veteran)
          ? "Already a Veteran — one step only."
          : "Fuse needs two matching unfused copies in this lane.",
      );
      render();
      return;
    }
    const keep = stack[0];
    const t = template(keep.id);
    keep.veteran = true;
    keep.atk += VET_ATK;
    keep.maxHp += VET_HP;
    keep.hp = keep.maxHp;
    keep.name = "Veteran " + t.name;
    state.lanes[lane] = [keep];
    log("Fused two " + t.name + "s into " + keep.name + " (" + keep.atk + "/" + keep.maxHp + "). Slot freed.");
    render();
  }

  function serviceUnit(lane, slot) {
    if (state.phase !== "shop") return;
    const unit = state.lanes[lane][slot];
    if (!unit) return;
    if (state.gold < SERVICE) {
      log("Not enough gold for Service.");
      render();
      return;
    }
    state.gold -= SERVICE;
    unit.atk += 1;
    unit.maxHp += 1;
    unit.hp += 1;
    log("Serviced " + unit.name + " → " + unit.atk + "/" + unit.hp + ".");
    render();
  }

  function doRoll() {
    if (state.phase !== "shop" || state.gold < ROLL) return;
    state.gold -= ROLL;
    state.offers = rollOffers(true);
    selectedOffer = null;
    log("Rolled shop.");
    render();
  }

  function buildEnemy() {
    // R1 MUST: 3 buys, 1-1-1 cover, no rolls, no stat hacks, no sniping.
    const enemy = emptyLanes();
    let budget = START_GOLD + Math.min(2, state.round - 1) * 3;
    const picks = [];
    const maxBuys = state.round === 1 ? 3 : Math.min(6, Math.floor(budget / BUY));
    while (budget >= BUY && picks.length < maxBuys) {
      picks.push(randomUnit());
      budget -= BUY;
    }
    for (let lane = 0; lane < 3 && picks.length; lane++) {
      if (enemy[lane].length === 0) enemy[lane].push(picks.shift());
    }
    if (state.round === 1) return enemy;
    while (picks.length) {
      const u = picks.shift();
      let lane = -1;
      for (let i = 0; i < 3; i++) {
        if (enemy[i].length === 0) {
          lane = i;
          break;
        }
      }
      if (lane < 0) {
        const open = [0, 1, 2].filter((i) => enemy[i].length < CAP);
        if (!open.length) break;
        open.sort((a, b) => enemy[a].length - enemy[b].length);
        lane = open[0];
        if (open.length > 1 && Math.random() < 0.45) lane = open[Math.floor(Math.random() * open.length)];
      }
      enemy[lane].push(u);
    }
    if (enemy.filter(function (l) { return l.length > 0; }).length < 3) return enemy;
    return enemy.map(function (stack) {
      if (!canFuseLane(stack)) return stack;
      const keep = Object.assign({}, stack[0]);
      keep.veteran = true;
      keep.atk += VET_ATK;
      keep.maxHp += VET_HP;
      keep.hp = keep.maxHp;
      keep.name = "Veteran " + keep.name.replace(/^Veteran /, "");
      return [keep];
    });
  }

  function snapshotLanes(lanes) {
    return lanes.map((stack) => stack.map((u) => cloneUnit(u)));
  }

  function applyFaint(side, laneIdx, unit, boards) {
    if (!unit || unit.trigger !== "faint") return;
    const board = side === "you" ? boards.you : boards.enemy;
    const prefix = side === "you" ? "" : "enemy ";
    const aim = unit.faintAim || "adjacent";
    let ally = null;
    let allyLane = laneIdx;
    if (aim === "partner") {
      ally = board[laneIdx].find((o) => o !== unit && o.hp > 0) || null;
      if (!ally) {
        log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no partner.");
        return;
      }
    } else {
      const adj = [laneIdx - 1, laneIdx + 1].filter(
        (j) => j >= 0 && j < 3 && board[j].some((u) => u.hp > 0)
      );
      if (!adj.length) {
        log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no adjacent ally.");
        return;
      }
      allyLane = adj[0];
      ally = board[allyLane].find((u) => u.hp > 0);
      if (!ally) return;
    }
    const where = aim === "partner" ? "partner" : "Lane " + (allyLane + 1);
    if (unit.id === "crew") {
      ally.atk += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          unit.name +
          " Faint → +1 ATK " +
          where +
          " " +
          ally.name +
          " (" +
          ally.atk +
          ").",
        "win"
      );
      return;
    }
    const amt = unit.id === "medic" ? 2 : 1;
    ally.hp += amt;
    log(
      "Lane " +
        (laneIdx + 1) +
        ": " +
        prefix +
        unit.name +
        " Faint → +" +
        amt +
        " HP " +
        where +
        " " +
        ally.name +
        " (" +
        ally.hp +
        " HP).",
      "win"
    );
  }

  function applyStartBuff(lane, laneIdx, prefix) {
    lane.forEach((u) => {
      if (u.trigger !== "start" || u.hp <= 0) return;
      const partner = lane.find((o) => o !== u && o.hp > 0);
      const target = partner || u;
      const who = partner ? target.name : "self";
      if (u.id === "anchor") {
        target.hp += 2;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → +2 HP " +
            who +
            " (" +
            target.hp +
            " HP)."
        );
        return;
      }
      const amt = u.id === "blade" && partner ? 2 : 1;
      target.atk += amt;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          u.name +
          " Start → +" +
          amt +
          " ATK " +
          who +
          " (" +
          target.atk +
          ")."
      );
    });
  }

  function front(stack) {
    return stack.find((u) => u.hp > 0) || null;
  }

  function pickSplashTarget(fromLane, enemy) {
    const cands = [];
    const adj = [fromLane - 1, fromLane + 1];
    for (let k = 0; k < adj.length; k++) {
      const j = adj[k];
      if (j < 0 || j >= 3) continue;
      const f = front(enemy[j]);
      if (f) cands.push({ lane: j, unit: f });
    }
    if (!cands.length) return null;
    cands.sort(function (a, b) {
      return b.unit.hp - a.unit.hp || a.lane - b.lane;
    });
    return cands[0];
  }

  function isCopyOffer(offer, lanes) {
    return lanes.some(function (lane) {
      return lane.some(function (u) {
        return u.id === offer.id;
      });
    });
  }

  function applyHurt(hurter, hurterSide, laneIdx, attacker, boards, faintUnit) {
    if (!hurter || hurter.trigger !== "hurt" || hurter.hp <= 0) return;
    attacker.hp -= 1;
    log(
      "Lane " +
        (laneIdx + 1) +
        ": " +
        hurter.name +
        " Hurt → 1 to " +
        attacker.name +
        " (" +
        Math.max(0, attacker.hp) +
        " HP)."
    );
    if (hurter.id === "skirmisher") {
      const board = hurterSide === "you" ? boards.you : boards.enemy;
      const partner = board[laneIdx].find(function (o) {
        return o !== hurter && o.hp > 0;
      });
      const healed = partner || hurter;
      healed.hp += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          hurter.name +
          " Hurt → +1 HP " +
          (partner ? healed.name : "self") +
          " (" +
          healed.hp +
          " HP).",
        "win"
      );
    }
    if (hurter.id !== "wall") return;
    const enemyBoard = hurterSide === "you" ? boards.enemy : boards.you;
    const splashSide = hurterSide === "you" ? "enemy" : "you";
    const prefix = hurterSide === "you" ? "" : "enemy ";
    const hit = pickSplashTarget(laneIdx, enemyBoard);
    if (!hit) {
      log("Lane " + (laneIdx + 1) + ": " + prefix + hurter.name + " Hurt — no adjacent enemy.");
      return;
    }
    hit.unit.hp -= 1;
    log(
      "Lane " +
        (laneIdx + 1) +
        ": " +
        prefix +
        hurter.name +
        " Hurt splash → Lane " +
        (hit.lane + 1) +
        " " +
        hit.unit.name +
        " (" +
        Math.max(0, hit.unit.hp) +
        " HP)."
    );
    if (hit.unit.hp <= 0) faintUnit(splashSide, hit.unit, hit.lane);
  }

  function resolveCombat(youSnap, enemySnap) {
    const boards = {
      you: youSnap.map((s) => s.map((u) => ({ ...u }))),
      enemy: enemySnap.map((s) => s.map((u) => ({ ...u }))),
    };

    for (let i = 0; i < 3; i++) {
      applyStartBuff(boards.you[i], i, "");
      applyStartBuff(boards.enemy[i], i, "enemy ");
    }

    let guard = 80;
    const fainted = [];
    function faintUnit(side, unit, laneIdx) {
      if (unit.hp > 0 || fainted.indexOf(unit) >= 0) return;
      fainted.push(unit);
      const prefix = side === "you" ? "" : "enemy ";
      log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " faints.");
      applyFaint(side, laneIdx, unit, boards);
      const nxt = front(side === "you" ? boards.you[laneIdx] : boards.enemy[laneIdx]);
      if (nxt) log("Lane " + (laneIdx + 1) + ": " + prefix + nxt.name + " steps up.");
    }
    while (guard-- > 0) {
      let any = false;
      for (let i = 0; i < 3; i++) {
        const a = front(boards.you[i]);
        const b = front(boards.enemy[i]);
        if (!a || !b) continue;
        any = true;

        b.hp -= a.atk;
        log(
          "Lane " +
            (i + 1) +
            ": " +
            a.name +
            " hits " +
            b.name +
            " for " +
            a.atk +
            " → " +
            Math.max(0, b.hp) +
            " HP."
        );
        if (b.hp > 0) applyHurt(b, "enemy", i, a, boards, faintUnit);
        faintUnit("enemy", b, i);
        faintUnit("you", a, i);
        if (a.hp <= 0) continue;
        if (b.hp <= 0) continue;

        a.hp -= b.atk;
        log(
          "Lane " +
            (i + 1) +
            ": " +
            b.name +
            " hits " +
            a.name +
            " for " +
            b.atk +
            " → " +
            Math.max(0, a.hp) +
            " HP."
        );
        if (a.hp > 0) applyHurt(a, "you", i, b, boards, faintUnit);
        faintUnit("you", a, i);
        faintUnit("enemy", b, i);
      }
      if (!any) break;
    }

    let youLanes = 0;
    let enemyLanes = 0;
    for (let i = 0; i < 3; i++) {
      const aAlive = boards.you[i].some((u) => u.hp > 0);
      const bAlive = boards.enemy[i].some((u) => u.hp > 0);
      const aEmpty = !boards.you[i].length;
      const bEmpty = !boards.enemy[i].length;
      if (aEmpty && bEmpty) {
        log("Lane " + (i + 1) + ": empty draw.");
      } else if (aAlive && !bAlive) {
        youLanes += 1;
        log("Lane " + (i + 1) + ": YOU win.", "win");
      } else if (bAlive && !aAlive) {
        enemyLanes += 1;
        log("Lane " + (i + 1) + ": AI wins.", "loss");
      } else if (!aAlive && !bAlive) {
        log("Lane " + (i + 1) + ": mutual wipe — draw.");
      } else {
        const ah = boards.you[i].reduce((s, u) => s + Math.max(0, u.hp), 0);
        const bh = boards.enemy[i].reduce((s, u) => s + Math.max(0, u.hp), 0);
        if (ah > bh) {
          youLanes += 1;
          log("Lane " + (i + 1) + ": YOU win on HP (" + ah + ">" + bh + ").", "win");
        } else if (bh > ah) {
          enemyLanes += 1;
          log("Lane " + (i + 1) + ": AI wins on HP (" + bh + ">" + ah + ").", "loss");
        } else {
          log("Lane " + (i + 1) + ": draw.");
        }
      }
    }
    return { youLanes, enemyLanes };
  }

  function unitListHtml(stack) {
    if (!stack.length) return "<em>empty</em>";
    return (
      "<ul>" +
      stack
        .map(
          (u, idx) =>
            "<li>" +
            (idx === 0 ? "Front" : "Back") +
            ": " +
            u.name +
            " " +
            u.atk +
            "/" +
            u.hp +
            "</li>"
        )
        .join("") +
      "</ul>"
    );
  }

  function showSpendMap() {
    el.spendMap.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const youN = state.lastYou[i].length;
      const enN = state.lastEnemy[i].length;
      const box = document.createElement("div");
      box.className = "spend-lane";
      box.innerHTML =
        '<div class="title">Lane ' +
        (i + 1) +
        " — you " +
        youN +
        " · them " +
        enN +
        " (≈" +
        enN * BUY +
        "g)</div>" +
        '<div class="spend-cols"><div><div class="side">You</div>' +
        unitListHtml(state.lastYou[i]) +
        '</div><div><div class="side">Opponent</div>' +
        unitListHtml(state.lastEnemy[i]) +
        "</div></div>";
      el.spendMap.appendChild(box);
    }
    el.spendWrap.classList.remove("hidden");
  }

  function endTurnFight() {
    if (state.phase !== "shop") return;
    if (countUnits(state.lanes) < 1) {
      log("Place at least 1 unit before End Turn.");
      render();
      return;
    }
    state.phase = "fight";
    state.enemy = buildEnemy();
    state.lastYou = snapshotLanes(state.lanes);
    state.lastEnemy = snapshotLanes(state.enemy);
    state.log = [];
    log("— Round " + state.round + " fight —");
    if (state.round === 1) {
      log("AI R1 policy: 3 buys, 1-1-1 cover. Occupied " + state.enemy.filter((l) => l.length).length + "/3 lanes.");
    } else {
      log("AI cover-first. Occupied " + state.enemy.filter((l) => l.length).length + "/3 lanes.");
    }
    el.shop.classList.add("hidden");
    render();

    const { youLanes, enemyLanes } = resolveCombat(state.lastYou, state.lastEnemy);
    const roundWin = youLanes >= 2;
    if (roundWin) {
      state.wins += 1;
      log(
        "Round " + state.round + ": you take it " + youLanes + "–" + enemyLanes + ".",
        "win"
      );
    } else {
      state.losses += 1;
      log(
        "Round " +
          state.round +
          ": AI takes it " +
          enemyLanes +
          "–" +
          youLanes +
          ".",
        "loss"
      );
    }
    state.pendingRound = { roundWin };
    state.phase = "reveal";
    showSpendMap();
    render();
  }

  function afterReveal() {
    el.spendWrap.classList.add("hidden");
    if (state.wins >= 3) {
      showEnd(true, "You won the run " + state.wins + "–" + state.losses + ".");
      return;
    }
    if (state.losses >= 3) {
      showEnd(false, "Run over " + state.wins + "–" + state.losses + ".");
      return;
    }
    // Persist + full heal; refresh shop gold
    state.round += 1;
    state.gold = START_GOLD + Math.min(3, state.round - 1);
    state.lanes = state.lanes.map((stack) => stack.map((u) => healUnit(u)));
    state.offers = rollOffers(false);
    freezeIdx = null;
    selectedOffer = null;
    state.enemy = emptyLanes();
    state.phase = "shop";
    el.shop.classList.remove("hidden");
    log("Shop — Round " + state.round + ". Gold " + state.gold + ". Units persist (healed).");
    render();
  }

  function showEnd(won, detail) {
    state.phase = "end";
    el.shop.classList.add("hidden");
    el.spendWrap.classList.add("hidden");
    el.end.classList.remove("hidden");
    el.endTitle.textContent = won ? "Run cleared!" : "Run failed";
    el.endDetail.textContent = detail;
    render();
  }

  el.btnRoll.addEventListener("click", doRoll);
  el.btnEnd.addEventListener("click", endTurnFight);
  el.btnNext.addEventListener("click", afterReveal);
  el.btnRematch.addEventListener("click", startRun);

  startRun();
})();
