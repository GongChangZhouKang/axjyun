import React, { useMemo, useState } from 'react';
import { Ecc, QrCode } from '@rc-component/qrcode/es/libs/qrcodegen';
import './mobile-equipment-claim.css';

type Equipment = { id: string; code: string; name: string; stock: number; unit: string; supplier: string; quantity: number };
type AddMode = 'closed' | 'choose' | 'manual' | 'scanner';

const catalog: Equipment[] = [
  { id: 'uniform', code: 'FZ-BAF-001', name: '保安服', stock: 998, unit: '套', supplier: '—', quantity: 1 },
  { id: 'coded', code: 'ZQ-YWYM-001', name: '一物一码设备', stock: 2, unit: '台', supplier: '—', quantity: 1 },
  { id: 'custom', code: 'ZQ-DZJ-001', name: '测试定制机', stock: 2, unit: '台', supplier: '—', quantity: 1 },
];

function qrDataUrl(rows: Equipment[]) {
  const payload = JSON.stringify({ type: 'equipment-list', version: 1, items: rows.map(({ code, name, quantity, unit }) => ({ code, name, quantity, unit })) });
  const qr = QrCode.encodeText(payload, Ecc.MEDIUM);
  const size = 1120;
  const rowHeight = 70;
  const tableTop = 875;
  const noteTop = tableTop + 58 + rows.length * rowHeight + 24;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = Math.max(1400, noteTop + 120);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.closePath();
  };
  const drawScanIcon = (x: number, y: number) => {
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    [[-12,-12,1,1],[12,-12,-1,1],[-12,12,1,-1],[12,12,-1,-1]].forEach(([dx,dy,sx,sy]) => { ctx.beginPath(); ctx.moveTo(x+dx, y+dy+sy*7); ctx.lineTo(x+dx,y+dy); ctx.lineTo(x+dx+sx*7,y+dy); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+8,y); ctx.stroke(); ctx.restore();
  };
  const drawShield = (x: number, y: number) => {
    ctx.save(); ctx.fillStyle = '#1677ff'; ctx.beginPath(); ctx.moveTo(x,y-30); ctx.lineTo(x+27,y-19); ctx.lineTo(x+24,y+13); ctx.quadraticCurveTo(x+18,y+34,x,y+43); ctx.quadraticCurveTo(x-18,y+34,x-24,y+13); ctx.lineTo(x-27,y-19); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); ctx.moveTo(x-11,y+4); ctx.lineTo(x-2,y+14); ctx.lineTo(x+14,y-8); ctx.stroke(); ctx.restore();
  };

  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const titleY = 105;
  ctx.strokeStyle = '#1677ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(145,titleY); ctx.lineTo(225,titleY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(895,titleY); ctx.lineTo(975,titleY); ctx.stroke();
  ctx.fillStyle = '#1677ff'; ctx.font = '700 28px Arial'; ctx.textAlign='center'; ctx.fillText('⁝', 255, titleY+8); ctx.fillText('⁝', 865, titleY+8);
  ctx.fillStyle = '#07152f'; ctx.font = '700 58px Microsoft YaHei, sans-serif'; ctx.fillText('扫码添加装备清单', size / 2, 122);

  ctx.fillStyle = '#1677ff'; ctx.beginPath(); ctx.arc(245, 198, 27, 0, Math.PI*2); ctx.fill(); drawScanIcon(245,198);
  ctx.textAlign = 'left'; ctx.font = '28px Microsoft YaHei, sans-serif'; ctx.fillStyle = '#526078'; ctx.fillText('APP「审批-装备领用」→ 选择装备 → 扫码添加', 292, 207);

  const quiet = 4; const qrBox = 500; const qrCard = 536; const module = qrBox / (qr.size + quiet * 2); const left = (size - qrBox) / 2; const top = 276;
  roundedRect((size-qrCard)/2, top-18, qrCard, qrCard, 16); ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle='#dce3ec'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle = '#111';
  for (let y = 0; y < qr.size; y += 1) for (let x = 0; x < qr.size; x += 1) if (qr.getModule(x, y)) ctx.fillRect(left + (x + quiet) * module, top + (y + quiet) * module, Math.ceil(module), Math.ceil(module));

  ctx.textAlign = 'left'; ctx.strokeStyle='#1677ff'; ctx.lineWidth=3; ctx.strokeRect(80, 817, 24, 29); ctx.beginPath(); ctx.moveTo(86,812); ctx.lineTo(98,812); ctx.stroke();
  ctx.fillStyle = '#07152f'; ctx.font = '700 30px Microsoft YaHei, sans-serif'; ctx.fillText('装备清单明细', 125, 842);
  ctx.strokeStyle='#1677ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(76,862); ctx.lineTo(1044,862); ctx.stroke();

  const columns = [130, 435, 785, 965];
  roundedRect(76, tableTop, 968, 58, 12); ctx.fillStyle='#eef5ff'; ctx.fill();
  ['编号','名称','数量','单位'].forEach((label,index)=>{ ctx.fillStyle='#07152f'; ctx.font='700 24px Microsoft YaHei, sans-serif'; ctx.textAlign=index===1?'center':'left'; ctx.fillText(label,columns[index],tableTop+38); });
  rows.forEach((row, index) => {
    const y = tableTop + 58 + index * rowHeight;
    ctx.strokeStyle='#dce3ec'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(76,y+rowHeight); ctx.lineTo(1044,y+rowHeight); ctx.stroke();
    ctx.fillStyle='#17233d'; ctx.font='23px Microsoft YaHei, sans-serif'; ctx.textAlign='left'; ctx.fillText(row.code,columns[0],y+44);
    ctx.textAlign='center'; ctx.fillText(row.name,columns[1],y+44); ctx.textAlign='left'; ctx.fillText(String(row.quantity),columns[2],y+44); ctx.fillText(row.unit,columns[3],y+44);
  });

  roundedRect(76,noteTop,968,105,14); ctx.fillStyle='#eef5ff'; ctx.fill(); drawShield(180,noteTop+51);
  ctx.fillStyle='#263750'; ctx.textAlign='left'; ctx.font='22px Microsoft YaHei, sans-serif'; ctx.fillText('请保持二维码完整清晰，截图、打印后均可扫码使用。', 255, noteTop+43); ctx.fillText('二维码仅用于带出清单明细，不代表申请已提交。', 255, noteTop+76);
  return canvas.toDataURL('image/png');
}

export default function MobileEquipmentClaim() {
  const [mode, setMode] = useState<AddMode>('closed');
  const [rows, setRows] = useState<Equipment[]>([]);
  const [manualSelection, setManualSelection] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('个人');
  const [remark, setRemark] = useState('');
  const [toast, setToast] = useState('');
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.quantity, 0), [rows]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 1800); };
  const addRows = (items: Equipment[]) => {
    setRows((current) => {
      const next = current.map((row) => ({ ...row }));
      items.forEach((item) => { const found = next.find((row) => row.id === item.id); if (found) found.quantity = Math.min(found.stock, found.quantity + item.quantity); else next.push({ ...item }); });
      return next;
    });
    setMode('closed'); notify(`已添加 ${items.length} 件装备`);
  };
  const changeQuantity = (id: string, delta: number) => setRows((current) => current.map((row) => row.id === id ? { ...row, quantity: Math.max(1, Math.min(row.stock, row.quantity + delta)) } : row));
  const saveQr = () => { const href = qrDataUrl(rows); if (!href) return; const link = document.createElement('a'); link.href = href; link.download = '装备领用清单二维码.png'; link.click(); notify('清单二维码已保存'); };
  const openManual = () => { setManualSelection(rows.map((row) => row.id)); setMode('manual'); };
  const toggleManual = (id: string) => setManualSelection((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const confirmManual = () => {
    setRows((current) => manualSelection.map((id) => current.find((row) => row.id === id) ?? { ...catalog.find((item) => item.id === id)! }));
    setMode('closed'); notify(`已选择 ${manualSelection.length} 件装备`);
  };

  if (mode === 'scanner') return (
    <div className="claim-stage scanner-stage">
      <div className="claim-phone scanner-screen" data-annotation-id="claim-scanner">
        <header><button onClick={() => setMode('choose')}>‹</button><span>扫码添加装备</span><i /></header>
        <div className="scanner-camera"><div className="scan-frame"><i /><i /><i /><i /><span /></div><p>将装备清单二维码放入框内</p></div>
        <button className="scan-demo" onClick={() => addRows(catalog)}>模拟扫码成功</button>
      </div>
    </div>
  );

  if (mode === 'manual') return (
    <div className="claim-stage">
      <article className="claim-phone manual-picker" data-annotation-id="claim-manual-picker">
        <header className="claim-header"><button onClick={() => setMode('choose')}>‹</button><span>选择装备</span><button className="picker-confirm" onClick={confirmManual}>确定</button></header>
        <div className="picker-search">⌕　请输入装备名称</div>
        <div className="picker-list">
          {catalog.map((item) => <button className="picker-row" key={item.id} onClick={() => toggleManual(item.id)}>
            <i className={manualSelection.includes(item.id) ? 'checked' : ''}>{manualSelection.includes(item.id) ? '✓' : ''}</i>
            <span><strong>{item.name}</strong><small>{item.code}　库存：{item.stock}　单位：{item.unit}</small></span>
          </button>)}
        </div>
        <div className="picker-summary">已选择 {manualSelection.length} 件装备</div>
        <div className="home-indicator" />
      </article>
    </div>
  );

  return (
    <div className="claim-stage">
      <article className="claim-phone" data-annotation-id="mobile-equipment-claim">
        <header className="claim-header"><button>‹</button><span>领用审批</span><i /></header>
        <main className="claim-content">
          <section className="claim-card claim-fields">
            <label><span>申请仓库 <b>*</b></span><div>测试小分队 <em>›</em></div></label>
            <label><span>使用用途 <b>*</b></span><div><button className="plain-value" onClick={() => setPurpose(purpose === '个人' ? '执勤' : '个人')}>{purpose}</button><em>›</em></div></label>
            <div className="equipment-field" data-annotation-id="claim-equipment-list">
              <span>装备 <b>*</b></span>
              {!rows.length ? <button className="empty-equipment" onClick={() => setMode('choose')}>请选择装备 <em>›</em></button> : <div className="equipment-list">
                {rows.map((row) => <div className="equipment-item" key={row.id}>
                  <div className="equipment-title"><strong>{row.name}</strong><span>库存：{row.stock}</span></div>
                  <div className="equipment-meta"><span>单位：{row.unit}</span><div className="stepper"><button onClick={() => changeQuantity(row.id, -1)}>−</button><b>{row.quantity}</b><button onClick={() => changeQuantity(row.id, 1)}>＋</button></div></div>
                  <div className="equipment-meta"><span>供应商：{row.supplier}</span></div>
                  <button className="remove" aria-label={`删除${row.name}`} onClick={() => setRows(rows.filter((item) => item.id !== row.id))}>−</button>
                </div>)}
                <div className="equipment-actions" data-annotation-id="claim-qr-actions"><button onClick={saveQr}>保存清单二维码</button><button onClick={() => setMode('choose')}>继续添加 <b>＋</b></button></div>
              </div>}
            </div>
            <label className="remark"><span>备注 <b>*</b></span><textarea value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="请输入内容..." /></label>
            <div className="attachment"><span>附件 <small>最多上传6张，每张不超过10M</small></span><button>＋</button></div>
          </section>
          <section className="claim-card process"><h3>流程</h3><div><i />审批人 <span>测试徐阿</span></div><div><i />请选抄送人 <span>请选择 ›</span></div></section>
        </main>
        <button className="claim-submit" onClick={() => rows.length && remark.trim() ? notify(`已提交 ${total} 件装备`) : notify('请先添加装备并填写备注')}>提交</button>
        <div className="home-indicator" />
        {mode !== 'closed' && <div className="sheet-mask" onClick={() => setMode('closed')} />}
        {mode === 'choose' && <section className="claim-sheet" data-annotation-id="claim-add-sheet"><h3>请选择添加方式 <button className="sheet-close" aria-label="关闭添加方式" onClick={() => setMode('closed')}>×</button></h3><button onClick={() => setMode('scanner')}>扫码添加</button><button onClick={openManual}>手工添加</button><button className="cancel" onClick={() => setMode('closed')}>取消</button></section>}
        {toast && <div className="claim-toast">{toast}</div>}
      </article>
    </div>
  );
}
