# Lane Auto Shop (v2 — multi-unit lanes)

9 gold shop · units 3g · up to 2 per lane · persist between rounds · post-round spend map.

R1 AI always covers **1-1-1**. Start buffs the partner (self if solo): Guard +1 ATK, Blade +2 ATK, Anchor +2 HP. Medic faints +2 HP into the partner; Crew faints +1 ATK; Scout faints into an adjacent lane. Skirmisher Hurt heals the partner. Wall Hurt also pings one adjacent enemy front. Run is first to **3** wins before **3** losses.

**Veteran:** two copies of the same role in one lane fuse (0g) into a Veteran (+1/+2, one slot, one step). The freed slot is the composition play.

**Service:** pay 3g on a placed unit for +1/+1. Sell still refunds 3g. Shop marks **Copy** when an offer matches a unit already on your board.

Design contract for bots: [DESIGN.md](./DESIGN.md)

## Play
https://chasegbrookshear-cmyk.github.io/lane-auto-shop/

## Local
```bash
python3 -m http.server 8767
```
