import React, {
    useState,
} from 'react';
import {
    FlowRow,
    DraftPurchaseOrder,
    DraftPurchaseOrderLine,
    GenerateOrderMode,
    InboundTrace,
    OrderRow,
    OrderWarehouseAllocation,
    PlanRow,
    TraceContext,
    createDraftOrdersForPlan,
    currency,
    draftOrderAmount,
    draftOrderQty,
    draftOrderToAllocations,
    draftOrderToInboundRow,
    draftOrderToInboundTrace,
    draftOrderToOrderRow,
    lineAmount,
    lineQty,
    numberText,
    warehouses,
    CreateSection,
    CreateDetailTable,
    DetailGrid,
    StatusTag,
    TraceRelationAction,
} from '../../shared';

type ValueChangeEvent = {
    target: {
        value: string;
    };
};

export interface GeneratedOrderPayload {
    orders: OrderRow[];
    inbounds: FlowRow[];
    allocations: OrderWarehouseAllocation[];
    traces: InboundTrace[];
}

export function PurchaseOrderGeneratePage({
    row,
    onCancel,
    onCreate,
    onOpenTrace,
}: {
    row: PlanRow;
    onCancel: () => void;
    onCreate: (payload: GeneratedOrderPayload) => void;
    onOpenTrace: (context: TraceContext) => void;
}) {
    const [mode, setMode] = useState<GenerateOrderMode>('single');
    const [draftOrders, setDraftOrders] = useState<DraftPurchaseOrder[]>(() => createDraftOrdersForPlan(row, 'single'));
    const warehouseOptions = warehouses.map((warehouse) => warehouse.name);
    const activeOrders = draftOrders.filter((order: DraftPurchaseOrder) => order.lines.length > 0);
    const totalQty = activeOrders.reduce((sum: number, order: DraftPurchaseOrder) => sum + draftOrderQty(order), 0);
    const totalAmount = activeOrders.reduce((sum: number, order: DraftPurchaseOrder) => sum + draftOrderAmount(order), 0);
    const planAmount = lineAmount(row.items);

    function changeMode(nextMode: GenerateOrderMode) {
        setMode(nextMode);
        setDraftOrders(createDraftOrdersForPlan(row, nextMode));
    }

    function updateOrder(orderId: string, updates: Partial<{ targetWarehouse: string; note: string }>) {
        setDraftOrders((items: DraftPurchaseOrder[]) => items.map((order: DraftPurchaseOrder) => (
            order.id === orderId ? { ...order, ...updates } : order
        )));
    }

    function updateLine(orderId: string, lineId: string, updates: Partial<{ orderQty: number; unitPrice: number }>) {
        setDraftOrders((items: DraftPurchaseOrder[]) => items.map((order: DraftPurchaseOrder) => {
            if (order.id !== orderId) {
                return order;
            }

            return {
                ...order,
                lines: order.lines.map((line: DraftPurchaseOrderLine) => (
                    line.id === lineId ? { ...line, ...updates } : line
                )),
            };
        }));
    }

    function removeLine(orderId: string, lineId: string) {
        setDraftOrders((items: DraftPurchaseOrder[]) => items.map((order: DraftPurchaseOrder) => (
            order.id === orderId
                ? { ...order, lines: order.lines.filter((line: DraftPurchaseOrderLine) => line.id !== lineId) }
                : order
        )));
    }

    function removeOrder(orderId: string) {
        setDraftOrders((items: DraftPurchaseOrder[]) => items.filter((order: DraftPurchaseOrder) => order.id !== orderId));
    }

    function submit(withInbound: boolean) {
        const ordersToCreate = activeOrders;
        const inbounds = withInbound
            ? ordersToCreate.map((order: DraftPurchaseOrder, index: number) => draftOrderToInboundRow(order, undefined, index))
            : [];
        const orders = ordersToCreate.map((order: DraftPurchaseOrder, index: number) => ({
            ...draftOrderToOrderRow(order, withInbound),
            inboundCodes: withInbound ? [inbounds[index].code] : [],
        }));
        const allocations = ordersToCreate.flatMap((order: DraftPurchaseOrder, index: number) => draftOrderToAllocations(order, inbounds[index]));
        const traces = withInbound
            ? ordersToCreate.map((order: DraftPurchaseOrder, index: number) => draftOrderToInboundTrace(order, inbounds[index]))
            : [];

        onCreate({ orders, inbounds, allocations, traces });
    }

    return (
        <div className="create-page purchase-order-generate-page">
            <CreateSection
                title="生成方式"
                subtitle="生成订单按计划形成一个全量订单；按采购需求批量生成会根据来源仓库拆成多个订单"
            >
                <div className="generate-mode-row">
                    <button
                        type="button"
                        className={mode === 'single' ? 'generate-mode active' : 'generate-mode'}
                        onClick={() => changeMode('single')}
                    >
                        <strong>生成订单</strong>
                        <span>按采购计划生成一个全量明细订单</span>
                    </button>
                    <button
                        type="button"
                        className={mode === 'by-warehouse' ? 'generate-mode active' : 'generate-mode'}
                        onClick={() => changeMode('by-warehouse')}
                    >
                        <strong>按采购需求批量生成</strong>
                        <span>按需求来源仓库和需求数量分仓生成</span>
                    </button>
                </div>
                <DetailGrid rows={[
                    ['计划数量', `${numberText(lineQty(row.items))} 件`],
                    ['计划预算', currency(planAmount)],
                    ['待创建订单', `${activeOrders.length} 单`],
                    ['订单数量', `${numberText(totalQty)} 件`],
                    ['订单金额', currency(totalAmount)],
                    ['价差', planAmount ? `${(((totalAmount - planAmount) / planAmount) * 100).toFixed(1)}%` : '0%'],
                ]} />
            </CreateSection>

            <CreateSection
                title="待创建订单"
                subtitle="每个订单必须指明单个目标仓库，可维护订单数量、订单单价和订单说明"
            >
                <div className="draft-order-list">
                    {activeOrders.length ? activeOrders.map((order: DraftPurchaseOrder) => (
                        <section className="draft-order-card" key={order.id}>
                            <div className="draft-order-head">
                                <div>
                                    <span>采购订单号</span>
                                    <h3>{order.orderCode}</h3>
                                </div>
                                <div className="draft-order-head-metrics">
                                    <strong>{currency(draftOrderAmount(order))}</strong>
                                    <em>{numberText(draftOrderQty(order))} 件 / {order.lines.length} 行明细</em>
                                </div>
                                <button type="button" className="table-link table-link-danger" onClick={() => removeOrder(order.id)}>删除订单</button>
                            </div>
                            <div className="draft-order-fields">
                                <label className="create-field">
                                    <span>目标仓库</span>
                                    <select value={order.targetWarehouse} onChange={(event: ValueChangeEvent) => updateOrder(order.id, { targetWarehouse: event.target.value })}>
                                        {warehouseOptions.map((warehouse) => (
                                            <option key={warehouse}>{warehouse}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="create-field">
                                    <span>供应商</span>
                                    <input value={order.supplier} readOnly />
                                </label>
                                <label className="create-field create-field-wide draft-note-field">
                                    <span>订单说明</span>
                                    <textarea value={order.note} onChange={(event: ValueChangeEvent) => updateOrder(order.id, { note: event.target.value })} />
                                </label>
                            </div>
                            <CreateDetailTable
                                columns={['需求单号', '需求仓库', '装备名称', '分类', '计划数量', '订单数量', '订单单价', '订单金额', '操作']}
                                rows={order.lines}
                                emptyText="该订单暂无明细"
                                renderRow={(line: DraftPurchaseOrderLine) => (
                                    <tr key={line.id}>
                                        <td>{line.demandCode}</td>
                                        <td>{line.sourceWarehouse}</td>
                                        <td className="link-cell">{line.name}</td>
                                        <td>{line.category}</td>
                                        <td>{numberText(line.planQty)} {line.unit}</td>
                                        <td>
                                            <input
                                                className="qty-input"
                                                type="number"
                                                min={0}
                                                value={line.orderQty}
                                                onChange={(event: ValueChangeEvent) => updateLine(order.id, line.id, { orderQty: Number(event.target.value) })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="qty-input price-input"
                                                type="number"
                                                min={0}
                                                value={line.unitPrice}
                                                onChange={(event: ValueChangeEvent) => updateLine(order.id, line.id, { unitPrice: Number(event.target.value) })}
                                            />
                                        </td>
                                        <td>{currency(line.orderQty * line.unitPrice)}</td>
                                        <td>
                                            <button type="button" className="table-link table-link-danger" onClick={() => removeLine(order.id, line.id)}>移除</button>
                                        </td>
                                    </tr>
                                )}
                            />
                        </section>
                    )) : (
                        <div className="order-generate-empty">
                            <StatusTag value="未生成" />
                            <span>当前没有待创建订单，请切换生成方式或返回采购计划。</span>
                        </div>
                    )}
                </div>
                <div className="generate-trace-link">
                    <TraceRelationAction context={{ type: 'plan', code: row.code }} onOpenTrace={onOpenTrace} label="查看采购计划链路" />
                </div>
            </CreateSection>

            <div className="create-page-actions order-generate-actions">
                <button type="button" className="secondary-btn" onClick={onCancel}>取消</button>
                <button type="button" className="secondary-btn" disabled={!activeOrders.length} onClick={() => submit(false)}>创建订单</button>
                <button type="button" className="primary-btn" disabled={!activeOrders.length} onClick={() => submit(true)}>创建并生成入库单</button>
            </div>
        </div>
    );
}
