import React, {
    useState,
} from 'react';
import {
    CheckCircle2,
    CircleMinus,
    CirclePlus,
    Upload,
} from 'lucide-react';
import {
    PurchaseDemandLine,
    equipmentItems,
    referencePriceByItem,
    initialPurchaseDemandLines,
    numberText,
    toPurchaseDemandLine,
    warningLinesByWarehouse,
    CreatePageActions,
    PurchaseDemandFormContent,
} from '../../shared';

export type DemandPickerKind = 'equipment';

export const pickerTitles: Record<DemandPickerKind, { title: string; subtitle: string; leftTitle: string; search: string }> = {
    equipment: {
        title: '添加装备',
        subtitle: '从装备档案中选择需要采购的装备，确认后写入采购需求明细。',
        leftTitle: '选择装备',
        search: '请输入装备名称',
    },
};

export function PurchaseEquipmentPickerModal({
    kind,
    onClose,
    onConfirm,
}: {
    kind: DemandPickerKind;
    onClose: () => void;
    onConfirm: (lines: PurchaseDemandLine[]) => void;
}) {
    const meta = pickerTitles[kind];
    const selectedLines = initialPurchaseDemandLines;
    const selectedNames = new Set(selectedLines.map((line) => line.name));
    const candidateItems = [equipmentItems[1], equipmentItems[2], equipmentItems[3], equipmentItems[4], equipmentItems[6]];

    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel equipment-picker-modal" role="dialog" aria-modal="true" aria-label={meta.title}>
                <div className="modal-header">
                    <div>
                        <h2>{meta.title}</h2>
                        <p>{meta.subtitle}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="equipment-picker-body">
                    <section className="equipment-picker-column">
                        <div className="picker-column-title">
                            <h3>{meta.leftTitle}</h3>
                        </div>
                        <input className="picker-search" value={meta.search} readOnly />
                        <select className="picker-search" value="请选择装备分类" onChange={() => undefined}>
                            <option>请选择装备分类</option>
                            <option>执勤装备</option>
                            <option>被动防护装备</option>
                            <option>保安员服装</option>
                        </select>
                        <select className="picker-search" value="供应商" onChange={() => undefined}>
                            <option>供应商</option>
                            <option>京东慧采-易安通设备</option>
                            <option>安豹</option>
                            <option>三棵树</option>
                        </select>
                        <div className="equipment-card-list">
                            {candidateItems.map((item) => {
                                const selected = selectedNames.has(item.name);
                                return (
                                    <div className={selected ? 'equipment-option-card selected' : 'equipment-option-card'} key={item.itemCode}>
                                        <button type="button" className="equipment-card-icon" aria-label={selected ? '已添加' : '添加'}>
                                            {selected ? <CheckCircle2 size={18} /> : <CirclePlus size={18} />}
                                        </button>
                                        <strong>{item.name}</strong>
                                        <dl>
                                            <div><dt>分类：</dt><dd>{item.category}</dd></div>
                                            <div><dt>单位：</dt><dd>{item.unit}</dd></div>
                                            <div><dt>参考价格：</dt><dd>{numberText(referencePriceByItem[item.name] || 0)}</dd></div>
                                            <div><dt>库存数量：</dt><dd>{numberText(item.stock)}</dd></div>
                                            <div><dt>供应商：</dt><dd>{item.supplier.replace('京东慧采-', '')}</dd></div>
                                            <div><dt>备注：</dt><dd>--</dd></div>
                                        </dl>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    <section className="equipment-picker-column">
                        <div className="picker-column-title">
                            <h3>已添加装备</h3>
                            <span>总计：{selectedLines.length}</span>
                        </div>
                        <div className="selected-equipment-list">
                            {selectedLines.map((line) => (
                                <div className="selected-equipment-card" key={line.name}>
                                    <button type="button" className="equipment-remove-icon" aria-label="移除">
                                        <CircleMinus size={18} />
                                    </button>
                                    <strong>{line.name}</strong>
                                    <dl>
                                        <div><dt>分类：</dt><dd>{line.category}</dd></div>
                                        <div><dt>单位：</dt><dd>{line.unit}</dd></div>
                                        <div><dt>参考价格：</dt><dd>{numberText(line.referencePrice)}</dd></div>
                                        <div><dt>库存数量：</dt><dd>{numberText(line.stock)}</dd></div>
                                        <div><dt>供应商：</dt><dd>{line.supplier.replace('京东慧采-', '')}</dd></div>
                                        <div><dt>备注：</dt><dd>--</dd></div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>取消</button>
                    <button type="button" className="primary-btn" onClick={() => onConfirm(selectedLines)}>确定</button>
                </div>
            </div>
        </div>
    );
}

export function GoodsListImportModal({
    onClose,
    onConfirm,
}: {
    onClose: () => void;
    onConfirm: (lines: PurchaseDemandLine[]) => void;
}) {
    const importedLines = [
        toPurchaseDemandLine(equipmentItems[0]),
        toPurchaseDemandLine(equipmentItems[1]),
    ];

    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel goods-import-modal" role="dialog" aria-modal="true" aria-label="导入商品清单">
                <div className="modal-header">
                    <div>
                        <h2>导入商品清单</h2>
                        <p>下载模板整理商品信息，也可直接上传京东慧采导出的商品清单。</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="goods-import-body">
                    <section className="goods-import-card">
                        <div className="picker-column-title">
                            <h3>下载模板</h3>
                        </div>
                        <p>用于线下整理装备名称、分类、规格、单位、参考价格和需求数量。</p>
                        <button type="button" className="secondary-btn">下载商品清单模板</button>
                    </section>
                    <section className="goods-import-card">
                        <div className="picker-column-title">
                            <h3>上传商品清单</h3>
                        </div>
                        <div className="goods-upload-box">
                            <Upload size={24} />
                            <strong>选择 Excel 文件上传</strong>
                            <span>支持系统商品清单模板，也支持京东商品清单</span>
                        </div>
                        <div className="goods-import-note">
                            上传后系统按装备名称、规格和供应商匹配装备档案；未匹配商品进入待确认状态。
                        </div>
                    </section>
                </div>
                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>取消</button>
                    <button type="button" className="primary-btn" onClick={() => onConfirm(importedLines)}>确认导入</button>
                </div>
            </div>
        </div>
    );
}

export function PurchaseDemandCreatePage({
    onCancel,
    initialWarehouse = '历下分公司仓',
    initialLines,
}: {
    onCancel: () => void;
    initialWarehouse?: string;
    initialLines?: PurchaseDemandLine[];
}) {
    const [picker, setPicker] = useState<DemandPickerKind | null>(null);
    const [showGoodsImport, setShowGoodsImport] = useState(false);
    const [detailLines, setDetailLines] = useState<PurchaseDemandLine[]>(() => initialLines || []);
    const currentWarehouse = initialWarehouse;

    function applyPickedLines(lines: PurchaseDemandLine[]) {
        setDetailLines(lines);
        setPicker(null);
        setShowGoodsImport(false);
    }

    function pullWarningLines() {
        setDetailLines(warningLinesByWarehouse(currentWarehouse));
    }

    return (
        <div className="create-page">
            <PurchaseDemandFormContent
                mode="create"
                detailLines={detailLines}
                currentWarehouse={currentWarehouse}
                onAddEquipment={() => setPicker('equipment')}
                onPullWarning={pullWarningLines}
                onImportGoods={() => setShowGoodsImport(true)}
                onDeleteLine={(name) => setDetailLines((items) => items.filter((item) => item.name !== name))}
            />

            <CreatePageActions onCancel={onCancel} primary="提交需求" />
            {picker && (
                <PurchaseEquipmentPickerModal
                    kind={picker}
                    onClose={() => setPicker(null)}
                    onConfirm={applyPickedLines}
                />
            )}
            {showGoodsImport && (
                <GoodsListImportModal
                    onClose={() => setShowGoodsImport(false)}
                    onConfirm={applyPickedLines}
                />
            )}
        </div>
    );
}
