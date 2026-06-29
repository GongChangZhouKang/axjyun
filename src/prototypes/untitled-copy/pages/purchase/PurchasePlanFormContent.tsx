import React from 'react';
import {
    PurchasePlanLine,
    DemandRow,
    PlanRow,
    purchasePlanFlowNodes,
    OrderRow,
    TraceContext,
    currency,
    numberText,
    lineAmount,
    planBudgetTotal,
    Tag,
    StatusTag,
    CreateField,
    CreateSection,
    CreateDetailTable,
    TraceRelationAction,
    DemandIncludeStatusCell,
    PlanOrderRelationTable,
    ApprovalTimeline,
    planApprovalSteps,
    ApprovalFlowSetup,
} from '../../shared';

export function PurchasePlanFormContent({
    mode,
    row,
    detailLines,
    relatedDemands,
    onAddEquipment,
    onPullDemands,
    onDeleteLine,
    openDemandView,
    openOrderDetail,
    orderRows,
    onOpenTrace,
}: {
    mode: 'create' | 'view';
    row?: PlanRow;
    detailLines: PurchasePlanLine[];
    relatedDemands: DemandRow[];
    orderRows?: OrderRow[];
    onAddEquipment?: () => void;
    onPullDemands?: () => void;
    onDeleteLine?: (name: string) => void;
    openDemandView: (row: DemandRow) => void;
    openOrderDetail?: (row: OrderRow) => void;
    onOpenTrace?: (context: TraceContext) => void;
}) {
    const isView = mode === 'view';
    const planMode = row?.mode || '集团集采';
    const source = row?.source || '待汇总采购需求';
    const totalBudgetAmount = planBudgetTotal(detailLines);

    return (
        <>
            <CreateSection title="基本信息">
                <div className="create-form-grid">
                    <CreateField
                        label="计划组织"
                        value="山东振邦保安服务有限公司"
                        required={!isView}
                        options={isView ? undefined : ['山东振邦保安服务有限公司', '历下分公司', '高新区分公司', '章丘分公司']}
                    />
                    <CreateField
                        label="采购模式"
                        value={planMode}
                        required={!isView}
                        options={isView ? undefined : ['集团集采', '项目专属采购', '紧急单采', '特殊尺码采购']}
                    />
                    <CreateField
                        label="需求来源"
                        value={source}
                        required={!isView}
                        options={isView ? undefined : ['待汇总采购需求', '单独采购需求', '库存预警需求', '手工新增']}
                    />
                    <CreateField
                        label="采购平台"
                        value="京东慧采"
                        options={isView ? undefined : ['京东慧采', '线下供应商', '历史订单复购']}
                    />
                    <CreateField label="计划到货" value="2026-06-30" required={!isView} />
                    <CreateField
                        label="计划说明"
                        value="说明本次采购计划的覆盖范围、拆分原因和需要采购部重点复核的事项。"
                        wide
                        multiline
                    />
                </div>
            </CreateSection>

            <CreateSection
                title="明细"
                subtitle="计划阶段记录预算价格，订单生成后再与实际订单价格对比"
            >
                {!isView && (
                    <div className="create-detail-actions">
                        <button type="button" className="primary-btn" onClick={onAddEquipment}>添加装备</button>
                        <button type="button" className="secondary-btn" onClick={onPullDemands}>查询选择采购需求</button>
                    </div>
                )}
                <div className="create-summary-line">
                    汇总预算金额：<strong>{currency(totalBudgetAmount)}</strong>
                </div>
                <CreateDetailTable
                    columns={isView
                        ? ['需求单号', '装备名称', '装备分类', '采购模式', '需求数量', '本计划纳入', '采购数量', '预算单价', '预算金额', '操作']
                        : ['需求单号', '装备名称', '装备分类', '采购模式', '需求数量', '本计划纳入', '采购数量', '预算单价', '预算金额', '操作']}
                    rows={detailLines}
                    emptyText={`汇总预算金额：${currency(totalBudgetAmount)}；请点击“添加装备”或“查询选择采购需求”维护采购计划明细`}
                    renderRow={(line: PurchasePlanLine) => (
                        <tr key={`${line.demandCode}-${line.name}`}>
                            <td>{line.demandCode}</td>
                            <td className="link-cell">{line.name}</td>
                            <td>{line.category}</td>
                            <td>{line.mode}</td>
                            <td>{numberText(line.demandQty)}</td>
                            <td>{numberText(line.includedQty)}</td>
                            <td><input className="qty-input" value={line.planQty} readOnly /></td>
                            <td>{currency(line.budgetPrice)}</td>
                            <td>{currency(line.budgetAmount)}</td>
                            {isView && row && (
                                <td>
                                    <TraceRelationAction
                                        context={{ type: 'plan-line', code: row.code, itemName: line.name }}
                                        onOpenTrace={onOpenTrace}
                                    />
                                </td>
                            )}
                            {!isView && (
                                <td>
                                    <button type="button" className="table-link table-link-danger" onClick={() => onDeleteLine?.(line.name)}>
                                        删除
                                    </button>
                                </td>
                            )}
                        </tr>
                    )}
                />
            </CreateSection>

            <CreateSection title="关联采购需求" subtitle="展示该采购计划关联的采购需求，可进入需求明细核对来源">
                <CreateDetailTable
                    columns={['需求单号', '分公司', '需求范围', '需求类型', '明细数', '预算金额', '审核状态', '计划纳入状态', '操作']}
                    rows={relatedDemands}
                    emptyText="暂无关联采购需求"
                    renderRow={(demand: DemandRow) => (
                        <tr key={demand.code}>
                            <td className="link-cell">{demand.code}</td>
                            <td>{demand.branch}</td>
                            <td>{demand.project}</td>
                            <td><Tag tone={demand.type === '集团集采' ? 'blue' : 'purple'}>{demand.type}</Tag></td>
                            <td>{demand.items.length} 项</td>
                            <td>{currency(lineAmount(demand.items))}</td>
                            <td><StatusTag value={demand.auditStatus} /></td>
                            <td><DemandIncludeStatusCell row={demand} /></td>
                            <td>
                                <div className="inline-action-group">
                                    <button type="button" className="table-link" onClick={() => openDemandView(demand)}>查看</button>
                                    <TraceRelationAction context={{ type: 'demand', code: demand.code }} onOpenTrace={onOpenTrace} />
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </CreateSection>

            {isView && row && (
                <CreateSection title="关联采购订单" subtitle="采购计划审核通过后可生成采购订单，订单再按目标仓库生成入库单">
                    <PlanOrderRelationTable plan={row} orderRows={orderRows} openOrderDetail={openOrderDetail} onOpenTrace={onOpenTrace} />
                </CreateSection>
            )}

            <CreateSection title="流程" subtitle="采购计划提交后先走内部审核，审核通过后再进入订单生成">
                {isView && row ? <ApprovalTimeline steps={planApprovalSteps(row)} /> : <ApprovalFlowSetup nodes={purchasePlanFlowNodes} />}
            </CreateSection>
        </>
    );
}
