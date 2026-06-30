import React from 'react';
import {
    PageId,
    PurchaseTab,
    DemandRow,
    PlanRow,
    OrderRow,
    PaymentRecord,
    InvoiceRecord,
    FlowRow,
    TraceContext,
    OpenBusinessWindow,
    traceRelationWindow,
    orderDetailWindow,
    inboundDetailWindow,
} from '../shared';
import { DemandPage } from './purchase/DemandPage';
import { PlanPage } from './purchase/PlanPage';
import { OrderPage } from './purchase/OrderPage';

export function PurchasePage({
    openPage,
    openWindow,
    openDemandView,
    openPlanView,
    openGenerateOrder,
    openGenerateInbound,
    tab,
    setTab,
    orderRows,
    inboundRows,
    onAddPayment,
    onAddInvoice,
    onDeleteOrder,
}: {
    openPage: (page: PageId) => void;
    openWindow: OpenBusinessWindow;
    openDemandView: (row: DemandRow) => void;
    openPlanView: (row: PlanRow) => void;
    openGenerateOrder: (row: PlanRow) => void;
    openGenerateInbound: (row: OrderRow) => void;
    tab: PurchaseTab;
    setTab: (tab: PurchaseTab) => void;
    orderRows: OrderRow[];
    inboundRows: FlowRow[];
    onAddPayment: (orderCode: string, record: PaymentRecord) => void;
    onAddInvoice: (orderCode: string, record: InvoiceRecord) => void;
    onDeleteOrder: (row: OrderRow) => void;
}) {
    function openTraceRelation(context: TraceContext) {
        openWindow(traceRelationWindow(context, {
            openDemandView,
            openPlanView,
            openOrderDetail: (order) => openWindow(orderDetailWindow(order, { openPlanView, openDemandView, openTraceRelation })),
            openInboundDetail: (inbound) => openWindow(inboundDetailWindow(inbound, { openPlanView, openDemandView, openTraceRelation })),
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
                    采购订单
                </button>
            </div>
            {tab === 'demand' && (
                <DemandPage
                    openCreateDemand={() => openPage('purchase-demand-create')}
                    openDemandView={openDemandView}
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
                    openGenerateOrder={openGenerateOrder}
                    orderRows={orderRows}
                    onOpenTrace={openTraceRelation}
                    openWindow={openWindow}
                />
            )}
            {tab === 'orders' && (
                <OrderPage
                    openWindow={openWindow}
                    openPlanView={openPlanView}
                    openDemandView={openDemandView}
                    orderRows={orderRows}
                    onGenerateInbound={openGenerateInbound}
                    onAddPayment={onAddPayment}
                    onAddInvoice={onAddInvoice}
                    onDeleteOrder={onDeleteOrder}
                    onOpenTrace={openTraceRelation}
                />
            )}
        </>
    );
}

export { PurchaseDemandCreatePage } from './purchase/PurchaseDemandCreatePage';
export { PurchasePlanCreatePage } from './purchase/PurchasePlanCreatePage';
export { PurchasePlanViewPage } from './purchase/PurchasePlanViewPage';
export { PurchaseOrderGeneratePage } from './purchase/PurchaseOrderGeneratePage';
export { PurchaseInboundGeneratePage } from './purchase/PurchaseInboundGeneratePage';
