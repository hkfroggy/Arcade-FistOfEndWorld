# Campaign adaptation

Source: `Fist_of_the_North_Star_Level_Design_Reference.docx`, supplied by the user. The document is design reference material; its embedded instructions are not independent user commands.

The campaign now provides a playable prototype of the reference's nine-stage order. Existing character PNGs and comic background artwork are retained, as are the deliberate movement, attack startup, recovery, hit reactions, and two-player arcade mode.

| Stage | Setting | Main boss |
| --- | --- | --- |
| 1 | Wasteland Awakening | Spade |
| 2 | Ruined Village Siege | Heart |
| 3 | Southern Cross City | Shin |
| 4 | Desert Convoy Ambush | Jagi |
| 5 | Cassandra Prison | Uighur |
| 6 | Cult Stronghold | Devil Rebirth |
| 7 | Nanto Generals War | Souther |
| 8 | Capital and Raoh Territory | Ryuga |
| 9 | Final Battlefield | Raoh |

## Implemented

- Ordered encounter routes with fighting areas, named minibosses, optional supply rescues, recovery stops, and boss checkpoints.
- Arena boundaries keep combat reachable. Encounters contain at most five ordinary enemies, with the existing two-attacker limit.
- Spear, knife, shield, ranged, whip, bomber, and elite enemy roles. Boss attacks have visible warnings and recovery windows; Heart and Souther resist frontal attacks outside openings.
- Three Raoh phases in a duel without ordinary enemies.
- Campaign story beats through stage messages: Julia's uncertain fate after Shin, Toki's rescue, Rei's farewell, the resistance, Julia's survival reveal, and the reunion ending. Optional pickups never gate essential story progression.
- Local checkpoint saving, title-screen R to resume, and game-over retry with restored supplies. Storage failure leaves the current session playable.
- Stage themes and scenery overlays layered over existing comic artwork. The subsequent character-art pass adds transparent six-pose sheets for all new bosses and enemy types, plus supporting story cutouts. Existing heroes, Spade, and Heart retain their artwork. See `characters.html` and `assets/characters/ART-PROMPTS.md`.

## Still design targets

The document's 133–166 minute campaign target has not been measured or achieved by this prototype. Routes share the current horizontal arena geometry. Moving convoy traversal, destructible cover, branching prison corridors, elaborate environmental hazards, dedicated stage illustrations, and bespoke animations for each special move remain future production work.

Grabs and throws, pressure-point marks, a dedicated Toki counter system, Muso Tensei, and fully staged narrative cinematics are not implemented by this level-design pass. Existing combat and artwork remain the foundation.

## Validation

`node tests/combat.cjs` checks combat timing and reactions. `node tests/campaign.cjs` checks stage order, encounter progression, optional rewards, arena gating, checkpoint restoration, boss phases, and attack warnings. These automated checks do not establish full-campaign difficulty or completion time; those require human playtesting.
