import {
    EquipmentItem,
    LineItem,
    PlanItem,
    PurchasePlanLine,
    StocktakeItem,
    DemandRow,
    PlanRow,
    PurchaseDemandLine,
    DraftPurchaseOrder,
    DraftPurchaseOrderLine,
    DraftInboundOrder,
    DraftInboundLine,
    DraftInboundValidationResult,
    GenerateOrderMode,
    OrderInboundLineSummary,
    OrderRow,
    InventoryRow,
    FlowRow,
    OrderWarehouseAllocation,
    InboundTrace,
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
    warehouses,
    inventory,
    demandPlanAllocations,
    orderWarehouseAllocations,
    inboundRows,
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

export function moneyToCents(value: number) {
    return Math.round(value * 100);
}

export function centsToMoney(value: number) {
    return Math.round(value) / 100;
}

export function orderFinanceSummary(row: OrderRow) {
    const orderAmountCents = moneyToCents(lineAmount(row.items));
    const paymentTotalCents = (row.paymentRecords || []).reduce((sum, record) => sum + moneyToCents(record.amount), 0);
    const invoiceTotalCents = (row.invoiceRecords || []).reduce((sum, record) => sum + moneyToCents(record.amount), 0);
    const paymentRemainingCents = Math.max(orderAmountCents - paymentTotalCents, 0);
    const invoiceRemainingCents = Math.max(orderAmountCents - invoiceTotalCents, 0);
    const paymentStatus = paymentTotalCents <= 0
        ? '未付款'
        : orderAmountCents > 0 && paymentTotalCents >= orderAmountCents
            ? '已付款'
            : '部分付款';
    const invoiceStatus = invoiceTotalCents <= 0
        ? '未开票'
        : orderAmountCents > 0 && invoiceTotalCents >= orderAmountCents
            ? '已开票'
            : '部分开票';

    return {
        orderAmount: centsToMoney(orderAmountCents),
        paymentTotal: centsToMoney(paymentTotalCents),
        invoiceTotal: centsToMoney(invoiceTotalCents),
        paymentRemaining: centsToMoney(paymentRemainingCents),
        invoiceRemaining: centsToMoney(invoiceRemainingCents),
        paymentStatus,
        invoiceStatus,
        paymentComplete: orderAmountCents > 0 && paymentTotalCents >= orderAmountCents,
        invoiceComplete: orderAmountCents > 0 && invoiceTotalCents >= orderAmountCents,
    };
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

export function canGeneratePurchasePlan(row: DemandRow) {
    return row.auditStatus === '审核通过' && demandAllocationTotals(row).remainingQty > 0;
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

export function relatedOrdersForPlan(row: PlanRow, orderRows: OrderRow[] = orders) {
    return orderRows.filter((order) => order.plan === row.code);
}

export function planImportedQty(row: PlanRow, orderRows: OrderRow[] = orders) {
    return relatedOrdersForPlan(row, orderRows).reduce((sum, order) => sum + lineQty(order.items), 0);
}

export function planOrderAmountFromOrders(row: PlanRow, orderRows: OrderRow[] = orders) {
    return relatedOrdersForPlan(row, orderRows).reduce((sum, order) => sum + lineAmount(order.items), 0);
}

export function planOrderVarianceFromOrders(row: PlanRow, orderRows: OrderRow[] = orders) {
    const budget = lineAmount(row.items);
    if (!budget) {
        return '-';
    }

    const rate = ((planOrderAmountFromOrders(row, orderRows) - budget) / budget) * 100;
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`;
}

export function displayPlanOrderGenerationStatus(row: PlanRow, orderRows: OrderRow[] = orders) {
    if (row.auditStatus !== '审核通过') {
        return '--';
    }

    const relatedOrders = relatedOrdersForPlan(row, orderRows);
    if (!relatedOrders.length) {
        return '未生成';
    }

    if (planImportedQty(row, orderRows) < lineQty(row.items)) {
        return '部分生成';
    }

    return '已生成';
}

export function inboundTraceForRow(row: FlowRow) {
    return inboundTraces.find((trace) => trace.inboundCode === row.code);
}

export function demandItemInboundAllocations(demandCode: string, itemName: string) {
    return orderWarehouseAllocations.filter((allocation) => (
        allocation.demandCode === demandCode && allocation.itemName === itemName
    ));
}

export function inboundRowsForDemandItem(demandCode: string, itemName: string, rows: FlowRow[] = inboundRows) {
    const codes = inboundTraces
        .filter((trace) => trace.demandCodes.includes(demandCode))
        .map((trace) => trace.inboundCode);

    return rows.filter((row) => (
        codes.includes(row.code)
        && row.items.some((item) => item.name === itemName)
    ));
}

export function demandItemGeneratedInboundSummary(demandCode: string, itemName: string, rows: FlowRow[] = inboundRows) {
    const relatedRows = inboundRowsForDemandItem(demandCode, itemName, rows);
    const generatedQty = relatedRows.reduce((sum, row) => (
        sum + row.items
            .filter((item) => item.name === itemName)
            .reduce((itemSum, item) => itemSum + item.qty, 0)
    ), 0);
    const actualInboundQty = relatedRows
        .filter((row) => row.status !== '待入库')
        .reduce((sum, row) => (
            sum + row.items
                .filter((item) => item.name === itemName)
                .reduce((itemSum, item) => itemSum + item.qty, 0)
        ), 0);

    return {
        rows: relatedRows,
        count: relatedRows.length,
        generatedQty,
        actualInboundQty,
    };
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
        return '待生成订单';
    }
    if (!row.inboundCode) {
        return '待分配';
    }
    return row.inboundStatus || '待入库';
}

function traceForInboundCode(code: string) {
    return inboundTraces.find((trace) => trace.inboundCode === code);
}

function orderCodeFromTraceContext(context: TraceContext) {
    if (context.type === 'order') {
        return context.orderCode || context.code;
    }
    if (context.type === 'inbound') {
        return traceForInboundCode(context.inboundCode || context.code)?.orderCode;
    }
    return undefined;
}

function inboundRowsForTraceContext(context: TraceContext) {
    const targetCode = context.inboundCode || context.code;
    const orderCode = orderCodeFromTraceContext(context);
    const matchedTraceCodes = inboundTraces
        .filter((trace) => {
            if (context.type === 'demand' || context.type === 'demand-line') {
                return trace.demandCodes.includes(context.code);
            }
            if (context.type === 'plan' || context.type === 'plan-line') {
                return trace.planCode === context.code;
            }
            if (context.type === 'order') {
                return trace.orderCode === orderCode;
            }
            if (context.type === 'inbound') {
                return trace.inboundCode === targetCode;
            }
            return false;
        })
        .map((trace) => trace.inboundCode);

    return inboundRows.filter((inbound) => (
        matchedTraceCodes.includes(inbound.code)
        || (orderCode ? inbound.from === orderCode : false)
        || (context.type === 'inbound' && inbound.code === targetCode)
    ));
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

    const inboundTrace = context.type === 'inbound' ? traceForInboundCode(context.inboundCode || context.code) : undefined;
    const matchedOrderAllocations = orderWarehouseAllocations.filter((allocation) => {
        if (context.type === 'order') {
            return allocation.orderCode === (context.orderCode || context.code)
                && (!context.itemName || allocation.itemName === context.itemName);
        }
        if (context.type === 'inbound') {
            return inboundTrace
                ? allocation.orderCode === inboundTrace.orderCode
                    && allocation.planCode === inboundTrace.planCode
                    && inboundTrace.demandCodes.includes(allocation.demandCode)
                    && (!context.itemName || allocation.itemName === context.itemName)
                : false;
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
            const inboundTrace = traceForInboundCode(context.inboundCode || context.code);
            return inboundTrace
                ? allocation.orderCode === inboundTrace.orderCode
                    && allocation.planCode === inboundTrace.planCode
                    && inboundTrace.demandCodes.includes(allocation.demandCode)
                    && (!context.itemName || allocation.itemName === context.itemName)
                : false;
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

    const rowKeys = new Set(rows.map((row) => (
        `${row.orderCode}__${row.inboundCode}__${row.itemName}__${row.allocatedQty}`
    )));
    const inboundRowsForFill = inboundRowsForTraceContext(context);

    inboundRowsForFill.forEach((inbound) => {
        const trace = inboundTraceForRow(inbound);
        const order = orders.find((item) => item.jdOrder === inbound.from);
        inbound.items
            .filter((item) => !context.itemName || item.name === context.itemName)
            .forEach((item) => {
                const key = `${inbound.from}__${inbound.code}__${item.name}__${item.qty}`;
                if (rowKeys.has(key)) {
                    return;
                }
                rowKeys.add(key);

                rows.push({
                    demandCode: trace?.demandCodes.join('、') || '--',
                    branch: '--',
                    warehouse: order?.targetWarehouse || inbound.to,
                    itemName: item.name,
                    demandQty: 0,
                    unit: item.unit,
                    includedQty: 0,
                    planCode: trace?.planCode || order?.plan || '',
                    planQty: 0,
                    orderCode: inbound.from,
                    batch: order?.batch || '--',
                    orderQty: order?.items.find((orderItem) => orderItem.name === item.name)?.qty || item.qty,
                    allocatedQty: item.qty,
                    inboundCode: inbound.code,
                    inboundWarehouse: inbound.to,
                    inboundStatus: inbound.status,
                });
            });
    });

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
        inboundQty: sumUnique(rows.filter((row) => row.inboundCode), (row) => `${row.inboundCode}__${row.itemName}`, (row) => row.allocatedQty),
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

function itemCategory(name: string) {
    return equipmentItems.find((item) => item.name === name)?.category || '--';
}

function itemSupplier(name: string) {
    return equipmentItems.find((item) => item.name === name)?.supplier || '京东慧采';
}

export function warehouseManager(name: string) {
    return warehouses.find((warehouse) => warehouse.name === name)?.manager || '李岩';
}

function uniqueValues(values: string[]) {
    return Array.from(new Set(values.filter(Boolean)));
}

function planSourceLines(row: PlanRow): DraftPurchaseOrderLine[] {
    return planItemsToPlanLines(row).map((line, index) => {
        const demand = demandByCode(line.demandCode);

        return {
            id: `${line.demandCode}-${line.name}-${index}`,
            demandCode: line.demandCode,
            sourceWarehouse: demand ? demandWarehouse(demand) : row.mode === '集团集采' ? '集团总仓' : '会展中心项目点',
            name: line.name,
            category: line.category || itemCategory(line.name),
            unit: row.items.find((item) => item.name === line.name)?.unit || '件',
            planQty: line.planQty,
            orderQty: line.planQty,
            unitPrice: line.budgetPrice,
        };
    });
}

function defaultTargetWarehouse(row: PlanRow, lines: DraftPurchaseOrderLine[]) {
    if (row.mode === '集团集采') {
        return '集团总仓';
    }

    return lines[0]?.sourceWarehouse || '集团总仓';
}

function supplierSummary(lines: DraftPurchaseOrderLine[]) {
    const suppliers = uniqueValues(lines.map((line) => itemSupplier(line.name)));
    if (suppliers.length <= 1) {
        return suppliers[0] || '京东慧采';
    }

    return '多供应商汇总';
}

function localDatePart(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('');
}

export function nextPurchaseDocumentCode(prefix: 'XQ' | 'JH' | 'DD', existingCodes: string[], offset = 0, date = new Date()) {
    const datePart = localDatePart(date);
    const pattern = new RegExp(`^${prefix}${datePart}(\\d{4})$`);
    const currentMax = existingCodes.reduce((max, code) => {
        const match = code.match(pattern);
        return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `${prefix}${datePart}${String(currentMax + offset + 1).padStart(4, '0')}`;
}

function orderCodeFor(index: number) {
    return nextPurchaseDocumentCode('DD', orders.map((order) => order.jdOrder), index);
}

export function draftOrderAmount(row: DraftPurchaseOrder) {
    return row.lines.reduce((sum, line) => sum + line.orderQty * line.unitPrice, 0);
}

export function draftOrderQty(row: DraftPurchaseOrder) {
    return row.lines.reduce((sum, line) => sum + line.orderQty, 0);
}

export function createDraftOrdersForPlan(row: PlanRow, mode: GenerateOrderMode): DraftPurchaseOrder[] {
    const sourceLines = planSourceLines(row);
    const groups = mode === 'single'
        ? [{ key: 'all', warehouse: defaultTargetWarehouse(row, sourceLines), lines: sourceLines }]
        : uniqueValues(sourceLines.map((line) => line.sourceWarehouse)).map((warehouse) => ({
            key: warehouse,
            warehouse,
            lines: sourceLines.filter((line) => line.sourceWarehouse === warehouse),
        }));

    return groups
        .filter((group) => group.lines.length > 0)
        .map((group, index) => ({
            id: `${row.code}-${mode}-${group.key}`,
            orderCode: orderCodeFor(index),
            planCode: row.code,
            mode,
            supplier: supplierSummary(group.lines),
            targetWarehouse: group.warehouse,
            note: mode === 'single'
                ? '按采购计划生成全量采购订单，收货仓库可在创建前调整。'
                : `按 ${group.warehouse} 的需求来源生成采购订单。`,
            lines: group.lines,
        }));
}

export function draftOrderToOrderRow(row: DraftPurchaseOrder, withInbound: boolean): OrderRow {
    const inboundCode = inboundCodeForOrder(row.orderCode);

    return {
        jdOrder: row.orderCode,
        plan: row.planCode,
        batch: '计划生成',
        supplier: row.supplier,
        importedAt: '2026-06-26 10:30',
        createdAt: '2026-06-26 10:30',
        purchaseMethod: '采购计划生成',
        allocationMethod: row.mode === 'by-warehouse' ? '按采购需求批量生成' : '按采购计划明细生成',
        match: '无需匹配',
        allocationStatus: '已分配',
        status: withInbound ? '待入库' : '未生成',
        targetWarehouse: row.targetWarehouse,
        orderNote: row.note,
        sourceType: '采购计划生成',
        inboundCodes: withInbound ? [inboundCode] : [],
        inboundStatus: withInbound ? '待入库' : '未生成',
        paymentRecords: [],
        invoiceRecords: [],
        items: row.lines.map((line) => ({
            name: line.name,
            qty: line.orderQty,
            unit: line.unit,
            amount: Math.round(line.orderQty * line.unitPrice * 100) / 100,
        })),
    };
}

export function inboundCodeForOrder(orderCode: string) {
    const purchaseOrderMatch = orderCode.match(/^DD(\d{8})(\d{4})$/);
    if (purchaseOrderMatch) {
        return `RK${purchaseOrderMatch[1]}${purchaseOrderMatch[2]}`;
    }
    const suffix = orderCode.replace(/\D/g, '').slice(-6) || '000001';
    return `RK${suffix}`;
}

export function orderInboundCodes(row: OrderRow, rows: FlowRow[] = inboundRows) {
    return uniqueValues([
        ...row.inboundCodes,
        ...rows.filter((item) => item.from === row.jdOrder).map((item) => item.code),
        ...inboundTraces.filter((trace) => trace.orderCode === row.jdOrder).map((trace) => trace.inboundCode),
    ]);
}

export function inboundRowsForOrder(row: OrderRow, rows: FlowRow[] = inboundRows) {
    const codes = orderInboundCodes(row, rows);
    return rows.filter((item) => codes.includes(item.code) || item.from === row.jdOrder);
}

export function orderInboundLineSummaries(row: OrderRow, rows: FlowRow[] = inboundRows): OrderInboundLineSummary[] {
    const relatedRows = inboundRowsForOrder(row, rows);
    return row.items.map((item, index) => {
        const generatedQty = relatedRows.reduce((sum, inbound) => (
            sum + inbound.items
                .filter((inboundItem) => inboundItem.name === item.name)
                .reduce((itemSum, inboundItem) => itemSum + inboundItem.qty, 0)
        ), 0);
        const cappedGeneratedQty = Math.min(item.qty, generatedQty);
        return {
            id: `${row.jdOrder}-line-${index}-${item.name}`,
            name: item.name,
            unit: item.unit,
            orderQty: item.qty,
            generatedQty: cappedGeneratedQty,
            remainingQty: Math.max(item.qty - cappedGeneratedQty, 0),
            unitPrice: item.qty ? item.amount / item.qty : 0,
        };
    });
}

export function orderLineGeneratedQty(row: OrderRow, itemName: string, rows: FlowRow[] = inboundRows) {
    return orderInboundLineSummaries(row, rows)
        .find((item) => item.name === itemName)?.generatedQty || 0;
}

export function orderInboundSummary(row: OrderRow, rows: FlowRow[] = inboundRows) {
    const relatedRows = inboundRowsForOrder(row, rows);
    const orderQty = lineQty(row.items);
    const generatedQty = row.items.reduce((sum, item) => sum + Math.min(item.qty, orderLineGeneratedQty(row, item.name, rows)), 0);
    const remainingQty = Math.max(orderQty - generatedQty, 0);
    const statuses = relatedRows.map((item) => item.status);
    const status = !relatedRows.length
        ? '未生成'
        : statuses.every((item) => item === '已入库')
            ? '已入库'
            : relatedRows.length > 1 && statuses.some((item) => item === '已入库')
                ? '部分入库'
                : '待入库';

    return {
        rows: relatedRows,
        codes: orderInboundCodes(row, rows),
        count: relatedRows.length,
        orderQty,
        generatedQty,
        remainingQty,
        status,
    };
}

export function canDeleteOrder(row: OrderRow, rows: FlowRow[] = inboundRows) {
    const finance = orderFinanceSummary(row);
    const inboundSummary = orderInboundSummary(row, rows);

    return inboundSummary.count === 0
        && finance.paymentTotal <= 0
        && finance.invoiceTotal <= 0;
}

export function nextInboundDocumentCode(existingCodes: string[], offset = 0, date = new Date()) {
    const datePart = localDatePart(date);
    const pattern = new RegExp(`^RK${datePart}(\\d{4})$`);
    const currentMax = existingCodes.reduce((max, code) => {
        const match = code.match(pattern);
        return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `RK${datePart}${String(currentMax + offset + 1).padStart(4, '0')}`;
}

export function createDraftInboundLines(row: OrderRow, rows: FlowRow[] = inboundRows): DraftInboundLine[] {
    return orderInboundLineSummaries(row, rows).map((line) => ({
        ...line,
        inboundQty: line.remainingQty,
    }));
}

export function createDraftInboundsForOrder(
    row: OrderRow,
    rows: FlowRow[] = inboundRows,
    existingCodes: string[] = inboundRows.map((item) => item.code),
    date = new Date(),
): DraftInboundOrder[] {
    const warehouse = row.targetWarehouse || '集团总仓';

    return [{
        id: `${row.jdOrder}-inbound-1`,
        inboundCode: nextInboundDocumentCode(existingCodes, 0, date),
        orderCode: row.jdOrder,
        planCode: row.plan,
        warehouse,
        handler: warehouseManager(warehouse),
        note: '按当前剩余数量生成入库单。',
        lines: createDraftInboundLines(row, rows),
    }];
}

export function draftInboundQty(row: DraftInboundOrder) {
    return row.lines.reduce((sum, line) => sum + line.inboundQty, 0);
}

export function draftInboundAmount(row: DraftInboundOrder) {
    return row.lines.reduce((sum, line) => sum + line.inboundQty * line.unitPrice, 0);
}

export function validateDraftInbounds(drafts: DraftInboundOrder[]): DraftInboundValidationResult {
    const emptyDrafts = drafts.filter((draft) => draftInboundQty(draft) <= 0);
    const invalidLines = drafts.flatMap((draft) => (
        draft.lines.filter((line) => line.inboundQty < 0 || !Number.isInteger(line.inboundQty))
    ));
    const overLimitLines = drafts.flatMap((draft) => (
        draft.lines.filter((line) => {
            const lineTotal = drafts.reduce((sum, item) => {
                const match = item.lines.find((draftLine) => draftLine.name === line.name);
                return sum + (match?.inboundQty || 0);
            }, 0);

            return lineTotal > line.remainingQty;
        })
    ));

    return {
        emptyDrafts,
        invalidLines,
        overLimitLines,
        canSubmit: drafts.length > 0 && emptyDrafts.length === 0 && invalidLines.length === 0 && overLimitLines.length === 0,
    };
}

export function draftInboundToFlowRow(row: DraftInboundOrder): FlowRow {
    return {
        code: row.inboundCode,
        from: row.orderCode,
        to: row.warehouse,
        handler: row.handler,
        status: '待入库',
        items: row.lines
            .filter((line) => line.inboundQty > 0)
            .map((line) => ({
                name: line.name,
                qty: line.inboundQty,
                unit: line.unit,
                amount: Math.round(line.inboundQty * line.unitPrice * 100) / 100,
            })),
    };
}

export function draftInboundToTrace(row: DraftInboundOrder, sourceOrder: OrderRow): InboundTrace {
    const demandCodes = uniqueValues(orderAllocations(sourceOrder)
        .filter((allocation) => row.lines.some((line) => line.name === allocation.itemName && line.inboundQty > 0))
        .map((allocation) => allocation.demandCode));

    return {
        inboundCode: row.inboundCode,
        orderCode: row.orderCode,
        planCode: row.planCode,
        demandCodes: demandCodes.length ? demandCodes : ['--'],
    };
}

export function updateOrderWithInboundSummary(row: OrderRow, generatedInbounds: FlowRow[], allInboundRows: FlowRow[] = inboundRows): OrderRow {
    const inboundCodes = uniqueValues([...orderInboundCodes(row, allInboundRows), ...generatedInbounds.map((item) => item.code)]);
    const summary = orderInboundSummary({ ...row, inboundCodes }, [...generatedInbounds, ...allInboundRows]);

    return {
        ...row,
        status: summary.status,
        allocationStatus: summary.count ? '已分配' : row.allocationStatus,
        inboundCodes,
        inboundStatus: summary.status,
    };
}

export function draftOrderToInboundRow(row: DraftPurchaseOrder, existingCodes: string[] = inboundRows.map((item) => item.code), offset = 0): FlowRow {
    return {
        code: nextInboundDocumentCode(existingCodes, offset),
        from: row.orderCode,
        to: row.targetWarehouse,
        handler: warehouseManager(row.targetWarehouse),
        status: '待入库',
        items: row.lines.map((line) => ({
            name: line.name,
            qty: line.orderQty,
            unit: line.unit,
            amount: Math.round(line.orderQty * line.unitPrice * 100) / 100,
        })),
    };
}

export function draftOrderToAllocations(row: DraftPurchaseOrder, inbound?: FlowRow): OrderWarehouseAllocation[] {
    return row.lines.map((line) => ({
        orderCode: row.orderCode,
        planCode: row.planCode,
        demandCode: line.demandCode,
        warehouse: row.targetWarehouse,
        itemName: line.name,
        demandQty: line.planQty,
        includedQty: line.planQty,
        orderQty: line.orderQty,
        allocatedQty: inbound ? line.orderQty : 0,
        manualAdjustQty: 0,
        inboundCode: inbound?.code || '',
        inboundStatus: inbound?.status || '未生成',
    }));
}

export function draftOrderToInboundTrace(row: DraftPurchaseOrder, inbound: FlowRow): InboundTrace {
    return {
        inboundCode: inbound.code,
        orderCode: row.orderCode,
        planCode: row.planCode,
        demandCodes: uniqueValues(row.lines.map((line) => line.demandCode)),
    };
}

export function createInboundFromOrder(row: OrderRow): FlowRow {
    const warehouse = row.targetWarehouse || '集团总仓';
    const nextCode = row.inboundCodes[0] || nextInboundDocumentCode(inboundRows.map((item) => item.code));

    return {
        code: nextCode,
        from: row.jdOrder,
        to: warehouse,
        handler: warehouseManager(warehouse),
        status: '待入库',
        items: row.items,
    };
}

export function orderToInboundTrace(row: OrderRow, inbound: FlowRow): InboundTrace {
    const allocations = orderToInboundAllocations(row, inbound);

    return {
        inboundCode: inbound.code,
        orderCode: row.jdOrder,
        planCode: row.plan,
        demandCodes: uniqueValues(allocations.map((allocation) => allocation.demandCode)),
    };
}

export function orderToInboundAllocations(row: OrderRow, inbound: FlowRow): OrderWarehouseAllocation[] {
    const existingAllocations = orderWarehouseAllocations.filter((allocation) => allocation.orderCode === row.jdOrder);
    if (existingAllocations.length) {
        return existingAllocations.map((allocation) => ({
            ...allocation,
            allocatedQty: allocation.orderQty,
            inboundCode: inbound.code,
            inboundStatus: inbound.status,
            warehouse: row.targetWarehouse || allocation.warehouse,
        }));
    }

    return row.items.map((item) => ({
        orderCode: row.jdOrder,
        planCode: row.plan,
        demandCode: '--',
        warehouse: row.targetWarehouse || inbound.to,
        itemName: item.name,
        demandQty: item.qty,
        includedQty: item.qty,
        orderQty: item.qty,
        allocatedQty: item.qty,
        manualAdjustQty: 0,
        inboundCode: inbound.code,
        inboundStatus: inbound.status,
    }));
}

export function upsertRuntimePurchaseData(
    orderRows: OrderRow[],
    inboundRowsToAdd: FlowRow[] = [],
    allocationRows: OrderWarehouseAllocation[] = [],
    traceRows: InboundTrace[] = [],
) {
    orderRows.forEach((row) => {
        const existing = orders.find((item) => item.jdOrder === row.jdOrder);
        if (existing) {
            Object.assign(existing, row);
        } else {
            orders.unshift(row);
        }
    });

    inboundRowsToAdd.forEach((row) => {
        const existing = inboundRows.find((item) => item.code === row.code);
        if (existing) {
            Object.assign(existing, row);
        } else {
            inboundRows.unshift(row);
        }
    });

    allocationRows.forEach((row) => {
        const existing = orderWarehouseAllocations.find((item) => (
            item.orderCode === row.orderCode
            && item.planCode === row.planCode
            && item.demandCode === row.demandCode
            && item.itemName === row.itemName
            && item.inboundCode === row.inboundCode
        ));
        if (existing) {
            Object.assign(existing, row);
        } else {
            orderWarehouseAllocations.push(row);
        }
    });

    traceRows.forEach((row) => {
        const existing = inboundTraces.find((item) => item.inboundCode === row.inboundCode);
        if (existing) {
            Object.assign(existing, row);
        } else {
            inboundTraces.push(row);
        }
    });
}

export function removeRuntimePurchaseOrder(orderCode: string) {
    const index = orders.findIndex((row) => row.jdOrder === orderCode);
    if (index >= 0) {
        orders.splice(index, 1);
    }
}
