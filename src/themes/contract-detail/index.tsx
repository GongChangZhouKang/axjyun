/**
 * @name 安保管理平台后台主题 - Security Management Platform Admin Theme
 */

import './style.css';
import React, { useState } from 'react';
import { Building2, Camera, ChevronRight, FileCheck2, ShieldCheck, UserPlus, UsersRound, X } from 'lucide-react';

import {
  DesignMdBatchShowcase,
  type BatchShowcaseConfig,
  type BatchShowcaseTab,
} from '../../common/DesignMdBatchShowcase';
import themeData from './theme.json';
import previewContractList from './assets/security-contract-list.png?url';
import previewEmployeeModal from './assets/security-employee-add-modal.png?url';
import previewEmployeeList from './assets/security-employee-list.png?url';
import previewEmployeeOnboarding from './assets/security-employee-onboarding.png?url';
import previewEquipmentOutbound from './assets/security-equipment-outbound.png?url';
import previewContractDetail from './assets/source-preview.png?url';

type ThemeDisplayData = Omit<BatchShowcaseConfig, 'previewImages'> & {
  previewImages: Array<{ type: string; path: string }>;
};

type DemoRow = {
  period: string;
  owner: string;
  status: '已维护' | '待复核';
  result: string;
  progress: number;
  due: string;
  actual: string;
};

const demoRows: DemoRow[] = [
  {
    period: '2026 上半年',
    owner: '张云建',
    status: '已维护',
    result: '人员档案与合同信息齐全',
    progress: 100,
    due: '2026-06-30',
    actual: '2026-06-28',
  },
  {
    period: '2025 下半年',
    owner: '李敏',
    status: '待复核',
    result: '待复核 2 项人员信息',
    progress: 72,
    due: '2025-12-31',
    actual: '—',
  },
];

const typeScale = [
  { name: '页面标题', spec: '18 / 26 · 500', size: '18px', lineHeight: '26px', weight: 500 },
  { name: '分区标题', spec: '16 / 24 · 500', size: '16px', lineHeight: '24px', weight: 500 },
  { name: '默认正文', spec: '14 / 21 · 400', size: '14px', lineHeight: '21px', weight: 400 },
  { name: '表头标签', spec: '14 / 21 · 700', size: '14px', lineHeight: '21px', weight: 700 },
  { name: '辅助说明', spec: '12 / 18 · 400', size: '12px', lineHeight: '18px', weight: 400 },
];

const spacingScale = [2, 4, 6, 7, 8, 10, 12, 16, 18, 20, 24, 32];

const referenceScreens = [
  { title: '合同列表', note: '筛选、导出、状态与斑马纹表格', url: previewContractList },
  { title: '添加用户弹窗', note: '遮罩、两列表单、角色多选与固定底栏', url: previewEmployeeModal },
  { title: '在职员工', note: '组织树、批量工具栏与待签署状态', url: previewEmployeeList },
  { title: '员工入职', note: '日期筛选、成功状态与分页', url: previewEmployeeOnboarding },
  { title: '装备出库', note: '分组表单、空状态与页面操作栏', url: previewEquipmentOutbound },
  { title: '合同详情', note: '摘要卡、页签和维护列表', url: previewContractDetail },
];

function ContractTokenDetails() {
  return (
    <section className="contract-token-demo" aria-label="安保管理平台精确 Token 明细">
      <header>
        <p>Source evidence → production semantics</p>
        <h2>精确 Token 明细</h2>
        <span>公共展示页的营销字号样例不适用于本主题；以下数值为实际规范。</span>
      </header>

      <div className="contract-token-demo__section">
        <h3>排版 · Typography</h3>
        <div className="contract-token-demo__type-grid">
          {typeScale.map(item => (
            <article key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <code>{item.spec}</code>
              </div>
              <p style={{ fontSize: item.size, lineHeight: item.lineHeight, fontWeight: item.weight }}>
                合同信息清晰可读 Aa 2026
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="contract-token-demo__section">
        <h3>间距 · Spacing</h3>
        <div className="contract-token-demo__spacing">
          {spacingScale.map(value => (
            <article key={value}>
              <span style={{ width: `${Math.max(value * 3, 6)}px` }} />
              <code>{value}px</code>
            </article>
          ))}
        </div>
        <p className="contract-token-demo__note">7px 仅用于 34px 控件的垂直密度微调，不作为通用栅格。</p>
      </div>

      <div className="contract-token-demo__section">
        <h3>系统蓝 · Interaction blues</h3>
        <div className="contract-token-demo__blue-grid">
          <article className="is-production">
            <small>默认 · System primary</small>
            <strong>#129BFF</strong>
            <p>原系统主按钮、批量工具栏与选中条。</p>
          </article>
          <article className="is-source-button">
            <small>交互 · Hover / Link</small>
            <strong>#2D8CF0</strong>
            <p>文字链接、hover、focus 与交互强调。</p>
          </article>
          <article className="is-source-accent">
            <small>备用 · Accessible fallback</small>
            <strong>#096DD9</strong>
            <p>仅在明确要求高对比度时局部使用。</p>
          </article>
        </div>
      </div>

      <div className="contract-token-demo__section">
        <h3>状态语义 · Semantic states</h3>
        <div className="contract-token-demo__semantic-grid">
          <article className="is-running"><small>执行中</small><strong>#19BE6B</strong><p>流程执行、任务运行</p></article>
          <article className="is-warning"><small>待处理</small><strong>#FFAE00</strong><p>待签署、待复核</p></article>
          <article className="is-danger"><small>危险操作</small><strong>#F52C2C</strong><p>离职、终止、删除</p></article>
          <article className="is-feature"><small>功能专用</small><strong>#667EEA → #764BA2</strong><p>仅限照片录入</p></article>
        </div>
      </div>
    </section>
  );
}

function ReferenceGallery() {
  return (
    <section className="security-reference-gallery" aria-label="安保管理平台参考界面">
      <header>
        <p>6 screens · 4 workflow families</p>
        <h2>系统级参考界面</h2>
        <span>合同、员工、表单浮层与装备业务共同约束这套主题。</span>
      </header>
      <div>
        {referenceScreens.map(screen => (
          <figure key={screen.title}>
            <img src={screen.url} alt={`${screen.title}参考界面`} loading="lazy" />
            <figcaption><strong>{screen.title}</strong><span>{screen.note}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function SystemPatternsDemo() {
  const [selectedOrg, setSelectedOrg] = useState('山东振邦保安服务有限责任公司');
  const [showDialog, setShowDialog] = useState(false);
  const organizations = ['山东振邦保安服务有限责任公司', '直属分公司', '历城分公司', '市中分公司'];

  return (
    <section className="security-system-demo" aria-label="安保管理平台系统组件">
      <header>
        <div><h2>员工信息</h2><p>组织树、批量操作、语义状态和大型表单浮层</p></div>
        <button className="security-primary-button" type="button" onClick={() => setShowDialog(true)}>
          <UserPlus aria-hidden="true" />添加用户
        </button>
      </header>

      <div className="security-system-demo__workspace">
        <aside className="security-org-tree" aria-label="组织树">
          <input aria-label="搜索组织" placeholder="请输入部门或项目名" />
          {organizations.map((organization, index) => (
            <button
              className={selectedOrg === organization ? 'is-selected' : ''}
              key={organization}
              type="button"
              onClick={() => setSelectedOrg(organization)}
            >
              <ChevronRight aria-hidden="true" />
              <Building2 aria-hidden="true" />
              <span>{organization}</span>
              {index === 0 ? <small>20</small> : null}
            </button>
          ))}
        </aside>

        <div className="security-system-demo__list">
          <div className="security-batch-toolbar">
            <button type="button">添加</button><button type="button">批量操作</button><button type="button">导入</button><button type="button">导出</button>
            <button type="button">标签管理</button><button type="button">更新工资信息</button>
          </div>
          <div className="security-semantic-strip">
            <span className="is-success">已入职</span>
            <span className="is-running">执行中</span>
            <span className="is-warning">待签署</span>
            <span className="is-muted">未执行</span>
            <span className="is-danger">终止 / 离职</span>
          </div>
          <div className="security-system-table-wrap">
            <table>
              <thead><tr><th>姓名</th><th>部门</th><th>主岗（职位）</th><th>合同状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr><td><a href="#employee-1">张文志</a></td><td>校卫二中队</td><td>保安员</td><td><span className="is-warning">待签署</span></td><td><a href="#edit-1">编辑</a> <button type="button" className="is-danger-link">离职</button></td></tr>
                <tr><td><a href="#employee-2">王大勇</a></td><td>历城分公司</td><td>中队长</td><td><span className="is-success">已入职</span></td><td><a href="#edit-2">编辑</a> <button type="button" className="is-danger-link">离职</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDialog ? (
        <div className="security-modal-layer" role="presentation">
          <section className="security-modal" role="dialog" aria-modal="true" aria-labelledby="security-modal-title">
            <header><h3 id="security-modal-title">添加用户</h3><button type="button" aria-label="关闭添加用户弹窗" onClick={() => setShowDialog(false)}><X aria-hidden="true" /></button></header>
            <nav aria-label="用户信息步骤"><button className="is-active" type="button">基础信息</button><button type="button">个人信息</button><button type="button">入职信息</button><button type="button">劳动合同</button><button type="button">社保信息</button></nav>
            <div className="security-modal__body">
              <h4>基础信息</h4>
              <div className="security-modal__form-grid">
                <label><span><b>*</b> 姓名：</span><input placeholder="输入姓名" /></label>
                <label><span><b>*</b> 身份证号：</span><input placeholder="输入身份证号" /></label>
                <label><span><b>*</b> 手机号：</span><input placeholder="输入手机号" /></label>
                <label><span><b>*</b> 职位：</span><select defaultValue="保安员"><option>保安员</option><option>中队长</option></select></label>
                <label><span>人员类型：</span><select defaultValue="保安员"><option>保安员</option><option>管理人员</option></select></label>
                <label><span>平台密码：</span><input type="password" placeholder="请输入密码" /></label>
              </div>
              <fieldset><legend><b>*</b> 平台角色</legend><p>请至少分配一个角色</p><label><input type="checkbox" /> 公司管理员</label><label><input type="checkbox" /> 队员</label><label><input type="checkbox" /> 高薪班长</label><label><input type="checkbox" /> 历城分公司中队长</label></fieldset>
              <button className="security-photo-action" type="button"><Camera aria-hidden="true" /><span>上传图片</span></button>
            </div>
            <footer><button type="button" onClick={() => setShowDialog(false)}>取消</button><button className="security-primary-button" type="button" onClick={() => setShowDialog(false)}>确认</button></footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function ContractComponentDemo() {
  const [activeTab, setActiveTab] = useState('维护结果');
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [status, setStatus] = useState('全部状态');

  const rows = demoRows.filter(row => {
    const matchesQuery = !appliedQuery
      || row.owner.includes(appliedQuery)
      || row.period.includes(appliedQuery);
    const matchesStatus = status === '全部状态' || row.status === status;
    return matchesQuery && matchesStatus;
  });

  const reset = () => {
    setQuery('');
    setAppliedQuery('');
    setStatus('全部状态');
  };

  return (
    <section className="contract-demo" aria-label="安保管理平台后台主题组件实景">
      <header className="contract-demo__header">
        <div>
          <h2>合同客户维护</h2>
          <p>真实密度下的页签、筛选、按钮、表格和状态组件</p>
        </div>
        <span className="contract-demo__source-chip">执行中 · System exact</span>
      </header>

      <div className="contract-demo__summary">
        <article className="contract-demo__stat">
          <span className="contract-demo__stat-icon"><UsersRound aria-hidden="true" /></span>
          <div>
            <strong>负责人</strong>
            <span>张云建</span>
          </div>
        </article>
        <article className="contract-demo__stat">
          <span className="contract-demo__stat-icon"><FileCheck2 aria-hidden="true" /></span>
          <div>
            <strong>合同人数　需求人数　空岗人数</strong>
            <span>16　　　　　16　　　　　0</span>
          </div>
        </article>
        <article className="contract-demo__stat">
          <span className="contract-demo__stat-icon"><ShieldCheck aria-hidden="true" /></span>
          <div>
            <strong>人均保费　月度保费　合同金额</strong>
            <span>300　　　　0　　　　　4800</span>
          </div>
        </article>
      </div>

      <nav className="contract-demo__tabs" aria-label="维护视图">
        {['维护结果', '维护计划'].map(tab => (
          <button
            className={`contract-demo__tab${activeTab === tab ? ' is-active' : ''}`}
            key={tab}
            type="button"
            aria-current={activeTab === tab ? 'page' : undefined}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <form
        className="contract-demo__toolbar"
        onSubmit={event => {
          event.preventDefault();
          setAppliedQuery(query.trim());
        }}
      >
        <div className="contract-demo__filters">
          <div className="contract-demo__field">
            <label htmlFor="contract-demo-owner">维护人：</label>
            <input
              id="contract-demo-owner"
              value={query}
              placeholder="请输入维护人或周期"
              onChange={event => setQuery(event.target.value)}
            />
          </div>
          <div className="contract-demo__field">
            <label htmlFor="contract-demo-status">状态：</label>
            <select
              id="contract-demo-status"
              value={status}
              onChange={event => setStatus(event.target.value)}
            >
              <option>全部状态</option>
              <option>已维护</option>
              <option>待复核</option>
            </select>
          </div>
        </div>
        <div className="contract-demo__actions">
          <button className="contract-demo__button contract-demo__button--primary" type="submit">查询</button>
          <button className="contract-demo__button" type="button" onClick={reset}>重置</button>
        </div>
      </form>

      <div className="contract-demo__table-wrap">
        <table className="contract-demo__table">
          <thead>
            <tr>
              <th>维护周期</th>
              <th>维护人</th>
              <th>状态</th>
              <th>维护结果</th>
              <th>完成度</th>
              <th>维护结束日期</th>
              <th>实际维护日期</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{row.owner}</td>
                <td>
                  <span className={`contract-demo__status${row.status === '待复核' ? ' contract-demo__status--pending' : ''}`}>
                    {row.status}
                  </span>
                </td>
                <td>{activeTab === '维护计划' ? '按周期复核人员与合同信息' : row.result}</td>
                <td>
                  <span className="contract-demo__progress" aria-label={`完成度 ${row.progress}%`}>
                    <span style={{ width: `${row.progress}%` }} />
                  </span>
                </td>
                <td>{row.due}</td>
                <td>{row.actual}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="contract-demo__empty" colSpan={7}>暂无符合条件的数据</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="contract-demo__footnote" aria-live="polite">
        当前显示 {rows.length} 条 · 主按钮使用原系统 #129BFF，文字链接与 hover 使用 #2D8CF0，数据行固定 48px。
      </p>
    </section>
  );
}

const display = themeData.display as unknown as ThemeDisplayData;

const config: BatchShowcaseConfig = {
  brand: display.brand,
  brandAlias: display.brandAlias,
  source: themeData.source,
  description: display.description,
  descriptionEn: display.descriptionEn,
  variant: display.variant,
  distributionTags: display.distributionTags,
  fontStylesheets: display.fontStylesheets,
  palette: display.palette,
  radius: display.radius,
  spacing: display.spacing,
  typography: display.typography,
  previewImages: [
    { type: display.previewImages[0].type, url: previewContractList },
  ],
  usageGuidance: display.usageGuidance,
  shadows: display.shadows,
  borders: display.borders,
  panels: display.panels,
};

const tabs: BatchShowcaseTab[] = [
  {
    id: 'references',
    label: '参考界面',
    content: <ReferenceGallery />,
  },
  {
    id: 'token-details',
    label: 'Token 明细',
    content: <ContractTokenDetails />,
  },
  {
    id: 'component-demo',
    label: '列表组件',
    content: <ContractComponentDemo />,
  },
  {
    id: 'system-patterns',
    label: '系统组件',
    content: <SystemPatternsDemo />,
  },
];

const Component: React.FC = () => (
  <DesignMdBatchShowcase config={config} tabs={tabs} className="contract-theme" />
);

export default Component;
