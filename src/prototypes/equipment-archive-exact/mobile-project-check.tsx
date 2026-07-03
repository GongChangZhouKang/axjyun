import React, { useEffect, useMemo, useState } from 'react';
import './mobile-project-check.css';

type Scope = 'project' | 'client';
export type ProjectCheckView = 'project-check-home' | 'project-check-list' | 'project-check-create' | 'project-check-entry' | 'project-check-result' | 'project-check-picker' | 'project-check-client-add' | 'project-check-location';
type CheckLine = { id: string; name: string; baseline: number; counted: number; category?: string; location?: string; oneCode?: boolean };

const catalog: CheckLine[] = [
  { id: 'uniform', name: '保安服', baseline: 998, counted: 998, category: '测试' },
  { id: 'coded', name: '一物一码设备', baseline: 2, counted: 2, category: '设备', oneCode: true },
  { id: 'custom', name: '测试定制机', baseline: 2, counted: 2, category: '设备' },
];
const clientSeed: CheckLine[] = [{ id: 'shield', name: '防爆盾牌', baseline: 10, counted: 10, location: '万达广场南门' }];

const titles: Record<ProjectCheckView, string> = {
  'project-check-home': '功能中心', 'project-check-list': '装备盘点', 'project-check-create': '项目装备盘点',
  'project-check-entry': '项目装备盘点', 'project-check-result': '盘点结果', 'project-check-picker': '选择装备',
  'project-check-client-add': '添加甲方装备', 'project-check-location': '选择岗点',
};

const normalizedView = (view: ProjectCheckView) => view === 'project-check-entry' ? 'project-check-create' : view;
const diffLabel = (diff: number) => diff === 0 ? '正常' : diff > 0 ? '盘盈' : '盘亏';

export default function MobileProjectCheck({ initialView = 'project-check-home', onViewChange }: { initialView?: ProjectCheckView; onViewChange?: (view: ProjectCheckView) => void }) {
  const [view, setView] = useState<ProjectCheckView>(normalizedView(initialView));
  const [scope, setScope] = useState<Scope>('project');
  const [lines, setLines] = useState<CheckLine[]>([{ ...catalog[0] }]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['uniform']);
  const [showSubmit, setShowSubmit] = useState(false);
  const [toast, setToast] = useState('');
  const [clientForm, setClientForm] = useState({ name: '医用担架', location: '万达广场南门', quantity: 1, unit: '个', remark: '' });

  const navigate = (next: ProjectCheckView) => { const target = normalizedView(next); setView(target); onViewChange?.(target); };
  useEffect(() => { const next = normalizedView(initialView); if (next !== view) setView(next); }, [initialView]);
  useEffect(() => onViewChange?.(view), []);

  const summary = useMemo(() => lines.reduce((acc, line) => { const d = line.counted - line.baseline; acc[d === 0 ? 'normal' : d > 0 ? 'surplus' : 'shortage'] += 1; return acc; }, { normal: 0, surplus: 0, shortage: 0 }), [lines]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 1600); };
  const switchScope = (next: Scope) => { setScope(next); setLines(next === 'project' ? [{ ...catalog[0] }] : clientSeed.map((item) => ({ ...item }))); };
  const changeCount = (id: string, delta: number) => setLines((current) => current.map((line) => line.id === id ? { ...line, counted: Math.max(0, line.counted + delta) } : line));
  const setCount = (id: string, value: string) => setLines((current) => current.map((line) => line.id === id ? { ...line, counted: Math.max(0, Number.parseInt(value || '0', 10) || 0) } : line));

  const openCreate = () => { setLines(scope === 'project' ? [{ ...catalog[0] }] : clientSeed.map((item) => ({ ...item }))); navigate('project-check-create'); };
  const confirmEquipment = () => { setLines(catalog.filter((item) => selectedIds.includes(item.id)).map((item) => ({ ...item }))); navigate('project-check-create'); notify(`已选择 ${selectedIds.length} 件装备`); };
  const addClientEquipment = () => { const item: CheckLine = { id: `client-${Date.now()}`, name: clientForm.name, baseline: clientForm.quantity, counted: 0, location: clientForm.location }; setLines((current) => [...current, item]); navigate('project-check-create'); notify('已添加甲方装备'); };

  const back = () => {
    if (view === 'project-check-home') return notify('已在功能中心');
    if (view === 'project-check-list') return navigate('project-check-home');
    if (view === 'project-check-picker' || view === 'project-check-client-add') return navigate('project-check-create');
    if (view === 'project-check-location') return navigate('project-check-client-add');
    navigate('project-check-list');
  };

  return <div className="project-check-stage"><article className="project-check-phone">
    <div className="app-status"><b>11:17</b><span>▮▮▮ 5G ▰</span></div>
    {view !== 'project-check-home' && <header className="project-check-header"><button aria-label="返回" onClick={back}>‹</button><span>{view === 'project-check-create' ? (scope === 'project' ? '项目装备盘点' : '甲方装备盘点') : titles[view]}</span><i /></header>}

    {view === 'project-check-home' && <main className="function-home" data-annotation-id="project-check-home">
      <div className="home-user"><strong>张航</strong><button>意见反馈</button><i>⌗</i></div>
      <h2>业务管理</h2><section className="function-grid">{['项目管理','工作汇报','巡检统计','客户管理','组织通讯录','队员入职','考勤汇总'].map((item, index) => <div key={item}><i className={`tone-${index}`}>✓</i><span>{item}</span></div>)}<button onClick={() => navigate('project-check-list')}><i className="tone-check">✓</i><span>装备盘点</span></button></section>
      <h2>督导</h2><section className="function-grid compact">{['督导任务','督导问题整改','项目自查'].map((item, index) => <div key={item}><i className={`tone-${index + 2}`}>✓</i><span>{item}</span></div>)}</section>
      <h2>装备管理</h2><section className="function-grid compact"><div><i className="tone-stock">⇄</i><span>出入库管理</span></div><div><i className="tone-1">⇧</i><span>调拨</span></div><div><i className="tone-check">✓</i><span>库存盘点</span></div></section>
      <nav><b>▦<span>功能中心</span></b><span>▣<small>审批</small></span><span>▤<small>消息</small></span><span>⊙<small>我的</small></span></nav>
    </main>}

    {view === 'project-check-list' && <main className="project-check-content list-view" data-annotation-id="project-check-list">
      <button className="project-select"><span>请选择项目</span><b>›</b></button>
      <div className="project-check-tabs" data-annotation-id="project-check-tabs"><button className={scope === 'project' ? 'active' : ''} onClick={() => switchScope('project')}>项目装备</button><button className={scope === 'client' ? 'active' : ''} onClick={() => switchScope('client')}>甲方装备</button></div>
      <section className="check-task-list">{[
        { id: 'PD202605220001', status: '进行中', title: `2026年5月${scope === 'project' ? '项目' : '甲方'}装备盘点` },
        { id: 'PD202605220002', status: '已完成', title: `2026年5月${scope === 'project' ? '项目' : '甲方'}装备盘点` },
      ].map((task) => <button className="check-task-card" key={task.id} onClick={() => task.status === '已完成' ? navigate('project-check-result') : navigate('project-check-create')}><div><strong>{task.id}</strong><span className={task.status === '进行中' ? 'doing' : 'done'}>{task.status}</span></div><dl><div><dt>盘点名称：</dt><dd>{task.title}</dd></div><div><dt>所属项目：</dt><dd>历下仓库1</dd></div><div><dt>所属部门：</dt><dd>历下区1中队</dd></div><div><dt>经办人：</dt><dd>张三</dd></div><div><dt>盘点日期：</dt><dd>2026-05-22</dd></div></dl></button>)}</section>
      <button className="list-create" onClick={openCreate}>新增{scope === 'project' ? '项目' : '甲方'}装备盘点</button>
    </main>}

    {view === 'project-check-create' && <main className="project-check-content edit-view" data-annotation-id="project-check-create">
      <section className="check-base"><label><span>盘点名称 <b>*</b></span><strong>2026年5月{scope === 'project' ? '项目' : '甲方装备'}盘点</strong></label><label><span>所属项目 <b>*</b></span><strong>山东大学齐鲁医院</strong></label><label><span>所属部门 <b>*</b></span><strong>历城区1中队</strong></label><label><span>经办人 <b>*</b></span><strong>张三</strong></label><label><span>盘点时间 <b>*</b></span><strong>2026-05-22</strong></label><label><span>盘点说明</span><strong className="muted">{scope === 'project' ? '--' : '请输入盘点说明'}</strong></label></section>
      <section className="count-card-list" data-annotation-id="project-check-count-cards">{lines.map((line) => { const diff = line.counted - line.baseline; return <article className="count-card" key={line.id}><div className="count-card-title"><strong>{line.name}</strong><span className={diff === 0 ? 'normal' : diff > 0 ? 'surplus' : 'shortage'}>差异：{diff > 0 ? '+' : ''}{diff}</span></div>{scope === 'project' ? <div className="equipment-extra"><span>分类：{line.category || '测试'}</span><span>单位：-</span><span>供应商：-</span><span>备注：-</span></div> : <div className="equipment-extra"><span>位置：{line.location || '--'}</span><span>单位：个</span><span>备注：-</span></div>}<div className="count-row"><span>{scope === 'project' ? '领用' : '数量'}：{line.baseline}</span><label>实际数量：<div className="count-stepper"><button onClick={() => changeCount(line.id, -1)}>−</button><input inputMode="numeric" value={line.counted} onChange={(event) => setCount(line.id, event.target.value)} /><button onClick={() => changeCount(line.id, 1)}>＋</button></div></label></div></article>; })}</section>
      <button className="floating-add" onClick={() => navigate(scope === 'project' ? 'project-check-picker' : 'project-check-client-add')}>添加</button>
      <footer className="edit-actions"><button onClick={() => { notify('盘点已保存'); navigate('project-check-list'); }}>保存</button><button onClick={() => setShowSubmit(true)}>提交盘点</button></footer>
    </main>}

    {view === 'project-check-picker' && <main className="project-check-content picker-view" data-annotation-id="project-check-picker"><div className="picker-search">⌕ 请输入装备名称 <button>⌗　搜索</button></div><label className="stock-filter"><i /> 显示无库存装备</label><section>{catalog.map((item) => <button className="equipment-choice" key={item.id} onClick={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}><i className={selectedIds.includes(item.id) ? 'checked' : ''}>{selectedIds.includes(item.id) ? '✓' : ''}</i><div><strong>{item.name}</strong><span>库存：{item.baseline}</span><p>分类：{item.category}　　　　单位：-</p><p>供应商：-　　　　　备注：-</p></div></button>)}</section><button className="wide-confirm" onClick={confirmEquipment}>确认</button></main>}

    {view === 'project-check-client-add' && <main className="project-check-content client-form" data-annotation-id="project-check-client-add"><section><label><span>装备名称 <b>*</b></span><input value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} /></label><button className="form-select" onClick={() => navigate('project-check-location')}><span>所在位置 <b>*</b></span><strong>{clientForm.location}</strong><em>›</em></button><label><span>数量 <b>*</b></span><input type="number" value={clientForm.quantity} onChange={(event) => setClientForm({ ...clientForm, quantity: Math.max(0, Number(event.target.value)) })} /></label><label><span>单位 <b>*</b></span><input value={clientForm.unit} onChange={(event) => setClientForm({ ...clientForm, unit: event.target.value })} /></label><label><span>图片 <small>最多上传1个，大小不超过10M</small></span><button className="image-add">＋</button></label><label><span>备注</span><input placeholder="请输入备注" value={clientForm.remark} onChange={(event) => setClientForm({ ...clientForm, remark: event.target.value })} /></label></section><button className="wide-confirm" onClick={addClientEquipment}>确认</button></main>}

    {view === 'project-check-location' && <main className="project-check-content location-view" data-annotation-id="project-check-location"><div className="picker-search">⌕ 请输入岗点名称 <button>搜索</button></div>{['万达广场南门','万达3号楼'].map((location) => <button key={location} onClick={() => { setClientForm({ ...clientForm, location }); navigate('project-check-client-add'); }}><i className={clientForm.location === location ? 'selected' : ''} />{location}</button>)}<button className="wide-confirm" onClick={() => navigate('project-check-client-add')}>确认</button></main>}

    {view === 'project-check-result' && <main className="project-check-content result-view" data-annotation-id="project-check-result"><section className="result-hero"><i>✓</i><strong>盘点已提交</strong><span>PD202605220002</span></section><section className="result-summary" data-annotation-id="project-check-result-summary"><div><b>{lines.length}</b><span>装备项</span></div><div><b>{summary.normal}</b><span>正常</span></div><div><b>{summary.surplus}</b><span>盘盈</span></div><div><b>{summary.shortage}</b><span>盘亏</span></div></section><section className="result-list">{lines.map((line) => { const diff = line.counted - line.baseline; return <article key={line.id}><div><strong>{line.name}</strong><span className={diff === 0 ? 'normal' : diff > 0 ? 'surplus' : 'shortage'}>{diffLabel(diff)}</span></div><p>{scope === 'project' ? '领用' : '登记'} {line.baseline}　盘点 {line.counted}　差异 {diff > 0 ? '+' : ''}{diff}</p></article>; })}</section><button className="wide-confirm" onClick={() => navigate('project-check-list')}>完成</button></main>}

    {showSubmit && <><div className="project-sheet-mask" /><section className="submit-dialog" data-annotation-id="project-check-submit-dialog"><p>提交后将无法修改，确认提交吗？</p><button onClick={() => { setShowSubmit(false); navigate('project-check-result'); }}>确认提交</button><button onClick={() => setShowSubmit(false)}>取消</button></section></>}
    {toast && <div className="project-check-toast">{toast}</div>}<div className="project-home-indicator" />
  </article></div>;
}
