(function () {
  "use strict";

  const SECOND = 1000;

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setGlyph(element, value) {
    element.textContent = value;
    element.classList.toggle("is-zero", value === "0");
  }

  class FlipDigit {
    constructor() {
      this.value = " ";
      this.timer = null;
      this.element = makeElement("span", "hc-flip");
      this.element.setAttribute("aria-hidden", "true");

      this.top = makeElement("span", "hc-half hc-top");
      this.topGlyph = makeElement("span", "hc-glyph");
      this.top.append(this.topGlyph);

      this.bottom = makeElement("span", "hc-half hc-bottom");
      this.bottomGlyph = makeElement("span", "hc-glyph");
      this.bottom.append(this.bottomGlyph);

      this.hinge = makeElement("span", "hc-hinge");
      this.element.append(this.top, this.bottom, this.hinge);
      setGlyph(this.topGlyph, " ");
      setGlyph(this.bottomGlyph, " ");
    }

    set(nextValue, animate) {
      const next = String(nextValue);
      const previous = this.value;
      if (next === previous) return;

      window.clearTimeout(this.timer);
      this.element.querySelectorAll(".hc-flap-top, .hc-flap-bottom").forEach(node => node.remove());
      this.value = next;

      if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches || previous === " ") {
        setGlyph(this.topGlyph, next);
        setGlyph(this.bottomGlyph, next);
        return;
      }

      setGlyph(this.topGlyph, next);
      setGlyph(this.bottomGlyph, previous);

      const flapTop = makeElement("span", "hc-half hc-top hc-flap-top");
      const oldGlyph = makeElement("span", "hc-glyph");
      setGlyph(oldGlyph, previous);
      flapTop.append(oldGlyph);

      const flapBottom = makeElement("span", "hc-half hc-bottom hc-flap-bottom");
      const newGlyph = makeElement("span", "hc-glyph");
      setGlyph(newGlyph, next);
      flapBottom.append(newGlyph);

      this.element.insertBefore(flapTop, this.hinge);
      this.element.insertBefore(flapBottom, this.hinge);

      this.timer = window.setTimeout(() => {
        setGlyph(this.bottomGlyph, next);
        flapTop.remove();
        flapBottom.remove();
      }, 660);
    }
  }

  class FlipCountdown {
    constructor(root) {
      if (!(root instanceof Element)) throw new TypeError("Élément de compteur invalide.");
      this.root = root;
      this.board = root.querySelector("[data-board]");
      this.timeout = null;
      this.finished = false;
      this.slots = [];
      this.buildBoard();
      this.setTarget(window.CountdownSettings.getTarget());
    }

    buildBoard() {
      const definitions = [
        ["days", "Jours"],
        ["hours", "Heures"],
        ["minutes", "Minutes"],
        ["seconds", "Secondes"]
      ];

      this.board.replaceChildren();
      definitions.forEach(([key, label], groupIndex) => {
        if (groupIndex > 0) {
          const separator = makeElement("div", "hc-sep");
          separator.setAttribute("aria-hidden", "true");
          separator.append(makeElement("span"), makeElement("span"));
          this.board.append(separator);
        }

        const group = makeElement("div", "hc-group");
        const digits = makeElement("div", "hc-digits");
        const groupSlots = [new FlipDigit(), new FlipDigit()];
        digits.append(groupSlots[0].element, groupSlots[1].element);

        const caption = makeElement("span", "hc-label", label);
        group.append(digits, caption);
        this.board.append(group);
        this.slots.push({ key, digits: groupSlots, container: digits, caption });
      });
    }

    setTarget(value) {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) throw new Error("La date du compte à rebours est invalide.");

      this.target = parsed;
      this.finished = false;
      this.board.classList.remove("is-finished");
      this.tick();
    }

    getRemaining() {
      const totalSeconds = Math.ceil(Math.max(0, this.target.getTime() - Date.now()) / SECOND);
      return {
        totalSeconds,
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor(totalSeconds / 3600) % 24,
        minutes: Math.floor(totalSeconds / 60) % 60,
        seconds: totalSeconds % 60
      };
    }

    tick() {
      window.clearTimeout(this.timeout);
      const remaining = this.getRemaining();

      for (const slot of this.slots) {
        const value = String(remaining[slot.key]).padStart(2, "0");
        while (slot.digits.length < value.length) {
          const digit = new FlipDigit();
          slot.digits.push(digit);
          slot.container.append(digit.element);
        }
        while (slot.digits.length > value.length) {
          const digit = slot.digits.pop();
          window.clearTimeout(digit.timer);
          digit.element.remove();
        }
        slot.digits.forEach((digit, index) => digit.set(value[index], true));

        const singular = remaining[slot.key] === 1;
        const names = {
          days: singular ? "Jour" : "Jours",
          hours: singular ? "Heure" : "Heures",
          minutes: singular ? "Minute" : "Minutes",
          seconds: singular ? "Seconde" : "Secondes"
        };
        slot.caption.textContent = names[slot.key];
      }

      this.board.style.setProperty("--hc-cols", this.slots.reduce((sum, slot) => sum + slot.digits.length, 0));

      this.board.setAttribute(
        "aria-label",
        remaining.totalSeconds === 0
          ? "Le compte à rebours est terminé"
          : `Encore ${remaining.days} jours, ${remaining.hours} heures, ${remaining.minutes} minutes et ${remaining.seconds} secondes`
      );

      if (remaining.totalSeconds === 0) {
        if (!this.finished) {
          this.finished = true;
          this.board.classList.add("is-finished");
        }
        return;
      }

      const untilNextSecond = (this.target.getTime() - Date.now()) % SECOND;
      this.timeout = window.setTimeout(() => this.tick(), (untilNextSecond || SECOND) + 15);
    }
  }

  window.FlipCountdown = FlipCountdown;

  function initialize() {
    document.querySelectorAll("[data-countdown]").forEach(element => {
      if (!element.__flipCountdown) element.__flipCountdown = new FlipCountdown(element);
    });
  }

  window.addEventListener("storage", event => {
    if (event.key !== null && event.key !== window.CountdownSettings.storageKey) return;
    document.querySelectorAll("[data-countdown]").forEach(element => {
      element.__flipCountdown?.setTarget(window.CountdownSettings.getTarget());
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
