// Mock dataset for the "เปรียบเทียบสถานะบิลคงค้าง" design exploration.
// Numbers are illustrative only. Key concept:
//   baseline  = บิลคงค้าง ณ ข้อมูลตั้งต้น
//   cleared   = บิลที่หายไป (อยู่ในตั้งต้น แต่ไม่อยู่ในข้อมูลใหม่) = เคลียร์/ส่งสำเร็จ
//   added     = บิลที่เพิ่มเข้ามาใหม่ (อยู่ในใหม่ แต่ไม่อยู่ในตั้งต้น)
//   current   = baseline - cleared + added  = บิลคงค้างปัจจุบัน
//   net       = current - baseline
(function () {
  function mk(code, name, region, baseline, cleared, added) {
    const current = baseline - cleared + added;
    return { code, name, region, baseline, cleared, added, current, net: current - baseline };
  }

  // Representative subset of DCs (full system has 61).
  const dcs = [
    mk('CNX', 'เชียงใหม่ (สันทราย)', 'เหนือบน', 642, 198, 41),
    mk('PLK', 'พิษณุโลก', 'เหนือล่าง', 389, 96, 33),
    mk('CEI', 'เชียงราย', 'เหนือบน', 421, 132, 28),
    mk('NSN', 'นครสวรรค์', 'เหนือล่าง', 298, 78, 22),
    mk('LPG', 'ลำปาง', 'เหนือบน', 308, 87, 19),
    mk('NAN', 'น่าน', 'เหนือบน', 213, 63, 14),
    mk('LPN', 'ลำพูน', 'เหนือบน', 187, 54, 12),
    mk('UTD', 'อุตรดิตถ์', 'เหนือล่าง', 176, 52, 11),
    mk('TAK', 'ตาก (แม่สอด)', 'เหนือล่าง', 167, 44, 13),
    mk('PRE', 'แพร่', 'เหนือบน', 156, 41, 9),
    mk('KPT', 'กำแพงเพชร', 'เหนือล่าง', 145, 37, 10),
    mk('PYO', 'พะเยา', 'เหนือบน', 142, 38, 7),
    mk('SUK', 'สุโขทัย', 'เหนือล่าง', 134, 39, 8),
    mk('MHS', 'แม่ฮ่องสอน', 'เหนือบน', 98, 12, 29), // DC ที่แย่ลง (net +)
  ];

  const totals = dcs.reduce(
    (a, d) => ({
      baseline: a.baseline + d.baseline,
      cleared: a.cleared + d.cleared,
      added: a.added + d.added,
      current: a.current + d.current,
    }),
    { baseline: 0, cleared: 0, added: 0, current: 0 }
  );
  // Scale to the full 61-DC picture for the headline numbers.
  const SYSTEM = {
    baseline: 8432,
    cleared: 2108,
    added: 593,
    current: 6917, // 8432 - 2108 + 593
    dcCount: 61,
    sampleCount: dcs.length,
  };

  // Example "บิลที่หายไป" (cleared) — drill-down rows.
  const cleared = [
    { bill: 'NM6709-008421', date: '02/06/26', receiver: 'ร้านสมหวังการค้า', dest: 'CNX', days: 6, cod: 1850 },
    { bill: 'NM6709-008455', date: '02/06/26', receiver: 'หจก. ลานนาภัณฑ์', dest: 'CNX', days: 4, cod: 0 },
    { bill: 'NM6708-007903', date: '01/06/26', receiver: 'คุณ วิไล ตาคำ', dest: 'CEI', days: 9, cod: 540 },
    { bill: 'NM6709-008510', date: '03/06/26', receiver: 'ร้านเจริญพานิช', dest: 'PLK', days: 3, cod: 2200 },
    { bill: 'NM6708-007744', date: '31/05/26', receiver: 'บจก. ทรัพย์เพิ่มพูน', dest: 'LPG', days: 11, cod: 0 },
  ];

  // Example "บิลใหม่" (added).
  const added = [
    { bill: 'NM6710-009002', date: '08/06/26', receiver: 'คุณ ธนากร ใจดี', dest: 'CNX', days: 1, cod: 990 },
    { bill: 'NM6710-009047', date: '08/06/26', receiver: 'ร้านป้านงค์', dest: 'MHS', days: 1, cod: 0 },
    { bill: 'NM6710-009088', date: '09/06/26', receiver: 'หจก. เหนือพาณิชย์', dest: 'NAN', days: 0, cod: 1320 },
  ];

  window.DCDATA = { dcs, totals, SYSTEM, cleared, added };
})();
