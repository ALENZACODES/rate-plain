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

  const L = window.RatePlainLib;

  function plainStory() {
    const balance = Number(document.getElementById("balance").value) || 0;
    const currentRate = Number(document.getElementById("current-rate").value) || 0;
    const offeredRaw = document.getElementById("offered-rate").value;
    const years = Number(document.getElementById("years-left").value) || 0;
    const renewal = document.getElementById("renewal-date").value;
    const policyPt = L.latest(POLICY.observations);
    const bondPt = L.latest(BOND5.observations);
    const today = new Date().toISOString().slice(0, 10);
    const m = renewal ? L.monthsBetween(today, renewal) : null;
    const bondYear = L.yearChange(BOND5.observations);

    const when =
      m === null
        ? "Enter the renewal date from your letter to see how much time you have."
        : m < 0
        ? "The renewal date you entered has already passed."
        : m === 0
        ? "Your renewal date is less than a month away."
        : m === 1
        ? "You have about 1 month until the renewal date you entered."
        : `You have about ${m} months until the renewal date you entered.`;

    let paymentLine;
    if (offeredRaw === "") {
      paymentLine = "Type the rate offered in your renewal letter to compare monthly payments.";
    } else {
      const offered = Number(offeredRaw);
      const c = L.compare(balance, currentRate, offered, years);
      const dir = c.delta > 0.5 ? "higher" : c.delta < -0.5 ? "lower" : "about the same";
      paymentLine =
        dir === "about the same"
          ? `At ${offered.toFixed(2)}% over ${years} years, the monthly payment is about the same as at ${currentRate.toFixed(2)}% (${L.money(c.now)}).`
          : `At ${offered.toFixed(2)}% over ${years} years, the monthly payment would be about ${L.money(c.next)}, which is ${L.money(c.delta)} ${dir} than ${L.money(c.now)} at ${currentRate.toFixed(2)}%. Over a year that is about ${L.money(c.yearly)}.`;
    }

    const bondLine = bondYear
      ? `The 5-year benchmark bond yield was ${bondPt.v.toFixed(2)}% on ${bondPt.d}, compared with ${bondYear.from.v.toFixed(2)}% on ${bondYear.from.d}. Five-year fixed offers often move with this yield, though each lender sets its own rate.`
      : `The 5-year benchmark bond yield was ${bondPt.v.toFixed(2)}% on ${bondPt.d}.`;

    document.getElementById("story").innerHTML = `
      <p><strong>Policy rate context.</strong> The Bank of Canada target for the overnight rate was <strong>${policyPt.v.toFixed(2)}%</strong> on <strong>${policyPt.d}</strong> (series V39079).</p>
      <p><strong>Bond yield context.</strong> ${bondLine}</p>
      <p><strong>Your timeline.</strong> ${when}</p>
      <p><strong>Payment check.</strong> ${paymentLine}</p>
      <p><strong>Plain next steps (general information only).</strong></p>
      <ol>
        <li>Find your renewal letter and write down the date, the balance, and every rate and term it lists.</li>
        <li>Put each offered rate into the box above to see the monthly change before you choose.</li>
        <li>If an option is unclear, ask your lender to explain it in writing before you sign.</li>
        <li>If the payment goes up, plan a buffer for the first months after renewal.</li>
      </ol>
      <p class="meta">This page is general public information using Bank of Canada series. It is not advice, not an offer, and not a payment quote. Payments use the usual Canadian fixed rate convention of semi-annual compounding. Real payments depend on your lender's terms, fees, and payment frequency.</p>
    `;

    document.getElementById("kpi-policy").textContent = policyPt.v.toFixed(2) + "%";
    document.getElementById("kpi-bond").textContent = bondPt.v.toFixed(2) + "%";
    document.getElementById("kpi-policy-date").textContent = "as of " + policyPt.d;
    document.getElementById("kpi-bond-date").textContent = "as of " + bondPt.d;
  }

  async function init() {
    POLICY = await (await fetch("data/policy-rate.json")).json();
    BOND5 = await (await fetch("data/bond-5yr.json")).json();
    const canvas = document.getElementById("chart");
    drawChart(canvas, POLICY.observations, BOND5.observations);
    window.addEventListener("resize", () => drawChart(canvas, POLICY.observations, BOND5.observations));
    ["balance", "current-rate", "offered-rate", "years-left", "renewal-date"].forEach((id) =>
      document.getElementById(id).addEventListener("input", plainStory)
    );
    // default renewal ~6 months out
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    document.getElementById("renewal-date").value = d.toISOString().slice(0, 10);
    plainStory();
    document.getElementById("source-line").textContent =
      `Daily values since 2020 from the ${POLICY.source.name}, saved on ${POLICY.source.retrievedEt} (Toronto time). Source links are below.`;
  }


  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init().catch(console.error));
  } else {
    init().catch(console.error);
  }
})();
