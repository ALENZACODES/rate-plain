import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const L = require(join(root, "lib.js"));
const policy = JSON.parse(readFileSync(join(root, "data/policy-rate.json"), "utf8"));
const bond = JSON.parse(readFileSync(join(root, "data/bond-5yr.json"), "utf8"));

// Data shape and provenance
assert.equal(policy.source.series, "V39079");
assert.equal(bond.source.series, "BD.CDN.5YR.DQ.YLD");
assert.ok(policy.observations.length > 1500, "daily policy history since 2020");
assert.ok(bond.observations.length > 1500, "daily bond history since 2020");
for (const s of [policy, bond]) {
  const dates = s.observations.map((p) => p.d);
  assert.deepEqual(dates, [...dates].sort(), "dates ascending");
  assert.equal(new Set(dates).size, dates.length, "no duplicate dates");
  for (const p of s.observations) assert.ok(Number.isFinite(p.v) && p.v >= 0 && p.v < 20);
}
// Snapshot saved 2026-11-13 Toronto time: Valet showed 2.50 and 3.53 on 2026-11-12.
assert.equal(L.latest(policy.observations).d, "2026-11-12");
assert.equal(L.latest(policy.observations).v, 2.5);
assert.equal(L.latest(bond.observations).v, 3.53);
assert.equal(L.valueOnOrBefore(policy.observations, "2020-01-02").v, 1.75);

// Months
assert.equal(L.monthsBetween("2026-11-13", "2027-05-13"), 6);
assert.equal(L.monthsBetween("2026-11-13", "2027-05-12"), 5);
assert.equal(L.monthsBetween("2026-11-13", "2026-11-01"), -1);

// Payment math: semi-annual compounding, checked by hand
// 400,000 at 5% over 25 years: i = 1.025^(1/6) - 1, payment about 2326.42
const p = L.monthlyPayment(400000, 5, 25);
assert.ok(Math.abs(p - 2326.42) < 0.05, "payment " + p);
assert.equal(L.monthlyPayment(120000, 0, 10), 1000);
assert.equal(L.monthlyPayment(0, 5, 25), 0);
const c = L.compare(400000, 2.89, 4.19, 22);
assert.ok(c.delta > 0 && Math.abs(c.yearly - c.delta * 12) < 1e-9);
assert.ok(L.compare(400000, 5, 4, 25).delta < 0);

// Year change uses an earlier point
const yc = L.yearChange(bond.observations);
assert.ok(yc && yc.from.d < yc.to.d);

// Public copy uses plain punctuation: no long dashes
const banned = /\u2014|\u2013/;
for (const f of ["index.html", "README.md", "DEVPOST.md", "app.js"]) {
  assert.equal(banned.test(readFileSync(join(root, f), "utf8")), false, f);
}
console.log("Rate Plain tests passed.");
