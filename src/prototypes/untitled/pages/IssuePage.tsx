import React from 'react';
import {
    FlowRow,
    issues,
    costTraceRows,
    currency,
    numberText,
    lineQty,
    lineAmount,
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
    MiniLineTable,
    CostTraceDetail,
    tracesForSource,
} from '../shared';

export function IssuePage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <SelectLike label="来源仓库" value="全部仓库" />
                <Field label="领用单号" value="请输入领用单号" />
                <SelectLike label="领用对象" value="全部对象" />
                <SelectLike label="状态" value="全部状态" />
                <SelectLike label="成本确认" value="领用价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="出库管理"
                    subtitle="支持项目申领和个人申领，出库后按领用对象归集成本"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增出库单',
                        subtitle: '选择来源仓库、领用对象和装备明细，确认后扣减库存并归集成本。',
                        primary: '提交出库',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="来源仓库" value="历下分公司仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <SelectLike label="领用对象" value="项目申领：CBD园区项目" options={['项目申领：CBD园区项目', '个人申领：周明', '项目申领：软件园项目']} />
                                <Field label="经办人" value="王队长" />
                                <SelectLike label="成本确认" value="按装备规则自动计算" options={['按装备规则自动计算', '移动加权平均', '批次管理', '单件折旧']} />
                                <Field label="装备明细" value="选择库存装备和数量" wide />
                            </div>
                        ),
                    })}>新增出库单</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出出库记录',
                        subtitle: '导出领用对象、出库成本和当前状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '领用单号、来源仓库、领用对象、明细、领用成本、经办人、状态'], ['用途', '项目成本归集和领用交接']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['领用单号', '来源仓库', '领用对象', '明细数', '装备摘要', '数量合计', '领用成本', '经办人', '状态', '操作']}
                    rows={issues}
                    renderRow={(row: FlowRow) => (
                        <tr key={row.code}>
                            <td className="link-cell">{row.code}</td>
                            <td>{row.from}</td>
                            <td>{row.to}</td>
                            <td>{row.items.length} 项</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td>{row.handler}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待出库'}
                                    actions={[
                                        {
                                            label: row.status === '待出库' ? '确认出库' : '查看领用',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: `${row.from} 出库给 ${row.to}，出库后进入项目成本。`,
                                                primary: row.status === '待出库' ? '确认出库' : undefined,
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['来源仓库', row.from],
                                                            ['领用对象', row.to],
                                                            ['经办人', row.handler],
                                                            ['数量合计', numberText(lineQty(row.items))],
                                                            ['领用成本', currency(lineAmount(row.items))],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="领用成本" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        {
                                            label: '查看成本',
                                            onClick: () => openWindow({
                                                title: `${row.code}成本确认明细`,
                                                subtitle: '按装备档案规则展示移动加权、批次管理和单件折旧的项目归集依据。',
                                                body: <CostTraceDetail rows={tracesForSource(row.code).length ? tracesForSource(row.code) : costTraceRows.slice(0, 3)} />,
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
