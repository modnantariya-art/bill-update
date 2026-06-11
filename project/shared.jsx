/* shared.jsx — design system primitives shared across the 3 directions.
   Exposes helpers + small components on window. */

// ---- one-time style injection (tokens) -------------------------------------
if (typeof document !== 'undefined' && !document.getElementById('bill-tokens')) {
  const st = document.createElement('style');
  st.id = 'bill-tokens';
  st.textContent = `
    .billapp{
      --bg:#f4f6fa; --surface:#ffffff; --surface-2:#fafbfd;
      --ink:#1e2733; --ink-2:#59626f; --ink-3:#929aa7;
      --line:#e6eaf1; --line-2:#eef1f6;
      --blue:#1f5fbf; --blue-deep:#163f7c; --blue-soft:#eaf1fb; --blue-edge:#d6e2f5;
      --green:#1f8a5b; --green-soft:#e6f3ec;
      --red:#c5432f; --red-soft:#fbeae5;
      font-family:'IBM Plex Sans Thai','IBM Plex Sans',system-ui,sans-serif;
      color:var(--ink);
      -webkit-font-smoothing:antialiased;
      text-rendering:optimizeLegibility;
    }
    .billapp *{box-sizing:border-box;}
    .num{font-family:'IBM Plex Mono',ui-monospace,monospace;font-feature-settings:'tnum' 1;letter-spacing:-.01em;}
    .billapp ::selection{background:#cfe0f8;}
  `;
  document.head.appendChild(st);
}

const C = {
  bg: '#f4f6fa', surface: '#ffffff', surface2: '#fafbfd',
  ink: '#1e2733', ink2: '#59626f', ink3: '#929aa7',
  line: '#e6eaf1', line2: '#eef1f6',
  blue: '#1f5fbf', blueDeep: '#163f7c', blueSoft: '#eaf1fb', blueEdge: '#d6e2f5',
  green: '#1f8a5b', greenSoft: '#e6f3ec',
  red: '#c5432f', redSoft: '#fbeae5',
};

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// Delta pill: net<0 (fewer outstanding) is good -> green ▼ ; net>0 -> red ▲
function DeltaPill({ value, size = 'md', showPct, base }) {
  const good = value <= 0;
  const col = value === 0 ? C.ink3 : good ? C.green : C.red;
  const bg = value === 0 ? C.line2 : good ? C.greenSoft : C.redSoft;
  const arrow = value === 0 ? '–' : good ? '▼' : '▲';
  const p = showPct && base ? ` ${Math.abs(pct(value, base))}%` : '';
  const pad = size === 'sm' ? '2px 7px' : '3px 9px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <span className="num" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: pad,
      borderRadius: 999, background: bg, color: col, fontSize: fs, fontWeight: 600,
      lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: fs - 3 }}>{arrow}</span>
      {value > 0 ? '+' : value < 0 ? '−' : ''}{fmt(Math.abs(value))}{p}
    </span>
  );
}

// Two stacked compare bars (baseline vs current).
function CompareBars({ baseline, current, max, height = 7, gap = 6, labels = true }) {
  const m = max || Math.max(baseline, current, 1);
  const row = (label, val, color, track) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {labels && <span style={{ width: 30, fontSize: 11, color: C.ink3, flex: '0 0 auto' }}>{label}</span>}
      <div style={{ flex: 1, height, background: track, borderRadius: 99 }}>
        <div style={{ width: `${(val / m) * 100}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span className="num" style={{ width: 42, textAlign: 'right', fontSize: 12, color: C.ink2, flex: '0 0 auto' }}>{fmt(val)}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {row('ตั้งต้น', baseline, C.ink3, C.line2)}
      {row('ใหม่', current, C.blue, C.blueSoft)}
    </div>
  );
}

// Small DC code badge.
function DCBadge({ code, tone = 'blue' }) {
  const map = {
    blue: [C.blueSoft, C.blueDeep, C.blueEdge],
    plain: [C.surface2, C.ink2, C.line],
  };
  const [bg, fg, bd] = map[tone] || map.blue;
  return (
    <span className="num" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 44, height: 24, padding: '0 8px', borderRadius: 6,
      background: bg, color: fg, border: `1px solid ${bd}`,
      fontSize: 12, fontWeight: 600, letterSpacing: '.02em',
    }}>{code}</span>
  );
}

// Snapshot chip used in headers: label + date.
function SnapChip({ label, date, tone }) {
  const isNew = tone === 'new';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 1, padding: '6px 12px',
      borderRadius: 8, background: isNew ? C.blueSoft : C.surface2,
      border: `1px solid ${isNew ? C.blueEdge : C.line}`,
    }}>
      <span style={{ fontSize: 10.5, color: isNew ? C.blue : C.ink3, fontWeight: 600, letterSpacing: '.02em' }}>{label}</span>
      <span className="num" style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{date}</span>
    </div>
  );
}

// Tiny Google-Sheet sync chip.
function SyncChip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.ink3 }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: C.green, boxShadow: `0 0 0 3px ${C.greenSoft}` }} />
      ซิงก์จาก Google Sheet · 09 มิ.ย. 08:40
    </div>
  );
}

Object.assign(window, { C, fmt, pct, DeltaPill, CompareBars, DCBadge, SnapChip, SyncChip });
