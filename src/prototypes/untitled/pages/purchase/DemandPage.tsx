import React, {
    useState,
} from 'react';
import {
    DemandRow,
    PlanRow,
    TraceContext,
    demands,
    currency,
    numberText,
    lineQty,
    lineAmount,
    displayDemandIncludeStatus,
    relatedPlansForDemand,
    itemSummary,
    Tag,
    StatusTag,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
    DemandIncludeStatusCell,
} from '../../shared';

export function DemandPage({
    openPlans,
    openCreateDemand,
    openDemandView,
    openPlanView,
    onOpenTrace,
    openWindow,
}: {
    openPlans: () => void;
    openCreateDemand: () => void;
    openDemandView: (row: DemandRow) => void;
    openPlanView: (row: PlanRow) => void;
    onOpenTrace: (context: TraceContext) => void;
    openWindow: OpenBusinessWindow;
}) {
    const [selectedDemandCodes, setSelectedDemandCodes] = useState<string[]>([]);
    const allSelected = selectedDemandCodes.length === demands.length;

    function toggleAllDemands() {
        setSelectedDemandCodes(allSelected ? [] : demands.map((row) => row.code));
    }

    function toggleDemand(code: string) {
        setSelectedDemandCodes((codes) => (
            codes.includes(code)
                ? codes.filter((item) => item !== code)
                : [...codes, code]
        ));
    }

    return (
        <>
            <FilterBar className="purchase-demand-filter">
                <SelectLike label="分公司" value="全部分公司" />
                <SelectLike label="需求类型" value="全部类型" />
                <Field label="装备名称" value="请输入装备名称" />
                <SelectLike label="状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="分公司采购需求"
                    subtitle="集团接收分公司需求后，通用物资汇总采购，紧急和项目专属需求拆分单采"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={openCreateDemand}>新增采购需求</button>
                    <button type="button" className="secondary-btn" disabled={selectedDemandCodes.length === 0} onClick={openPlans}>生成采购计划</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出采购需求',
                        subtitle: '导出分公司需求、预算金额和汇总状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '需求单号、分公司、需求范围、明细、预算金额、审核状态、计划纳入状态'], ['用途', '集团汇总采购和需求复核']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={[
                        <label className="table-checkbox" aria-label="全选采购需求">
                            <input type="checkbox" checked={allSelected} onChange={toggleAllDemands} />
                        </label>,
                        '需求单号',
                        '分公司',
                        '需求范围',
                        '明细数',
                        '装备摘要',
                        '数量合计',
                        '需求类型',
                        '期望到货',
                        '预算金额',
                        '审核状态',
                        '计划纳入状态',
                        '操作',
                    ]}
                    rows={demands}
                    renderRow={(row: DemandRow) => {
                        const includeStatus = displayDemandIncludeStatus(row);
                        const firstRelatedPlan = relatedPlansForDemand(row)[0];

                        return (
                            <tr key={row.code}>
                                <td className="checkbox-cell">
                                    <label className="table-checkbox" aria-label={`选择${row.code}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDemandCodes.includes(row.code)}
                                            onChange={() => toggleDemand(row.code)}
                                        />
                                    </label>
                                </td>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.branch}</td>
                                <td>{row.project}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{numberText(lineQty(row.items))}</td>
                                <td><Tag tone={row.type === '集团集采' ? 'blue' : 'purple'}>{row.type}</Tag></td>
                                <td>{row.due}</td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td><StatusTag value={row.auditStatus} /></td>
                                <td>{includeStatus === '--' ? '--' : <DemandIncludeStatusCell row={row} />}</td>
                                <td>
                                    <RowActions
                                        allowDelete={row.auditStatus === '未提交'}
                                        actions={[
                                            {
                                                label: '查看',
                                                onClick: () => openDemandView(row),
                                            },
                                            {
                                                label: '追溯',
                                                onClick: () => onOpenTrace({ type: 'demand', code: row.code }),
                                            },
                                            {
                                                label: includeStatus === '未纳入' || includeStatus === '--' ? '生成采购计划' : '查看关联计划',
                                                onClick: includeStatus === '未纳入' || !firstRelatedPlan ? openPlans : () => openPlanView(firstRelatedPlan),
                                            },
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
