(() => {
  const UNITS = [
    { id: "guard", name: "Guard", atk: 2, hp: 5, trigger: "start", text: "Start: +1 ATK same lane" },
    { id: "skirmisher", name: "Skirmisher", atk: 3, hp: 3, trigger: "hurt", text: "Hurt: deal 1 to enemy" },
    { id: "anchor", name: "Anchor", atk: 1, hp: 6, trigger: "start", text: "Start: +1 ATK same lane" },
    { id: "scout", name: "Scout", atk: 2, hp: 3, trigger: "faint", text: "Faint: +1 HP adjacent ally" },
    { id: "bruiser", name: "Bruiser", atk: 4, hp: 2, trigger: "hurt", text: "Hurt: deal 1 to enemy" },
    { id: "medic", name: "Medic", atk: 1, hp: 4, trigger: "faint", text: "Faint: +1 HP adjacent ally" },
    { id: "blade", name: "Blade", atk: 3, hp: 2, trigger: "start", text: "Start: +1 ATK same lane" },
    { id: "wall", name: "Wall", atk: 2, hp: 6, trigger: "hurt", text: "Hurt: deal 1 to enemy" },
  ];

  const BUY = 3;
  const ROLL = 1;
  const START_GOLD = 9;
  const CAP = 2;

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
    const t = u.id ? template(u.id) : u;
    return {
      id: t.id,
      name: t.name,
      atk: t.atk,
      hp: t.hp,
      maxHp: t.hp,
      trigger: t.trigger,
      text: t.text,
    };
  }

  function healUnit(u) {
    const t = template(u.id);
    return {
      id: t.id,
      name: t.name,
      atk: t.atk,
      hp: t.hp,
      maxHp: t.hp,
      trigger: t.trigger,
      text: t.text,
    };
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
          (freezeIdx === i ? " frozen" : "");
        btn.innerHTML =
          '<span class="name">' +
          u.name +
          " · " +
          BUY +
          "g</span><span class=\"meta\">" +
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
        u.className = "unit" + (slot === 0 ? " front" : "");
        u.innerHTML =
          '<span class="name">' +
          (slot === 0 ? "Front · " : "Back · ") +
          unit.name +
          (mine && state.phase === "shop" ? " · sell " + BUY + "g" : "") +
          '</span><span class="meta">' +
          unit.atk +
          "/" +
          unit.hp +
          " · " +
          unit.text +
          "</span>";
        if (mine && state.phase === "shop") {
          u.title = "Tap to sell for full refund (" + BUY + "g)";
          u.style.cursor = "pointer";
          u.addEventListener("click", (e) => {
            e.stopPropagation();
            sellUnit(i, slot);
          });
        }
        wrap.appendChild(u);
      });
    }
    div.appendChild(wrap);
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

  function doRoll() {
    if (state.phase !== "shop" || state.gold < ROLL) return;
    state.gold -= ROLL;
    state.offers = rollOffers(true);
    selectedOffer = null;
    log("Rolled shop.");
    render();
  }

  function buildEnemy() {
    // Mirror player spend roughly: fill with 2–3 buys worth, stack preference
    const enemy = emptyLanes();
    let budget = START_GOLD + Math.min(2, state.round - 1) * 3;
    const picks = [];
    while (budget >= BUY && picks.length < 6) {
      picks.push(randomUnit());
      budget -= BUY;
      if (state.round >= 2 && Math.random() < 0.35) {
        picks[picks.length - 1].hp += 1;
      }
      if (state.round >= 3 && Math.random() < 0.35) {
        picks[picks.length - 1].atk += 1;
      }
    }
    // Prefer stacking into 1–2 lanes so spend map is visible
    const focus = Math.random() < 0.55 ? [0, 0, 1, 1, 2] : [0, 1, 2, 0, 1, 2];
    let fi = 0;
    for (const u of picks) {
      let placed = false;
      for (let tries = 0; tries < 6 && !placed; tries++) {
        const lane = focus[fi % focus.length];
        fi++;
        if (enemy[lane].length < CAP) {
          enemy[lane].push(u);
          placed = true;
        }
      }
      if (!placed) {
        for (let lane = 0; lane < 3; lane++) {
          if (enemy[lane].length < CAP) {
            enemy[lane].push(u);
            break;
          }
        }
      }
    }
    return enemy;
  }

  function snapshotLanes(lanes) {
    return lanes.map((stack) => stack.map((u) => cloneUnit(u)));
  }

  function applyFaint(side, laneIdx, unit, boards) {
    if (!unit || unit.trigger !== "faint") return;
    const board = side === "you" ? boards.you : boards.enemy;
    const adj = [laneIdx - 1, laneIdx + 1].filter(
      (j) => j >= 0 && j < 3 && board[j].some((u) => u.hp > 0)
    );
    if (!adj.length) {
      log(
        "Lane " +
          (laneIdx + 1) +
          ": " +
          (side === "you" ? "" : "enemy ") +
          unit.name +
          " Faint — no adjacent ally."
      );
      return;
    }
    const j = adj[0];
    const ally = board[j].find((u) => u.hp > 0);
    if (!ally) return;
    ally.hp += 1;
    log(
      "Lane " +
        (laneIdx + 1) +
        ": " +
        (side === "you" ? "" : "enemy ") +
        unit.name +
        " Faint → +1 HP to Lane " +
        (j + 1) +
        " " +
        ally.name +
        " (" +
        ally.hp +
        " HP).",
      "win"
    );
  }

  function front(stack) {
    return stack.find((u) => u.hp > 0) || null;
  }

  function resolveCombat(youSnap, enemySnap) {
    const boards = {
      you: youSnap.map((s) => s.map((u) => ({ ...u }))),
      enemy: enemySnap.map((s) => s.map((u) => ({ ...u }))),
    };

    for (let i = 0; i < 3; i++) {
      boards.you[i].forEach((u) => {
        if (u.trigger === "start") {
          u.atk += 1;
          log("Lane " + (i + 1) + ": " + u.name + " Start → " + u.atk + " ATK.");
        }
      });
      boards.enemy[i].forEach((u) => {
        if (u.trigger === "start") {
          u.atk += 1;
          log(
            "Lane " +
              (i + 1) +
              ": enemy " +
              u.name +
              " Start → " +
              u.atk +
              " ATK."
          );
        }
      });
    }

    let guard = 80;
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
        if (b.hp > 0 && b.trigger === "hurt") {
          a.hp -= 1;
          log(
            "Lane " +
              (i + 1) +
              ": " +
              b.name +
              " Hurt → 1 to " +
              a.name +
              " (" +
              Math.max(0, a.hp) +
              " HP)."
          );
        }
        if (b.hp <= 0) {
          log("Lane " + (i + 1) + ": " + b.name + " faints.");
          applyFaint("enemy", i, b, boards);
          const next = front(boards.enemy[i]);
          if (next) log("Lane " + (i + 1) + ": enemy " + next.name + " steps up.");
        }
        if (a.hp <= 0) {
          log("Lane " + (i + 1) + ": " + a.name + " faints.");
          applyFaint("you", i, a, boards);
          const next = front(boards.you[i]);
          if (next) log("Lane " + (i + 1) + ": " + next.name + " steps up.");
          continue;
        }
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
        if (a.hp > 0 && a.trigger === "hurt") {
          b.hp -= 1;
          log(
            "Lane " +
              (i + 1) +
              ": " +
              a.name +
              " Hurt → 1 to " +
              b.name +
              " (" +
              Math.max(0, b.hp) +
              " HP)."
          );
        }
        if (a.hp <= 0) {
          log("Lane " + (i + 1) + ": " + a.name + " faints.");
          applyFaint("you", i, a, boards);
          const next = front(boards.you[i]);
          if (next) log("Lane " + (i + 1) + ": " + next.name + " steps up.");
        }
        if (b.hp <= 0) {
          log("Lane " + (i + 1) + ": " + b.name + " faints.");
          applyFaint("enemy", i, b, boards);
          const next = front(boards.enemy[i]);
          if (next) log("Lane " + (i + 1) + ": enemy " + next.name + " steps up.");
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
    if (state.wins >= 2) {
      showEnd(true, "You won the run " + state.wins + "–" + state.losses + ".");
      return;
    }
    if (state.losses >= 2) {
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
