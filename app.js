(function () {
  "use strict";
  let POLICY = null;
  let BOND5 = null;

  function last(obs) { return obs[obs.length - 1]; }

  function drawChart(canvas, seriesA, seriesB) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 640;
    const cssH = 260;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pad = { l: 44, r: 16, t: 16, b: 36 };
    const vals = [...seriesA.map((p) => p.v), ...seriesB.map((p) => p.v)];
    const minV = Math.min(...vals) - 0.25;
    const maxV = Math.max(...vals) + 0.25;
    const t0 = new Date(seriesA[0].d).getTime();
    const t1 = new Date(seriesA[seriesA.length - 1].d).getTime();

    function x(d) {
      const t = new Date(d).getTime();
      return pad.l + ((t - t0) / (t1 - t0)) * (cssW - pad.l - pad.r);
    }
    function y(v) {
      return pad.t + (1 - (v - minV) / (maxV - minV)) * (cssH - pad.t - pad.b);
    }

    // grid
    ctx.strokeStyle = "#d7dde8";
    ctx.fillStyle = "#445066";
    ctx.font = "12px system-ui,sans-serif";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const v = minV + ((maxV - minV) * i) / 4;
      const yy = y(v);
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(cssW - pad.r, yy);
      ctx.stroke();
      ctx.fillText(v.toFixed(1) + "%", 4, yy + 4);
    }

    function strokeSeries(series, color) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      series.forEach((p, i) => {
        const xx = x(p.d);
        const yy = y(p.v);
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      });
      ctx.stroke();
    }

    strokeSeries(seriesA, "#011F5B");
    strokeSeries(seriesB, "#990000");

    // x labels
    const years = {};
    seriesA.forEach((p) => {
      const yyyy = p.d.slice(0, 4);
      if (!years[yyyy]) years[yyyy] = p.d;
    });
    Object.entries(years).forEach(([yyyy, d]) => {
      ctx.fillStyle = "#445066";
      ctx.fillText(yyyy, x(d) - 10, cssH - 12);
    });
  }

  function monthsUntil(renewalDateStr) {
    const now = new Date();
    const target = new Date(renewalDateStr + "T12:00:00");
    const months =
      (target.getFullYear() - now.getFullYear()) * 12 +
      (target.getMonth() - now.getMonth());
    return months;
  }

  function plainStory() {
    const balance = Number(document.getElementById("balance").value) || 0;
    const currentRate = Number(document.getElementById("current-rate").value) || 0;
    const renewal = document.getElementById("renewal-date").value;
    const policy = last(POLICY.observations).v;
    const bond = last(BOND5.observations).v;
    const m = monthsUntil(renewal);
    const policyDate = last(POLICY.observations).d;

    // Illustrative payment change using a simple interest-only monthly sketch on the balance.
    // Disclosed as illustrative, not advice.
    const oldMonthly = (balance * (currentRate / 100)) / 12;
    const newAtBond = (balance * (bond / 100)) / 12;
    const delta = newAtBond - oldMonthly;

    const when =
      m <= 0
        ? "Your renewal date is today or has passed on this calendar."
        : m === 1
        ? "You have about 1 month until the renewal date you entered."
        : `You have about ${m} months until the renewal date you entered.`;

    const direction =
      delta > 25
        ? `If a new rate near the latest 5-year benchmark bond yield (${bond.toFixed(2)}%) applied to the same balance, a simple interest-only sketch would be about $${Math.abs(delta).toFixed(0)} higher per month than your current rate sketch.`
        : delta < -25
        ? `If a new rate near the latest 5-year benchmark bond yield (${bond.toFixed(2)}%) applied to the same balance, a simple interest-only sketch would be about $${Math.abs(delta).toFixed(0)} lower per month than your current rate sketch.`
        : `A simple interest-only sketch near the latest 5-year benchmark bond yield (${bond.toFixed(2)}%) lands close to your current rate sketch.`;

    document.getElementById("story").innerHTML = `
      <p><strong>Policy rate context.</strong> The Bank of Canada target for the overnight rate was <strong>${policy.toFixed(2)}%</strong> on <strong>${policyDate}</strong> (series V39079).</p>
      <p><strong>Your timeline.</strong> ${when}</p>
      <p><strong>Plain next steps (general information only).</strong></p>
      <ol>
        <li>Find your renewal letter and write down the date, the balance, and any rate options listed.</li>
        <li>Compare those options to public benchmarks such as the BoC policy rate and the 5-year benchmark bond yield shown here.</li>
        <li>If the numbers are unclear, ask your lender to explain each option in writing before you sign.</li>
        <li>Build a buffer for the first months after renewal in case the payment rises.</li>
      </ol>
      <p>${direction}</p>
      <p class="meta">This page is general public information using Bank of Canada series. It is not advice, not an offer, and not a payment quote. Real payments depend on amortization, product type and lender terms.</p>
    `;

    document.getElementById("kpi-policy").textContent = policy.toFixed(2) + "%";
    document.getElementById("kpi-bond").textContent = bond.toFixed(2) + "%";
    document.getElementById("kpi-policy-date").textContent = "as of " + policyDate;
    document.getElementById("kpi-bond-date").textContent = "as of " + last(BOND5.observations).d;
  }

  async function init() {
    POLICY = await (await fetch("data/policy-rate.json")).json();
    BOND5 = await (await fetch("data/bond-5yr.json")).json();
    const canvas = document.getElementById("chart");
    drawChart(canvas, POLICY.observations, BOND5.observations);
    window.addEventListener("resize", () => drawChart(canvas, POLICY.observations, BOND5.observations));
    ["balance", "current-rate", "renewal-date"].forEach((id) =>
      document.getElementById(id).addEventListener("input", plainStory)
    );
    // default renewal ~6 months out
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    document.getElementById("renewal-date").value = d.toISOString().slice(0, 10);
    plainStory();
    document.getElementById("source-line").textContent =
      `Cached from ${POLICY.source.name} on ${POLICY.source.retrievedEt} ET. Live URLs cited below.`;
  }

  window.RatePlain = { monthsUntil };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
