import {
    EquipmentItem,
    LineItem,
    PlanItem,
    PurchasePlanLine,
    StocktakeItem,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    OrderRow,
    InventoryRow,
    FlowRow,
    TraceContextType,
    TraceContext,
    TraceRelationRow,
} from './types';
import {
    equipmentItems,
    referencePriceByItem,
    warningQtyByItem,
    demands,
    plans,
    orders,
    inventory,
    demandPlanAllocations,
    orderWarehouseAllocations,
    inboundTraces,
} from './data';

export function currency(value: number) {
    return `¥${value.toLocaleString('zh-CN')}`;
}

export function numberText(value: number) {
    return value.toLocaleString('zh-CN');
}

export function lineQty(items: LineItem[]) {
    return items.reduce((sum, item) => sum + item.qty, 0);
}

export function lineAmount(items: LineItem[]) {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

export function planOrderAmount(items: PlanItem[]) {
    return items.reduce((sum, item) => sum + item.orderAmount, 0);
}

export function planVariance(items: PlanItem[]) {
    const budget = lineAmount(items);
    if (!budget) {
        return '-';
    }
    const rate = ((planOrderAmount(items) - budget) / budget) * 100;
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export function planBudgetTotal(lines: PurchasePlanLine[]) {
    return lines.reduce((sum, line) => sum + line.budgetAmount, 0);
}

export function demandWarehouse(row: DemandRow) {
    if (row.branch === '历下分公司') {
        return '历下分公司仓';
    }
    if (row.branch === '高新区分公司') {
        return '高新区分公司仓';
    }
    if (row.branch === '市中分公司') {
        return '会展中心项目点';
    }
    if (row.branch === '历城分公司') {
        return '历城分公司仓';
    }
    if (row.branch === '章丘分公司') {
        return '章丘分公司仓';
    }
    return '集团总仓';
}

export function allocationsForDemandItem(demandCode: string, itemName: string) {
    return demandPlanAllocations.filter((allocation) => (
        allocation.demandCode === demandCode && allocation.itemName === itemName
    ));
}

export function demandItemAllocationSummary(row: DemandRow, item: LineItem) {
    const allocations = allocationsForDemandItem(row.code, item.name);
    const includedQty = allocations.reduce((sum, allocation) => sum + allocation.includedQty, 0);
    const remainingQty = Math.max(item.qty - includedQty, 0);
    const status = includedQty <= 0 ? '未纳入' : remainingQty > 0 ? '部分纳入' : '全部纳入';

    return {
        demandQty: item.qty,
        includedQty,
        remainingQty,
        status,
        allocations,
    };
}

export function demandAllocationTotals(row: DemandRow) {
    const demandQty = lineQty(row.items);
    const includedQty = row.items.reduce((sum, item) => sum + demandItemAllocationSummary(row, item).includedQty, 0);
    const remainingQty = Math.max(demandQty - includedQty, 0);
    const status = includedQty <= 0 ? '未纳入' : remainingQty > 0 ? '部分纳入' : '全部纳入';

    return { demandQty, includedQty, remainingQty, status };
}

export function displayDemandIncludeStatus(row: DemandRow) {
    return row.auditStatus === '审核通过' ? demandAllocationTotals(row).status : '--';
}

export function planByCode(code: string) {
    return plans.find((plan) => plan.code === code);
}

export function demandByCode(code: string) {
    return demands.find((demand) => demand.code === code);
}

export function relatedPlansForDemand(row: DemandRow) {
    const codes = Array.from(new Set(
        demandPlanAllocations
            .filter((allocation) => allocation.demandCode === row.code)
            .map((allocation) => allocation.planCode),
    ));

    return codes
        .map((code) => planByCode(code))
        .filter((plan): plan is PlanRow => Boolean(plan));
}

export function relatedOrdersForPlan(row: PlanRow) {
    return orders.filter((order) => order.plan === row.code);
}

export function planImportedQty(row: PlanRow) {
    return relatedOrdersForPlan(row).reduce((sum, order) => sum + lineQty(order.items), 0);
}

export function planOrderAmountFromOrders(row: PlanRow) {
    return relatedOrdersForPlan(row).reduce((sum, order) => sum + lineAmount(order.items), 0);
}

export function planOrderVarianceFromOrders(row: PlanRow) {
    const budget = lineAmount(row.items);
    if (!budget) {
        return '-';
    }

    const rate = ((planOrderAmountFromOrders(row) - budget) / budget) * 100;
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export function displayPlanOrderImportStatus(row: PlanRow) {
    if (row.auditStatus !== '审核通过') {
        return '--';
    }

    const relatedOrders = relatedOrdersForPlan(row);
    if (!relatedOrders.length) {
        return '未导入';
    }

    const hasUnmatched = relatedOrders.some((order) => order.match !== '已匹配');
    if (hasUnmatched || planImportedQty(row) < lineQty(row.items)) {
        return '部分导入';
    }

    return '已导入';
}

export function inboundTraceForRow(row: FlowRow) {
    return inboundTraces.find((trace) => trace.inboundCode === row.code);
}

export function demandItemInboundAllocations(demandCode: string, itemName: string) {
    return orderWarehouseAllocations.filter((allocation) => (
        allocation.demandCode === demandCode && allocation.itemName === itemName
    ));
}

export function orderAllocations(row: OrderRow) {
    return orderWarehouseAllocations.filter((allocation) => allocation.orderCode === row.jdOrder);
}

export function demandItemByCode(demandCode: string, itemName: string) {
    return demandByCode(demandCode)?.items.find((item) => item.name === itemName);
}

export function relationStatus(row: TraceRelationRow) {
    if (!row.planCode) {
        return '未纳入';
    }
    if (!row.orderCode) {
        return '待导入订单';
    }
    if (!row.inboundCode) {
        return '待分配';
    }
    return row.inboundStatus || '待入库';
}

export function contextTitle(context: TraceContext) {
    const itemSuffix = context.itemName ? ` / ${context.itemName}` : '';
    const titles: Record<TraceContextType, string> = {
        demand: '采购需求链路关系',
        'demand-line': '采购需求明细链路关系',
        plan: '采购计划链路关系',
        'plan-line': '采购计划明细链路关系',
        order: '采购订单链路关系',
        inbound: '入库单链路关系',
    };

    return `${titles[context.type]}：${context.code}${itemSuffix}`;
}

export function tracePlanAllocations(context: TraceContext) {
    if (context.type === 'demand' || context.type === 'demand-line') {
        return demandPlanAllocations.filter((allocation) => (
            allocation.demandCode === context.code
            && (!context.itemName || allocation.itemName === context.itemName)
        ));
    }

    if (context.type === 'plan' || context.type === 'plan-line') {
        return demandPlanAllocations.filter((allocation) => (
            allocation.planCode === context.code
            && (!context.itemName || allocation.itemName === context.itemName)
        ));
    }

    const matchedOrderAllocations = orderWarehouseAllocations.filter((allocation) => {
        if (context.type === 'order') {
            return allocation.orderCode === (context.orderCode || context.code)
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        if (context.type === 'inbound') {
            return allocation.inboundCode === (context.inboundCode || context.code)
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        return false;
    });

    const keys = new Set(matchedOrderAllocations.map((allocation) => (
        `${allocation.demandCode}__${allocation.planCode}__${allocation.itemName}`
    )));

    return demandPlanAllocations.filter((allocation) => (
        keys.has(`${allocation.demandCode}__${allocation.planCode}__${allocation.itemName}`)
    ));
}

export function traceOrderAllocations(context: TraceContext) {
    return orderWarehouseAllocations.filter((allocation) => {
        if (context.type === 'demand' || context.type === 'demand-line') {
            return allocation.demandCode === context.code
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        if (context.type === 'plan' || context.type === 'plan-line') {
            return allocation.planCode === context.code
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        if (context.type === 'order') {
            return allocation.orderCode === (context.orderCode || context.code)
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        if (context.type === 'inbound') {
            return allocation.inboundCode === (context.inboundCode || context.code)
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        return false;
    });
}

export function demandItemsForTrace(context: TraceContext) {
    if (context.type !== 'demand' && context.type !== 'demand-line') {
        return [];
    }

    const demand = demandByCode(context.code);
    if (!demand) {
        return [];
    }

    return demand.items.filter((item) => !context.itemName || item.name === context.itemName).map((item) => ({
        demand,
        item,
    }));
}

export function traceRelationRows(context: TraceContext): TraceRelationRow[] {
    const rows: TraceRelationRow[] = [];
    const orderAllocations = traceOrderAllocations(context);
    const usedOrderAllocationKeys = new Set<string>();

    tracePlanAllocations(context).forEach((allocation) => {
        const demand = demandByCode(allocation.demandCode);
        const demandItem = demandItemByCode(allocation.demandCode, allocation.itemName);
        const matches = orderAllocations.filter((orderAllocation) => (
            orderAllocation.demandCode === allocation.demandCode
            && orderAllocation.planCode === allocation.planCode
            && orderAllocation.itemName === allocation.itemName
        ));

        if (!matches.length) {
            rows.push({
                demandCode: allocation.demandCode,
                branch: demand?.branch || '--',
                warehouse: demand ? demandWarehouse(demand) : '--',
                itemName: allocation.itemName,
                demandQty: demandItem?.qty || allocation.includedQty,
                unit: demandItem?.unit || '件',
                includedQty: allocation.includedQty,
                planCode: allocation.planCode,
                planQty: allocation.planQty,
                orderCode: '',
                batch: '',
                orderQty: 0,
                allocatedQty: 0,
                inboundCode: '',
                inboundWarehouse: '',
                inboundStatus: '',
            });
            return;
        }

        matches.forEach((orderAllocation) => {
            usedOrderAllocationKeys.add(`${orderAllocation.orderCode}__${orderAllocation.demandCode}__${orderAllocation.planCode}__${orderAllocation.itemName}__${orderAllocation.warehouse}__${orderAllocation.inboundCode}`);
            const order = orders.find((item) => item.jdOrder === orderAllocation.orderCode);
            rows.push({
                demandCode: allocation.demandCode,
                branch: demand?.branch || '--',
                warehouse: demand ? demandWarehouse(demand) : orderAllocation.warehouse,
                itemName: allocation.itemName,
                demandQty: demandItem?.qty || orderAllocation.demandQty,
                unit: demandItem?.unit || '件',
                includedQty: allocation.includedQty,
                planCode: allocation.planCode,
                planQty: allocation.planQty,
                orderCode: orderAllocation.orderCode,
                batch: order?.batch || '--',
                orderQty: orderAllocation.orderQty,
                allocatedQty: orderAllocation.allocatedQty,
                inboundCode: orderAllocation.inboundCode,
                inboundWarehouse: orderAllocation.warehouse,
                inboundStatus: orderAllocation.inboundStatus,
            });
        });
    });

    orderAllocations.forEach((orderAllocation) => {
        const key = `${orderAllocation.orderCode}__${orderAllocation.demandCode}__${orderAllocation.planCode}__${orderAllocation.itemName}__${orderAllocation.warehouse}__${orderAllocation.inboundCode}`;
        if (usedOrderAllocationKeys.has(key)) {
            return;
        }

        const demand = demandByCode(orderAllocation.demandCode);
        const demandItem = demandItemByCode(orderAllocation.demandCode, orderAllocation.itemName);
        const order = orders.find((item) => item.jdOrder === orderAllocation.orderCode);

        rows.push({
            demandCode: orderAllocation.demandCode,
            branch: demand?.branch || '--',
            warehouse: demand ? demandWarehouse(demand) : orderAllocation.warehouse,
            itemName: orderAllocation.itemName,
            demandQty: demandItem?.qty || orderAllocation.demandQty,
            unit: demandItem?.unit || '件',
            includedQty: orderAllocation.includedQty,
            planCode: orderAllocation.planCode,
            planQty: orderAllocation.includedQty,
            orderCode: orderAllocation.orderCode,
            batch: order?.batch || '--',
            orderQty: orderAllocation.orderQty,
            allocatedQty: orderAllocation.allocatedQty,
            inboundCode: orderAllocation.inboundCode,
            inboundWarehouse: orderAllocation.warehouse,
            inboundStatus: orderAllocation.inboundStatus,
        });
    });

    demandItemsForTrace(context).forEach(({ demand, item }) => {
        const hasExistingRow = rows.some((row) => row.demandCode === demand.code && row.itemName === item.name);
        if (hasExistingRow) {
            return;
        }

        rows.push({
            demandCode: demand.code,
            branch: demand.branch,
            warehouse: demandWarehouse(demand),
            itemName: item.name,
            demandQty: item.qty,
            unit: item.unit,
            includedQty: 0,
            planCode: '',
            planQty: 0,
            orderCode: '',
            batch: '',
            orderQty: 0,
            allocatedQty: 0,
            inboundCode: '',
            inboundWarehouse: '',
            inboundStatus: '',
        });
    });

    if (!rows.length && context.type === 'order') {
        const order = orders.find((item) => item.jdOrder === (context.orderCode || context.code));
        order?.items
            .filter((item) => !context.itemName || item.name === context.itemName)
            .forEach((item) => {
                rows.push({
                    demandCode: '--',
                    branch: '--',
                    warehouse: '--',
                    itemName: item.name,
                    demandQty: 0,
                    unit: item.unit,
                    includedQty: 0,
                    planCode: order.plan,
                    planQty: 0,
                    orderCode: order.jdOrder,
                    batch: order.batch,
                    orderQty: item.qty,
                    allocatedQty: 0,
                    inboundCode: '',
                    inboundWarehouse: '',
                    inboundStatus: '',
                });
            });
    }

    return rows;
}

export function sumUnique<T>(items: T[], keyForItem: (item: T) => string, valueForItem: (item: T) => number) {
    const seen = new Set<string>();
    return items.reduce((sum, item) => {
        const key = keyForItem(item);
        if (seen.has(key)) {
            return sum;
        }
        seen.add(key);
        return sum + valueForItem(item);
    }, 0);
}

export function traceSummary(rows: TraceRelationRow[]) {
    return {
        demandQty: sumUnique(rows, (row) => `${row.demandCode}__${row.itemName}`, (row) => row.demandQty),
        includedQty: sumUnique(rows, (row) => `${row.demandCode}__${row.planCode}__${row.itemName}`, (row) => row.includedQty),
        planQty: sumUnique(rows, (row) => `${row.demandCode}__${row.planCode}__${row.itemName}`, (row) => row.planQty),
        orderQty: sumUnique(rows, (row) => `${row.orderCode}__${row.itemName}`, (row) => row.orderQty),
        inboundQty: rows.reduce((sum, row) => sum + row.allocatedQty, 0),
    };
}

export function stockBook(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + item.book, 0);
}

export function stockActual(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + item.actual, 0);
}

export function stockDiff(items: StocktakeItem[]) {
    return stockActual(items) - stockBook(items);
}

export function stockDiffAmount(items: StocktakeItem[]) {
    return items.reduce((sum, item) => sum + (item.actual - item.book) * item.unitCost, 0);
}

export function itemSummary(items: Array<LineItem | StocktakeItem>) {
    const names = items.map((item) => item.name);
    if (names.length <= 2) {
        return names.join('、');
    }
    return `${names.slice(0, 2).join('、')}等${names.length}项`;
}

export function toPurchaseDemandLine(item: EquipmentItem, qty = 0, warningQty?: number, stock = item.stock): PurchaseDemandLine {
    return {
        name: item.name,
        category: item.category,
        spec: item.spec,
        unit: item.unit,
        supplier: item.supplier,
        stock,
        warningQty,
        referencePrice: referencePriceByItem[item.name] || 0,
        qty,
    };
}

export function warningLinesByWarehouse(warehouse: string): PurchaseDemandLine[] {
    return inventory
        .filter((row) => row.warehouse === warehouse && inventoryShortage(row) > 0)
        .map((row) => {
            const item = equipmentItems.find((equipment) => equipment.name === row.item);
            const warningQty = row.warningQty || warningQtyByItem[row.item] || row.bookQty;
            const qty = inventoryShortage(row);
            return item
                ? toPurchaseDemandLine(item, qty, warningQty, row.bookQty)
                : {
                    name: row.item,
                    category: row.category,
                    spec: '--',
                    unit: '件',
                    supplier: '--',
                    stock: row.bookQty,
                    warningQty,
                    referencePrice: row.unitCost,
                    qty,
                };
        });
}

export function inventoryShortage(row: InventoryRow) {
    return Math.max(row.warningQty - row.bookQty, 0);
}

export function inventoryWarningStatus(row: InventoryRow) {
    return inventoryShortage(row) > 0 ? '低库存' : '正常';
}

export function demandLineItemsToPurchaseLines(items: LineItem[]): PurchaseDemandLine[] {
    return items.map((line) => {
        const equipment = equipmentItems.find((item) => item.name === line.name);
        const referencePrice = line.qty ? Math.round((line.amount / line.qty) * 100) / 100 : referencePriceByItem[line.name] || 0;

        return {
            name: line.name,
            category: equipment?.category || '--',
            spec: equipment?.spec || '--',
            unit: line.unit,
            supplier: equipment?.supplier || '--',
            stock: equipment?.stock || 0,
            warningQty: warningQtyByItem[line.name],
            referencePrice,
            qty: line.qty,
        };
    });
}

export function toPurchasePlanLine(
    item: LineItem,
    options?: { demandCode?: string; mode?: string; category?: string; demandQty?: number; includedQty?: number; planQty?: number },
): PurchasePlanLine {
    const equipment = equipmentItems.find((equipmentItem) => equipmentItem.name === item.name);
    const budgetPrice = item.qty ? Math.round((item.amount / item.qty) * 100) / 100 : referencePriceByItem[item.name] || 0;
    const demandQty = options?.demandQty ?? item.qty;
    const includedQty = options?.includedQty ?? item.qty;
    const planQty = options?.planQty ?? item.qty;

    return {
        demandCode: options?.demandCode || '--',
        name: item.name,
        category: options?.category || equipment?.category || '--',
        mode: options?.mode || '集团集采',
        demandQty,
        includedQty,
        planQty,
        budgetPrice,
        budgetAmount: budgetPrice * planQty,
    };
}

export function demandRowsToPlanLines(rows: DemandRow[]): PurchasePlanLine[] {
    return rows.flatMap((row) => (
        row.items.map((item) => {
            const summary = demandItemAllocationSummary(row, item);
            const remainingQty = summary.remainingQty;
            const planQty = item.name === '执勤帽' && remainingQty === 490 ? 500 : remainingQty;

            return toPurchasePlanLine(item, {
                demandCode: row.code,
                mode: row.type,
                demandQty: item.qty,
                includedQty: remainingQty,
                planQty,
            });
        }).filter((line) => line.includedQty > 0)
    ));
}

export function planItemsToPlanLines(row: PlanRow): PurchasePlanLine[] {
    const allocations = demandPlanAllocations.filter((allocation) => allocation.planCode === row.code);
    if (allocations.length) {
        return allocations.map((allocation) => {
            const demand = demandByCode(allocation.demandCode);
            const demandItem = demand?.items.find((item) => item.name === allocation.itemName);
            const budgetPrice = demandItem?.qty ? Math.round((demandItem.amount / demandItem.qty) * 100) / 100 : referencePriceByItem[allocation.itemName] || 0;

            return toPurchasePlanLine({
                name: allocation.itemName,
                qty: allocation.planQty,
                unit: demandItem?.unit || '件',
                amount: budgetPrice * allocation.planQty,
            }, {
                demandCode: allocation.demandCode,
                mode: row.mode,
                demandQty: demandItem?.qty || allocation.includedQty,
                includedQty: allocation.includedQty,
                planQty: allocation.planQty,
            });
        });
    }

    const demandCode = row.relatedDemandCodes[0] || '--';
    return row.items.map((item) => toPurchasePlanLine(item, {
        demandCode,
        mode: row.mode,
        demandQty: item.qty,
        includedQty: item.qty,
        planQty: item.qty,
    }));
}

export function relatedDemandsForPlan(row: PlanRow): DemandRow[] {
    return row.relatedDemandCodes
        .map((code) => demands.find((demand) => demand.code === code))
        .filter((demand): demand is DemandRow => Boolean(demand));
}
