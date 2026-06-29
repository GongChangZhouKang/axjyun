import React from 'react';
import {
    BarChart3,
    Building2,
    ShieldCheck,
} from 'lucide-react';
import {
    CostTraceRow,
    costTraceRows,
    currency,
    numberText,
    StatCard,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
    CostTraceDetail,
} from '../shared';

export function CostPage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    const total = costTraceRows.reduce((sum, row) => sum + row.amount, 0);
    return (
        <>
            <div className="stats-grid compact">
                <StatCard title="本月已归集" value={currency(total)} note="按领用、批次和折旧明细汇总" icon={BarChart3} tone="blue" />
                <StatCard title="成本明细" value={`${costTraceRows.length} 条`} note="可追溯来源单据、批次或编号" icon={Building2} tone="green" />
                <StatCard title="折旧归集" value={currency(costTraceRows.filter((row) => row.method === '单件折旧').reduce((sum, row) => sum + row.amount, 0))} note="按领用到归还期间计算" icon={ShieldCheck} tone="orange" />
            </div>
            <FilterBar>
                <SelectLike label="项目" value="全部项目" />
                <SelectLike label="成本方式" value="全部方式" />
                <Field label="来源单据" value="请输入领用/调拨/入库单号" />
                <Field label="装备编号/批次" value="请输入编号或批次号" />
                <SelectLike label="成本月份" value="2026-06" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="项目成本归集明细" subtitle="项目成本不在采购计划阶段确认，在领用、调拨到项目点或消耗时按移动加权、批次管理或单件折旧归集" />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增成本归集',
                        subtitle: '用于补录线下确认或特殊调整后的项目成本归集记录。',
                        primary: '保存归集',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="项目" value="CBD园区项目" options={['CBD园区项目', '会展中心项目', '软件园项目', '大学城项目']} />
                                <SelectLike label="成本方式" value="移动加权平均" options={['移动加权平均', '批次管理', '单件折旧', '手工调整']} />
                                <Field label="来源单据" value="请输入来源单据号" />
                                <Field label="归集金额" value="请输入金额" />
                                <Field label="归集说明" value="说明成本归属和调整原因" wide />
                            </div>
                        ),
                    })}>新增成本归集</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出成本归集',
                        subtitle: '导出项目成本、计价方式、来源单据、批次和装备编号。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '项目、装备、数量、计价方式、来源单据、批次/编号、归集金额'], ['用途', '项目成本核算和经营分析']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['项目', '来源单据', '装备', '数量', '计价方式', '归集时间', '归集金额', '可追溯来源', '操作']}
                    rows={costTraceRows}
                    renderRow={(row: CostTraceRow) => (
                        <tr key={`${row.project}-${row.source}-${row.item}`}>
                            <td className="link-cell">{row.project}</td>
                            <td>{row.source}</td>
                            <td>{row.item}</td>
                            <td>{numberText(row.qty)} {row.unit}</td>
                            <td>{row.method}</td>
                            <td>{row.collectTime}</td>
                            <td>{currency(row.amount)}</td>
                            <td>{row.trace}</td>
                            <td>
                                <RowActions
                                    allowDelete={false}
                                    actions={[
                                        {
                                            label: '查看明细',
                                            onClick: () => openWindow({
                                                title: `${row.project} / ${row.item}`,
                                                subtitle: '查看项目成本的来源单据、计价口径和计算过程。',
                                                body: <CostTraceDetail rows={[row]} />,
                                            }),
                                        },
                                        {
                                            label: '调整归集',
                                            onClick: () => openWindow({
                                                title: '调整成本归集',
                                                subtitle: `${row.project} 的成本调整需要保留来源单据和调整原因。`,
                                                primary: '提交调整',
                                                body: (
                                                    <div className="modal-form embedded-form">
                                                        <Field label="项目" value={row.project} />
                                                        <Field label="来源单据" value={row.source} />
                                                        <Field label="装备" value={row.item} />
                                                        <Field label="调整金额" value="请输入调整金额" />
                                                        <SelectLike label="调整原因" value="单据归属修正" options={['单据归属修正', '盘点差异确认', '领用退回', '成本中心变更']} />
                                                        <Field label="说明" value="调整后保留原始来源和操作记录" wide />
                                                    </div>
                                                ),
                                            }),
                                        },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}
