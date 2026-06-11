/* directionB2.jsx — แอปแบบ 2 (มีแท็บ)
   แท็บ 1 "เปรียบเทียบกับตั้งต้น": baseline vs ไฟล์ใหม่ -> เคลียร์แล้ว / ยังคงค้าง
   แท็บ 2 "บิลคงค้างปัจจุบัน": บิลคงค้างทั้งหมดจากไฟล์ใหม่ (remaining + บิลใหม่)
   จัดกลุ่มตาม DC ปลายทาง + สถานะบิลจริง · ไม่แสดงเลขที่บิล */

const { useState: useStateB2 } = React;

const clrPct = (d) => Math.round(d.cleared / d.baseline * 100);
const failOf = (obj) => (obj.f1 || 0) + (obj.f2 || 0) + (obj.f3 || 0);

// stacked composition bar by status
function StatusBar({ st, total, height = 9, radius = 5 }) {
  const STATUSES = window.DCDATA.STATUSES;
  return (
    <div style={{ display: 'flex', width: '100%', height, borderRadius: radius, overflow: 'hidden', background: C.line2 }}>
      {STATUSES.map((s) => {
        const v = st[s.key] || 0;
        if (!v) return null;
        return <div key={s.key} title={`${s.short} · ${v}`} style={{ width: `${v / total * 100}%`, background: s.color }} />;
      })}
    </div>);

}

function StatusLegend({ columns = 1, valueOf }) {
  const STATUSES = window.DCDATA.STATUSES;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: columns > 1 ? '8px 22px' : 8 }}>
      {STATUSES.map((s) =>
      <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flex: '0 0 auto' }} />
          <span style={{ fontSize: 12.5, color: C.ink2, flex: 1, minWidth: 0 }}>{s.short}</span>
          <span className="num" style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{fmt(valueOf(s))}</span>
        </div>
      )}
    </div>);

}

function ThB2({ children, align = 'right', w }) {
  return <th style={{ textAlign: align, padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: C.ink3, whiteSpace: 'nowrap', width: w }}>{children}</th>;
}

function TdNum({ children, color, bold, sub }) {
  return (
    <td style={{ textAlign: 'right', padding: '11px 16px', whiteSpace: 'nowrap' }}>
      <div className="num" style={{ fontSize: 14, color: color || C.ink, fontWeight: bold ? 600 : 500 }}>{children}</div>
      {sub && <div className="num" style={{ fontSize: 11, color: C.ink3, marginTop: 1 }}>{sub}</div>}
    </td>);

}

// expand panel: status breakdown (no bill numbers)
function StatusDetail({ d, stObj, total, title, showCleared, compact }) {
  const STATUSES = window.DCDATA.STATUSES;
  const failTotal = failOf(stObj);
  return (
    <div style={{ background: 'linear-gradient(180deg,#f7faff,#fff)', borderBottom: `2px solid ${C.blueEdge}`, padding: compact ? '12px 16px 14px' : '16px 24px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{title} · {d.code} {d.name}</span>
        <span className="num" style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: C.blueSoft, borderRadius: 99, padding: '2px 9px' }}>{fmt(total)} บิล</span>
        {showCleared && <span style={{ fontSize: 12, color: C.ink3 }}>· เคลียร์แล้ว {fmt(d.cleared)} ({clrPct(d)}%)</span>}
        {failTotal > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: C.red, background: C.redSoft, borderRadius: 99, padding: '2px 9px' }}>ส่งไม่ได้ {fmt(failTotal)} บิล</span>}
      </div>
      <div style={{ marginBottom: 14 }}><StatusBar st={stObj} total={total} height={12} /></div>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
        {STATUSES.map((s, i) => {
          const v = stObj[s.key] || 0;
          const p = Math.round(v / total * 100);
          return (
            <div key={s.key} style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 64px' : '20px 1fr 220px 64px 56px', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i ? `1px solid ${C.line2}` : 'none' }}>
              {!compact && <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {compact && <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flex: '0 0 auto' }} />}
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.short}</span>
                </div>
                <span className="num" style={{ fontSize: 11, color: C.ink3 }}>{s.code}</span>
              </div>
              {!compact &&
              <div style={{ height: 6, background: C.line2, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${p}%`, height: '100%', background: s.color, borderRadius: 99 }} />
                </div>
              }
              {!compact && <span className="num" style={{ textAlign: 'right', fontSize: 12.5, color: C.ink3 }}>{p}%</span>}
              <span className="num" style={{ textAlign: 'right', fontSize: 15, fontWeight: 600, color: v ? C.ink : C.ink3 }}>{fmt(v)}</span>
            </div>);

        })}
      </div>
    </div>);

}

// ---- shared chrome --------------------------------------------------------
function TopBar({ tab }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>บ</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 15.5, fontWeight: 700 }}>สถานะบิลคงค้าง · ราย DC </span>
          <span style={{ fontSize: 11.5, color: C.ink3 }}>{tab === 'compare' ? 'ยึดเลขที่บิลจากไฟล์ตั้งต้น · บิลที่ไม่พบในไฟล์ใหม่ = เคลียร์แล้ว' : 'บิลคงค้างทั้งหมดจากไฟล์ใหม่ (ข้อมูลล่าสุด)'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {tab === 'compare' ?
        <React.Fragment>
            <SnapChip label="ไฟล์ตั้งต้น" date="31 พ.ค." />
            <span style={{ color: C.ink3 }}>→</span>
            <SnapChip label="ไฟล์ใหม่" date="09 มิ.ย." tone="new" />
          </React.Fragment> :

        <SnapChip label="ไฟล์ใหม่ (ล่าสุด)" date="09 มิ.ย. 2026" tone="new" />
        }
      </div>
    </div>);

}

function TabBar({ tab, setTab, mobile }) {
  const tabs = [
  { id: 'compare', label: 'เปรียบเทียบการเปลี่ยนแปลง' },
  { id: 'current', label: 'บิลคงค้างปัจจุบัน' }];

  return (
    <div style={{ display: 'flex', gap: mobile ? 0 : 4, padding: mobile ? '0 12px' : '0 24px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: mobile ? 1 : '0 0 auto', appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
            padding: mobile ? '13px 8px' : '13px 16px', fontFamily: 'inherit', fontSize: mobile ? 13.5 : 14,
            fontWeight: active ? 700 : 500, color: active ? C.blue : C.ink2,
            borderBottom: `2.5px solid ${active ? C.blue : 'transparent'}`, marginBottom: -1
          }}>{t.label}</button>);

      })}
    </div>);

}

function FilterBar({ dcs, SYSTEM }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px', background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, width: 220, color: C.ink3, fontSize: 13 }}>
        <span style={{ fontSize: 14 }}>⌕</span> ค้นหา DC…
      </div>
      {['ทุกภูมิภาค', 'กลาง', 'เหนือ', 'อีสาน', 'ใต้', 'ตะวันออก'].map((t, i) =>
      <span key={t} style={{ padding: '7px 13px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: i === 0 ? C.blue : C.surface, color: i === 0 ? '#fff' : C.ink2, border: `1px solid ${i === 0 ? C.blue : C.line}` }}>{t}</span>
      )}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 12.5, color: C.ink3 }}>แสดง {dcs.length} จาก {SYSTEM.dcCount} DC</span>
    </div>);

}

function KpiBlock({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '18px 28px', borderRight: `1px solid ${C.line}` }}>
      {items.map((it, i) =>
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: i === 0 ? '0 24px 0 0' : '0 24px', borderRight: i < items.length - 1 ? `1px solid ${C.line}` : 'none' }}>
          <span style={{ fontSize: 12, color: C.ink2, whiteSpace: 'nowrap' }}>{it.label}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="num" style={{ fontSize: 27, fontWeight: 600, lineHeight: 1, color: it.color || C.ink }}>{it.value}</span>
            {it.tag && <span className="num" style={{ fontSize: 12, fontWeight: 600, color: it.color }}>{it.tag}</span>}
          </div>
        </div>
      )}
    </div>);

}

function StatusSummary({ stObj, total, title }) {
  return (
    <div style={{ padding: '14px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink2 }}>{title}</span>
        <SyncChip />
      </div>
      <div style={{ marginBottom: 11 }}><StatusBar st={stObj} total={total} height={10} /></div>
      <StatusLegend columns={3} valueOf={(s) => stObj[s.key]} />
    </div>);

}

// ---- DESKTOP --------------------------------------------------------------
function SortTh({ label, k, sort, setSort, align = 'right', w }) {
  const active = sort.key === k;
  const arrow = active ? sort.dir === 'asc' ? '▲' : '▼' : '⇅';
  return (
    <th onClick={() => setSort((s) => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : 'desc' }))}
    style={{ cursor: 'pointer', textAlign: align, padding: '10px 16px', fontSize: 11.5, fontWeight: 600, color: active ? C.blue : C.ink3, whiteSpace: 'nowrap', width: w, userSelect: 'none' }}>
      {label}<span style={{ marginLeft: 5, fontSize: 9, color: active ? C.blue : C.line }}>{arrow}</span>
    </th>);

}

function CompareDesktop() {
  const { dcs, SYSTEM } = window.DCDATA;
  const [open, setOpen] = useStateB2(null);
  const [ptype, setPtype] = useStateB2('all');
  const [sort, setSort] = useStateB2({ key: 'remaining', dir: 'desc' });
  const T = (d) => d.byType[ptype];
  const S = SYSTEM.byType[ptype];
  const counts = { all: SYSTEM.byType.all.baseline, gen: SYSTEM.byType.gen.baseline, cold: SYSTEM.byType.cold.baseline };
  const sorted = [...dcs].sort((a, b) => {
    if (sort.key === 'name') return sort.dir === 'asc' ? a.name.localeCompare(b.name, 'th') : b.name.localeCompare(a.name, 'th');
    return sort.dir === 'asc' ? T(a)[sort.key] - T(b)[sort.key] : T(b)[sort.key] - T(a)[sort.key];
  });
  return (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 28px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <ProductTabs value={ptype} onChange={setPtype} counts={counts} big />
      </div>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <KpiBlock items={[
        { label: 'บิลตั้งต้น', value: fmt(S.baseline) },
        { label: 'เคลียร์แล้ว', value: `−${fmt(S.cleared)}`, color: C.green, tag: `${pct(S.cleared, S.baseline)}%` },
        { label: 'ยังคงค้าง', value: fmt(S.remaining), color: C.blue }]
        } />
      </div>
      <FilterBar dcs={dcs} SYSTEM={SYSTEM} />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
            <SortTh label="DC ปลายทาง" k="name" sort={sort} setSort={setSort} align="left" />
            <SortTh label="บิลตั้งต้น" k="baseline" sort={sort} setSort={setSort} w={130} />
            <SortTh label="เคลียร์แล้ว" k="cleared" sort={sort} setSort={setSort} w={150} />
            <SortTh label="ยังคงค้าง" k="remaining" sort={sort} setSort={setSort} w={130} />
            <ThB2 w={46}></ThB2>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => {
            const isOpen = open === d.code;
            const t = T(d);
            const clr = t.baseline ? Math.round(t.cleared / t.baseline * 100) : 0;
            return (
              <React.Fragment key={d.code}>
                <tr onClick={() => setOpen(isOpen ? null : d.code)} style={{ borderBottom: `1px solid ${C.line2}`, background: isOpen ? C.blueSoft : i % 2 ? C.surface2 : C.surface, cursor: 'pointer' }}>
                  <td style={{ padding: '11px 16px', fontSize: 14, fontWeight: 600 }}>{d.name}</td>
                  <TdNum color={C.ink3}>{fmt(t.baseline)}</TdNum>
                  <TdNum color={C.green} bold sub={`${clr}%`}>−{fmt(t.cleared)}</TdNum>
                  <TdNum color={C.blue} bold>{fmt(t.remaining)}</TdNum>
                  <td style={{ padding: '9px 16px', textAlign: 'center', color: C.ink3, fontSize: 13, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</td>
                </tr>
                {isOpen && <tr style={{ background: '#fff' }}><td colSpan={5} style={{ padding: 0 }}><StatusDetail d={{ ...d, baseline: t.baseline, cleared: t.cleared }} stObj={t.st} total={t.remaining} title="ยังคงค้าง แยกตามสถานะบิล" showCleared /></td></tr>}
              </React.Fragment>);

          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${C.blueEdge}`, background: C.blueSoft }}>
            <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: C.blueDeep }}>รวม {SYSTEM.dcCount} DC</td>
            <td className="num" style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.blueDeep }}>{fmt(S.baseline)}</td>
            <td className="num" style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.green }}>−{fmt(S.cleared)}</td>
            <td className="num" style={{ padding: '13px 16px', textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.blue }}>{fmt(S.remaining)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </React.Fragment>);

}

// status lookup + product-type chips/buttons (current tab)
function smeta(key) {return window.DCDATA.STATUSES.find((s) => s.key === key);}

function ProductChip({ type }) {
  const cold = type === 'cold';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: cold ? C.blueSoft : C.surface2, color: cold ? C.blue : C.ink2, border: `1px solid ${cold ? C.blueEdge : C.line}` }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: cold ? C.blue : C.ink3 }} />
      {cold ? 'Coldchain' : 'ทั่วไป'}
    </span>);

}

function ProductTabs({ value, onChange, counts, big }) {
  const opts = [{ id: 'all', label: 'ทั้งหมด' }, { id: 'gen', label: 'สินค้าทั่วไป' }, { id: 'cold', label: 'สินค้า Coldchain' }];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {opts.map((o) => {
        const a = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            appearance: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            padding: big ? '9px 15px' : '7px 12px', borderRadius: 9, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
            background: a ? C.blue : C.surface, color: a ? '#fff' : C.ink2, border: `1px solid ${a ? C.blue : C.line}`
          }}>
            {o.label}
            <span className="num" style={{ fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: a ? 'rgba(255,255,255,.22)' : C.surface2, color: a ? '#fff' : C.ink3 }}>{fmt(counts[o.id])}</span>
          </button>);

      })}
    </div>);

}

function curObjOf(ptype) {
  const { SYSTEM } = window.DCDATA;
  return ptype === 'gen' ? SYSTEM.curGen : ptype === 'cold' ? SYSTEM.curCold : SYSTEM.cur;
}
function curCounts() {
  const { SYSTEM } = window.DCDATA;
  return { all: SYSTEM.curTotal, gen: SYSTEM.curGenTotal, cold: SYSTEM.curColdTotal };
}

// pivot field selector by product type
function pcell(cell, ptype) {return ptype === 'gen' ? cell.gen : ptype === 'cold' ? cell.cold : cell.total;}
function prow(row, ptype) {return ptype === 'gen' ? row.totGen : ptype === 'cold' ? row.totCold : row.tot;}

function CurrentDesktop() {
  const { SYSTEM, DATES, matrix, colTot, grand } = window.DCDATA;
  const [ptype, setPtype] = useStateB2('all');
  const counts = curCounts();
  const curObj = curObjOf(ptype);
  const curTot = counts[ptype];
  const tLabel = ptype === 'all' ? '' : ptype === 'gen' ? ' · ทั่วไป' : ' · Coldchain';
  const grandTot = prow({ totGen: grand.gen, totCold: grand.cold, tot: grand.total }, ptype);
  return (
    <React.Fragment>
      {/* product-type buttons */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 28px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <ProductTabs value={ptype} onChange={setPtype} counts={counts} big />
      </div>
      <FilterBar dcs={matrix} SYSTEM={SYSTEM} />
      {/* pivot: DC ปลายทาง × วันที่บิล */}
      <div style={{ padding: '10px 28px 4px', fontSize: 12, color: C.ink3 }}>จำนวนบิลคงค้าง แยกตาม DC ปลายทาง × วันที่บิล (มิ.ย. 69)</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
              <ThB2 align="left" w={220}>DC ปลายทาง</ThB2>
              {DATES.map((d) => <ThB2 key={d} w={66}><div className="num" style={{ fontWeight: 600, color: C.ink2 }}>{d}</div><div style={{ fontWeight: 400, fontSize: 10, color: C.ink3, marginTop: 1 }}>มิ.ย.</div></ThB2>)}
              <ThB2 w={92}>รวม</ThB2>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rt = prow(row, ptype);
              return (
                <tr key={row.code} style={{ borderBottom: `1px solid ${C.line2}`, background: i % 2 ? C.surface2 : C.surface }}>
                  <td style={{ padding: '10px 16px', fontSize: 14, fontWeight: 600 }}>{row.name}</td>
                  {row.cells.map((cell, ci) => {
                    const v = pcell(cell, ptype);
                    return <td key={ci} className="num" style={{ textAlign: 'right', padding: '10px 16px', fontSize: 13.5, color: v ? C.ink2 : C.line }}>{v ? fmt(v) : '·'}</td>;
                  })}
                  <td className="num" style={{ textAlign: 'right', padding: '10px 16px', fontSize: 14, fontWeight: 700, color: C.blue, background: C.blueSoft }}>{fmt(rt)}</td>
                </tr>);

            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.blueEdge}`, background: C.blueSoft }}>
              <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: C.blueDeep }}>รวม {SYSTEM.dcCount} DC</td>
              {colTot.map((ct, ci) =>
              <td key={ci} className="num" style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13.5, fontWeight: 700, color: C.blueDeep }}>{fmt(pcell(ct, ptype))}</td>
              )}
              <td className="num" style={{ textAlign: 'right', padding: '12px 16px', fontSize: 14, fontWeight: 800, color: C.blueDeep }}>{fmt(grandTot)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderTop: `1px solid ${C.line}`, background: C.surface }}>
        <span style={{ fontSize: 12.5, color: C.ink3 }}>แสดง {matrix.length} DC · ตัวอย่างจาก <span className="num" style={{ fontWeight: 600, color: C.ink2 }}>{fmt(SYSTEM.dcCount)}</span> DC</span>
      </div>
    </React.Fragment>);

}

function CurrentMobile() {
  const { DATES, matrix, colTot, grand, SYSTEM } = window.DCDATA;
  const [ptype, setPtype] = useStateB2('all');
  const [q, setQ] = useStateB2('');
  const counts = curCounts();
  const curObj = curObjOf(ptype);
  const curTot = counts[ptype];
  const grandTot = prow({ totGen: grand.gen, totCold: grand.cold, tot: grand.total }, ptype);
  const fmatrix = matrix.filter((row) => matchDC(row, q));
  const stickyL = { position: 'sticky', left: 0, zIndex: 1 };
  return (
    <React.Fragment>
      <div style={{ padding: '12px 16px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ marginBottom: 12 }}><ProductTabs value={ptype} onChange={setPtype} counts={counts} /></div>
        <MobileSearch q={q} setQ={setQ} shown={fmatrix.length} total={SYSTEM.dcCount} />
      </div>
      <div style={{ padding: '10px 16px', fontSize: 11, color: C.ink3, background: C.surface2, borderBottom: `1px solid ${C.line}` }}>จำนวนบิลคงค้าง · DC ปลายทาง × วันที่บิล — ปัดซ้าย–ขวาเพื่อดูทุกวัน</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
          <thead>
            <tr style={{ background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
              <th style={{ ...stickyL, background: C.surface2, textAlign: 'left', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: C.ink3, whiteSpace: 'nowrap' }}>DC ปลายทาง</th>
              {DATES.map((d) => <th key={d} style={{ textAlign: 'right', padding: '8px 10px', fontSize: 11, fontWeight: 600, color: C.ink3, whiteSpace: 'nowrap' }}><div className="num" style={{ color: C.ink2 }}>{d}</div><div style={{ fontWeight: 400, fontSize: 9, color: C.ink3 }}>มิ.ย.</div></th>)}
              <th style={{ textAlign: 'right', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: C.ink3 }}>รวม</th>
            </tr>
          </thead>
          <tbody>
            {fmatrix.map((row, i) => {
              const rt = prow(row, ptype);
              const bg = i % 2 ? C.surface2 : C.surface;
              return (
                <tr key={row.code} style={{ borderBottom: `1px solid ${C.line2}`, background: bg }}>
                  <td style={{ ...stickyL, background: bg, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.name}</td>
                  {row.cells.map((cell, ci) => {
                    const v = pcell(cell, ptype);
                    return <td key={ci} className="num" style={{ textAlign: 'right', padding: '9px 10px', fontSize: 12.5, color: v ? C.ink2 : C.line }}>{v ? fmt(v) : '·'}</td>;
                  })}
                  <td className="num" style={{ textAlign: 'right', padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: C.blue, background: C.blueSoft }}>{fmt(rt)}</td>
                </tr>);

            })}
            {fmatrix.length === 0 &&
            <tr><td colSpan={DATES.length + 2} style={{ padding: '34px 16px', textAlign: 'center', fontSize: 13, color: C.ink3 }}>ไม่พบ DC ที่ตรงกับ “{q}”</td></tr>
            }
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.blueEdge}`, background: C.blueSoft }}>
              <td style={{ ...stickyL, background: C.blueSoft, padding: '11px 14px', fontSize: 12.5, fontWeight: 700, color: C.blueDeep, whiteSpace: 'nowrap' }}>รวม {matrix.length} DC</td>
              {colTot.map((ct, ci) => <td key={ci} className="num" style={{ textAlign: 'right', padding: '11px 10px', fontSize: 12, fontWeight: 700, color: C.blueDeep }}>{fmt(pcell(ct, ptype))}</td>)}
              <td className="num" style={{ textAlign: 'right', padding: '11px 14px', fontSize: 12.5, fontWeight: 800, color: C.blueDeep }}>{fmt(grandTot)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </React.Fragment>);

}

function DesktopB2() {
  const [tab, setTab] = useStateB2('compare');
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 1180, background: C.bg }}>
      <TopBar tab={tab} />
      <TabBar tab={tab} setTab={setTab} />
      {tab === 'compare' ? <CompareDesktop /> : <CurrentDesktop />}
    </div>);

}

// ---- MOBILE ---------------------------------------------------------------
function MobileKpi({ items }) {
  return (
    <div style={{ display: 'flex', background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 6px' }}>
      {items.map((it, i) =>
      <React.Fragment key={i}>
          {i > 0 && <div style={{ width: 1, background: C.line }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', flex: 1 }}>
            <span className="num" style={{ fontSize: 16, fontWeight: 600, color: it.color || C.ink }}>{it.value}</span>
            <span style={{ fontSize: 10, color: C.ink3 }}>{it.label}</span>
          </div>
        </React.Fragment>
      )}
    </div>);

}

// mobile search box — mirrors desktop FilterBar search
function MobileSearch({ q, setQ, shown, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.surface, border: `1px solid ${q ? C.blueEdge : C.line}`, borderRadius: 9, minWidth: 0 }}>
        <span style={{ fontSize: 15, color: C.ink3, flex: '0 0 auto' }}>⌕</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา DC…"
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, color: C.ink }} />
        {q && <span onClick={() => setQ('')} style={{ cursor: 'pointer', color: C.ink3, fontSize: 16, lineHeight: 1, flex: '0 0 auto' }}>×</span>}
      </div>
      <span className="num" style={{ fontSize: 11.5, color: C.ink3, whiteSpace: 'nowrap', flex: '0 0 auto' }}>{shown}/{total} DC</span>
    </div>);

}

function matchDC(d, q) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (d.name || '').toLowerCase().includes(s) || (d.code || '').toLowerCase().includes(s);
}

function MobileTable() {
  const { dcs, SYSTEM } = window.DCDATA;
  const [open, setOpen] = useStateB2(null);
  const [q, setQ] = useStateB2('');
  const [sort, setSort] = useStateB2({ key: 'remaining', dir: 'desc' });
  const sorted = [...dcs].sort((a, b) => {
    if (sort.key === 'name') return sort.dir === 'asc' ? a.name.localeCompare(b.name, 'th') : b.name.localeCompare(a.name, 'th');
    return sort.dir === 'asc' ? a[sort.key] - b[sort.key] : b[sort.key] - a[sort.key];
  });
  const filtered = sorted.filter((d) => matchDC(d, q));
  const sortLabel = (label, k, align = 'right') => {
    const active = sort.key === k;
    return (
      <span onClick={() => setSort((s) => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : 'desc' }))}
      style={{ textAlign: align, cursor: 'pointer', color: active ? C.blue : C.ink3, userSelect: 'none' }}>
        {label}{active ? sort.dir === 'asc' ? ' ▲' : ' ▼' : ' ⇅'}
      </span>);

  };
  return (
    <React.Fragment>
      <div style={{ padding: '12px 16px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <MobileKpi items={[
        { label: 'บิลตั้งต้น', value: fmt(SYSTEM.baseline) },
        { label: 'เคลียร์แล้ว', value: `−${fmt(SYSTEM.cleared)}`, color: C.green },
        { label: 'ยังคงค้าง', value: fmt(SYSTEM.remaining), color: C.blue }]
        } />
        <MobileSearch q={q} setQ={setQ} shown={filtered.length} total={SYSTEM.dcCount} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 16px', gap: 6, padding: '10px 16px', fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${C.line}`, background: C.surface2 }}>
        {sortLabel('DC ปลายทาง', 'name', 'left')}
        {sortLabel('เคลียร์', 'cleared')}
        {sortLabel('คงค้าง', 'remaining')}
        <span></span>
      </div>
      {filtered.map((d, i) => {
        const isOpen = open === d.code;
        return (
          <div key={d.code}>
            <div onClick={() => setOpen(isOpen ? null : d.code)} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 16px', gap: 6, alignItems: 'center', padding: '11px 16px', background: isOpen ? C.blueSoft : i % 2 ? C.surface2 : C.surface, borderBottom: `1px solid ${C.line2}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              <span className="num" style={{ textAlign: 'right', fontSize: 13.5, color: C.green, fontWeight: 600 }}>−{fmt(d.cleared)}</span>
              <span className="num" style={{ textAlign: 'right', fontSize: 13.5, color: C.blue, fontWeight: 600 }}>{fmt(d.remaining)}</span>
              <span style={{ textAlign: 'center', color: C.ink3, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
            </div>
            {isOpen && <StatusDetail d={d} stObj={d.st} total={d.remaining} title="ยังคงค้าง แยกตามสถานะ" showCleared compact />}
          </div>);

      })}
      {filtered.length === 0 &&
      <div style={{ padding: '34px 16px', textAlign: 'center', fontSize: 13, color: C.ink3, background: C.surface }}>ไม่พบ DC ที่ตรงกับ “{q}”</div>
      }
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 16px', gap: 6, alignItems: 'center', padding: '13px 16px', background: C.blueSoft, borderTop: `2px solid ${C.blueEdge}` }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.blueDeep }}>รวม {SYSTEM.dcCount} DC</span>
        <span className="num" style={{ textAlign: 'right', fontSize: 13.5, color: C.green, fontWeight: 700 }}>−{fmt(SYSTEM.cleared)}</span>
        <span className="num" style={{ textAlign: 'right', fontSize: 13.5, color: C.blue, fontWeight: 700 }}>{fmt(SYSTEM.remaining)}</span>
        <span></span>
      </div>
    </React.Fragment>);

}

function MobileB2() {
  const [tab, setTab] = useStateB2('compare');
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 1020, background: C.bg }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 5 }}>
        <TopBar tab={tab} />
        <TabBar tab={tab} setTab={setTab} mobile />
      </div>
      {tab === 'compare' ? <MobileTable /> : <CurrentMobile />}
    </div>);

}

Object.assign(window, { DesktopB2, MobileB2 });