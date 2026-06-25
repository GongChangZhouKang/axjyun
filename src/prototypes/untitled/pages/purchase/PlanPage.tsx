import React from 'react';
import {
    PlanRow,
    TraceContext,
    plans,
    currency,
    numberText,
    lineQty,
    lineAmount,
    planOrderAmountFromOrders,
    planOrderVarianceFromOrders,
    displayPlanOrderImportStatus,
    itemSummary,
    StatusTag,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
} from '../../shared';

export function PlanPage({
    openOrders,
    openCreatePlan,
    openPlanView,
    onOpenTrace,
    openWindow,
}: {
    openOrders: () => void;
    openCreatePlan: () => void;
    openPlanView: (row: PlanRow) => void;
    onOpenTrace: (context: TraceContext) => void;
    openWindow: OpenBusinessWindow;
}) {
    return (
        <>
            <FilterBar>
                <Field label="计划号" value="请输入计划号" />
                <SelectLike label="采购模式" value="全部模式" />
                <SelectLike label="计划状态" value="全部状态" />
                <SelectLike label="成本口径" value="预算价格/订单价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="集团采购计划"
                    subtitle="计划阶段记录预算价格，订单导入后对比订单价格"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={openCreatePlan}>新增采购计划</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出采购计划',
                        subtitle: '导出当前采购计划及预算/订单差异。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '计划单号、采购模式、预算金额、订单金额、价差、审核状态、导入订单状态'], ['用途', '采购审批、价格差异复核']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['计划单号', '采购模式', '需求来源', '明细数', '采购内容', '数量合计', '预算金额', '订单金额', '价差', '审核状态', '导入订单状态', '操作']}
                    rows={plans}
                    renderRow={(row: PlanRow) => {
                        const importStatus = displayPlanOrderImportStatus(row);
                        const hasOrderAmount = importStatus !== '--' && importStatus !== '未导入';

                        return (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.mode}</td>
                                <td>{row.source}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{numberText(lineQty(row.items))}</td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td>{hasOrderAmount ? currency(planOrderAmountFromOrders(row)) : '--'}</td>
                                <td>{hasOrderAmount ? planOrderVarianceFromOrders(row) : '--'}</td>
                                <td><StatusTag value={row.auditStatus} /></td>
                                <td>{importStatus === '--' ? '--' : <StatusTag value={importStatus} />}</td>
                                <td>
                                    <RowActions
                                        allowDelete={row.auditStatus === '待提交'}
                                        actions={[
                                            {
                                            label: '查看',
                                            onClick: () => openPlanView(row),
                                        },
                                        {
                                            label: '追溯',
                                            onClick: () => onOpenTrace({ type: 'plan', code: row.code }),
                                        },
                                        { label: importStatus === '未导入' || importStatus === '--' ? '导入订单' : '查看订单', onClick: openOrders },
                                    ]}
                                    />
                                </td>
                            </tr>
                        );
                    }}
                />
            </section>
        </>
    );
}
