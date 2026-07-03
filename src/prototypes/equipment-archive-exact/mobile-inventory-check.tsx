import React, { useEffect, useMemo, useState } from 'react';
import './mobile-inventory-check.css';

export type MobileCheckView = 'mobile-inventory-home' | 'mobile-inventory-check' | 'mobile-inventory-check-form' | 'mobile-inventory-check-entry';
type CheckStatus = '待开始' | '进行中' | '已完成';
type Task = { id: string; name: string; warehouse: string; type: '全盘' | '抽盘'; operator: string; date: string; description: string; status: CheckStatus };
type Item = { id: string; name: string; category: string; unit: string; supplier: string; note: string; stock: number; actual: number; coded?: boolean };

const initialTasks: Task[] = [
  { id: 'PD202605220001', name: '2026年5月仓库盘点', warehouse: '历下仓库1', type: '全盘', operator: '张三', date: '2026-05-22', description: '月度例行盘点', status: '进行中' },
  { id: 'PD202605220002', name: '2026年5月仓库盘点', warehouse: '历下仓库1', type: '全盘', operator: '张三', date: '2026-05-22', description: '', status: '待开始' },
  { id: 'PD202604180003', name: '4月重点装备抽盘', warehouse: '历下仓库1', type: '抽盘', operator: '李四', date: '2026-04-18', description: '重点装备抽盘', status: '已完成' },
];
const initialItems: Item[] = [
  { id: 'uniform', name: '保安服', category: '测试', unit: '—', supplier: '—', note: '—', stock: 988, actual: 988 },
  { id: 'coded', name: '一物一码设备', category: '设备', unit: '—', supplier: '—', note: '—', stock: 2, actual: 0, coded: true },
  { id: 'uniform-inbound', name: '保安服', category: '测试', unit: '—', supplier: '—', note: '—', stock: 988, actual: 993 },
];

const statusClass = (status: CheckStatus) => status === '进行中' ? 'running' : status === '待开始' ? 'pending' : 'done';

export default function MobileInventoryCheck({ view, onNavigate }: { view: MobileCheckView; onNavigate: (view: MobileCheckView) => void }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [status, setStatus] = useState<'全部状态' | CheckStatus>('全部状态');
  const [warehouse, setWarehouse] = useState('历下仓库1');
  const [form, setForm] = useState({ name: '2026年5月仓库盘点', warehouse: '历下仓库1', type: '全盘' as '全盘' | '抽盘', operator: '张三', date: '2026-05-22', description: '' });
  const [items, setItems] = useState(initialItems);
  const [activeTask, setActiveTask] = useState<Task>(initialTasks[0]);
  const [dialog, setDialog] = useState<'start' | 'submit' | null>(null);
  const [toast, setToast] = useState('');
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 1800); };
  const visibleTasks = useMemo(() => tasks.filter((task) => status === '全部状态' || task.status === status), [tasks, status]);

  useEffect(() => { if (view === 'mobile-inventory-check-entry' && !activeTask) setActiveTask(initialTasks[0]); }, [view, activeTask]);
  const goList = () => onNavigate('mobile-inventory-check');
  const changeActual = (id: string, delta: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, actual: Math.max(0, item.actual + delta) } : item));
  const saveTask = () => {
    if (!form.name.trim() || !form.warehouse) return notify('请完整填写盘点信息');
    const task: Task = { id: `PD20260702${String(tasks.length + 1).padStart(4, '0')}`, ...form, name: form.name.trim(), status: '待开始' };
    setTasks((current) => [task, ...current]); setActiveTask(task); notify('盘点单已保存'); goList();
  };
  const requestStart = (task?: Task) => {
    if (task) setActiveTask(task);
    else {
      if (!form.name.trim() || !form.warehouse) return notify('请完整填写盘点信息');
      setActiveTask({ id: `PD20260702${String(tasks.length + 1).padStart(4, '0')}`, ...form, name: form.name.trim(), status: '待开始' });
    }
    setDialog('start');
  };
  const confirmStart = () => {
    const running = { ...activeTask, status: '进行中' as const };
    setActiveTask(running); setTasks((current) => current.some((task) => task.id === running.id) ? current.map((task) => task.id === running.id ? running : task) : [running, ...current]); setDialog(null); notify('仓库已锁定，开始盘点'); onNavigate('mobile-inventory-check-entry');
  };
  const openTask = (task: Task) => {
    setActiveTask(task);
    if (task.status === '待开始') requestStart(task);
    else if (task.status === '进行中') onNavigate('mobile-inventory-check-entry');
    else notify('该盘点任务已完成');
  };
  const submit = () => {
    setTasks((current) => current.map((task) => task.id === activeTask.id ? { ...task, status: '已完成' } : task));
    setActiveTask((current) => ({ ...current, status: '已完成' })); setDialog(null); setStatus('已完成'); notify('盘点已提交，仓库锁定已解除'); goList();
  };

  return <div className="mic-stage"><article className="mic-phone">
    {view === 'mobile-inventory-home' && <Home onOpen={goList} />}
    {view === 'mobile-inventory-check' && <>
      <MobileHeader title="库存盘点" onBack={() => onNavigate('mobile-inventory-home')} />
      <main className="mic-list-page" data-annotation-id="mobile-check-list">
        <button className="mic-warehouse" onClick={() => setWarehouse(warehouse === '历下仓库1' ? '历下仓库2' : '历下仓库1')}><span>{warehouse}</span><b>›</b></button>
        <div className="mic-status-tabs">{(['全部状态','待开始','进行中','已完成'] as const).map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}</div>
        <section className="mic-task-list">{visibleTasks.map((task) => <button className="mic-task" key={task.id} onClick={() => openTask(task)}>
          <div className="mic-task-top"><span>{task.id}</span><strong className={statusClass(task.status)}>{task.status}</strong></div>
          <dl><div><dt>盘点名称：</dt><dd>{task.name}</dd></div><div><dt>仓库：</dt><dd>{task.warehouse}</dd></div><div><dt>盘点类型：</dt><dd>{task.type}</dd></div><div><dt>经办人：</dt><dd>{task.operator}</dd></div><div><dt>盘点日期：</dt><dd>{task.date}</dd></div></dl>
        </button>)}</section>
      </main>
      <div className="mic-fixed-action"><button onClick={() => onNavigate('mobile-inventory-check-form')}>新增盘点</button></div>
    </>}
    {(view === 'mobile-inventory-check-form' || view === 'mobile-inventory-check-entry') && <>
      <MobileHeader title="库存盘点" onBack={goList} />
      <main className="mic-form-page" data-annotation-id={view === 'mobile-inventory-check-form' ? 'mobile-check-form' : 'mobile-check-entry'}>
        <section className="mic-info-card">
          <MobileField label="盘点名称" required value={form.name} editable={view === 'mobile-inventory-check-form'} onChange={(name) => setForm({ ...form, name })} />
          <MobileField label="仓库" required value={view === 'mobile-inventory-check-entry' ? activeTask.warehouse : form.warehouse} />
          <MobileField label="盘点类型" required value={view === 'mobile-inventory-check-entry' ? activeTask.type : form.type} />
          <MobileField label="经办人" required value={view === 'mobile-inventory-check-entry' ? activeTask.operator : form.operator} />
          <MobileField label="盘点时间" required value={view === 'mobile-inventory-check-entry' ? activeTask.date : form.date} />
          <label className="mic-description"><span>盘点说明</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value.slice(0, 800) })} placeholder="请输入盘点说明" /><small>{form.description.length}/800</small></label>
        </section>
        <section className="mic-item-list" data-annotation-id="mobile-check-items">{items.map((item) => <EquipmentCard key={item.id} item={item} onChange={changeActual} onScan={() => { setItems((current) => current.map((row) => row.id === item.id ? { ...row, actual: row.stock } : row)); notify(`已扫码核对${item.name}`); }} />)}</section>
      </main>
      <div className="mic-form-actions"><button className="save" onClick={() => view === 'mobile-inventory-check-form' ? saveTask() : notify('盘点数据已保存')}>保存</button><button className="primary" onClick={() => view === 'mobile-inventory-check-form' ? requestStart() : setDialog('submit')}>{view === 'mobile-inventory-check-form' ? '开始盘点' : '提交盘点'}</button></div>
    </>}
    {dialog && <ConfirmDialog kind={dialog} differences={items.filter((item) => item.actual !== item.stock).length} onCancel={() => setDialog(null)} onConfirm={dialog === 'start' ? confirmStart : submit} />}
    {toast && <div className="mic-toast">{toast}</div>}
    <div className="mic-home-indicator" />
  </article></div>;
}

function MobileHeader({ title, onBack }: { title: string; onBack: () => void }) { return <header className="mic-header"><button aria-label="返回" onClick={onBack}>‹</button><span>{title}</span><i /></header>; }
function MobileField({ label, value, required, editable, onChange }: { label: string; value: string; required?: boolean; editable?: boolean; onChange?: (value: string) => void }) { return <label className="mic-field"><span>{label}{required && <b> *</b>}</span>{editable ? <input value={value} onChange={(event) => onChange?.(event.target.value)} /> : <div>{value}</div>}</label>; }
function EquipmentCard({ item, onChange, onScan }: { item: Item; onChange: (id: string, delta: number) => void; onScan: () => void }) {
  const difference = item.actual - item.stock;
  return <article className="mic-equipment-card"><div className="mic-equipment-title"><strong>{item.name}</strong><span className={difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}>差异：{difference > 0 ? `+${difference}` : difference}</span></div>
    <div className="mic-equipment-grid"><span>分类：{item.category}</span><span>单位：{item.unit}</span><span>供应商：{item.supplier}</span><span>备注：{item.note}</span><span>库存：{item.stock}</span><span className="mic-actual">实际数量：{item.coded ? <><b>{item.actual}</b><button className="mic-scan" aria-label="扫码核对" onClick={onScan}>⌗</button></> : <span className="mic-stepper"><button onClick={() => onChange(item.id, -1)}>−</button><b>{item.actual}</b><button onClick={() => onChange(item.id, 1)}>＋</button></span>}</span></div>
  </article>;
}
function ConfirmDialog({ kind, differences, onCancel, onConfirm }: { kind: 'start' | 'submit'; differences: number; onCancel: () => void; onConfirm: () => void }) {
  const start = kind === 'start';
  return <div className="mic-dialog-mask"><section className="mic-source-dialog" data-annotation-id="mobile-check-confirm-dialog">
    <header><h3>{start ? '开始盘点' : '提交盘点'}</h3><button aria-label="关闭" onClick={onCancel}>×</button></header>
    <div className="mic-dialog-body"><p>{start ? '开始后将锁定当前仓库，盘点期间暂停出入库业务。确认开始盘点吗？' : `本次盘点有 ${differences} 项库存差异。提交后将无法修改，并自动解除仓库锁定。确认提交吗？`}</p></div>
    <footer><button onClick={onCancel}>取消</button><button className="primary" onClick={onConfirm}>{start ? '确认开始' : '确认提交'}</button></footer>
  </section></div>;
}
function Home({ onOpen }: { onOpen: () => void }) { return <div className="mic-home" data-annotation-id="mobile-check-home"><header><strong>张航</strong><button>意见反馈</button><i>⌗</i></header><main>
  <HomeGroup title=""><HomeIcon color="#eda574" icon="♙" label="队员入职"/><HomeIcon color="#7cd5eb" icon="▥" label="考勤汇总"/><HomeIcon color="#7ae4c5" icon="⌖" label="可视化调度"/></HomeGroup>
  <HomeGroup title="督导"><HomeIcon color="#6198ed" icon="✪" label="督导任务"/><HomeIcon color="#5abb7a" icon="?" label="督导问题整改"/><HomeIcon color="#6198ed" icon="督" label="项目自查"/></HomeGroup>
  <HomeGroup title="装备管理"><HomeIcon color="#f6b938" icon="⇄" label="出入库管理"/><HomeIcon color="#6398ee" icon="⇅" label="调拨"/><HomeIcon color="#53bb70" icon="✓" label="库存盘点" onClick={onOpen}/></HomeGroup>
  <HomeGroup title="协作中心"><HomeIcon color="#f0b38f" icon="➤" label="警情响应"/><HomeIcon color="#a58bf0" icon="⚑" label="临时勤务"/></HomeGroup>
  </main><nav><b>▦<small>功能中心</small></b><span>▣<small>审批</small></span><span>▤<small>消息</small></span><span>☻<small>我的</small></span></nav></div>; }
function HomeGroup({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mic-home-group">{title && <h2>{title}</h2>}<div>{children}</div></section>; }
function HomeIcon({ color, icon, label, onClick }: { color: string; icon: string; label: string; onClick?: () => void }) { return <button onClick={onClick}><i style={{ background: color }}>{icon}</i><span>{label}</span></button>; }
