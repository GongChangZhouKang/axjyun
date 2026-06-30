import React, { useState } from 'react';
import { CreditCard, FileText, Trash2 } from 'lucide-react';
import {
    AttachmentMeta,
    DemandRow,
    InvoiceRecord,
    InvoiceType,
    OrderRow,
    PaymentMethod,
    PaymentRecord,
    PlanRow,
    TraceContext,
    currency,
    numberText,
    lineQty,
    itemSummary,
    orderFinanceSummary,
    orderInboundSummary,
    canDeleteOrder,
    StatusTag,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    SectionTitle,
    DetailGrid,
    PaymentHistoryTable,
    InvoiceHistoryTable,
    orderDetailWindow,
} from '../../shared';

type RegistrationMode = 'payment' | 'invoice';
type ValueChangeEvent = { target: { value: string } };

const paymentMethods: PaymentMethod[] = ['银行转账', '企业卡', '现金', '其他'];
const invoiceTypes: InvoiceType[] = ['增值税专票', '增值税普票', '电子普通发票', '其他'];
const maxAttachmentSize = 10 * 1024 * 1024;

function todayValue() {
    return new Date().toLocaleDateString('en-CA');
}

function FinanceRegistrationModal({
    mode,
    row,
    onClose,
    onAddPayment,
    onAddInvoice,
}: {
    mode: RegistrationMode;
    row: OrderRow;
    onClose: () => void;
    onAddPayment: (orderCode: string, record: PaymentRecord) => void;
    onAddInvoice: (orderCode: string, record: InvoiceRecord) => void;
}) {
    const finance = orderFinanceSummary(row);
    const isPayment = mode === 'payment';
    const remaining = isPayment ? finance.paymentRemaining : finance.invoiceRemaining;
    const recorded = isPayment ? finance.paymentTotal : finance.invoiceTotal;
    const [amount, setAmount] = useState('');
    const [businessDate, setBusinessDate] = useState(todayValue());
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('银行转账');
    const [invoiceType, setInvoiceType] = useState<InvoiceType>('增值税专票');
    const [referenceNo, setReferenceNo] = useState('');
    const [note, setNote] = useState('');
    const [attachment, setAttachment] = useState<AttachmentMeta | undefined>();
    const [fileError, setFileError] = useState('');
    const [formError, setFormError] = useState('');

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        setFileError('');
        setAttachment(undefined);
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        const supported = file.type === 'application/pdf'
            || file.type.startsWith('image/')
            || ['pdf', 'png', 'jpg', 'jpeg'].includes(extension || '');
        if (!supported) {
            setFileError('仅支持 PDF、PNG、JPG 或 JPEG 文件');
            return;
        }
        if (file.size > maxAttachmentSize) {
            setFileError('附件不能超过 10MB');
            return;
        }

        setAttachment({ name: file.name, type: file.type || extension || 'unknown', size: file.size });
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError('');
        const amountCents = Math.round(Number(amount) * 100);
        const remainingCents = Math.round(remaining * 100);

        if (!Number.isFinite(amountCents) || amountCents <= 0) {
            setFormError('请输入大于 0 的金额');
            return;
        }
        if (amountCents > remainingCents) {
            setFormError(`本次金额不能超过剩余金额 ${currency(remaining)}`);
            return;
        }
        if (!businessDate) {
            setFormError(`请选择${isPayment ? '付款' : '开票'}日期`);
            return;
        }
        if (!referenceNo.trim()) {
            setFormError(`请填写${isPayment ? '流水/凭证号' : '发票号码'}`);
            return;
        }
        if (fileError) {
            setFormError('请先处理附件问题');
            return;
        }

        const normalizedAmount = amountCents / 100;
        if (isPayment) {
            onAddPayment(row.jdOrder, {
                id: `PAY-${row.jdOrder}-${Date.now()}`,
                amount: normalizedAmount,
                paidAt: businessDate,
                method: paymentMethod,
                referenceNo: referenceNo.trim(),
                note: note.trim() || undefined,
                attachment,
            });
        } else {
            onAddInvoice(row.jdOrder, {
                id: `INV-${row.jdOrder}-${Date.now()}`,
                amount: normalizedAmount,
                invoicedAt: businessDate,
                invoiceType,
                invoiceNo: referenceNo.trim(),
                note: note.trim() || undefined,
                attachment,
            });
        }
        onClose();
    }

    return (
        <div className="modal-backdrop" role="presentation">
            <div className="modal-panel business-window finance-registration-modal" role="dialog" aria-modal="true" aria-label={isPayment ? '登记付款' : '登记发票'}>
                <div className="modal-header">
                    <div>
                        <h2>{isPayment ? '登记付款' : '登记发票'}</h2>
                        <p>{row.jdOrder} / 登记后将自动更新{isPayment ? '付款' : '发票'}状态</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">×</button>
                </div>
                <form onSubmit={submit}>
                    <div className="business-body">
                        <div className="detail-stack">
                            <DetailGrid rows={[
                                ['订单金额', currency(finance.orderAmount)],
                                [isPayment ? '已付金额' : '已开票金额', currency(recorded)],
                                [isPayment ? '待付金额' : '待开票金额', currency(remaining)],
                            ]} />

                            <div className="finance-entry-form">
                                <label>
                                    <span><b>*</b>{isPayment ? '本次付款金额' : '本次开票金额'}</span>
                                    <input
                                        type="number"
                                        min="0.01"
                                        max={remaining}
                                        step="0.01"
                                        value={amount}
                                        placeholder={`最多可登记 ${remaining}`}
                                        onChange={(event: ValueChangeEvent) => setAmount(event.target.value)}
                                    />
                                </label>
                                <label>
                                    <span><b>*</b>{isPayment ? '付款日期' : '开票日期'}</span>
                                    <input type="date" value={businessDate} onChange={(event: ValueChangeEvent) => setBusinessDate(event.target.value)} />
                                </label>
                                {isPayment ? (
                                    <label>
                                        <span><b>*</b>付款方式</span>
                                        <select value={paymentMethod} onChange={(event: ValueChangeEvent) => setPaymentMethod(event.target.value as PaymentMethod)}>
                                            {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                                        </select>
                                    </label>
                                ) : (
                                    <label>
                                        <span><b>*</b>发票类型</span>
                                        <select value={invoiceType} onChange={(event: ValueChangeEvent) => setInvoiceType(event.target.value as InvoiceType)}>
                                            {invoiceTypes.map((type) => <option key={type}>{type}</option>)}
                                        </select>
                                    </label>
                                )}
                                <label>
                                    <span><b>*</b>{isPayment ? '流水/凭证号' : '发票号码'}</span>
                                    <input value={referenceNo} onChange={(event: ValueChangeEvent) => setReferenceNo(event.target.value)} placeholder="请输入" />
                                </label>
                                <label className="finance-field-wide finance-file-field">
                                    <span>附件</span>
                                    <div>
                                        <input type="file" accept=".pdf,image/png,image/jpeg" onChange={handleFileChange} />
                                        <em>{attachment ? `已选择：${attachment.name}` : '可上传单个 PDF/PNG/JPG 文件，最大 10MB'}</em>
                                        {fileError && <small>{fileError}</small>}
                                    </div>
                                </label>
                                <label className="finance-field-wide finance-note-field">
                                    <span>备注</span>
                                    <textarea value={note} onChange={(event: ValueChangeEvent) => setNote(event.target.value)} placeholder="可填写本次登记说明" />
                                </label>
                            </div>

                            {formError && <div className="finance-form-error" role="alert">{formError}</div>}
                            {isPayment
                                ? <PaymentHistoryTable records={row.paymentRecords || []} />
                                : <InvoiceHistoryTable records={row.invoiceRecords || []} />}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="secondary-btn" onClick={onClose}>取消</button>
                        <button type="submit" className="primary-btn">确认登记</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function OrderPage({
    openWindow,
    openPlanView,
    openDemandView,
    orderRows,
    onGenerateInbound,
    onAddPayment,
    onAddInvoice,
    onDeleteOrder,
    onOpenTrace,
}: {
    openWindow: OpenBusinessWindow;
    openPlanView: (row: PlanRow) => void;
    openDemandView: (row: DemandRow) => void;
    orderRows: OrderRow[];
    onGenerateInbound: (row: OrderRow) => void;
    onAddPayment: (orderCode: string, record: PaymentRecord) => void;
    onAddInvoice: (orderCode: string, record: InvoiceRecord) => void;
    onDeleteOrder: (row: OrderRow) => void;
    onOpenTrace: (context: TraceContext) => void;
}) {
    const [registration, setRegistration] = useState<{ mode: RegistrationMode; row: OrderRow } | null>(null);
    const [moreMenu, setMoreMenu] = useState<{ row: OrderRow; top: number; left: number } | null>(null);

    function toggleMoreMenu(event: React.MouseEvent<HTMLButtonElement>, row: OrderRow) {
        const rect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 156;
        const menuHeight = 142;
        const viewportGap = 12;
        const top = rect.bottom + 8 + menuHeight > window.innerHeight
            ? Math.max(viewportGap, rect.top - menuHeight - 8)
            : rect.bottom + 8;
        const left = Math.max(
            viewportGap,
            Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportGap),
        );

        setMoreMenu((current) => (
            current?.row.jdOrder === row.jdOrder
                ? null
                : {
                    row,
                    top,
                    left,
                }
        ));
    }

    return (
        <>
            <FilterBar>
                <Field label="采购订单号" value="请输入采购订单号" />
                <Field label="采购计划单号" value="请输入采购计划单号" />
                <Field label="创建时间" value="请选择创建时间" />
                <SelectLike label="入库状态" value="全部状态" />
            </FilterBar>
            <section className="panel purchase-order-panel">
                <SectionTitle title="采购订单" subtitle="采购订单基于采购计划生成，订单价格作为采购成本，后续入库形成库存成本" />
                <div className="table-toolbar">
                    <button type="button" className="secondary-btn" onClick={() => openWindow({
                        title: '导出采购订单',
                        subtitle: '导出当前采购订单、付款发票状态和入库进度。',
                        primary: '确认导出',
                        body: <DetailGrid rows={[
                            ['导出范围', '当前筛选条件'],
                            ['包含字段', '采购订单号、关联计划、目标仓库、数量合计、订单金额、付款状态、发票状态、入库单状态、入库数量、供应商、创建时间、装备摘要'],
                            ['用途', '采购对账、付款开票跟踪和入库进度复核'],
                        ]} />,
                    })}>导出</button>
                </div>
                <DataTable
                    columns={['采购订单号', '关联计划', '目标仓库', '数量合计', '订单金额', '付款状态', '发票状态', '入库单状态', '入库数量', '供应商', '创建时间', '明细数', '装备摘要', '操作']}
                    rows={orderRows}
                    renderRow={(row: OrderRow) => {
                        const inboundSummary = orderInboundSummary(row);
                        const finance = orderFinanceSummary(row);
                        const deletable = canDeleteOrder(row);

                        return (
                                <tr key={row.jdOrder}>
                                    <td className="link-cell">{row.jdOrder}</td>
                                    <td>{row.plan}</td>
                                    <td>{row.targetWarehouse || '--'}</td>
                                    <td>{numberText(lineQty(row.items))}</td>
                                    <td>{currency(finance.orderAmount)}</td>
                                    <td><StatusTag value={finance.paymentStatus} /></td>
                                    <td><StatusTag value={finance.invoiceStatus} /></td>
                                    <td><StatusTag value={inboundSummary.status} /></td>
                                    <td>{numberText(inboundSummary.generatedQty)} / {numberText(inboundSummary.orderQty)}</td>
                                    <td>{row.supplier}</td>
                                    <td>{row.createdAt || row.importedAt}</td>
                                    <td>{row.items.length} 行</td>
                                    <td>{itemSummary(row.items)}</td>
                                    <td>
                                    <div className="row-actions purchase-order-actions">
                                        <button type="button" onClick={() => openWindow(orderDetailWindow(row, { openPlanView, openDemandView, openTraceRelation: onOpenTrace }))}>查看订单</button>
                                        <button
                                            type="button"
                                            disabled={inboundSummary.remainingQty <= 0}
                                            title={inboundSummary.remainingQty <= 0 ? '该订单已无剩余可生成数量' : undefined}
                                            onClick={() => onGenerateInbound(row)}
                                        >
                                            生成入库单
                                        </button>
                                        <button type="button" onClick={() => onOpenTrace({ type: 'order', code: row.jdOrder, orderCode: row.jdOrder })}>链路追踪</button>
                                        <button
                                            type="button"
                                            className={moreMenu?.row.jdOrder === row.jdOrder ? 'row-actions-more-trigger is-open' : 'row-actions-more-trigger'}
                                            aria-haspopup="menu"
                                            aria-expanded={moreMenu?.row.jdOrder === row.jdOrder}
                                            onClick={(event) => toggleMoreMenu(event, row)}
                                        >
                                            更多<span aria-hidden="true" className="row-actions-more-arrow" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }}
                />
            </section>
            {moreMenu && (() => {
                const finance = orderFinanceSummary(moreMenu.row);
                const deletable = canDeleteOrder(moreMenu.row);

                return (
                    <>
                        <button type="button" className="row-actions-menu-mask" aria-label="关闭更多菜单" onClick={() => setMoreMenu(null)} />
                        <div className="row-actions-menu is-floating" role="menu" aria-label={`${moreMenu.row.jdOrder} 更多操作`} style={{ top: moreMenu.top, left: moreMenu.left }}>
                            <button
                                type="button"
                                role="menuitem"
                                disabled={finance.paymentComplete}
                                title={finance.paymentComplete ? '订单已全额付款' : undefined}
                                onClick={() => {
                                    setMoreMenu(null);
                                    setRegistration({ mode: 'payment', row: moreMenu.row });
                                }}
                            >
                                <CreditCard aria-hidden="true" />
                                <span>登记付款</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                disabled={finance.invoiceComplete}
                                title={finance.invoiceComplete ? '订单已全额开票' : undefined}
                                onClick={() => {
                                    setMoreMenu(null);
                                    setRegistration({ mode: 'invoice', row: moreMenu.row });
                                }}
                            >
                                <FileText aria-hidden="true" />
                                <span>登记发票</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className="danger-link"
                                disabled={!deletable}
                                title={deletable ? '删除订单' : '已有入库单、付款或发票记录，无法删除'}
                                onClick={() => {
                                    setMoreMenu(null);
                                    onDeleteOrder(moreMenu.row);
                                }}
                            >
                                <Trash2 aria-hidden="true" />
                                <span>删除</span>
                            </button>
                        </div>
                    </>
                );
            })()}
            {registration && (
                <FinanceRegistrationModal
                    mode={registration.mode}
                    row={registration.row}
                    onClose={() => setRegistration(null)}
                    onAddPayment={onAddPayment}
                    onAddInvoice={onAddInvoice}
                />
            )}
        </>
    );
}
