import React from 'react';
import {
    DemandRow,
    PlanRow,
    OrderRow,
    TraceContext,
    planItemsToPlanLines,
    relatedDemandsForPlan,
    planApprovalStamp,
    ApprovalStamp,
} from '../../shared';
import { PurchasePlanFormContent } from './PurchasePlanFormContent';

export function PurchasePlanViewPage({
    row,
    onClose,
    openDemandView,
    openOrderDetail,
    orderRows,
    openGenerateOrder,
    onOpenTrace,
}: {
    row: PlanRow;
    onClose: () => void;
    openDemandView: (row: DemandRow) => void;
    openOrderDetail: (row: OrderRow) => void;
    orderRows: OrderRow[];
    openGenerateOrder: (row: PlanRow) => void;
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
                    orderRows={orderRows}
                    onOpenTrace={onOpenTrace}
                />
            </div>
            <div className="create-page-actions">
                <button type="button" className="secondary-btn" onClick={onClose}>关闭</button>
                {row.auditStatus === '审核通过' && (
                    <button type="button" className="primary-btn" onClick={() => openGenerateOrder(row)}>
                        生成采购订单
                    </button>
                )}
            </div>
        </div>
    );
}
