import React, { useState } from 'react';
import {
    EquipmentItem,
    CategoryRow,
    equipmentItems,
    categoryRows,
    numberText,
    Tag,
    StatusTag,
    StatusSwitch,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
} from '../shared';

const rootCategoryParent = '0';
const categoryParentOptions = [
    '无上级分类',
    '保安员服装',
    '执勤装备',
    '被动防护装备',
    '主动防卫装备',
    '消防装备',
    '安检装备',
];
const equipmentCategoryOptions = [
    '保安员服装 / 外衣裤',
    '保安员服装 / 服饰标志',
    '保安员服装 / 腰带',
    '保安员服装 / 鞋',
    '保安员服装 / 帽',
    '执勤装备 / 交通工具',
    '执勤装备 / 照明设备',
    '执勤装备 / 安检仪器',
    '执勤装备 / 巡更设备',
    '执勤装备 / 录音录像设备',
    '执勤装备 / 通讯设备',
    '被动防护装备 / 防刺服',
    '主动防卫装备 / 保安防暴棍',
    '消防装备 / 灭火器',
    '安检装备 / 安检设备箱',
];

function categoryChildCount(row: CategoryRow) {
    return categoryRows.filter((item) => item.parent === row.name).length;
}

function categoryIsLastChild(row: CategoryRow, index: number) {
    if (row.parent === rootCategoryParent) return false;
    return !categoryRows.slice(index + 1).some((item) => item.parent === row.parent);
}

export function ArchivePage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    const [tab, setTab] = useState<'items' | 'categories'>('items');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const statusNote = '停用后不再用于新增采购、入库和领用，历史库存、单据和成本记录继续保留。';

    function openEquipmentCreate() {
        openWindow({
            title: '新增装备',
            subtitle: '先维护装备品类，需要一物一码管理的装备后续再录入具体编号。',
            primary: '保存',
            body: <CreateEquipmentForm statusNote={statusNote} />,
        });
    }

    function openEquipmentDelete(row: EquipmentItem) {
        openWindow({
            title: `删除装备 - ${row.name}`,
            subtitle: '删除前会校验库存和历史业务记录。',
            primary: '确认删除',
            body: <DetailGrid rows={[
                ['装备名称', row.name],
                ['当前库存', numberText(row.stock)],
                ['删除条件', '仅无库存且未产生采购、入库、领用等业务记录的装备可以删除'],
            ]} />,
        });
    }

    function openEquipmentEdit(row: EquipmentItem) {
        openWindow({
            title: `编辑装备 - ${row.name}`,
            subtitle: '维护装备品类的基础信息、成本规则、启用状态和备注。',
            primary: '保存修改',
            body: (
                <div className="modal-form embedded-form">
                    <div className="form-section-title">基础信息</div>
                    <Field label="装备名称" value={row.name} />
                    <SelectLike label="装备分类" value={row.category} options={['保安员服装', '执勤装备', '被动防护装备', '主动防卫装备', '消防装备', '安检装备']} />
                    <Field label="规格型号" value={row.spec} />
                    <SelectLike label="单位" value={row.unit} options={['台', '套', '件', '个', '根', '张', '顶', '双']} />
                    <SelectLike label="状态" value={row.status} options={['启用', '停用']} />
                    <div className="field-note">{statusNote}</div>
                    <div className="form-section-title">管理规则</div>
                    <SelectLike label="成本计算方式" value={row.costMethod} options={['移动加权平均', '批次管理', '单件折旧']} />
                    <SelectLike label="是否一物一码管理" value={row.oneCode ? '是' : '否'} options={['是', '否']} />
                    {row.costMethod === '单件折旧' && (
                        <>
                            <div className="form-section-title">折旧信息</div>
                            <Field label="折旧年限（月）" value={row.depreciationRule.includes('60个月') ? '60' : '36'} />
                            <Field label="残值率" value="5%" />
                            <div className="field-note">目前仅支持直线法，项目或人员确认领用后才开始按单件装备归集折旧成本。</div>
                        </>
                    )}
                    <div className="form-section-title">图片与备注</div>
                    <Field label="适用岗位/场景" value={row.standard} wide />
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
            ),
        });
    }

    function openCategoryEdit(row: CategoryRow) {
        openWindow({
            title: `编辑分类 - ${row.name}`,
            subtitle: '维护装备分类层级、编码、排序和启用状态。',
            primary: '保存修改',
            body: (
                <div className="modal-form embedded-form">
                    <div className="form-section-title">分类信息</div>
                    <Field label="分类名称" value={row.name} />
                    <SelectLike
                        label="上级分类"
                        value={row.parent === rootCategoryParent ? '无上级分类' : row.parent}
                        options={categoryParentOptions}
                    />
                    <Field label="分类编码" value={row.code} />
                    <SelectLike label="分类层级" value={row.level} options={['一级分类', '二级分类', '三级分类']} />
                    <SelectLike label="状态" value={row.status} options={['启用', '停用']} />
                    <Field label="排序" value="10" />
                    <label className="textarea-field">
                        <span>备注</span>
                        <textarea value="用于装备建档、库存筛选和采购需求归类。" readOnly />
                    </label>
                </div>
            ),
        });
    }

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
                            <button type="button" className="primary-btn" onClick={openEquipmentCreate}>新增装备</button>
                            <button type="button" className="secondary-btn" onClick={() => openWindow({
                                title: '导出装备品类档案',
                                subtitle: '导出当前筛选范围下的装备分类、成本规则和库存概览。',
                                primary: '确认导出',
                                body: <DetailGrid rows={[['导出范围', '当前筛选条件'], ['包含字段', '装备名称、分类、规格、单位、一物一码、成本计算方式、库存'], ['用途', '采购选品、库存核对和基础资料维护']]} />,
                            })}>导出</button>
                        </div>
                        <DataTable
                            columns={['装备名称', '装备品类编码', '装备分类', '规格型号', '单位', '供应商', '是否一物一码', '成本计算方式', '启用状态', '操作']}
                            rows={equipmentItems}
                            renderRow={(row: EquipmentItem) => (
                                <tr key={row.name}>
                                    <td className="link-cell">{row.name}</td>
                                    <td>{row.itemCode}</td>
                                    <td>{row.category}</td>
                                    <td>{row.spec}</td>
                                    <td>{row.unit}</td>
                                    <td>{row.supplier}</td>
                                    <td>{row.oneCode ? <Tag tone="blue">是</Tag> : <Tag>否</Tag>}</td>
                                    <td>
                                        <span className="cost-method-cell">
                                            <strong>{row.costMethod}</strong>
                                            {row.costMethod === '单件折旧' && <em>{row.depreciationRule.replace('直线法 / ', '年限 ').replace('残值率', '残值率 ')}</em>}
                                        </span>
                                    </td>
                                    <td><StatusSwitch enabled={row.status === '启用'} /></td>
                                    <td>
                                        <RowActions
                                            allowDelete={false}
                                            actions={[
                                                {
                                                    label: '编辑',
                                                    onClick: () => openEquipmentEdit(row),
                                                },
                                                {
                                                    label: '删除',
                                                    danger: true,
                                                    disabled: row.stock > 0,
                                                    title: row.stock > 0 ? '已有库存或业务记录，无法删除' : '删除装备',
                                                    onClick: row.stock > 0 ? undefined : () => openEquipmentDelete(row),
                                                },
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
                        <Field label="分类名称" value="请输入分类名称" />
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
                            columns={['分类名称', '层级', '分类编码', '装备数', '状态', '操作']}
                            rows={categoryRows}
                            renderRow={(row: CategoryRow, index: number) => (
                                <tr key={row.code} className={row.parent === rootCategoryParent ? 'tree-row tree-row-root' : 'tree-row tree-row-child'}>
                                    <td className="tree-name-cell">
                                        <span className={categoryIsLastChild(row, index) ? 'tree-node tree-node-last' : 'tree-node'}>
                                            <span className={row.parent === rootCategoryParent ? 'tree-toggle tree-toggle-open' : 'tree-branch'} aria-hidden="true" />
                                            <span className="tree-node-title">{row.name}</span>
                                            {categoryChildCount(row) > 0 && <span className="tree-count">{categoryChildCount(row)} 类</span>}
                                        </span>
                                    </td>
                                    <td>{row.level}</td>
                                    <td>{row.code}</td>
                                    <td>{row.itemCount}</td>
                                    <td><StatusTag value={row.status} /></td>
                                    <td>
                                        <RowActions
                                            allowDelete={row.itemCount === 0}
                                            actions={[{ label: '编辑', onClick: () => openCategoryEdit(row) }]}
                                        />
                                    </td>
                                </tr>
                            )}
                        />
                    </section>
                </>
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
                            <Field label="分类名称" value="如：通讯设备" required />
                            <SelectLike
                                label="上级分类"
                                value="执勤装备"
                                options={categoryParentOptions}
                                required
                            />
                            <Field label="分类编码" value="ZQ-TX" required />
                            <SelectLike label="分类层级" value="二级分类" options={['一级分类', '二级分类', '三级分类']} required />
                            <SelectLike label="状态" value="启用" options={['启用', '停用']} required />
                            <Field label="排序" value="10" required />
                            <label className="textarea-field">
                                <span>备注</span>
                                <textarea value="用于对讲机、执法记录仪等通讯类执勤装备归档。" readOnly />
                            </label>
                            <div className="field-note">保存后，新分类可在新增装备、库存筛选和采购需求中使用；已有装备不会自动调整分类。</div>
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

function CreateEquipmentForm({ statusNote }: { statusNote: string }) {
    const [costMethod, setCostMethod] = useState('单件折旧');

    return (
        <div className="modal-form embedded-form">
            <div className="form-section-title">基础信息</div>
            <Field label="装备名称" value="如：数字对讲机" required />
            <SelectLike
                label="装备分类"
                value="执勤装备 / 通讯设备"
                options={equipmentCategoryOptions}
                required
            />
            <Field label="规格型号" value="公网集群/含充电座" required />
            <SelectLike label="单位" value="台" options={['台', '套', '件', '个', '根', '张', '顶', '双']} required />
            <Field label="参考价格" value="386" />
            <SelectLike label="状态" value="启用" options={['启用', '停用']} required />
            <div className="field-note">{statusNote}</div>
            <div className="form-section-title">管理规则</div>
            <SelectLike
                label="成本计算方式"
                value={costMethod}
                options={['移动加权平均', '批次管理', '单件折旧']}
                onChange={setCostMethod}
                required
            />
            <SelectLike label="是否一物一码管理" value={costMethod === '单件折旧' ? '是' : '否'} options={['是', '否']} required />
            <div className="field-note">成本计算方式统一为「移动加权平均、批次管理、单件折旧」。选择「单件折旧」时必须启用一物一码管理；选择「批次管理」时，出库按先进先出优先扣减较早入库批次。</div>
            {costMethod === '单件折旧' && (
                <>
                    <div className="form-section-title">折旧信息</div>
                    <Field label="折旧年限（月）" value="36" required />
                    <Field label="残值率" value="5%" required />
                    <div className="field-note">目前仅支持直线法，系统按采购原值、残值率和折旧年限计提；项目或人员确认领用后才开始归集折旧成本。</div>
                </>
            )}
            <div className="form-section-title">图片与备注</div>
            <Field label="适用岗位/场景" value="固定岗、巡逻岗、秩序维护" wide />
            <div className="image-upload-field">
                <span>装备图片</span>
                <button type="button" className="secondary-btn">上传图片</button>
                <em>支持用于采购、入库和领用时核对外观</em>
            </div>
            <label className="textarea-field">
                <span>备注</span>
                <textarea value="如需特殊尺码、定制标识或使用备注，可在此说明。" readOnly />
            </label>
            <div className="modal-tip form-tip">
                {costMethod === '单件折旧'
                    ? '选择「单件折旧」后，入库扫码或录码会写入采购原值和折旧规则；项目或人员确认领用后开始按直线法计算折旧，可在库存管理的「一物一码装备」中查看折旧记录。'
                    : costMethod === '批次管理'
                        ? '选择「批次管理」后，入库确认时生成批次号、入库单价和订单来源；出库按先进先出优先扣减较早入库批次。'
                        : '选择「移动加权平均」后，系统按当前库存总金额和库存数量计算加权单价，项目领用时一次归集成本。'}
            </div>
        </div>
    );
}
