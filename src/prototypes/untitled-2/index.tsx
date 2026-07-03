/**
 * @name 移动端-装备管理
 */
import React, { useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowLeftRight,
    Bell,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    ClipboardCheck,
    ClipboardList,
    Camera,
    FileCheck2,
    Filter,
    Home,
    Minus,
    PackageOpen,
    Plus,
    ScanLine,
    Search,
    ShieldCheck,
    UserRound,
    Warehouse,
} from 'lucide-react';
import { useHashPage } from '../../common/useHashPage';
import { equipmentPageRoute, isEquipmentPage, type EquipmentPage } from './pages';
import './style.css';

type Page = EquipmentPage;
type Role = 'keeper' | 'leader';
type FlowMode = 'inbound' | 'outbound';
type CheckScope = 'project' | 'client';
type Tone = 'blue' | 'green' | 'orange' | 'red' | 'gray';
type DetailMode = 'flow' | 'stock' | 'project' | 'client';
type FlowKind = 'inbound' | 'outbound' | 'transfer';

type Line = {
    code: string;
    name: string;
    category: string;
    supplier: string;
    unit: string;
    book: number;
    actual: number;
    note: string;
    oneCode?: boolean;
    assetCodes?: string[];
};

type Task = {
    id: string;
    title: string;
    subtitle: string;
    status: string;
    tone: Tone;
    date: string;
    handler: string;
    lines: Line[];
};

const inventoryLines: Line[] = [
    { code: 'FZ0001', name: '防爆盾牌', category: '外衣裤', supplier: '厂商1', unit: '个', book: 100, actual: 100, note: '-' },
    { code: 'FZ0002', name: '一物一码对讲机', category: '执勤通讯', supplier: '易安通设备', unit: '台', book: 100, actual: 105, note: '多出5台待复核' },
    { code: 'FZ0003', name: '防暴腰牌', category: '外衣裤', supplier: '厂商1', unit: '个', book: 100, actual: 95, note: '盘点少5个' },
];

const projectLines: Line[] = [
    { code: 'XM0001', name: '数字对讲机', category: '执勤通讯', supplier: '集团总仓', unit: '台', book: 18, actual: 18, note: '项目装备柜在用' },
    { code: 'XM0002', name: '防刺服', category: '被动防护装备', supplier: '集团总仓', unit: '件', book: 10, actual: 9, note: '门急诊岗少1件' },
    { code: 'XM0003', name: '强光手电', category: '执勤照明', supplier: '历下分公司仓', unit: '个', book: 12, actual: 13, note: '巡逻岗多1个' },
];

const clientLines: Line[] = [
    { code: 'JF0007', name: '院方消防柜', category: '甲方固定资产', supplier: '山东大学齐鲁医院', unit: '组', book: 2, actual: 2, note: '北门岗在册' },
    { code: 'JF0012', name: '访客闸机手持终端', category: '甲方信息化设备', supplier: '山东大学齐鲁医院', unit: '台', book: 4, actual: 4, note: '电量已确认' },
    { code: 'JF0019', name: '院方隔离护栏', category: '甲方现场物资', supplier: '山东大学齐鲁医院', unit: '组', book: 16, actual: 15, note: '少1组，待白班确认' },
];

const stockTasks: Task[] = [
    { id: 'PD202605220001', title: '2026年5月仓库盘点', subtitle: '历下仓库1 · 全盘', status: '进行中', tone: 'green', date: '2026-05-22', handler: '张三', lines: inventoryLines.map((item) => item.code === 'FZ0002' ? { ...item, oneCode: true, assetCodes: ['FZ0002-0103', 'FZ0002-0104', 'FZ0002-0105'] } : item) },
    { id: 'PD202605220002', title: '2026年5月仓库盘点', subtitle: '历下仓库1 · 全盘', status: '待开始', tone: 'orange', date: '2026-05-22', handler: '张三', lines: inventoryLines.map((item) => ({ ...item, actual: item.book })) },
    { id: 'PD202605180012', title: '重点装备抽盘', subtitle: '集团总仓 · 一物一码', status: '已完成', tone: 'gray', date: '2026-05-18', handler: '李岩', lines: inventoryLines.slice(0, 2) },
];

const projectTasks: Task[] = [
    { id: 'PD202605220011', title: '2026年5月项目盘点', subtitle: '山东大学齐鲁医院 · 历城区域1大队', status: '进行中', tone: 'green', date: '2026-05-22', handler: '张三', lines: projectLines },
    { id: 'PD202605220012', title: '2026年5月甲方装备盘点', subtitle: '山东大学齐鲁医院 · 门急诊岗', status: '待开始', tone: 'orange', date: '2026-05-22', handler: '张三', lines: clientLines },
];

const inboundTasks: Task[] = [
    { id: 'RK20260616001', title: '京东慧采到货入库', subtitle: 'JDHC-20260616-83944 · 集团总仓', status: '待入库', tone: 'orange', date: '2026-06-16', handler: '李岩', lines: [
        { code: 'AJ0001', name: '手持金属探测器', category: '安检装备', supplier: '易安通设备', unit: '台', book: 6, actual: 2, note: '一物一码', oneCode: true, assetCodes: ['AJ0001-0001', 'AJ0001-0002'] },
        { code: 'XF0002', name: '防爆毯', category: '消防装备', supplier: '三棵树安保用品', unit: '张', book: 2, actual: 2, note: '到货验收' },
    ] },
    { id: 'RK20260615003', title: '应急救援服部分入库', subtitle: 'JDHC-20260615-82710 · 历城分公司仓', status: '部分入库', tone: 'blue', date: '2026-06-15', handler: '孙鹏', lines: [
        { code: 'XF0018', name: '应急救援服', category: '消防装备', supplier: '三棵树安保用品', unit: '套', book: 24, actual: 18, note: '剩余待补货' },
    ] },
];

const outboundTasks: Task[] = [
    { id: 'CK20260616001', title: 'CBD园区项目申领出库', subtitle: '历下分公司仓 · 项目申领', status: '待出库', tone: 'orange', date: '2026-06-16', handler: '王队长', lines: [
        { code: 'FZ0101', name: '夏季短袖执勤服', category: '保安员服装', supplier: '历下分公司仓', unit: '套', book: 80, actual: 80, note: '按领用归集项目成本' },
        { code: 'ZQ0208', name: '强光手电', category: '执勤照明', supplier: '历下分公司仓', unit: '个', book: 12, actual: 12, note: '夜班巡逻岗' },
    ] },
    { id: 'CK20260616002', title: '个人申领出库', subtitle: '集团总仓 · 周明', status: '已出库', tone: 'green', date: '2026-06-16', handler: '周明', lines: [
        { code: 'AJ0001', name: '手持金属探测器', category: '安检装备', supplier: '集团总仓', unit: '台', book: 5, actual: 3, note: '会展中心项目 · 一物一码', oneCode: true, assetCodes: ['AJ0001-0008', 'AJ0001-0009', 'AJ0001-0010'] },
    ] },
];

const transferTasks: Task[] = [
    { id: 'DB20260616001', title: '集团总仓调拨至历下仓', subtitle: '集团总仓 → 历下分公司仓', status: '待出库', tone: 'orange', date: '2026-06-16', handler: '赵静', lines: [
        { code: 'FZ0101', name: '夏季短袖执勤服', category: '保安员服装', supplier: '集团总仓', unit: '套', book: 120, actual: 120, note: '项目补货' },
        { code: 'FZ0102', name: '反光背心', category: '执勤装备', supplier: '集团总仓', unit: '件', book: 80, actual: 80, note: '项目补货' },
    ] },
    { id: 'DB20260616002', title: '项目装备调拨', subtitle: '历下分公司仓 → CBD园区项目点', status: '在途', tone: 'blue', date: '2026-06-16', handler: '王队长', lines: [
        { code: 'ZQ0301', name: '数字对讲机', category: '执勤通讯', supplier: '历下分公司仓', unit: '台', book: 10, actual: 6, note: '一物一码', oneCode: true, assetCodes: ['ZQ0301-0021', 'ZQ0301-0022', 'ZQ0301-0023', 'ZQ0301-0024', 'ZQ0301-0025', 'ZQ0301-0026'] },
        { code: 'FH0007', name: '防刺服', category: '被动防护装备', supplier: '历下分公司仓', unit: '件', book: 6, actual: 6, note: '重点装备' },
    ] },
];

const modules = [
    { page: 'flow' as Page, label: '出入库管理', icon: PackageOpen, role: 'keeper' as Role, tone: 'orange' },
    { page: 'transfer' as Page, label: '调拨', icon: ArrowLeftRight, role: 'keeper' as Role, tone: 'blue' },
    { page: 'stocktake' as Page, label: '库存盘点', icon: ClipboardCheck, role: 'keeper' as Role, tone: 'green' },
    { page: 'project-check' as Page, label: '项目装备盘点', icon: CheckCircle2, role: 'leader' as Role, tone: 'green' },
];

function diffOf(line: Line) {
    return line.actual - line.book;
}

function totalDiff(lines: Line[]) {
    return lines.reduce((sum, line) => sum + Math.abs(diffOf(line)), 0);
}

function toneClass(tone: Tone) {
    return `tone-${tone}`;
}

function StatusBadge({ value, tone }: { value: string; tone: Tone }) {
    return <span className={`status-badge ${toneClass(tone)}`}>{value}</span>;
}

function DifferenceBadge({ diff }: { diff: number }) {
    if (diff === 0) return <span className="diff-badge neutral">差异：0</span>;
    return <span className={`diff-badge ${diff > 0 ? 'plus' : 'minus'}`}>差异：{diff > 0 ? '+' : ''}{diff}</span>;
}

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
    return (
        <header className="mobile-topbar">
            {onBack ? (
                <button type="button" className="top-icon" onClick={onBack} aria-label="返回"><ArrowLeft size={21} /></button>
            ) : (
                <span className="top-spacer" />
            )}
            <strong>{title}</strong>
            <button type="button" className="top-icon" aria-label="消息"><Bell size={18} /></button>
        </header>
    );
}

function SearchBar({ placeholder, onScan }: { placeholder: string; onScan: () => void }) {
    return (
        <div className="search-row">
            <div className="search-input"><Search size={16} /><span>{placeholder}</span></div>
            <button type="button" className="scan-btn" onClick={onScan} aria-label="扫码"><ScanLine size={19} /></button>
            <button type="button" className="text-link">搜索</button>
        </div>
    );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { label: string; value: T }[]; onChange: (value: T) => void }) {
    return (
        <div className="segmented">
            {options.map((option) => (
                <button type="button" key={option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function QuantityStepper({ value, onChange, compact = false }: { value: number; onChange: (value: number) => void; compact?: boolean }) {
    return (
        <div className={compact ? 'stepper compact' : 'stepper'}>
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))}><Minus size={14} /></button>
            <strong>{value}</strong>
            <button type="button" onClick={() => onChange(value + 1)}><Plus size={14} /></button>
        </div>
    );
}

function ModuleIcon({ icon: Icon, tone }: { icon: React.ElementType; tone: string }) {
    return <span className={`module-icon module-${tone}`}><Icon size={24} /></span>;
}

function HomePage({ role, setRole, openPage }: { role: Role; setRole: (role: Role) => void; openPage: (page: Page) => void }) {
    const visibleModules = modules.filter((item) => item.role === role || role === 'keeper');
    return (
        <main className="screen">
            <TopBar title="功能中心" />
            <section className="home-hero">
                <div>
                    <span>张航</span>
                    <h1>{role === 'keeper' ? '库存管理员工作台' : '项目负责人/班长工作台'}</h1>
                </div>
                <button type="button"><ScanLine size={16} /> 扫码</button>
            </section>

            <section className="role-switch" aria-label="角色切换">
                <button type="button" className={role === 'keeper' ? 'active' : ''} onClick={() => setRole('keeper')}>
                    <Warehouse size={16} /> 库存管理员
                </button>
                <button type="button" className={role === 'leader' ? 'active' : ''} onClick={() => setRole('leader')}>
                    <UserRound size={16} /> 项目负责人/班长
                </button>
            </section>

            <section className="quick-grid">
                <button type="button"><ModuleIcon icon={UserRound} tone="orange" />队员入职</button>
                <button type="button"><ModuleIcon icon={CalendarDays} tone="cyan" />考勤汇总</button>
                <button type="button"><ModuleIcon icon={ShieldCheck} tone="mint" />可视化调度</button>
            </section>

            <h2 className="group-title">装备管理</h2>
            <section className="module-grid">
                {visibleModules.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button type="button" key={item.page} onClick={() => openPage(item.page)}>
                            <ModuleIcon icon={Icon} tone={item.tone} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </section>

            <section className="notice-card">
                <ShieldCheck size={18} />
                <div>
                    <strong>{role === 'keeper' ? '仓库盘点会锁定出入库业务' : '项目和甲方装备分开盘点'}</strong>
                    <p>{role === 'keeper' ? '提交盘点后自动恢复库存流转，差异进入复核。' : '甲方装备不计入公司成本，支持快速添加和异常标记。'}</p>
                </div>
            </section>

            <nav className="bottom-tabs">
                <button type="button" className="active"><Home size={19} />功能中心</button>
                <button type="button"><ClipboardList size={19} />审批</button>
                <button type="button"><Bell size={19} />消息</button>
                <button type="button"><UserRound size={19} />我的</button>
            </nav>
        </main>
    );
}

function TaskCard({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
    return (
        <button type="button" className="task-card" onClick={() => onOpen(task)}>
            <div className="card-head">
                <span className="mono">{task.id}</span>
                <StatusBadge value={task.status} tone={task.tone} />
            </div>
            <h3>{task.title}</h3>
            <dl>
                <div><dt>范围</dt><dd>{task.subtitle}</dd></div>
                <div><dt>经办人</dt><dd>{task.handler}</dd></div>
                <div><dt>日期</dt><dd>{task.date}</dd></div>
            </dl>
            <div className="card-foot">
                <span>{task.lines.length} 项装备</span>
                <ChevronRight size={18} />
            </div>
        </button>
    );
}

function flowTerms(flowKind: FlowKind) {
    if (flowKind === 'inbound') {
        return { plan: '应收', done: '实收', todo: '待收', quantity: '实收数量', action: '扫码验收单件', doneAll: '已全部验收', empty: '尚未扫码验收唯一编号' };
    }
    if (flowKind === 'outbound') {
        return { plan: '应发', done: '实发', todo: '待发', quantity: '实发数量', action: '扫码复核单件', doneAll: '已全部复核', empty: '尚未扫码复核唯一编号' };
    }
    return { plan: '应调', done: '已核', todo: '待核', quantity: '实调数量', action: '扫码核验单件', doneAll: '已全部核验', empty: '尚未扫码核验唯一编号' };
}

function LineCard({ line, onUpdate, mode = 'flow', flowKind = 'inbound' }: { line: Line; onUpdate: (line: Line) => void; mode?: DetailMode; flowKind?: FlowKind }) {
    const diff = diffOf(line);
    const isCheckMode = mode === 'stock' || mode === 'project' || mode === 'client';
    const scannedCodes = line.assetCodes ?? [];
    const remaining = Math.max(0, line.book - line.actual);
    const terms = flowTerms(flowKind);

    function scanUniqueAsset() {
        if (scannedCodes.length >= line.book) return;
        const nextCode = `${line.code}-${String(scannedCodes.length + 1).padStart(4, '0')}`;
        const nextCodes = [...scannedCodes, nextCode];
        onUpdate({ ...line, oneCode: true, assetCodes: nextCodes, actual: nextCodes.length });
    }

    function undoUniqueAsset() {
        const nextCodes = scannedCodes.slice(0, -1);
        onUpdate({ ...line, assetCodes: nextCodes, actual: nextCodes.length });
    }

    function scanStockAsset() {
        const nextCode = `${line.code}-${String(line.actual + 1).padStart(4, '0')}`;
        onUpdate({ ...line, assetCodes: [...scannedCodes.slice(-2), nextCode], actual: line.actual + 1 });
    }

    function undoStockAsset() {
        if (scannedCodes.length === 0 || line.actual === 0) return;
        onUpdate({ ...line, assetCodes: scannedCodes.slice(0, -1), actual: line.actual - 1 });
    }

    if (mode === 'flow') {
        return (
            <article className={line.oneCode ? 'line-card flow-card one-code-card' : 'line-card flow-card'}>
                <div className="line-title">
                    <div>
                        <strong>{line.code} {line.name}</strong>
                        <span>分类：{line.category} · 单位：{line.unit}</span>
                    </div>
                    {line.oneCode && <span className="one-code-mark">一物一码</span>}
                </div>
                <div className="line-meta">
                    <span>来源：{line.supplier}</span>
                    <span>说明：{line.note}</span>
                </div>

                <div className="flow-progress-grid">
                    <div><span>{terms.plan}</span><strong>{line.book}</strong></div>
                    <div><span>{line.oneCode ? '已扫码' : terms.done}</span><strong>{line.actual}</strong></div>
                    <div className={remaining === 0 ? 'done' : 'todo'}><span>{terms.todo}</span><strong>{remaining}</strong></div>
                </div>

                {line.oneCode ? (
                    <div className="unique-check">
                        <button type="button" className="scan-asset-btn" onClick={scanUniqueAsset} disabled={remaining === 0}>
                            <ScanLine size={16} />{remaining === 0 ? terms.doneAll : terms.action}
                        </button>
                        <button type="button" className="undo-scan-btn" onClick={undoUniqueAsset} disabled={scannedCodes.length === 0}>撤销</button>
                        <div className="asset-code-list">
                            {scannedCodes.length === 0 ? (
                                <span className="empty-code">{terms.empty}</span>
                            ) : (
                                scannedCodes.map((code) => <span key={code}>{code}</span>)
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flow-quantity-row">
                        <span>快速确认本次{terms.quantity}</span>
                        <QuantityStepper value={line.actual} onChange={(value) => onUpdate({ ...line, actual: value })} compact />
                    </div>
                )}
            </article>
        );
    }

    return (
        <article className={line.oneCode ? 'line-card stock-one-code-card' : 'line-card'}>
            <div className="line-title">
                <div>
                    <strong>{line.code} {line.name}</strong>
                    <span>分类：{line.category}</span>
                </div>
                {line.oneCode ? <span className="one-code-mark">一物一码</span> : isCheckMode ? <DifferenceBadge diff={diff} /> : <span className="diff-badge neutral">数量：{line.actual}</span>}
            </div>
            <div className="line-meta">
                <span>供应商：{line.supplier}</span>
                <span>单位：{line.unit}</span>
                <span>备注：{line.note}</span>
            </div>
            {line.oneCode ? (
                <div className="stock-scan-check">
                    <div className="stock-scan-summary">
                        <div><span>系统库存</span><strong>{line.book}</strong></div>
                        <div><span>已扫码</span><strong>{line.actual}</strong></div>
                        <div className={diff === 0 ? 'neutral' : diff > 0 ? 'plus' : 'minus'}><span>差异</span><strong>{diff > 0 ? '+' : ''}{diff}</strong></div>
                    </div>
                    <div className="stock-scan-actions">
                        <button type="button" className="scan-asset-btn" onClick={scanStockAsset}><ScanLine size={18} />扫码确认一台</button>
                        <button type="button" className="undo-scan-btn" onClick={undoStockAsset} disabled={scannedCodes.length === 0}>撤销</button>
                    </div>
                    <div className="stock-recent-codes">
                        <span>最近扫码</span>
                        <div>{scannedCodes.length > 0 ? scannedCodes.map((code) => <code key={code}>{code}</code>) : <em>暂无扫码记录</em>}</div>
                    </div>
                </div>
            ) : (
                <div className="line-counts">
                    <span>{mode === 'project' ? '项目领用' : mode === 'client' ? '登记数量' : mode === 'stock' ? '系统库存' : '单据数量'}：{line.book}</span>
                    <label>
                        {mode === 'client' ? '盘点数量' : '实际库存'}：
                        <QuantityStepper value={line.actual} onChange={(value) => onUpdate({ ...line, actual: value })} compact />
                    </label>
                </div>
            )}
        </article>
    );
}

function DetailSheet({
    task,
    title,
    submitText,
    lines,
    setLines,
    onClose,
    onToast,
    mode,
    flowKind = 'inbound',
}: {
    task: Task;
    title: string;
    submitText: string;
    lines: Line[];
    setLines: (lines: Line[]) => void;
    onClose: () => void;
    onToast: (text: string) => void;
    mode?: DetailMode;
    flowKind?: FlowKind;
}) {
    const detailMode = mode ?? 'flow';
    const isCheckMode = detailMode === 'stock' || detailMode === 'project' || detailMode === 'client';
    const [locked, setLocked] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [showClientForm, setShowClientForm] = useState(false);
    const [clientDraft, setClientDraft] = useState({
        name: '院方备用对讲机',
        category: '甲方信息化设备',
        location: '门诊大厅岗',
        quantity: 1,
        unit: '台',
        note: '现场新增登记',
        hasPhoto: false,
    });

    function updateLine(index: number, nextLine: Line) {
        setLines(lines.map((line, lineIndex) => (lineIndex === index ? nextLine : line)));
    }

    function addClientLine() {
        const nextIndex = lines.length + 1;
        setLines([
            ...lines,
            {
                code: `JFNEW${nextIndex}`,
                name: clientDraft.name || '新增甲方装备',
                category: clientDraft.category || '甲方现场物资',
                supplier: '山东大学齐鲁医院',
                unit: clientDraft.unit || '件',
                book: clientDraft.quantity,
                actual: clientDraft.quantity,
                note: `${clientDraft.location || '未填写位置'} · ${clientDraft.hasPhoto ? '已上传照片' : clientDraft.note || '补充登记'}`,
            },
        ]);
        setShowClientForm(false);
        onToast('已加入甲方装备盘点清单');
    }

    return (
        <div className="sheet-backdrop">
            <section className="detail-sheet">
                <TopBar title={title} onBack={onClose} />
                <div className="sheet-body">
                    <section className="form-card">
                        <Field label={isCheckMode ? '盘点名称' : '单据名称'} value={task.title} required />
                        <Field label={isCheckMode ? '项目/仓库' : '来源/目标'} value={task.subtitle} required arrow />
                        <Field label="经办人" value={task.handler} required />
                        <Field label="经办时间" value={task.date} required />
                        <Field label="说明" value={detailMode === 'client' ? '甲方装备盘点，不计入公司装备成本' : detailMode === 'flow' ? '按仓储单据完成收发调业务' : '--'} />
                    </section>

                    {detailMode === 'stock' && !locked && (
                        <section className="lock-card">
                            <p>开始盘点后即锁定仓库，暂停出入库业务，盘点提交后自动恢复。</p>
                            <button type="button" onClick={() => setLocked(true)}>开始盘点</button>
                        </section>
                    )}

                    <div className="sticky-search">
                        <SearchBar placeholder="请输入编号或扫码搜索" onScan={() => onToast('已模拟扫码：FZ0002 一物一码对讲机')} />
                        {detailMode === 'client' && <button type="button" className="inline-add" onClick={() => setShowClientForm((visible) => !visible)}><Plus size={15} />添加甲方装备</button>}
                        {(detailMode === 'stock' || detailMode === 'project') && <label className="checkbox-line"><input type="checkbox" /> 显示无库存装备</label>}
                    </div>

                    {detailMode === 'client' && showClientForm && (
                        <section className="client-add-card">
                            <div className="client-add-title">
                                <strong>录入甲方装备</strong>
                                <button type="button" onClick={() => setShowClientForm(false)}>取消</button>
                            </div>
                            <button
                                type="button"
                                className={clientDraft.hasPhoto ? 'photo-upload has-photo' : 'photo-upload'}
                                onClick={() => {
                                    setClientDraft({ ...clientDraft, hasPhoto: true });
                                    onToast('已模拟上传照片');
                                }}
                            >
                                <Camera size={24} />
                                <span>{clientDraft.hasPhoto ? '已上传现场照片' : '拍照/上传照片'}</span>
                                <small>{clientDraft.hasPhoto ? '方便后续按照片对应实物' : '推荐先拍照，少填字也能识别'}</small>
                            </button>
                            <label>
                                <span>装备名称</span>
                                <input value={clientDraft.name} onChange={(event) => setClientDraft({ ...clientDraft, name: event.target.value })} />
                            </label>
                            <label>
                                <span>所在位置/责任岗</span>
                                <input value={clientDraft.location} onChange={(event) => setClientDraft({ ...clientDraft, location: event.target.value })} />
                            </label>
                            <div className="client-add-grid">
                                <label>
                                    <span>数量</span>
                                    <QuantityStepper value={clientDraft.quantity} onChange={(quantity) => setClientDraft({ ...clientDraft, quantity })} />
                                </label>
                                <label>
                                    <span>单位</span>
                                    <select value={clientDraft.unit} onChange={(event) => setClientDraft({ ...clientDraft, unit: event.target.value })}>
                                        <option>台</option>
                                        <option>件</option>
                                        <option>组</option>
                                        <option>个</option>
                                        <option>套</option>
                                    </select>
                                </label>
                            </div>
                            <details className="optional-fields">
                                <summary>补充信息</summary>
                                <label>
                                    <span>装备分类</span>
                                    <select value={clientDraft.category} onChange={(event) => setClientDraft({ ...clientDraft, category: event.target.value })}>
                                        <option>甲方固定资产</option>
                                        <option>甲方信息化设备</option>
                                        <option>甲方现场物资</option>
                                        <option>甲方消防设施</option>
                                    </select>
                                </label>
                                <label>
                                    <span>备注</span>
                                    <input value={clientDraft.note} onChange={(event) => setClientDraft({ ...clientDraft, note: event.target.value })} />
                                </label>
                            </details>
                            <button type="button" className="client-add-submit" onClick={addClientLine}>加入盘点清单</button>
                        </section>
                    )}

                    <section className="lines-stack">
                        {lines.map((line, index) => (
                            <LineCard key={`${line.code}-${index}`} line={line} mode={detailMode} flowKind={flowKind} onUpdate={(nextLine) => updateLine(index, nextLine)} />
                        ))}
                    </section>
                </div>

                <footer className="bottom-actions">
                    <button type="button" className="secondary-action" onClick={() => onToast('已保存草稿')}>保存</button>
                    <button type="button" className="primary-action" onClick={() => setConfirming(true)}>{submitText}</button>
                </footer>

                {confirming && (
                    <div className="dialog-backdrop">
                        <section className="confirm-dialog">
                            <CheckCircle2 size={38} />
                            <p>{isCheckMode ? `${submitText}后将生成盘点结果，当前差异 ${totalDiff(lines)} 件。` : `${submitText}后将更新单据状态和库存流转，当前共 ${lines.length} 项装备。`}</p>
                            <button type="button" onClick={() => { setConfirming(false); onToast(`${submitText}成功`); onClose(); }}>确定</button>
                            <button type="button" className="plain" onClick={() => setConfirming(false)}>取消</button>
                        </section>
                    </div>
                )}
            </section>
        </div>
    );
}

function Field({ label, value, required, arrow }: { label: string; value: string; required?: boolean; arrow?: boolean }) {
    return (
        <div className="field-row">
            <span>{label}{required && <em>*</em>}</span>
            <strong>{value}</strong>
            {arrow && <ChevronRight size={18} />}
        </div>
    );
}

function FlowPage({ onBack, onToast }: { onBack: () => void; onToast: (text: string) => void }) {
    const [mode, setMode] = useState<FlowMode>('outbound');
    const [active, setActive] = useState<Task | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    const tasks = mode === 'inbound' ? inboundTasks : outboundTasks;

    function openTask(task: Task) {
        setActive(task);
        setLines(task.lines);
    }

    return (
        <main className="screen">
            <TopBar title="出入库管理" onBack={onBack} />
            <div className="page-content">
                <section className="select-card flow-warehouse-card">
                    <span>当前仓库</span>
                    <strong>集团总仓</strong>
                    <ChevronRight size={18} />
                </section>
                <Segmented value={mode} options={[{ label: '出库', value: 'outbound' }, { label: '入库', value: 'inbound' }]} onChange={setMode} />
                <SearchBar placeholder="请输入单号或扫码搜索" onScan={() => onToast('已模拟扫码识别装备编号')} />
                <section className="summary-strip">
                    <span>{mode === 'inbound' ? '今日待入库 2 单' : '今日待出库 1 单'}</span>
                    <button type="button"><Filter size={15} />筛选</button>
                </section>
                <section className="task-list">{tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={openTask} />)}</section>
                <button type="button" className="floating-create" onClick={() => openTask(tasks[0])}>{mode === 'inbound' ? '新增入库' : '新增出库'}</button>
            </div>
            {active && (
                <DetailSheet
                    task={active}
                    title={mode === 'inbound' ? '入库清单' : '出库清单'}
                    submitText={mode === 'inbound' ? '提交入库' : '确认出库'}
                    lines={lines}
                    setLines={setLines}
                    onClose={() => setActive(null)}
                    onToast={onToast}
                    flowKind={mode}
                />
            )}
        </main>
    );
}

function TransferPage({ onBack, onToast }: { onBack: () => void; onToast: (text: string) => void }) {
    const [active, setActive] = useState<Task | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    return (
        <main className="screen">
            <TopBar title="调拨" onBack={onBack} />
            <div className="page-content">
                <section className="select-card">
                    <span>调拨范围</span>
                    <strong>集团仓 / 分公司仓 / 项目点</strong>
                    <ChevronRight size={18} />
                </section>
                <SearchBar placeholder="请输入调拨单号或装备编号" onScan={() => onToast('已模拟扫码添加调拨装备')} />
                <section className="task-list">
                    {transferTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={(next) => { setActive(next); setLines(next.lines); }} />)}
                </section>
                <button type="button" className="floating-create" onClick={() => { setActive(transferTasks[0]); setLines(transferTasks[0].lines); }}>新增调拨</button>
            </div>
            {active && (
                <DetailSheet
                    task={active}
                    title="调拨明细"
                    submitText={active.status === '在途' ? '到货确认' : '发起调拨'}
                    lines={lines}
                    setLines={setLines}
                    onClose={() => setActive(null)}
                    onToast={onToast}
                    flowKind="transfer"
                />
            )}
        </main>
    );
}

function StocktakePage({ onBack, onToast }: { onBack: () => void; onToast: (text: string) => void }) {
    const [active, setActive] = useState<Task | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    return (
        <main className="screen">
            <TopBar title="库存盘点" onBack={onBack} />
            <div className="page-content">
                <section className="select-card">
                    <span>仓库</span>
                    <strong>历下仓库1</strong>
                    <ChevronRight size={18} />
                </section>
                <Segmented value="all" options={[{ label: '全部状态', value: 'all' }, { label: '进行中', value: 'doing' }, { label: '待开始', value: 'waiting' }, { label: '已完成', value: 'done' }]} onChange={() => undefined} />
                <section className="task-list">
                    {stockTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={(next) => { setActive(next); setLines(next.lines); }} />)}
                </section>
                <button type="button" className="floating-create" onClick={() => { setActive(stockTasks[0]); setLines(stockTasks[0].lines); }}>新增盘点</button>
            </div>
            {active && (
                <DetailSheet
                    task={active}
                    title="盘点清单"
                    submitText="提交盘点"
                    lines={lines}
                    setLines={setLines}
                    onClose={() => setActive(null)}
                    onToast={onToast}
                    mode="stock"
                />
            )}
        </main>
    );
}

function ProjectCheckPage({ onBack, onToast }: { onBack: () => void; onToast: (text: string) => void }) {
    const [scope, setScope] = useState<CheckScope>('project');
    const [active, setActive] = useState<Task | null>(null);
    const [lines, setLines] = useState<Line[]>([]);
    const tasks = useMemo(() => scope === 'project' ? [projectTasks[0]] : [projectTasks[1]], [scope]);

    return (
        <main className="screen">
            <TopBar title="项目装备盘点" onBack={onBack} />
            <div className="page-content">
                <section className="select-card">
                    <span>项目</span>
                    <strong>山东大学齐鲁医院</strong>
                    <ChevronRight size={18} />
                </section>
                <section className="select-card">
                    <span>部门/班组</span>
                    <strong>{scope === 'project' ? '历城区域1大队' : '门急诊夜班'}</strong>
                    <ChevronRight size={18} />
                </section>
                <Segmented value={scope} options={[{ label: '项目装备', value: 'project' }, { label: '甲方装备', value: 'client' }]} onChange={setScope} />
                <section className="hint-card">
                    <FileCheck2 size={18} />
                    <p>{scope === 'project' ? '核对公司申领到项目的装备，保留领用数、实盘数和差异。' : '核对甲方提供、项目代管或现场使用的装备，支持快速补充新增装备。'}</p>
                </section>
                <section className="task-list">
                    {tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={(next) => { setActive(next); setLines(scope === 'project' ? projectLines : clientLines); }} />)}
                </section>
                <button type="button" className="floating-create" onClick={() => { setActive(tasks[0]); setLines(scope === 'project' ? projectLines : clientLines); }}>
                    {scope === 'project' ? '新增项目盘点' : '新增甲方盘点'}
                </button>
            </div>
            {active && (
                <DetailSheet
                    task={active}
                    title={scope === 'project' ? '项目盘点清单' : '甲方装备盘点'}
                    submitText="提交盘点"
                    lines={lines}
                    setLines={setLines}
                    onClose={() => setActive(null)}
                    onToast={onToast}
                    mode={scope}
                />
            )}
        </main>
    );
}

function Toast({ text }: { text: string }) {
    return <div className="toast"><Check size={16} />{text}</div>;
}

export default function MobileEquipmentManagement() {
    const { page: routePage, setPage } = useHashPage(equipmentPageRoute);
    const page: Page = isEquipmentPage(routePage) ? routePage : 'home';
    const [role, setRole] = useState<Role>('keeper');
    const [toast, setToast] = useState('');

    function showToast(text: string) {
        setToast(text);
        window.setTimeout(() => setToast(''), 1800);
    }

    return (
        <div className="prototype-stage">
            <div className="phone-shell">
                <div className="statusbar"><span>10:25</span><span>5G 83</span></div>
                {page === 'home' && <HomePage role={role} setRole={setRole} openPage={setPage} />}
                {page === 'flow' && <FlowPage onBack={() => setPage('home')} onToast={showToast} />}
                {page === 'transfer' && <TransferPage onBack={() => setPage('home')} onToast={showToast} />}
                {page === 'stocktake' && <StocktakePage onBack={() => setPage('home')} onToast={showToast} />}
                {page === 'project-check' && <ProjectCheckPage onBack={() => setPage('home')} onToast={showToast} />}
                {toast && <Toast text={toast} />}
            </div>
        </div>
    );
}
