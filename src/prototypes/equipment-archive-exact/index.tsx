/**
 * @name 平台框架
 * @mode axure
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AnnotationViewer,
    type AnnotationDirectoryRouteNode,
    type AnnotationSourceDocument,
    type AnnotationViewerOptions,
} from '@axhub/annotation';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import annotationSourceDocument from './annotation-source.json';
import './vue-flags';
import { mountEquipmentArchiveExact } from './vue-app';
import MobileEquipmentClaim from './mobile-equipment-claim';
import MobileInventoryCheck, { type MobileCheckView } from './mobile-inventory-check';
import MobileProjectCheck, { type ProjectCheckView } from './mobile-project-check';
import './style.css';

const pageRoute = defineHashPageRoute([
    { id: 'platform-framework', title: '平台框架' },
    { id: 'equipment-archive', title: '装备档案管理' },
    { id: 'inventory-management', title: '库存管理' },
    { id: 'inventory-check', title: '库存盘点' },
    { id: 'inventory-check-form', title: '新增盘点' },
    { id: 'inventory-check-entry', title: '盘点录入' },
    { id: 'one-code-entry', title: '添加一物一码' },
    { id: 'inventory-check-code-entry', title: '盘点一物一码核对' },
    { id: 'outbound-create', title: '新增出库' },
    { id: 'mobile-equipment-claim', title: 'APP 装备领用' },
    { id: 'mobile-inventory-home', title: 'APP 功能中心' },
    { id: 'mobile-inventory-check', title: 'APP 库存盘点' },
    { id: 'mobile-inventory-check-form', title: 'APP 新增盘点' },
    { id: 'mobile-inventory-check-entry', title: 'APP 盘点录入' },
    { id: 'mobile-project-check', title: 'APP 项目装备盘点' },
], { defaultPageId: 'platform-framework' });

function Component() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const { page, setPage } = useHashPage(pageRoute);
    const initialModule = page === 'inventory-management' ? 'inventory' : page === 'inventory-statistics' ? 'inventory-statistics' : page === 'one-code-entry' ? 'one-code-entry' : page.startsWith('inventory-check') ? page : page === 'outbound-create' ? 'outbound-create' : page.startsWith('mobile-inventory-') || page === 'mobile-equipment-claim' ? page : page === 'mobile-project-check' ? 'project-check-home' : 'archive';
    const [moduleId, setModuleId] = useState<string>(initialModule);

    useEffect(() => {
        if (page === 'mobile-equipment-claim' || page === 'mobile-project-check' || page.startsWith('mobile-inventory-')) return;
        if (!mountRef.current) return;
        return mountEquipmentArchiveExact(mountRef.current, {
            showShell: page === 'platform-framework',
            onNavigate: setPage,
            onModuleChange: setModuleId,
            initialModule,
        });
    }, [page, setPage]);

    const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({
        currentPageId: moduleId,
        showToolbar: true,
        showThemeToggle: true,
        showColorFilter: true,
        emptyWhenNoData: false,
        toolbarEdge: 'right',
        onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
            const route = node.route;
            if (!route || !['archive', 'categories', 'inventory', 'inventory-statistics', 'inventory-check', 'inventory-check-form', 'inventory-check-entry', 'one-code-entry', 'inventory-check-code-entry', 'outbound-create', 'mobile-equipment-claim', 'mobile-inventory-home', 'mobile-inventory-check', 'mobile-inventory-check-form', 'mobile-inventory-check-entry', 'project-check-home', 'project-check-list', 'project-check-create', 'project-check-entry', 'project-check-result', 'project-check-picker', 'project-check-client-add', 'project-check-location'].includes(route)) return;
            if (route === 'mobile-equipment-claim' || route.startsWith('mobile-inventory-')) {
                setPage(route);
                setModuleId(route);
                return;
            }
            if (route.startsWith('project-check-')) {
                setPage('mobile-project-check');
                window.dispatchEvent(new CustomEvent('project-check-view', { detail: route }));
                setModuleId(route);
                return;
            }
            setPage(route === 'inventory' || route === 'inventory-statistics' ? 'inventory-management' : route === 'one-code-entry' || route.startsWith('inventory-check') || route === 'outbound-create' ? route : 'equipment-archive');
            window.dispatchEvent(new CustomEvent('equipment-archive-module', { detail: route }));
            setModuleId(route);
        },
    }), [moduleId, setPage]);

    return (
        <main className="equipment-exact-prototype-shell">
            {page === 'mobile-equipment-claim' ? <MobileEquipmentClaim />
                : page.startsWith('mobile-inventory-') ? <MobileInventoryCheck view={page as MobileCheckView} onNavigate={(next) => { setPage(next); setModuleId(next); }} />
                : page === 'mobile-project-check' ? <MobileProjectCheck initialView={(moduleId.startsWith('project-check-') ? moduleId : 'project-check-home') as ProjectCheckView} onViewChange={setModuleId} />
                : <div ref={mountRef} className="equipment-exact-mount" />}
            <AnnotationViewer
                source={annotationSourceDocument as AnnotationSourceDocument}
                options={annotationOptions}
            />
        </main>
    );
}

export default Component;

