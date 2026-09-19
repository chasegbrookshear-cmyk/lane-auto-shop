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
    const START_GOLD = 6;

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
         btnRoll: document.getElementById("btn-roll"),
         btnEnd: document.getElementById("btn-end"),
         btnRematch: document.getElementById("btn-rematch"),
   };

   let state = null;
    let selectedOffer = null;
    let freezeIdx = null;

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

   function randomUnit() {
         return cloneUnit(UNITS[Math.floor(Math.random() * UNITS.length)]);
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
                 lanes: [null, null, null],
                 enemy: [null, null, null],
                 log: [],
         };
         selectedOffer = null;
         freezeIdx = null;
         el.end.classList.add("hidden");
         el.shop.classList.remove("hidden");
         render();
   }

   function log(msg, cls) {
         state.log.push({ msg, cls });
         if (state.log.length > 100) state.log.shift();
   }

   function render() {
         el.gold.textContent = "Gold: " + state.gold;
         el.round.textContent = "Round " + state.round;
         el.record.textContent = "W" + state.wins + " – L" + state.losses;

      el.offers.innerHTML = "";
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
                           "  " +
                           BUY +
                           'g</span><span class="meta">' +
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

      const placed = state.lanes.filter(Boolean).length;
         el.btnRoll.disabled = state.phase !== "shop" || state.gold < ROLL;
         el.btnEnd.disabled = state.phase !== "shop" || placed < 1;
         el.btnEnd.title = placed < 1 ? "Place at least 1 unit before fighting" : "";

      el.board.innerHTML = "";
         el.enemy.innerHTML = "";
         for (let i = 0; i < 3; i++) {
                 el.board.appendChild(laneEl(i, state.lanes[i], true));
                 el.enemy.appendChild(laneEl(i, state.enemy[i], false));
         }

      el.log.innerHTML = state.log
           .map((l) => '<div class="' + (l.cls || "") + '">' + l.msg + "</div>")
           .join("");
         el.log.scrollTop = el.log.scrollHeight;
   }

   function laneEl(i, unit, mine) {
         const div = document.createElement("div");
         const canDrop =
                 mine && state.phase === "shop" && selectedOffer !== null && !state.lanes[i];
         div.className = "lane" + (canDrop ? " drop" : "");
         div.innerHTML = '<div class="tag">Lane ' + (i + 1) + "</div>";
         if (unit) {
                 const u = document.createElement("div");
                 u.className = "unit";
                 u.innerHTML =
                           '<span class="name">' +
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
                                       sellLane(i);
                           });
                 }
                 div.appendChild(u);
         } else {
                 const empty = document.createElement("div");
                 empty.style.color = "var(--muted)";
                 empty.style.fontSize = "0.85rem";
                 empty.textContent =
                           mine && state.phase === "shop" ? "Empty — tap to place" : "Empty";
                 div.appendChild(empty);
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
         if (state.lanes[i]) return;
         if (state.gold < BUY) {
                 log("Not enough gold to buy.");
                 render();
                 return;
         }
         const offer = state.offers[selectedOffer];
         state.gold -= BUY;
         state.lanes[i] = cloneUnit(offer);
         state.offers[selectedOffer] = null;
         if (freezeIdx === selectedOffer) freezeIdx = null;
         selectedOffer = null;
         log("Bought " + offer.name + " into Lane " + (i + 1) + ".");
         render();
   }

   function sellLane(i) {
         if (state.phase !== "shop" || !state.lanes[i]) return;
         const name = state.lanes[i].name;
         state.lanes[i] = null;
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
         const enemy = [];
         for (let i = 0; i < 3; i++) {
                 const u = randomUnit();
                 if (state.round >= 2 && Math.random() < 0.4) u.hp += 1;
                 if (state.round >= 3 && Math.random() < 0.4) u.atk += 1;
                 enemy.push(u);
         }
         return enemy;
   }

   function applyFaint(side, laneIdx, unit) {
         if (!unit || unit.trigger !== "faint") return;
         const board = side === "you" ? state.fightYou : state.fightEnemy;
         const adj = [laneIdx - 1, laneIdx + 1].filter(
                 (j) => j >= 0 && j < 3 && board[j] && board[j].hp > 0
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
         board[j].hp += 1;
         log(
                 "Lane " +
                   (laneIdx + 1) +
                   ": " +
                   (side === "you" ? "" : "enemy ") +
                   unit.name +
                   " Faint  +1 HP to Lane " +
                   (j + 1) +
                   " " +
                   board[j].name +
                   " (" +
                   board[j].hp +
                   " HP).",
                 "win"
               );
   }

   function resolveCombat() {
         state.fightYou = state.lanes.map((u) => (u ? { ...u } : null));
         state.fightEnemy = state.enemy.map((u) => (u ? { ...u } : null));

      for (let i = 0; i < 3; i++) {
              const a = state.fightYou[i];
              const b = state.fightEnemy[i];
              if (a && a.trigger === "start") {
                        a.atk += 1;
                        log("Lane " + (i + 1) + ": " + a.name + " Start  " + a.atk + " ATK.");
              }
              if (b && b.trigger === "start") {
                        b.atk += 1;
                        log(
                                    "Lane " +
                                      (i + 1) +
                                      ": enemy " +
                                      b.name +
                                      " Start → " +
                                      b.atk +
                                      " ATK."
                                  );
              }
      }

      let guard = 60;
         while (guard-- > 0) {
                 let anyFight = false;
                 for (let i = 0; i < 3; i++) {
                           const a = state.fightYou[i];
                           const b = state.fightEnemy[i];
                           if (!a || !b || a.hp <= 0 || b.hp <= 0) continue;
                           anyFight = true;

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
                                       applyFaint("enemy", i, b);
                           }
                           if (a.hp <= 0) {
                                       log("Lane " + (i + 1) + ": " + a.name + " faints.");
                                       applyFaint("you", i, a);
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
                                       applyFaint("you", i, a);
                           }
                           if (b.hp <= 0) {
                                       log("Lane " + (i + 1) + ": " + b.name + " faints.");
                                       applyFaint("enemy", i, b);
                           }
                 }
                 if (!anyFight) break;
         }

      let youLanes = 0;
         let enemyLanes = 0;
         for (let i = 0; i < 3; i++) {
                 const a = state.fightYou[i];
                 const b = state.fightEnemy[i];
                 const aOk = a && a.hp > 0;
                 const bOk = b && b.hp > 0;
                 if (aOk && !bOk) {
                           youLanes += 1;
                           log("Lane " + (i + 1) + ": YOU win.", "win");
                 } else if (bOk && !aOk) {
                           enemyLanes += 1;
                           log("Lane " + (i + 1) + ": AI wins.", "loss");
                 } else if (!a && !b) {
                           log("Lane " + (i + 1) + ": empty draw.");
                 } else if (!a && bOk) {
                           enemyLanes += 1;
                           log("Lane " + (i + 1) + ": empty — AI wins.", "loss");
                 } else if (aOk && !b) {
                           youLanes += 1;
                           log("Lane " + (i + 1) + ": unopposed — YOU win.", "win");
                 } else {
                           // both dead or both alive after timeout: compare remaining HP
                   const ah = aOk ? a.hp : 0;
                           const bh = bOk ? b.hp : 0;
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

   function endTurnFight() {
         if (state.phase !== "shop") return;
         if (!state.lanes.some(Boolean)) {
                 log("Place at least 1 unit before End Turn.");
                 render();
                 return;
         }
         state.phase = "fight";
         state.enemy = buildEnemy();
         state.log = [];
         log("— Round " + state.round + " fight —");
         render();

      const { youLanes, enemyLanes } = resolveCombat();
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

      if (state.wins >= 2) {
              showEnd(true, "You won the run " + state.wins + "–" + state.losses + ".");
              return;
      }
         if (state.losses >= 2) {
                 showEnd(false, "Run over " + state.wins + "–" + state.losses + ".");
                 return;
         }

      state.round += 1;
         state.gold = START_GOLD + Math.min(2, state.round - 1);
         state.lanes = state.lanes.map((u) => (u ? cloneUnit(u) : null));
         state.offers = rollOffers(false);
         freezeIdx = null;
         selectedOffer = null;
         state.phase = "shop";
         state.enemy = [null, null, null];
         log("Shop — Round " + state.round + ". Gold " + state.gold + ".");
         render();
   }

   function showEnd(won, detail) {
         state.phase = "end";
         el.shop.classList.add("hidden");
         el.end.classList.remove("hidden");
         el.endTitle.textContent = won ? "Run cleared!" : "Run failed";
         el.endDetail.textContent = detail;
         render();
   }

   el.btnRoll.addEventListener("click", doRoll);
    el.btnEnd.addEventListener("click", endTurnFight);
    el.btnRematch.addEventListener("click", startRun);

   startRun();
})();
