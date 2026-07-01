/**
 * @name 装备管理7月迭代
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AnnotationViewer,
    type AnnotationDirectoryRouteNode,
    type AnnotationSourceDocument,
    type AnnotationViewerOptions,
} from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';
import './vue-flags';
import { mountEquipmentArchiveApp } from './vue-app';
import './style.css';

type PageId = 'archive' | 'categories';

export default function EquipmentArchivePrototype() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [pageId, setPageId] = useState<PageId>('archive');

    useEffect(() => {
        if (!mountRef.current) return;
        return mountEquipmentArchiveApp(mountRef.current, {
            onTabChange: (nextPage) => setPageId(nextPage),
        });
    }, []);

    const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({
        currentPageId: pageId,
        showToolbar: true,
        showThemeToggle: true,
        showColorFilter: true,
        emptyWhenNoData: false,
        toolbarEdge: 'right',
        onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
            if (node.route === 'archive' || node.route === 'categories') {
                window.dispatchEvent(new CustomEvent('equipment-archive-tab', { detail: node.route }));
                setPageId(node.route);
            }
        },
    }), [pageId]);

    return (
        <main className="equipment-prototype-shell">
            <div ref={mountRef} className="vue-equipment-root" />
            <AnnotationViewer
                source={annotationSourceDocument as AnnotationSourceDocument}
                options={annotationOptions}
            />
        </main>
    );
}
