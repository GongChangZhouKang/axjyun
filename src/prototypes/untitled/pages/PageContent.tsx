import React from 'react';
import {
    PageId,
    PurchaseTab,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    TraceContext,
    OpenBusinessWindow,
    traceRelationWindow,
    orderDetailWindow,
    PurchaseDemandViewPage,
} from '../shared';
import { Dashboard } from './Dashboard';
import { ArchivePage } from './ArchivePage';
import { WarehousePage } from './WarehousePage';
import { InventoryPage } from './InventoryPage';
import { PurchaseDemandCreatePage, PurchasePage, PurchasePlanCreatePage, PurchasePlanViewPage } from './PurchasePage';
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
    openLowStockDemand,
    purchaseDemandDraft,
    selectedDemand,
    selectedPlan,
    purchaseTab,
    setPurchaseTab,
}: {
    page: PageId;
    openPage: (page: PageId) => void;
    openWindow: OpenBusinessWindow;
    openDemandView: (row: DemandRow) => void;
    openPlanView: (row: PlanRow) => void;
    openLowStockDemand: (warehouse: string, lines: PurchaseDemandLine[]) => void;
    purchaseDemandDraft: { warehouse: string; lines: PurchaseDemandLine[] } | null;
    selectedDemand: DemandRow;
    selectedPlan: PlanRow;
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
            return <PurchasePage openPage={openPage} openWindow={openWindow} openDemandView={openDemandView} openPlanView={openPlanView} tab={purchaseTab} setTab={setPurchaseTab} />;
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
