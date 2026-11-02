(function () {
  "use strict";

  const STORAGE_KEY = "module-domotic.countdown.target.v1";
  const DEFAULT_TARGET = "2026-10-14T18:00:00+02:00";

  function isValidDate(value) {
    return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
  }

  function readStoredTarget() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return isValidDate(value) ? value : null;
    } catch {
      return null;
    }
  }

  function getTarget() {
    return readStoredTarget() || DEFAULT_TARGET;
  }

  function saveTarget(value) {
    if (!isValidDate(value)) throw new Error("Date invalide.");
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  function resetTarget() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.CountdownSettings = Object.freeze({
    storageKey: STORAGE_KEY,
    defaultTarget: DEFAULT_TARGET,
    getTarget,
    readStoredTarget,
    saveTarget,
    resetTarget
  });
})();
