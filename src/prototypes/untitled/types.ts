import React from 'react';

export type PageId =
    | 'dashboard'
    | 'archive'
    | 'warehouses'
    | 'inventory'
    | 'purchase'
    | 'purchase-demand-create'
    | 'purchase-demand-view'
    | 'purchase-plan-create'
    | 'purchase-plan-view'
    | 'inbound'
    | 'transfer'
    | 'stocktake'
    | 'issue'
    | 'costs';

export type PurchaseTab = 'demand' | 'plans' | 'orders';

export type StatusTone = 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple';

export interface EquipmentItem {
    name: string;
    itemCode: string;
    category: string;
    spec: string;
    unit: string;
    supplier: string;
    oneCode: boolean;
    costMethod: string;
    depreciation: string;
    depreciationRule: string;
    status: string;
    key: boolean;
    standard: string;
    stock: number;
}

export interface NumberedAsset {
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

export interface CategoryRow {
    name: string;
    parent: string;
    level: string;
    code: string;
    itemCount: number;
    status: string;
}

export interface WarehouseRow {
    name: string;
    type: string;
    org: string;
    manager: string;
    skuCount: number;
    amount: number;
    status: string;
}

export interface LineItem {
    name: string;
    qty: number;
    unit: string;
    amount: number;
}

export interface PlanItem extends LineItem {
    orderAmount: number;
}

export interface PurchasePlanLine {
    demandCode: string;
    name: string;
    category: string;
    mode: string;
    demandQty: number;
    includedQty: number;
    planQty: number;
    budgetPrice: number;
    budgetAmount: number;
}

export interface StocktakeItem {
    name: string;
    book: number;
    actual: number;
    unitCost: number;
}

export interface DemandRow {
    code: string;
    branch: string;
    project: string;
    items: LineItem[];
    type: string;
    due: string;
    status: string;
    auditStatus: string;
    planIncludeStatus: string;
}

export interface PlanRow {
    code: string;
    mode: string;
    source: string;
    items: PlanItem[];
    status: string;
    auditStatus: string;
    orderImportStatus: string;
    relatedDemandCodes: string[];
}

export interface PurchaseDemandLine {
    name: string;
    category: string;
    spec: string;
    unit: string;
    supplier: string;
    stock: number;
    warningQty?: number;
    referencePrice: number;
    qty: number;
}

export interface ApprovalStep {
    title: string;
    time: string;
    actor: string;
    status: string;
    tone: StatusTone;
    comment?: string;
}

export interface OrderRow {
    jdOrder: string;
    plan: string;
    batch: string;
    supplier: string;
    importedAt: string;
    purchaseMethod: string;
    allocationMethod: string;
    items: LineItem[];
    match: string;
    allocationStatus: string;
    status: string;
}

export interface InventoryRow {
    warehouse: string;
    item: string;
    category: string;
    bookQty: number;
    warningQty: number;
    trend: number[];
    unitCost: number;
    amount: number;
    warning: string;
    method: string;
}

export interface FlowRow {
    code: string;
    from: string;
    to: string;
    items: LineItem[];
    handler: string;
    status: string;
}

export interface DemandPlanAllocation {
    demandCode: string;
    itemName: string;
    planCode: string;
    includedQty: number;
    planQty: number;
}

export interface PlanOrderImport {
    planCode: string;
    orderCode: string;
    batch: string;
    supplier: string;
    importedAt: string;
}

export interface OrderWarehouseAllocation {
    orderCode: string;
    planCode: string;
    demandCode: string;
    warehouse: string;
    itemName: string;
    demandQty: number;
    includedQty: number;
    orderQty: number;
    allocatedQty: number;
    manualAdjustQty: number;
    inboundCode: string;
    inboundStatus: string;
}

export interface InboundTrace {
    inboundCode: string;
    orderCode: string;
    planCode: string;
    demandCodes: string[];
}

export type TraceContextType = 'demand' | 'demand-line' | 'plan' | 'plan-line' | 'order' | 'inbound';

export interface TraceContext {
    type: TraceContextType;
    code: string;
    itemName?: string;
    orderCode?: string;
    inboundCode?: string;
}

export interface TraceRelationRow {
    demandCode: string;
    branch: string;
    warehouse: string;
    itemName: string;
    demandQty: number;
    unit: string;
    includedQty: number;
    planCode: string;
    planQty: number;
    orderCode: string;
    batch: string;
    orderQty: number;
    allocatedQty: number;
    inboundCode: string;
    inboundWarehouse: string;
    inboundStatus: string;
}

export interface StocktakeRow {
    code: string;
    warehouse: string;
    range: string;
    items: StocktakeItem[];
    status: string;
}

export interface CostRow {
    project: string;
    branch: string;
    monthCost: number;
    clothing: number;
    duty: number;
    protection: number;
    source: string;
    method: string;
}

export interface BatchCostDetail {
    batch: string;
    inbound: string;
    order: string;
    inboundAt: string;
    batchQty: number;
    issuedQty: number;
    unitCost: number;
    amount: number;
}

export interface DepreciationCostDetail {
    assetCode: string;
    originalCost: number;
    startAt: string;
    returnAt: string;
    useDays: number;
    rate: string;
    amount: number;
    netValue: number;
}

export interface CostTraceRow {
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

export interface ActionItem {
    label: string;
    danger?: boolean;
    disabled?: boolean;
    title?: string;
    onClick?: () => void;
}

export interface BusinessWindowState {
    title: string;
    subtitle: string;
    body: React.ReactNode;
    primary?: string;
}

export type OpenBusinessWindow = (window: BusinessWindowState) => void;

export interface TraceRelationActions {
    openDemandView?: (row: DemandRow) => void;
    openPlanView?: (row: PlanRow) => void;
    openOrderDetail?: (row: OrderRow) => void;
    openTraceRelation?: (context: TraceContext) => void;
}
