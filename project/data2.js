/* data2.js — refined dataset using REAL statuses + DCs from the Google Sheet.
   DC dimension = "DC ปลายทาง" (col R)
   Concept:
     baseline  = บิลคงค้างของ DC ปลายทาง ใน "ไฟล์ตั้งต้น"
     cleared   = บิลที่หายไปจากไฟล์ใหม่ (เคลียร์/ปิดงานแล้ว)
     remaining = ยังคงค้าง (ยังอยู่ในไฟล์ใหม่) -> แยกตาม "สถานะบิล"
   baseline = cleared + remaining ; remaining = ผลรวมของ st{} */
(function () {
  // real bill statuses (col T), ordered ปกติ -> ส่งไม่ได้ทวีความรุนแรง
  const STATUSES = [
    { key: 's031', code: '031', label: 'สินค้าถึง DC ปลายทาง (รอกระจาย)', short: 'รอกระจาย', color: '#8c98a8' },
    { key: 's033', code: '033', label: 'สินค้าถึง DC ปลายทาง (ลูกค้ารับเอง)', short: 'ลูกค้ารับเอง', color: '#3f7fd1' },
    { key: 'f1', code: '05101031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 1)', short: 'ส่งไม่ได้ · ครั้งที่ 1', color: '#e0a93f' },
    { key: 'f2', code: '05102031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 2)', short: 'ส่งไม่ได้ · ครั้งที่ 2', color: '#d97a2b' },
    { key: 'f3', code: '05103031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 3)', short: 'ส่งไม่ได้ · ครั้งที่ 3', color: '#c5432f' },
  ];

  function mk(code, name, region, cleared, st, added) {
    const remaining = STATUSES.reduce((a, s) => a + (st[s.key] || 0), 0);
    // cur = บิลคงค้างปัจจุบันจาก“ไฟล์ใหม่”ทั้งหมด = ยังคงค้างจากตั้งต้น (remaining) + บิลใหม่ (added)
    const cur = {};
    STATUSES.forEach((s) => { cur[s.key] = (st[s.key] || 0) + ((added && added[s.key]) || 0); });
    const curTotal = STATUSES.reduce((a, s) => a + cur[s.key], 0);
    const addedTotal = curTotal - remaining;
    return { code, name, region, cleared, st, added: added || {}, cur, remaining, curTotal, addedTotal, baseline: cleared + remaining };
  }

  // real "DC ปลายทาง" values from the sheet
  const dcs = [
    mk('691', 'CDC บางนา', 'กลาง', 188, { s031: 104, s033: 31, f1: 58, f2: 44, f3: 33 }, { s031: 22, s033: 7, f1: 12, f2: 4, f3: 2 }),
    mk('321', 'DC ระยอง', 'ตะวันออก', 142, { s031: 88, s033: 24, f1: 46, f2: 38, f3: 29 }, { s031: 18, s033: 6, f1: 10, f2: 3, f3: 2 }),
    mk('621', 'DC รังสิต', 'กลาง', 124, { s031: 71, s033: 22, f1: 40, f2: 31, f3: 21 }, { s031: 15, s033: 5, f1: 8, f2: 3, f3: 1 }),
    mk('320', 'DC ชลบุรี', 'ตะวันออก', 88, { s031: 55, s033: 16, f1: 30, f2: 23, f3: 15 }, { s031: 11, s033: 4, f1: 6, f2: 2, f3: 1 }),
    mk('480', 'DC ทุ่งสง', 'ใต้', 96, { s031: 62, s033: 18, f1: 34, f2: 27, f3: 19 }, { s031: 12, s033: 4, f1: 7, f2: 2, f3: 1 }),
    mk('483', 'DC ภูเก็ต', 'ใต้', 78, { s031: 48, s033: 14, f1: 27, f2: 20, f3: 16 }, { s031: 9, s033: 3, f1: 5, f2: 2, f3: 1 }),
    mk('156', 'DC พะเยา', 'เหนือ', 71, { s031: 44, s033: 13, f1: 25, f2: 18, f3: 13 }, { s031: 9, s033: 3, f1: 5, f2: 1, f3: 1 }),
    mk('241', 'DC อุดรธานี', 'อีสาน', 67, { s031: 41, s033: 12, f1: 23, f2: 18, f3: 12 }, { s031: 8, s033: 3, f1: 4, f2: 1, f3: 1 }),
    mk('322', 'DC จันทบุรี', 'ตะวันออก', 64, { s031: 39, s033: 12, f1: 22, f2: 17, f3: 11 }, { s031: 7, s033: 2, f1: 4, f2: 1, f3: 1 }),
    mk('163', 'DC ตาก', 'เหนือ', 52, { s031: 33, s033: 9, f1: 18, f2: 13, f3: 9 }, { s031: 6, s033: 2, f1: 3, f2: 1, f3: 0 }),
    mk('490', 'DC หาดใหญ่', 'ใต้', 59, { s031: 36, s033: 11, f1: 20, f2: 15, f3: 10 }, { s031: 7, s033: 2, f1: 3, f2: 1, f3: 0 }),
    mk('624', 'DC ฉะเชิงเทรา', 'ตะวันออก', 47, { s031: 29, s033: 9, f1: 16, f2: 12, f3: 8 }, { s031: 5, s033: 2, f1: 3, f2: 1, f3: 0 }),
    mk('243', 'DC หนองคาย', 'อีสาน', 44, { s031: 27, s033: 8, f1: 15, f2: 11, f3: 8 }, { s031: 5, s033: 1, f1: 2, f2: 1, f3: 0 }),
    mk('671', 'DC กาญจนบุรี', 'กลาง', 38, { s031: 24, s033: 7, f1: 13, f2: 10, f3: 6 }, { s031: 4, s033: 1, f1: 2, f2: 1, f3: 0 }),
  ];

  // system totals (computed from the sample)
  const SYSTEM = dcs.reduce(
    (a, d) => {
      a.baseline += d.baseline; a.cleared += d.cleared; a.remaining += d.remaining;
      a.curTotal += d.curTotal; a.addedTotal += d.addedTotal;
      STATUSES.forEach((s) => {
        a.st[s.key] = (a.st[s.key] || 0) + (d.st[s.key] || 0);
        a.cur[s.key] = (a.cur[s.key] || 0) + (d.cur[s.key] || 0);
      });
      return a;
    },
    { baseline: 0, cleared: 0, remaining: 0, curTotal: 0, addedTotal: 0, st: {}, cur: {}, dcCount: 61, sampleCount: dcs.length }
  );

  // ---- product split (สินค้าทั่วไป vs สินค้า Coldchain) ~35% Coldchain ----
  const COLD = 0.35;
  function splitCold(obj) {
    const gen = {}, cold = {};
    STATUSES.forEach((s) => { const v = obj[s.key] || 0; const c = Math.round(v * COLD); cold[s.key] = c; gen[s.key] = v - c; });
    return { gen, cold };
  }
  const sp = splitCold(SYSTEM.cur);
  SYSTEM.curGen = sp.gen; SYSTEM.curCold = sp.cold;
  SYSTEM.curGenTotal = STATUSES.reduce((a, s) => a + sp.gen[s.key], 0);
  SYSTEM.curColdTotal = STATUSES.reduce((a, s) => a + sp.cold[s.key], 0);

  // ---- product-type split for the COMPARE view (baseline / cleared / remaining / st) ----
  function sumSt(obj) { return STATUSES.reduce((a, s) => a + (obj[s.key] || 0), 0); }
  function buildByType(baseline, cleared, st) {
    const remaining = sumSt(st);
    const sps = splitCold(st);
    const coldCleared = Math.round(cleared * COLD);
    const genCleared = cleared - coldCleared;
    const remGen = sumSt(sps.gen), remCold = sumSt(sps.cold);
    return {
      all: { baseline, cleared, remaining, st },
      gen: { baseline: genCleared + remGen, cleared: genCleared, remaining: remGen, st: sps.gen },
      cold: { baseline: coldCleared + remCold, cleared: coldCleared, remaining: remCold, st: sps.cold },
    };
  }
  dcs.forEach((d) => { d.byType = buildByType(d.baseline, d.cleared, d.st); });
  SYSTEM.byType = buildByType(SYSTEM.baseline, SYSTEM.cleared, SYSTEM.st);

  // ---- บิลคงค้างปัจจุบัน: pivot matrix DC ปลายทาง × วันที่บิล ----
  const DATES = ['01', '02', '03', '04', '05', '06', '07', '08']; // มิ.ย. 2569
  function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  const matrix = dcs.map((d, di) => {
    const sizeW = Math.max(2, Math.round(d.curTotal / 38));
    const r = rng((di + 1) * 97 + 13);
    let totGen = 0, totCold = 0;
    const cells = DATES.map(() => {
      if (r() < 0.12) return { gen: 0, cold: 0, total: 0 };
      const base = 1 + Math.round(r() * sizeW * 2.4);
      const cold = Math.round(base * (0.18 + r() * 0.4));
      const gen = Math.max(0, base - cold);
      totGen += gen; totCold += cold;
      return { gen, cold, total: gen + cold };
    });
    return { code: d.code, name: d.name, region: d.region, cells, totGen, totCold, tot: totGen + totCold };
  });
  // per-date column totals + grand totals
  const colTot = DATES.map((_, ci) => matrix.reduce((a, row) => {
    a.gen += row.cells[ci].gen; a.cold += row.cells[ci].cold; a.total += row.cells[ci].total; return a;
  }, { gen: 0, cold: 0, total: 0 }));
  const grand = matrix.reduce((a, row) => { a.gen += row.totGen; a.cold += row.totCold; a.total += row.tot; return a; }, { gen: 0, cold: 0, total: 0 });

  // ---- currentItems: flat list of outstanding bills (ไฟล์ใหม่) ----
  // one row = a bill currently outstanding, keyed by DC ปลายทาง + วันที่บิล + สถานะ + ประเภทสินค้า
  // (a representative sample; full count = SYSTEM.curTotal)
  const STKEYS = STATUSES.map((s) => s.key);
  function weightedPick(rand, weights) {
    const tot = weights.reduce((a, w) => a + w, 0);
    let x = rand() * tot;
    for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x <= 0) return i; }
    return weights.length - 1;
  }
  const stWeights = STKEYS.map((k) => SYSTEM.cur[k] || 1);
  const currentItems = [];
  dcs.forEach((d, di) => {
    const r = rng((di + 1) * 131 + 7);
    const n = Math.max(3, Math.round(d.curTotal / 90)); // a few sample rows per DC
    for (let i = 0; i < n; i++) {
      const dayNum = 1 + Math.floor(r() * DATES.length);        // 1..8
      const stKey = STKEYS[weightedPick(r, stWeights)];
      const type = r() < COLD ? 'cold' : 'gen';
      currentItems.push({
        code: d.code, name: d.name, region: d.region,
        date: `${String(dayNum).padStart(2, '0')} มิ.ย. 69`,
        type, stKey,
        days: 9 - dayNum,                                       // เทียบกับ 09 มิ.ย.
      });
    }
  });
  // sort: most overdue first, then by DC
  currentItems.sort((a, b) => b.days - a.days || a.code.localeCompare(b.code));

  window.DCDATA = { STATUSES, dcs, SYSTEM, DATES, matrix, colTot, grand, currentItems };
})();
