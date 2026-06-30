import { describe, expect, it } from 'vitest';

import type { DraftInboundOrder, FlowRow, OrderRow } from '../src/prototypes/untitled-copy/types';
import {
    createDraftInboundsForOrder,
    draftInboundToFlowRow,
    nextInboundDocumentCode,
    orderInboundSummary,
    traceRelationRows,
    traceSummary,
    updateOrderWithInboundSummary,
    validateDraftInbounds,
} from '../src/prototypes/untitled-copy/helpers';

const baseOrder: OrderRow = {
    jdOrder: 'DD202606290001',
    plan: 'JH202606290001',
    batch: '计划生成',
    supplier: '京东慧采-测试供应商',
    importedAt: '2026-06-29 09:00',
    createdAt: '2026-06-29 09:00',
    purchaseMethod: '采购计划生成',
    allocationMethod: '按采购计划明细生成',
    items: [
        { name: '强光手电', qty: 10, unit: '个', amount: 920 },
        { name: '防刺服', qty: 4, unit: '件', amount: 2560 },
    ],
    match: '无需匹配',
    allocationStatus: '已分配',
    status: '未生成入库单',
    targetWarehouse: '集团总仓',
    sourceType: '采购计划生成',
    inboundCodes: [],
    inboundStatus: '未生成入库单',
    paymentRecords: [],
    invoiceRecords: [],
};

function cloneDraft(row: DraftInboundOrder): DraftInboundOrder {
    return {
        ...row,
        lines: row.lines.map((line) => ({ ...line })),
    };
}

describe('purchase order multi-inbound generation', () => {
    it('creates the first draft with all remaining quantity', () => {
        const [draft] = createDraftInboundsForOrder(baseOrder, [], [], new Date('2026-06-29T08:00:00'));
        expect(draft.inboundCode).toBe('RK202606290001');
        expect(draft.lines.map((line) => [line.name, line.inboundQty])).toEqual([
            ['强光手电', 10],
            ['防刺服', 4],
        ]);
        expect(validateDraftInbounds([draft]).canSubmit).toBe(true);
    });

    it('supports two drafts when quantities are manually split', () => {
        const [firstDraft] = createDraftInboundsForOrder(baseOrder, [], [], new Date('2026-06-29T08:00:00'));
        const secondDraft = cloneDraft(firstDraft);
        secondDraft.id = 'second';
        secondDraft.inboundCode = nextInboundDocumentCode([firstDraft.inboundCode], 0, new Date('2026-06-29T08:00:00'));
        firstDraft.lines[0].inboundQty = 6;
        firstDraft.lines[1].inboundQty = 1;
        secondDraft.lines[0].inboundQty = 4;
        secondDraft.lines[1].inboundQty = 3;

        const validation = validateDraftInbounds([firstDraft, secondDraft]);
        expect(validation.canSubmit).toBe(true);
        expect([firstDraft, secondDraft].map(draftInboundToFlowRow).map((row) => row.code)).toEqual([
            'RK202606290001',
            'RK202606290002',
        ]);
    });

    it('creates an append draft from remaining quantity after an existing inbound', () => {
        const existing: FlowRow = {
            code: 'RK202606290001',
            from: baseOrder.jdOrder,
            to: '集团总仓',
            handler: '李岩',
            status: '待入库',
            items: [{ name: '强光手电', qty: 6, unit: '个', amount: 552 }],
        };

        const [draft] = createDraftInboundsForOrder(
            { ...baseOrder, inboundCodes: [existing.code] },
            [existing],
            [existing.code],
            new Date('2026-06-29T08:00:00'),
        );

        expect(draft.inboundCode).toBe('RK202606290002');
        expect(draft.lines.map((line) => [line.name, line.inboundQty])).toEqual([
            ['强光手电', 4],
            ['防刺服', 4],
        ]);
    });

    it('blocks empty, non-integer, negative, and over-limit drafts', () => {
        const [draft] = createDraftInboundsForOrder(baseOrder, [], [], new Date('2026-06-29T08:00:00'));
        const empty = cloneDraft(draft);
        empty.lines.forEach((line) => { line.inboundQty = 0; });
        expect(validateDraftInbounds([empty]).canSubmit).toBe(false);
        expect(validateDraftInbounds([empty]).emptyDrafts).toHaveLength(1);

        const decimal = cloneDraft(draft);
        decimal.lines[0].inboundQty = 1.5;
        expect(validateDraftInbounds([decimal]).invalidLines).toHaveLength(1);

        const negative = cloneDraft(draft);
        negative.lines[0].inboundQty = -1;
        expect(validateDraftInbounds([negative]).invalidLines).toHaveLength(1);

        const over = cloneDraft(draft);
        over.lines[0].inboundQty = 11;
        expect(validateDraftInbounds([over]).overLimitLines).toHaveLength(1);
    });

    it('updates order summary without exceeding order quantities', () => {
        const inbound: FlowRow = {
            code: 'RK202606290001',
            from: baseOrder.jdOrder,
            to: '集团总仓',
            handler: '李岩',
            status: '待入库',
            items: [
                { name: '强光手电', qty: 99, unit: '个', amount: 9108 },
                { name: '防刺服', qty: 4, unit: '件', amount: 2560 },
            ],
        };

        const updated = updateOrderWithInboundSummary(baseOrder, [inbound], []);
        const summary = orderInboundSummary(updated, [inbound]);
        expect(summary.generatedQty).toBe(14);
        expect(summary.remainingQty).toBe(0);
        expect(summary.status).toBe('待入库');
        expect(updated.inboundCodes).toEqual(['RK202606290001']);
    });

    it('deduplicates inbound trace summary by inbound document and item', () => {
        const rows = traceRelationRows({ type: 'order', code: 'DD202606160001', orderCode: 'DD202606160001' });
        const summary = traceSummary(rows);
        const inboundRows = rows.filter((row) => row.inboundCode);
        const duplicate = inboundRows.find((row) => row.inboundCode === 'RK202606160011' && row.itemName === '强光手电');

        expect(summary.inboundQty).toBe(298);
        expect(duplicate).toBeTruthy();
        expect(traceSummary([...rows, duplicate!]).inboundQty).toBe(298);
    });
});
