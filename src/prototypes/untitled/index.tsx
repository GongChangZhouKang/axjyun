/**
 * @name 装备管理
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    ArrowLeftRight,
    BarChart3,
    Bell,
    Boxes,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    FileSpreadsheet,
    Home,
    PackageCheck,
    Search,
    ShieldCheck,
    ShoppingCart,
    Upload,
    Warehouse,
} from 'lucide-react';
import { defineHashPageRoute, useHashPage } from '../../common/useHashPage';
import './style.css';

type PageId =
    | 'dashboard'
    | 'archive'
    | 'warehouses'
    | 'inventory'
    | 'purchase'
    | 'inbound'
    | 'transfer'
    | 'stocktake'
    | 'issue'
    | 'costs';

type StatusTone = 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple';

interface EquipmentItem {
    name: string;
    category: string;
    spec: string;
    unit: string;
    oneCode: boolean;
    costMethod: string;
    depreciation: string;
    depreciationRule: string;
    key: boolean;
    standard: string;
    stock: number;
}

interface NumberedAsset {
    code: string;
    name: string;
    location: string;
    owner: string;
    status: string;
    cost: number;
    originalCost: number;
    depreciationRule: string;
    depreciationStart: string;
    accumulatedDepreciation: number;
    netValue: number;
}

interface CategoryRow {
    name: string;
    parent: string;
    level: string;
    code: string;
    itemCount: number;
    status: string;
}

interface WarehouseRow {
    name: string;
    type: string;
    org: string;
    manager: string;
    skuCount: number;
    amount: number;
    status: string;
}

interface LineItem {
    name: string;
    qty: number;
    unit: string;
    amount: number;
}

interface PlanItem extends LineItem {
    orderAmount: number;
}

interface StocktakeItem {
    name: string;
    book: number;
    actual: number;
    unitCost: number;
}

interface DemandRow {
    code: string;
    branch: string;
    project: string;
    items: LineItem[];
    type: string;
    due: string;
    status: string;
}

interface PlanRow {
    code: string;
    mode: string;
    source: string;
    items: PlanItem[];
    status: string;
}

interface OrderRow {
    jdOrder: string;
    plan: string;
    supplier: string;
    importedAt: string;
    items: LineItem[];
    match: string;
    status: string;
}

interface InventoryRow {
    warehouse: string;
    item: string;
    category: string;
    bookQty: number;
    available: number;
    occupied: number;
    unitCost: number;
    amount: number;
    warning: string;
    method: string;
}

interface FlowRow {
    code: string;
    from: string;
    to: string;
    items: LineItem[];
    handler: string;
    status: string;
}

interface StocktakeRow {
    code: string;
    warehouse: string;
    range: string;
    items: StocktakeItem[];
    status: string;
}

interface CostRow {
    project: string;
    branch: string;
    monthCost: number;
    clothing: number;
    duty: number;
    protection: number;
    source: string;
    method: string;
}

interface BatchCostDetail {
    batch: string;
    inbound: string;
    order: string;
    inboundAt: string;
    batchQty: number;
    issuedQty: number;
    unitCost: number;
    amount: number;
}

interface DepreciationCostDetail {
    assetCode: string;
    originalCost: number;
    startAt: string;
    returnAt: string;
    useDays: number;
    rate: string;
    amount: number;
    netValue: number;
}

interface CostTraceRow {
    project: string;
    source: string;
    item: string;
    qty: number;
    unit: string;
    method: '移动加权平均' | '批次管理' | '单件折旧';
    collectTime: string;
    amount: number;
    trace: string;
    weightedUnitCost?: number;
    batches?: BatchCostDetail[];
    depreciation?: DepreciationCostDetail[];
}

const pageMeta: Record<PageId, { label: string; icon: React.ElementType; group: string }> = {
    dashboard: { label: '装备总览', icon: Home, group: '装备管理' },
    archive: { label: '装备档案管理', icon: Archive, group: '基础资料' },
    warehouses: { label: '仓库管理', icon: Warehouse, group: '基础资料' },
    inventory: { label: '库存管理', icon: Boxes, group: '仓储运营' },
    purchase: { label: '采购管理', icon: ShoppingCart, group: '装备管理' },
    inbound: { label: '入库管理', icon: PackageCheck, group: '仓储运营' },
    transfer: { label: '调拨管理', icon: ArrowLeftRight, group: '仓储运营' },
    stocktake: { label: '库存盘点', icon: ClipboardCheck, group: '仓储运营' },
    issue: { label: '出库管理', icon: CheckCircle2, group: '项目使用' },
    costs: { label: '成本归集', icon: BarChart3, group: '项目使用' },
};

const menu: PageId[] = [
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

const equipmentRoute = defineHashPageRoute(
    menu.map((id) => ({ id, title: pageMeta[id].label })),
    { defaultPageId: 'dashboard' },
);

const systemMenu = [
    { label: '可视化调度', icon: BarChart3 },
    { label: '智慧安检数据大屏', icon: ShieldCheck },
    { label: '安保数据', icon: BarChart3 },
    { label: '审批管理', icon: ClipboardList },
    { label: '合同管理', icon: FileSpreadsheet },
    { label: '项目管理', icon: Building2 },
];

const equipmentItems: EquipmentItem[] = [
    {
        name: '夏季短袖执勤服',
        category: '保安员服装',
        spec: '藏蓝色/尺码齐全',
        unit: '套',
        oneCode: false,
        costMethod: '移动加权平均',
        depreciation: '否',
        depreciationRule: '领用即归集',
        key: false,
        standard: '固定岗、巡逻岗',
        stock: 428,
    },
    {
        name: '强光手电',
        category: '执勤装备',
        spec: '充电式/1200流明',
        unit: '个',
        oneCode: false,
        costMethod: '移动加权平均',
        depreciation: '否',
        depreciationRule: '领用即归集',
        key: false,
        standard: '巡逻岗、夜班岗',
        stock: 186,
    },
    {
        name: '数字对讲机',
        category: '执勤装备',
        spec: '公网集群/含充电座',
        unit: '台',
        oneCode: true,
        costMethod: '单件折旧',
        depreciation: '是',
        depreciationRule: '直线法 / 36个月 / 残值率5%',
        key: true,
        standard: '固定岗、巡逻岗、秩序维护',
        stock: 73,
    },
    {
        name: '防刺服',
        category: '被动防护装备',
        spec: 'GA标准/黑色',
        unit: '件',
        oneCode: true,
        costMethod: '批次管理',
        depreciation: '否',
        depreciationRule: '按实际领用批次归集',
        key: true,
        standard: '重点项目、风险岗位',
        stock: 46,
    },
    {
        name: '保安防卫棍',
        category: '主动防卫装备',
        spec: '橡胶/标准型',
        unit: '根',
        oneCode: true,
        costMethod: '批次管理',
        depreciation: '否',
        depreciationRule: '按实际领用批次归集',
        key: true,
        standard: '固定岗、巡逻岗',
        stock: 96,
    },
    {
        name: '应急救援服',
        category: '消防装备',
        spec: '阻燃反光/套装',
        unit: '套',
        oneCode: false,
        costMethod: '移动加权平均',
        depreciation: '否',
        depreciationRule: '领用即归集',
        key: false,
        standard: '应急队、消防值守',
        stock: 31,
    },
    {
        name: '手持金属探测器',
        category: '安检装备',
        spec: '高灵敏度/充电款',
        unit: '台',
        oneCode: true,
        costMethod: '单件折旧',
        depreciation: '是',
        depreciationRule: '直线法 / 60个月 / 残值率5%',
        key: true,
        standard: '安检岗、活动保障',
        stock: 18,
    },
];

const numberedAssets: NumberedAsset[] = [
    { code: 'EQ-DJ-202606-0018', name: '数字对讲机', location: '集团总仓', owner: '李岩', status: '在库', cost: 386, originalCost: 386, depreciationRule: '直线法 / 36个月 / 残值率5%', depreciationStart: '领用确认后开始', accumulatedDepreciation: 0, netValue: 386 },
    { code: 'EQ-DJ-202606-0021', name: '数字对讲机', location: '历下分公司仓', owner: '赵静', status: '已领用', cost: 386, originalCost: 386, depreciationRule: '直线法 / 36个月 / 残值率5%', depreciationStart: '2026-05-18 09:42', accumulatedDepreciation: 19, netValue: 367 },
    { code: 'EQ-FC-202605-0007', name: '防刺服', location: 'CBD园区项目点', owner: '王队长', status: '项目在用', cost: 640, originalCost: 640, depreciationRule: '不折旧 / 批次管理', depreciationStart: '按领用批次一次归集', accumulatedDepreciation: 0, netValue: 640 },
    { code: 'EQ-AJ-202604-0003', name: '手持金属探测器', location: '会展中心项目点', owner: '周明', status: '项目在用', cost: 1180, originalCost: 1180, depreciationRule: '直线法 / 60个月 / 残值率5%', depreciationStart: '2026-06-04 10:20', accumulatedDepreciation: 18, netValue: 1162 },
];

const categoryRows: CategoryRow[] = [
    { name: '保安员服装', parent: '-', level: '一级分类', code: 'ZB-FZ', itemCount: 18, status: '启用' },
    { name: '执勤服', parent: '保安员服装', level: '二级分类', code: 'ZB-FZ-ZQF', itemCount: 8, status: '启用' },
    { name: '鞋帽配饰', parent: '保安员服装', level: '二级分类', code: 'ZB-FZ-XM', itemCount: 10, status: '启用' },
    { name: '执勤装备', parent: '-', level: '一级分类', code: 'ZB-ZQ', itemCount: 24, status: '启用' },
    { name: '通讯设备', parent: '执勤装备', level: '二级分类', code: 'ZB-ZQ-TX', itemCount: 6, status: '启用' },
    { name: '照明设备', parent: '执勤装备', level: '二级分类', code: 'ZB-ZQ-ZM', itemCount: 5, status: '启用' },
    { name: '巡更设备', parent: '执勤装备', level: '二级分类', code: 'ZB-ZQ-XG', itemCount: 4, status: '启用' },
    { name: '防护装备', parent: '-', level: '一级分类', code: 'ZB-FH', itemCount: 16, status: '启用' },
    { name: '防刺防护', parent: '防护装备', level: '二级分类', code: 'ZB-FH-FC', itemCount: 5, status: '启用' },
    { name: '消防装备', parent: '-', level: '一级分类', code: 'ZB-XF', itemCount: 9, status: '启用' },
    { name: '安检装备', parent: '-', level: '一级分类', code: 'ZB-AJ', itemCount: 7, status: '启用' },
];

const warehouses: WarehouseRow[] = [
    { name: '集团总仓', type: '集团仓', org: '山东振邦保安服务有限公司', manager: '李岩', skuCount: 92, amount: 386800, status: '启用' },
    { name: '历下分公司仓', type: '分公司仓', org: '历下分公司', manager: '赵静', skuCount: 56, amount: 128420, status: '启用' },
    { name: '高新区分公司仓', type: '分公司仓', org: '高新区分公司', manager: '孙鹏', skuCount: 48, amount: 97360, status: '启用' },
    { name: 'CBD园区项目点', type: '项目点', org: 'CBD园区项目', manager: '王队长', skuCount: 23, amount: 44620, status: '启用' },
    { name: '会展中心项目点', type: '项目点', org: '会展中心项目', manager: '周明', skuCount: 19, amount: 35880, status: '启用' },
];

const demands: DemandRow[] = [
    {
        code: 'XQ20260616001',
        branch: '历下分公司',
        project: 'CBD园区等3个项目',
        type: '集团集采',
        due: '2026-06-25',
        status: '待汇总',
        items: [
            { name: '夏季短袖执勤服', qty: 160, unit: '套', amount: 25600 },
            { name: '反光背心', qty: 120, unit: '件', amount: 3360 },
            { name: '强光手电', qty: 40, unit: '个', amount: 3600 },
        ],
    },
    {
        code: 'XQ20260616002',
        branch: '高新区分公司',
        project: '软件园等2个项目',
        type: '集团集采',
        due: '2026-06-27',
        status: '待汇总',
        items: [
            { name: '强光手电', qty: 80, unit: '个', amount: 7200 },
            { name: '数字对讲机', qty: 18, unit: '台', amount: 6948 },
            { name: '巡更棒', qty: 10, unit: '支', amount: 4200 },
        ],
    },
    {
        code: 'XQ20260616003',
        branch: '市中分公司',
        project: '会展中心项目',
        type: '项目专属',
        due: '2026-06-21',
        status: '单独采购',
        items: [
            { name: '手持金属探测器', qty: 6, unit: '台', amount: 7200 },
            { name: '防爆毯', qty: 2, unit: '张', amount: 5600 },
        ],
    },
    {
        code: 'XQ20260616004',
        branch: '历城分公司',
        project: '大学城项目',
        type: '紧急补货',
        due: '2026-06-19',
        status: '单独采购',
        items: [
            { name: '应急救援服', qty: 24, unit: '套', amount: 6720 },
            { name: '消防防火毯', qty: 30, unit: '张', amount: 2100 },
            { name: '防火面具', qty: 40, unit: '个', amount: 3600 },
        ],
    },
    {
        code: 'XQ20260616005',
        branch: '历下分公司',
        project: '金融中心项目',
        type: '特殊尺码',
        due: '2026-06-28',
        status: '单独采购',
        items: [
            { name: '特体执勤服', qty: 18, unit: '套', amount: 4140 },
            { name: '特体执勤裤', qty: 18, unit: '条', amount: 2160 },
        ],
    },
];

const plans: PlanRow[] = [
    {
        code: 'JH20260616001',
        mode: '集团集采',
        source: '历下/高新 2 个分公司',
        status: '待导入订单',
        items: [
            { name: '夏季短袖执勤服', qty: 180, unit: '套', amount: 28800, orderAmount: 29160 },
            { name: '反光背心', qty: 120, unit: '件', amount: 3360, orderAmount: 3360 },
            { name: '强光手电', qty: 18, unit: '个', amount: 1620, orderAmount: 1640 },
        ],
    },
    {
        code: 'JH20260616002',
        mode: '项目专属',
        source: '会展中心项目',
        status: '订单已导入',
        items: [
            { name: '手持金属探测器', qty: 6, unit: '台', amount: 7200, orderAmount: 7080 },
            { name: '防爆毯', qty: 2, unit: '张', amount: 5600, orderAmount: 5600 },
        ],
    },
    {
        code: 'JH20260616003',
        mode: '紧急单采',
        source: '大学城项目',
        status: '入库中',
        items: [
            { name: '应急救援服', qty: 24, unit: '套', amount: 6720, orderAmount: 6912 },
            { name: '防火面具', qty: 40, unit: '个', amount: 3600, orderAmount: 3600 },
            { name: '消防防火毯', qty: 30, unit: '张', amount: 2100, orderAmount: 2100 },
        ],
    },
    {
        code: 'JH20260616004',
        mode: '特殊尺码',
        source: '金融中心项目',
        status: '待采购',
        items: [
            { name: '特体执勤服', qty: 18, unit: '套', amount: 4140, orderAmount: 4320 },
            { name: '特体执勤裤', qty: 18, unit: '条', amount: 2160, orderAmount: 2250 },
        ],
    },
];

const orders: OrderRow[] = [
    {
        jdOrder: 'JDHC-20260616-83921',
        plan: 'JH20260616001',
        supplier: '京东慧采-三棵树安保用品',
        importedAt: '2026-06-16 10:24',
        match: '1项待匹配',
        status: '待商品匹配',
        items: [
            { name: '夏季短袖执勤服', qty: 180, unit: '套', amount: 29160 },
            { name: '反光背心', qty: 120, unit: '件', amount: 3360 },
            { name: '强光手电', qty: 18, unit: '个', amount: 1640 },
        ],
    },
    {
        jdOrder: 'JDHC-20260616-83944',
        plan: 'JH20260616002',
        supplier: '京东慧采-易安通设备',
        importedAt: '2026-06-16 11:08',
        match: '已匹配',
        status: '待入库',
        items: [
            { name: '手持金属探测器', qty: 6, unit: '台', amount: 7080 },
            { name: '防爆毯', qty: 2, unit: '张', amount: 5600 },
        ],
    },
    {
        jdOrder: 'JDHC-20260615-82710',
        plan: 'JH20260616003',
        supplier: '京东慧采-三棵树安保用品',
        importedAt: '2026-06-15 17:42',
        match: '已匹配',
        status: '部分入库',
        items: [
            { name: '应急救援服', qty: 24, unit: '套', amount: 6912 },
            { name: '防火面具', qty: 40, unit: '个', amount: 3600 },
            { name: '消防防火毯', qty: 30, unit: '张', amount: 2100 },
        ],
    },
];

const inventory: InventoryRow[] = [
    { warehouse: '集团总仓', item: '夏季短袖执勤服', category: '保安员服装', bookQty: 428, available: 360, occupied: 68, unitCost: 162, amount: 69336, warning: '正常', method: '移动加权平均' },
    { warehouse: '集团总仓', item: '数字对讲机', category: '执勤装备', bookQty: 73, available: 51, occupied: 22, unitCost: 386, amount: 28178, warning: '正常', method: '单件折旧' },
    { warehouse: '历下分公司仓', item: '强光手电', category: '执勤装备', bookQty: 36, available: 12, occupied: 24, unitCost: 91, amount: 3276, warning: '低库存', method: '移动加权平均' },
    { warehouse: 'CBD园区项目点', item: '防刺服', category: '被动防护装备', bookQty: 12, available: 2, occupied: 10, unitCost: 640, amount: 7680, warning: '正常', method: '批次管理' },
    { warehouse: '会展中心项目点', item: '手持金属探测器', category: '安检装备', bookQty: 6, available: 1, occupied: 5, unitCost: 1180, amount: 7080, warning: '低库存', method: '单件折旧' },
];

const inboundRows: FlowRow[] = [
    {
        code: 'RK20260616001',
        from: 'JDHC-20260616-83944',
        to: '集团总仓',
        handler: '李岩',
        status: '待入库',
        items: [
            { name: '手持金属探测器', qty: 6, unit: '台', amount: 7080 },
            { name: '防爆毯', qty: 2, unit: '张', amount: 5600 },
        ],
    },
    {
        code: 'RK20260615003',
        from: 'JDHC-20260615-82710',
        to: '历城分公司仓',
        handler: '孙鹏',
        status: '部分入库',
        items: [
            { name: '应急救援服', qty: 18, unit: '套', amount: 5184 },
            { name: '防火面具', qty: 20, unit: '个', amount: 1800 },
            { name: '消防防火毯', qty: 20, unit: '张', amount: 1400 },
        ],
    },
    {
        code: 'RK20260614009',
        from: 'JDHC-20260614-81206',
        to: '集团总仓',
        handler: '李岩',
        status: '已入库',
        items: [
            { name: '夏季短袖执勤服', qty: 300, unit: '套', amount: 48600 },
            { name: '反光背心', qty: 200, unit: '件', amount: 5600 },
            { name: '执勤帽', qty: 300, unit: '顶', amount: 6000 },
        ],
    },
];

const transfers: FlowRow[] = [
    { code: 'DB20260616001', from: '集团总仓', to: '历下分公司仓', handler: '赵静', status: '待出库', items: [{ name: '夏季短袖执勤服', qty: 120, unit: '套', amount: 19440 }, { name: '反光背心', qty: 80, unit: '件', amount: 2240 }] },
    { code: 'DB20260616002', from: '历下分公司仓', to: 'CBD园区项目点', handler: '王队长', status: '在途', items: [{ name: '数字对讲机', qty: 10, unit: '台', amount: 3860 }, { name: '防刺服', qty: 6, unit: '件', amount: 3840 }] },
    { code: 'DB20260615004', from: '高新区分公司仓', to: '软件园项目点', handler: '孙鹏', status: '已完成', items: [{ name: '强光手电', qty: 24, unit: '个', amount: 2184 }, { name: '巡更棒', qty: 8, unit: '支', amount: 3360 }] },
];

const stocktakes: StocktakeRow[] = [
    {
        code: 'PD20260616001',
        warehouse: '集团总仓',
        range: '执勤装备',
        status: '差异待处理',
        items: [
            { name: '数字对讲机', book: 73, actual: 72, unitCost: 386 },
            { name: '强光手电', book: 73, actual: 73, unitCost: 91 },
        ],
    },
    {
        code: 'PD20260616002',
        warehouse: '历下分公司仓',
        range: '保安员服装',
        status: '盘盈审核中',
        items: [
            { name: '夏季短袖执勤服', book: 138, actual: 140, unitCost: 162 },
            { name: '反光背心', book: 100, actual: 102, unitCost: 81 },
        ],
    },
    {
        code: 'PD20260612005',
        warehouse: 'CBD园区项目点',
        range: '重点编号装备',
        status: '已完成',
        items: [
            { name: '数字对讲机', book: 20, actual: 20, unitCost: 386 },
            { name: '防刺服', book: 12, actual: 12, unitCost: 640 },
        ],
    },
];

const issues: FlowRow[] = [
    {
        code: 'LY20260616001',
        from: '历下分公司仓',
        to: '项目申领：CBD园区项目',
        handler: '王队长',
        status: '待出库',
        items: [
            { name: '夏季短袖执勤服', qty: 80, unit: '套', amount: 12960 },
            { name: '反光背心', qty: 60, unit: '件', amount: 1680 },
            { name: '防刺服', qty: 6, unit: '件', amount: 3840 },
            { name: '数字对讲机', qty: 3, unit: '台', amount: 57 },
        ],
    },
    {
        code: 'LY20260616002',
        from: '集团总仓',
        to: '个人申领：周明',
        handler: '周明',
        status: '已出库',
        items: [
            { name: '手持金属探测器', qty: 5, unit: '台', amount: 82 },
            { name: '防爆毯', qty: 2, unit: '张', amount: 5600 },
        ],
    },
    {
        code: 'LY20260615008',
        from: '高新区分公司仓',
        to: '项目申领：软件园项目',
        handler: '刘队长',
        status: '已出库',
        items: [
            { name: '强光手电', qty: 24, unit: '个', amount: 2184 },
            { name: '巡更棒', qty: 8, unit: '支', amount: 3360 },
        ],
    },
];

const costs: CostRow[] = [
    { project: 'CBD园区项目', branch: '历下分公司', monthCost: 18537, clothing: 14640, duty: 57, protection: 3840, source: 'LY20260616001 / DB20260616002', method: '移动加权 + 批次管理 + 单件折旧' },
    { project: '会展中心项目', branch: '市中分公司', monthCost: 12880, clothing: 0, duty: 82, protection: 12798, source: 'LY20260616002 / JH20260616002', method: '单件折旧 + 项目专属采购' },
    { project: '软件园项目', branch: '高新区分公司', monthCost: 9484, clothing: 0, duty: 2184, protection: 7300, source: 'DB20260615004', method: '调拨到项目归集' },
    { project: '大学城项目', branch: '历城分公司', monthCost: 5184, clothing: 0, duty: 0, protection: 5184, source: 'JH20260616003', method: '紧急单采领用' },
];

const costTraceRows: CostTraceRow[] = [
    {
        project: 'CBD园区项目',
        source: 'LY20260616001',
        item: '夏季短袖执勤服',
        qty: 80,
        unit: '套',
        method: '移动加权平均',
        collectTime: '2026-06-16 15:20',
        amount: 12960,
        trace: '库存总金额 ¥69,336 / 库存 428 套，领用时加权单价 ¥162',
        weightedUnitCost: 162,
    },
    {
        project: 'CBD园区项目',
        source: 'LY20260616001',
        item: '反光背心',
        qty: 60,
        unit: '件',
        method: '移动加权平均',
        collectTime: '2026-06-16 15:20',
        amount: 1680,
        trace: '库存总金额 ¥5,600 / 库存 200 件，领用时加权单价 ¥28',
        weightedUnitCost: 28,
    },
    {
        project: 'CBD园区项目',
        source: 'LY20260616001',
        item: '防刺服',
        qty: 6,
        unit: '件',
        method: '批次管理',
        collectTime: '2026-06-16 15:24',
        amount: 3840,
        trace: '按先进先出优先扣减 2026-05 入库批次，保留批次与京东订单来源',
        batches: [
            { batch: 'PC-FC-202605-01', inbound: 'RK20260528006', order: 'JDHC-20260527-77418', inboundAt: '2026-05-28', batchQty: 20, issuedQty: 4, unitCost: 620, amount: 2480 },
            { batch: 'PC-FC-202606-02', inbound: 'RK20260614009', order: 'JDHC-20260614-81206', inboundAt: '2026-06-14', batchQty: 18, issuedQty: 2, unitCost: 680, amount: 1360 },
        ],
    },
    {
        project: 'CBD园区项目',
        source: 'LY20260616001',
        item: '数字对讲机',
        qty: 3,
        unit: '台',
        method: '单件折旧',
        collectTime: '2026-06-16 15:26',
        amount: 57,
        trace: '按装备编号从领用确认开始计提，归还确认后停止向本项目归集',
        depreciation: [
            { assetCode: 'EQ-DJ-202606-0021', originalCost: 386, startAt: '2026-05-18 09:42', returnAt: '未归还', useDays: 30, rate: '¥0.34/天', amount: 19, netValue: 367 },
            { assetCode: 'EQ-DJ-202606-0022', originalCost: 386, startAt: '2026-05-18 09:42', returnAt: '未归还', useDays: 30, rate: '¥0.34/天', amount: 19, netValue: 367 },
            { assetCode: 'EQ-DJ-202606-0023', originalCost: 386, startAt: '2026-05-18 09:42', returnAt: '未归还', useDays: 30, rate: '¥0.34/天', amount: 19, netValue: 367 },
        ],
    },
    {
        project: '会展中心项目',
        source: 'LY20260616002',
        item: '手持金属探测器',
        qty: 5,
        unit: '台',
        method: '单件折旧',
        collectTime: '2026-06-16 10:20',
        amount: 82,
        trace: '安检设备按 60 个月直线法折旧，残值率 5%',
        depreciation: [
            { assetCode: 'EQ-AJ-202604-0003', originalCost: 1180, startAt: '2026-06-04 10:20', returnAt: '未归还', useDays: 12, rate: '¥0.62/天', amount: 18, netValue: 1162 },
            { assetCode: 'EQ-AJ-202604-0004', originalCost: 1180, startAt: '2026-06-04 10:20', returnAt: '未归还', useDays: 12, rate: '¥0.62/天', amount: 18, netValue: 1162 },
            { assetCode: 'EQ-AJ-202604-0005', originalCost: 1180, startAt: '2026-06-04 10:20', returnAt: '2026-06-15 18:00', useDays: 11, rate: '¥0.62/天', amount: 17, netValue: 1163 },
            { assetCode: 'EQ-AJ-202604-0006', originalCost: 1180, startAt: '2026-06-04 10:20', returnAt: '未归还', useDays: 12, rate: '¥0.62/天', amount: 18, netValue: 1162 },
            { assetCode: 'EQ-AJ-202604-0007', originalCost: 1180, startAt: '2026-06-04 10:20', returnAt: '2026-06-15 18:00', useDays: 11, rate: '¥0.62/天', amount: 11, netValue: 1169 },
        ],
    },
];

const statusTone: Record<string, StatusTone> = {
    启用: 'green',
    正常: 'green',
    已匹配: 'green',
    已入库: 'green',
    已完成: 'green',
    已领用: 'green',
    已出库: 'green',
    在库: 'green',
    待汇总: 'orange',
    待采购: 'orange',
    待导入订单: 'orange',
    待商品匹配: 'orange',
    待匹配: 'orange',
    待入库: 'orange',
    待确认: 'orange',
    待出库: 'orange',
    部分入库: 'blue',
    入库中: 'blue',
    在途: 'blue',
    项目在用: 'blue',
    已领用资产: 'blue',
    低库存: 'red',
    差异待处理: 'red',
    盘盈审核中: 'purple',
    单独采购: 'purple',
};

function currency(value: number) {
    return `¥${value.toLocaleString('zh-CN')}`;
}

function numberText(value: number) {
    return value.toLocaleString('zh-CN');
}

function lineQty(items: LineItem[]) {
    return items.reduce((sum, item) => sum + item.qty, 0);
}

function lineAmount(items: LineItem[]) {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

function planOrderAmount(items: PlanItem[]) {
    return items.reduce((sum, item) => sum + item.orderAmount, 0);
}

function planVariance(items: PlanItem[]) {
    const budget = lineAmount(items);
    if (!budget) {
        return '-';
    }
    const rate = ((planOrderAmount(items) - budget) / budget) * 100;
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

function stockBook(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + item.book, 0);
}

function stockActual(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + item.actual, 0);
}

function stockDiff(items: StocktakeItem[]) {
    return stockActual(items) - stockBook(items);
}

function stockDiffAmount(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + (item.actual - item.book) * item.unitCost, 0);
}

function itemSummary(items: Array<LineItem | StocktakeItem>) {
    const names = items.map((item) => item.name);
    if (names.length <= 2) {
        return names.join('、');
    }
    return `${names.slice(0, 2).join('、')}等${names.length}项`;
}

function Tag({ children, tone = 'gray' }: { children: React.ReactNode; tone?: StatusTone }) {
    return <span className={`tag tag-${tone}`}>{children}</span>;
}

function StatusTag({ value }: { value: string }) {
    return <Tag tone={statusTone[value] || 'gray'}>{value}</Tag>;
}

function StatCard({
    title,
    value,
    note,
    icon: Icon,
    tone,
}: {
    title: string;
    value: string;
    note: string;
    icon: React.ElementType;
    tone: StatusTone;
}) {
    return (
        <section className="stat-card">
            <div className={`stat-icon stat-${tone}`}>
                <Icon size={18} />
            </div>
            <div>
                <p>{title}</p>
                <strong>{value}</strong>
                <span>{note}</span>
            </div>
        </section>
    );
}

function FilterBar({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="filter-bar">
            <div className="filter-grid">{children}</div>
            <div className="filter-actions">{action || <button type="button" className="primary-btn">查询</button>}</div>
        </div>
    );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
    return (
        <label className={wide ? 'field field-wide' : 'field'}>
            <span>{label}</span>
            <input value={value} readOnly />
        </label>
    );
}

function SelectLike({ label, value, options, onChange }: { label: string; value: string; options?: string[]; onChange?: (value: string) => void }) {
    const list = options && options.length ? options : [value];

    return (
        <label className="field">
            <span>{label}</span>
            <select value={value} onChange={(event) => onChange?.(event.target.value)}>
                {list.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </label>
    );
}

function WarehouseScope({ value = '全部仓库' }: { value?: string }) {
    return (
        <div className="warehouse-scope">
            <SelectLike label="所属仓库" value={value} />
        </div>
    );
}

function DataTable({
    columns,
    rows,
    renderRow,
}: {
    columns: string[];
    rows: unknown[];
    renderRow: (row: any, index: number) => React.ReactNode;
}) {
    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{rows.map(renderRow)}</tbody>
            </table>
        </div>
    );
}

interface ActionItem {
    label: string;
    danger?: boolean;
    onClick?: () => void;
}

interface BusinessWindowState {
    title: string;
    subtitle: string;
    body: React.ReactNode;
    primary?: string;
}

type OpenBusinessWindow = (window: BusinessWindowState) => void;

function RowActions({ allowDelete = true, actions }: { allowDelete?: boolean; actions?: ActionItem[] }) {
    return (
        <div className="row-actions">
            {(actions || [{ label: '编辑' }]).map((action) => (
                <button
                    type="button"
                    key={action.label}
                    className={action.danger ? 'danger-link' : undefined}
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            ))}
            {allowDelete && <button type="button" className="danger-link">删除</button>}
        </div>
    );
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
    return (
        <div className="section-title">
            <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            {action}
        </div>
    );
}

function DetailGrid({ rows }: { rows: Array<[string, React.ReactNode]> }) {
    return (
        <div className="detail-grid">
            {rows.map(([label, value]) => (
                <div className="detail-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>
    );
}

function MiniLineTable({ items, amountLabel = '金额' }: { items: LineItem[]; amountLabel?: string }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备</th>
                    <th>数量</th>
                    <th>{amountLabel}</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={`${item.name}-${item.qty}`}>
                        <td>{item.name}</td>
                        <td>{numberText(item.qty)} {item.unit}</td>
                        <td>{currency(item.amount)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function MiniStocktakeTable({ items }: { items: StocktakeItem[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备</th>
                    <th>账面</th>
                    <th>实盘</th>
                    <th>差异金额</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const diffAmount = (item.actual - item.book) * item.unitCost;
                    return (
                        <tr key={item.name}>
                            <td>{item.name}</td>
                            <td>{numberText(item.book)}</td>
                            <td>{numberText(item.actual)}</td>
                            <td className={diffAmount < 0 ? 'negative' : diffAmount > 0 ? 'positive' : ''}>{currency(diffAmount)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function BatchCostTable({ rows }: { rows: BatchCostDetail[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>批次</th>
                    <th>入库/订单</th>
                    <th>入库时间</th>
                    <th>批次数量</th>
                    <th>本次领用</th>
                    <th>批次单价</th>
                    <th>归集金额</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.batch}>
                        <td>{row.batch}</td>
                        <td>{row.inbound}<br />{row.order}</td>
                        <td>{row.inboundAt}</td>
                        <td>{numberText(row.batchQty)}</td>
                        <td>{numberText(row.issuedQty)}</td>
                        <td>{currency(row.unitCost)}</td>
                        <td>{currency(row.amount)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function DepreciationCostTable({ rows }: { rows: DepreciationCostDetail[] }) {
    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>装备编号</th>
                    <th>采购原值</th>
                    <th>领用时间</th>
                    <th>归还时间</th>
                    <th>使用天数</th>
                    <th>折旧率</th>
                    <th>折旧费用</th>
                    <th>当前净值</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.assetCode}>
                        <td>{row.assetCode}</td>
                        <td>{currency(row.originalCost)}</td>
                        <td>{row.startAt}</td>
                        <td>{row.returnAt}</td>
                        <td>{row.useDays}</td>
                        <td>{row.rate}</td>
                        <td>{currency(row.amount)}</td>
                        <td>{currency(row.netValue)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function CostTraceDetail({ rows }: { rows: CostTraceRow[] }) {
    return (
        <div className="detail-stack">
            {rows.map((row) => (
                <section className="trace-card" key={`${row.source}-${row.item}-${row.method}`}>
                    <div className="trace-card-head">
                        <div>
                            <h3>{row.item}</h3>
                            <p>{row.project} / {row.source}</p>
                        </div>
                        <Tag tone={row.method === '单件折旧' ? 'purple' : row.method === '批次管理' ? 'orange' : 'blue'}>{row.method}</Tag>
                    </div>
                    <DetailGrid rows={[
                        ['数量', `${numberText(row.qty)} ${row.unit}`],
                        ['归集时间', row.collectTime],
                        ['归集金额', currency(row.amount)],
                        ['可追溯来源', row.trace],
                    ]} />
                    {row.weightedUnitCost && (
                        <div className="calculation-note">
                            移动加权：{numberText(row.qty)} {row.unit} × {currency(row.weightedUnitCost)} = {currency(row.amount)}
                        </div>
                    )}
                    {row.batches && <BatchCostTable rows={row.batches} />}
                    {row.depreciation && <DepreciationCostTable rows={row.depreciation} />}
                </section>
            ))}
        </div>
    );
}

function tracesForSource(source: string) {
    return costTraceRows.filter((row) => row.source === source || source.includes(row.source));
}

function tracesForAsset(assetCode: string) {
    return costTraceRows.filter((row) => row.depreciation?.some((item) => item.assetCode === assetCode));
}

function NumberedAssetDetail({ row }: { row: NumberedAsset }) {
    const depreciationRows = tracesForAsset(row.code).flatMap((trace) => trace.depreciation || []).filter((item) => item.assetCode === row.code);
    return (
        <div className="detail-stack">
            <DetailGrid rows={[
                ['装备名称', row.name],
                ['当前位置', row.location],
                ['责任人', row.owner],
                ['状态', <StatusTag value={row.status} />],
                ['采购原值', currency(row.originalCost)],
                ['折旧规则', row.depreciationRule],
                ['折旧开始', row.depreciationStart],
                ['累计折旧', currency(row.accumulatedDepreciation)],
                ['当前净值', currency(row.netValue)],
            ]} />
            {depreciationRows.length ? <DepreciationCostTable rows={depreciationRows} /> : <div className="empty-state">暂无项目领用折旧记录，在库装备待领用确认后开始计提。</div>}
        </div>
    );
}

function InventoryMovementDetail({ row }: { row: InventoryRow }) {
    const relatedInbound = inboundRows.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedOutbound = issues.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedTransfer = transfers.filter((flow) => flow.items.some((item) => item.name === row.item));
    const relatedStocktake = stocktakes.filter((flow) => flow.items.some((item) => item.name === row.item));

    return (
        <div className="detail-stack">
            <DetailGrid
                rows={[
                    ['当前仓库', row.warehouse],
                    ['库存数量', numberText(row.bookQty)],
                    ['可用 / 占用', `${numberText(row.available)} / ${numberText(row.occupied)}`],
                    ['库存成本', currency(row.amount)],
                    ['计价方式', row.method],
                    ['库存预警', <StatusTag value={row.warning} />],
                ]}
            />
            <div className="detail-section">
                <h3>入库明细</h3>
                <MiniFlowTable rows={relatedInbound} emptyText="暂无关联入库记录" />
            </div>
            <div className="detail-section">
                <h3>出库明细</h3>
                <MiniFlowTable rows={relatedOutbound} emptyText="暂无关联出库记录" />
            </div>
            <div className="detail-section">
                <h3>调拨与盘点</h3>
                <MiniFlowTable rows={relatedTransfer} emptyText="暂无关联调拨记录" />
                <MiniStocktakeRecord rows={relatedStocktake} />
            </div>
        </div>
    );
}

function MiniFlowTable({ rows, emptyText }: { rows: FlowRow[]; emptyText: string }) {
    if (!rows.length) {
        return <div className="empty-state">{emptyText}</div>;
    }

    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>单据号</th>
                    <th>流向</th>
                    <th>数量</th>
                    <th>金额</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.code}>
                        <td>{row.code}</td>
                        <td>{row.from} → {row.to}</td>
                        <td>{numberText(lineQty(row.items))}</td>
                        <td>{currency(lineAmount(row.items))}</td>
                        <td><StatusTag value={row.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function MiniStocktakeRecord({ rows }: { rows: StocktakeRow[] }) {
    if (!rows.length) {
        return <div className="empty-state">暂无关联盘点记录</div>;
    }

    return (
        <table className="mini-table">
            <thead>
                <tr>
                    <th>盘点任务</th>
                    <th>仓库</th>
                    <th>差异</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.code}>
                        <td>{row.code}</td>
                        <td>{row.warehouse}</td>
                        <td>{stockDiff(row.items)}</td>
                        <td><StatusTag value={row.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function BusinessWindow({ window, onClose }: { window: BusinessWindowState; onClose: () => void }) {
    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel business-window" role="dialog" aria-modal="true" aria-label={window.title}>
                <div className="modal-header">
                    <div>
                        <h2>{window.title}</h2>
                        <p>{window.subtitle}</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="business-body">{window.body}</div>
                <div className="modal-actions">
                    <button type="button" className="secondary-btn" onClick={onClose}>关闭</button>
                    {window.primary && <button type="button" className="primary-btn" onClick={onClose}>{window.primary}</button>}
                </div>
            </div>
        </div>
    );
}

function Dashboard({ openPage }: { openPage: (page: PageId) => void }) {
    const totalInventory = inventory.reduce((sum, row) => sum + row.amount, 0);
    const totalCost = costs.reduce((sum, row) => sum + row.monthCost, 0);
    const pendingPlan = plans.filter((row) => row.status !== '入库中').length;
    const diffCount = stocktakes.filter((row) => stockDiff(row.items) !== 0).length;

    return (
        <>
            <div className="overview-filter">
                <SelectLike label="组织范围" value="山东振邦保安服务有限公司" />
                <SelectLike label="仓库范围" value="全部仓库" />
                <SelectLike label="月份" value="2026-06" />
            </div>

            <div className="stats-grid">
                <StatCard title="本月采购计划" value={`${plans.length} 单`} note={`${pendingPlan} 单待继续处理`} icon={ShoppingCart} tone="blue" />
                <StatCard title="库存资产金额" value={currency(totalInventory)} note="覆盖集团仓、分公司仓、项目点" icon={Boxes} tone="green" />
                <StatCard title="项目成本归集" value={currency(totalCost)} note="按领用和项目点消耗确认" icon={BarChart3} tone="purple" />
                <StatCard title="盘点差异" value={`${diffCount} 项`} note="盘盈盘亏待审核处理" icon={ClipboardCheck} tone="orange" />
            </div>

            <div className="workflow">
                {[
                    ['采购管理', '需求/计划/订单导入', 'purchase'],
                    ['入库管理', '形成库存成本', 'inbound'],
                    ['库存管理', '库存状态与预警', 'inventory'],
                    ['调拨/出库', '成本随流转归集', 'issue'],
                    ['库存盘点', '盘盈盘亏处理', 'stocktake'],
                    ['项目成本', '按项目汇总分析', 'costs'],
                ].map(([title, body, page], index) => (
                    <button type="button" className="workflow-step" key={title} onClick={() => openPage(page as PageId)}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{title}</strong>
                        <em>{body}</em>
                    </button>
                ))}
            </div>

            <div className="content-grid">
                <section className="panel">
                    <SectionTitle title="待处理采购计划" subtitle="集团采购关注预算价格、订单价格和计划差异" />
                    <DataTable
                        columns={['计划号', '模式', '来源', '明细数', '装备摘要', '预算金额', '订单金额', '差异', '状态']}
                        rows={plans}
                        renderRow={(row: PlanRow) => (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.mode}</td>
                                <td>{row.source}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td>{currency(planOrderAmount(row.items))}</td>
                                <td>{planVariance(row.items)}</td>
                                <td><StatusTag value={row.status} /></td>
                            </tr>
                        )}
                    />
                </section>
                <section className="panel side-panel">
                    <SectionTitle title="成本口径" subtitle="价格按业务节点固化" />
                    <ul className="rule-list">
                        <li><b>预算价格</b><span>申请或计划阶段用于预算占用和审批参考</span></li>
                        <li><b>订单价格</b><span>京东订单导入后锁定的实际采购价格</span></li>
                        <li><b>入库价格</b><span>收货入库后形成库存成本的价格</span></li>
                        <li><b>领用价格</b><span>装备领用或消耗时计入项目成本的价格</span></li>
                    </ul>
                </section>
            </div>
        </>
    );
}

function PurchasePage({ openPage, openWindow }: { openPage: (page: PageId) => void; openWindow: OpenBusinessWindow }) {
    const [tab, setTab] = useState<'demand' | 'plans' | 'orders'>('demand');

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
            {tab === 'demand' && <DemandPage openPlans={() => setTab('plans')} openWindow={openWindow} />}
            {tab === 'plans' && <PlanPage openOrders={() => setTab('orders')} openWindow={openWindow} />}
            {tab === 'orders' && <OrderPage openInbound={() => openPage('inbound')} openWindow={openWindow} />}
        </>
    );
}

function ArchivePage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    const [tab, setTab] = useState<'items' | 'categories'>('items');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [createCostMethod, setCreateCostMethod] = useState('单件折旧');

    return (
        <>
            <div className="sub-tabs">
                <button type="button" className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>
                    装备品类档案
                </button>
                <button type="button" className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
                    分类管理
                </button>
            </div>

            {tab === 'items' && (
                <>
                    <FilterBar>
                        <Field label="装备名称" value="请输入装备名称" wide />
                        <SelectLike label="装备分类" value="全部分类" />
                        <SelectLike label="是否一物一码管理" value="全部" />
                        <SelectLike label="成本方式" value="全部方式" />
                        <SelectLike label="状态" value="启用" />
                    </FilterBar>
                    <section className="panel">
                        <SectionTitle
                            title="装备品类档案"
                            subtitle="管理公司有哪些装备，维护分类、规格、单位、成本计算方式和是否一物一码管理"
                        />
                        <div className="table-toolbar">
                            <button type="button" className="primary-btn" onClick={() => {
                                setCreateCostMethod('单件折旧');
                                setShowCreateModal(true);
                            }}>新增装备</button>
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '导出装备品类档案',
                                subtitle: '导出当前筛选范围下的装备分类、成本规则和库存概览。',
                                primary: '确认导出',
                                body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '装备名称、分类、规格、单位、一物一码、成本计算方式、库存'], ['用途', '采购选品、库存核对和基础资料维护']]} />,
                            })}>导出</button>
                        </div>
                        <DataTable
                            columns={['装备名称', '装备分类', '规格型号', '单位', '一物一码', '成本计算方式', '折旧', '折旧规则', '库存', '操作']}
                            rows={equipmentItems}
                            renderRow={(row: EquipmentItem) => (
                                <tr key={row.name}>
                                    <td className="link-cell">{row.name}</td>
                                    <td>{row.category}</td>
                                    <td>{row.spec}</td>
                                    <td>{row.unit}</td>
                                    <td>{row.oneCode ? <Tag tone="blue">是</Tag> : <Tag>否</Tag>}</td>
                                    <td>{row.costMethod}</td>
                                    <td>{row.depreciation === '是' ? <Tag tone="purple">是</Tag> : <Tag>否</Tag>}</td>
                                    <td>{row.depreciationRule}</td>
                                    <td>{numberText(row.stock)}</td>
                                    <td>
                                        <RowActions
                                            allowDelete={false}
                                            actions={[
                                                {
                                                    label: '成本规则',
                                                    onClick: () => openWindow({
                                                        title: `${row.name}成本规则`,
                                                        subtitle: '装备档案决定入库、领用、折旧和项目归集时的默认成本口径。',
                                                        body: <DetailGrid rows={[
                                                            ['装备分类', row.category],
                                                            ['是否一物一码', row.oneCode ? '是' : '否'],
                                                            ['计价方式', row.costMethod],
                                                            ['是否折旧', row.depreciation],
                                                            ['折旧规则', row.depreciationRule],
                                                            ['适用岗位/场景', row.standard],
                                                        ]} />,
                                                    }),
                                                },
                                                { label: '编辑' },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            )}
                        />
                    </section>
                </>
            )}

            {tab === 'categories' && (
                <>
                    <FilterBar>
                        <Field label="分类名称" value="请输入分类名称" wide />
                        <SelectLike label="分类层级" value="全部层级" />
                        <SelectLike label="状态" value="启用" />
                    </FilterBar>
                    <section className="panel">
                        <SectionTitle title="分类管理" subtitle="支持多级分类，便于按安保装备类型管理目录和库存" />
                        <div className="table-toolbar">
                            <button type="button" className="primary-btn" onClick={() => setShowCategoryModal(true)}>新增分类</button>
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '导出分类管理',
                                subtitle: '导出装备分类层级、编码、装备数量和状态。',
                                primary: '确认导出',
                                body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '分类名称、上级分类、层级、分类编码、装备数、状态'], ['用途', '分类目录核对和系统初始化']]} />,
                            })}>导出</button>
                        </div>
                        <DataTable
                            columns={['分类名称', '上级分类', '层级', '分类编码', '装备数', '状态', '操作']}
                            rows={categoryRows}
                            renderRow={(row: CategoryRow) => (
                                <tr key={row.code}>
                                    <td className="link-cell">{row.parent === '-' ? row.name : `　${row.name}`}</td>
                                    <td>{row.parent}</td>
                                    <td>{row.level}</td>
                                    <td>{row.code}</td>
                                    <td>{row.itemCount}</td>
                                    <td><StatusTag value={row.status} /></td>
                                    <td><RowActions allowDelete={row.itemCount === 0} /></td>
                                </tr>
                            )}
                        />
                    </section>
                </>
            )}

            {showCreateModal && (
                <div className="modal-backdrop" role="presentation">
                    <div className="modal-panel" role="dialog" aria-modal="true" aria-label="新增装备">
                        <div className="modal-header">
                            <div>
                                <h2>新增装备</h2>
                                <p>先维护装备品类，需要一物一码管理的装备后续再录入具体编号。</p>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <div className="modal-form">
                            <div className="form-section-title">基础信息</div>
                            <Field label="装备名称" value="如：数字对讲机" />
                            <SelectLike
                                label="装备分类"
                                value="执勤装备 / 通讯设备"
                                options={['执勤装备 / 通讯设备', '保安员服装 / 执勤服', '执勤装备 / 照明设备', '防护装备 / 防刺防护', '消防装备', '安检装备']}
                            />
                            <Field label="规格型号" value="公网集群/含充电座" />
                            <SelectLike label="单位" value="台" options={['台', '套', '件', '个', '根', '张', '顶', '双']} />
                            <Field label="参考价格" value="386" />
                            <SelectLike label="供应商" value="京东慧采-易安通设备" options={['京东慧采-易安通设备', '京东慧采-三棵树安保用品', '安豹', '三棵树', '其他供应商']} />
                            <div className="form-section-title">管理规则</div>
                            <SelectLike
                                label="成本计算方式"
                                value={createCostMethod}
                                options={['移动加权平均', '批次管理', '单件折旧']}
                                onChange={setCreateCostMethod}
                            />
                            <SelectLike label="是否一物一码管理" value={createCostMethod === '单件折旧' ? '是' : '否'} options={['是', '否']} />
                            <div className="field-note">成本计算方式统一为「移动加权平均、批次管理、单件折旧」。选择「单件折旧」时必须启用一物一码管理；选择「批次管理」时，出库按先进先出优先扣减较早入库批次。</div>
                            <SelectLike label="是否重点装备" value="是" options={['是', '否']} />
                            <SelectLike label="状态" value="启用" options={['启用', '停用']} />
                            <Field label="适用岗位/场景" value="固定岗、巡逻岗、秩序维护" wide />
                            {createCostMethod === '单件折旧' && (
                                <>
                                    <div className="form-section-title">折旧信息</div>
                                    <SelectLike label="折旧方式" value="直线法" options={['直线法']} />
                                    <Field label="折旧年限（月）" value="36" />
                                    <Field label="残值率" value="5%" />
                                    <SelectLike label="折旧开始时点" value="项目/人员确认领用" options={['项目/人员确认领用', '入库即开始', '手工指定']} />
                                </>
                            )}
                            <div className="form-section-title">图片与备注</div>
                            <div className="image-upload-field">
                                <span>装备图片</span>
                                <button type="button" className="secondary-btn">上传图片</button>
                                <em>支持用于采购、入库和领用时核对外观</em>
                            </div>
                            <label className="textarea-field">
                                <span>备注</span>
                                <textarea value="如需特殊尺码、定制标识或供应商备注，可在此说明。" readOnly />
                            </label>
                        </div>
                        <div className="modal-tip">
                            {createCostMethod === '单件折旧'
                                ? '选择「单件折旧」后，入库扫码或录码会写入采购原值、折旧规则和折旧开始时点，可在库存管理的「一物一码装备」中查看折旧记录。'
                                : createCostMethod === '批次管理'
                                    ? '选择「批次管理」后，入库确认时生成批次号、入库单价和订单来源；出库按先进先出优先扣减较早入库批次。'
                                    : '选择「移动加权平均」后，系统按当前库存总金额和库存数量计算加权单价，项目领用时一次归集成本。'}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>取消</button>
                            <button type="button" className="primary-btn" onClick={() => setShowCreateModal(false)}>保存</button>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal-backdrop" role="presentation">
                    <div className="modal-panel" role="dialog" aria-modal="true" aria-label="新增分类">
                        <div className="modal-header">
                            <div>
                                <h2>新增分类</h2>
                                <p>维护装备目录层级，用于装备建档、库存查询和采购归类。</p>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <div className="modal-form">
                            <div className="form-section-title">分类信息</div>
                            <Field label="分类名称" value="如：通讯设备" />
                            <SelectLike
                                label="上级分类"
                                value="执勤装备"
                                options={['无上级分类', '执勤装备', '保安员服装', '防护装备', '消防装备', '安检装备']}
                            />
                            <Field label="分类编码" value="ZQ-TX" />
                            <SelectLike label="分类层级" value="二级分类" options={['一级分类', '二级分类', '三级分类']} />
                            <SelectLike label="状态" value="启用" options={['启用', '停用']} />
                            <Field label="排序" value="10" />
                            <label className="textarea-field">
                                <span>备注</span>
                                <textarea value="用于对讲机、执法记录仪等通讯类执勤装备归档。" readOnly />
                            </label>
                        </div>
                        <div className="modal-tip">
                            保存后，新分类可在新增装备、库存筛选和采购需求中使用；已有装备不会自动调整分类。
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowCategoryModal(false)}>取消</button>
                            <button type="button" className="primary-btn" onClick={() => setShowCategoryModal(false)}>保存</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function WarehousePage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <SelectLike label="仓库类型" value="全部类型" />
                <Field label="仓库名称" value="请输入仓库名称" wide />
                <SelectLike label="所属组织" value="全部组织" />
                <SelectLike label="状态" value="启用" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="仓库与项目点"
                    subtitle="支持集团仓、分公司仓、项目点三级库存组织"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增仓库',
                        subtitle: '维护集团仓、分公司仓或项目点，保存后可作为库存流转节点。',
                        primary: '保存仓库',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="仓库类型" value="分公司仓" options={['集团仓', '分公司仓', '项目点']} />
                                <Field label="仓库名称" value="如：章丘分公司仓" />
                                <SelectLike label="所属组织" value="章丘分公司" options={['山东振邦保安服务有限公司', '历下分公司', '高新区分公司', '章丘分公司']} />
                                <Field label="负责人" value="请输入负责人" />
                                <Field label="联系电话" value="请输入联系电话" />
                                <SelectLike label="状态" value="启用" options={['启用', '停用']} />
                            </div>
                        ),
                    })}>新增仓库</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出仓库列表',
                        subtitle: '导出仓库、项目点和库存成本概览。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '仓库名称、类型、组织、负责人、品目数、库存成本、状态'], ['用途', '库存组织核对和线下盘点准备']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['仓库名称', '类型', '所属组织', '负责人', '品目数', '库存成本', '状态', '操作']}
                    rows={warehouses}
                    renderRow={(row: WarehouseRow) => (
                        <tr key={row.name}>
                            <td className="link-cell">{row.name}</td>
                            <td>{row.type}</td>
                            <td>{row.org}</td>
                            <td>{row.manager}</td>
                            <td>{row.skuCount}</td>
                            <td>{currency(row.amount)}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.skuCount === 0}
                                    actions={[
                                        {
                                            label: '查看',
                                            onClick: () => openWindow({
                                                title: row.name,
                                                subtitle: '仓库基础信息、库存规模和可参与的业务流转。',
                                                body: (
                                                    <DetailGrid
                                                        rows={[
                                                            ['仓库类型', row.type],
                                                            ['所属组织', row.org],
                                                            ['负责人', row.manager],
                                                            ['库存品目', `${row.skuCount} 项`],
                                                            ['库存成本', currency(row.amount)],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]}
                                                    />
                                                ),
                                            }),
                                        },
                                        { label: '编辑', onClick: () => openWindow({ title: '编辑仓库', subtitle: row.name, primary: '保存修改', body: <DetailGrid rows={[['仓库名称', row.name], ['负责人', row.manager], ['状态', <StatusTag value={row.status} />]]} /> }) },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function DemandPage({ openPlans, openWindow }: { openPlans: () => void; openWindow: OpenBusinessWindow }) {
    const [showDemandModal, setShowDemandModal] = useState(false);

    return (
        <>
            <FilterBar>
                <SelectLike label="分公司" value="全部分公司" />
                <SelectLike label="需求类型" value="全部类型" />
                <Field label="装备名称" value="请输入装备名称" wide />
                <SelectLike label="状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="分公司采购需求"
                    subtitle="集团接收分公司需求后，通用物资汇总采购，紧急和项目专属需求拆分单采"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => setShowDemandModal(true)}>新增需求</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出采购需求',
                        subtitle: '导出分公司需求、预算金额和汇总状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '需求单号、分公司、需求范围、明细、预算金额、状态'], ['用途', '集团汇总采购和需求复核']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['需求单号', '分公司', '需求范围', '明细数', '装备摘要', '数量合计', '需求类型', '期望到货', '预算金额', '状态', '操作']}
                    rows={demands}
                    renderRow={(row: DemandRow) => (
                        <tr key={row.code}>
                            <td className="link-cell">{row.code}</td>
                            <td>{row.branch}</td>
                            <td>{row.project}</td>
                            <td>{row.items.length} 项</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td><Tag tone={row.type === '集团集采' ? 'blue' : 'purple'}>{row.type}</Tag></td>
                            <td>{row.due}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待汇总'}
                                    actions={[
                                        {
                                            label: '查看明细',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: '采购需求单明细，作为集团汇总或单独采购的来源。',
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['分公司', row.branch],
                                                            ['需求范围', row.project],
                                                            ['需求类型', row.type],
                                                            ['期望到货', row.due],
                                                            ['预算金额', currency(lineAmount(row.items))],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="预算金额" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        { label: row.status === '待汇总' ? '汇总生成计划' : '查看计划', onClick: openPlans },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>

            {showDemandModal && (
                <div className="modal-backdrop" role="presentation">
                    <div className="modal-panel" role="dialog" aria-modal="true" aria-label="新增需求">
                        <div className="modal-header">
                            <div>
                                <h2>新增需求</h2>
                                <p>支持手工填写，也可从库存预警装备或京东慧采选品结果生成需求明细。</p>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowDemandModal(false)}>×</button>
                        </div>
                        <div className="modal-form">
                            <div className="form-section-title">需求信息</div>
                            <SelectLike label="分公司" value="历下分公司" options={['历下分公司', '高新分公司', '历城分公司']} />
                            <Field label="需求范围" value="金融中心项目" />
                            <SelectLike label="需求类型" value="集团集采" options={['集团集采', '项目专属', '紧急补货', '特殊尺码']} />
                            <Field label="期望到货" value="2026-06-28" />
                            <div className="form-section-title">明细来源</div>
                            <SelectLike
                                label="拉取方式"
                                value="从库存预警装备拉取"
                                options={['从库存预警装备拉取', '从京东慧采选品导入', '手工录入明细']}
                            />
                            <SelectLike label="库存预警范围" value="全部低库存装备" options={['全部低库存装备', '仅当前分公司', '仅当前项目']} />
                            <Field label="京东选品文件" value="导入京东慧采导出的选品 Excel" wide />
                            <label className="textarea-field">
                                <span>需求说明</span>
                                <textarea value="可先从库存预警装备生成建议明细；如已在京东慧采完成选品，可导出后在此导入形成需求明细。" readOnly />
                            </label>
                        </div>
                        <div className="modal-tip">
                            从库存预警拉取会带出装备、建议数量和所属仓库；京东慧采选品导入仅生成需求明细，价格以采购计划和订单导入结果为准。
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowDemandModal(false)}>取消</button>
                            <button type="button" className="primary-btn" onClick={() => setShowDemandModal(false)}>保存</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PlanPage({ openOrders, openWindow }: { openOrders: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <Field label="计划号" value="请输入计划号" />
                <SelectLike label="采购模式" value="全部模式" />
                <SelectLike label="计划状态" value="全部状态" />
                <SelectLike label="成本口径" value="预算价格/订单价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="集团采购计划"
                    subtitle="计划阶段记录预算价格，订单导入后对比订单价格"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '生成采购计划',
                        subtitle: '将待汇总需求按通用物资、项目专属和紧急需求拆分生成计划。',
                        primary: '生成计划',
                        body: (
                            <div className="detail-stack">
                                <DetailGrid rows={[
                                    ['汇总范围', '待汇总采购需求'],
                                    ['合并规则', '通用物资合并，项目专属和紧急需求单独采购'],
                                    ['价格口径', '使用需求预算价格生成计划金额'],
                                    ['下一步', '导入京东慧采订单后锁定订单价格'],
                                ]} />
                                <MiniLineTable items={demands.flatMap((demand) => demand.items).slice(0, 5)} amountLabel="预算金额" />
                            </div>
                        ),
                    })}>生成采购计划</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出采购计划',
                        subtitle: '导出当前采购计划及预算/订单差异。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '计划号、采购模式、预算金额、订单金额、价差、状态'], ['用途', '采购审批、价格差异复核']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['计划号', '采购模式', '需求来源', '明细数', '采购内容', '数量合计', '预算金额', '订单金额', '价差', '状态', '操作']}
                    rows={plans}
                    renderRow={(row: PlanRow) => (
                        <tr key={row.code}>
                            <td className="link-cell">{row.code}</td>
                            <td>{row.mode}</td>
                            <td>{row.source}</td>
                            <td>{row.items.length} 项</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td>{currency(planOrderAmount(row.items))}</td>
                            <td>{planVariance(row.items)}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待采购'}
                                    actions={[
                                        {
                                            label: '查看明细',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: '采购计划记录预算价格，订单导入后对比实际订单价格。',
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['采购模式', row.mode],
                                                            ['需求来源', row.source],
                                                            ['预算金额', currency(lineAmount(row.items))],
                                                            ['订单金额', currency(planOrderAmount(row.items))],
                                                            ['价差', planVariance(row.items)],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items.map((item) => ({ ...item, amount: item.orderAmount }))} amountLabel="订单金额" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        { label: row.status === '待导入订单' ? '导入订单' : '查看订单', onClick: openOrders },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function OrderPage({ openInbound, openWindow }: { openInbound: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <div className="upload-strip">
                <div className="upload-icon"><Upload size={22} /></div>
                <div>
                    <strong>导入京东慧采订单文件</strong>
                    <p>一期按方案五试点，只导入订单文件，导入时锁定订单价格并关联采购计划。</p>
                </div>
                <button type="button" className="primary-btn" onClick={() => openWindow({
                    title: '导入京东慧采订单文件',
                    subtitle: '上传 Excel 后完成计划匹配、商品匹配和订单价格锁定。',
                    primary: '开始导入',
                    body: (
                        <div className="modal-form embedded-form">
                            <Field label="订单文件" value="选择京东慧采导出的订单 Excel" wide />
                            <SelectLike label="关联计划" value="自动按计划号匹配" options={['自动按计划号匹配', '手动选择采购计划']} />
                            <SelectLike label="商品匹配" value="未匹配商品进入待处理" options={['未匹配商品进入待处理', '仅允许全部匹配后导入']} />
                            <Field label="导入说明" value="导入后订单价格作为采购成本来源，后续生成入库单。" wide />
                        </div>
                    ),
                })}>选择 Excel 文件</button>
            </div>
            <FilterBar>
                <Field label="京东订单号" value="请输入京东订单号" wide />
                <SelectLike label="匹配状态" value="全部状态" />
                <SelectLike label="入库状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="订单导入记录" subtitle="订单价格作为采购成本，后续入库形成库存成本" />
                <DataTable
                    columns={['京东订单号', '关联计划', '供应商', '导入时间', '明细数', '装备摘要', '数量合计', '订单金额', '商品匹配', '状态', '操作']}
                    rows={orders}
                    renderRow={(row: OrderRow) => (
                        <tr key={row.jdOrder}>
                            <td className="link-cell">{row.jdOrder}</td>
                            <td>{row.plan}</td>
                            <td>{row.supplier}</td>
                            <td>{row.importedAt}</td>
                            <td>{row.items.length} 行</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td><StatusTag value={row.match === '已匹配' ? '已匹配' : '待匹配'} /></td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待商品匹配'}
                                    actions={[
                                        {
                                            label: row.match === '已匹配' ? '查看明细' : '商品匹配',
                                            onClick: () => openWindow({
                                                title: row.match === '已匹配' ? row.jdOrder : '商品匹配',
                                                subtitle: row.match === '已匹配' ? '已导入订单明细和价格锁定结果。' : `${row.jdOrder} 存在待匹配商品，需要关联平台装备品类。`,
                                                primary: row.match === '已匹配' ? undefined : '保存匹配',
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['关联计划', row.plan],
                                                            ['供应商', row.supplier],
                                                            ['导入时间', row.importedAt],
                                                            ['订单金额', currency(lineAmount(row.items))],
                                                            ['商品匹配', <StatusTag value={row.match === '已匹配' ? '已匹配' : '待匹配'} />],
                                                            ['入库状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="订单金额" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        { label: row.status === '待商品匹配' ? '匹配后入库' : '创建入库', onClick: openInbound },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function InventoryPage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    const [tab, setTab] = useState<'stock' | 'codes'>('stock');

    return (
        <>
            <WarehouseScope />
            <div className="sub-tabs">
                <button type="button" className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>
                    库存台账
                </button>
                <button type="button" className={tab === 'codes' ? 'active' : ''} onClick={() => setTab('codes')}>
                    一物一码装备
                </button>
            </div>
            {tab === 'stock' && (
                <>
            <FilterBar>
                <SelectLike label="装备分类" value="全部分类" />
                <Field label="装备名称" value="请输入装备名称" wide />
                <SelectLike label="库存预警" value="全部" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="库存台账" subtitle="按所选仓库查看装备库存；一物一码装备同步展示可用和占用数量" />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增库存调整',
                        subtitle: '用于库存盘点确认、历史修正或异常处理后的库存调整。',
                        primary: '提交调整',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="调整仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓', 'CBD园区项目点']} />
                                <SelectLike label="调整类型" value="盘盈入库" options={['盘盈入库', '盘亏出库', '历史修正', '异常冻结']} />
                                <Field label="装备明细" value="选择装备和调整数量" wide />
                                <Field label="调整原因" value="请输入调整原因" wide />
                            </div>
                        ),
                    })}>新增库存调整</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出库存台账',
                        subtitle: '导出库存数量、可用占用和库存成本。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前仓库和筛选条件'], ['包含字段', '装备、分类、库存数量、可用、占用、库存成本、预警、计价方式'], ['用途', '库存核对、项目补货和成本分析']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['装备', '分类', '库存数量', '可用', '占用', '库存成本', '预警', '计价方式', '操作']}
                    rows={inventory}
                    renderRow={(row: InventoryRow) => {
                        const oneCode = equipmentItems.some((equipment) => equipment.name === row.item && equipment.oneCode);
                        return (
                            <tr key={`${row.warehouse}-${row.item}`}>
                                <td className="link-cell">{row.item}</td>
                                <td>{row.category}</td>
                                <td>{row.bookQty}</td>
                                <td>{oneCode ? row.available : '-'}</td>
                                <td>{oneCode ? row.occupied : '-'}</td>
                                <td>{currency(row.amount)}</td>
                                <td><StatusTag value={row.warning} /></td>
                                <td>{row.method}</td>
                                <td>
                                    <RowActions
                                        allowDelete={false}
                                        actions={[
                                            {
                                                label: '库存明细',
                                                onClick: () => openWindow({
                                                    title: `${row.item}库存明细`,
                                                    subtitle: '查看当前库存数量、成本和预警状态。',
                                                    body: <InventoryMovementDetail row={row} />,
                                                }),
                                            },
                                            {
                                                label: '出入库明细',
                                                onClick: () => openWindow({
                                                    title: `${row.item}出入库明细`,
                                                    subtitle: '汇总展示与该装备相关的入库、出库、调拨和盘点记录。',
                                                    body: <InventoryMovementDetail row={row} />,
                                                }),
                                            },
                                        ]}
                                    />
                                </td>
                            </tr>
                        );
                    }}
                />
            </section>
                </>
            )}
            {tab === 'codes' && (
                <>
                    <FilterBar>
                        <Field label="装备编号" value="请输入装备编号" />
                        <Field label="装备名称" value="请输入装备名称" />
                        <SelectLike label="当前位置" value="全部位置" />
                        <SelectLike label="状态" value="全部状态" />
                    </FilterBar>
                    <section className="panel">
                        <SectionTitle title="一物一码装备" subtitle="查看具体装备编号、当前位置、责任人和状态；台账通常由入库扫码或录码形成" />
                        <div className="table-toolbar">
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '导出一物一码装备',
                                subtitle: '导出当前筛选范围下的装备编号、位置、责任人和成本。',
                                primary: '确认导出',
                                body: <DetailGrid rows={[['导出范围', '全部位置 / 全部状态'], ['包含字段', '装备编号、名称、当前位置、责任人、状态、单件成本'], ['用途', '线下盘点、监管备案或交接确认']]} />,
                            })}>导出</button>
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '历史装备补录',
                                subtitle: '用于把已经在库或项目在用的重点装备补录成一物一码台账。',
                                primary: '保存补录',
                                body: (
                                    <div className="modal-form embedded-form">
                                        <Field label="装备编号" value="如：EQ-DJ-202606-0032" />
                                        <SelectLike label="装备名称" value="数字对讲机" options={['数字对讲机', '防刺服', '保安防卫棍', '手持金属探测器']} />
                                        <SelectLike label="当前位置" value="集团总仓" options={['集团总仓', '历下分公司仓', 'CBD园区项目点', '会展中心项目点']} />
                                        <Field label="责任人" value="请输入责任人" />
                                        <Field label="采购原值" value="386" />
                                        <SelectLike label="折旧规则" value="直线法 / 36个月 / 残值率5%" options={['直线法 / 36个月 / 残值率5%', '直线法 / 60个月 / 残值率5%', '不折旧 / 批次管理']} />
                                        <SelectLike label="折旧开始时点" value="项目/人员确认领用" options={['项目/人员确认领用', '入库即开始', '手工指定']} />
                                        <SelectLike label="状态" value="在库" options={['在库', '项目在用', '已领用']} />
                                    </div>
                                ),
                            })}>历史装备补录</button>
                        </div>
                        <DataTable
                            columns={['装备编号', '装备名称', '当前位置', '责任人', '状态', '采购原值', '累计折旧', '当前净值', '操作']}
                            rows={numberedAssets}
                            renderRow={(row: NumberedAsset) => (
                                <tr key={row.code}>
                                    <td className="link-cell">{row.code}</td>
                                    <td>{row.name}</td>
                                    <td>{row.location}</td>
                                    <td>{row.owner}</td>
                                    <td><StatusTag value={row.status} /></td>
                                    <td>{currency(row.originalCost)}</td>
                                    <td>{currency(row.accumulatedDepreciation)}</td>
                                    <td>{currency(row.netValue)}</td>
                                    <td>
                                        <RowActions
                                            allowDelete={row.status === '在库'}
                                            actions={[
                                                {
                                                    label: '查看',
                                                    onClick: () => openWindow({
                                                        title: row.code,
                                                        subtitle: '一物一码装备的当前位置、责任人、折旧规则和当前净值。',
                                                        body: <NumberedAssetDetail row={row} />,
                                                    }),
                                                },
                                                { label: '折旧记录', onClick: () => openWindow({ title: `${row.code}折旧记录`, subtitle: '展示单件装备在不同项目的领用、归还、使用期间和折旧费用。', body: <NumberedAssetDetail row={row} /> }) },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            )}
                        />
                    </section>
                </>
            )}
        </>
    );
}

function InboundPage({ openInventory, openWindow }: { openInventory: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <WarehouseScope />
            <FilterBar>
                <Field label="入库单号" value="请输入入库单号" />
                <SelectLike label="入库状态" value="全部状态" />
                <SelectLike label="成本来源" value="京东订单价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="入库管理" subtitle="按实际订单价格形成入库成本和库存成本" />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增入库单',
                        subtitle: '手工创建入库单，通常用于历史补录、线下采购或异常补入。',
                        primary: '保存入库单',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="入库来源" value="京东订单" options={['京东订单', '线下采购', '盘盈入库', '历史补录']} />
                                <SelectLike label="入库仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <Field label="来源单号" value="请输入来源订单或说明" />
                                <Field label="经办人" value="李岩" />
                                <Field label="批次号" value="系统自动生成 / 可手工调整" />
                                <Field label="入库单价" value="按订单明细自动带入" />
                                <SelectLike label="一物一码写入" value="原值+折旧规则" options={['原值+折旧规则', '仅生成编号', '不需要录码']} />
                                <Field label="装备明细" value="选择装备、数量和入库成本" wide />
                            </div>
                        ),
                    })}>新增入库单</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出入库记录',
                        subtitle: '导出入库单、来源订单、录码进度和入库成本。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '入库单号、来源订单、仓库、录码进度、入库成本、状态'], ['用途', '入库核对和成本入账']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['入库单号', '来源订单', '入库仓库', '明细数', '装备摘要', '数量合计', '录码进度', '入库成本', '经办人', '状态', '操作']}
                    rows={inboundRows}
                    renderRow={(row: FlowRow) => {
                        const codeItems = row.items.filter((item) => equipmentItems.some((equipment) => equipment.name === item.name && equipment.oneCode));
                        const codeQty = lineQty(codeItems);
                        const codedQty = row.status === '待入库' ? Math.max(0, codeQty - 2) : row.status === '部分入库' ? Math.floor(codeQty / 2) : codeQty;
                        const codeText = codeQty ? `${codedQty}/${codeQty} 已录码` : '无需录码';
                        return (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.from}</td>
                                <td>{row.to}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{numberText(lineQty(row.items))}</td>
                                <td><Tag tone={codeQty && codedQty < codeQty ? 'orange' : 'green'}>{codeText}</Tag></td>
                                <td>{currency(lineAmount(row.items))}</td>
                                <td>{row.handler}</td>
                                <td><StatusTag value={row.status} /></td>
                                <td>
                                    <RowActions
                                        allowDelete={row.status === '待入库'}
                                        actions={[
                                            {
                                                label: row.status === '已入库' ? '查看入库' : codeQty ? '录码入库' : '确认入库',
                                                onClick: () => openWindow({
                                                    title: row.status === '已入库' ? row.code : codeQty ? '录码入库' : '确认入库',
                                                    subtitle: `${row.from} 入库到 ${row.to}，确认后形成库存成本。`,
                                                    primary: row.status === '已入库' ? undefined : '确认入库',
                                                    body: (
                                                        <div className="detail-stack">
                                                            <DetailGrid rows={[
                                                                ['来源订单', row.from],
                                                                ['入库仓库', row.to],
                                                                ['经办人', row.handler],
                                                                ['录码进度', codeText],
                                                                ['入库成本', currency(lineAmount(row.items))],
                                                                ['批次来源', row.status === '已入库' ? '按入库单自动生成批次并写入库存成本' : '确认入库后生成批次号、入库单价和订单来源'],
                                                                ['一物一码成本', codeQty ? '录码时写入采购原值、折旧规则和折旧开始时点' : '无需单件折旧'],
                                                                ['状态', <StatusTag value={row.status} />],
                                                            ]} />
                                                            <MiniLineTable items={row.items} amountLabel="入库成本" />
                                                        </div>
                                                    ),
                                                }),
                                            },
                                            { label: '查看库存', onClick: openInventory },
                                        ]}
                                    />
                                </td>
                            </tr>
                        );
                    }}
                />
            </section>
        </>
    );
}

function TransferPage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <WarehouseScope />
            <FilterBar>
                <Field label="调拨单号" value="请输入调拨单号" />
                <SelectLike label="调出仓" value="全部" />
                <SelectLike label="调入仓" value="全部" />
                <SelectLike label="状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="调拨管理"
                    subtitle="支持集团仓到分公司仓、分公司仓到项目点、项目间调拨和退回，成本随库存流转"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增调拨',
                        subtitle: '从集团仓、分公司仓或项目点发起装备调拨，成本随库存流转。',
                        primary: '提交调拨',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="调出仓" value="集团总仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <SelectLike label="调入仓" value="历下分公司仓" options={['历下分公司仓', 'CBD园区项目点', '会展中心项目点']} />
                                <Field label="调拨原因" value="项目补货" />
                                <Field label="经办人" value="李岩" />
                                <Field label="装备明细" value="选择库存装备和数量" wide />
                            </div>
                        ),
                    })}>新增调拨</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出调拨记录',
                        subtitle: '导出调拨流向、库存成本和当前状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '调拨单号、调出、调入、明细、库存成本、经办人、状态'], ['用途', '流转核对和项目成本追溯']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['调拨单号', '调出', '调入', '明细数', '装备摘要', '数量合计', '库存成本金额', '经办人', '状态', '操作']}
                    rows={transfers}
                    renderRow={(row: FlowRow) => (
                        <tr key={row.code}>
                            <td className="link-cell">{row.code}</td>
                            <td>{row.from}</td>
                            <td>{row.to}</td>
                            <td>{row.items.length} 项</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td>{row.handler}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待出库'}
                                    actions={[
                                        {
                                            label: row.status === '待出库' ? '确认出库' : row.status === '在途' ? '确认收货' : '查看明细',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: `${row.from} 调拨到 ${row.to}，状态为${row.status}。`,
                                                primary: row.status === '已完成' ? undefined : row.status === '待出库' ? '确认出库' : '确认收货',
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['调出', row.from],
                                                            ['调入', row.to],
                                                            ['经办人', row.handler],
                                                            ['数量合计', numberText(lineQty(row.items))],
                                                            ['库存成本金额', currency(lineAmount(row.items))],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="库存成本" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        { label: '成本去向', onClick: openCosts },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function StocktakePage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <WarehouseScope />
            <FilterBar>
                <Field label="盘点任务号" value="请输入任务号" />
                <SelectLike label="盘点范围" value="全部范围" />
                <SelectLike label="差异状态" value="全部状态" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="库存盘点"
                    subtitle="创建盘点任务，录入实盘数量，形成盘盈盘亏和成本差异处理"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '创建盘点任务',
                        subtitle: '选择仓库和盘点范围，生成账面清单后录入实盘数量。',
                        primary: '创建任务',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="盘点仓库" value="集团总仓" options={['集团总仓', '历下分公司仓', 'CBD园区项目点']} />
                                <SelectLike label="盘点范围" value="重点编号装备" options={['全部装备', '保安员服装', '执勤装备', '重点编号装备']} />
                                <Field label="盘点负责人" value="李岩" />
                                <Field label="计划日期" value="2026-06-20" />
                                <Field label="备注" value="系统生成账面数量，盘点后处理差异。" wide />
                            </div>
                        ),
                    })}>创建盘点任务</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出盘点记录',
                        subtitle: '导出盘点任务、账实差异和处理状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '盘点任务、仓库、范围、账面数、实盘数、差异金额、处理状态'], ['用途', '盘点复核和差异审批']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['盘点任务', '仓库', '范围', '明细数', '装备摘要', '账面数', '实盘数', '差异数', '差异金额', '处理状态', '操作']}
                    rows={stocktakes}
                    renderRow={(row: StocktakeRow) => {
                        const diff = stockDiff(row.items);
                        const diffAmount = stockDiffAmount(row.items);
                        return (
                            <tr key={row.code}>
                                <td className="link-cell">{row.code}</td>
                                <td>{row.warehouse}</td>
                                <td>{row.range}</td>
                                <td>{row.items.length} 项</td>
                                <td>{itemSummary(row.items)}</td>
                                <td>{stockBook(row.items)}</td>
                                <td>{stockActual(row.items)}</td>
                                <td className={diff < 0 ? 'negative' : diff > 0 ? 'positive' : ''}>{diff}</td>
                                <td className={diffAmount < 0 ? 'negative' : diffAmount > 0 ? 'positive' : ''}>{currency(diffAmount)}</td>
                                <td><StatusTag value={row.status} /></td>
                                <td>
                                    <RowActions
                                        allowDelete={row.status !== '已完成'}
                                        actions={[
                                            {
                                                label: row.status === '已完成' ? '查看结果' : row.status === '差异待处理' ? '处理差异' : '审核盘盈',
                                                onClick: () => openWindow({
                                                    title: row.code,
                                                    subtitle: `${row.warehouse} ${row.range}盘点结果，差异需要确认处理。`,
                                                    primary: row.status === '已完成' ? undefined : '确认处理',
                                                    body: (
                                                        <div className="detail-stack">
                                                            <DetailGrid rows={[
                                                                ['仓库', row.warehouse],
                                                                ['盘点范围', row.range],
                                                                ['账面数量', stockBook(row.items)],
                                                                ['实盘数量', stockActual(row.items)],
                                                                ['差异金额', currency(stockDiffAmount(row.items))],
                                                                ['处理状态', <StatusTag value={row.status} />],
                                                            ]} />
                                                            <MiniStocktakeTable items={row.items} />
                                                        </div>
                                                    ),
                                                }),
                                            },
                                            { label: '查看差异成本', onClick: openCosts },
                                        ]}
                                    />
                                </td>
                            </tr>
                        );
                    }}
                />
            </section>
        </>
    );
}

function IssuePage({ openCosts, openWindow }: { openCosts: () => void; openWindow: OpenBusinessWindow }) {
    return (
        <>
            <WarehouseScope />
            <FilterBar>
                <Field label="领用单号" value="请输入领用单号" />
                <SelectLike label="领用对象" value="全部对象" />
                <SelectLike label="状态" value="全部状态" />
                <SelectLike label="成本确认" value="领用价格" />
            </FilterBar>
            <section className="panel">
                <SectionTitle
                    title="出库管理"
                    subtitle="支持项目申领和个人申领，出库后按领用对象归集成本"
                />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增出库单',
                        subtitle: '选择来源仓库、领用对象和装备明细，确认后扣减库存并归集成本。',
                        primary: '提交出库',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="来源仓库" value="历下分公司仓" options={['集团总仓', '历下分公司仓', '高新区分公司仓']} />
                                <SelectLike label="领用对象" value="项目申领：CBD园区项目" options={['项目申领：CBD园区项目', '个人申领：周明', '项目申领：软件园项目']} />
                                <Field label="经办人" value="王队长" />
                                <SelectLike label="成本确认" value="按装备规则自动计算" options={['按装备规则自动计算', '移动加权平均', '批次管理', '单件折旧']} />
                                <Field label="装备明细" value="选择库存装备和数量" wide />
                            </div>
                        ),
                    })}>新增出库单</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出出库记录',
                        subtitle: '导出领用对象、出库成本和当前状态。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '领用单号、来源仓库、领用对象、明细、领用成本、经办人、状态'], ['用途', '项目成本归集和领用交接']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['领用单号', '来源仓库', '领用对象', '明细数', '装备摘要', '数量合计', '领用成本', '经办人', '状态', '操作']}
                    rows={issues}
                    renderRow={(row: FlowRow) => (
                        <tr key={row.code}>
                            <td className="link-cell">{row.code}</td>
                            <td>{row.from}</td>
                            <td>{row.to}</td>
                            <td>{row.items.length} 项</td>
                            <td>{itemSummary(row.items)}</td>
                            <td>{numberText(lineQty(row.items))}</td>
                            <td>{currency(lineAmount(row.items))}</td>
                            <td>{row.handler}</td>
                            <td><StatusTag value={row.status} /></td>
                            <td>
                                <RowActions
                                    allowDelete={row.status === '待出库'}
                                    actions={[
                                        {
                                            label: row.status === '待出库' ? '确认出库' : '查看领用',
                                            onClick: () => openWindow({
                                                title: row.code,
                                                subtitle: `${row.from} 出库给 ${row.to}，出库后进入项目成本。`,
                                                primary: row.status === '待出库' ? '确认出库' : undefined,
                                                body: (
                                                    <div className="detail-stack">
                                                        <DetailGrid rows={[
                                                            ['来源仓库', row.from],
                                                            ['领用对象', row.to],
                                                            ['经办人', row.handler],
                                                            ['数量合计', numberText(lineQty(row.items))],
                                                            ['领用成本', currency(lineAmount(row.items))],
                                                            ['状态', <StatusTag value={row.status} />],
                                                        ]} />
                                                        <MiniLineTable items={row.items} amountLabel="领用成本" />
                                                    </div>
                                                ),
                                            }),
                                        },
                                        {
                                            label: '查看成本',
                                            onClick: () => openWindow({
                                                title: `${row.code}成本确认明细`,
                                                subtitle: '按装备档案规则展示移动加权、批次管理和单件折旧的项目归集依据。',
                                                body: <CostTraceDetail rows={tracesForSource(row.code).length ? tracesForSource(row.code) : costTraceRows.slice(0, 3)} />,
                                            }),
                                        },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function CostPage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    const total = costTraceRows.reduce((sum, row) => sum + row.amount, 0);
    return (
        <>
            <div className="stats-grid compact">
                <StatCard title="本月已归集" value={currency(total)} note="按领用、批次和折旧明细汇总" icon={BarChart3} tone="blue" />
                <StatCard title="成本明细" value={`${costTraceRows.length} 条`} note="可追溯来源单据、批次或编号" icon={Building2} tone="green" />
                <StatCard title="折旧归集" value={currency(costTraceRows.filter((row) => row.method === '单件折旧').reduce((sum, row) => sum + row.amount, 0))} note="按领用到归还期间计算" icon={ShieldCheck} tone="orange" />
            </div>
            <FilterBar>
                <SelectLike label="项目" value="全部项目" />
                <SelectLike label="成本方式" value="全部方式" />
                <Field label="来源单据" value="请输入领用/调拨/入库单号" />
                <Field label="装备编号/批次" value="请输入编号或批次号" />
                <SelectLike label="成本月份" value="2026-06" />
            </FilterBar>
            <section className="panel">
                <SectionTitle title="项目成本归集明细" subtitle="项目成本不在采购计划阶段确认，在领用、调拨到项目点或消耗时按移动加权、批次管理或单件折旧归集" />
                <div className="table-toolbar">
                    <button type="button" className="primary-btn" onClick={() => openWindow({
                        title: '新增成本归集',
                        subtitle: '用于补录线下确认或特殊调整后的项目成本归集记录。',
                        primary: '保存归集',
                        body: (
                            <div className="modal-form embedded-form">
                                <SelectLike label="项目" value="CBD园区项目" options={['CBD园区项目', '会展中心项目', '软件园项目', '大学城项目']} />
                                <SelectLike label="成本方式" value="移动加权平均" options={['移动加权平均', '批次管理', '单件折旧', '手工调整']} />
                                <Field label="来源单据" value="请输入来源单据号" />
                                <Field label="归集金额" value="请输入金额" />
                                <Field label="归集说明" value="说明成本归属和调整原因" wide />
                            </div>
                        ),
                    })}>新增成本归集</button>
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出成本归集',
                        subtitle: '导出项目成本、计价方式、来源单据、批次和装备编号。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '项目、装备、数量、计价方式、来源单据、批次/编号、归集金额'], ['用途', '项目成本核算和经营分析']]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['项目', '来源单据', '装备', '数量', '计价方式', '归集时间', '归集金额', '可追溯来源', '操作']}
                    rows={costTraceRows}
                    renderRow={(row: CostTraceRow) => (
                        <tr key={`${row.project}-${row.source}-${row.item}`}>
                            <td className="link-cell">{row.project}</td>
                            <td>{row.source}</td>
                            <td>{row.item}</td>
                            <td>{numberText(row.qty)} {row.unit}</td>
                            <td>{row.method}</td>
                            <td>{row.collectTime}</td>
                            <td>{currency(row.amount)}</td>
                            <td>{row.trace}</td>
                            <td>
                                <RowActions
                                    allowDelete={false}
                                    actions={[
                                        {
                                            label: '查看明细',
                                            onClick: () => openWindow({
                                                title: `${row.project} / ${row.item}`,
                                                subtitle: '查看项目成本的来源单据、计价口径和计算过程。',
                                                body: <CostTraceDetail rows={[row]} />,
                                            }),
                                        },
                                        {
                                            label: '调整归集',
                                            onClick: () => openWindow({
                                                title: '调整成本归集',
                                                subtitle: `${row.project} 的成本调整需要保留来源单据和调整原因。`,
                                                primary: '提交调整',
                                                body: (
                                                    <div className="modal-form embedded-form">
                                                        <Field label="项目" value={row.project} />
                                                        <Field label="来源单据" value={row.source} />
                                                        <Field label="装备" value={row.item} />
                                                        <Field label="调整金额" value="请输入调整金额" />
                                                        <SelectLike label="调整原因" value="单据归属修正" options={['单据归属修正', '盘点差异确认', '领用退回', '成本中心变更']} />
                                                        <Field label="说明" value="调整后保留原始来源和操作记录" wide />
                                                    </div>
                                                ),
                                            }),
                                        },
                                    ]}
                                />
                            </td>
                        </tr>
                    )}
                />
            </section>
        </>
    );
}

function PageContent({ page, openPage, openWindow }: { page: PageId; openPage: (page: PageId) => void; openWindow: OpenBusinessWindow }) {
    switch (page) {
        case 'dashboard':
            return <Dashboard openPage={openPage} />;
        case 'archive':
            return <ArchivePage openWindow={openWindow} />;
        case 'warehouses':
            return <WarehousePage openWindow={openWindow} />;
        case 'inventory':
            return <InventoryPage openWindow={openWindow} />;
        case 'purchase':
            return <PurchasePage openPage={openPage} openWindow={openWindow} />;
        case 'inbound':
            return <InboundPage openInventory={() => openPage('inventory')} openWindow={openWindow} />;
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

export default function EquipmentManagementPrototype() {
    const { page: routePage, setPage } = useHashPage(equipmentRoute);
    const page = pageMeta[routePage as PageId] ? routePage as PageId : 'dashboard';
    const [visited, setVisited] = useState<PageId[]>(['dashboard']);
    const [businessWindow, setBusinessWindow] = useState<BusinessWindowState | null>(null);

    const current = pageMeta[page];
    const tabs = useMemo(() => visited.map((id) => ({ id, label: pageMeta[id].label })), [visited]);

    useEffect(() => {
        setVisited((items) => (items.includes(page) ? items : [...items, page].slice(-7)));
    }, [page]);

    function openPage(id: PageId) {
        setPage(id);
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
                                className={page === id ? 'active submenu-item' : 'submenu-item'}
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

                <main className="main-content">
                    <div className="page-heading">
                        <div>
                            <span>{current.group}</span>
                            <h1>{current.label}</h1>
                        </div>
                    </div>
                    <PageContent page={page} openPage={openPage} openWindow={setBusinessWindow} />
                </main>
            </div>
            {businessWindow && <BusinessWindow window={businessWindow} onClose={() => setBusinessWindow(null)} />}
        </div>
    );
}
