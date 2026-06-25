import React from 'react';
import {
    DemandRow,
    PlanRow,
    OrderRow,
    TraceContext,
    planItemsToPlanLines,
    relatedDemandsForPlan,
    ViewPageActions,
    planApprovalStamp,
    ApprovalStamp,
} from '../../shared';
import { PurchasePlanFormContent } from './PurchasePlanFormContent';

export function PurchasePlanViewPage({
    row,
    onClose,
    openDemandView,
    openOrderDetail,
    onOpenTrace,
}: {
    row: PlanRow;
    onClose: () => void;
    openDemandView: (row: DemandRow) => void;
    openOrderDetail: (row: OrderRow) => void;
    onOpenTrace: (context: TraceContext) => void;
}) {
    const stamp = planApprovalStamp(row);

    return (
        <div className="create-page">
            <div className="plan-detail-view">
                <ApprovalStamp result={stamp.result} tone={stamp.tone} />
                <PurchasePlanFormContent
                    mode="view"
                    row={row}
                    detailLines={planItemsToPlanLines(row)}
                    relatedDemands={relatedDemandsForPlan(row)}
                    openDemandView={openDemandView}
                    openOrderDetail={openOrderDetail}
                    onOpenTrace={onOpenTrace}
                />
            </div>
            <ViewPageActions onClose={onClose} />
        </div>
    );
}
