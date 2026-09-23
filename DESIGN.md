# Lane Auto Shop — design contract

Short MUST / MUST NOT for bots and humans. No full GDD.

Current rules: 9g shop, units cost **1–4g**, roll 1g, sell = full printed-cost refund, max 2 units/lane, persist between rounds, win 2 of 3 lanes, run = 3 wins before 3 losses (best of 5). 28 units in the 1–4 curve. Keywords: Shield, Venom, Double, Overkill. Support is the partner slot. Fender Hurt splashes. Shop marks copies. AI fuses after 1-1-1. Combat ticks HP on the facing board.

## 1) R1 AI shop — always fill 3

**MUST**
- Spend all 9g covering 3 lanes first (reserve 1g per remaining empty bay). Fill leftover. 0 rolls, 0 freeze. No R1 fuse. No R1 Service.
- Place **coverage** on R1. 1-1-1 if three 3-costs; 2-2-2 is legal if leftover 1-costs fill.
- Use the same gold pool as the player. No R1 stat hacks.
- If you later simulate a real shop: greedy-buy until 3 lanes have a unit; only then may you roll.
- Keep hidden-info (build at End Turn). Placement stays cover-first even if the player left a hole.
- Spend map must show 3 occupied enemy lanes every R1.
- After R1, persist the AI shop roster (healed) and spend the **same gold** as the player: cover, fill, fuse copies, Service leftover. No extra gold.

**MUST NOT**
- 2-1-0 / 2-0-1 on R1 (a hole).
- Roll away the 3rd body.
- Snipe a player-empty lane on R1.
- End an R1 AI board with `<3` units.
- Give AI extra gold or `+hp/+atk` on R1 **or later**.
- Fuse on R1.
- Rebuild the AI from scratch each round.

**Player R1**
- **MUST** — End Turn stays locked until 3 lanes are occupied.
- **MUST** — Freeze is an explicit **Hold** (survives into the next shop). Second tap on an offer deselects; it does not freeze.

## 2) Cheap depth — after 1-1-1 feels fair

Cap=2 is a HP bag if Start buffs self. Partner + swap + Veteran + Service + Wall Hurt splash ship with this contract.

**A. Partner slot**
- **MUST** — Start buffs the **other unit in this lane** (self only if solo). Medic Faint heals the **partner**; Scout Faint heals an **adjacent lane**.
- **MUST NOT** — Leave “Start: +1 ATK same lane” as a self-buff. Don’t add a 4th trigger to fake synergy.

**B. Free front/back swap**
- **MUST** — 0g swap during shop. Hurt only fires on the fighting front.
- **MUST NOT** — Charge gold for swap. Don’t auto-sort by ATK/HP.

**C. Cross-lane Hurt (Wall only)**
- **MUST** — Wall Hurt deals 1 to the attacker **and** 1 to one adjacent enemy front. Pick the adjacent living enemy front with more HP; ties go to the lower lane index. Veteran Wall still splashes (`id` stays wall). Splash kills faint in that lane.
- **MUST** — Bruiser and Skirmisher Hurt stay attacker-only.
- **MUST NOT** — Splash the player’s own lanes. Don’t splash from every Hurt unit.

**Run length**
- **MUST** — First to **3** wins before **3** losses. Round still won on 2 of 3 lanes. Gold stays 9/10/11/12.
- **MUST NOT** — Leftover gold, interest, or extra gold on triggers.

**Shop copy tell**
- **MUST** — If a shop offer’s role is already on the player board, mark it **Copy**. Information only.
- **MUST NOT** — Bias rolls toward copies. Don’t pity-timer a matching unit.

**D. Move (0g, shop)**
- **MUST** — Tap a placed unit, then an open bay to relocate, or another unit (or a full bay) to **swap**. 0g. Tapping a unit while a shop offer is selected **buys behind** that unit if the bay has room.
- **MUST NOT** — A bench. The other bay is the bench. Don't charge gold.

**E. First strike**
- **MUST** — The fighting front with **higher ATK** swings first. Ties go to you. Swap/Move now aim the seam.
- **MUST NOT** — Always let the player punch first.

**MUST NOT (until A–E ship)** food, shop tiers, items, a bench, extra gold on triggers.

## 1–4 gold curve (playtest)

**MUST**
- Shop rolls 1–4g with **equal odds per price**, then a random unit at that price. Printed cost is paid and refunded. Start gold stays **9**.
- 4-drops are legal on round 1. Cover still has to fit in 9g (a 4 leaves room for a 3 and a 2, or a 4, a 4, and a 1).
- Higher costs later (5–10) need more starting gold or a longer gold curve. Do not add them on 9g.
- Keywords: **Shield** (first hit 0), **Venom** (damage faints), **Double** (two hits), **Overkill** (leftover to an adjacent enemy front).
- R1 still cover 3. Cap stays 2. Run stays 3-and-3.
- No Spec / Exodia pieces until 6g and 8g exist.

**MUST NOT**
- Flat 3g on every unit.
- Incomplete 5-piece Exodia.
- Ads on this web cut.
- Interest. Runs are 3–5 fights and leftover gold is 1–2. Saving pays nothing yet. Revisit when 6g+ units exist and games are long enough to bank.


## 4) Support split — ship with the 9th role

The old 8 names were 3 verbs. Support is a **partner job**, not a 4th trigger.

**MUST**
- Guard Start: **+1 ATK** partner (self if solo). 2/5. Name: **Bumper**.
- Blade Start: **+2 ATK** partner, **+1 ATK** if solo. 3/2. Name: **Torque**.
- Anchor Start: **+2 HP** partner (self if solo). Combat HP only — do not raise maxHp. 1/6. Name: **Jack**.
- Skirmisher Hurt: 1 to attacker **and +1 HP** partner (self if solo). 2/4. Name: **Rivet**.
- Bruiser Hurt: 1 to attacker only. 4/2. Name: **Sledge**.
- Wall Hurt: splash, unchanged. 2/6. Name: **Fender**.
- Medic Faint: **+2 HP** partner. 1/4. Name: **Patch**.
- Scout Faint: **+1 HP** adjacent lane. 2/3. Name: **Spotter**.
- **Crew** (9th): Faint **+1 ATK** partner. 2/3. Name: **Pit**. Wants to die in front.
- Combat Start / Hurt / Faint do **not** persist. Service and Veteran still do.

**MUST NOT**
- A 4th trigger (cast, buy, sell, end-of-turn).
- Food, a bench, shop tiers, leftover gold.
- Make Anchor Start raise maxHp (that would stack every round).
- Make Crew ATK persist by copying combat boards back onto the shop board.
- Add cap 3 or character art in this step.
- A rules essay in the header after round 1. First shop is one line: “Buy → tap a lane. Cover all 3. Copies fuse.”

Combat board: three facing bays. HP ticks on the cards from event uids. Fainted units grey out. No sprites.

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
- Combine / Service / Move happen **on the lane**. Unit shop price stays flat 3g.
- AI this build: cover-first bodies. After 1-1-1, fuse matching copies. Do not Service. Do not stat-hack.

**MUST NOT**
- 3 copies anywhere → L2, then 3 L2s → L3.
- A bench, hidden XP bar, or turn-unlock shop tiers.
- Food that gives stats and freezes.
- Make a Veteran occupy 1 slot **and** count as 2 bodies for empty-lane math.
- Named-pet evolutions, or pair-fusion of two different roles into a new unit.
- Persist leftover gold or add interest. Gold already scales by round (9/10/11/12).
- Let combine delete coverage: fuse is same-lane only; the Veteran still occupies the lane. An empty *other* lane is a player mistake, not a fuse side-effect.
- Raise cap to 3 or add animation in this step.

R1 coverage stays sacred: a Veteran is a **slot** spike (then fill the partner), not a license to 2-1-0.
