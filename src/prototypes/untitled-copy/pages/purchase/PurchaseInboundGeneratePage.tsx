import React, { useState } from 'react';
import {
    DraftInboundLine,
    DraftInboundOrder,
    FlowRow,
    InboundTrace,
    OrderRow,
    currency,
    numberText,
    lineQty,
    lineAmount,
    itemSummary,
    orderInboundSummary,
    createDraftInboundsForOrder,
    draftInboundQty,
    draftInboundAmount,
    draftInboundToFlowRow,
    draftInboundToTrace,
    nextInboundDocumentCode,
    warehouseManager,
    updateOrderWithInboundSummary,
    validateDraftInbounds,
    CreateSection,
    CreateDetailTable,
    DetailGrid,
    StatusTag,
} from '../../shared';

type ValueChangeEvent = {
    target: {
        value: string;
    };
};

export interface GeneratedInboundPayload {
    order: OrderRow;
    inbounds: FlowRow[];
    traces: InboundTrace[];
}

function draftLineTotal(drafts: DraftInboundOrder[], line: DraftInboundLine) {
    return drafts.reduce((sum, draft) => {
        const match = draft.lines.find((item) => item.name === line.name);
        return sum + (match?.inboundQty || 0);
    }, 0);
}

function draftHasItems(row: DraftInboundOrder) {
    return row.lines.some((line) => line.inboundQty > 0);
}

function draftCodesFrom(drafts: DraftInboundOrder[]) {
    return drafts.map((draft) => draft.inboundCode);
}

export function PurchaseInboundGeneratePage({
    row,
    inboundRows,
    onCancel,
    onCreate,
}: {
    row: OrderRow;
    inboundRows: FlowRow[];
    onCancel: () => void;
    onCreate: (payload: GeneratedInboundPayload) => void;
}) {
    const existingCodes = inboundRows.map((item) => item.code);
    const summary = orderInboundSummary(row, inboundRows);
    const [drafts, setDrafts] = useState<DraftInboundOrder[]>(() => createDraftInboundsForOrder(row, inboundRows, existingCodes));
    const draftQty = drafts.reduce((sum, draft) => sum + draftInboundQty(draft), 0);
    const draftAmount = drafts.reduce((sum, draft) => sum + draftInboundAmount(draft), 0);
    const validation = validateDraftInbounds(drafts);
    const canSubmit = validation.canSubmit;

    function updateDraft(draftId: string, updates: Partial<Pick<DraftInboundOrder, 'handler' | 'note'>>) {
        setDrafts((items) => items.map((draft) => (
            draft.id === draftId ? { ...draft, ...updates } : draft
        )));
    }

    function updateLine(draftId: string, lineId: string, qty: number) {
        setDrafts((items) => items.map((draft) => {
            if (draft.id !== draftId) {
                return draft;
            }

            return {
                ...draft,
                lines: draft.lines.map((line) => (
                    line.id === lineId ? { ...line, inboundQty: Number.isFinite(qty) ? qty : 0 } : line
                )),
            };
        }));
    }

    function removeDraft(draftId: string) {
        setDrafts((items) => items.filter((draft) => draft.id !== draftId));
    }

    function addDraft() {
        const usedCodes = [...existingCodes, ...draftCodesFrom(drafts)];
        const code = nextInboundDocumentCode(usedCodes);
        const warehouse = row.targetWarehouse || '集团总仓';
        setDrafts((items) => {
            const remainingLines = createDraftInboundsForOrder(row, inboundRows, usedCodes)[0]?.lines || [];
            const lines = remainingLines.map((line) => ({
                ...line,
                id: line.id + '-extra-' + (items.length + 1),
                inboundQty: Math.max(0, line.remainingQty - draftLineTotal(items, line)),
            }));

            return [
                ...items,
                {
                    id: row.jdOrder + '-inbound-extra-' + (items.length + 1),
                    inboundCode: code,
                    orderCode: row.jdOrder,
                    planCode: row.plan,
                    warehouse,
                    handler: warehouseManager(warehouse),
                    note: '追加到货生成入库单。',
                    lines,
                },
            ];
        });
    }

    function submit() {
        if (!canSubmit) {
            return;
        }

        const inbounds = drafts.map(draftInboundToFlowRow);
        const updatedOrder = updateOrderWithInboundSummary(row, inbounds, inboundRows);
        onCreate({
            order: updatedOrder,
            inbounds,
            traces: drafts.map((draft) => draftInboundToTrace(draft, row)),
        });
    }

    return (
        <div className="create-page purchase-inbound-generate-page">
            <CreateSection
                title="生成入库单"
                subtitle="按实际到货拆分入库单，同一采购订单可一次生成多张，也可保留余量后续继续生成"
            >
                <DetailGrid rows={[
                    ['采购订单号', row.jdOrder],
                    ['关联采购计划', row.plan],
                    ['目标仓库', row.targetWarehouse || '--'],
                    ['供应商', row.supplier],
                    ['订单数量', numberText(lineQty(row.items)) + ' 件'],
                    ['已生成数量', numberText(summary.generatedQty) + ' 件 / ' + summary.count + ' 单'],
                    ['剩余数量', numberText(summary.remainingQty) + ' 件'],
                    ['订单金额', currency(lineAmount(row.items))],
                    ['装备摘要', itemSummary(row.items)],
                    ['当前入库状态', <StatusTag value={summary.status} />],
                ]} />
            </CreateSection>

            <CreateSection
                title="待生成入库单"
                subtitle="每张入库单只写入本次数量大于 0 的明细；多张草稿合计不得超过剩余数量"
                action={<button type="button" className="secondary-btn" onClick={addDraft}>新增一张入库单</button>}
            >
                <div className="draft-inbound-list">
                    {drafts.map((draft, draftIndex) => (
                        <section className="draft-order-card draft-inbound-card" key={draft.id}>
                            <div className="draft-order-head">
                                <div>
                                    <span>入库单号</span>
                                    <h3>{draft.inboundCode}</h3>
                                </div>
                                <div className="draft-order-head-metrics">
                                    <strong>{numberText(draftInboundQty(draft))} 件</strong>
                                    <em>{currency(draftInboundAmount(draft))} / {draft.lines.filter((line) => line.inboundQty > 0).length} 行明细</em>
                                </div>
                                <button type="button" className="table-link table-link-danger" onClick={() => removeDraft(draft.id)}>删除入库单</button>
                            </div>
                            <div className="draft-order-fields">
                                <label className="create-field">
                                    <span>入库仓库</span>
                                    <input value={draft.warehouse} readOnly />
                                </label>
                                <label className="create-field">
                                    <span>经办人</span>
                                    <input value={draft.handler} onChange={(event: ValueChangeEvent) => updateDraft(draft.id, { handler: event.target.value })} />
                                </label>
                                <label className="create-field create-field-wide draft-note-field">
                                    <span>入库说明</span>
                                    <textarea value={draft.note} onChange={(event: ValueChangeEvent) => updateDraft(draft.id, { note: event.target.value })} />
                                </label>
                            </div>
                            <CreateDetailTable
                                columns={['装备名称', '订单数量', '已生成', '剩余可生成', '本次数量', '单位', '入库单价', '入库成本', '提示']}
                                rows={draft.lines}
                                emptyText="暂无可生成明细"
                                renderRow={(line: DraftInboundLine) => {
                                    const lineTotal = draftLineTotal(drafts, line);
                                    const overLimit = lineTotal > line.remainingQty;
                                    const lineRest = Math.max(line.remainingQty - lineTotal, 0);

                                    return (
                                        <tr key={draft.id + '-' + line.id}>
                                            <td className="link-cell">{line.name}</td>
                                            <td>{numberText(line.orderQty)}</td>
                                            <td>{numberText(line.generatedQty)}</td>
                                            <td>{numberText(line.remainingQty)}</td>
                                            <td>
                                                <input
                                                    className={overLimit ? 'qty-input is-error' : 'qty-input'}
                                                    type="number"
                                                    min={0}
                                                    max={line.remainingQty}
                                                    value={line.inboundQty}
                                                    onChange={(event: ValueChangeEvent) => updateLine(draft.id, line.id, Number(event.target.value))}
                                                />
                                            </td>
                                            <td>{line.unit}</td>
                                            <td>{currency(line.unitPrice)}</td>
                                            <td>{currency(line.inboundQty * line.unitPrice)}</td>
                                            <td>
                                                {overLimit ? (
                                                    <span className="line-error">多张合计超出剩余 {numberText(line.remainingQty)}</span>
                                                ) : line.inboundQty === 0 ? (
                                                    <span className="muted-text">本单不入库</span>
                                                ) : (
                                                    <span className="muted-text">本项还可分配 {numberText(lineRest)}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }}
                            />
                            {!draftHasItems(draft) && (
                                <div className="draft-inbound-warning">第 {draftIndex + 1} 张入库单没有有效数量，请重新分配数量或删除该草稿后再提交。</div>
                            )}
                        </section>
                    ))}
                </div>
                {validation.overLimitLines.length > 0 && (
                    <div className="finance-form-error" role="alert">存在装备累计生成数量超过剩余数量，请调整后再提交。</div>
                )}
                {validation.invalidLines.length > 0 && (
                    <div className="finance-form-error" role="alert">入库数量只能填写非负整数，请调整后再提交。</div>
                )}
                {validation.emptyDrafts.length > 0 && (
                    <div className="draft-inbound-hint">有 {validation.emptyDrafts.length} 张草稿为空，系统不会提交空入库单。</div>
                )}
            </CreateSection>

            <div className="create-page-actions order-generate-actions inbound-generate-actions">
                <div className="inbound-generate-summary">
                    <strong>本次将生成 {drafts.length} 张入库单</strong>
                    <span>{numberText(draftQty)} 件 / {currency(draftAmount)}</span>
                </div>
                <button type="button" className="secondary-btn" onClick={onCancel}>取消</button>
                <button type="button" className="primary-btn" disabled={!canSubmit} onClick={submit}>确认生成入库单</button>
            </div>
        </div>
    );
}
