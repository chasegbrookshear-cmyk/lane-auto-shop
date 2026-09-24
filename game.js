(() => {
  const UNITS = [
    { id: "lug", name: "Lug", cost: 1, atk: 1, hp: 1, trigger: "start", text: "1g · Start: +1 HP partner (self if solo)" },
    { id: "cone", name: "Cone", cost: 1, atk: 0, hp: 3, text: "1g · Blocks. No ability." },
    { id: "clip", name: "Clip", cost: 1, atk: 1, hp: 2, trigger: "faint", faintAim: "killer", text: "1g · Faint: 1 to whoever killed you" },
    { id: "rag", name: "Rag", cost: 1, atk: 1, hp: 1, trigger: "hurt", text: "1g · Hurt: +1 ATK this fight" },
    { id: "spark", name: "Spark", cost: 1, atk: 1, hp: 1, trigger: "faint", faintAim: "adjacent", text: "1g · Faint: adjacent bay front +1 ATK" },
    { id: "drip", name: "Drip", cost: 1, atk: 1, hp: 2, trigger: "hurt", text: "1g · Hurt: +1 HP partner (self if solo)" },
    { id: "wedge", name: "Wedge", cost: 1, atk: 1, hp: 2, trigger: "start", text: "1g · Start: jumps to front" },
    { id: "cowl", name: "Cowl", cost: 2, atk: 1, hp: 4, shield: true, text: "2g · Shield (first hit does 0)" },
    { id: "bit", name: "Bit", cost: 2, atk: 2, hp: 2, trigger: "hurt", text: "2g · Hurt: 1 to attacker" },
    { id: "hose", name: "Hose", cost: 2, atk: 1, hp: 3, trigger: "start", text: "2g · Start: partner gains Shield (self if solo)" },
    { id: "clamp", name: "Clamp", cost: 2, atk: 2, hp: 3, trigger: "start", text: "2g · Start: jumps to front, partner +1 HP" },
    { id: "snap", name: "Snap", cost: 2, atk: 2, hp: 1, trigger: "faint", faintAim: "enemy", text: "2g · Faint: 2 to the enemy front in this bay" },
    { id: "blink", name: "Blink", cost: 2, atk: 2, hp: 2, trigger: "start", text: "2g · Start: +1/+1 if you are solo in this bay" },
    { id: "ragman", name: "Ragman", cost: 2, atk: 1, hp: 3, trigger: "hurt", text: "2g · Hurt: this bay partner +1 HP (self if solo)" },
    { id: "guard", name: "Bumper", cost: 3, atk: 2, hp: 5, trigger: "start", text: "3g · Start: +1 ATK partner (self if solo)" },
    { id: "skirmisher", name: "Rivet", cost: 3, atk: 2, hp: 4, trigger: "hurt", text: "3g · Hurt: 1 to attacker, +1 HP partner (self if solo)" },
    { id: "anchor", name: "Jack", cost: 3, atk: 1, hp: 6, trigger: "start", text: "3g · Start: +2 HP partner (self if solo)" },
    { id: "scout", name: "Spotter", cost: 3, atk: 2, hp: 3, trigger: "faint", faintAim: "adjacent", text: "3g · Faint: +1 HP adjacent lane" },
    { id: "bruiser", name: "Sledge", cost: 3, atk: 4, hp: 2, trigger: "hurt", text: "3g · Hurt: 1 to attacker" },
    { id: "medic", name: "Patch", cost: 3, atk: 1, hp: 4, trigger: "faint", faintAim: "partner", text: "3g · Faint: +2 HP partner in this lane" },
    { id: "blade", name: "Torque", cost: 3, atk: 3, hp: 2, trigger: "start", text: "3g · Start: +2 ATK partner (+1 ATK if solo)" },
    { id: "wall", name: "Fender", cost: 3, atk: 2, hp: 6, trigger: "hurt", text: "3g · Hurt: 1 to attacker and 1 to an adjacent enemy front" },
    { id: "crew", name: "Pit", cost: 3, atk: 2, hp: 3, trigger: "faint", faintAim: "partner", text: "3g · Faint: +1 ATK partner in this lane" },
    { id: "boom", name: "Boom", cost: 4, atk: 4, hp: 4, double: true, text: "4g · Double (hits twice)" },
    { id: "apron", name: "Apron", cost: 4, atk: 2, hp: 5, trigger: "start", text: "4g · Start: Shield on both units in this bay" },
    { id: "rail", name: "Rail", cost: 4, atk: 3, hp: 6, overkill: true, text: "4g · Overkill leftover to an adjacent enemy front" },
    { id: "torch", name: "Torch", cost: 4, atk: 3, hp: 3, venom: true, text: "4g · Venom — damage faints them" },
    { id: "dolly", name: "Dolly", cost: 4, atk: 2, hp: 4, trigger: "start", text: "4g · Start: if room, spawn a 1/1 Lug behind you" },
  ];

  const BUY = 3;
  const ROLL = 1;
  const SERVICE = 3;
  const START_GOLD = 6;
  const CAP = 2;
  const VET_ATK = 1;
  const VET_HP = 2;

  const el = {
    gold: document.getElementById("gold"),
    goldMath: document.getElementById("gold-math"),
    bankWarn: document.getElementById("bank-warn"),
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
    tip: document.getElementById("tip"),
    btnTipDismiss: document.getElementById("btn-tip-dismiss"),
  };

  let state = null;
  let selectedOffer = null;
  let selectedUnit = null;
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
        cost: u.cost,
        shield: !!u.shield,
        venom: !!u.venom,
        double: !!u.double,
        overkill: !!u.overkill,
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
      cost: t.cost,
      shield: !!t.shield,
      venom: !!t.venom,
      double: !!t.double,
      overkill: !!t.overkill,
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

  function unitCost(u) {
    return (u && u.cost) || 3;
  }
  function randomUnit(maxGold) {
    const cap = maxGold == null ? Infinity : maxGold;
    const pool = UNITS.filter((u) => unitCost(u) <= cap);
    const list = pool.length ? pool : UNITS;
    const costs = [...new Set(list.map(unitCost))];
    const cost = costs[Math.floor(Math.random() * costs.length)];
    const tier = list.filter((u) => unitCost(u) === cost);
    return cloneUnit(tier[Math.floor(Math.random() * tier.length)]);
  }

  function emptyLanes() {
    return [[], [], []];
  }

  function countUnits(lanes) {
    return lanes.reduce((n, stack) => n + stack.length, 0);
  }

  function shopCap() {
    const r = state && state.round ? state.round : 1;
    if (r <= 2) return 2;
    if (r <= 4) return 3;
    return 4;
  }
  function roundGold() {
    const r = state && state.round ? state.round : 1;
    return Math.min(12, START_GOLD + Math.max(0, r - 1));
  }
  function bankedGold(unspent) {
    return Math.max(0, Math.min(6, unspent || 0));
  }
  function interestOn(unspent) {
    const kept = bankedGold(unspent);
    if (kept >= 6) return 2;
    if (kept >= 3) return 1;
    return 0;
  }
  function nextShopGold(round, unspent) {
    const pay = Math.min(12, START_GOLD + Math.max(0, round - 1));
    return pay + bankedGold(unspent) + interestOn(unspent);
  }
  function rollOffers(keepFrozen) {
    const next = [];
    for (let i = 0; i < 4; i++) {
      if (keepFrozen && freezeIdx === i && state.offers[i]) next.push(state.offers[i]);
      else next.push(randomUnit(shopCap()));
    }
    return next;
  }

  function startRun() {
    state = {
      gold: START_GOLD,
      goldParts: { pay: START_GOLD, carry: 0, bonus: 0, lost: 0 },
      aiUnspent: 0,
      services: 0,
      round: 1,
      wins: 0,
      losses: 0,
      phase: "shop",
      offers: rollOffers(false),
      lanes: emptyLanes(),
      enemy: emptyLanes(),
      lastEnemy: emptyLanes(),
      lastYou: emptyLanes(),
      enemyPersist: emptyLanes(),
      aiLostLanes: [],
      aiNotes: [],
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


  // Cut Thu #1: Gold HUD breakdown + over-bank warning

  // Theme: keyword pill chips; drop duplicate "Ng · " prefix (cost shows in the name line)
  const KW = /\b(Shield|Venom|Double|Overkill|Start|Hurt|Faint)\b/g;
  function chipText(text) {
    const t = String(text || "").replace(/^\d+g · /, "");
    return t.replace(KW, (m) => '<span class="chip chip-' + m.toLowerCase() + '">' + m + "</span>");
  }

  function renderGoldMath() {
    if (!el.goldMath) return;
    const g = state.goldParts || { pay: state.gold, carry: 0, bonus: 0, lost: 0 };
    let txt = "This shop: " + g.pay + " pay + " + g.carry + " carry + " + g.bonus + " bank bonus";
    if (g.lost) txt += " · " + g.lost + "g lost over the bank";
    el.goldMath.textContent = txt;
    if (!el.bankWarn) return;
    const shop = state.phase === "shop";
    const over = Math.max(0, state.gold - 6);
    if (shop && over > 0) {
      el.bankWarn.textContent = "End Turn now: " + over + "g will be lost (bank holds 6). Carry 6 +2 bonus.";
      el.bankWarn.className = "bank-warn warn";
    } else if (shop && state.gold > 0) {
      el.bankWarn.textContent = "End Turn now: carry " + state.gold + "g" + (interestOn(state.gold) ? " +" + interestOn(state.gold) + " bonus" : "") + " to next shop.";
      el.bankWarn.className = "bank-warn";
    } else {
      el.bankWarn.textContent = "";
      el.bankWarn.className = "bank-warn hidden";
    }
  }

  function render() {
    el.gold.textContent = state.gold + "g";
    renderGoldMath();
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
          unitCost(u) +
          "g" +
          (isCopyOffer(u, state.lanes) ? " · COPY" : "") +
          "</span><span class=\"meta\">" +
          u.atk +
          "/" +
          u.hp +
          " · " +
          chipText(u.text) +
          (freezeIdx === i ? " · FROZEN" : "") +
          "</span>";
        btn.addEventListener("click", () => onOfferClick(i));
        el.offers.appendChild(btn);
      });
    }

    const placed = countUnits(state.lanes);
    el.btnRoll.disabled = state.phase !== "shop" || state.gold < ROLL;
    const holes = state.lanes.filter((l) => !l.length).length;
    el.btnEnd.disabled = state.phase !== "shop" || placed < 1 || (state.round === 1 && holes > 0);
    el.btnEnd.title = state.round === 1 && holes > 0 ? "Cover all 3 lanes before the first fight" : placed < 1 ? "Place at least 1 unit before fighting" : "";

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
      ((selectedOffer !== null && stack.length < CAP) ||
        (selectedUnit && selectedUnit.lane !== i));
    div.className = "lane" + (mine ? " mine" : " theirs") + (canDrop ? " drop" : "");
    div.innerHTML =
      '<div class="tag">' + (mine ? "Bay " : "Lane ") +
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
          chipText(unit.text) +
          "</span>" +
          (mine && state.phase === "shop"
            ? '<span class="unit-acts">' +
              '<button type="button" class="act" data-sell>Sell refund ' +
              unitCost(unit) +
              "g</button>" +
              '<button type="button" class="act" data-svc' +
              (state.gold < SERVICE ? " disabled" : "") +
              ">Service " +
              SERVICE +
              "g</button></span>"
            : "");
        if (mine && state.phase === "shop") {
          u.style.cursor = "pointer";
          if (selectedUnit && selectedUnit.lane === i && selectedUnit.slot === slot) {
            u.className += " selected";
          }
          u.addEventListener("click", (e) => {
            e.stopPropagation();
            onUnitClick(i, slot);
          });
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
    selectedUnit = null;
    if (selectedOffer === i) {
      freezeIdx = freezeIdx === i ? null : i;
      render();
      return;
    }
    selectedOffer = i;
    render();
  }

  function replaceOffer(lane, slot) {
    const offer = state.offers[selectedOffer];
    const unit = state.lanes[lane] && state.lanes[lane][slot];
    if (!offer || !unit) return;
    const refund = unitCost(unit);
    const cost = unitCost(offer);
    if (state.gold + refund < cost) {
      log("Not enough gold, even after the refund.");
      render();
      return;
    }
    state.gold = state.gold + refund - cost;
    state.lanes[lane].splice(slot, 1);
    state.lanes[lane].push(cloneUnit(offer));
    state.offers[selectedOffer] = null;
    if (freezeIdx === selectedOffer) freezeIdx = null;
    selectedOffer = null;
    log("Replaced " + unit.name + " with " + offer.name + " (+" + refund + "g, -" + cost + "g).");
    render();
  }

  function onUnitClick(lane, slot) {
    if (state.phase !== "shop") return;
    if (selectedOffer !== null) {
      if (state.lanes[lane].length >= CAP) replaceOffer(lane, slot);
      else onLaneClick(lane);
      return;
    }
    if (selectedUnit && (selectedUnit.lane !== lane || selectedUnit.slot !== slot)) {
      moveUnit(lane, slot);
      return;
    }
    if (selectedUnit && selectedUnit.lane === lane && selectedUnit.slot === slot) {
      selectedUnit = null;
    } else {
      selectedUnit = { lane: lane, slot: slot };
    }
    render();
  }

  function moveUnit(toLane, toSlot) {
    if (!selectedUnit) return;
    const from = selectedUnit;
    const a = state.lanes[from.lane][from.slot];
    if (!a) return;
    if (toSlot === undefined) {
      if (state.lanes[toLane].length >= CAP) {
        log("Lane is full — tap a unit there to swap.");
        render();
        return;
      }
      state.lanes[from.lane].splice(from.slot, 1);
      state.lanes[toLane].push(a);
      selectedUnit = null;
      log("Moved " + a.name + " to Lane " + (toLane + 1) + ".");
      render();
      return;
    }
    const dest = state.lanes[toLane][toSlot];
    if (!dest) return;
    state.lanes[from.lane][from.slot] = dest;
    state.lanes[toLane][toSlot] = a;
    selectedUnit = null;
    log(
      from.lane === toLane
        ? "Lane " + (toLane + 1) + ": swapped front/back."
        : "Swapped " + a.name + " (Lane " + (from.lane + 1) + ") with " + dest.name + " (Lane " + (toLane + 1) + ").",
    );
    render();
  }

  function onLaneClick(i) {
    if (state.phase !== "shop") return;
    if (selectedUnit) {
      if (state.lanes[i].length >= CAP) moveUnit(i, state.lanes[i].length - 1);
      else moveUnit(i);
      return;
    }
    if (selectedOffer === null) return;
    if (state.lanes[i].length >= CAP) {
      log("Lane " + (i + 1) + " is full (max " + CAP + ").");
      render();
      return;
    }
    const offer = state.offers[selectedOffer];
    const cost = (offer && offer.cost) || BUY;
    if (state.gold < cost) {
      log("Not enough gold.");
      render();
      return;
    }
    state.gold -= cost;
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
    const sold = stack[slot];
    const name = sold.name;
    const refund = sold.cost || BUY;
    stack.splice(slot, 1);
    state.gold += refund;
    selectedOffer = null;
    log("Sold " + name + " (+" + refund + "g refund).");
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
    if ((state.services || 0) >= 1) {
      log("Service is once per shop.");
      render();
      return;
    }
    if (state.gold < SERVICE) {
      log("Not enough gold for Service.");
      render();
      return;
    }
    state.gold -= SERVICE;
    state.services = (state.services || 0) + 1;
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

  function unitPower(u) {
    return (u.atk || 0) + (u.hp || 0);
  }

  function lanePower(stack) {
    return stack.reduce((n, u) => n + unitPower(u), 0);
  }

  function weakestFrontLane(enemy) {
    let best = -1;
    let score = Infinity;
    for (let i = 0; i < 3; i++) {
      if (!enemy[i].length) continue;
      const p = unitPower(enemy[i][0]);
      if (p < score) {
        score = p;
        best = i;
      }
    }
    return best;
  }

  function pickStackLane(enemy) {
    const lost = (state.aiLostLanes || []).filter((i) => enemy[i].length < CAP);
    if (lost.length) return lost[0];
    const open = [0, 1, 2].filter((i) => enemy[i].length >= 1 && enemy[i].length < CAP);
    if (!open.length) return -1;
    open.sort((a, b) => lanePower(enemy[a]) - lanePower(enemy[b]));
    return open[0];
  }

  function aiFuseLane(enemy, lane, notes) {
    const stack = enemy[lane];
    if (!canFuseLane(stack)) return false;
    const keep = Object.assign({}, stack[0]);
    const t = template(keep.id);
    keep.veteran = true;
    keep.atk += VET_ATK;
    keep.maxHp += VET_HP;
    keep.hp = keep.maxHp;
    keep.name = "Veteran " + t.name;
    enemy[lane] = [keep];
    notes.push("AI Fuse → " + keep.name + " in Lane " + (lane + 1));
    return true;
  }

  function aiServiceFront(enemy, lane, notes) {
    const u = enemy[lane][0];
    if (!u) return false;
    u.atk += 1;
    u.maxHp += 1;
    u.hp += 1;
    notes.push("AI Service (+1/+1) on Lane " + (lane + 1) + " " + u.name + " → " + u.atk + "/" + u.hp);
    return true;
  }

  function buildEnemy() {
    const notes = [];
    // R1: 6g, 1–2g only, cover 3 lanes. No Service/Fuse/rolls/stat hacks.
    if (state.round === 1) {
      const enemy = emptyLanes();
      let spent = 0;
      for (let i = 0; i < 3; i++) {
        const u = randomUnit(shopCap());
        enemy[i].push(u);
        spent += unitCost(u);
      }
      state.aiUnspent = Math.max(0, 6 - spent);
      notes.push("AI R1: 3 buys, 1-1-1 cover (6g, costs 1–2). Bank " + state.aiUnspent + ".");
      state.aiNotes = notes;
      return enemy;
    }

    // R2+: persist prior roster (healed), same gold curve as player.
    const enemy = (state.enemyPersist || emptyLanes()).map((stack) =>
      stack.map((u) => healUnit(u))
    );
    let gold = nextShopGold(state.round, state.aiUnspent || 0);
    let serviced = false;
    let rolled = false;
    let guard = 12;

    while (guard-- > 0) {
      const empty = [0, 1, 2].filter((i) => enemy[i].length === 0);
      const covered = empty.length === 0;

      // 1) Cover first
      if (empty.length && gold >= 1) {
        const lane = empty[0];
        const u = randomUnit(Math.min(gold - (empty.length - 1), shopCap()));
        enemy[lane].push(u);
        gold -= unitCost(u);
        notes.push("AI buy → cover Lane " + (lane + 1) + " (" + unitCost(u) + "g).");
        continue;
      }

      // 2) Service once if covered
      if (covered && !serviced && gold >= SERVICE) {
        const lane = weakestFrontLane(enemy);
        if (lane >= 0 && aiServiceFront(enemy, lane, notes)) {
          gold -= SERVICE;
          serviced = true;
          continue;
        }
      }

      // 3) Stack into lost/weak lane
      if (covered && gold >= 1) {
        const lane = pickStackLane(enemy);
        if (lane >= 0) {
          const u = randomUnit(Math.min(gold, shopCap()));
          if (unitCost(u) <= gold) {
            enemy[lane].push(u);
            gold -= unitCost(u);
            notes.push("AI buy → stack Lane " + (lane + 1) + " (" + unitCost(u) + "g).");
            continue;
          }
        }
      }

      // 4) Fuse without abandoning coverage (0g); may free a slot then cover/stack next loop
      if (covered) {
        let fused = false;
        for (let i = 0; i < 3; i++) {
          if (!canFuseLane(enemy[i])) continue;
          // Fuse only if board stays coverable: after fuse this lane has 1 unit, others still covered
          const othersOk = [0, 1, 2].every((j) => j === i || enemy[j].length > 0);
          if (!othersOk) continue;
          if (aiFuseLane(enemy, i, notes)) {
            fused = true;
            break;
          }
        }
        if (fused) continue;
      }

      // 5) Roll at most once — only if covered and spare gold beyond a buy
      if (covered && !rolled && gold > BUY && gold >= ROLL) {
        gold -= ROLL;
        rolled = true;
        notes.push("AI roll (1g) — shop refresh.");
        continue;
      }

      break;
    }

    // Safety: never leave an empty lane if leftover gold could have bought
    for (let i = 0; i < 3; i++) {
      if (enemy[i].length === 0 && gold >= 1) {
        const u = randomUnit(Math.min(gold, shopCap()));
        enemy[i].push(u);
        gold -= unitCost(u);
        notes.push("AI safety cover Lane " + (i + 1) + ".");
      }
    }

    state.aiUnspent = Math.max(0, gold);
    state.aiNotes = notes;
    return enemy;
  }

  function snapshotLanes(lanes) {
    return lanes.map((stack) => stack.map((u) => cloneUnit(u)));
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

  function partnerOf(lane, unit) {
    return lane.find(function (o) {
      return o !== unit && o.hp > 0;
    }) || null;
  }

  function moveToFront(lane, unit) {
    const idx = lane.indexOf(unit);
    if (idx <= 0) return false;
    lane.splice(idx, 1);
    lane.unshift(unit);
    return true;
  }

  function adjacentFront(board, laneIdx) {
    const order = [laneIdx - 1, laneIdx + 1, laneIdx - 2, laneIdx + 2];
    for (let k = 0; k < order.length; k++) {
      const j = order[k];
      if (j < 0 || j >= 3) continue;
      const f = front(board[j]);
      if (f) return { lane: j, unit: f };
    }
    return null;
  }

  function applyFaint(side, laneIdx, unit, boards, killer) {
    if (!unit || unit.trigger !== "faint") return;
    const board = side === "you" ? boards.you : boards.enemy;
    const enemyBoard = side === "you" ? boards.enemy : boards.you;
    const prefix = side === "you" ? "" : "enemy ";
    const aim = unit.faintAim || "partner";

    if (aim === "killer") {
      if (!killer || killer.hp <= 0) {
        log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no killer.");
        return;
      }
      killer.hp -= 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          unit.name +
          " Faint → 1 to killer " +
          killer.name +
          " (" +
          Math.max(0, killer.hp) +
          " HP)."
      );
      return;
    }

    if (aim === "enemy") {
      const foe = front(enemyBoard[laneIdx]);
      if (!foe) {
        log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no enemy front.");
        return;
      }
      const dmg = unit.id === "snap" ? 2 : 1;
      foe.hp -= dmg;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          unit.name +
          " Faint → " +
          dmg +
          " to enemy " +
          foe.name +
          " (" +
          Math.max(0, foe.hp) +
          " HP)."
      );
      return;
    }

    if (aim === "adjacent") {
      const hit = adjacentFront(board, laneIdx);
      if (!hit) {
        log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no adjacent ally.");
        return;
      }
      if (unit.id === "spark") {
        hit.unit.atk += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            unit.name +
            " Faint → +1 ATK Lane " +
            (hit.lane + 1) +
            " " +
            hit.unit.name +
            " (" +
            hit.unit.atk +
            ")."
        );
      } else {
        hit.unit.hp += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            unit.name +
            " Faint → +1 HP Lane " +
            (hit.lane + 1) +
            " " +
            hit.unit.name +
            " (" +
            hit.unit.hp +
            " HP)."
        );
      }
      return;
    }

    // partner (medic, crew, default)
    const ally = partnerOf(board[laneIdx], unit);
    if (!ally) {
      log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " Faint — no partner.");
      return;
    }
    if (unit.id === "crew") {
      ally.atk += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          unit.name +
          " Faint → +1 ATK partner " +
          ally.name +
          " (" +
          ally.atk +
          ")."
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
        " HP partner " +
        ally.name +
        " (" +
        ally.hp +
        " HP)."
    );
  }

  function applyStartBuff(lane, laneIdx, prefix) {
    // Snapshot so Dolly spawn / reorder mid-pass stays stable.
    const starters = lane.filter(function (u) {
      return u.trigger === "start" && u.hp > 0;
    });
    starters.forEach(function (u) {
      if (lane.indexOf(u) < 0 || u.hp <= 0) return;
      const partner = partnerOf(lane, u);
      const target = partner || u;
      const who = partner ? target.name : "self";

      if (u.id === "lug") {
        target.hp += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → +1 HP " +
            who +
            " (" +
            target.hp +
            " HP)."
        );
        return;
      }
      if (u.id === "wedge") {
        const moved = moveToFront(lane, u);
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → jumps to front" +
            (moved ? "." : " (already front).")
        );
        return;
      }
      if (u.id === "hose") {
        target.shield = true;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → Shield on " +
            who +
            "."
        );
        return;
      }
      if (u.id === "clamp") {
        moveToFront(lane, u);
        target.hp += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → front + +1 HP " +
            who +
            " (" +
            target.hp +
            " HP)."
        );
        return;
      }
      if (u.id === "blink") {
        if (partner) {
          log(
            "Lane " +
              (laneIdx + 1) +
              ": " +
              prefix +
              u.name +
              " Start — not solo, no buff."
          );
          return;
        }
        u.atk += 1;
        u.hp += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → +1/+1 solo (" +
            u.atk +
            "/" +
            u.hp +
            ")."
        );
        return;
      }
      if (u.id === "guard") {
        target.atk += 1;
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → +1 ATK " +
            who +
            " (" +
            target.atk +
            ")."
        );
        return;
      }
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
      if (u.id === "blade") {
        const amt = partner ? 2 : 1;
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
        return;
      }
      if (u.id === "apron") {
        lane.forEach(function (ally) {
          if (ally.hp > 0) ally.shield = true;
        });
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → Shield on both in bay."
        );
        return;
      }
      if (u.id === "dolly") {
        if (lane.length >= CAP) {
          log(
            "Lane " +
              (laneIdx + 1) +
              ": " +
              prefix +
              u.name +
              " Start — bay full, no Lug."
          );
          return;
        }
        const lug = cloneUnit({ id: "lug" });
        lug.atk = 1;
        lug.hp = 1;
        lug.maxHp = 1;
        lug.trigger = undefined;
        lug.text = "1/1 spawn";
        lane.push(lug);
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            u.name +
            " Start → spawn Lug 1/1 behind."
        );
        return;
      }
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          u.name +
          " Start — no handler."
      );
    });
  }

  function applyHurt(hurter, hurterSide, laneIdx, attacker, boards, faintUnit) {
    if (!hurter || hurter.trigger !== "hurt" || hurter.hp <= 0) return;
    const board = hurterSide === "you" ? boards.you : boards.enemy;
    const prefix = hurterSide === "you" ? "" : "enemy ";
    const partner = partnerOf(board[laneIdx], hurter);

    if (hurter.id === "rag") {
      hurter.atk += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          hurter.name +
          " Hurt → +1 ATK (" +
          hurter.atk +
          ")."
      );
      return;
    }
    if (hurter.id === "drip" || hurter.id === "ragman") {
      const healed = partner || hurter;
      healed.hp += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          hurter.name +
          " Hurt → +1 HP " +
          (partner ? healed.name : "self") +
          " (" +
          healed.hp +
          " HP)."
      );
      return;
    }

    // bit, skirmisher, bruiser, wall: ping attacker
    if (attacker && attacker.hp > 0) {
      attacker.hp -= 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          hurter.name +
          " Hurt → 1 to " +
          attacker.name +
          " (" +
          Math.max(0, attacker.hp) +
          " HP)."
      );
    }

    if (hurter.id === "skirmisher") {
      const healed = partner || hurter;
      healed.hp += 1;
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          prefix +
          hurter.name +
          " Hurt → +1 HP " +
          (partner ? healed.name : "self") +
          " (" +
          healed.hp +
          " HP)."
      );
    }

    if (hurter.id === "wall") {
      const enemyBoard = hurterSide === "you" ? boards.enemy : boards.you;
      const splashSide = hurterSide === "you" ? "enemy" : "you";
      const hit = pickSplashTarget(laneIdx, enemyBoard);
      if (!hit) {
        log(
          "Lane " +
            (laneIdx + 1) +
            ": " +
            prefix +
            hurter.name +
            " Hurt — no adjacent enemy."
        );
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
      if (hit.unit.hp <= 0) faintUnit(splashSide, hit.unit, hit.lane, hurter);
    }
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
    function faintUnit(side, unit, laneIdx, killer) {
      if (unit.hp > 0 || fainted.indexOf(unit) >= 0) return;
      fainted.push(unit);
      const prefix = side === "you" ? "" : "enemy ";
      log("Lane " + (laneIdx + 1) + ": " + prefix + unit.name + " faints.");
      applyFaint(side, laneIdx, unit, boards, killer);
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

        function swing(att, def, attSide, defSide) {
          let dmg = att.atk;
          if (def.shield) {
            def.shield = false;
            dmg = 0;
            log(
              "Lane " +
                (i + 1) +
                ": " +
                att.name +
                " hits " +
                def.name +
                " — Shield blocks (0 dmg)."
            );
          } else {
            def.hp -= dmg;
            log(
              "Lane " +
                (i + 1) +
                ": " +
                att.name +
                " hits " +
                def.name +
                " for " +
                dmg +
                " → " +
                Math.max(0, def.hp) +
                " HP."
            );
          }
          if (def.hp > 0 && dmg > 0) applyHurt(def, defSide, i, att, boards, faintUnit);
          faintUnit(defSide, def, i, att);
          faintUnit(attSide, att, i, def);
        }

        if (a.atk >= b.atk) {
          swing(a, b, "you", "enemy");
          if (a.hp > 0 && b.hp > 0) swing(b, a, "enemy", "you");
        } else {
          swing(b, a, "enemy", "you");
          if (a.hp > 0 && b.hp > 0) swing(a, b, "you", "enemy");
        }
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

  function laneSpend(stack) {
    return (stack || []).reduce((n, u) => n + unitCost(u), 0);
  }

  function showSpendMap() {
    el.spendMap.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const youN = state.lastYou[i].length;
      const enN = state.lastEnemy[i].length;
      const youG = laneSpend(state.lastYou[i]);
      const enG = laneSpend(state.lastEnemy[i]);
      const box = document.createElement("div");
      box.className = "spend-lane";
      box.innerHTML =
        '<div class="title">Lane ' +
        (i + 1) +
        " — you " +
        youN +
        " (" +
        youG +
        "g) · them " +
        enN +
        " (" +
        enG +
        "g)</div>" +
        '<div class="spend-cols"><div><div class="side">You</div>' +
        unitListHtml(state.lastYou[i]) +
        '</div><div><div class="side">Opponent</div>' +
        unitListHtml(state.lastEnemy[i]) +
        "</div></div>";
      el.spendMap.appendChild(box);
    }
    if (el.btnNext) el.btnNext.classList.remove("hidden");
    el.spendWrap.classList.remove("hidden");
  }

  function endTurnFight() {
    if (state.phase !== "shop") return;
    if (countUnits(state.lanes) < 1) {
      log("Place at least 1 unit before End Turn.");
      render();
      return;
    }
    if (state.round === 1 && state.lanes.some((l) => !l.length)) {
      log("Cover all 3 lanes before the first fight.");
      render();
      return;
    }
    state.phase = "fight";
    state.enemy = buildEnemy();
    state.lastYou = snapshotLanes(state.lanes);
    state.lastEnemy = snapshotLanes(state.enemy);
    state.log = [];
    log("— Round " + state.round + " fight —");
    (state.aiNotes || []).forEach((n) => log(n));
    log(
      "AI board: " +
        state.enemy.map((l, i) => "L" + (i + 1) + "=" + l.length).join(" ") +
        "."
    );
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
    // Lanes AI lost this round (for next shop stack targeting)
    state.aiLostLanes = [];
    // Infer from scores: if you took 2+, you won most lanes — scan via last boards after resolve
    // resolveCombat doesn't return per-lane; approximate from spend: mark lanes you occupied vs empty enemy post-fight log
    // Use roundWin + enemy empty preference: store from a lightweight recount
    state.aiLostLanes = reckonAiLostLanes(state.lastYou, state.lastEnemy);
    state.enemyRoster = snapshotLanes(state.enemy);
    state.pendingRound = { roundWin };
    // Cut #3: run over → Rematch primary immediately (no Next shop gate)
    if (state.wins >= 6) {
      showEnd(true, "You won the run " + state.wins + "–" + state.losses + ".");
      return;
    }
    if (state.losses >= 5) {
      showEnd(false, "Run over " + state.wins + "–" + state.losses + ".");
      return;
    }
    state.phase = "reveal";
    showSpendMap();
    render();
  }

  function reckonAiLostLanes(youSnap, enemySnap) {
    const lost = [];
    for (let i = 0; i < 3; i++) {
      const y = youSnap[i] && youSnap[i].length;
      const e = enemySnap[i] && enemySnap[i].length;
      // Prefer stacking where AI was thin or player contested
      if (y && (!e || lanePower(youSnap[i]) >= lanePower(enemySnap[i]))) lost.push(i);
    }
    return lost;
  }

  function afterReveal() {
    el.spendWrap.classList.add("hidden");
    if (state.wins >= 6) {
      showEnd(true, "You won the run " + state.wins + "–" + state.losses + ".");
      return;
    }
    if (state.losses >= 5) {
      showEnd(false, "Run over " + state.wins + "–" + state.losses + ".");
      return;
    }
    // Persist + full heal; refresh shop gold
    const unspent = state.gold;
    state.round += 1;
    const kept = bankedGold(unspent);
    const bonus = interestOn(unspent);
    const wasted = Math.max(0, unspent - kept);
    state.gold = roundGold() + kept + bonus;
    state.services = 0;
    state.bankNote = wasted ? (wasted + "g over the bank of 6 was lost.") : "";
    state.goldParts = { pay: roundGold(), carry: kept, bonus: bonus, lost: wasted };
    state.lanes = state.lanes.map((stack) => stack.map((u) => healUnit(u)));
    state.enemyPersist = (state.enemyRoster || state.enemy || emptyLanes()).map((stack) =>
      stack.map((u) => healUnit(u))
    );
    state.offers = rollOffers(true);
    if (freezeIdx === null || !state.offers[freezeIdx]) freezeIdx = null;
    selectedOffer = null;
    state.enemy = emptyLanes();
    state.phase = "shop";
    el.shop.classList.remove("hidden");
    log("Shop — Round " + state.round + ". " + roundGold() + " pay + " + bankedGold(unspent) + " bank" + (interestOn(unspent) ? " + " + interestOn(unspent) + " interest" : "") + " = " + state.gold + "g. " + (state.bankNote || "") + " Units persist (healed)." + (freezeIdx !== null ? " Frozen offer held." : ""));
    render();
  }

  function showEnd(won, detail) {
    state.phase = "end";
    el.shop.classList.add("hidden");
    el.spendWrap.classList.add("hidden");
    if (el.btnNext) el.btnNext.classList.add("hidden");
    el.end.classList.remove("hidden");
    el.endTitle.textContent = won ? "Run cleared!" : "Run failed";
    el.endDetail.textContent = detail;
    if (el.btnRematch) {
      el.btnRematch.textContent = "New run / Rematch";
      el.btnRematch.classList.add("primary", "rematch-cta");
    }
    render();
  }

  el.btnRoll.addEventListener("click", doRoll);
  el.btnEnd.addEventListener("click", endTurnFight);
  el.btnNext.addEventListener("click", afterReveal);
  el.btnRematch.addEventListener("click", startRun);
  if (el.btnTipDismiss && el.tip) {
    try {
      if (localStorage.getItem("las-tip-dismissed") === "1") el.tip.classList.add("hidden");
    } catch (_) {}
    el.btnTipDismiss.addEventListener("click", () => {
      el.tip.classList.add("hidden");
      try {
        localStorage.setItem("las-tip-dismissed", "1");
      } catch (_) {}
    });
  }

  startRun();
})();