import React from 'react';
import {
    StocktakeRow,
    stocktakes,
    currency,
    stockBook,
    stockActual,
    stockDiff,
    stockDiffAmount,
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
    MiniStocktakeTable,
} from '../shared';

export function StocktakePage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <SelectLike label="盘点仓库" value="全部仓库" />
                <Field label="盘点任务号" value="请输入任务号" />
                <SelectLike label="盘点范围" value="全部范围" />
                <SelectLike label="差异状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="库存盘点"
                    subtitle="创建盘点任务，录入实盘数量，形成盘盈盘亏和成本差异处理"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '创建盘点任务',
                        subtitle: '选择仓库和盘点范围，生成账面清单后录入实盘数量。',
                        primary: '创建任务',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="盘点仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', 'CBD园区项目点']} />
                                <SelectLike label="盘点范围" value="重点编号装备" options={['全部装备', '保安员服装', '执勤装备', '重点编号装备']} />
                                <Field label="盘点负责人" value="李岩" />
                                <Field label="计划日期" value="2026-06-20" />
                                <Field label="备注" value="系统生成账面数量，盘点后处理差异。" wide />
                            </div>
                        ),
                    })}>创建盘点任务</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出盘点记录',
                        subtitle: '导出盘点任务、账实差异和处理状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '盘点任务、仓库、范围、账面数、实盘数、差异金额、处理状态'], ['用途', '盘点复核和差异审批']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['盘点任务', '仓库', '范围', '明细数', '装备摘要', '账面数', '实盘数', '差异数', '差异金额', '处理状态', '操作']}
                    rows={stocktakes}
                    renderRow={(row: StocktakeRow) => {
                        const diff = stockDiff(row.items);
                        const diffAmount = stockDiffAmount(row.items);
                        return (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.warehouse}</td>
                                <td>{row.range}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{stockBook(row.items)}</td>
                                <td>{stockActual(row.items)}</td>
                                <td className={diff < 0 ? 'negative' : diff > 0 ? 'positive' : ''}>{diff}</td>
                                <td className={diffAmount < 0 ? 'negative' : diffAmount > 0 ? 'positive' : ''}>{currency(diffAmount)}</td>
                                <td><StatusTag value={row.status} /></td>
                                <td>
                                    <RowActions
                                        allowDelete={row.status !== '已完成'}
                                        actions={[
                                            {
                                                label: row.status === '已完成' ? '查看结果' : row.status === '差异待处理' ? '处理差异' : '审核盘盈',
                                                onClick: () => openWindow({
                                                    title: row.code,
                                                    subtitle: `${row.warehouse} ${row.range}盘点结果，差异需要确认处理。`,
                                                    primary: row.status === '已完成' ? undefined : '确认处理',
                                                    body: (
                                                        <div className="detail-stack">
                                                            <DetailGrid rows={[
                                                                ['仓库', row.warehouse],
                                                                ['盘点范围', row.range],
                                                                ['账面数量', stockBook(row.items)],
                                                                ['实盘数量', stockActual(row.items)],
                                                                ['差异金额', currency(stockDiffAmount(row.items))],
                                                                ['处理状态', <StatusTag value={row.status} />],
                                                            ]} />
                                                            <MiniStocktakeTable items={row.items} />
                                                        </div>
                                                    ),
                                                }),
                                            },
                                            { label: '查看差异成本', onClick: openCosts },
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
