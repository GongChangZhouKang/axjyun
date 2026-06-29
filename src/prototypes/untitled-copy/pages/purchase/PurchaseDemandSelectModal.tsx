import React, {
    useState,
} from 'react';
import {
    DemandRow,
    TraceContext,
    demands,
    currency,
    numberText,
    lineAmount,
    demandItemAllocationSummary,
    demandAllocationTotals,
    displayDemandIncludeStatus,
    Field,
    SelectLike,
    CreateDetailTable,
    TraceRelationAction,
    DemandIncludeStatusCell,
} from '../../shared';

export function PurchaseDemandSelectModal({
    onClose,
    onConfirm,
    openDemandView,
    onOpenTrace,
}: {
    onClose: () => void;
    onConfirm: (rows: DemandRow[]) => void;
    openDemandView: (row: DemandRow) => void;
    onOpenTrace?: (context: TraceContext) => void;
}) {
    const statusPriority: Record<string, number> = { 未纳入: 0, 部分纳入: 1, 全部纳入: 2 };
    const candidateRows = demands
        .filter((demand) => {
            const status = displayDemandIncludeStatus(demand);
            return demand.auditStatus === '审核通过' && (status === '未纳入' || status === '部分纳入');
        })
        .sort((left, right) => (
            statusPriority[displayDemandIncludeStatus(left)] - statusPriority[displayDemandIncludeStatus(right)]
        ));
    const [selectedCodes, setSelectedCodes] = useState<string[]>(candidateRows.map((row) => row.code));

    function toggleDemand(code: string) {
        setSelectedCodes((codes: string[]) => (
            codes.includes(code)
                ? codes.filter((item: string) => item !== code)
                : [...codes, code]
        ));
    }

    function confirmSelected() {
        onConfirm(candidateRows.filter((row) => selectedCodes.includes(row.code)));
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel demand-select-modal" role="dialog" aria-modal="true" aria-label="查询选择采购需求">
                <div className="modal-header">
                    <div>
                        <h2>查询选择采购需求</h2>
                        <p>优先展示审核通过且未纳入、部分纳入的采购需求，默认按剩余数量纳入本次计划。</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-form embedded-form demand-select-query">
                    <Field label="需求单号" value="请输入需求单号" />
                    <SelectLike label="分公司" value="全部分公司" />
                    <SelectLike label="需求类型" value="全部类型" />
                </div>
                <div className="demand-select-table">
                    <CreateDetailTable
                        columns={['选择', '需求单号', '分公司', '需求范围', '纳入状态', '明细剩余', '剩余数量', '本次纳入', '预算金额', '操作']}
                        rows={candidateRows}
                        emptyText="暂无可纳入采购计划的采购需求"
                        renderRow={(row: DemandRow) => {
                            const totals = demandAllocationTotals(row);
                            const remainingLines = row.items
                                .map((item) => {
                                    const summary = demandItemAllocationSummary(row, item);
                                    return `${item.name} ${numberText(summary.remainingQty)}${item.unit}`;
                                })
                                .filter((text) => !text.includes(' 0'));

                            return (
                                <tr key={row.code}>
                                    <td>
                                        <label className="table-checkbox" aria-label={`选择${row.code}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCodes.includes(row.code)}
                                                onChange={() => toggleDemand(row.code)}
                                            />
                                        </label>
                                    </td>
                                    <td className="link-cell">{row.code}</td>
                                    <td>{row.branch}</td>
                                    <td>{row.project}</td>
                                    <td><DemandIncludeStatusCell row={row} /></td>
                                    <td className="text-ellipsis-cell" title={remainingLines.join('；')}>{remainingLines.join('；')}</td>
                                    <td>{numberText(totals.remainingQty)}</td>
                                    <td><input className="qty-input" value={totals.remainingQty} readOnly /></td>
                                    <td>{currency(lineAmount(row.items))}</td>
                                    <td>
                                        <div className="inline-action-group">
                                            <button type="button" className="table-link" onClick={() => openDemandView(row)}>查看</button>
                                            <TraceRelationAction context={{ type: 'demand', code: row.code }} onOpenTrace={onOpenTrace} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        }}
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>取消</button>
                    <button type="button" className="primary-btn" onClick={confirmSelected}>确认选择</button>
                </div>
            </div>
        </div>
    );
}
