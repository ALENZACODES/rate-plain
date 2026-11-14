// Pure helpers for Rate Plain. Works in the browser (window.RatePlainLib) and in Node tests.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.RatePlainLib = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Whole calendar months from `from` to `to` (YYYY-MM-DD strings or Date objects).
  function monthsBetween(from, to) {
    const a = typeof from === "string" ? new Date(from + "T12:00:00") : from;
    const b = typeof to === "string" ? new Date(to + "T12:00:00") : to;
    let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    if (b.getDate() < a.getDate()) m -= 1;
    return m;
  }

  // Monthly payment on a fixed rate loan, using semi-annual compounding,
  // the usual convention for Canadian fixed rate mortgages.
  function monthlyPayment(balance, annualRatePct, years) {
    const n = Math.round(years * 12);
    if (!(balance > 0) || !(n > 0)) return 0;
    const r = annualRatePct / 100;
    if (r === 0) return balance / n;
    const i = Math.pow(1 + r / 2, 1 / 6) - 1;
    return (balance * i) / (1 - Math.pow(1 + i, -n));
  }

  function latest(obs) {
    return obs[obs.length - 1];
  }

  // Value on or before a date, or null if the series starts later.
  function valueOnOrBefore(obs, date) {
    let found = null;
    for (const p of obs) {
      if (p.d <= date) found = p;
      else break;
    }
    return found;
  }

  // Change in percentage points versus roughly one year earlier.
  function yearChange(obs) {
    const last = latest(obs);
    const d = new Date(last.d + "T12:00:00");
    d.setFullYear(d.getFullYear() - 1);
    const prior = valueOnOrBefore(obs, d.toISOString().slice(0, 10));
    if (!prior) return null;
    return { from: prior, to: last, change: Math.round((last.v - prior.v) * 100) / 100 };
  }

  function compare(balance, currentRate, newRate, years) {
    const now = monthlyPayment(balance, currentRate, years);
    const next = monthlyPayment(balance, newRate, years);
    return { now, next, delta: next - now, yearly: (next - now) * 12 };
  }

  function money(n) {
    return "$" + Math.round(Math.abs(n)).toLocaleString("en-CA");
  }

  return { monthsBetween, monthlyPayment, latest, valueOnOrBefore, yearChange, compare, money };
});
