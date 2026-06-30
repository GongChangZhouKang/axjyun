import React, {
    useState,
} from 'react';
import {
    Send,
    UserPlus,
    UserRound,
} from 'lucide-react';
import {
    StatusTone,
    NumberedAsset,
    LineItem,
    StocktakeItem,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    ApprovalStep,
    OrderRow,
    PaymentRecord,
    InvoiceRecord,
    OrderWarehouseAllocation,
    InventoryRow,
    FlowRow,
    TraceContext,
    StocktakeRow,
    BatchCostDetail,
    DepreciationCostDetail,
    CostTraceRow,
    ActionItem,
    BusinessWindowState,
    TraceRelationActions,
} from './types';
import {
    purchaseDemandFlowNodes,
    purchasePlanFlowNodes,
    equipmentItems,
    orders,
    inventory,
    inboundRows,
    transfers,
    stocktakes,
    issues,
    costTraceRows,
    statusTone,
} from './data';
import {
    currency,
    numberText,
    lineQty,
    lineAmount,
    itemSummary,
    orderFinanceSummary,
    demandWarehouse,
    demandItemAllocationSummary,
    demandAllocationTotals,
    displayDemandIncludeStatus,
    planByCode,
    demandByCode,
    relatedOrdersForPlan,
    orderAllocations,
    displayPlanOrderGenerationStatus,
    demandItemGeneratedInboundSummary,
    inboundTraceForRow,
    inboundRowsForOrder,
    orderInboundSummary,
    contextTitle,
    traceRelationRows,
    stockDiff,
    inventoryShortage,
    inventoryWarningStatus,
    demandLineItemsToPurchaseLines,
} from './helpers';

export function Tag({ children, tone = 'gray' }: { children: React.ReactNode; tone?: StatusTone }) {
    return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function StatusTag({ value }: { value: string }) {
    return <Tag tone={statusTone[value] || 'gray'}>{value}</Tag>;
}

export function StatusSwitch({ enabled }: { enabled: boolean }) {
    return (
        <span className={enabled ? 'status-switch status-switch-on' : 'status-switch'} aria-label={enabled ? '启用' : '停用'}>
            <span />
        </span>
    );
}

export function InventoryTrendSparkline({ points }: { points: number[] }) {
    const width = 96;
    const height = 32;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(max - min, 1);
    const step = points.length > 1 ? width / (points.length - 1) : width;
    const polyline = points
        .map((point, index) => {
            const x = Math.round(index * step);
            const y = Math.round(height - ((point - min) / range) * (height - 6) - 3);
            return `${x},${y}`;
        })
        .join(' ');
    const diff = points.length > 1 ? points[points.length - 1] - points[0] : 0;

    return (
        <div className="inventory-trend" aria-label={`库存趋势${diff}`}>
            <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
                <polyline points={polyline} />
            </svg>
            <span className={diff < 0 ? 'trend-chip trend-down' : 'trend-chip trend-flat'}>
                {diff < 0 ? diff : `+${diff}`}
            </span>
        </div>
    );
}

export function StatCard({
    title,
    value,
    note,
    icon: Icon,
    tone,
}: {
    title: string;
    value: string;
    note: string;
    icon: React.ElementType;
    tone: StatusTone;
}) {
    return (
        <section className="stat-card">
            <div className={`stat-icon stat-${tone}`}>
                <Icon size={18} />
            </div>
            <div>
                <p>{title}</p>
                <strong>{value}</strong>
                <span>{note}</span>
            </div>
        </section>
    );
}

export function FilterBar({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
    return (
        <div className={className ? `filter-bar ${className}` : 'filter-bar'}>
            <div className="filter-grid">{children}</div>
            <div className="filter-actions">
                {action || (
                    <>
                        <button type="button" className="primary-btn">查询</button>
                        <button type="button" className="secondary-btn">重置</button>
                    </>
                )}
            </div>
        </div>
    );
}

export function Field({ label, value, wide, required }: { label: string; value: string; wide?: boolean; required?: boolean }) {
    return (
        <label className={wide ? 'field field-wide' : 'field'}>
            <span>{required && <b>*</b>}{label}</span>
            <input value={value} readOnly />
        </label>
    );
}

export function SelectLike({ label, value, options, onChange, required }: { label: string; value: string; options?: string[]; onChange?: (value: string) => void; required?: boolean }) {
    const list = options && options.length ? options : [value];

    return (
        <label className="field">
            <span>{required && <b>*</b>}{label}</span>
            <select value={value} onChange={(event: { target: { value: string } }) => onChange?.(event.target.value)}>
                {list.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </label>
    );
}

export function CreateField({
    label,
    value,
    required,
    wide,
    multiline,
    options,
    helper,
}: {
    label: string;
    value: string;
    required?: boolean;
    wide?: boolean;
    multiline?: boolean;
    options?: string[];
    helper?: string;
}) {
    const list = options && options.length ? options : [value];
    const className = [
        'create-field',
        wide ? 'create-field-wide' : '',
        multiline ? 'create-field-multiline' : '',
    ].filter(Boolean).join(' ');

    return (
        <label className={className}>
            <span>{required && <b>*</b>}{label}</span>
            {multiline ? (
                <textarea value={value} readOnly />
            ) : options ? (
                <select value={value} onChange={() => undefined}>
                    {list.map((option) => (
                        <option key={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <input value={value} readOnly />
            )}
            {helper && <em>{helper}</em>}
        </label>
    );
}

export function CreateSection({
    title,
    subtitle,
    action,
    children,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="create-section">
            <div className="create-section-title">
                <div>
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function CreateDetailTable({
    columns,
    rows,
    emptyText = '暂无数据',
    renderRow,
}: {
    columns: string[];
    rows: unknown[];
    emptyText?: string;
    renderRow?: (row: any, index: number) => React.ReactNode;
}) {
    return (
        <div className="create-table-wrap">
            <table className="create-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length && renderRow ? rows.map(renderRow) : (
                        <tr className="create-empty-row">
                            <td colSpan={columns.length}>{emptyText}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function CreatePageActions({
    onCancel,
    primary,
}: {
    onCancel: () => void;
    primary: string;
}) {
    return (
        <div className="create-page-actions">
            <button type="button" className="secondary-btn" onClick={onCancel}>取消</button>
            <button type="button" className="secondary-btn">保存草稿</button>
            <button type="button" className="primary-btn" onClick={onCancel}>{primary}</button>
        </div>
    );
}

export function ViewPageActions({ onClose }: { onClose: () => void }) {
    return (
        <div className="create-page-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>关闭</button>
        </div>
    );
}

export function WarehouseScope({
    value = '全部仓库',
    options,
    onChange,
}: {
    value?: string;
    options?: string[];
    onChange?: (value: string) => void;
}) {
    return (
        <div className="warehouse-scope">
            <SelectLike label="所属仓库" value={value} options={options} onChange={onChange} />
        </div>
    );
}

export function DataTable({
    columns,
    rows,
    renderRow,
}: {
    columns: React.ReactNode[];
    rows: unknown[];
    renderRow: (row: any, index: number) => React.ReactNode;
}) {
    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={typeof column === 'string' ? column : index}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{rows.map(renderRow)}</tbody>
            </table>
        </div>
    );
}

export function RowActions({ allowDelete = true, actions }: { allowDelete?: boolean; actions?: ActionItem[] }) {
    return (
        <div className="row-actions">
            {(actions || [{ label: '编辑' }]).map((action) => (
                <button
                    type="button"
                    key={action.label}
                    className={action.danger ? 'danger-link' : undefined}
                    disabled={action.disabled}
                    title={action.title}
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            ))}
            {allowDelete && <button type="button" className="danger-link">删除</button>}
        </div>
    );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
    return (
        <div className="section-title">
            <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            {action}
        </div>
    );
}

export function DetailGrid({ rows }: { rows: Array<[string, React.ReactNode]> }) {
    return (
        <div className="detail-grid">
            {rows.map(([label, value]) => (
                <div className="detail-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>
    );
}

export function MiniLineTable({ items, amountLabel = '金额' }: { items: LineItem[]; amountLabel?: string }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备</th>
                    <th>数量</th>
                    <th>{amountLabel}</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={`${item.name}-${item.qty}`}>
                        <td>{item.name}</td>
                        <td>{numberText(item.qty)} {item.unit}</td>
                        <td>{currency(item.amount)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function financeAttachmentName(record: PaymentRecord | InvoiceRecord) {
    return record.attachment?.name || '--';
}

export function PaymentHistoryTable({ records }: { records: PaymentRecord[] }) {
    const sortedRecords = [...records].sort((a, b) => b.paidAt.localeCompare(a.paidAt));

    return (
        <div className="finance-history-block">
            <h3>付款记录</h3>
            <div className="finance-history-wrap">
                <table className="mini-table finance-history-table">
                    <thead>
                        <tr>
                            <th>付款日期</th>
                            <th>付款金额</th>
                            <th>付款方式</th>
                            <th>流水/凭证号</th>
                            <th>附件</th>
                            <th>备注</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRecords.length ? sortedRecords.map((record) => (
                            <tr key={record.id}>
                                <td>{record.paidAt}</td>
                                <td>{currency(record.amount)}</td>
                                <td>{record.method}</td>
                                <td>{record.referenceNo}</td>
                                <td className="finance-attachment-name" title={financeAttachmentName(record)}>{financeAttachmentName(record)}</td>
                                <td>{record.note || '--'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="finance-empty-cell">暂无付款记录</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function InvoiceHistoryTable({ records }: { records: InvoiceRecord[] }) {
    const sortedRecords = [...records].sort((a, b) => b.invoicedAt.localeCompare(a.invoicedAt));

    return (
        <div className="finance-history-block">
            <h3>发票记录</h3>
            <div className="finance-history-wrap">
                <table className="mini-table finance-history-table">
                    <thead>
                        <tr>
                            <th>开票日期</th>
                            <th>开票金额</th>
                            <th>发票类型</th>
                            <th>发票号码</th>
                            <th>附件</th>
                            <th>备注</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRecords.length ? sortedRecords.map((record) => (
                            <tr key={record.id}>
                                <td>{record.invoicedAt}</td>
                                <td>{currency(record.amount)}</td>
                                <td>{record.invoiceType}</td>
                                <td>{record.invoiceNo}</td>
                                <td className="finance-attachment-name" title={financeAttachmentName(record)}>{financeAttachmentName(record)}</td>
                                <td>{record.note || '--'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="finance-empty-cell">暂无发票记录</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TraceRelationAction({
    context,
    onOpenTrace,
    label = '链路追踪',
}: {
    context: TraceContext;
    onOpenTrace?: (context: TraceContext) => void;
    label?: string;
}) {
    return (
        <button type="button" className="table-link" onClick={() => onOpenTrace?.(context)}>
            {label}
        </button>
    );
}

export function TraceDocumentButton({
    type,
    code,
    actions,
}: {
    type: 'demand' | 'plan' | 'order' | 'inbound';
    code: string;
    actions: TraceRelationActions;
}) {
    const demand = type === 'demand' ? demandByCode(code) : undefined;
    const plan = type === 'plan' ? planByCode(code) : undefined;
    const order = type === 'order' ? orders.find((item) => item.jdOrder === code) : undefined;
    const inbound = type === 'inbound' ? inboundRows.find((item) => item.code === code) : undefined;

    if (demand) {
        return <button type="button" className="table-link" onClick={() => actions.openDemandView?.(demand)}>{code}</button>;
    }
    if (plan) {
        return <button type="button" className="table-link" onClick={() => actions.openPlanView?.(plan)}>{code}</button>;
    }
    if (order) {
        return <button type="button" className="table-link" onClick={() => actions.openOrderDetail?.(order)}>{code}</button>;
    }
    if (inbound) {
        return <button type="button" className="table-link" onClick={() => actions.openInboundDetail?.(inbound)}>{code}</button>;
    }
    return <span>{code}</span>;
}

type TraceRelationTab = 'demand' | 'plan' | 'order' | 'inbound';

const traceRelationTabs: Array<{ key: TraceRelationTab; label: string }> = [
    { key: 'demand', label: '采购需求' },
    { key: 'plan', label: '采购计划' },
    { key: 'order', label: '采购订单' },
    { key: 'inbound', label: '入库单' },
];

function defaultTraceTab(context: TraceContext): TraceRelationTab {
    if (context.type === 'plan' || context.type === 'plan-line') {
        return 'plan';
    }
    if (context.type === 'order') {
        return 'order';
    }
    if (context.type === 'inbound') {
        return 'inbound';
    }
    return 'demand';
}

function uniqueTraceRows<T>(rows: T[], keyForRow: (row: T) => string) {
    const seen = new Set<string>();

    return rows.filter((row) => {
        const key = keyForRow(row);
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

export function TraceRelationView({ context, actions }: { context: TraceContext; actions: TraceRelationActions }) {
    const [activeTab, setActiveTab] = useState<TraceRelationTab>(() => defaultTraceTab(context));
    const rows = traceRelationRows(context);
    const demandRows = uniqueTraceRows(rows.filter((row) => row.demandCode && row.demandCode !== '--'), (row) => `${row.demandCode}__${row.itemName}`);
    const planRows = uniqueTraceRows(rows.filter((row) => row.planCode), (row) => `${row.planCode}__${row.demandCode}__${row.itemName}`);
    const orderRows = uniqueTraceRows(rows.filter((row) => row.orderCode), (row) => row.orderCode);
    const inboundRowsForTrace = uniqueTraceRows(rows.filter((row) => row.inboundCode), (row) => `${row.inboundCode}__${row.orderCode}__${row.itemName}`);

    function openDemand(row: DemandRow | undefined) {
        if (row) {
            actions.openDemandView?.(row);
        }
    }

    function openPlan(row: PlanRow | undefined) {
        if (row) {
            actions.openPlanView?.(row);
        }
    }

    function openOrder(row: OrderRow | undefined) {
        if (row) {
            actions.openOrderDetail?.(row);
        }
    }

    function openInbound(row: FlowRow | undefined) {
        if (row) {
            actions.openInboundDetail?.(row);
        }
    }

    return (
        <div className="detail-stack trace-relation-view">
            <div className="trace-tabs">
                {traceRelationTabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.key}
                        className={activeTab === tab.key ? 'active' : ''}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="relation-block">
                {activeTab === 'demand' && (
                    <table className="mini-table relation-table trace-tab-table">
                        <thead>
                            <tr>
                                <th>需求单号</th>
                                <th>分公司</th>
                                <th>需求范围</th>
                                <th>装备</th>
                                <th>需求数量</th>
                                <th>预算金额</th>
                                <th>审核状态</th>
                                <th>计划纳入状态</th>
                                <th>查看</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandRows.length ? demandRows.map((row) => {
                                const demand = demandByCode(row.demandCode);
                                const demandItem = demand?.items.find((item) => item.name === row.itemName);

                                return (
                                    <tr key={`demand-${row.demandCode}-${row.itemName}`}>
                                        <td className="link-cell"><button type="button" className="table-link" onClick={() => openDemand(demand)}>{row.demandCode}</button></td>
                                        <td>{demand?.branch || row.branch}</td>
                                        <td>{demand?.project || row.warehouse}</td>
                                        <td><button type="button" className="table-link" onClick={() => openDemand(demand)}>{row.itemName}</button></td>
                                        <td>{numberText(row.demandQty)} {row.unit}</td>
                                        <td>{demandItem ? currency(demandItem.amount) : '--'}</td>
                                        <td>{demand ? <StatusTag value={demand.auditStatus} /> : '--'}</td>
                                        <td>{demand ? <StatusTag value={displayDemandIncludeStatus(demand)} /> : '--'}</td>
                                        <td><button type="button" className="table-link" onClick={() => openDemand(demand)}>查看</button></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9}>暂无关联采购需求</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                {activeTab === 'plan' && (
                    <table className="mini-table relation-table trace-tab-table">
                        <thead>
                            <tr>
                                <th>计划单号</th>
                                <th>采购模式</th>
                                <th>来源</th>
                                <th>装备</th>
                                <th>计划数量</th>
                                <th>预算金额</th>
                                <th>审核状态</th>
                                <th>订单生成状态</th>
                                <th>查看</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planRows.length ? planRows.map((row) => {
                                const plan = planByCode(row.planCode);
                                const planItem = plan?.items.find((item) => item.name === row.itemName);

                                return (
                                    <tr key={`plan-${row.planCode}-${row.demandCode}-${row.itemName}`}>
                                        <td className="link-cell"><button type="button" className="table-link" onClick={() => openPlan(plan)}>{row.planCode}</button></td>
                                        <td>{plan?.mode || '--'}</td>
                                        <td>{plan?.source || row.demandCode || '--'}</td>
                                        <td><button type="button" className="table-link" onClick={() => openPlan(plan)}>{row.itemName}</button></td>
                                        <td>{numberText(row.planQty)} {row.unit}</td>
                                        <td>{planItem ? currency(planItem.amount) : '--'}</td>
                                        <td>{plan ? <StatusTag value={plan.auditStatus} /> : '--'}</td>
                                        <td>{plan ? <StatusTag value={displayPlanOrderGenerationStatus(plan)} /> : '--'}</td>
                                        <td><button type="button" className="table-link" onClick={() => openPlan(plan)}>查看</button></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9}>暂无关联采购计划</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                {activeTab === 'order' && (
                    <table className="mini-table relation-table trace-tab-table">
                        <thead>
                            <tr>
                                <th>采购订单号</th>
                                <th>关联计划</th>
                                <th>目标仓库</th>
                                <th>数量合计</th>
                                <th>订单金额</th>
                                <th>付款状态</th>
                                <th>发票状态</th>
                                <th>入库单状态</th>
                                <th>入库数量</th>
                                <th>供应商</th>
                                <th>创建时间</th>
                                <th>明细数</th>
                                <th>装备摘要</th>
                                <th>查看</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderRows.length ? orderRows.map((row) => {
                                const order = orders.find((item) => item.jdOrder === row.orderCode);
                                const finance = order ? orderFinanceSummary(order) : undefined;
                                const inboundSummary = order ? orderInboundSummary(order) : undefined;

                                return (
                                    <tr key={`order-${row.orderCode}`}>
                                        <td className="link-cell"><button type="button" className="table-link" onClick={() => openOrder(order)}>{row.orderCode}</button></td>
                                        <td>{order?.plan || row.planCode}</td>
                                        <td>{order?.targetWarehouse || row.inboundWarehouse || row.warehouse || '--'}</td>
                                        <td>{order ? numberText(lineQty(order.items)) : numberText(row.orderQty)}</td>
                                        <td>{finance ? currency(finance.orderAmount) : '--'}</td>
                                        <td>{finance ? <StatusTag value={finance.paymentStatus} /> : '--'}</td>
                                        <td>{finance ? <StatusTag value={finance.invoiceStatus} /> : '--'}</td>
                                        <td>{inboundSummary ? <StatusTag value={inboundSummary.status} /> : '--'}</td>
                                        <td>{inboundSummary ? `${numberText(inboundSummary.generatedQty)} / ${numberText(inboundSummary.orderQty)}` : '--'}</td>
                                        <td>{order?.supplier || '--'}</td>
                                        <td>{order?.createdAt || order?.importedAt || '--'}</td>
                                        <td>{order ? `${order.items.length} 行` : '1 行'}</td>
                                        <td>{order ? itemSummary(order.items) : row.itemName}</td>
                                        <td><button type="button" className="table-link" onClick={() => openOrder(order)}>查看</button></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={14}>暂无关联采购订单</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                {activeTab === 'inbound' && (
                    <table className="mini-table relation-table trace-tab-table">
                        <thead>
                            <tr>
                                <th>入库单号</th>
                                <th>来源订单</th>
                                <th>仓库</th>
                                <th>装备</th>
                                <th>入库数量</th>
                                <th>入库成本</th>
                                <th>录码/入库状态</th>
                                <th>查看</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inboundRowsForTrace.length ? inboundRowsForTrace.map((row) => {
                                const inbound = inboundRows.find((item) => item.code === row.inboundCode);
                                const inboundItem = inbound?.items.find((item) => item.name === row.itemName);

                                return (
                                    <tr key={`inbound-${row.inboundCode}-${row.orderCode}-${row.itemName}`}>
                                        <td className="link-cell"><button type="button" className="table-link" onClick={() => openInbound(inbound)}>{row.inboundCode}</button></td>
                                        <td>{inbound?.from || row.orderCode || '--'}</td>
                                        <td>{inbound?.to || row.inboundWarehouse || '--'}</td>
                                        <td><button type="button" className="table-link" onClick={() => openInbound(inbound)}>{row.itemName}</button></td>
                                        <td>{numberText(row.allocatedQty)} {row.unit}</td>
                                        <td>{inboundItem ? currency(inboundItem.amount) : '--'}</td>
                                        <td>{inbound ? <StatusTag value={inbound.status} /> : '--'}</td>
                                        <td><button type="button" className="table-link" onClick={() => openInbound(inbound)}>查看</button></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8}>暂无关联入库单</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export function traceRelationWindow(context: TraceContext, actions: TraceRelationActions): BusinessWindowState {
    return {
        title: contextTitle(context),
        subtitle: '按明细数量串联采购需求、采购计划、采购订单和入库单，便于核对前后关系和状态。',
        className: 'trace-relation-window',
        body: <TraceRelationView context={context} actions={actions} />,
    };
}

export function DemandIncludeStatusCell({ row }: { row: DemandRow }) {
    if (row.auditStatus !== '审核通过') {
        return <>--</>;
    }

    const totals = demandAllocationTotals(row);

    return (
        <StatusTag value={totals.status} />
    );
}

export function DemandLineAllocationCell({
    row,
    item,
}: {
    row: DemandRow;
    item: LineItem;
}) {
    if (row.auditStatus !== '审核通过') {
        return <>--</>;
    }

    const summary = demandItemAllocationSummary(row, item);

    return (
        <StatusTag value={summary.status} />
    );
}

export function DemandLineInboundCell({ demandCode, itemName }: { demandCode: string; itemName: string }) {
    const summary = demandItemGeneratedInboundSummary(demandCode, itemName);

    if (!summary.count) {
        return <span className="muted-text">暂无</span>;
    }

    return (
        <span>{numberText(summary.generatedQty)} / {summary.count}单</span>
    );
}

function demandLineOrderQty(demandCode: string, itemName: string) {
    return traceRelationRows({ type: 'demand-line', code: demandCode, itemName })
        .reduce((sum, row) => sum + row.orderQty, 0);
}

function demandLineInboundQty(demandCode: string, itemName: string) {
    return demandItemGeneratedInboundSummary(demandCode, itemName).actualInboundQty;
}

function orderDemandSourceText(row: OrderRow) {
    const sources = uniqueTraceRows(orderAllocations(row), (allocation) => `${allocation.demandCode}__${allocation.warehouse}`)
        .map((allocation) => {
            const demand = demandByCode(allocation.demandCode);
            const warehouse = demand ? demandWarehouse(demand) : allocation.warehouse;
            return `${allocation.demandCode} / ${warehouse}`;
        });

    if (!sources.length) {
        return '--';
    }

    if (sources.length <= 2) {
        return sources.join('、');
    }

    return `${sources.slice(0, 2).join('、')}等${sources.length}项`;
}

export function PlanOrderRelationTable({
    plan,
    orderRows,
    openOrderDetail,
    onOpenTrace,
}: {
    plan: PlanRow;
    orderRows?: OrderRow[];
    openOrderDetail?: (row: OrderRow) => void;
    onOpenTrace?: (context: TraceContext) => void;
}) {
    const rows = relatedOrdersForPlan(plan, orderRows);

    return (
        <CreateDetailTable
            columns={['采购订单号', '需求来源', '目标仓库', '供应商', '订单数量', '订单金额', '入库单状态', '入库数量', '操作']}
            rows={rows}
            emptyText="暂无关联采购订单"
            renderRow={(order: OrderRow) => {
                const inboundSummary = orderInboundSummary(order);

                return (
                    <tr key={order.jdOrder}>
                        <td className="link-cell">{order.jdOrder}</td>
                        <td>{orderDemandSourceText(order)}</td>
                        <td>{order.targetWarehouse || '--'}</td>
                        <td>{order.supplier.replace('京东慧采-', '')}</td>
                        <td>{numberText(lineQty(order.items))}</td>
                        <td>{currency(lineAmount(order.items))}</td>
                        <td><StatusTag value={inboundSummary.status} /></td>
                        <td>{numberText(inboundSummary.generatedQty)} / {numberText(inboundSummary.orderQty)}</td>
                        <td>
                            <div className="inline-action-group">
                                <button type="button" className="table-link" onClick={() => openOrderDetail?.(order)}>查看订单</button>
                                <TraceRelationAction context={{ type: 'order', code: order.jdOrder, orderCode: order.jdOrder }} onOpenTrace={onOpenTrace} />
                            </div>
                        </td>
                    </tr>
                );
            }}
        />
    );
}

type OrderDetailActions = {
    openPlanView?: (row: PlanRow) => void;
    openDemandView?: (row: DemandRow) => void;
    openTraceRelation?: (context: TraceContext) => void;
};

function OrderSourceRelationTable({
    row,
    options,
}: {
    row: OrderRow;
    options?: OrderDetailActions;
}) {
    const rows = orderAllocations(row);

    return (
        <CreateSection title="来源需求明细" subtitle="按需求单号和需求仓库核对采购订单来源，生成入库单后继续回写入库状态">
            <CreateDetailTable
                columns={['需求单号', '需求仓库', '装备名称', '计划数量', '订单数量', '订单金额', '入库单', '入库状态', '操作']}
                rows={rows}
                emptyText="暂无来源需求明细"
                renderRow={(allocation: OrderWarehouseAllocation, index: number) => {
                    const demand = demandByCode(allocation.demandCode);
                    const warehouse = demand ? demandWarehouse(demand) : allocation.warehouse;
                    const orderItem = row.items.find((item) => item.name === allocation.itemName);
                    const unitPrice = orderItem && orderItem.qty ? orderItem.amount / orderItem.qty : 0;
                    const relatedInbounds = inboundRowsForOrder(row)
                        .filter((inbound) => inbound.items.some((item) => item.name === allocation.itemName));
                    const itemInboundQty = relatedInbounds.reduce((sum, inbound) => (
                        sum + inbound.items
                            .filter((item) => item.name === allocation.itemName)
                            .reduce((itemSum, item) => itemSum + item.qty, 0)
                    ), 0);
                    const relatedStatuses = relatedInbounds.map((inbound) => inbound.status);
                    const itemInboundStatus = !relatedInbounds.length || itemInboundQty <= 0
                        ? '未生成'
                        : relatedStatuses.every((status) => status === '已入库')
                            ? '已入库'
                            : relatedInbounds.length > 1 && relatedStatuses.some((status) => status === '已入库')
                                ? '部分入库'
                                : '待入库';
                    const traceContext: TraceContext = allocation.demandCode && allocation.demandCode !== '--'
                        ? { type: 'demand-line', code: allocation.demandCode, itemName: allocation.itemName }
                        : { type: 'order', code: row.jdOrder, orderCode: row.jdOrder, itemName: allocation.itemName };

                    return (
                        <tr key={`${allocation.orderCode}-${allocation.demandCode}-${allocation.itemName}-${index}`}>
                            <td className="link-cell">
                                {demand ? (
                                    <button type="button" className="table-link" onClick={() => options?.openDemandView?.(demand)}>
                                        {allocation.demandCode}
                                    </button>
                                ) : allocation.demandCode}
                            </td>
                            <td>{warehouse || '--'}</td>
                            <td>{allocation.itemName}</td>
                            <td>{numberText(allocation.includedQty)}</td>
                            <td>{numberText(allocation.orderQty)}</td>
                            <td>{unitPrice ? currency(allocation.orderQty * unitPrice) : '--'}</td>
                            <td>{relatedInbounds.length ? `${relatedInbounds.length}单 / ${numberText(itemInboundQty)}` : '--'}</td>
                            <td><StatusTag value={itemInboundStatus} /></td>
                            <td><TraceRelationAction context={traceContext} onOpenTrace={options?.openTraceRelation} /></td>
                        </tr>
                    );
                }}
            />
        </CreateSection>
    );
}

function OrderInboundRelationTable({
    row,
    options,
}: {
    row: OrderRow;
    options?: OrderDetailActions;
}) {
    const rows = inboundRowsForOrder(row);

    return (
        <CreateSection title="关联入库单" subtitle="同一采购订单可按到货批次生成多张入库单，按单追踪入库数量、成本和状态">
            <CreateDetailTable
                columns={['入库单号', '入库仓库', '明细数', '装备摘要', '入库数量', '入库成本', '经办人', '状态', '操作']}
                rows={rows}
                emptyText="暂无关联入库单"
                renderRow={(inbound: FlowRow) => (
                    <tr key={inbound.code}>
                        <td className="link-cell">{inbound.code}</td>
                        <td>{inbound.to}</td>
                        <td>{inbound.items.length} 项</td>
                        <td>{itemSummary(inbound.items)}</td>
                        <td>{numberText(lineQty(inbound.items))}</td>
                        <td>{currency(lineAmount(inbound.items))}</td>
                        <td>{inbound.handler}</td>
                        <td><StatusTag value={inbound.status} /></td>
                        <td>
                            <div className="inline-action-group">
                                <button type="button" className="table-link" onClick={() => options?.openTraceRelation?.({ type: 'inbound', code: inbound.code, inboundCode: inbound.code })}>
                                    链路追踪
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />
        </CreateSection>
    );
}

type OrderDetailTab = 'items' | 'finance' | 'source';
type OrderFinanceTab = 'payment' | 'invoice';

function OrderDetailMetric({
    label,
    value,
    helper,
    emphasis,
}: {
    label: string;
    value: React.ReactNode;
    helper: React.ReactNode;
    emphasis?: boolean;
}) {
    return (
        <div className={emphasis ? 'order-detail-metric is-emphasis' : 'order-detail-metric'}>
            <span>{label}</span>
            <strong>{value}</strong>
            <em>{helper}</em>
        </div>
    );
}

function orderItemUnitPrice(item: LineItem) {
    return item.qty ? item.amount / item.qty : 0;
}

function OrderItemDetailTable({ items }: { items: LineItem[] }) {
    const totalQty = lineQty(items);
    const totalAmount = lineAmount(items);
    const averagePrice = totalQty ? totalAmount / totalQty : 0;

    return (
        <div className="order-item-detail-block">
            <div className="order-item-detail-summary">
                <div>
                    <span>行数</span>
                    <strong>{items.length}</strong>
                </div>
                <div>
                    <span>合计数量</span>
                    <strong>{numberText(totalQty)}</strong>
                </div>
                <div>
                    <span>平均单价</span>
                    <strong>{currency(averagePrice)}</strong>
                </div>
                <div>
                    <span>订单金额</span>
                    <strong>{currency(totalAmount)}</strong>
                </div>
            </div>
            <div className="order-item-detail-table-wrap">
                <table className="order-item-detail-table">
                    <thead>
                        <tr>
                            <th>装备</th>
                            <th>数量</th>
                            <th>参考单价</th>
                            <th>金额</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const unitPrice = orderItemUnitPrice(item);
                            return (
                                <tr key={`${item.name}-${item.qty}-${item.amount}`}>
                                    <td>
                                        <strong>{item.name}</strong>
                                        <span>{item.unit}</span>
                                    </td>
                                    <td>{numberText(item.qty)}</td>
                                    <td>{currency(unitPrice)}</td>
                                    <td>{currency(item.amount)}</td>
                                    <td>{item.qty ? `${numberText(item.qty)} × ${currency(unitPrice)} = ${currency(item.amount)}` : '--'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OrderDetailContent({ row, options }: { row: OrderRow; options?: OrderDetailActions }) {
    const [activeTab, setActiveTab] = useState<OrderDetailTab>('items');
    const [financeTab, setFinanceTab] = useState<OrderFinanceTab>('payment');
    const plan = planByCode(row.plan);
    const finance = orderFinanceSummary(row);
    const inboundSummary = orderInboundSummary(row);

    return (
        <div className="order-detail-content">
            <div className="order-detail-metrics">
                <OrderDetailMetric
                    label="订单金额"
                    value={currency(finance.orderAmount)}
                    helper={`${numberText(lineQty(row.items))} 件 / ${row.items.length} 行明细`}
                    emphasis
                />
                <OrderDetailMetric
                    label="付款状态"
                    value={<StatusTag value={finance.paymentStatus} />}
                    helper={`已付 ${currency(finance.paymentTotal)} · 待付 ${currency(finance.paymentRemaining)}`}
                />
                <OrderDetailMetric
                    label="发票状态"
                    value={<StatusTag value={finance.invoiceStatus} />}
                    helper={`已开 ${currency(finance.invoiceTotal)} · 待开 ${currency(finance.invoiceRemaining)}`}
                />
                <OrderDetailMetric
                    label="入库状态"
                    value={<StatusTag value={inboundSummary.status} />}
                    helper={inboundSummary.count ? `${inboundSummary.count} 单 · ${numberText(inboundSummary.generatedQty)}/${numberText(inboundSummary.orderQty)} 件` : '暂未关联入库单'}
                />
            </div>

            <div className="order-detail-basics">
                <div><span>供应商</span><strong>{row.supplier}</strong></div>
                <div><span>目标仓库</span><strong>{row.targetWarehouse || '--'}</strong></div>
                <div>
                    <span>关联计划</span>
                    <strong>{plan ? (
                        <button type="button" className="table-link" onClick={() => options?.openPlanView?.(plan)}>{plan.code}</button>
                    ) : row.plan}</strong>
                </div>
                <div><span>创建时间</span><strong>{row.createdAt || row.importedAt}</strong></div>
            </div>

            <div className="order-detail-tabs" role="tablist" aria-label="订单详情分类">
                {[
                    { key: 'items' as const, label: '订单明细' },
                    { key: 'finance' as const, label: '付款与发票' },
                    { key: 'source' as const, label: '来源追溯' },
                ].map((tab) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        className={activeTab === tab.key ? 'active' : ''}
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="order-detail-tab-body">
                {activeTab === 'items' && (
                    <div className="order-detail-tab-panel">
                        <div className="order-detail-secondary-info">
                            <div className="is-wide"><span>来源方式</span><strong>{[row.sourceType || '采购计划生成', row.purchaseMethod, row.allocationMethod].filter(Boolean).join(' / ')}</strong></div>
                            <div><span>关联入库单</span><strong>{inboundSummary.codes.length ? inboundSummary.codes.join('、') : '--'}</strong></div>
                            <div><span>关联计划</span><strong>{row.plan}</strong></div>
                            <div className="is-wide"><span>订单说明</span><strong>{row.orderNote || '--'}</strong></div>
                        </div>
                        <section className="order-detail-section">
                            <h3>装备明细</h3>
                            <OrderItemDetailTable items={row.items} />
                        </section>
                        <OrderInboundRelationTable row={row} options={options} />
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="order-detail-tab-panel">
                        <div className="order-finance-switch" role="tablist" aria-label="财务记录分类">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={financeTab === 'payment'}
                                className={financeTab === 'payment' ? 'active' : ''}
                                onClick={() => setFinanceTab('payment')}
                            >
                                付款记录 <span>{row.paymentRecords?.length || 0}</span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={financeTab === 'invoice'}
                                className={financeTab === 'invoice' ? 'active' : ''}
                                onClick={() => setFinanceTab('invoice')}
                            >
                                发票记录 <span>{row.invoiceRecords?.length || 0}</span>
                            </button>
                        </div>
                        {financeTab === 'payment'
                            ? <PaymentHistoryTable records={row.paymentRecords || []} />
                            : <InvoiceHistoryTable records={row.invoiceRecords || []} />}
                    </div>
                )}

                {activeTab === 'source' && (
                    <div className="order-detail-tab-panel order-detail-source">
                        <div className="order-detail-source-head">
                            <div>
                                <h3>来源与流转关系</h3>
                                <p>核对采购需求、采购计划、订单与入库单的数量关系。</p>
                            </div>
                            <TraceRelationAction
                                context={{ type: 'order', code: row.jdOrder, orderCode: row.jdOrder }}
                                onOpenTrace={options?.openTraceRelation}
                                label="查看完整链路"
                            />
                        </div>
                        <OrderSourceRelationTable row={row} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
}

export function orderDetailWindow(
    row: OrderRow,
    options?: OrderDetailActions,
): BusinessWindowState {
    return {
        title: row.jdOrder,
        subtitle: '查看订单信息、履约状态与来源关系。',
        className: 'order-detail-window',
        body: <OrderDetailContent row={row} options={options} />,
    };
}

function inboundCodeProgress(row: FlowRow) {
    const codeItems = row.items.filter((item) => equipmentItems.some((equipment) => equipment.name === item.name && equipment.oneCode));
    const codeQty = lineQty(codeItems);
    const codedQty = row.status === '待入库' ? Math.max(0, codeQty - 2) : row.status === '部分入库' ? Math.floor(codeQty / 2) : codeQty;

    return {
        codeQty,
        text: codeQty ? `${codedQty}/${codeQty} 已录码` : '无需录码',
    };
}

export function inboundDetailWindow(
    row: FlowRow,
    options?: { openPlanView?: (row: PlanRow) => void; openDemandView?: (row: DemandRow) => void; openTraceRelation?: (context: TraceContext) => void },
): BusinessWindowState {
    const trace = inboundTraceForRow(row);
    const tracePlan = trace ? planByCode(trace.planCode) : undefined;
    const progress = inboundCodeProgress(row);

    return {
        title: row.status === '已入库' ? row.code : progress.codeQty ? '录码入库' : '确认入库',
        subtitle: `${row.from} 入库到 ${row.to}，确认后形成库存成本。`,
        primary: row.status === '已入库' ? undefined : '确认入库',
        body: (
            <div className="detail-stack">
                <DetailGrid rows={[
                    ['来源订单', row.from],
                    ['来源采购计划', tracePlan ? (
                        <button type="button" className="table-link" onClick={() => options?.openPlanView?.(tracePlan)}>
                            {tracePlan.code}
                        </button>
                    ) : trace?.planCode || '--'],
                    ['来源采购需求', trace?.demandCodes.length ? (
                        <div className="inline-action-group">
                            {trace.demandCodes.map((code) => {
                                const demand = demandByCode(code);
                                return demand ? (
                                    <button type="button" className="table-link" key={code} onClick={() => options?.openDemandView?.(demand)}>
                                        {code}
                                    </button>
                                ) : <span key={code}>{code}</span>;
                            })}
                        </div>
                    ) : '--'],
                    ['入库仓库', row.to],
                    ['经办人', row.handler],
                    ['录码进度', progress.text],
                    ['入库成本', currency(lineAmount(row.items))],
                    ['批次来源', row.status === '已入库' ? '按入库单自动生成批次并写入库存成本' : '确认入库后生成批次号、入库单价和订单来源'],
                    ['一物一码成本', progress.codeQty ? '录码时写入采购原值、折旧规则和折旧开始时点' : '无需单件折旧'],
                    ['链路追踪', <TraceRelationAction context={{ type: 'inbound', code: row.code, inboundCode: row.code }} onOpenTrace={options?.openTraceRelation} />],
                    ['状态', <StatusTag value={row.status} />],
                ]} />
                <MiniLineTable items={row.items} amountLabel="入库成本" />
            </div>
        ),
    };
}

export const orderImportAllocationPreview = [
    { warehouse: '章丘分公司仓', demandCode: 'XQ202606160006', itemName: '执勤帽', demandQty: 290, allocatedQty: 0, orderQty: 500, autoQty: 296, manualQty: 296, diff: 6, inboundCode: 'RK202606200001' },
    { warehouse: '高新区分公司仓', demandCode: 'XQ202606160002', itemName: '执勤帽', demandQty: 200, allocatedQty: 0, orderQty: 500, autoQty: 204, manualQty: 204, diff: 4, inboundCode: 'RK202606200002' },
];

export function OrderImportPreview() {
    return (
        <div className="detail-stack order-import-preview">
            <div className="modal-form embedded-form">
                <Field label="订单文件" value="选择采购订单 Excel / 京东慧采订单文件" wide />
                <SelectLike label="关联采购计划" value="JH202606160005 / 执勤帽汇总采购" options={['JH202606160005 / 执勤帽汇总采购', 'JH202606160001 / 历下高新集采', '手动选择采购计划']} />
                <Field label="生成批次" value="第三批 / 系统自动生成" />
                <SelectLike label="采购方式" value="京东慧采" options={['京东慧采', '线下供应商', '历史订单复购']} />
                <SelectLike label="分配方式" value="汇总订单自动分配" options={['分仓库订单', '汇总订单自动分配']} />
                <SelectLike label="分仓库订单目标仓库" value="选择后直接生成该仓库入库单" options={['选择后直接生成该仓库入库单', '历下分公司仓', '高新区分公司仓', '章丘分公司仓']} />
            </div>
            <div className="relation-block">
                <div className="relation-block-title">
                    <h3>汇总订单自动分配</h3>
                    <button type="button" className="secondary-btn">按需求数量分配</button>
                </div>
                <table className="mini-table relation-table">
                    <thead>
                        <tr>
                            <th>仓库</th>
                            <th>来源需求</th>
                            <th>装备</th>
                            <th>需求数量</th>
                            <th>已分配</th>
                            <th>本次订单</th>
                            <th>自动分配</th>
                            <th>手工调整</th>
                            <th>差异</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderImportAllocationPreview.map((row) => (
                            <tr key={`${row.warehouse}-${row.demandCode}`}>
                                <td>{row.warehouse}</td>
                                <td>{row.demandCode}</td>
                                <td>{row.itemName}</td>
                                <td>{numberText(row.demandQty)}</td>
                                <td>{numberText(row.allocatedQty)}</td>
                                <td>{numberText(row.orderQty)}</td>
                                <td>{numberText(row.autoQty)}</td>
                                <td><input className="qty-input" value={row.manualQty} readOnly /></td>
                                <td className={row.diff ? 'positive' : ''}>{row.diff ? `+${row.diff}` : '0'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="relation-block">
                <h3>将生成的入库单预览</h3>
                <table className="mini-table relation-table">
                    <thead>
                        <tr>
                            <th>入库单号</th>
                            <th>目标仓库</th>
                            <th>来源订单</th>
                            <th>来源采购计划</th>
                            <th>来源需求</th>
                            <th>装备</th>
                            <th>数量</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderImportAllocationPreview.map((row) => (
                            <tr key={row.inboundCode}>
                                <td>{row.inboundCode}</td>
                                <td>{row.warehouse}</td>
                                <td>DD202606200001</td>
                                <td>JH202606160005</td>
                                <td>{row.demandCode}</td>
                                <td>{row.itemName}</td>
                                <td>{numberText(row.manualQty)}</td>
                                <td><StatusTag value="待入库" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
    return (
        <div className="approval-timeline">
            {steps.map((step) => {
                const StepIcon = step.title === '发起申请' ? Send : UserRound;
                const hasResultBadge = step.tone === 'green' || step.tone === 'red';

                return (
                    <div className="approval-timeline-item" key={`${step.title}-${step.actor}`}>
                        <div className={`approval-timeline-icon approval-timeline-${step.tone}`}>
                            <StepIcon size={15} />
                            {hasResultBadge && (
                                <span className={`approval-timeline-badge approval-timeline-badge-${step.tone}`}>
                                    {step.tone === 'red' ? '×' : '✓'}
                                </span>
                            )}
                        </div>
                        <div className="approval-timeline-main">
                            <div className="approval-timeline-head">
                                <strong>{step.title}</strong>
                                <time>{step.time}</time>
                            </div>
                            <p>
                                <span>{step.actor}</span>
                                <span className={`approval-timeline-status approval-timeline-status-${step.tone}`}>{step.status}</span>
                            </p>
                            {step.comment && <div className="approval-comment">审批意见：{step.comment}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function demandApprovalSteps(row: DemandRow): ApprovalStep[] {
    const [submitNode, branchNode, purchaseNode, copyNode] = purchaseDemandFlowNodes;

    if (row.auditStatus === '未提交') {
        return [
            { title: submitNode.title, time: '--', actor: row.branch, status: '未提交', tone: 'gray' },
            { title: branchNode.title, time: '--', actor: branchNode.actor, status: '待审核', tone: 'orange' },
            { title: purchaseNode.title, time: '--', actor: purchaseNode.actor, status: '待审核', tone: 'orange' },
            { title: copyNode.title, time: '--', actor: copyNode.actor, status: '待抄送', tone: 'gray' },
        ];
    }

    if (row.auditStatus === '待审核') {
        return [
            { title: submitNode.title, time: '2026-06-16 09:18', actor: row.branch, status: '已提交', tone: 'green' },
            { title: branchNode.title, time: '2026-06-16 09:42', actor: branchNode.actor, status: '审核中', tone: 'blue' },
            { title: purchaseNode.title, time: '--', actor: purchaseNode.actor, status: '待审核', tone: 'orange' },
            { title: copyNode.title, time: '--', actor: copyNode.actor, status: '待抄送', tone: 'gray' },
        ];
    }

    if (row.auditStatus === '审核拒绝') {
        return [
            { title: submitNode.title, time: '2026-06-16 09:18', actor: row.branch, status: '已提交', tone: 'green' },
            { title: branchNode.title, time: '2026-06-16 09:42', actor: branchNode.actor, status: '已拒绝', tone: 'red', comment: '需求数量和项目归属需补充说明后重新提交。' },
            { title: purchaseNode.title, time: '--', actor: purchaseNode.actor, status: '未流转', tone: 'gray' },
            { title: copyNode.title, time: '--', actor: copyNode.actor, status: '未抄送', tone: 'gray' },
        ];
    }

    return [
        { title: submitNode.title, time: '2026-06-16 09:18', actor: row.branch, status: '已提交', tone: 'green' },
        { title: branchNode.title, time: '2026-06-16 09:42', actor: branchNode.actor, status: '已同意', tone: 'green' },
        { title: purchaseNode.title, time: '2026-06-16 10:05', actor: purchaseNode.actor, status: '已通过', tone: 'green', comment: '需求真实，建议按单独采购处理。' },
        { title: copyNode.title, time: '2026-06-16 10:06', actor: copyNode.actor, status: '已抄送', tone: 'green' },
    ];
}

export function demandApprovalStamp(row: DemandRow) {
    if (row.auditStatus === '未提交') {
        return { result: '未提交', tone: 'gray' as StatusTone };
    }
    if (row.auditStatus === '待审核') {
        return { result: '审核中', tone: 'blue' as StatusTone };
    }
    if (row.auditStatus === '审核拒绝') {
        return { result: '拒绝', tone: 'red' as StatusTone };
    }
    return { result: '通过', tone: 'green' as StatusTone };
}

export function planApprovalSteps(row: PlanRow): ApprovalStep[] {
    const [submitNode, branchNode, purchaseNode, financeNode, copyNode] = purchasePlanFlowNodes;

    if (row.auditStatus === '待提交') {
        return [
            { title: submitNode.title, time: '--', actor: '集团采购部', status: '待提交', tone: 'gray' },
            { title: branchNode.title, time: '--', actor: branchNode.actor, status: '待审核', tone: 'orange' },
            { title: purchaseNode.title, time: '--', actor: purchaseNode.actor, status: '待审核', tone: 'orange' },
            { title: financeNode.title, time: '--', actor: financeNode.actor, status: '待审核', tone: 'orange' },
            { title: copyNode.title, time: '--', actor: copyNode.actor, status: '待抄送', tone: 'gray' },
        ];
    }

    if (row.auditStatus === '审核中') {
        return [
            { title: submitNode.title, time: '2026-06-16 09:30', actor: '集团采购部', status: '已提交', tone: 'green' },
            { title: branchNode.title, time: '2026-06-16 10:05', actor: branchNode.actor, status: '已同意', tone: 'green' },
            { title: purchaseNode.title, time: '2026-06-16 10:28', actor: purchaseNode.actor, status: '审核中', tone: 'blue' },
            { title: financeNode.title, time: '--', actor: financeNode.actor, status: '待审核', tone: 'orange' },
            { title: copyNode.title, time: '--', actor: copyNode.actor, status: '待抄送', tone: 'gray' },
        ];
    }

    return [
        { title: submitNode.title, time: '2026-06-16 09:30', actor: '集团采购部', status: '已提交', tone: 'green' },
        { title: branchNode.title, time: '2026-06-16 10:05', actor: branchNode.actor, status: '已同意', tone: 'green' },
        { title: purchaseNode.title, time: '2026-06-16 10:28', actor: purchaseNode.actor, status: '已同意', tone: 'green' },
        { title: financeNode.title, time: '2026-06-16 10:56', actor: financeNode.actor, status: '已审核', tone: 'green', comment: '预算占用正常，允许进入订单生成。' },
        { title: copyNode.title, time: '2026-06-16 10:58', actor: copyNode.actor, status: '已抄送', tone: 'green' },
    ];
}

export function planApprovalStamp(row: PlanRow) {
    if (row.auditStatus === '待提交') {
        return { result: '待提交', tone: 'gray' as StatusTone };
    }
    if (row.auditStatus === '审核中') {
        return { result: '审核中', tone: 'blue' as StatusTone };
    }
    return { result: '通过', tone: 'green' as StatusTone };
}

export function ApprovalStamp({ result, tone }: { result: string; tone: StatusTone }) {
    return <div className={`approval-stamp approval-stamp-${tone}`}>{result}</div>;
}

export function PurchaseDemandFormContent({
    mode,
    row,
    detailLines,
    currentWarehouse,
    onAddEquipment,
    onPullWarning,
    onImportGoods,
    onDeleteLine,
    onOpenTrace,
}: {
    mode: 'create' | 'view';
    row?: DemandRow;
    detailLines: PurchaseDemandLine[];
    currentWarehouse: string;
    onAddEquipment?: () => void;
    onPullWarning?: () => void;
    onImportGoods?: () => void;
    onDeleteLine?: (name: string) => void;
    onOpenTrace?: (context: TraceContext) => void;
}) {
    const isView = mode === 'view';
    const branch = row?.branch || '历下分公司';
    const demandType = row?.type || '集团集采';
    const due = row?.due || '2026-06-28';
    const demandNote = row
        ? (row.type === '集团集采' ? '分公司日常装备补货，待集团统一汇总采购。' : '项目现场补充装备，建议单独采购处理。')
        : '填写本次采购用途、现场缺口和特殊要求，例如尺码、颜色、合规备案要求。';
    const columns = isView
        ? ['装备名称', '规格型号', '单位', '需求数量', '已纳入计划数量', '已下单', '入库数量', '操作']
        : ['装备名称', '装备分类', '供应商', '单位', '当前库存', '预警数量', '需求数量', '参考价格', '预算金额', '操作'];

    return (
        <>
            <CreateSection title="基本信息">
                <div className="create-form-grid">
                    <CreateField
                        label="需求分公司"
                        value={branch}
                        required={!isView}
                        options={isView ? undefined : ['历下分公司', '高新区分公司', '章丘分公司', '山东振邦保安服务有限公司']}
                    />
                    <CreateField
                        label="需求类型"
                        value={demandType}
                        required={!isView}
                        options={isView ? undefined : ['集团集采', '项目专属', '紧急补货', '特殊尺码']}
                    />
                    <CreateField label="期望到货" value={due} required={!isView} />
                    <CreateField
                        label={isView ? '归属仓库' : '需求仓库'}
                        value={currentWarehouse}
                        options={isView ? undefined : ['历下分公司仓', '集团总仓', 'CBD园区项目点', '会展中心项目点']}
                    />
                    <CreateField
                        label="需求说明"
                        value={demandNote}
                        wide
                        multiline
                    />
                </div>
            </CreateSection>

            <CreateSection
                title="明细"
                action={isView ? <button type="button" className="secondary-btn">导出</button> : undefined}
            >
                {!isView && (
                    <div className="create-detail-actions">
                        <button type="button" className="primary-btn" onClick={onAddEquipment}>添加装备</button>
                        <button type="button" className="secondary-btn" onClick={onPullWarning}>从库存预警添加</button>
                        <button type="button" className="secondary-btn" onClick={onImportGoods}>导入商品清单</button>
                    </div>
                )}
                <CreateDetailTable
                    columns={columns}
                    rows={detailLines}
                    emptyText={isView ? '暂无采购需求明细' : '请通过上方按钮添加采购需求明细'}
                    renderRow={(line: PurchaseDemandLine) => {
                        const sourceItem = row?.items.find((item) => item.name === line.name) || {
                            name: line.name,
                            qty: line.qty,
                            unit: line.unit,
                            amount: line.referencePrice * line.qty,
                        };

                        return (
                            <tr key={line.name}>
                                <td className="link-cell">{line.name}</td>
                                {isView && row ? (
                                    <>
                                        <td>{line.spec}</td>
                                        <td>{line.unit}</td>
                                        <td>{numberText(line.qty)}</td>
                                        <td>{numberText(demandItemAllocationSummary(row, sourceItem).includedQty)}</td>
                                        <td>{numberText(demandLineOrderQty(row.code, line.name))}</td>
                                        <td>{numberText(demandLineInboundQty(row.code, line.name))}</td>
                                        <td>
                                            <TraceRelationAction
                                                context={{ type: 'demand-line', code: row.code, itemName: line.name }}
                                                onOpenTrace={onOpenTrace}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{line.category}</td>
                                        <td>{line.supplier.replace('京东慧采-', '')}</td>
                                        <td>{line.unit}</td>
                                        <td>{numberText(line.stock)}</td>
                                        <td>{typeof line.warningQty === 'number' ? numberText(line.warningQty) : '-'}</td>
                                        <td><input className="qty-input" value={line.qty} readOnly /></td>
                                        <td>{currency(line.referencePrice)}</td>
                                        <td>{currency(line.referencePrice * line.qty)}</td>
                                    </>
                                )}
                                {!isView && (
                                    <td>
                                        <button
                                            type="button"
                                            className="table-link table-link-danger"
                                            onClick={() => onDeleteLine?.(line.name)}
                                        >
                                            删除
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    }}
                />
            </CreateSection>

            <CreateSection title="流程">
                {isView && row ? <ApprovalTimeline steps={demandApprovalSteps(row)} /> : <ApprovalFlowSetup />}
            </CreateSection>
        </>
    );
}

export function PurchaseDemandViewPage({ row, onClose, onOpenTrace }: { row: DemandRow; onClose: () => void; onOpenTrace: (context: TraceContext) => void }) {
    const stamp = demandApprovalStamp(row);
    const currentWarehouse = demandWarehouse(row);

    return (
        <div className="create-page">
            <div className="demand-detail-view">
                <ApprovalStamp result={stamp.result} tone={stamp.tone} />
                <PurchaseDemandFormContent
                    mode="view"
                    row={row}
                    detailLines={demandLineItemsToPurchaseLines(row.items)}
                    currentWarehouse={currentWarehouse}
                    onOpenTrace={onOpenTrace}
                />
            </div>
            <ViewPageActions onClose={onClose} />
        </div>
    );
}

export function ApprovalFlowSetup({ nodes = purchaseDemandFlowNodes }: { nodes?: Array<{ title: string; actor: string }> }) {
    return (
        <div className="approval-flow-setup">
            <div className="approval-flow-controls">
                {nodes.map((node, index) => (
                    <React.Fragment key={node.title}>
                        <div className="approval-flow-row">
                            <span className="approval-flow-dot" />
                            <strong>{node.title}</strong>
                            <span className="approval-flow-chip">{node.actor}</span>
                        </div>
                        <button
                            type="button"
                            className={index > 0 && index < 3 ? 'approval-flow-add approval-flow-add-active' : 'approval-flow-add'}
                            aria-label={index === 3 ? '添加抄送人' : '选择审批人'}
                        >
                            <UserPlus size={22} />
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export function MiniStocktakeTable({ items }: { items: StocktakeItem[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备</th>
                    <th>账面</th>
                    <th>实盘</th>
                    <th>差异金额</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const diffAmount = (item.actual - item.book) * item.unitCost;
                    return (
                        <tr key={item.name}>
                            <td>{item.name}</td>
                            <td>{numberText(item.book)}</td>
                            <td>{numberText(item.actual)}</td>
                            <td className={diffAmount < 0 ? 'negative' : diffAmount > 0 ? 'positive' : ''}>{currency(diffAmount)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export function BatchCostTable({ rows }: { rows: BatchCostDetail[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>批次</th>
                    <th>入库/订单</th>
                    <th>入库时间</th>
                    <th>批次数量</th>
                    <th>本次领用</th>
                    <th>批次单价</th>
                    <th>归集金额</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.batch}>
                        <td>{row.batch}</td>
                        <td>{row.inbound}<br />{row.order}</td>
                        <td>{row.inboundAt}</td>
                        <td>{numberText(row.batchQty)}</td>
                        <td>{numberText(row.issuedQty)}</td>
                        <td>{currency(row.unitCost)}</td>
                        <td>{currency(row.amount)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function DepreciationCostTable({ rows }: { rows: DepreciationCostDetail[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备编号</th>
                    <th>采购原值</th>
                    <th>领用时间</th>
                    <th>归还时间</th>
                    <th>使用天数</th>
                    <th>折旧率</th>
                    <th>折旧费用</th>
                    <th>当前净值</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.assetCode}>
                        <td>{row.assetCode}</td>
                        <td>{currency(row.originalCost)}</td>
                        <td>{row.startAt}</td>
                        <td>{row.returnAt}</td>
                        <td>{row.useDays}</td>
                        <td>{row.rate}</td>
                        <td>{currency(row.amount)}</td>
                        <td>{currency(row.netValue)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function CostTraceDetail({ rows }: { rows: CostTraceRow[] }) {
    return (
        <div className="detail-stack">
            {rows.map((row) => (
                <section className="trace-card" key={`${row.source}-${row.item}-${row.method}`}>
                    <div className="trace-card-head">
                        <div>
                            <h3>{row.item}</h3>
                            <p>{row.project} / {row.source}</p>
                        </div>
                        <Tag tone={row.method === '单件折旧' ? 'purple' : row.method === '批次管理' ? 'orange' : 'blue'}>{row.method}</Tag>
                    </div>
                    <DetailGrid rows={[
                        ['数量', `${numberText(row.qty)} ${row.unit}`],
                        ['归集时间', row.collectTime],
                        ['归集金额', currency(row.amount)],
                        ['可追溯来源', row.trace],
                    ]} />
                    {row.weightedUnitCost && (
                        <div className="calculation-note">
                            移动加权：{numberText(row.qty)} {row.unit} × {currency(row.weightedUnitCost)} = {currency(row.amount)}
                        </div>
                    )}
                    {row.batches && <BatchCostTable rows={row.batches} />}
                    {row.depreciation && <DepreciationCostTable rows={row.depreciation} />}
                </section>
            ))}
        </div>
    );
}

export function tracesForSource(source: string) {
    return costTraceRows.filter((row) => row.source === source || source.includes(row.source));
}

export function tracesForAsset(assetCode: string) {
    return costTraceRows.filter((row) => row.depreciation?.some((item) => item.assetCode === assetCode));
}

export function NumberedAssetDetail({ row }: { row: NumberedAsset }) {
    const depreciationRows = tracesForAsset(row.code).flatMap((trace) => trace.depreciation || []).filter((item) => item.assetCode === row.code);
    return (
        <div className="detail-stack">
            <DetailGrid rows={[
                ['装备名称', row.name],
                ['当前位置', row.location],
                ['责任人', row.owner],
                ['状态', <StatusTag value={row.status} />],
                ['采购原值', currency(row.originalCost)],
                ['折旧规则', row.depreciationRule],
                ['折旧开始', row.depreciationStart],
                ['累计折旧', currency(row.accumulatedDepreciation)],
                ['当前净值', currency(row.netValue)],
            ]} />
            {depreciationRows.length ? <DepreciationCostTable rows={depreciationRows} /> : <div className="empty-state">暂无项目领用折旧记录，在库装备待领用确认后开始计提。</div>}
        </div>
    );
}

export function InventoryMovementDetail({ row }: { row: InventoryRow }) {
    const relatedInbound = inboundRows.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedOutbound = issues.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedTransfer = transfers.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedStocktake = stocktakes.filter((flow) => flow.items.some((item) => item.name === row.item));
    const unit = equipmentItems.find((equipment) => equipment.name === row.item)?.unit || '件';

    return (
        <div className="detail-stack">
            <DetailGrid
                rows={[
                    ['当前仓库', row.warehouse],
                    ['库存数量', numberText(row.bookQty)],
                    ['预警库存', numberText(row.warningQty)],
                    ['库存单价', currency(row.unitCost)],
                    ['库存金额', currency(row.amount)],
                    ['建议补货', inventoryShortage(row) > 0 ? `${numberText(inventoryShortage(row))}${unit}` : '无需补货'],
                    ['计价方式', row.method],
                    ['库存预警', <StatusTag value={inventoryWarningStatus(row)} />],
                ]}
            />
            <div className="detail-section">
                <h3>入库明细</h3>
                <MiniFlowTable rows={relatedInbound} emptyText="暂无关联入库记录" />
            </div>
            <div className="detail-section">
                <h3>出库明细</h3>
                <MiniFlowTable rows={relatedOutbound} emptyText="暂无关联出库记录" />
            </div>
            <div className="detail-section">
                <h3>调拨与盘点</h3>
                <MiniFlowTable rows={relatedTransfer} emptyText="暂无关联调拨记录" />
                <MiniStocktakeRecord rows={relatedStocktake} />
            </div>
        </div>
    );
}

export function MiniFlowTable({ rows, emptyText }: { rows: FlowRow[]; emptyText: string }) {
    if (!rows.length) {
        return <div className="empty-state">{emptyText}</div>;
    }

    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>单据号</th>
                    <th>流向</th>
                    <th>数量</th>
                    <th>金额</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.code}>
                        <td>{row.code}</td>
                        <td>{row.from} → {row.to}</td>
                        <td>{numberText(lineQty(row.items))}</td>
                        <td>{currency(lineAmount(row.items))}</td>
                        <td><StatusTag value={row.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function MiniStocktakeRecord({ rows }: { rows: StocktakeRow[] }) {
    if (!rows.length) {
        return <div className="empty-state">暂无关联盘点记录</div>;
    }

    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>盘点任务</th>
                    <th>仓库</th>
                    <th>差异</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.code}>
                        <td>{row.code}</td>
                        <td>{row.warehouse}</td>
                        <td>{stockDiff(row.items)}</td>
                        <td><StatusTag value={row.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function BusinessWindow({ window, onClose }: { window: BusinessWindowState; onClose: () => void }) {
    function handlePrimary() {
        window.primaryAction?.();
        onClose();
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <div className={['modal-panel', 'business-window', window.className].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-label={window.title}>
                <div className="modal-header">
                    <div>
                        <h2>{window.title}</h2>
                        <p>{window.subtitle}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="business-body">{window.body}</div>
                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>关闭</button>
                    {window.primary && <button type="button" className="primary-btn" onClick={handlePrimary}>{window.primary}</button>}
                </div>
            </div>
        </div>
    );
}
