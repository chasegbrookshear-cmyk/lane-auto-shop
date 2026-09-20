# Lane Auto Shop (v2 — multi-unit lanes)

9 gold shop · units 3g · up to 2 per lane · persist between rounds · post-round spend map.

Garage names: Bumper, Rivet, Jack, Spotter, Sledge, Patch, Torque, Fender, Pit. R1 AI always covers **1-1-1**. Later rounds fuse matching copies after cover. No R2/R3 stat hacks.

**Veteran:** two copies of the same role in one lane fuse (0g) into a Veteran (+1/+2, one slot, one step). The freed slot is the composition play.

**Service:** pay 3g on a placed unit for +1/+1. Sell still refunds 3g. Shop marks **Copy** when an offer matches a unit already on your board.

Design contract for bots: [DESIGN.md](./DESIGN.md)

## Play
https://chasegbrookshear-cmyk.github.io/lane-auto-shop/

## Local
```bash
python3 -m http.server 8767
```
