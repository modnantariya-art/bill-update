/* directionC.jsx — "การ์ด DC" (visual, scannable card grid) */

function DCCard({ d, max }) {
  const good = d.net <= 0;
  const accent = d.net === 0 ? C.ink3 : good ? C.green : C.red;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: '100%', background: accent }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          <DCBadge code={d.code} />
          <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
        </div>
        <DeltaPill value={d.net} showPct base={d.baseline} size="sm" />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <span className="num" style={{ fontSize: 34, fontWeight: 600, lineHeight: .9, color: C.ink, letterSpacing: '-.02em' }}>{fmt(d.current)}</span>
        <span style={{ fontSize: 12, color: C.ink3, marginBottom: 3 }}>คงค้างปัจจุบัน</span>
      </div>

      <CompareBars baseline={d.baseline} current={d.current} max={max} height={7} gap={6} />

      <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
        <div style={{ flex: 1, background: C.greenSoft, borderRadius: 8, padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 10.5, color: C.green, fontWeight: 600 }}>หายไป</span>
          <span className="num" style={{ fontSize: 16, fontWeight: 600, color: C.green }}>−{d.cleared}</span>
        </div>
        <div style={{ flex: 1, background: C.redSoft, borderRadius: 8, padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 10.5, color: C.red, fontWeight: 600 }}>ใหม่</span>
          <span className="num" style={{ fontSize: 16, fontWeight: 600, color: C.red }}>+{d.added}</span>
        </div>
      </div>
    </div>
  );
}

function SummaryBanner({ SYSTEM, compact }) {
  const net = SYSTEM.current - SYSTEM.baseline;
  const Item = ({ label, value, color, pill }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: compact ? '1' : '0 0 auto' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="num" style={{ fontSize: compact ? 22 : 30, fontWeight: 600, color, lineHeight: 1 }}>{value}</span>
        {pill}
      </div>
    </div>
  );
  return (
    <div style={{
      background: `linear-gradient(100deg, ${C.blueDeep}, ${C.blue})`, borderRadius: 16, padding: compact ? '16px 18px' : '22px 28px',
      display: 'flex', alignItems: 'center', gap: compact ? 18 : 48, flexWrap: 'wrap', color: '#fff',
    }}>
      <Item label="คงค้างตั้งต้น" value={fmt(SYSTEM.baseline)} color="rgba(255,255,255,.85)" />
      <Item label="หายไป (เคลียร์)" value={`−${fmt(SYSTEM.cleared)}`} color="#9fe6c0" />
      <Item label="บิลใหม่" value={`+${fmt(SYSTEM.added)}`} color="#f6b7a5" />
      <Item label="คงค้างปัจจุบัน" value={fmt(SYSTEM.current)} color="#fff"
        pill={<span className="num" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.18)', borderRadius: 99, padding: '3px 10px' }}>▼ {fmt(Math.abs(net))} · {Math.abs(pct(net, SYSTEM.baseline))}%</span>} />
    </div>
  );
}

function DesktopC() {
  const { dcs, SYSTEM } = window.DCDATA;
  const max = Math.max(...dcs.map((d) => d.baseline));
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 1040, background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>บ</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15.5, fontWeight: 700 }}>สถานะบิลคงค้าง ราย DC</span>
            <span style={{ fontSize: 11.5, color: C.ink3 }}>เปรียบเทียบ 31 พ.ค. → 09 มิ.ย. 2026</span>
          </div>
        </div>
        <SyncChip />
      </div>

      <div style={{ padding: '24px 32px 36px' }}>
        <div style={{ marginBottom: 22 }}><SummaryBanner SYSTEM={SYSTEM} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>ราย DC <span style={{ color: C.ink3, fontWeight: 400 }}>· เรียงตามคงค้างมากสุด</span></h2>
          <span style={{ fontSize: 12.5, color: C.ink3 }}>แสดง {dcs.length} จาก {SYSTEM.dcCount} DC</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {dcs.slice(0, 12).map((d) => <DCCard key={d.code} d={d} max={max} />)}
        </div>
      </div>
    </div>
  );
}

function MobileC() {
  const { dcs, SYSTEM } = window.DCDATA;
  const max = Math.max(...dcs.map((d) => d.baseline));
  return (
    <div className="billapp" style={{ width: '100%', minHeight: 844, background: C.bg }}>
      <div style={{ padding: '14px 16px', background: C.surface, borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>บ</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>สถานะบิลคงค้าง</span>
            <span style={{ fontSize: 11, color: C.ink3 }}>31 พ.ค. → 09 มิ.ย.</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 24px' }}>
        <div style={{ marginBottom: 14 }}><SummaryBanner SYSTEM={SYSTEM} compact /></div>
        <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>ราย DC</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dcs.slice(0, 4).map((d) => <DCCard key={d.code} d={d} max={max} />)}
        </div>
        <div style={{ padding: '14px', textAlign: 'center', fontSize: 13, color: C.blue, fontWeight: 600 }}>ดูทั้งหมด {SYSTEM.dcCount} DC →</div>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopC, MobileC });
