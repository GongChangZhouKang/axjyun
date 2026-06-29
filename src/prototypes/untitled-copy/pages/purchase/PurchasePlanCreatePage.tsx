import React, {
    useState,
} from 'react';
import {
    PurchasePlanLine,
    DemandRow,
    TraceContext,
    equipmentItems,
    referencePriceByItem,
    toPurchasePlanLine,
    demandRowsToPlanLines,
    CreatePageActions,
} from '../../shared';
import { PurchaseDemandSelectModal } from './PurchaseDemandSelectModal';
import { PurchasePlanFormContent } from './PurchasePlanFormContent';

export function PurchasePlanCreatePage({
    onCancel,
    openDemandView,
    onOpenTrace,
}: {
    onCancel: () => void;
    openDemandView: (row: DemandRow) => void;
    onOpenTrace: (context: TraceContext) => void;
}) {
    const [detailLines, setDetailLines] = useState<PurchasePlanLine[]>([]);
    const [relatedDemands, setRelatedDemands] = useState<DemandRow[]>([]);
    const [showDemandSelect, setShowDemandSelect] = useState(false);

    function addEquipmentLines() {
        const lines = [equipmentItems[1], equipmentItems[2]].map((item) => toPurchasePlanLine({
            name: item.name,
            qty: 10,
            unit: item.unit,
            amount: (referencePriceByItem[item.name] || 0) * 10,
        }, {
            mode: '手工新增',
            category: item.category,
        }));
        setDetailLines(lines);
    }

    function applySelectedDemands(rows: DemandRow[]) {
        setRelatedDemands(rows);
        setDetailLines(demandRowsToPlanLines(rows));
        setShowDemandSelect(false);
    }

    return (
        <div className="create-page">
            <PurchasePlanFormContent
                mode="create"
                detailLines={detailLines}
                relatedDemands={relatedDemands}
                onAddEquipment={addEquipmentLines}
                onPullDemands={() => setShowDemandSelect(true)}
                onDeleteLine={(name) => setDetailLines((items: PurchasePlanLine[]) => items.filter((item: PurchasePlanLine) => item.name !== name))}
                openDemandView={openDemandView}
                onOpenTrace={onOpenTrace}
            />
            <CreatePageActions onCancel={onCancel} primary="提交审核" />
            {showDemandSelect && (
                <PurchaseDemandSelectModal
                    onClose={() => setShowDemandSelect(false)}
                    onConfirm={applySelectedDemands}
                    openDemandView={openDemandView}
                    onOpenTrace={onOpenTrace}
                />
            )}
        </div>
    );
}
