/* directionA.jsx — "สรุป KPI + รายการ DC" (airy, summary-first) */

function KpiCard({ label, value, sub, accent, big }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14,
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent || 'transparent' }} />
      <span style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>{label}</span>
      <span className="num" style={{ fontSize: big ? 40 : 34, fontWeight: 600, lineHeight: 1, color: C.ink, letterSpacing: '-.02em' }}>{value}</span>
      <div style={{ minHeight: 22, display: 'flex', alignItems: 'center' }}>{sub}</div>
    </div>
  );
}

function DCRow({ d, max }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '64px 1fr 220px 96px', alignItems: 'center',
      gap: 16, padding: '13px 18px', borderBottom: `1px solid ${C.line2}`,
    }}>
      <DCBadge code={d.code} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
        <span style={{ fontSize: 11.5, color: C.ink3 }}>
          หายไป <span className="num" style={{ color: C.green, fontWeight: 600 }}>{d.cleared}</span>
          {'  ·  '}ใหม่ <span className="num" style={{ color: C.red, fontWeight: 600 }}>{d.added}</span>
        </span>
      </div>
      <CompareBars baseline={d.baseline} current={d.current} max={max} labels={false} height={6} gap={5} />
      <div style={{ textAlign: 'right' }}><DeltaPill value={d.net} showPct base={d.baseline} size="sm" /></div>
    </div>
  );
}

function DesktopA() {
  const { dcs, SYSTEM, cleared } = window.DCDATA;
  const max = Math.max(...dcs.map((d) => d.baseline));
  const net = SYSTEM.current - SYSTEM.baseline;
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 980, background: C.bg, padding: 0 }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 34px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>บ</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.01em' }}>เปรียบเทียบสถานะบิลคงค้าง</span>
            <span style={{ fontSize: 12, color: C.ink3 }}>ราย DC · {SYSTEM.dcCount} ศูนย์กระจายสินค้า</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SnapChip label="ข้อมูลตั้งต้น" date="31 พ.ค. 2026" />
          <span style={{ color: C.ink3, fontSize: 18 }}>→</span>
          <SnapChip label="ข้อมูลใหม่" date="09 มิ.ย. 2026" tone="new" />
        </div>
      </div>

      <div style={{ padding: '26px 34px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.ink2 }}>ภาพรวมการเปลี่ยนแปลง</h2>
          <SyncChip />
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <KpiCard label="บิลคงค้าง — ตั้งต้น" value={fmt(SYSTEM.baseline)} accent={C.ink3}
            sub={<span style={{ fontSize: 12, color: C.ink3 }}>ณ 31 พ.ค. 2026</span>} />
          <KpiCard label="บิลที่หายไป (เคลียร์แล้ว)" value={fmt(SYSTEM.cleared)} accent={C.green}
            sub={<span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{pct(SYSTEM.cleared, SYSTEM.baseline)}% ของบิลตั้งต้น</span>} />
          <KpiCard label="บิลใหม่ที่เพิ่มเข้ามา" value={fmt(SYSTEM.added)} accent={C.red}
            sub={<span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>เข้าใหม่ในรอบนี้</span>} />
          <KpiCard label="บิลคงค้าง — ปัจจุบัน" value={fmt(SYSTEM.current)} accent={C.blue} big
            sub={<DeltaPill value={net} showPct base={SYSTEM.baseline} />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22, alignItems: 'start' }}>
          {/* DC list */}
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>คงค้างราย DC</span>
              <span style={{ fontSize: 12, color: C.ink3 }}>เรียงตามคงค้างปัจจุบัน</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 220px 96px', gap: 16, padding: '9px 18px', borderBottom: `1px solid ${C.line}`, fontSize: 11, color: C.ink3, fontWeight: 600 }}>
              <span>DC</span><span>ศูนย์กระจายสินค้า</span><span>ตั้งต้น → ใหม่</span><span style={{ textAlign: 'right' }}>เปลี่ยนแปลง</span>
            </div>
            {dcs.slice(0, 10).map((d) => <DCRow key={d.code} d={d} max={max} />)}
            <div style={{ padding: '13px 18px', textAlign: 'center', fontSize: 13, color: C.blue, fontWeight: 600 }}>ดูทั้งหมด {SYSTEM.dcCount} DC →</div>
          </div>

          {/* cleared bills preview */}
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>เลขที่บิลที่หายไป</span>
                <span className="num" style={{ fontSize: 12, fontWeight: 700, color: C.green, background: C.greenSoft, borderRadius: 99, padding: '2px 8px' }}>{fmt(SYSTEM.cleared)}</span>
              </div>
              <span style={{ fontSize: 12, color: C.ink3 }}>อยู่ในตั้งต้น แต่ไม่พบในข้อมูลใหม่</span>
            </div>
            {cleared.map((b) => (
              <div key={b.bill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 18px', borderBottom: `1px solid ${C.line2}` }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span className="num" style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{b.bill}</span>
                  <span style={{ fontSize: 11.5, color: C.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.receiver}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
                  <DCBadge code={b.dest} tone="plain" />
                  <span style={{ fontSize: 11.5, color: C.green, fontWeight: 600 }}>✓ ส่งสำเร็จ</span>
                </div>
              </div>
            ))}
            <div style={{ padding: '13px 18px', textAlign: 'center', fontSize: 13, color: C.blue, fontWeight: 600 }}>ดูรายการทั้งหมด →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileA() {
  const { dcs, SYSTEM } = window.DCDATA;
  const max = Math.max(...dcs.map((d) => d.baseline));
  const net = SYSTEM.current - SYSTEM.baseline;
  const Mk = ({ label, value, color, sub }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11.5, color: C.ink2 }}>{label}</span>
      <span className="num" style={{ fontSize: 25, fontWeight: 600, lineHeight: 1, color: color || C.ink }}>{value}</span>
      {sub}
    </div>
  );
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 844, background: C.bg }}>
      <div style={{ padding: '16px 16px 12px', background: C.surface, borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>บ</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>สถานะบิลคงค้าง</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}><SnapChip label="ตั้งต้น" date="31 พ.ค." /></div>
          <span style={{ color: C.ink3 }}>→</span>
          <div style={{ flex: 1 }}><SnapChip label="ใหม่" date="09 มิ.ย." tone="new" /></div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <Mk label="คงค้างตั้งต้น" value={fmt(SYSTEM.baseline)} sub={<span style={{ fontSize: 11, color: C.ink3 }}>31 พ.ค.</span>} />
          <Mk label="คงค้างปัจจุบัน" value={fmt(SYSTEM.current)} color={C.blue} sub={<DeltaPill value={net} showPct base={SYSTEM.baseline} size="sm" />} />
          <Mk label="หายไป (เคลียร์)" value={fmt(SYSTEM.cleared)} color={C.green} sub={<span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{pct(SYSTEM.cleared, SYSTEM.baseline)}% ของตั้งต้น</span>} />
          <Mk label="บิลใหม่" value={fmt(SYSTEM.added)} color={C.red} sub={<span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>เข้าใหม่</span>} />
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '13px 14px', borderBottom: `1px solid ${C.line}`, fontSize: 13.5, fontWeight: 700 }}>คงค้างราย DC</div>
          {dcs.slice(0, 6).map((d) => (
            <div key={d.code} style={{ padding: '11px 14px', borderBottom: `1px solid ${C.line2}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <DCBadge code={d.code} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                </div>
                <DeltaPill value={d.net} size="sm" />
              </div>
              <CompareBars baseline={d.baseline} current={d.current} max={max} height={6} gap={4} />
            </div>
          ))}
          <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: C.blue, fontWeight: 600 }}>ดูทั้งหมด {SYSTEM.dcCount} DC →</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopA, MobileA });
