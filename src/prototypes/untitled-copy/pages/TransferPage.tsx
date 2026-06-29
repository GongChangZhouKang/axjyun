import React from 'react';
import {
    FlowRow,
    transfers,
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
} from '../shared';

export function TransferPage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <Field label="调拨单号" value="请输入调拨单号" />
                <SelectLike label="调出仓" value="全部" />
                <SelectLike label="调入仓" value="全部" />
                <SelectLike label="状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="调拨管理"
                    subtitle="支持集团仓到分公司仓、分公司仓到项目点、项目间调拨和退回，成本随库存流转"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增调拨',
                        subtitle: '从集团仓、分公司仓或项目点发起装备调拨，成本随库存流转。',
                        primary: '提交调拨',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="调出仓" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <SelectLike label="调入仓" value="历下分公司仓" options={['历下分公司仓', 'CBD园区项目点', '会展中心项目点']} />
                                <Field label="调拨原因" value="项目补货" />
                                <Field label="经办人" value="李岩" />
                                <Field label="装备明细" value="选择库存装备和数量" wide />
                            </div>
                        ),
                    })}>新增调拨</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出调拨记录',
                        subtitle: '导出调拨流向、库存成本和当前状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '调拨单号、调出、调入、明细、库存成本、经办人、状态'], ['用途', '流转核对和项目成本追溯']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['调拨单号', '调出', '调入', '明细数', '装备摘要', '数量合计', '库存成本金额', '经办人', '状态', '操作']}
                    rows={transfers}
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
                                            label: row.status === '待出库' ? '确认出库' : row.status === '在途' ? '确认收货' : '查看明细',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: `${row.from} 调拨到 ${row.to}，状态为${row.status}。`,
                                                primary: row.status === '已完成' ? undefined : row.status === '待出库' ? '确认出库' : '确认收货',
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['调出', row.from],
                                                            ['调入', row.to],
                                                            ['经办人', row.handler],
                                                            ['数量合计', numberText(lineQty(row.items))],
                                                            ['库存成本金额', currency(lineAmount(row.items))],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="库存成本" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        { label: '成本去向', onClick: openCosts },
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
