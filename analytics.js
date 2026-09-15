// GA4 gameplay measurement. The measurement ID is intentionally shared by all environments.
(() => {
  const MEASUREMENT_ID = 'G-8RVNFE3R2G';
  const PLAYING_STATES = new Set(['playing', 'boss']);
  let currentState = 'title';
  let run = null;
  let activeSince = null;

  const now = () => performance.now();
  const send = (name, params) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, { send_to: MEASUREMENT_ID, ...params });
    }
  };

  function pauseTimer() {
    if (!run || activeSince === null) return;
    run.activeMs += Math.max(0, now() - activeSince);
    activeSince = null;
  }

  function resumeTimer() {
    if (run && activeSince === null && !document.hidden) activeSince = now();
  }

  function finishRun(reason, useBeacon = false) {
    if (!run) return;
    pauseTimer();
    send('game_end', {
      game_result: reason,
      game_mode: run.mode,
      player_count: run.playerCount,
      final_level_number: run.levelNumber,
      play_time_seconds: Math.round(run.activeMs / 1000),
      engagement_time_msec: Math.max(1, Math.round(run.activeMs)),
      ...(useBeacon ? { transport_type: 'beacon' } : {})
    });
    run = null;
    activeSince = null;
  }

  function observe(nextState, details = {}) {
    const isPlaying = PLAYING_STATES.has(nextState);
    if (!run && isPlaying) {
      run = {
        activeMs: 0,
        mode: details.mode || 'unknown',
        playerCount: details.playerCount || 1,
        levelNumber: details.levelNumber || 1
      };
      send('game_start', {
        game_mode: run.mode,
        player_count: run.playerCount,
        level_number: run.levelNumber,
        fighter: details.fighter || 'Unknown'
      });
    }

    if (run) {
      run.levelNumber = Math.max(run.levelNumber, details.levelNumber || 1);
      if (isPlaying) resumeTimer(); else pauseTimer();
      if (nextState === 'gameover') finishRun('game_over');
      else if (nextState === 'victory') finishRun('victory');
      else if (nextState === 'title' && currentState !== 'title') finishRun('exit_to_title');
    }
    currentState = nextState;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseTimer();
    else if (PLAYING_STATES.has(currentState)) resumeTimer();
  });
  window.addEventListener('pagehide', () => finishRun('page_exit', true));

  window.GAME_ANALYTICS = { observe };
})();
