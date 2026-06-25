import React, { useState } from 'react';
import {
    NumberedAsset,
    PurchaseDemandLine,
    InventoryRow,
    equipmentItems,
    numberedAssets,
    warehouses,
    inventory,
    currency,
    numberText,
    warningLinesByWarehouse,
    inventoryShortage,
    inventoryWarningStatus,
    StatusTag,
    InventoryTrendSparkline,
    FilterBar,
    Field,
    SelectLike,
    WarehouseScope,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
    NumberedAssetDetail,
    InventoryMovementDetail,
} from '../shared';

export function InventoryPage({
    openWindow,
    openLowStockDemand,
}: {
    openWindow: OpenBusinessWindow;
    openLowStockDemand: (warehouse: string, lines: PurchaseDemandLine[]) => void;
}) {
    const [tab, setTab] = useState<'stock' | 'codes'>('stock');
    const warehouseOptions = warehouses.map((warehouse) => warehouse.name);
    const [selectedWarehouse, setSelectedWarehouse] = useState('历下分公司仓');
    const visibleInventory = inventory.filter((row) => row.warehouse === selectedWarehouse);
    const lowStockLines = warningLinesByWarehouse(selectedWarehouse);

    return (
        <>
            <div className="sub-tabs">
                <button type="button" className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>
                    库存台账
                </button>
                <button type="button" className={tab === 'codes' ? 'active' : ''} onClick={() => setTab('codes')}>
                    一物一码装备
                </button>
            </div>
            {tab === 'stock' && (
                <>
            <WarehouseScope value={selectedWarehouse} options={warehouseOptions} onChange={setSelectedWarehouse} />
            <FilterBar>
                <SelectLike label="装备分类" value="全部分类" />
                <Field label="装备名称" value="请输入装备名称" />
                <SelectLike label="库存预警" value="全部" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="库存台账" subtitle="按所选仓库查看装备库存、预警线、库存单价和近期消耗趋势" />
                <div className="table-toolbar">
                    <button
                        type="button"
                        className="primary-btn"
                        disabled={!lowStockLines.length}
                        title={lowStockLines.length ? '按当前仓库低库存装备生成采购需求' : '当前仓库暂无低库存装备'}
                        onClick={() => openLowStockDemand(selectedWarehouse, lowStockLines)}
                    >
                        生成低库存采购需求
                    </button>
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增库存调整',
                        subtitle: '用于库存盘点确认、历史修正或异常处理后的库存调整。',
                        primary: '提交调整',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="调整仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓', 'CBD园区项目点']} />
                                <SelectLike label="调整类型" value="盘盈入库" options={['盘盈入库', '盘亏出库', '历史修正', '异常冻结']} />
                                <Field label="装备明细" value="选择装备和调整数量" wide />
                                <Field label="调整原因" value="请输入调整原因" wide />
                            </div>
                        ),
                    })}>新增库存调整</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出库存台账',
                        subtitle: '导出库存数量、预警库存、库存单价和库存金额。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前仓库和筛选条件'], ['包含字段', '装备、分类、库存数量、预警库存、库存单价、库存金额、消耗趋势、预警、计价方式'], ['用途', '库存核对、项目补货和成本分析']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['装备', '分类', '库存数量', '预警库存', '库存单价', '库存金额', '消耗趋势', '预警', '计价方式', '操作']}
                    rows={visibleInventory}
                    renderRow={(row: InventoryRow) => {
                        const unit = equipmentItems.find((equipment) => equipment.name === row.item)?.unit || '件';
                        const shortage = inventoryShortage(row);
                        return (
                            <tr key={`${row.warehouse}-${row.item}`}>
                                <td className="link-cell">{row.item}</td>
                                <td>{row.category}</td>
                                <td>{numberText(row.bookQty)}</td>
                                <td>{numberText(row.warningQty)}</td>
                                <td>{currency(row.unitCost)}</td>
                                <td>{currency(row.amount)}</td>
                                <td><InventoryTrendSparkline points={row.trend} /></td>
                                <td><StatusTag value={inventoryWarningStatus(row)} /></td>
                                <td>{row.method}</td>
                                <td>
                                    <RowActions
                                        allowDelete={false}
                                        actions={[
                                            {
                                                label: '库存明细',
                                                onClick: () => openWindow({
                                                    title: `${row.item}库存明细`,
                                                    subtitle: '查看当前库存数量、成本和预警状态。',
                                                    body: <InventoryMovementDetail row={row} />,
                                                }),
                                            },
                                            {
                                                label: '预警设置',
                                                onClick: () => openWindow({
                                                    title: `${row.item}预警库存设置`,
                                                    subtitle: '设置当前仓库的安全库存线，低于预警库存后可生成采购需求。',
                                                    primary: '保存设置',
                                                    body: (
                                                        <DetailGrid rows={[
                                                            ['仓库', row.warehouse],
                                                            ['装备', row.item],
                                                            ['当前库存', `${numberText(row.bookQty)}${unit}`],
                                                            ['当前预警值', `${numberText(row.warningQty)}${unit}`],
                                                            ['库存单价', currency(row.unitCost)],
                                                            ['建议补货量', shortage > 0 ? `${numberText(shortage)}${unit}` : '无需补货'],
                                                        ]} />
                                                    ),
                                                }),
                                            },
                                            {
                                                label: '出入库明细',
                                                onClick: () => openWindow({
                                                    title: `${row.item}出入库明细`,
                                                    subtitle: '汇总展示与该装备相关的入库、出库、调拨和盘点记录。',
                                                    body: <InventoryMovementDetail row={row} />,
                                                }),
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
            )}
            {tab === 'codes' && (
                <>
                    <FilterBar>
                        <Field label="装备编号" value="请输入装备编号" />
                        <Field label="装备名称" value="请输入装备名称" />
                        <SelectLike label="当前位置" value="全部位置" />
                        <SelectLike label="状态" value="全部状态" />
                    </FilterBar>
                    <section className="panel">
                        <SectionTitle title="一物一码装备" subtitle="查看具体装备编号、当前位置、责任人和状态；台账通常由入库扫码或录码形成" />
                        <div className="table-toolbar">
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '导出一物一码装备',
                                subtitle: '导出当前筛选范围下的装备编号、位置、责任人和成本。',
                                primary: '确认导出',
                                body: <DetailGrid rows={[['导出范围', '全部位置 / 全部状态'], ['包含字段', '装备编号、名称、当前位置、责任人、状态、单件成本'], ['用途', '线下盘点、监管备案或交接确认']]} />,
                            })}>导出</button>
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '历史装备补录',
                                subtitle: '用于把已经在库或项目在用的重点装备补录成一物一码台账。',
                                primary: '保存补录',
                                body: (
                                    <div className="modal-form embedded-form">
                                        <Field label="装备编号" value="如：EQ-DJ-202606-0032" />
                                        <SelectLike label="装备名称" value="数字对讲机" options={['数字对讲机', '防刺服', '保安防卫棍', '手持金属探测器']} />
                                        <SelectLike label="当前位置" value="集团总仓" options={['集团总仓', '历下分公司仓', 'CBD园区项目点', '会展中心项目点']} />
                                        <Field label="责任人" value="请输入责任人" />
                                        <Field label="采购原值" value="386" />
                                        <SelectLike label="折旧规则" value="直线法 / 36个月 / 残值率5%" options={['直线法 / 36个月 / 残值率5%', '直线法 / 60个月 / 残值率5%', '不折旧 / 批次管理']} />
                                        <SelectLike label="折旧开始时点" value="项目/人员确认领用" options={['项目/人员确认领用', '入库即开始', '手工指定']} />
                                        <SelectLike label="状态" value="在库" options={['在库', '项目在用', '已领用']} />
                                    </div>
                                ),
                            })}>历史装备补录</button>
                        </div>
                        <DataTable
                            columns={['装备编号', '装备名称', '当前位置', '责任人', '状态', '采购原值', '累计折旧', '当前净值', '操作']}
                            rows={numberedAssets}
                            renderRow={(row: NumberedAsset) => (
                                <tr key={row.code}>
                                    <td className="link-cell">{row.code}</td>
                                    <td>{row.name}</td>
                                    <td>{row.location}</td>
                                    <td>{row.owner}</td>
                                    <td><StatusTag value={row.status} /></td>
                                    <td>{currency(row.originalCost)}</td>
                                    <td>{currency(row.accumulatedDepreciation)}</td>
                                    <td>{currency(row.netValue)}</td>
                                    <td>
                                        <RowActions
                                            allowDelete={row.status === '在库'}
                                            actions={[
                                                {
                                                    label: '查看',
                                                    onClick: () => openWindow({
                                                        title: row.code,
                                                        subtitle: '一物一码装备的当前位置、责任人、折旧规则和当前净值。',
                                                        body: <NumberedAssetDetail row={row} />,
                                                    }),
                                                },
                                                { label: '折旧记录', onClick: () => openWindow({ title: `${row.code}折旧记录`, subtitle: '展示单件装备在不同项目的领用、归还、使用期间和折旧费用。', body: <NumberedAssetDetail row={row} /> }) },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            )}
                        />
                    </section>
                </>
            )}
        </>
    );
}
