(function () {
  "use strict";

  const settings = window.CountdownSettings;
  const form = document.querySelector("[data-settings-form]");
  const input = document.querySelector("#target-date");
  const resetButton = document.querySelector("[data-reset]");
  const status = document.querySelector("[data-form-status]");
  const sourceBadge = document.querySelector("[data-source-badge]");
  const sourceLabel = document.querySelector("[data-source-label]");
  const effectiveDate = document.querySelector("[data-effective-date]");
  const preview = document.querySelector("[data-preview]");

  function toLocalInputValue(value) {
    const date = new Date(value);
    const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 16);
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Paris"
    }).format(new Date(value));
  }

  function refreshInterface(message) {
    const storedValue = settings.readStoredTarget();
    const target = storedValue || settings.defaultTarget;

    input.value = toLocalInputValue(target);
    sourceBadge.textContent = storedValue ? "Personnalisée" : "Par défaut";
    sourceLabel.textContent = storedValue
      ? "La date enregistrée dans ce navigateur est utilisée."
      : "La date inscrite en dur dans config.js est utilisée.";
    effectiveDate.textContent = `Fin prévue : ${formatDate(target)}`;
    status.textContent = message || "";
    preview.__flipCountdown?.setTarget(target);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!input.value) {
      status.textContent = "Choisissez une date et une heure.";
      input.focus();
      return;
    }

    const parsed = new Date(input.value);
    if (Number.isNaN(parsed.getTime())) {
      status.textContent = "La date saisie n’est pas valide.";
      input.focus();
      return;
    }

    try {
      settings.saveTarget(parsed.toISOString());
    } catch {
      status.textContent = "Enregistrement impossible : le stockage du navigateur est indisponible.";
      return;
    }
    refreshInterface("La nouvelle date a bien été enregistrée.");
  });

  resetButton.addEventListener("click", () => {
    try {
      settings.resetTarget();
    } catch {
      status.textContent = "Réinitialisation impossible : le stockage du navigateur est indisponible.";
      return;
    }
    refreshInterface("La date par défaut a été rétablie.");
  });

  refreshInterface();
})();
