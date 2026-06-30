import React from 'react';
import {
    BarChart3,
    Boxes,
    ClipboardCheck,
    ShoppingCart,
} from 'lucide-react';
import {
    PageId,
    PlanRow,
    plans,
    inventory,
    stocktakes,
    costs,
    currency,
    lineAmount,
    planOrderAmount,
    planVariance,
    stockDiff,
    itemSummary,
    StatusTag,
    StatCard,
    SelectLike,
    DataTable,
    SectionTitle,
    DetailGrid,
    OpenBusinessWindow,
} from '../shared';

export function Dashboard({
    openPage,
    openWindow,
}: {
    openPage: (page: PageId) => void;
    openWindow: OpenBusinessWindow;
}) {
    const totalInventory = inventory.reduce((sum, row) => sum + row.amount, 0);
    const totalCost = costs.reduce((sum, row) => sum + row.monthCost, 0);
    const pendingPlan = plans.filter((row) => row.status !== '入库中').length;
    const diffCount = stocktakes.filter((row) => stockDiff(row.items) !== 0).length;

    return (
        <>
            <div className="overview-filter">
                <SelectLike label="组织范围" value="山东振邦保安服务有限公司" />
                <SelectLike label="仓库范围" value="全部仓库" />
                <SelectLike label="月份" value="2026-06" />
            </div>

            <div className="stats-grid">
                <StatCard title="本月采购计划" value={`${plans.length} 单`} note={`${pendingPlan} 单待继续处理`} icon={ShoppingCart} tone="blue" />
                <StatCard title="库存资产金额" value={currency(totalInventory)} note="覆盖集团仓、分公司仓、项目点" icon={Boxes} tone="green" />
                <StatCard title="项目成本归集" value={currency(totalCost)} note="按领用和项目点消耗确认" icon={BarChart3} tone="purple" />
                <StatCard title="盘点差异" value={`${diffCount} 项`} note="盘盈盘亏待审核处理" icon={ClipboardCheck} tone="orange" />
            </div>

            <div className="workflow">
                {[
                    ['采购管理', '需求/计划/订单生成', 'purchase'],
                    ['入库管理', '形成库存成本', 'inbound'],
                    ['库存管理', '库存状态与预警', 'inventory'],
                    ['调拨/出库', '成本随流转归集', 'issue'],
                    ['库存盘点', '盘盈盘亏处理', 'stocktake'],
                    ['项目成本', '按项目汇总分析', 'costs'],
                ].map(([title, body, page], index) => (
                    <button type="button" className="workflow-step" key={title} onClick={() => openPage(page as PageId)}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{title}</strong>
                        <em>{body}</em>
                    </button>
                ))}
            </div>

            <div className="content-grid">
                <section className="panel">
                    <SectionTitle title="待处理采购计划" subtitle="集团采购关注预算价格、订单价格和计划差异" />
                    <div className="table-toolbar">
                        <button type="button" className="secondary-btn" onClick={() => openWindow({
                            title: '导出待处理采购计划',
                            subtitle: '导出首页当前待处理采购计划及预算/订单差异。',
                            primary: '确认导出',
                            body: <DetailGrid rows={[['导出范围', '当前组织、仓库和月份筛选条件'], ['包含字段', '计划单号、采购模式、需求来源、明细数、装备摘要、预算金额、订单金额、差异、状态'], ['用途', '待办跟进、采购复核和管理汇报']]} />,
                        })}>导出</button>
                    </div>
                    <DataTable
                        columns={['计划单号', '模式', '来源', '明细数', '装备摘要', '预算金额', '订单金额', '差异', '状态']}
                        rows={plans}
                        renderRow={(row: PlanRow) => (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.mode}</td>
                                <td>{row.source}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td>{currency(planOrderAmount(row.items))}</td>
                                <td>{planVariance(row.items)}</td>
                                <td><StatusTag value={row.status} /></td>
                            </tr>
                        )}
                    />
                </section>
                <section className="panel side-panel">
                    <SectionTitle title="成本口径" subtitle="价格按业务节点固化" />
                    <ul className="rule-list">
                        <li><b>预算价格</b><span>申请或计划阶段用于预算占用和审批参考</span></li>
                        <li><b>订单价格</b><span>采购订单生成后锁定的实际采购价格</span></li>
                        <li><b>入库价格</b><span>收货入库后形成库存成本的价格</span></li>
                        <li><b>领用价格</b><span>装备领用或消耗时计入项目成本的价格</span></li>
                    </ul>
                </section>
            </div>
        </>
    );
}
