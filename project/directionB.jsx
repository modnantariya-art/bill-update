/* directionB.jsx — "ตารางเปรียบเทียบเข้ม" (dense data grid for managers) */

function MiniStrip({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 18px', borderRight: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 11.5, color: C.ink2 }}>{label}</span>
      <span className="num" style={{ fontSize: 22, fontWeight: 600, color: color || C.ink, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

function Th({ children, align = 'right', w }) {
  return <th style={{ textAlign: align, padding: '10px 14px', fontSize: 11.5, fontWeight: 600, color: C.ink3, whiteSpace: 'nowrap', width: w }}>{children}</th>;
}

function GridTable({ rows, totals, SYSTEM, dense }) {
  const max = Math.max(...rows.map((d) => d.baseline));
  const Td = ({ children, align = 'right', color, bold }) => (
    <td className="num" style={{ textAlign: align, padding: dense ? '9px 14px' : '11px 14px', fontSize: 13.5, color: color || C.ink, fontWeight: bold ? 600 : 500, whiteSpace: 'nowrap' }}>{children}</td>
  );
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: C.surface2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <Th align="left" w={70}>DC</Th>
          <Th align="left">ศูนย์กระจายสินค้า</Th>
          <Th>ตั้งต้น</Th>
          <Th>หายไป</Th>
          <Th>ใหม่</Th>
          <Th>ปัจจุบัน</Th>
          <Th w={120}>แนวโน้ม</Th>
          <Th w={120}>เปลี่ยนแปลง</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d, i) => (
          <tr key={d.code} style={{ borderBottom: `1px solid ${C.line2}`, background: i % 2 ? C.surface2 : C.surface }}>
            <td style={{ padding: dense ? '7px 14px' : '9px 14px' }}><DCBadge code={d.code} /></td>
            <td style={{ padding: dense ? '7px 14px' : '9px 14px', fontSize: 13.5, fontWeight: 600 }}>
              {d.name}<span style={{ color: C.ink3, fontWeight: 400, fontSize: 12 }}>{'  ·  '}{d.region}</span>
            </td>
            <Td color={C.ink3}>{fmt(d.baseline)}</Td>
            <Td color={C.green} bold>−{fmt(d.cleared)}</Td>
            <Td color={C.red} bold>+{fmt(d.added)}</Td>
            <Td bold>{fmt(d.current)}</Td>
            <td style={{ padding: '0 14px', width: 120 }}>
              <CompareBars baseline={d.baseline} current={d.current} max={max} labels={false} height={5} gap={3} />
            </td>
            <td style={{ padding: dense ? '7px 14px' : '9px 14px', textAlign: 'right' }}><DeltaPill value={d.net} showPct base={d.baseline} size="sm" /></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ borderTop: `2px solid ${C.blueEdge}`, background: C.blueSoft }}>
          <td colSpan={2} style={{ padding: '12px 14px', fontSize: 13.5, fontWeight: 700, color: C.blueDeep }}>รวม {SYSTEM.dcCount} DC</td>
          <Td color={C.blueDeep} bold>{fmt(SYSTEM.baseline)}</Td>
          <Td color={C.green} bold>−{fmt(SYSTEM.cleared)}</Td>
          <Td color={C.red} bold>+{fmt(SYSTEM.added)}</Td>
          <Td color={C.blueDeep} bold>{fmt(SYSTEM.current)}</Td>
          <td />
          <td style={{ padding: '12px 14px', textAlign: 'right' }}><DeltaPill value={SYSTEM.current - SYSTEM.baseline} showPct base={SYSTEM.baseline} /></td>
        </tr>
      </tfoot>
    </table>
  );
}

function DesktopB() {
  const { dcs, totals, SYSTEM } = window.DCDATA;
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 1000, background: C.bg }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>บ</div>
          <span style={{ fontSize: 15.5, fontWeight: 700 }}>เปรียบเทียบสถานะบิลคงค้าง · ราย DC</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SnapChip label="ตั้งต้น" date="31 พ.ค." />
          <span style={{ color: C.ink3 }}>→</span>
          <SnapChip label="ใหม่" date="09 มิ.ย." tone="new" />
        </div>
      </div>

      {/* compact KPI strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex' }}>
          <MiniStrip label="คงค้างตั้งต้น" value={fmt(SYSTEM.baseline)} color={C.ink} />
          <MiniStrip label="หายไป (เคลียร์)" value={`−${fmt(SYSTEM.cleared)}`} color={C.green} />
          <MiniStrip label="บิลใหม่" value={`+${fmt(SYSTEM.added)}`} color={C.red} />
          <MiniStrip label="คงค้างปัจจุบัน" value={fmt(SYSTEM.current)} color={C.blue} />
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 18 }}><DeltaPill value={SYSTEM.current - SYSTEM.baseline} showPct base={SYSTEM.baseline} /></div>
        </div>
        <SyncChip />
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px', background: C.surface2, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, width: 260, color: C.ink3, fontSize: 13 }}>
          <span style={{ fontSize: 14 }}>⌕</span> ค้นหา DC หรือ เลขที่บิล…
        </div>
        {['ทุกภูมิภาค', 'เหนือบน', 'เหนือล่าง'].map((t, i) => (
          <span key={t} style={{ padding: '7px 13px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: i === 0 ? C.blue : C.surface, color: i === 0 ? '#fff' : C.ink2, border: `1px solid ${i === 0 ? C.blue : C.line}` }}>{t}</span>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: C.ink3 }}>แสดง {dcs.length} จาก {SYSTEM.dcCount} DC</span>
      </div>

      <div style={{ padding: '0 0 4px' }}>
        <GridTable rows={dcs} totals={totals} SYSTEM={SYSTEM} />
      </div>
    </div>
  );
}

function MobileB() {
  const { dcs, SYSTEM } = window.DCDATA;
  const Cell = ({ label, value, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', flex: 1 }}>
      <span className="num" style={{ fontSize: 15, fontWeight: 600, color: color || C.ink }}>{value}</span>
      <span style={{ fontSize: 10, color: C.ink3 }}>{label}</span>
    </div>
  );
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 844, background: C.bg }}>
      <div style={{ padding: '14px 16px', background: C.surface, borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>เทียบบิลคงค้าง</span>
          <span style={{ fontSize: 11.5, color: C.ink3 }}>31 พ.ค. → 09 มิ.ย.</span>
        </div>
        <div style={{ display: 'flex', background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 8px' }}>
          <Cell label="ตั้งต้น" value={fmt(SYSTEM.baseline)} />
          <Cell label="หายไป" value={`−${fmt(SYSTEM.cleared)}`} color={C.green} />
          <Cell label="ใหม่" value={`+${fmt(SYSTEM.added)}`} color={C.red} />
          <Cell label="ปัจจุบัน" value={fmt(SYSTEM.current)} color={C.blue} />
        </div>
      </div>

      {/* column header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 60px', gap: 6, padding: '9px 16px', fontSize: 10.5, color: C.ink3, fontWeight: 600, borderBottom: `1px solid ${C.line}` }}>
        <span>DC</span>
        <span style={{ textAlign: 'right' }}>หาย</span>
        <span style={{ textAlign: 'right' }}>ใหม่</span>
        <span style={{ textAlign: 'right' }}>ปัจจุบัน</span>
      </div>
      <div>
        {dcs.slice(0, 9).map((d, i) => (
          <div key={d.code} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 60px', gap: 6, alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${C.line2}`, background: i % 2 ? C.surface2 : C.surface }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <DCBadge code={d.code} />
              <span style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            </div>
            <span className="num" style={{ textAlign: 'right', fontSize: 13, color: C.green, fontWeight: 600 }}>−{d.cleared}</span>
            <span className="num" style={{ textAlign: 'right', fontSize: 13, color: C.red, fontWeight: 600 }}>+{d.added}</span>
            <span className="num" style={{ textAlign: 'right', fontSize: 13.5, fontWeight: 600 }}>{fmt(d.current)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 60px', gap: 6, alignItems: 'center', padding: '12px 16px', background: C.blueSoft, borderTop: `2px solid ${C.blueEdge}` }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.blueDeep }}>รวม {SYSTEM.dcCount} DC</span>
        <span className="num" style={{ textAlign: 'right', fontSize: 13, color: C.green, fontWeight: 700 }}>−{fmt(SYSTEM.cleared)}</span>
        <span className="num" style={{ textAlign: 'right', fontSize: 13, color: C.red, fontWeight: 700 }}>+{fmt(SYSTEM.added)}</span>
        <span className="num" style={{ textAlign: 'right', fontSize: 13.5, color: C.blueDeep, fontWeight: 700 }}>{fmt(SYSTEM.current)}</span>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopB, MobileB });
