/**
 * @name 装备管理
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    Bell,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { useHashPage } from '../../common/useHashPage';
import {
    PageId,
    PurchaseTab,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    pageMeta,
    menu,
    equipmentRoute,
    systemMenu,
    demands,
    plans,
    BusinessWindowState,
    BusinessWindow,
} from './shared';
import { PageContent } from './pages/PageContent';
import './style.css';

export default function EquipmentManagementPrototype() {
    const { page: routePage, setPage } = useHashPage(equipmentRoute);
    const page = pageMeta[routePage as PageId] ? routePage as PageId : 'dashboard';
    const [visited, setVisited] = useState<PageId[]>(['dashboard']);
    const [purchaseTab, setPurchaseTab] = useState<PurchaseTab>('demand');
    const [selectedDemand, setSelectedDemand] = useState<DemandRow>(demands[0]);
    const [selectedPlan, setSelectedPlan] = useState<PlanRow>(plans[0]);
    const [purchaseDemandDraft, setPurchaseDemandDraft] = useState<{ warehouse: string; lines: PurchaseDemandLine[] } | null>(null);
    const [businessWindow, setBusinessWindow] = useState<BusinessWindowState | null>(null);

    const current = pageMeta[page];
    const activeMenuPage = page.startsWith('purchase-') ? 'purchase' : page;
    const tabs = useMemo(() => visited.map((id) => ({ id, label: pageMeta[id].label })), [visited]);

    useEffect(() => {
        setVisited((items) => (items.includes(page) ? items : [...items, page].slice(-7)));
    }, [page]);

    function navigatePage(id: PageId) {
        setPage(id);
    }

    function openPage(id: PageId) {
        setPurchaseDemandDraft(null);
        navigatePage(id);
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
                <header className="topbar">
                    <div className="search-box">
                        <Search size={16} />
                        <span>搜索装备、采购计划、京东订单、盘点任务</span>
                    </div>
                    <div className="topbar-right">
                        <span>2026-06-16 19:06:23</span>
                        <button type="button" className="icon-btn" aria-label="通知"><Bell size={16} /></button>
                        <div className="user-chip">山东振邦保安服务有限公司</div>
                    </div>
                </header>

                <div className="tabbar">
                    {tabs.map((tab) => (
                        <button
                            type="button"
                            key={tab.id}
                            className={tab.id === page ? 'current' : ''}
                            onClick={() => openPage(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                        openLowStockDemand={openLowStockDemand}
                        purchaseDemandDraft={purchaseDemandDraft}
                        selectedDemand={selectedDemand}
                        selectedPlan={selectedPlan}
                        purchaseTab={purchaseTab}
                        setPurchaseTab={setPurchaseTab}
                    />
                </main>
            </div>
            {businessWindow && <BusinessWindow window={businessWindow} onClose={() => setBusinessWindow(null)} />}
        </div>
    );
}
