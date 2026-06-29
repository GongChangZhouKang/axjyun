import React from 'react';
import {
    Archive,
    ArrowLeftRight,
    BarChart3,
    Boxes,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    FileSpreadsheet,
    Home,
    PackageCheck,
    ShieldCheck,
    ShoppingCart,
    Warehouse,
} from 'lucide-react';
import { defineHashPageRoute } from '../../common/useHashPage';
import {
    PageId,
} from './types';

export const pageMeta: Record<PageId, { label: string; icon: React.ElementType; group: string }> = {
    dashboard: { label: '装备总览', icon: Home, group: '装备管理' },
    archive: { label: '装备档案管理', icon: Archive, group: '基础资料' },
    warehouses: { label: '仓库管理', icon: Warehouse, group: '基础资料' },
    inventory: { label: '库存管理', icon: Boxes, group: '仓储运营' },
    purchase: { label: '采购管理', icon: ShoppingCart, group: '装备管理' },
    'purchase-demand-create': { label: '新增采购需求', icon: ShoppingCart, group: '装备管理' },
    'purchase-demand-view': { label: '查看采购需求', icon: ShoppingCart, group: '装备管理' },
    'purchase-plan-create': { label: '新增采购计划', icon: ClipboardList, group: '装备管理' },
    'purchase-plan-view': { label: '查看采购计划', icon: ClipboardList, group: '装备管理' },
    'purchase-order-generate': { label: '生成采购订单', icon: ClipboardList, group: '装备管理' },
    inbound: { label: '入库管理', icon: PackageCheck, group: '仓储运营' },
    transfer: { label: '调拨管理', icon: ArrowLeftRight, group: '仓储运营' },
    stocktake: { label: '库存盘点', icon: ClipboardCheck, group: '仓储运营' },
    issue: { label: '出库管理', icon: CheckCircle2, group: '项目使用' },
    costs: { label: '成本归集', icon: BarChart3, group: '项目使用' },
};

export const menu: PageId[] = [
    'dashboard',
    'archive',
    'purchase',
    'transfer',
    'inventory',
    'issue',
    'inbound',
    'warehouses',
    'stocktake',
    'costs',
];

export const equipmentRoute = defineHashPageRoute(
    menu.map((id) => ({ id, title: pageMeta[id].label })),
    { defaultPageId: 'dashboard' },
);

export const systemMenu = [
    { label: '可视化调度', icon: BarChart3 },
    { label: '智慧安检数据大屏', icon: ShieldCheck },
    { label: '安保数据', icon: BarChart3 },
    { label: '审批管理', icon: ClipboardList },
    { label: '合同管理', icon: FileSpreadsheet },
    { label: '项目管理', icon: Building2 },
];
