# Lane Auto Shop — design contract

Short MUST / MUST NOT for bots and humans. No full GDD.

Current rules: 9g shop, 3g units, roll 1g, sell = full 3g refund, max 2 units/lane, persist between rounds, win 2 of 3 lanes, run = 2 wins before 2 losses, 8 roles with Start / Hurt / Faint.

## 1) R1 AI shop — always fill 3

**MUST**
- Spend all 9g on **3 buys**. 0 rolls, 0 freeze, 0 leftover.
- Place **1-1-1**. Coverage is the R1 objective, not EV or pairs.
- Use the same 3g pool as the player. No R1 stat hacks.
- If you later simulate a real shop: greedy-buy until 3 lanes have a unit; only then may you roll.
- Keep hidden-info (build at End Turn). Placement stays cover-first even if the player left a hole.
- Spend map must show 3 occupied enemy lanes every R1.

**MUST NOT**
- 2-1-0 / 2-0-1 / 3-unit stack on R1.
- Roll away the 3rd body.
- Snipe a player-empty lane on R1.
- End an R1 AI board with `<3` units.
- Give AI extra gold or `+hp/+atk` on R1.

## 2) Cheap depth — after 1-1-1 feels fair

Cap=2 is a HP bag if Start buffs self. Partner + swap + Veteran + Service ship with this contract. Hurt splash does **not** ship yet.

**A. Partner slot**
- **MUST** — Start buffs the **other unit in this lane** (self only if solo). Medic Faint heals the **partner**; Scout Faint heals an **adjacent lane**.
- **MUST NOT** — Leave “Start: +1 ATK same lane” as a self-buff. Don’t add a 4th trigger to fake synergy.

**B. Free front/back swap**
- **MUST** — 0g swap during shop. Hurt only fires on the fighting front.
- **MUST NOT** — Charge gold for swap. Don’t auto-sort by ATK/HP.

**C. Cross-lane Hurt (later)**
- **MUST** — Hurt deals 1 to the enemy front **and** 1 to one adjacent enemy front.
- **MUST NOT** — Splash to the player’s own lanes. Don’t add a 4th lane.

**MUST NOT (until A–C ship)** food, shop tiers, items, a bench, extra gold on triggers, or a 9th role.

## 3) Combine / Veteran — shipping, not SAP 3-copy

**MUST**
- Fuse **2 copies of the same role in the same lane** into a Veteran occupying **one slot**. 0g. Shop only.
- Veteran = **+1 ATK / +2 HP** (and maxHp). One step. Trigger still fires once.
- Fuse keeps the **front** unit’s current stats (including Service), then applies the Veteran bonus. The back copy is removed. No gold refund — the refund is the **freed slot**.
- If either unit is already a Veteran, fuse **fails**.
- Different roles in a lane cannot fuse.
- **Service** — pay 3g on a placed unit for `+1/+1` (atk, hp, maxHp). Repeatable. Shop only.
- Sell always refunds **3g**, even on Veterans and Serviced units. Service gold and the fused body are spent.
- Persist: between rounds, heal HP to maxHp. **Keep** atk, maxHp, veteran flag, and name. Never rebuild from the roster template.
- Combine / Service happen **on the lane**. Unit shop price stays flat 3g.
- AI this build: cover-first bodies. Do **not** auto-fuse (fusing after a full buy throws away a body with no refill). Same fuse rule if a later shop sim would still occupy 3 lanes after.

**MUST NOT**
- 3 copies anywhere → L2, then 3 L2s → L3.
- A bench, hidden XP bar, or turn-unlock shop tiers.
- Food that gives stats and freezes.
- Make a Veteran occupy 1 slot **and** count as 2 bodies for empty-lane math.
- Named-pet evolutions, or pair-fusion of two different roles into a new unit.
- Persist leftover gold or add interest. Gold already scales by round (9/10/11/12).
- Let combine delete coverage: fuse is same-lane only; the Veteran still occupies the lane. An empty *other* lane is a player mistake, not a fuse side-effect.
- Raise cap to 3, add Hurt splash, or add animation in this step.

R1 coverage stays sacred: a Veteran is a **slot** spike (then fill the partner), not a license to 2-1-0.
