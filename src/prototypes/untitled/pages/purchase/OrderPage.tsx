import React from 'react';
import {
    Upload,
} from 'lucide-react';
import {
    DemandRow,
    PlanRow,
    OrderRow,
    TraceContext,
    orders,
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
    orderDetailWindow,
    OrderImportPreview,
} from '../../shared';

export function OrderPage({
    openInbound,
    openWindow,
    openPlanView,
    openDemandView,
    onOpenTrace,
}: {
    openInbound: () => void;
    openWindow: OpenBusinessWindow;
    openPlanView: (row: PlanRow) => void;
    openDemandView: (row: DemandRow) => void;
    onOpenTrace: (context: TraceContext) => void;
}) {
    return (
        <>
            <div className="upload-strip">
                <div className="upload-icon"><Upload size={22} /></div>
                <div>
                    <strong>导入采购订单文件</strong>
                    <p>支持同一采购计划多次导入订单，并按仓库或采购需求分配生成入库单。</p>
                </div>
                <button type="button" className="primary-btn" onClick={() => openWindow({
                    title: '导入采购订单',
                    subtitle: '上传订单后关联采购计划，按分仓库订单或汇总订单自动分配生成入库单。',
                    primary: '确认导入并生成入库预览',
                    body: <OrderImportPreview />,
                })}>导入订单</button>
            </div>
            <FilterBar>
                <Field label="京东订单号" value="请输入京东订单号" />
                <SelectLike label="匹配状态" value="全部状态" />
                <SelectLike label="入库状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="订单导入记录" subtitle="订单价格作为采购成本，后续入库形成库存成本" />
                <DataTable
                    columns={['订单号', '关联计划', '批次', '供应商', '导入时间', '分配方式', '明细数', '装备摘要', '数量合计', '订单金额', '商品匹配', '分配状态', '入库状态', '操作']}
                    rows={orders}
                    renderRow={(row: OrderRow) => (
                        <tr key={row.jdOrder}>
                            <td className="link-cell">{row.jdOrder}</td>
                            <td>{row.plan}</td>
                            <td>{row.batch}</td>
                            <td>{row.supplier}</td>
                            <td>{row.importedAt}</td>
                            <td>{row.allocationMethod}</td>
                            <td>{row.items.length} 行</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td><StatusTag value={row.match === '已匹配' ? '已匹配' : '待匹配'} /></td>
                            <td><StatusTag value={row.allocationStatus} /></td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待商品匹配'}
                                    actions={[
                                        {
                                            label: row.match === '已匹配' ? '查看明细' : '商品匹配',
                                            onClick: () => openWindow(orderDetailWindow(row, { openPlanView, openDemandView, openTraceRelation: onOpenTrace })),
                                        },
                                        {
                                            label: '追溯',
                                            onClick: () => onOpenTrace({ type: 'order', code: row.jdOrder, orderCode: row.jdOrder }),
                                        },
                                        { label: row.status === '待商品匹配' ? '匹配后入库' : '创建入库', onClick: openInbound },
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
