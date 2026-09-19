# Lane Auto Shop — design contract

Short MUST / MUST NOT for bots and humans. No full GDD.

Current rules: 9g shop, 3g units, roll 1g, sell = full refund, max 2 units/lane, persist between rounds, win 2 of 3 lanes, run = 2 wins before 2 losses, 8 roles with Start / Hurt / Faint.

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

Cap=2 is a HP bag if Start buffs self. Partner + swap ship with this contract. Hurt splash does **not** ship yet.

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

## 3) Combine / level later — not SAP 3-copy

**MUST**
- Fuse **2 copies in the same lane** into a Veteran in **one slot**.
- Cap Veteran at **one** step.
- Veteran = `+1/+2` **or** trigger fires twice — pick one.
- Alternate: a unit that **survives a won lane** gains `+1 ATK` next shop.
- Optional **Service** — pay 3g on a placed unit for `+1/+1`.
- Combine/Service happen **on the lane**. Keep 3g flat prices.

**MUST NOT**
- 3 copies anywhere → L2, then 3 L2s → L3.
- A bench, hidden XP bar, or turn-unlock shop tiers.
- Food that gives stats and freezes.
- Make a Veteran occupy 1 slot **and** count as 2 bodies for empty-lane math.
- Named-pet evolutions, or pair-fusion of two different roles into a new unit.
- Let combine delete coverage: if a fuse would empty a lane, it fails or the leftover unit must be placeable this shop.

R1 coverage stays sacred: a Veteran is a **power** spike, not a license to 2-1-0.
