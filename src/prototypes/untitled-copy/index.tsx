/**
 * @name 装备管理
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    Bell,
    Search,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useHashPage } from '../../common/useHashPage';
import {
    PageId,
    PurchaseTab,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    OrderRow,
    PaymentRecord,
    InvoiceRecord,
    FlowRow,
    pageMeta,
    menu,
    equipmentRoute,
    systemMenu,
    demands,
    plans,
    orders as initialOrders,
    inboundRows as initialInboundRows,
    createInboundFromOrder,
    orderToInboundAllocations,
    orderToInboundTrace,
    upsertRuntimePurchaseData,
    BusinessWindowState,
    BusinessWindow,
} from './shared';
import { PageContent } from './pages/PageContent';
import {
    GeneratedOrderPayload,
} from './pages/purchase/PurchaseOrderGeneratePage';
import './style.css';

export default function EquipmentManagementPrototype() {
    const { page: routePage, setPage } = useHashPage(equipmentRoute);
    const page = pageMeta[routePage as PageId] ? routePage as PageId : 'dashboard';
    const [visited, setVisited] = useState<PageId[]>(['dashboard']);
    const [purchaseTab, setPurchaseTab] = useState<PurchaseTab>('demand');
    const [selectedDemand, setSelectedDemand] = useState<DemandRow>(demands[0]);
    const [selectedPlan, setSelectedPlan] = useState<PlanRow>(plans[0]);
    const [purchaseDemandDraft, setPurchaseDemandDraft] = useState<{ warehouse: string; lines: PurchaseDemandLine[] } | null>(null);
    const [orderRows, setOrderRows] = useState<OrderRow[]>(() => [...initialOrders]);
    const [inboundRows, setInboundRows] = useState<FlowRow[]>(() => [...initialInboundRows]);
    const [businessWindow, setBusinessWindow] = useState<BusinessWindowState | null>(null);

    const current = pageMeta[page];
    const activeMenuPage = page.startsWith('purchase-') ? 'purchase' : page;
    const tabs = useMemo<{ id: PageId; label: string }[]>(() => visited.map((id: PageId) => ({ id, label: pageMeta[id].label })), [visited]);

    useEffect(() => {
        setVisited((items: PageId[]) => (items.includes(page) ? items : [...items, page].slice(-7)));
    }, [page]);

    function navigatePage(id: PageId) {
        setPage(id);
    }

    function openPage(id: PageId) {
        setPurchaseDemandDraft(null);
        navigatePage(id);
    }

    function closeTab(id: PageId, event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        if (visited.length <= 1) {
            return;
        }

        const closingIndex = visited.indexOf(id);
        const nextItems = visited.filter((item) => item !== id);
        setVisited(nextItems);
        if (id === page) {
            const fallbackIndex = Math.max(0, closingIndex - 1);
            const fallbackPage = nextItems[fallbackIndex] ?? nextItems[0] ?? 'dashboard';
            setPurchaseDemandDraft(null);
            navigatePage(fallbackPage);
        }
    }

    function openLowStockDemand(warehouse: string, lines: PurchaseDemandLine[]) {
        setPurchaseDemandDraft({ warehouse, lines });
        setPurchaseTab('demand');
        navigatePage('purchase-demand-create');
    }

    function openDemandView(row: DemandRow) {
        setSelectedDemand(row);
        setPurchaseTab('demand');
        openPage('purchase-demand-view');
    }

    function openPlanView(row: PlanRow) {
        setSelectedPlan(row);
        setPurchaseTab('plans');
        openPage('purchase-plan-view');
    }

    function openGenerateOrder(row: PlanRow) {
        setSelectedPlan(row);
        setPurchaseTab('plans');
        openPage('purchase-order-generate');
    }

    function mergeOrders(current: OrderRow[], incoming: OrderRow[]) {
        const next = [...current];
        incoming.forEach((row) => {
            const index = next.findIndex((item) => item.jdOrder === row.jdOrder);
            if (index >= 0) {
                next[index] = row;
            } else {
                next.unshift(row);
            }
        });
        return next;
    }

    function mergeInbounds(current: FlowRow[], incoming: FlowRow[]) {
        const next = [...current];
        incoming.forEach((row) => {
            const index = next.findIndex((item) => item.code === row.code);
            if (index >= 0) {
                next[index] = row;
            } else {
                next.unshift(row);
            }
        });
        return next;
    }

    function createGeneratedOrders(payload: GeneratedOrderPayload) {
        upsertRuntimePurchaseData(payload.orders, payload.inbounds, payload.allocations, payload.traces);
        setOrderRows((items: OrderRow[]) => mergeOrders(items, payload.orders));
        setInboundRows((items: FlowRow[]) => mergeInbounds(items, payload.inbounds));
        setPurchaseTab('orders');
        navigatePage('purchase');
    }

    function generateInboundForOrder(row: OrderRow) {
        const inbound = createInboundFromOrder(row);
        const updatedOrder: OrderRow = {
            ...row,
            status: '待入库',
            allocationStatus: '已分配',
            inboundCode: inbound.code,
            inboundStatus: '待入库',
        };
        const allocations = orderToInboundAllocations(updatedOrder, inbound);
        const trace = orderToInboundTrace(updatedOrder, inbound);

        upsertRuntimePurchaseData([updatedOrder], [inbound], allocations, [trace]);
        setOrderRows((items: OrderRow[]) => mergeOrders(items, [updatedOrder]));
        setInboundRows((items: FlowRow[]) => mergeInbounds(items, [inbound]));
    }

    function addPaymentRecord(orderCode: string, record: PaymentRecord) {
        setOrderRows((items: OrderRow[]) => items.map((row) => {
            if (row.jdOrder !== orderCode) {
                return row;
            }
            const updatedOrder = {
                ...row,
                paymentRecords: [...(row.paymentRecords || []), record],
            };
            upsertRuntimePurchaseData([updatedOrder]);
            return updatedOrder;
        }));
    }

    function addInvoiceRecord(orderCode: string, record: InvoiceRecord) {
        setOrderRows((items: OrderRow[]) => items.map((row) => {
            if (row.jdOrder !== orderCode) {
                return row;
            }
            const updatedOrder = {
                ...row,
                invoiceRecords: [...(row.invoiceRecords || []), record],
            };
            upsertRuntimePurchaseData([updatedOrder]);
            return updatedOrder;
        }));
    }

    return (
        <div className="equipment-app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark"><ShieldCheck size={22} /></div>
                    <div>
                        <strong>智慧安保管理平台</strong>
                        <span>v 1.8.94</span>
                    </div>
                </div>
                <nav>
                    {systemMenu.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button type="button" className="system-item" key={item.label}>
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                    <div className="equipment-menu-title">
                        <Archive size={16} />
                        <span>装备管理</span>
                    </div>
                    {menu.map((id) => {
                        const meta = pageMeta[id];
                        const Icon = meta.icon;
                        return (
                            <button
                                type="button"
                                key={id}
                                className={activeMenuPage === id ? 'active submenu-item' : 'submenu-item'}
                                onClick={() => openPage(id)}
                            >
                                <Icon size={15} />
                                <span>{meta.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <div className="workspace">
                <div className="workspace-head">
                    <header className="topbar">
                        <div className="search-box">
                            <Search size={16} />
                            <span>搜索装备、采购计划、采购订单、盘点任务</span>
                        </div>
                        <div className="topbar-right">
                            <span>2026-06-16 19:06:23</span>
                            <button type="button" className="icon-btn" aria-label="通知"><Bell size={16} /></button>
                            <div className="user-chip">山东振邦保安服务有限公司</div>
                        </div>
                    </header>

                    <div className="tabbar">
                        {tabs.map((tab: { id: PageId; label: string }) => (
                            <div
                                key={tab.id}
                                className={tab.id === page ? 'tabbar-tab current' : 'tabbar-tab'}
                            >
                                <button type="button" className="tabbar-action" onClick={() => openPage(tab.id)}>
                                    <span className="tabbar-label">{tab.label}</span>
                                </button>
                                {tabs.length > 1 && (
                                    <button
                                        type="button"
                                        className="tabbar-close"
                                        aria-label={`关闭${tab.label}`}
                                        onClick={(event) => closeTab(tab.id, event)}
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <main className={page === 'dashboard' ? 'main-content is-dashboard' : 'main-content is-work-page'}>
                    {page === 'dashboard' && (
                        <div className="page-heading">
                            <div>
                                <span>{current.group}</span>
                                <h1>{current.label}</h1>
                            </div>
                        </div>
                    )}
                    <PageContent
                        page={page}
                        openPage={openPage}
                        openWindow={setBusinessWindow}
                        openDemandView={openDemandView}
                        openPlanView={openPlanView}
                        openGenerateOrder={openGenerateOrder}
                        openLowStockDemand={openLowStockDemand}
                        purchaseDemandDraft={purchaseDemandDraft}
                        selectedDemand={selectedDemand}
                        selectedPlan={selectedPlan}
                        orderRows={orderRows}
                        inboundRows={inboundRows}
                        onCreateGeneratedOrders={createGeneratedOrders}
                        onGenerateInbound={generateInboundForOrder}
                        onAddPayment={addPaymentRecord}
                        onAddInvoice={addInvoiceRecord}
                        purchaseTab={purchaseTab}
                        setPurchaseTab={setPurchaseTab}
                    />
                </main>
            </div>
            {businessWindow && <BusinessWindow window={businessWindow} onClose={() => setBusinessWindow(null)} />}
        </div>
    );
}
