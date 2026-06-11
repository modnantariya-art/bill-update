/* data-live.js — fetches a Google Sheets "Publish to web" CSV and builds
   the window.DCDATA structure that directionB2.jsx expects.

   Column mapping (0-based, matches the sheet layout):
     B=1  เลขที่บิล
     C=2  วันที่บิล       ← date label, Thai BE format "DD/MM/YYYY"
     R=17 DC ปลายทาง     ← row grouping
     T=19 สถานะบิล
     Y=24 ประเภทบิล      ← "สินค้าทั่วไป" | "สินค้า Coldchain"
*/
(function () {

  const THAI_MONTHS = [
    'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
    'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.',
  ];

  // Parse Thai date "DD/MM/YYYY" where YYYY is Buddhist Era (CE + 543) → JS Date
  function parseThaiDate(str) {
    const m = str && str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    return new Date(parseInt(m[3]) - 543, parseInt(m[2]) - 1, parseInt(m[1]));
  }

  function billAgeToday(jsDate) {
    if (!jsDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today - jsDate) / 86400000));
  }

  // ── CSV parser: handles quoted fields, embedded commas, and BOM ───────────
  function parseCSV(text) {
    // Strip UTF-8 BOM that some CSV exports include
    const clean = text.replace(/^﻿/, '');
    const lines = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    return lines.map((line) => {
      const cells = []; let i = 0;
      while (i <= line.length) {
        if (line[i] === '"') {
          let v = ''; i++;
          while (i < line.length) {
            if (line[i] === '"' && line[i + 1] === '"') { v += '"'; i += 2; }
            else if (line[i] === '"') { i++; break; }
            else v += line[i++];
          }
          cells.push(v);
          if (line[i] === ',') i++;
        } else {
          const s = i;
          while (i < line.length && line[i] !== ',') i++;
          cells.push(line.slice(s, i));
          if (i < line.length) i++;
          else if (i === line.length && line[line.length - 1] === ',') cells.push('');
          else break;
        }
      }
      return cells;
    }).filter((r) => r.some((c) => c.trim()));
  }

  // Known bill statuses (shared with directionB2.jsx)
  const STATUSES = [
    { key: 's031',  code: '031',      label: 'สินค้าถึง DC ปลายทาง (รอกระจาย)',       short: 'รอกระจาย',              color: '#8c98a8' },
    { key: 's033',  code: '033',      label: 'สินค้าถึง DC ปลายทาง (ลูกค้ารับเอง)',   short: 'ลูกค้ารับเอง',          color: '#3f7fd1' },
    { key: 'f1',    code: '05101031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 1)',  short: 'ส่งไม่ได้ · ครั้งที่ 1',  color: '#e0a93f' },
    { key: 'f2',    code: '05102031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 2)',  short: 'ส่งไม่ได้ · ครั้งที่ 2',  color: '#d97a2b' },
    { key: 'f3',    code: '05103031', label: 'สินค้ารอกระจาย (ส่งไม่ได้ครั้งที่ 3)',  short: 'ส่งไม่ได้ · ครั้งที่ 3',  color: '#c5432f' },
    { key: 'clear', code: 'CLEAR',    label: 'รับบิลเข้าเคลียร์',                      short: 'เคลียร์ (มีปัญหา)',      color: '#a259d8' },
  ];
  const statusByCode = {};
  STATUSES.forEach((s) => { statusByCode[s.code] = s; });

  // ── Main builder: raw CSV text → window.DCDATA-compatible object ───────────
  function buildDCDATA(csvText) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error('ไม่พบข้อมูลในชีต (น้อยกว่า 2 แถว)');

    // Auto-detect column indices from header; fall back to known positions
    const header = rows[0].map((h) => h.trim().replace(/ /g, ' ')); // normalise NBSP
    const col = (name, fallback) => {
      // Exact match first, then contains match for slight variations
      let i = header.findIndex((h) => h === name);
      if (i === -1) i = header.findIndex((h) => h.includes(name) || name.includes(h));
      return i !== -1 ? i : fallback;
    };
    const C_DATE     = col('วันที่บิล',    2);
    const C_DC_DEST  = col('DC ปลายทาง',  17);
    const C_STATUS   = col('สถานะบิล',    19);
    const C_BILLTYPE = col('ประเภทบิล',   24);

    // ── Pass 1: collect bills per DC × date ───────────────────────────────────
    const dcMap  = {};   // dc_name → { cells: { rawDate → {gen,cold} }, st: {key→n} }
    const dateSet = new Set();
    let grandGen = 0, grandCold = 0;

    for (let i = 1; i < rows.length; i++) {
      const row  = rows[i];
      const dc   = (row[C_DC_DEST]  || '').trim();
      const date = (row[C_DATE]     || '').trim();
      const type = (row[C_BILLTYPE] || '').trim();
      const stat = (row[C_STATUS]   || '').trim();
      if (!dc || !date) continue;

      const isCold = type.includes('Coldchain');
      dateSet.add(date);

      if (!dcMap[dc]) dcMap[dc] = { cells: {}, st: {} };
      if (!dcMap[dc].cells[date]) dcMap[dc].cells[date] = { gen: 0, cold: 0 };
      if (isCold) { dcMap[dc].cells[date].cold++; grandCold++; }
      else        { dcMap[dc].cells[date].gen++;  grandGen++;  }

      const sk = (statusByCode[stat.trim()] || {}).key || 'other';
      dcMap[dc].st[sk] = (dcMap[dc].st[sk] || 0) + 1;
    }

    if (!dateSet.size) throw new Error('ไม่พบคอลัมน์ "วันที่บิล" หรือข้อมูลว่างเปล่า');

    // ── Build DATES array: sorted oldest→newest, with computed age ────────────
    const DATES = [...dateSet]
      .map((raw) => {
        const d = parseThaiDate(raw);
        return {
          key:   raw,
          day:   d ? String(d.getDate()).padStart(2, '0') : raw,
          month: d ? THAI_MONTHS[d.getMonth()] : '',
          age:   billAgeToday(d),
          ts:    d ? d.getTime() : 0,
        };
      })
      .sort((a, b) => a.ts - b.ts);   // ascending = oldest first

    // ── Build matrix ──────────────────────────────────────────────────────────
    const matrix = Object.entries(dcMap).map(([name, dc]) => {
      let totGen = 0, totCold = 0;
      const cells = DATES.map(({ key }) => {
        const c = dc.cells[key] || { gen: 0, cold: 0 };
        totGen += c.gen; totCold += c.cold;
        return { gen: c.gen, cold: c.cold, total: c.gen + c.cold };
      });
      const code = (name.match(/^(\d+)/) || ['', name])[1] || name;
      return { code, name, region: '', cells, totGen, totCold, tot: totGen + totCold, st: dc.st };
    })
      .filter((r) => r.tot > 0)
      .sort((a, b) => b.tot - a.tot);

    // Column totals
    const colTot = DATES.map((_, ci) => matrix.reduce(
      (a, row) => ({ gen: a.gen + row.cells[ci].gen, cold: a.cold + row.cells[ci].cold, total: a.total + row.cells[ci].total }),
      { gen: 0, cold: 0, total: 0 },
    ));
    const grand = matrix.reduce(
      (a, row) => ({ gen: a.gen + row.totGen, cold: a.cold + row.totCold, total: a.total + row.tot }),
      { gen: 0, cold: 0, total: 0 },
    );

    // ── SYSTEM totals ─────────────────────────────────────────────────────────
    const stTot = {};
    STATUSES.forEach((s) => { stTot[s.key] = matrix.reduce((a, d) => a + (d.st[s.key] || 0), 0); });
    const coldFrac = grand.total ? grand.cold / grand.total : 0;
    const curGen = {}, curCold = {};
    STATUSES.forEach((s) => {
      const c = Math.round((stTot[s.key] || 0) * coldFrac);
      curCold[s.key] = c;
      curGen[s.key]  = (stTot[s.key] || 0) - c;
    });

    const SYSTEM = {
      // Compare-tab fields (not populated from single sheet — kept as 0)
      baseline: 0, cleared: 0, remaining: 0,
      // Current-tab fields
      curTotal:     grand.total,
      curGenTotal:  grand.gen,
      curColdTotal: grand.cold,
      cur: stTot, curGen, curCold,
      dcCount: matrix.length, sampleCount: matrix.length,
      // Stubs so compare-tab code doesn't crash
      byType: {
        all:  { baseline: 0, cleared: 0, remaining: 0, st: {} },
        gen:  { baseline: 0, cleared: 0, remaining: 0, st: {} },
        cold: { baseline: 0, cleared: 0, remaining: 0, st: {} },
      },
    };

    // dcs array empty — compare tab requires two snapshots, not available here
    return { STATUSES, dcs: [], SYSTEM, DATES, matrix, colTot, grand, currentItems: [] };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.loadLiveData = async function (csvUrl) {
    const resp = await fetch(csvUrl);
    if (!resp.ok) {
      const hints = resp.status === 403
        ? ' — ชีตยังไม่ได้ Publish to web (ดูคำแนะนำในหน้า Setup)'
        : '';
      throw new Error(`HTTP ${resp.status}${hints}`);
    }
    return buildDCDATA(await resp.text());
  };

  // Exposed for unit testing / debugging in console
  window._buildDCDATAfromCSV = buildDCDATA;

})();
