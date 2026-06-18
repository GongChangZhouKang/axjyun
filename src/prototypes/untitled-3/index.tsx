/**
 * @name 项目管理-项目装备标签页
 */
import React, { useMemo, useState } from 'react';
import {
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    ClipboardList,
    Coins,
    Download,
    Eye,
    FileText,
    Gauge,
    HardHat,
    Home,
    LayoutDashboard,
    Menu,
    PackageCheck,
    PackageOpen,
    RefreshCw,
    Search,
    Settings,
    ShieldCheck,
    User,
    Users,
    Warehouse,
    X,
} from 'lucide-react';
import './style.css';

type EquipmentTab = 'project' | 'guard' | 'client';

type CostLine = {
    label: string;
    value: string;
};

type TraceLine = {
    source: string;
    method: string;
    qty: string;
    unitCost: string;
    amount: number;
    note: string;
};

type Row = {
    id: string;
    name: string;
    category: string;
    source: string;
    owner: string;
    qty: number;
    actual: number;
    returned?: number;
    cost: number;
    purchaseAmount?: number;
    costMode: string;
    costMethod: '移动加权平均' | '批次管理' | '单件折旧' | '不归集';
    traceSource: string;
    costLines: CostLine[];
    traceLines: TraceLine[];
    occupiedPeriod?: string;
    collectTime: string;
    status: '在用' | '待归还' | '已归还' | '正常' | '待复核' | '异常';
    note: string;
};

const projectRows: Row[] = [
    {
        id: 'LY-202605-0081',
        name: '数字对讲机',
        category: '执勤通讯',
        source: '集团总仓',
        owner: '鲁医院项目装备柜',
        qty: 18,
        actual: 18,
        returned: 0,
        cost: 580,
        purchaseAmount: 6948,
        costMode: '单件折旧 / 直线法 / 占用31天',
        costMethod: '单件折旧',
        traceSource: 'LY2026050081 / 入库单 RK20260517004',
        costLines: [
            { label: '折旧来源', value: '入库录码写入采购原值 ¥386/台，折旧规则为36个月直线法、残值率5%' },
            { label: '计提时机', value: '项目确认领用后开始，归还确认后停止' },
            { label: '计算过程', value: '18台中3台本期计提样例：31天 × ¥0.34/天 × 55台次 = ¥580' },
        ],
        traceLines: [
            { source: 'EQ-DJ-202606-0021', method: '单件折旧', qty: '31天', unitCost: '¥0.34/天', amount: 19, note: '2026-05-18领用，未归还' },
            { source: 'EQ-DJ-202606-0022', method: '单件折旧', qty: '31天', unitCost: '¥0.34/天', amount: 19, note: '2026-05-18领用，未归还' },
            { source: 'EQ-DJ-202606-0023', method: '单件折旧', qty: '31天', unitCost: '¥0.34/天', amount: 19, note: '2026-05-18领用，未归还' },
        ],
        occupiedPeriod: '2026-05-18 至今',
        collectTime: '2026-05-18 09:42',
        status: '在用',
        note: '当前项目在用，归还后停止向本项目归集；后续发放至其他项目后按新占用期间继续归集',
    },
    {
        id: 'LY-202605-0082',
        name: '强光手电',
        category: '执勤照明',
        source: '历下分公司仓',
        owner: '夜班巡逻岗',
        qty: 12,
        actual: 12,
        returned: 0,
        cost: 1092,
        purchaseAmount: 1092,
        costMode: '移动加权平均 / 领用一次归集',
        costMethod: '移动加权平均',
        traceSource: 'LY2026050082 / 历下分公司仓库存台账',
        costLines: [
            { label: '库存加权单价', value: '库存金额 ¥3,276 / 库存 36 个 = ¥91/个' },
            { label: '归集时点', value: '项目领用确认时一次性归集至本项目' },
            { label: '计算过程', value: '12个 × ¥91 = ¥1,092' },
        ],
        traceLines: [
            { source: 'KC-ZQ0208', method: '移动加权平均', qty: '12个', unitCost: '¥91/个', amount: 1092, note: '领用时固化加权单价，后续采购涨跌不影响本单' },
        ],
        occupiedPeriod: '2026-05-18 领用确认',
        collectTime: '2026-05-18 09:45',
        status: '在用',
        note: '按数量台账管理，领用即归集项目成本',
    },
    {
        id: 'LY-202606-0016',
        name: '防刺服',
        category: '被动防护装备',
        source: '集团总仓',
        owner: '门急诊固定岗',
        qty: 10,
        actual: 10,
        returned: 2,
        cost: 426,
        purchaseAmount: 6400,
        costMode: '批次管理 / 已归还2件停算',
        costMethod: '批次管理',
        traceSource: 'LY2026060016 / JDHC-20260527-77418',
        costLines: [
            { label: '批次来源', value: '优先扣减 2026-05 较早入库批次 PC-FC-202605-01' },
            { label: '订单来源', value: '入库单 RK20260528006 / 京东订单 JDHC-20260527-77418' },
            { label: '归集说明', value: '本期展示为项目占用期间摊销样例；批次原值和订单可追溯' },
        ],
        traceLines: [
            { source: 'PC-FC-202605-01', method: '批次管理', qty: '8件在用', unitCost: '¥620/件', amount: 426, note: '按先进先出优先扣减较早入库批次；已预归还2件，归还件不再继续向本项目归集' },
        ],
        occupiedPeriod: '2026-06-03 至今，已预归还2件',
        collectTime: '2026-06-03 14:18',
        status: '待归还',
        note: '已预归还2件，已归还单件停止归集，剩余在用单件继续按占用期间摊销',
    },
];

const guardRows: Row[] = [
    {
        id: 'RY-202605-0119',
        name: '春秋执勤服',
        category: '保安员服装',
        source: '分公司服装仓',
        owner: '张凯 / 门诊大厅岗',
        qty: 2,
        actual: 2,
        cost: 360,
        costMode: '个人装备 / 领用消耗归集',
        costMethod: '移动加权平均',
        traceSource: 'RY2026050119 / 分公司服装仓',
        costLines: [
            { label: '库存加权单价', value: '春秋执勤服加权单价 ¥180/套' },
            { label: '归集时点', value: '发放至保安员并关联项目岗位后一次归集' },
            { label: '计算过程', value: '2套 × ¥180 = ¥360' },
        ],
        traceLines: [
            { source: 'RY-202605-0119', method: '移动加权平均', qty: '2套', unitCost: '¥180/套', amount: 360, note: '张凯 / 门诊大厅岗领用' },
        ],
        occupiedPeriod: '2026-05-20 领用确认',
        collectTime: '2026-05-20 10:16',
        status: '在用',
        note: '随保安员调岗交接，成本已归集到本项目',
    },
    {
        id: 'RY-202605-0120',
        name: '执勤肩灯',
        category: '保安员随身装备',
        source: '项目装备柜',
        owner: '王宁 / 夜班巡逻岗',
        qty: 1,
        actual: 1,
        cost: 68,
        costMode: '个人装备 / 领用消耗归集',
        costMethod: '移动加权平均',
        traceSource: 'RY2026050120 / 项目装备柜',
        costLines: [
            { label: '库存加权单价', value: '执勤肩灯加权单价 ¥68/个' },
            { label: '归集时点', value: '从项目装备柜发放至个人后归集到项目' },
            { label: '计算过程', value: '1个 × ¥68 = ¥68' },
        ],
        traceLines: [
            { source: 'RY-202605-0120', method: '移动加权平均', qty: '1个', unitCost: '¥68/个', amount: 68, note: '王宁 / 夜班巡逻岗领用' },
        ],
        occupiedPeriod: '2026-05-20 领用确认',
        collectTime: '2026-05-20 10:22',
        status: '在用',
        note: '一人一件，离岗时由班长确认回收',
    },
    {
        id: 'RY-202606-0037',
        name: '防割手套',
        category: '消耗性防护',
        source: '集团总仓',
        owner: '李明 / 急诊入口岗',
        qty: 4,
        actual: 4,
        cost: 112,
        costMode: '消耗性防护 / 领用一次归集',
        costMethod: '移动加权平均',
        traceSource: 'RY2026060037 / 集团总仓',
        costLines: [
            { label: '库存加权单价', value: '防割手套加权单价 ¥28/双' },
            { label: '归集时点', value: '消耗性防护装备发放后一次归集' },
            { label: '计算过程', value: '4双 × ¥28 = ¥112' },
        ],
        traceLines: [
            { source: 'RY-202606-0037', method: '移动加权平均', qty: '4双', unitCost: '¥28/双', amount: 112, note: '李明 / 急诊入口岗领用' },
        ],
        occupiedPeriod: '2026-06-04 领用确认',
        collectTime: '2026-06-04 16:03',
        status: '在用',
        note: '按领用消耗计入项目月度装备成本',
    },
];

const clientRows: Row[] = [
    {
        id: 'JF-BA-0007',
        name: '院方消防柜',
        category: '甲方固定资产',
        source: '山东大学齐鲁医院',
        owner: '一号楼北门岗',
        qty: 2,
        actual: 2,
        cost: 0,
        costMode: '甲方资产 / 不归集',
        costMethod: '不归集',
        traceSource: '甲方提供',
        costLines: [
            { label: '成本规则', value: '甲方资产不进入公司库存成本和项目成本' },
            { label: '管理重点', value: '只记录保管责任、位置和盘点状态' },
        ],
        traceLines: [],
        occupiedPeriod: '甲方提供，项目代管',
        collectTime: '2026-05-15 11:30',
        status: '正常',
        note: '甲方提供，公司只登记保管责任和盘点状态',
    },
    {
        id: 'JF-BA-0012',
        name: '院区访客闸机手持终端',
        category: '甲方信息化设备',
        source: '山东大学齐鲁医院',
        owner: '门诊入口固定岗',
        qty: 4,
        actual: 4,
        cost: 0,
        costMode: '甲方资产 / 不归集',
        costMethod: '不归集',
        traceSource: '甲方提供',
        costLines: [
            { label: '成本规则', value: '甲方资产不进入公司成本归集' },
            { label: '管理重点', value: '损坏或异常需要走甲方确认' },
        ],
        traceLines: [],
        occupiedPeriod: '甲方提供，项目代管',
        collectTime: '2026-05-22 15:10',
        status: '正常',
        note: '不进入公司成本，盘点正常；异常损坏需走甲方确认',
    },
    {
        id: 'JF-BA-0019',
        name: '院方隔离护栏',
        category: '甲方现场物资',
        source: '山东大学齐鲁医院',
        owner: '急诊入口岗',
        qty: 16,
        actual: 15,
        cost: 0,
        costMode: '甲方资产 / 不归集',
        costMethod: '不归集',
        traceSource: '甲方提供',
        costLines: [
            { label: '成本规则', value: '甲方资产不归集公司装备成本' },
            { label: '异常说明', value: '盘点少1组，待项目负责人复核并同步甲方' },
        ],
        traceLines: [],
        occupiedPeriod: '甲方提供，项目代管',
        collectTime: '2026-06-01 08:20',
        status: '异常',
        note: '盘点少1组，已标记待项目负责人复核',
    },
];

const tabMap: Record<EquipmentTab, { label: string; rows: Row[]; hint: string }> = {
    project: {
        label: '项目装备',
        rows: projectRows,
        hint: '公司申领到项目的装备：低值易耗按领用一次归集；一物一码可复用装备按项目实际占用期间折旧或摊销。',
    },
    guard: {
        label: '保安员装备',
        rows: guardRows,
        hint: '发放到保安员个人或岗位的装备，展示责任人、在用数量和已归集的项目成本。',
    },
    client: {
        label: '甲方装备',
        rows: clientRows,
        hint: '甲方提供、项目代管或协助巡检的装备，只登记保管责任，不计入公司装备成本。',
    },
};

const menuGroups = [
    { icon: Gauge, label: '可视化调度' },
    { icon: LayoutDashboard, label: '智慧安检数据大屏' },
    { icon: ShieldCheck, label: '安保数据' },
    { icon: ClipboardCheck, label: '审批管理' },
    { icon: FileText, label: '合同管理' },
    { icon: BriefcaseBusiness, label: '项目管理', active: true },
    { icon: PackageCheck, label: '装备管理' },
    { icon: CalendarDays, label: '考勤管理' },
    { icon: Users, label: '督导管理' },
    { icon: User, label: '客户管理' },
    { icon: Settings, label: '组织架构管理' },
];

const projectSubMenu = ['人防项目', '铁路巡防项目', '可视化巡防', '安检项目', '安装人数统计', '临时勤务项目'];

const mainTabs = ['基本信息', '排班', '人员', '岗点', '考勤', '记录', '数据看板', '操作日志', '装备', '岗位补助', '评论', '设置'];

const currency = (value: number) => `¥${value.toLocaleString('zh-CN')}`;

function StatusPill({ status }: { status: Row['status'] }) {
    return <span className={`status-pill status-${status}`}>{status}</span>;
}

function SummaryCard({
    title,
    value,
    desc,
    icon,
    tone,
}: {
    title: string;
    value: string;
    desc: string;
    icon: React.ReactNode;
    tone: 'blue' | 'green' | 'amber' | 'slate';
}) {
    return (
        <section className={`summary-card summary-${tone}`}>
            <div className="summary-icon">{icon}</div>
            <div>
                <span>{title}</span>
                <strong>{value}</strong>
                <p>{desc}</p>
            </div>
        </section>
    );
}

function CostTraceTable({ rows }: { rows: TraceLine[] }) {
    if (!rows.length) {
        return <div className="empty-cost-line">甲方装备不计入公司成本，仅保留保管和盘点记录。</div>;
    }

    return (
        <table className="cost-trace-table">
            <thead>
                <tr>
                    <th>批次/编号</th>
                    <th>计价方式</th>
                    <th>数量/期间</th>
                    <th>单价/折旧率</th>
                    <th>归集金额</th>
                    <th>说明</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={`${row.source}-${row.amount}`}>
                        <td>{row.source}</td>
                        <td>{row.method}</td>
                        <td>{row.qty}</td>
                        <td>{row.unitCost}</td>
                        <td>{currency(row.amount)}</td>
                        <td>{row.note}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function App() {
    const [activeTab, setActiveTab] = useState<EquipmentTab>('project');
    const [selectedRow, setSelectedRow] = useState<Row | null>(null);
    const current = tabMap[activeTab];

    const summary = useMemo(() => {
        const companyRows = [...projectRows, ...guardRows];
        const collected = companyRows.reduce((sum, row) => sum + row.cost, 0);
        const pendingReturn = projectRows.reduce((sum, row) => sum + row.qty - (row.returned ?? 0), 0);
        return {
            collected,
            pendingReturn,
            guardQty: guardRows.reduce((sum, row) => sum + row.actual, 0),
            clientQty: clientRows.reduce((sum, row) => sum + row.actual, 0),
            depreciationCost: projectRows.filter((row) => row.costMethod === '单件折旧').reduce((sum, row) => sum + row.cost, 0),
        };
    }, []);

    return (
        <main className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">A</div>
                    <strong>智慧安保管理平台</strong>
                    <span>v 1.8.91</span>
                </div>
                <nav>
                    {menuGroups.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className={`side-item ${item.active ? 'active' : ''}`}>
                                <Icon size={16} />
                                <span>{item.label}</span>
                                <ChevronDown size={14} />
                            </div>
                        );
                    })}
                    <div className="submenu">
                        {projectSubMenu.map((item, index) => (
                            <span key={item} className={index === 0 ? 'sub-active' : ''}>{item}</span>
                        ))}
                    </div>
                </nav>
            </aside>

            <section className="workspace">
                <header className="topbar">
                    <div className="crumb-tabs">
                        <button type="button">首页</button>
                        <button type="button">人防项目</button>
                        <button type="button" className="selected">项目详情 <X size={13} /></button>
                    </div>
                    <div className="top-actions">
                        <span>2026-05-28 17:08:08</span>
                        <Bell size={18} />
                        <div className="account"><User size={17} /> 山东振邦保安服务有限责任公司 <ChevronDown size={14} /></div>
                    </div>
                </header>

                <div className="content">
                    <section className="project-title">
                        <div>
                            <h1>山东大学齐鲁医院</h1>
                            <span className="running">进行中</span>
                            <span>结束时间：2027-03-28</span>
                        </div>
                    </section>

                    <section className="project-metrics">
                        <div className="metric-card person-card">
                            <User size={22} />
                            <div><strong>负责人</strong><span>邢飞</span></div>
                        </div>
                        <div className="metric-card station-card">
                            <Menu size={24} />
                            <div><strong>岗点</strong><span>11</span></div>
                            <div><strong>巡逻岗</strong><span>6</span></div>
                            <div><strong>固定岗</strong><span>5</span></div>
                        </div>
                        <div className="metric-card headcount-card">
                            <Users size={24} />
                            <div><strong>总人数</strong><span>92</span></div>
                            <div><strong>在岗</strong><span>35</span></div>
                        </div>
                    </section>

                    <nav className="project-tabs" aria-label="项目详情标签页">
                        {mainTabs.map((tab) => (
                            <button type="button" key={tab} className={tab === '装备' ? 'active' : ''}>{tab}</button>
                        ))}
                    </nav>

                    <section className="equipment-page">
                        <div className="equipment-header">
                            <div>
                                <h2>装备</h2>
                                <p>项目负责人查看申领到项目、发放到保安员以及甲方提供的装备，重点跟踪占用期间成本、归还停算和撤点归还。</p>
                            </div>
                            <div className="header-actions">
                                <button type="button" className="ghost-btn"><Download size={16} />导出</button>
                                <button type="button" className="primary-btn"><PackageOpen size={16} />发起申领</button>
                            </div>
                        </div>

                        <section className="summary-grid">
                            <SummaryCard
                                tone="blue"
                                icon={<Coins size={22} />}
                                title="本期已归集装备成本"
                                value={currency(summary.collected)}
                                desc="移动加权平均、批次管理、单件折旧分口径归集"
                            />
                            <SummaryCard
                                tone="amber"
                                icon={<RefreshCw size={22} />}
                                title="撤点待归还项目装备"
                                value={`${summary.pendingReturn} 件`}
                                desc="项目撤点时需归还公司资产，归还后更新台账"
                            />
                            <SummaryCard
                                tone="green"
                                icon={<HardHat size={22} />}
                                title="单件折旧费用"
                                value={currency(summary.depreciationCost)}
                                desc="按领用时间、归还时间和折旧规则计算"
                            />
                            <SummaryCard
                                tone="slate"
                                icon={<Warehouse size={22} />}
                                title="甲方装备备案"
                                value={`${summary.clientQty} 件`}
                                desc="不归集公司成本，仅记录保管责任和异常"
                            />
                        </section>

                        <section className="cost-rule-card">
                            <Coins size={18} />
                            <div>
                                <strong>一物一码可复用装备不按整件采购成本一次性归集</strong>
                                <p>按装备在本项目的实际占用期间计算折旧或摊销成本；归还后停止向原项目归集，再次发放到其他项目时按新的使用期间继续归集。</p>
                            </div>
                        </section>

                        <div className="sub-tabs">
                            {(Object.keys(tabMap) as EquipmentTab[]).map((key) => (
                                <button
                                    type="button"
                                    key={key}
                                    className={activeTab === key ? 'active' : ''}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {tabMap[key].label}
                                </button>
                            ))}
                        </div>

                        <section className="filters">
                            <label><span>装备所属：</span><input value="山东大学齐鲁医院" readOnly /></label>
                            <label><span>装备分类：</span><select value="全部" onChange={() => undefined}><option>全部</option></select></label>
                            <label><span>计价方式：</span><select value="全部方式" onChange={() => undefined}><option>全部方式</option></select></label>
                            <label><span>归还状态：</span><select value="全部状态" onChange={() => undefined}><option>全部状态</option></select></label>
                            <div className="filter-actions">
                                <button type="button" className="primary-btn"><Search size={15} />查询</button>
                                <button type="button" className="plain-btn">重置</button>
                            </div>
                        </section>

                        <section className="table-card">
                            <div className="table-title">
                                <div>
                                    <h3>{current.label}</h3>
                                    <p>{current.hint}</p>
                                </div>
                                {activeTab === 'project' && <span className="return-note">撤点归还要求：项目装备需归还；保安员个人消耗装备按规则核销。</span>}
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>单据/编号</th>
                                            <th>装备</th>
                                            <th>来源</th>
                                            <th>责任位置/人员</th>
                                            <th>领用数量</th>
                                            <th>实际数量</th>
                                            {activeTab === 'project' && <th>已归还</th>}
                                            <th>已归集成本</th>
                                            <th>成本口径</th>
                                            <th>来源追溯</th>
                                            <th>归集时间</th>
                                            <th>{activeTab === 'client' ? '盘点状态' : '状态'}</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current.rows.map((row) => (
                                            <tr key={row.id}>
                                                <td className="mono">{row.id}</td>
                                                <td><strong>{row.name}</strong><span>{row.category}</span></td>
                                                <td>{row.source}</td>
                                                <td>{row.owner}</td>
                                                <td>{row.qty}</td>
                                                <td>{row.actual}</td>
                                                {activeTab === 'project' && <td>{row.returned ?? 0}</td>}
                                                <td className={row.cost === 0 ? 'muted' : 'cost'}>{row.cost === 0 ? '不归集' : currency(row.cost)}</td>
                                                <td><span>{row.costMode}</span></td>
                                                <td>{row.traceSource}</td>
                                                <td>{row.collectTime}</td>
                                                <td><StatusPill status={row.status} /></td>
                                                <td><button type="button" className="link-btn" onClick={() => setSelectedRow(row)}><Eye size={14} />查看明细</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <footer className="pager">
                                <span>共 {current.rows.length} 条</span>
                                <button type="button"><ChevronLeft size={15} /></button>
                                <button type="button" className="page-no">1</button>
                                <button type="button"><ChevronRight size={15} /></button>
                                <select value="10条/页" onChange={() => undefined}><option>10条/页</option></select>
                            </footer>
                        </section>
                    </section>
                </div>
            </section>

            {selectedRow && (
                <div className="modal-backdrop" onClick={() => setSelectedRow(null)}>
                    <section className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                        <header>
                            <div>
                                <h2>{selectedRow.name}明细</h2>
                                <p>{selectedRow.id}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedRow(null)}><X size={18} /></button>
                        </header>
                        <div className="detail-grid">
                            <span>装备分类</span><strong>{selectedRow.category}</strong>
                            <span>来源</span><strong>{selectedRow.source}</strong>
                            <span>责任位置/人员</span><strong>{selectedRow.owner}</strong>
                            <span>数量</span><strong>{selectedRow.actual} / 领用 {selectedRow.qty}</strong>
                            <span>采购原值</span><strong>{selectedRow.purchaseAmount ? currency(selectedRow.purchaseAmount) : '不适用'}</strong>
                            <span>已归集成本</span><strong>{selectedRow.cost === 0 ? '不计入公司装备成本' : currency(selectedRow.cost)}</strong>
                            <span>成本口径</span><strong>{selectedRow.costMode}</strong>
                            <span>计价方式</span><strong>{selectedRow.costMethod}</strong>
                            <span>来源追溯</span><strong>{selectedRow.traceSource}</strong>
                            <span>占用期间</span><strong>{selectedRow.occupiedPeriod ?? selectedRow.collectTime}</strong>
                            <span>{activeTab === 'client' ? '盘点状态' : '当前状态'}</span><strong><StatusPill status={selectedRow.status} /></strong>
                            <span>处理提示</span><strong>{selectedRow.note}</strong>
                        </div>
                        <section className="cost-detail-panel">
                            <h3>成本归集详情</h3>
                            <div className="cost-line-grid">
                                {selectedRow.costLines.map((line) => (
                                    <div key={line.label}>
                                        <span>{line.label}</span>
                                        <strong>{line.value}</strong>
                                    </div>
                                ))}
                            </div>
                            <CostTraceTable rows={selectedRow.traceLines} />
                        </section>
                        <footer>
                            <button type="button" className="plain-btn" onClick={() => setSelectedRow(null)}>关闭</button>
                            <button type="button" className="primary-btn"><ClipboardList size={16} />查看流转记录</button>
                        </footer>
                    </section>
                </div>
            )}
        </main>
    );
}

export default App;
