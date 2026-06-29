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
    PurchaseDemandLine,
    TraceContext,
    OpenBusinessWindow,
    traceRelationWindow,
    orderDetailWindow,
    inboundDetailWindow,
    PurchaseDemandViewPage,
} from '../shared';
import { Dashboard } from './Dashboard';
import { ArchivePage } from './ArchivePage';
import { WarehousePage } from './WarehousePage';
import { InventoryPage } from './InventoryPage';
import { PurchaseDemandCreatePage, PurchasePage, PurchasePlanCreatePage, PurchasePlanViewPage, PurchaseOrderGeneratePage } from './PurchasePage';
import {
    GeneratedOrderPayload,
} from './purchase/PurchaseOrderGeneratePage';
import { InboundPage } from './InboundPage';
import { TransferPage } from './TransferPage';
import { StocktakePage } from './StocktakePage';
import { IssuePage } from './IssuePage';
import { CostPage } from './CostPage';

export function PageContent({
    page,
    openPage,
    openWindow,
    openDemandView,
    openPlanView,
    openGenerateOrder,
    openLowStockDemand,
    purchaseDemandDraft,
    selectedDemand,
    selectedPlan,
    orderRows,
    inboundRows,
    onCreateGeneratedOrders,
    onGenerateInbound,
    onAddPayment,
    onAddInvoice,
    purchaseTab,
    setPurchaseTab,
}: {
    page: PageId;
    openPage: (page: PageId) => void;
    openWindow: OpenBusinessWindow;
    openDemandView: (row: DemandRow) => void;
    openPlanView: (row: PlanRow) => void;
    openGenerateOrder: (row: PlanRow) => void;
    openLowStockDemand: (warehouse: string, lines: PurchaseDemandLine[]) => void;
    purchaseDemandDraft: { warehouse: string; lines: PurchaseDemandLine[] } | null;
    selectedDemand: DemandRow;
    selectedPlan: PlanRow;
    orderRows: OrderRow[];
    inboundRows: FlowRow[];
    onCreateGeneratedOrders: (payload: GeneratedOrderPayload) => void;
    onGenerateInbound: (row: OrderRow) => void;
    onAddPayment: (orderCode: string, record: PaymentRecord) => void;
    onAddInvoice: (orderCode: string, record: InvoiceRecord) => void;
    purchaseTab: PurchaseTab;
    setPurchaseTab: (tab: PurchaseTab) => void;
}) {
    function returnToPurchase(tab: PurchaseTab) {
        setPurchaseTab(tab);
        openPage('purchase');
    }

    function openTraceRelation(context: TraceContext) {
        openWindow(traceRelationWindow(context, {
            openDemandView,
            openPlanView,
            openOrderDetail: (order) => openWindow(orderDetailWindow(order, { openDemandView, openPlanView, openTraceRelation })),
            openInboundDetail: (inbound) => openWindow(inboundDetailWindow(inbound, { openDemandView, openPlanView, openTraceRelation })),
            openTraceRelation,
        }));
    }

    switch (page) {
        case 'dashboard':
            return <Dashboard openPage={openPage} />;
        case 'archive':
            return <ArchivePage openWindow={openWindow} />;
        case 'warehouses':
            return <WarehousePage openWindow={openWindow} />;
        case 'inventory':
            return <InventoryPage openWindow={openWindow} openLowStockDemand={openLowStockDemand} />;
        case 'purchase':
            return (
                <PurchasePage
                    openPage={openPage}
                    openWindow={openWindow}
                    openDemandView={openDemandView}
                    openPlanView={openPlanView}
                    openGenerateOrder={openGenerateOrder}
                    orderRows={orderRows}
                    inboundRows={inboundRows}
                    onGenerateInbound={onGenerateInbound}
                    onAddPayment={onAddPayment}
                    onAddInvoice={onAddInvoice}
                    tab={purchaseTab}
                    setTab={setPurchaseTab}
                />
            );
        case 'purchase-demand-create':
            return (
                <PurchaseDemandCreatePage
                    onCancel={() => returnToPurchase('demand')}
                    initialWarehouse={purchaseDemandDraft?.warehouse}
                    initialLines={purchaseDemandDraft?.lines}
                />
            );
        case 'purchase-demand-view':
            return <PurchaseDemandViewPage row={selectedDemand} onClose={() => returnToPurchase('demand')} onOpenTrace={openTraceRelation} />;
        case 'purchase-plan-create':
            return <PurchasePlanCreatePage onCancel={() => returnToPurchase('plans')} openDemandView={openDemandView} onOpenTrace={openTraceRelation} />;
        case 'purchase-plan-view':
            return (
                <PurchasePlanViewPage
                    row={selectedPlan}
                    onClose={() => returnToPurchase('plans')}
                    openDemandView={openDemandView}
                    openOrderDetail={(order) => openWindow(orderDetailWindow(order, { openPlanView, openDemandView, openTraceRelation }))}
                    orderRows={orderRows}
                    openGenerateOrder={openGenerateOrder}
                    onOpenTrace={openTraceRelation}
                />
            );
        case 'purchase-order-generate':
            return (
                <PurchaseOrderGeneratePage
                    row={selectedPlan}
                    onCancel={() => returnToPurchase('plans')}
                    onCreate={onCreateGeneratedOrders}
                    onOpenTrace={openTraceRelation}
                />
            );
        case 'inbound':
            return (
                <InboundPage
                    openInventory={() => openPage('inventory')}
                    openWindow={openWindow}
                    openPlanView={openPlanView}
                    openDemandView={openDemandView}
                    inboundRows={inboundRows}
                    onOpenTrace={openTraceRelation}
                />
            );
        case 'transfer':
            return <TransferPage openCosts={() => openPage('costs')} openWindow={openWindow} />;
        case 'stocktake':
            return <StocktakePage openCosts={() => openPage('costs')} openWindow={openWindow} />;
        case 'issue':
            return <IssuePage openCosts={() => openPage('costs')} openWindow={openWindow} />;
        case 'costs':
            return <CostPage openWindow={openWindow} />;
        default:
            return <Dashboard openPage={openPage} />;
    }
}
