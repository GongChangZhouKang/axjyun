import React from 'react';
import {
    PageId,
    PurchaseTab,
    DemandRow,
    PlanRow,
    TraceContext,
    OpenBusinessWindow,
    traceRelationWindow,
    orderDetailWindow,
} from '../shared';
import { DemandPage } from './purchase/DemandPage';
import { PlanPage } from './purchase/PlanPage';
import { OrderPage } from './purchase/OrderPage';

export function PurchasePage({
    openPage,
    openWindow,
    openDemandView,
    openPlanView,
    tab,
    setTab,
}: {
    openPage: (page: PageId) => void;
    openWindow: OpenBusinessWindow;
    openDemandView: (row: DemandRow) => void;
    openPlanView: (row: PlanRow) => void;
    tab: PurchaseTab;
    setTab: (tab: PurchaseTab) => void;
}) {
    function openTraceRelation(context: TraceContext) {
        openWindow(traceRelationWindow(context, {
            openDemandView,
            openPlanView,
            openOrderDetail: (order) => openWindow(orderDetailWindow(order, { openPlanView, openDemandView, openTraceRelation })),
            openTraceRelation,
        }));
    }

    return (
        <>
            <div className="sub-tabs">
                <button type="button" className={tab === 'demand' ? 'active' : ''} onClick={() => setTab('demand')}>
                    采购需求
                </button>
                <button type="button" className={tab === 'plans' ? 'active' : ''} onClick={() => setTab('plans')}>
                    采购计划
                </button>
                <button type="button" className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
                    订单导入
                </button>
            </div>
            {tab === 'demand' && (
                <DemandPage
                    openCreateDemand={() => openPage('purchase-demand-create')}
                    openDemandView={openDemandView}
                    openPlanView={openPlanView}
                    onOpenTrace={openTraceRelation}
                    openPlans={() => setTab('plans')}
                    openWindow={openWindow}
                />
            )}
            {tab === 'plans' && (
                <PlanPage
                    openCreatePlan={() => openPage('purchase-plan-create')}
                    openPlanView={openPlanView}
                    openOrders={() => setTab('orders')}
                    onOpenTrace={openTraceRelation}
                    openWindow={openWindow}
                />
            )}
            {tab === 'orders' && (
                <OrderPage
                    openInbound={() => openPage('inbound')}
                    openWindow={openWindow}
                    openPlanView={openPlanView}
                    openDemandView={openDemandView}
                    onOpenTrace={openTraceRelation}
                />
            )}
        </>
    );
}

export { PurchaseDemandCreatePage } from './purchase/PurchaseDemandCreatePage';
export { PurchasePlanCreatePage } from './purchase/PurchasePlanCreatePage';
export { PurchasePlanViewPage } from './purchase/PurchasePlanViewPage';
