/* mob-ideas.jsx — โจทย์: หน้า "บิลคงค้างปัจจุบัน" บนมือถือ เมื่อวันที่เยอะ (30 วัน)
   3 แนวทางวางเทียบกัน:
     A. การ์ดต่อ DC + sparkline (ไม่เลื่อนแนวนอน)
     B. Heatmap บีบคอลัมน์ (เห็นแพตเทิร์นทั้งเดือน)
     C. จัดกลุ่มตามอายุบิล (5 ช่วง)  */

const { useState: useS } = React;

// ---- mock data: 30 วัน (11 พ.ค. – 09 มิ.ย.) ------------------------------
const NDAYS = 30;
function mkDays() {
  const out = [];
  for (let i = 0; i < NDAYS; i++) {
    const day = i <= 20 ? 11 + i : i - 20;
    const month = i <= 20 ? 'พ.ค.' : 'มิ.ย.';
    out.push({ i, day, month, age: NDAYS - 1 - i, label: String(day).padStart(2, '0') });
  }
  return out;
}
const DAYS = mkDays();

function rngI(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }

const SRC = (window.DCDATA.matrix || []).slice(0, 12);
const ROWS = SRC.map((d, di) => {
  const r = rngI((di + 1) * 131 + 7);
  const cells = DAYS.map((dm) => {
    if (r() < 0.42) return 0;
    const recency = 1 + (1 - dm.age / (NDAYS - 1)) * 1.7;
    return Math.round((1 + r() * 6) * recency);
  });
  const tot = cells.reduce((a, b) => a + b, 0);
  return { code: d.code, name: d.name, region: d.region, cells, tot };
}).filter((d) => d.tot > 0).sort((a, b) => b.tot - a.tot);

const MAXCELL = Math.max(...ROWS.flatMap((d) => d.cells));
const GRAND = ROWS.reduce((a, d) => a + d.tot, 0);

// aging buckets: [1–3, 4–5, 6–7, 8–14, 15+]
const BUCKETS = [
  { label: '1–3 วัน', sub: '', test: (a) => a <= 3 },
  { label: '4–5 วัน', sub: '', test: (a) => a >= 4 && a <= 5 },
  { label: '6–7 วัน', sub: '', test: (a) => a >= 6 && a <= 7 },
  { label: '8–14 วัน', sub: '', test: (a) => a >= 8 && a <= 14 },
  { label: 'เกิน 14 วัน', sub: '15+', test: (a) => a >= 15 },
];
const BCOL = ['#1f8a5b', '#2f7fd1', '#1f5fbf', '#d98a1f', '#c5432f']; // fresh→aged
function bucketsOf(cells) {
  const b = [0, 0, 0, 0, 0];
  cells.forEach((v, i) => { if (!v) return; const a = DAYS[i].age; const bi = BUCKETS.findIndex((x) => x.test(a)); b[bi] += v; });
  return b;
}

// ---- color helpers --------------------------------------------------------
function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function lerp(a, b, t) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; }
function heat(v) {
  if (!v) return C.surface2;
  const t = Math.min(1, 0.18 + (v / MAXCELL) * 0.82);
  return lerp('#eaf1fb', '#163f7c', t);
}

// ---- shared phone chrome --------------------------------------------------
function Phone({ tag, note, children }) {
  return (
    <div className="billapp" style={{ width: '100%', minHeight: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '13px 16px 11px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: C.blue, color: '#fff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>บ</div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>บิลคงค้างปัจจุบัน</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: C.blue, background: C.blueSoft, borderRadius: 99, padding: '2px 9px' }} className="num">{fmt(GRAND)}</span>
        </div>
        <span style={{ fontSize: 11, color: C.ink3 }}>{note}</span>
      </div>
      <div style={{ padding: '9px 16px', background: '#1f2a37', color: '#cfe0f8', fontSize: 11, fontWeight: 600, letterSpacing: '.02em' }}>{tag}</div>
      {children}
    </div>
  );
}

function MiniTabs() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '11px 16px 4px', background: C.surface }}>
      {['ทั้งหมด', 'ทั่วไป', 'Coldchain'].map((t, i) =>
        <span key={t} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: i === 0 ? C.blue : C.surface, color: i === 0 ? '#fff' : C.ink2, border: `1px solid ${i === 0 ? C.blue : C.line}` }}>{t}</span>
      )}
    </div>
  );
}
function SearchRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 12px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 9, color: C.ink3, fontSize: 13 }}>⌕ ค้นหา DC…</div>
      <span className="num" style={{ fontSize: 11.5, color: C.ink3 }}>{ROWS.length}/61</span>
    </div>
  );
}

// ===========================================================================
// A. การ์ดต่อ DC + sparkline (ไม่มีเลื่อนแนวนอน)
// ===========================================================================
function Sparkline({ cells }) {
  const max = Math.max(...cells, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 26 }}>
      {cells.map((v, i) =>
        <div key={i} title={`${DAYS[i].label} ${DAYS[i].month} · ${v}`} style={{ flex: 1, height: `${Math.max(6, v / max * 100)}%`, background: v ? lerp('#9cc0ee', '#1f5fbf', v / max) : C.line2, borderRadius: 1, opacity: v ? 1 : 0.6 }} />
      )}
    </div>
  );
}
function VariantA() {
  const [open, setOpen] = useS(ROWS[0].code);
  return (
    <Phone tag="แนวทาง A · การ์ดต่อ DC + กราฟย่อ" note="แตะการ์ดเพื่อดูรายวัน · ไม่ต้องเลื่อนซ้าย–ขวา">
      <MiniTabs />
      <SearchRow />
      <div style={{ padding: '10px 14px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {ROWS.map((d) => {
          const isOpen = open === d.code;
          const nz = d.cells.map((v, i) => ({ v, d: DAYS[i] })).filter((x) => x.v).reverse();
          return (
            <div key={d.code} onClick={() => setOpen(isOpen ? null : d.code)} style={{ background: C.surface, border: `1px solid ${isOpen ? C.blueEdge : C.line}`, borderRadius: 12, padding: '12px 13px', cursor: 'pointer', boxShadow: isOpen ? '0 2px 10px rgba(31,95,191,.08)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                  <div style={{ fontSize: 10.5, color: C.ink3, marginTop: 1 }}>ค้างใน {nz.length} วัน · ล่าสุด {nz[0].d.label} {nz[0].d.month}</div>
                </div>
                <div style={{ width: 96, flex: '0 0 auto' }}><Sparkline cells={d.cells} /></div>
                <div style={{ textAlign: 'right', flex: '0 0 auto', minWidth: 42 }}>
                  <div className="num" style={{ fontSize: 19, fontWeight: 700, color: C.blue, lineHeight: 1 }}>{fmt(d.tot)}</div>
                  <div style={{ fontSize: 9.5, color: C.ink3 }}>บิล</div>
                </div>
              </div>
              {isOpen &&
                <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line2}` }}>
                  <div style={{ fontSize: 10.5, color: C.ink3, marginBottom: 8 }}>แยกตามวันที่บิล (ใหม่ → เก่า)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {nz.slice(0, 8).map((x, i) => {
                      const wmax = nz[0].v;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="num" style={{ width: 58, fontSize: 11.5, color: C.ink2, flex: '0 0 auto' }}>{x.d.label} {x.d.month}</span>
                          <div style={{ flex: 1, height: 7, background: C.line2, borderRadius: 99 }}><div style={{ width: `${x.v / wmax * 100}%`, height: '100%', background: C.blue, borderRadius: 99 }} /></div>
                          <span className="num" style={{ width: 26, textAlign: 'right', fontSize: 12.5, fontWeight: 600, flex: '0 0 auto' }}>{x.v}</span>
                        </div>
                      );
                    })}
                    {nz.length > 8 && <span style={{ fontSize: 11, color: C.ink3 }}>+ อีก {nz.length - 8} วัน</span>}
                  </div>
                </div>
              }
            </div>
          );
        })}
      </div>
    </Phone>
  );
}

// ===========================================================================
// B. Heatmap บีบคอลัมน์
// ===========================================================================
function VariantB() {
  const [sel, setSel] = useS(null);
  return (
    <Phone tag="แนวทาง B · Heatmap ทั้งเดือน" note="สีเข้ม = ค้างมาก · แตะช่องเพื่อดูตัวเลข">
      <MiniTabs />
      <SearchRow />
      <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10.5, color: C.ink3 }}>น้อย</span>
        <div style={{ flex: 1, height: 8, borderRadius: 99, background: `linear-gradient(90deg, ${C.surface2}, ${lerp('#eaf1fb', '#163f7c', .5)}, #163f7c)`, border: `1px solid ${C.line}` }} />
        <span style={{ fontSize: 10.5, color: C.ink3 }}>มาก</span>
        {sel && <span className="num" style={{ fontSize: 11.5, fontWeight: 700, color: C.blue, background: C.blueSoft, borderRadius: 99, padding: '2px 9px' }}>{sel}</span>}
      </div>
      <div style={{ overflowX: 'auto', padding: '6px 0 4px' }}>
        <table style={{ borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: C.bg, zIndex: 1, textAlign: 'left', padding: '4px 14px', fontSize: 10, fontWeight: 600, color: C.ink3 }}>DC</th>
              {DAYS.filter((_, i) => i % 3 === 0).map((dm) => <th key={dm.i} colSpan={3} style={{ fontSize: 9, fontWeight: 600, color: C.ink3, padding: '0 0 2px' }}>{dm.label}</th>)}
              <th style={{ padding: '4px 12px', fontSize: 10, fontWeight: 600, color: C.ink3 }}>รวม</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((d, ri) => (
              <tr key={d.code}>
                <td style={{ position: 'sticky', left: 0, background: ri % 2 ? C.surface2 : C.surface, zIndex: 1, padding: '0 14px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', borderRight: `1px solid ${C.line2}` }}>{d.name}</td>
                {d.cells.map((v, ci) =>
                  <td key={ci} onClick={() => setSel(v ? `${d.name} · ${DAYS[ci].label} ${DAYS[ci].month} = ${v}` : null)} style={{ padding: 0 }}>
                    <div style={{ width: 10, height: 26, background: heat(v), cursor: v ? 'pointer' : 'default' }} />
                  </td>
                )}
                <td className="num" style={{ padding: '0 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.blue, background: C.blueSoft }}>{fmt(d.tot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '8px 16px 14px', fontSize: 10.5, color: C.ink3 }}>30 วัน อัดในจอเดียว — เลื่อนเล็กน้อยเพื่อดูช่วงต้นเดือน</div>
    </Phone>
  );
}

// ===========================================================================
// C. จัดกลุ่มตามอายุบิล
// ===========================================================================
function VariantC() {
  const rows = ROWS.map((d) => ({ ...d, b: bucketsOf(d.cells) }));
  const colTot = BUCKETS.map((_, bi) => rows.reduce((a, d) => a + d.b[bi], 0));
  return (
    <Phone tag="แนวทาง C · จัดกลุ่มตามอายุบิล" note="ยุบ 30 วัน เหลือ 5 ช่วง — เห็นบิลค้างนานทันที">
      <MiniTabs />
      <SearchRow />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 40px)', gap: 0, alignItems: 'end', padding: '10px 12px 8px', background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: C.ink3 }}>DC ปลายทาง</span>
        {BUCKETS.map((b, i) =>
          <div key={i} style={{ textAlign: 'center', lineHeight: 1.15 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: C.ink2 }}>{b.label}</div>
          </div>
        )}
      </div>
      {rows.map((d, ri) => {
        const oi = d.cells.findIndex((v) => v > 0);
        const oldest = DAYS[oi];
        return (
        <div key={d.code} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 40px)', alignItems: 'center', padding: '9px 12px', background: ri % 2 ? C.surface2 : C.surface, borderBottom: `1px solid ${C.line2}` }}>
          <div style={{ minWidth: 0, paddingRight: 6 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
            <div style={{ fontSize: 10.5, color: C.ink3, marginTop: 2, whiteSpace: 'nowrap' }}>
              เก่าสุด <span className="num" style={{ color: C.ink2, fontWeight: 600 }}>{oldest.label} {oldest.month}</span> · รวม <span className="num" style={{ color: C.blue, fontWeight: 700 }}>{fmt(d.tot)}</span>
            </div>
          </div>
          {d.b.map((v, i) =>
            <span key={i} className="num" style={{ textAlign: 'center', fontSize: 12.5, fontWeight: v ? 600 : 400, color: !v ? C.line : i >= 3 ? C.red : C.ink2 }}>{v || '·'}</span>
          )}
        </div>);

      })}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 40px)', alignItems: 'center', padding: '11px 12px', background: C.blueSoft, borderTop: `2px solid ${C.blueEdge}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.blueDeep }}>รวม {rows.length} DC</span>
        {colTot.map((v, i) => <span key={i} className="num" style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.blueDeep }}>{fmt(v)}</span>)}
      </div>
    </Phone>
  );
}

Object.assign(window, { VariantA, VariantB, VariantC });
