import React from 'react';
import {
    WarehouseRow,
    warehouses,
    currency,
    StatusTag,
    FilterBar,
    Field,
    SelectLike,
    DataTable,
    OpenBusinessWindow,
    RowActions,
    SectionTitle,
    DetailGrid,
} from '../shared';

export function WarehousePage({ openWindow }: { openWindow: OpenBusinessWindow }) {
    return (
        <>
            <FilterBar>
                <SelectLike label="仓库类型" value="全部类型" />
                <Field label="仓库名称" value="请输入仓库名称" />
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
