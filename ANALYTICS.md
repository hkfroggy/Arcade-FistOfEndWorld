# Game analytics

The game uses the GA4 web stream `G-8RVNFE3R2G` in every environment.
The measurement ID is a public browser-side identifier, not a secret.

## Events

| Event | Meaning | Useful parameters |
| --- | --- | --- |
| `page_view` | The game page loaded | GA4 supplies page URL, title, date, time, and traffic source |
| `game_start` | Play reached an actual gameplay stage | `game_mode`, `player_count`, `level_number`, `fighter` |
| `game_end` | A run ended, returned to title, or the page was left | `game_result`, `game_mode`, `player_count`, `final_level_number`, `play_time_seconds` |

Play time counts only while the game is in a playable stage or boss battle and the
browser tab is visible. Story, selection, stage-clear, background-tab, and idle
title time are excluded.

## Reports

- Page views and visitors: **Reports → Engagement → Pages and screens**. Use the
  report date selector; use **Realtime** for current activity.
- Game starts: **Reports → Engagement → Events → game_start** and read **Event count**.
- Completed/abandoned runs: inspect the `game_end` event and its `game_result`.
- Play duration: create an event-scoped custom metric under
  **Admin → Data display → Custom definitions → Custom metrics**:
  - Name: `Play time seconds`
  - Event parameter: `play_time_seconds`
  - Unit: `Seconds`

For breakdowns, create event-scoped custom dimensions for `game_mode`,
`game_result`, `fighter`, and `final_level_number`. New custom definitions can
take 24–48 hours to become available in standard reports; Realtime and DebugView
are the quickest way to confirm incoming events.
