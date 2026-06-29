import React from 'react';
import {
    DemandRow,
    PlanRow,
    FlowRow,
    TraceContext,
    equipmentItems,
    inboundRows as defaultInboundRows,
    currency,
    numberText,
    lineQty,
    lineAmount,
    inboundTraceForRow,
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
    inboundDetailWindow,
} from '../shared';

export function InboundPage({
    openInventory,
    openWindow,
    openPlanView,
    openDemandView,
    inboundRows = defaultInboundRows,
    onOpenTrace,
}: {
    openInventory: () => void;
    openWindow: OpenBusinessWindow;
    openPlanView?: (row: PlanRow) => void;
    openDemandView?: (row: DemandRow) => void;
    inboundRows?: FlowRow[];
    onOpenTrace?: (context: TraceContext) => void;
}) {
    return (
        <>
            <FilterBar>
                <SelectLike label="入库仓库" value="全部仓库" />
                <Field label="入库单号" value="请输入入库单号" />
                <SelectLike label="入库状态" value="全部状态" />
                <SelectLike label="成本来源" value="采购订单价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="入库管理" subtitle="按实际订单价格形成入库成本和库存成本" />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增入库单',
                        subtitle: '手工创建入库单，通常用于历史补录、线下采购或异常补入。',
                        primary: '保存入库单',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="入库来源" value="采购订单" options={['采购订单', '线下采购', '盘盈入库', '历史补录']} />
                                <SelectLike label="入库仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <Field label="来源单号" value="请输入来源订单或说明" />
                                <Field label="经办人" value="李岩" />
                                <Field label="批次号" value="系统自动生成 / 可手工调整" />
                                <Field label="入库单价" value="按订单明细自动带入" />
                                <SelectLike label="一物一码写入" value="原值+折旧规则" options={['原值+折旧规则', '仅生成编号', '不需要录码']} />
                                <Field label="装备明细" value="选择装备、数量和入库成本" wide />
                            </div>
                        ),
                    })}>新增入库单</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出入库记录',
                        subtitle: '导出入库单、来源订单、录码进度和入库成本。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '入库单号、来源订单、仓库、录码进度、入库成本、状态'], ['用途', '入库核对和成本入账']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['入库单号', '来源订单', '来源采购计划', '来源采购需求', '入库仓库', '明细数', '装备摘要', '数量合计', '录码进度', '入库成本', '经办人', '状态', '操作']}
                    rows={inboundRows}
                    renderRow={(row: FlowRow) => {
                        const codeItems = row.items.filter((item) => equipmentItems.some((equipment) => equipment.name === item.name && equipment.oneCode));
                        const codeQty = lineQty(codeItems);
                        const codedQty = row.status === '待入库' ? Math.max(0, codeQty - 2) : row.status === '部分入库' ? Math.floor(codeQty / 2) : codeQty;
                        const codeText = codeQty ? `${codedQty}/${codeQty} 已录码` : '无需录码';
                        const trace = inboundTraceForRow(row);
                        return (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.from}</td>
                                <td>{trace?.planCode || '--'}</td>
                                <td>{trace?.demandCodes.join('、') || '--'}</td>
                                <td>{row.to}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{numberText(lineQty(row.items))}</td>
                                <td><Tag tone={codeQty && codedQty < codeQty ? 'orange' : 'green'}>{codeText}</Tag></td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td>{row.handler}</td>
                                <td><StatusTag value={row.status} /></td>
                                <td>
                                    <RowActions
                                        allowDelete={row.status === '待入库'}
                                        actions={[
                                            {
                                                label: row.status === '已入库' ? '查看入库' : codeQty ? '录码入库' : '确认入库',
                                                onClick: () => openWindow(inboundDetailWindow(row, { openPlanView, openDemandView, openTraceRelation: onOpenTrace })),
                                            },
                                            {
                                                label: '链路追踪',
                                                onClick: () => onOpenTrace?.({ type: 'inbound', code: row.code, inboundCode: row.code }),
                                            },
                                            { label: '查看库存', onClick: openInventory },
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
