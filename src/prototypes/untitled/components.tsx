import React from 'react';
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
    demandWarehouse,
    demandItemAllocationSummary,
    demandAllocationTotals,
    displayDemandIncludeStatus,
    planByCode,
    demandByCode,
    relatedOrdersForPlan,
    displayPlanOrderImportStatus,
    demandItemInboundAllocations,
    relationStatus,
    contextTitle,
    traceRelationRows,
    traceSummary,
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

export function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
    return (
        <label className={wide ? 'field field-wide' : 'field'}>
            <span>{label}</span>
            <input value={value} readOnly />
        </label>
    );
}

export function SelectLike({ label, value, options, onChange }: { label: string; value: string; options?: string[]; onChange?: (value: string) => void }) {
    const list = options && options.length ? options : [value];

    return (
        <label className="field">
            <span>{label}</span>
            <select value={value} onChange={(event) => onChange?.(event.target.value)}>
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

export function TraceRelationAction({
    context,
    onOpenTrace,
    label = '追溯',
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

    if (demand) {
        return <button type="button" className="table-link" onClick={() => actions.openDemandView?.(demand)}>{code}</button>;
    }
    if (plan) {
        return <button type="button" className="table-link" onClick={() => actions.openPlanView?.(plan)}>{code}</button>;
    }
    if (order) {
        return <button type="button" className="table-link" onClick={() => actions.openOrderDetail?.(order)}>{code}</button>;
    }
    if (type === 'inbound') {
        return <button type="button" className="table-link" onClick={() => actions.openTraceRelation?.({ type: 'inbound', code, inboundCode: code })}>{code}</button>;
    }
    return <span>{code}</span>;
}

export function TraceRelationView({ context, actions }: { context: TraceContext; actions: TraceRelationActions }) {
    const rows = traceRelationRows(context);
    const summary = traceSummary(rows);
    const demandCodes = Array.from(new Set(rows.map((row) => row.demandCode).filter((code) => code && code !== '--')));
    const planCodes = Array.from(new Set(rows.map((row) => row.planCode).filter(Boolean)));
    const orderCodes = Array.from(new Set(rows.map((row) => row.orderCode).filter(Boolean)));
    const inboundCodes = Array.from(new Set(rows.map((row) => row.inboundCode).filter(Boolean)));
    const itemNames = Array.from(new Set(rows.map((row) => row.itemName).filter(Boolean)));

    return (
        <div className="detail-stack trace-relation-view">
            <DetailGrid rows={[
                ['入口单据', `${context.code}${context.itemName ? ` / ${context.itemName}` : ''}`],
                ['装备范围', itemNames.length ? itemNames.join('、') : '--'],
                ['需求数量', numberText(summary.demandQty)],
                ['计划纳入', numberText(summary.includedQty)],
                ['计划采购', numberText(summary.planQty)],
                ['订单数量', numberText(summary.orderQty)],
                ['入库分配', numberText(summary.inboundQty)],
                ['链路状态', rows.length ? <StatusTag value={relationStatus(rows[0])} /> : '--'],
            ]} />
            <div className="relation-block">
                <h3>数量关系明细</h3>
                <table className="mini-table relation-table trace-relation-table">
                    <thead>
                        <tr>
                            <th>采购需求</th>
                            <th>仓库</th>
                            <th>装备</th>
                            <th>需求数量</th>
                            <th>计划纳入</th>
                            <th>计划采购</th>
                            <th>订单数量</th>
                            <th>入库分配</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length ? rows.map((row, index) => (
                            <tr key={`${row.demandCode}-${row.planCode}-${row.orderCode}-${row.inboundCode}-${row.itemName}-${index}`}>
                                <td>{row.demandCode}</td>
                                <td>{row.inboundWarehouse || row.warehouse}</td>
                                <td>{row.itemName}</td>
                                <td>{numberText(row.demandQty)} {row.unit}</td>
                                <td>{numberText(row.includedQty)}</td>
                                <td>{numberText(row.planQty)}</td>
                                <td>{row.orderCode ? numberText(row.orderQty) : '--'}</td>
                                <td>{row.inboundCode ? numberText(row.allocatedQty) : '--'}</td>
                                <td><StatusTag value={relationStatus(row)} /></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={9}>暂无可展示的链路关系</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="relation-block">
                <h3>关联单据</h3>
                <table className="mini-table relation-table trace-doc-table">
                    <thead>
                        <tr>
                            <th>单据类型</th>
                            <th>单号</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demandCodes.map((code) => {
                            const demand = demandByCode(code);
                            return (
                                <tr key={`demand-${code}`}>
                                    <td>采购需求</td>
                                    <td>{code}</td>
                                    <td>{demand ? <StatusTag value={displayDemandIncludeStatus(demand)} /> : '--'}</td>
                                    <td><TraceDocumentButton type="demand" code={code} actions={actions} /></td>
                                </tr>
                            );
                        })}
                        {planCodes.map((code) => {
                            const plan = planByCode(code);
                            return (
                                <tr key={`plan-${code}`}>
                                    <td>采购计划</td>
                                    <td>{code}</td>
                                    <td>{plan ? <StatusTag value={displayPlanOrderImportStatus(plan)} /> : '--'}</td>
                                    <td><TraceDocumentButton type="plan" code={code} actions={actions} /></td>
                                </tr>
                            );
                        })}
                        {orderCodes.map((code) => {
                            const order = orders.find((item) => item.jdOrder === code);
                            return (
                                <tr key={`order-${code}`}>
                                    <td>采购订单</td>
                                    <td>{code}</td>
                                    <td>{order ? <StatusTag value={order.status} /> : '--'}</td>
                                    <td><TraceDocumentButton type="order" code={code} actions={actions} /></td>
                                </tr>
                            );
                        })}
                        {inboundCodes.map((code) => {
                            const inbound = inboundRows.find((item) => item.code === code);
                            return (
                                <tr key={`inbound-${code}`}>
                                    <td>入库单</td>
                                    <td>{code}</td>
                                    <td>{inbound ? <StatusTag value={inbound.status} /> : '--'}</td>
                                    <td><TraceDocumentButton type="inbound" code={code} actions={actions} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function traceRelationWindow(context: TraceContext, actions: TraceRelationActions): BusinessWindowState {
    return {
        title: contextTitle(context),
        subtitle: '按明细数量串联采购需求、采购计划、采购订单和入库单，便于核对前后关系和状态。',
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
    const rows = demandItemInboundAllocations(demandCode, itemName);
    const totalQty = rows.reduce((sum, row) => sum + row.allocatedQty, 0);
    const inboundCount = new Set(rows.map((row) => row.inboundCode)).size;

    if (!rows.length) {
        return <span className="muted-text">暂无</span>;
    }

    return (
        <span>{numberText(totalQty)} / {inboundCount}单</span>
    );
}

export function PlanOrderRelationTable({
    plan,
    openOrderDetail,
    onOpenTrace,
}: {
    plan: PlanRow;
    openOrderDetail?: (row: OrderRow) => void;
    onOpenTrace?: (context: TraceContext) => void;
}) {
    const rows = relatedOrdersForPlan(plan);

    return (
        <CreateDetailTable
            columns={['订单号', '批次', '供应商', '订单数量', '订单金额', '分配状态', '入库状态', '操作']}
            rows={rows}
            emptyText="暂无关联采购订单"
            renderRow={(order: OrderRow) => (
                <tr key={order.jdOrder}>
                    <td className="link-cell">{order.jdOrder}</td>
                    <td>{order.batch}</td>
                    <td>{order.supplier.replace('京东慧采-', '')}</td>
                    <td>{numberText(lineQty(order.items))}</td>
                    <td>{currency(lineAmount(order.items))}</td>
                    <td><StatusTag value={order.allocationStatus} /></td>
                    <td><StatusTag value={order.status} /></td>
                    <td>
                        <div className="inline-action-group">
                            <button type="button" className="table-link" onClick={() => openOrderDetail?.(order)}>查看订单</button>
                            <TraceRelationAction context={{ type: 'order', code: order.jdOrder, orderCode: order.jdOrder }} onOpenTrace={onOpenTrace} />
                        </div>
                    </td>
                </tr>
            )}
        />
    );
}

export function orderDetailWindow(
    row: OrderRow,
    options?: { openPlanView?: (row: PlanRow) => void; openDemandView?: (row: DemandRow) => void; openTraceRelation?: (context: TraceContext) => void },
): BusinessWindowState {
    const plan = planByCode(row.plan);

    return {
        title: row.match === '已匹配' ? row.jdOrder : '商品匹配',
        subtitle: row.match === '已匹配' ? '已导入订单明细、分配到仓库的入库关系。' : `${row.jdOrder} 存在待匹配商品，需要关联平台装备品类。`,
        primary: row.match === '已匹配' ? undefined : '保存匹配',
        body: (
            <div className="detail-stack">
                <DetailGrid rows={[
                    ['关联计划', plan ? (
                        <button type="button" className="table-link" onClick={() => options?.openPlanView?.(plan)}>
                            {plan.code}
                        </button>
                    ) : row.plan],
                    ['导入批次', row.batch],
                    ['采购方式', row.purchaseMethod],
                    ['分配方式', row.allocationMethod],
                    ['供应商', row.supplier],
                    ['导入时间', row.importedAt],
                    ['订单金额', currency(lineAmount(row.items))],
                    ['商品匹配', <StatusTag value={row.match === '已匹配' ? '已匹配' : '待匹配'} />],
                    ['分配状态', <StatusTag value={row.allocationStatus} />],
                    ['入库状态', <StatusTag value={row.status} />],
                ]} />
                <MiniLineTable items={row.items} amountLabel="订单金额" />
            </div>
        ),
    };
}

export const orderImportAllocationPreview = [
    { warehouse: '章丘分公司仓', demandCode: 'XQ20260616006', itemName: '执勤帽', demandQty: 290, allocatedQty: 0, orderQty: 500, autoQty: 296, manualQty: 296, diff: 6, inboundCode: 'RK20260620001' },
    { warehouse: '高新区分公司仓', demandCode: 'XQ20260616002', itemName: '执勤帽', demandQty: 200, allocatedQty: 0, orderQty: 500, autoQty: 204, manualQty: 204, diff: 4, inboundCode: 'RK20260620002' },
];

export function OrderImportPreview() {
    return (
        <div className="detail-stack order-import-preview">
            <div className="modal-form embedded-form">
                <Field label="订单文件" value="选择采购订单 Excel / 京东慧采订单文件" wide />
                <SelectLike label="关联采购计划" value="JH20260616005 / 执勤帽汇总采购" options={['JH20260616005 / 执勤帽汇总采购', 'JH20260616001 / 历下高新集采', '手动选择采购计划']} />
                <Field label="导入批次" value="第三批 / 系统自动生成" />
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
                                <td>JDHC-20260620-85001</td>
                                <td>JH20260616005</td>
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
        { title: financeNode.title, time: '2026-06-16 10:56', actor: financeNode.actor, status: '已审核', tone: 'green', comment: '预算占用正常，允许进入订单导入。' },
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
        ? ['装备名称', '装备分类', '供应商', '单位', '当前库存', '预警数量', '需求数量', '参考价格', '预算金额', '纳入状态', '关联入库', '操作']
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
                        label="归属仓库"
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
                                <td>{line.category}</td>
                                <td>{line.supplier.replace('京东慧采-', '')}</td>
                                <td>{line.unit}</td>
                                <td>{numberText(line.stock)}</td>
                                <td>{typeof line.warningQty === 'number' ? numberText(line.warningQty) : '-'}</td>
                                <td><input className="qty-input" value={line.qty} readOnly /></td>
                                <td>{currency(line.referencePrice)}</td>
                                <td>{currency(line.referencePrice * line.qty)}</td>
                                {isView && row && (
                                    <>
                                        <td><DemandLineAllocationCell row={row} item={sourceItem} /></td>
                                        <td><DemandLineInboundCell demandCode={row.code} itemName={line.name} /></td>
                                        <td>
                                            <TraceRelationAction
                                                context={{ type: 'demand-line', code: row.code, itemName: line.name }}
                                                onOpenTrace={onOpenTrace}
                                            />
                                        </td>
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
    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel business-window" role="dialog" aria-modal="true" aria-label={window.title}>
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
                    {window.primary && <button type="button" className="primary-btn" onClick={onClose}>{window.primary}</button>}
                </div>
            </div>
        </div>
    );
}
