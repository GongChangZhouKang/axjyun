import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus';
import * as Icons from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';

type Status = '启用' | '停用';

interface CategoryNode {
    id: string;
    name: string;
    code: string;
    itemCount: number;
    status: Status;
    sort: number;
    children?: CategoryNode[];
}

interface EquipmentRow {
    id: number;
    code: string;
    name: string;
    enabled: boolean;
    categoryPath: string[];
    category: string;
    unit: string;
    supplier: string;
    price: number;
    modifier: string;
    modifiedAt: string;
}

const template = String.raw`
<div class="security-shell">
  <header class="security-header">
    <div class="brand-block">
      <svg class="brand-mark" viewBox="0 0 42 42" aria-hidden="true"><path d="M6 31.5 19.8 7.8c.7-1.2 2.5-1.2 3.2 0l3.3 5.8-3.8 6.4-1.2-2.1-9.8 17H7.9c-1.5 0-2.6-1.7-1.9-3.4Z" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="m16.2 34.9 12.1-20.8c.7-1.2 2.4-1.2 3.1 0l3.8 6.5-3.9 6.2-1.5-2.5-6.1 10.6h-7.5Z" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24.2 27.5h10.4c1.5 0 2.4 1.6 1.7 2.9l-2.1 3.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/></svg>
      <span class="brand-name">智慧安保管理平台</span><span class="version-chip">v 1.8.96</span>
    </div>
    <div class="header-tools"><strong>{{ nowLabel }}</strong><span class="round-tool"><el-icon><BellFilled /></el-icon></span><span class="account"><span class="round-tool"><el-icon><UserFilled /></el-icon></span><b>山东振邦保安服务有限责任公司</b><el-icon class="account-arrow"><ArrowDown /></el-icon></span></div>
  </header>

  <aside class="security-sidebar"><nav class="side-nav">
    <div v-for="item in navBefore" :key="item.label" class="nav-group"><div class="nav-row"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span><el-icon v-if="item.expandable" class="nav-arrow"><ArrowDown /></el-icon></div></div>
    <div class="nav-group equipment-group"><div class="nav-row"><el-icon><Box /></el-icon><span>装备管理</span><el-icon class="nav-arrow"><ArrowUp /></el-icon></div><div v-for="child in equipmentChildren" :key="child" :class="['nav-child', {active: child === '装备档案管理'}]">{{ child }}</div></div>
    <div v-for="item in navAfter" :key="item.label" class="nav-group"><div class="nav-row"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span><el-icon class="nav-arrow"><ArrowDown /></el-icon></div></div>
  </nav></aside>

  <main class="security-main">
    <div class="page-tabs"><button class="tab-item">首页</button><button class="tab-item active">装备档案管理 <span class="tab-close">×</span></button><button class="tab-item">采购管理</button><button class="tab-item">可视化调度</button><button class="tab-item">人防项目</button></div>
    <section class="content-area">
      <div class="module-tabs"><button :class="{active: activeModule === 'archive'}" @click="activeModule='archive'">装备档案</button><button :class="{active: activeModule === 'categories'}" @click="activeModule='categories'">分类管理</button></div>

      <template v-if="activeModule === 'archive'">
        <section class="filter-card archive-filter-card"><div class="filter-grid archive-filter-grid">
          <label class="field-shell name-field"><span>装备名称：</span><el-input v-model="filters.name" placeholder="请输入装备名称或编码" clearable @keyup.enter="runSearch" /></label>
          <label class="field-shell"><span>装备分类：</span><el-cascader v-model="filters.categoryPath" :options="categoryOptions" :props="filterCascaderProps" placeholder="全部分类" clearable /></label>
          <label class="field-shell"><span>供应商：</span><el-autocomplete v-model="filters.supplier" :fetch-suggestions="querySuppliers" placeholder="请输入供应商" clearable /></label>
          <label class="field-shell status-field"><span>状态：</span><el-radio-group v-model="filters.status"><el-radio value="全部">全部</el-radio><el-radio value="启用">启用</el-radio><el-radio value="未启用">未启用</el-radio></el-radio-group></label>
          <div class="filter-actions"><el-button type="primary" @click="runSearch">查询</el-button><el-button @click="resetFilters">重置</el-button></div>
        </div></section>
        <div class="table-toolbar"><el-button type="primary" @click="openEquipment()"><el-icon><Plus /></el-icon>新增装备</el-button></div>
        <section class="table-wrap"><el-table :data="visibleRows" stripe row-key="id" class="equipment-table" empty-text="暂无筛选结果">
          <el-table-column prop="code" label="装备编码" width="145" fixed="left" />
          <el-table-column prop="name" label="装备名称" min-width="220"><template #default="scope"><el-link type="primary" underline="never" @click="openEquipment(scope.row)">{{ scope.row.name }}</el-link></template></el-table-column>
          <el-table-column label="状态" width="90" align="center"><template #default="scope"><button type="button" :class="['source-switch', { on: scope.row.enabled }]" @click="scope.row.enabled=!scope.row.enabled; toggleStatus(scope.row)"><span class="source-switch__knob"></span></button></template></el-table-column>
          <el-table-column prop="category" label="分类" min-width="190" show-overflow-tooltip /><el-table-column prop="unit" label="单位" width="80" /><el-table-column prop="supplier" label="供应商" min-width="170" show-overflow-tooltip /><el-table-column prop="price" label="参考价格" width="105" align="right" /><el-table-column label="图片" width="75" align="center"><template #default>—</template></el-table-column><el-table-column prop="modifier" label="修改人" width="120" show-overflow-tooltip /><el-table-column prop="modifiedAt" label="修改时间" width="155" />
          <el-table-column label="操作" width="120" fixed="right" align="center"><template #default="scope"><el-button link type="primary" @click="openEquipment(scope.row)">编辑</el-button><el-button link type="danger" @click="removeRow(scope.row)">删除</el-button></template></el-table-column>
        </el-table><div class="pagination-bar"><span>共 {{ filteredRows.length }} 条</span><el-pagination v-model:current-page="page" :page-size="10" layout="prev, pager, next" :total="filteredRows.length" /></div></section>
      </template>

      <template v-else>
        <section class="filter-card category-filter-card"><div class="filter-grid category-filter-grid">
          <label class="field-shell"><span>分类名称：</span><el-input v-model="categoryFilters.name" placeholder="请输入分类名称" clearable /></label>
          <label class="field-shell"><span>分类编码：</span><el-input v-model="categoryFilters.code" placeholder="请输入分类编码" clearable /></label>
          <label class="field-shell"><span>分类层级：</span><el-select v-model="categoryFilters.level"><el-option label="全部层级" value="全部"/><el-option label="一级分类" value="1"/><el-option label="二级分类" value="2"/><el-option label="三级分类" value="3"/></el-select></label>
          <label class="field-shell status-field"><span>状态：</span><el-radio-group v-model="categoryFilters.status"><el-radio value="全部">全部</el-radio><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></label>
          <div class="filter-actions"><el-button type="primary">查询</el-button><el-button @click="Object.assign(categoryFilters,{name:'',code:'',level:'全部',status:'全部'})">重置</el-button></div>
        </div></section>
        <div class="table-toolbar category-toolbar"><el-button type="primary" @click="openCategory()"><el-icon><Plus /></el-icon>新增分类</el-button><span class="toolbar-note">分类编码用于自动生成装备编码，保存后请谨慎修改</span></div>
        <section class="table-wrap"><el-table :data="filteredCategoryTree" stripe row-key="id" default-expand-all :tree-props="{children:'children'}" class="equipment-table category-table">
          <el-table-column prop="name" label="分类名称" min-width="260" fixed="left"/><el-table-column label="分类层级" width="120"><template #default="scope">{{ levelLabel(scope.row.id) }}</template></el-table-column><el-table-column prop="code" label="分类编码" min-width="170"><template #default="scope"><span class="code-text">{{ scope.row.code }}</span></template></el-table-column><el-table-column prop="itemCount" label="装备数" width="100" align="center"/><el-table-column label="状态" width="100" align="center"><template #default="scope"><el-tag :type="scope.row.status==='启用'?'success':'info'">{{ scope.row.status }}</el-tag></template></el-table-column><el-table-column prop="sort" label="排序" width="90" align="center"/>
          <el-table-column label="操作" width="200" fixed="right"><template #default="scope"><el-button link type="primary" @click="openCategory(scope.row)">编辑</el-button><el-button link type="primary" @click="openChildCategory(scope.row)">新增下级</el-button><el-button link type="danger" @click="removeCategoryRow(scope.row)">删除</el-button></template></el-table-column>
        </el-table><div class="pagination-bar"><span>共 {{ flatCategories.length }} 个分类，支持三级分类结构</span></div></section>
      </template>
    </section>
  </main>

  <el-dialog v-model="equipmentDialog" :title="editingId ? '编辑装备' : '新增装备'" width="720px" class="source-dialog" destroy-on-close>
    <el-form label-width="105px"><el-form-item label="装备名称" required><el-input v-model="equipmentForm.name" maxlength="20" show-word-limit placeholder="请输入装备名称" /></el-form-item><el-form-item label="装备分类" required><el-cascader v-model="equipmentForm.categoryPath" :options="categoryOptions" :props="equipmentCascaderProps" filterable clearable placeholder="请选择末级分类" @change="handleEquipmentCategoryChange" /></el-form-item><el-form-item label="装备编码"><el-input :model-value="equipmentForm.code || '选择末级分类后自动生成'" disabled/><div class="form-help">编码规则：末级分类编码 + 三位流水号，例如 FZ-YD-001。</div></el-form-item><el-form-item label="单位" required><el-input v-model="equipmentForm.unit" placeholder="请输入单位" /></el-form-item><el-form-item label="供应商" required><el-autocomplete v-model="equipmentForm.supplier" :fetch-suggestions="querySuppliers" placeholder="输入名称可联想选择" /></el-form-item><el-form-item label="参考价格"><el-input-number v-model="equipmentForm.price" :min="0" :controls="false" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="equipmentForm.enabled"><el-radio :value="true">启用</el-radio><el-radio :value="false">未启用</el-radio></el-radio-group></el-form-item><el-form-item label="图片"><div class="upload-tile"><el-icon><Plus /></el-icon></div></el-form-item></el-form>
    <template #footer><el-button @click="equipmentDialog=false">取消</el-button><el-button type="primary" @click="saveEquipment">保存</el-button></template>
  </el-dialog>

  <el-dialog v-model="categoryDialog" :title="editingCategoryId ? '编辑分类' : '新增分类'" width="610px" class="source-dialog" destroy-on-close>
    <el-form label-width="105px"><el-form-item label="分类名称" required><el-input v-model="categoryForm.name" maxlength="20" show-word-limit /></el-form-item><el-form-item label="上级分类"><el-cascader v-model="categoryForm.parentPath" :options="categoryOptions" :props="parentCascaderProps" clearable placeholder="不选择则创建一级分类"/><div class="form-help">最多支持三级分类。</div></el-form-item><el-form-item label="分类编码" required><el-input v-model="categoryForm.code" maxlength="20" @input="normalizeCategoryCode" placeholder="大写字母、数字或短横线"/><div class="form-help">编码全局唯一，将作为装备编码前缀。</div></el-form-item><el-form-item label="状态"><el-radio-group v-model="categoryForm.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item><el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="1" :max="999" /></el-form-item></el-form>
    <template #footer><el-button @click="categoryDialog=false">取消</el-button><el-button type="primary" @click="saveCategory">保存</el-button></template>
  </el-dialog>
</div>`;

const categorySeed: CategoryNode[] = [
    { id: 'fz', name: '保安员服装', code: 'FZ', itemCount: 18, status: '启用', sort: 10, children: [
        { id: 'fz-wyk', name: '外衣裤', code: 'FZ-WYK', itemCount: 8, status: '启用', sort: 10 },
        { id: 'fz-yd', name: '腰带', code: 'FZ-YD', itemCount: 2, status: '启用', sort: 20 },
        { id: 'fz-m', name: '帽', code: 'FZ-M', itemCount: 2, status: '启用', sort: 30 },
    ] },
    { id: 'zq', name: '执勤装备', code: 'ZQ', itemCount: 24, status: '启用', sort: 20, children: [
        { id: 'zq-zmsb', name: '照明设备', code: 'ZQ-ZMSB', itemCount: 5, status: '启用', sort: 10 },
        { id: 'zq-txsb', name: '通讯设备', code: 'ZQ-TXSB', itemCount: 4, status: '启用', sort: 20 },
    ] },
    { id: 'bdfh', name: '被动防护装备', code: 'BDFH', itemCount: 16, status: '启用', sort: 30, children: [
        { id: 'bdfh-fcf', name: '防刺服', code: 'BDFH-FCF', itemCount: 5, status: '启用', sort: 10 },
        { id: 'bdfh-fbt', name: '防爆毯', code: 'BDFH-FBT', itemCount: 0, status: '停用', sort: 20 },
    ] },
];

const rowsSeed: EquipmentRow[] = [
    { id: 1, code: 'FZ-WYK-001', name: '应急救援夏服-三棵树', enabled: true, categoryPath: ['fz','fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '三棵树', price: 195, modifier: '山东振邦保安服务有限责任公司', modifiedAt: '2026-01-26 11:38' },
    { id: 2, code: 'FZ-WYK-002', name: '应急救援服-安豹', enabled: true, categoryPath: ['fz','fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '安豹', price: 480, modifier: '山东振邦保安服务有限责任公司', modifiedAt: '2026-01-26 11:38' },
    { id: 3, code: 'FZ-WYK-003', name: '速干短衣-安豹', enabled: true, categoryPath: ['fz','fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '安豹', price: 86, modifier: '刘珍珍', modifiedAt: '2026-03-03 09:13' },
    { id: 4, code: 'FZ-M-001', name: '速干执勤帽子-三棵树', enabled: true, categoryPath: ['fz','fz-m'], category: '保安员服装 / 帽', unit: '个', supplier: '三棵树', price: 20, modifier: '山东振邦保安服务有限责任公司', modifiedAt: '2026-01-26 11:39' },
    { id: 5, code: 'ZQ-ZMSB-001', name: '强光手电', enabled: true, categoryPath: ['zq','zq-zmsb'], category: '执勤装备 / 照明设备', unit: '个', supplier: '易安通设备', price: 92, modifier: '孙鹏', modifiedAt: '2026-06-18 14:20' },
    { id: 6, code: 'ZQ-TXSB-001', name: '数字对讲机', enabled: false, categoryPath: ['zq','zq-txsb'], category: '执勤装备 / 通讯设备', unit: '台', supplier: '易安通设备', price: 386, modifier: '孙鹏', modifiedAt: '2026-06-18 14:15' },
    { id: 7, code: 'BDFH-FCF-001', name: '防刺服', enabled: true, categoryPath: ['bdfh','bdfh-fcf'], category: '被动防护装备 / 防刺服', unit: '件', supplier: '安豹', price: 640, modifier: '王宁', modifiedAt: '2026-06-17 10:05' },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const flatten = (nodes: CategoryNode[], path: string[] = []): Array<{node: CategoryNode; path: string[]}> => nodes.flatMap((node) => { const next = [...path, node.id]; return [{ node, path: next }, ...flatten(node.children ?? [], next)]; });
function findCategory(nodes: CategoryNode[], id: string): CategoryNode | undefined { for (const node of nodes) { if (node.id === id) return node; const found = findCategory(node.children ?? [], id); if (found) return found; } }
const makeOptions = (nodes: CategoryNode[]): any[] => nodes.map((node) => ({ value: node.id, label: `${node.name}（${node.code}）`, disabled: node.status === '停用', children: node.children?.length ? makeOptions(node.children) : undefined }));
function filterTree(nodes: CategoryNode[], name: string, code: string, status: string, levelFilter: string, level = 1): CategoryNode[] { const nameKey = name.trim().toLowerCase(); const codeKey = code.trim().toLowerCase(); return nodes.flatMap((node) => { const children = filterTree(node.children ?? [], name, code, status, levelFilter, level + 1); const match = (!nameKey || node.name.toLowerCase().includes(nameKey)) && (!codeKey || node.code.toLowerCase().includes(codeKey)) && (status === '全部' || node.status === status) && (levelFilter === '全部' || Number(levelFilter) === level); return match || children.length ? [{ ...node, children }] : []; }); }

const render = new Function('Vue', compile(template, { mode: 'function' }).code)(Vue);

export function mountEquipmentArchiveExact(target: HTMLElement) {
    const component = Vue.defineComponent({
        name: 'EquipmentArchiveExactVue', render,
        setup() {
            const activeModule = Vue.ref<'archive'|'categories'>('archive');
            const rows = Vue.ref(clone(rowsSeed));
            const categories = Vue.ref(clone(categorySeed));
            const page = Vue.ref(1);
            const nowLabel = Vue.ref('2026-07-01 01:26:46');
            const filters = Vue.reactive({ name: '', categoryPath: [] as string[], supplier: '', status: '全部' });
            const categoryFilters = Vue.reactive({ name: '', code: '', level: '全部', status: '全部' });
            const equipmentDialog = Vue.ref(false);
            const categoryDialog = Vue.ref(false);
            const editingId = Vue.ref<number|null>(null);
            const editingCategoryId = Vue.ref<string|null>(null);
            const equipmentForm = Vue.reactive<any>({ name: '', code: '', categoryPath: [], unit: '', supplier: '', price: 0, enabled: true });
            const categoryForm = Vue.reactive<any>({ name: '', parentPath: [], code: '', status: '启用', sort: 10 });
            const supplierNames = ['三棵树', '安豹', '易安通设备', '京东慧采-三棵树安保用品'];
            const flatCategories = Vue.computed(() => flatten(categories.value));
            const categoryOptions = Vue.computed(() => makeOptions(categories.value));
            const filteredCategoryTree = Vue.computed(() => filterTree(categories.value, categoryFilters.name, categoryFilters.code, categoryFilters.status, categoryFilters.level));
            const filteredRows = Vue.computed(() => rows.value.filter((row) => {
                const key = filters.name.trim().toLowerCase();
                return (!key || row.name.toLowerCase().includes(key) || row.code.toLowerCase().includes(key))
                    && (!filters.supplier || row.supplier.toLowerCase().includes(filters.supplier.toLowerCase()))
                    && (filters.status === '全部' || (filters.status === '启用' ? row.enabled : !row.enabled))
                    && (!filters.categoryPath.length || filters.categoryPath.every((id, i) => row.categoryPath[i] === id));
            }));
            const visibleRows = Vue.computed(() => filteredRows.value.slice((page.value - 1) * 10, page.value * 10));
            const filterCascaderProps = { checkStrictly: true, emitPath: true };
            const equipmentCascaderProps = { emitPath: true };
            const parentCascaderProps = { checkStrictly: true, emitPath: true };

            const navBefore = [{ label: '可视化调度', icon: Icons.DataAnalysis },{ label: '智慧安检数据大屏', icon: Icons.Monitor },{ label: '安保数据', icon: Icons.Histogram, expandable: true },{ label: '审批管理', icon: Icons.WarningFilled, expandable: true },{ label: '合同管理', icon: Icons.Document, expandable: true },{ label: '项目管理', icon: Icons.Tickets, expandable: true }];
            const navAfter = [{ label: '考勤管理', icon: Icons.Calendar },{ label: '督导管理', icon: Icons.Flag },{ label: '客户管理', icon: Icons.UserFilled },{ label: '薪酬', icon: Icons.Money },{ label: '人事管理', icon: Icons.User },{ label: '组织架构管理', icon: Icons.Tools },{ label: '服务管理', icon: Icons.Briefcase },{ label: '系统管理', icon: Icons.Setting }];
            const equipmentChildren = ['装备档案管理','采购管理','调拨管理','库存管理','出库管理','入库管理'];

            function runSearch() { page.value = 1; ElMessage.success(`已找到 ${filteredRows.value.length} 条装备档案`); }
            function resetFilters() { Object.assign(filters, { name: '', categoryPath: [], supplier: '', status: '全部' }); page.value = 1; }
            function querySuppliers(query: string, cb: (items: Array<{value:string}>) => void) { const key = query.trim().toLowerCase(); cb(supplierNames.filter((name) => !key || name.toLowerCase().includes(key)).map((value) => ({ value }))); }
            function nextCode(path: string[]) { const leaf = findCategory(categories.value, path[path.length - 1] ?? ''); if (!leaf) return ''; const prefix = `${leaf.code}-`; const max = rows.value.reduce((n, row) => row.id !== editingId.value && row.code.startsWith(prefix) ? Math.max(n, Number(row.code.slice(prefix.length)) || 0) : n, 0); return `${prefix}${String(max + 1).padStart(3, '0')}`; }
            function handleEquipmentCategoryChange(path: string[]) { const leaf = findCategory(categories.value, path?.[path.length - 1] ?? ''); if (leaf?.children?.length) { equipmentForm.code = ''; ElMessage.warning('请选择末级分类'); } else equipmentForm.code = nextCode(path ?? []); }
            function openEquipment(row?: EquipmentRow) { editingId.value = row?.id ?? null; Object.assign(equipmentForm, row ? { ...row, categoryPath: [...row.categoryPath] } : { name: '', code: '', categoryPath: [], unit: '', supplier: '', price: 0, enabled: true }); equipmentDialog.value = true; }
            function saveEquipment() { const leafId = equipmentForm.categoryPath[equipmentForm.categoryPath.length - 1] ?? ''; const leaf = findCategory(categories.value, leafId); if (!equipmentForm.name || !equipmentForm.unit || !equipmentForm.supplier || !leaf || leaf.children?.length) { ElMessage.warning('请完整填写装备名称、末级分类、单位和供应商'); return; } const payload: EquipmentRow = { id: editingId.value ?? Date.now(), code: equipmentForm.code || nextCode(equipmentForm.categoryPath), name: equipmentForm.name, enabled: equipmentForm.enabled, categoryPath: [...equipmentForm.categoryPath], category: equipmentForm.categoryPath.map((id: string) => findCategory(categories.value,id)?.name).filter(Boolean).join(' / '), unit: equipmentForm.unit, supplier: equipmentForm.supplier, price: Number(equipmentForm.price), modifier: '当前用户', modifiedAt: '2026-07-01 01:26' }; const index = rows.value.findIndex((row) => row.id === editingId.value); if (index >= 0) rows.value.splice(index,1,payload); else rows.value.unshift(payload); equipmentDialog.value = false; page.value = 1; ElMessage.success(editingId.value ? '装备档案已更新' : `装备已新增，编码为 ${payload.code}`); }
            async function removeRow(row: EquipmentRow) { const ok = await ElMessageBox.confirm(`确定删除“${row.name}”吗？`,'删除确认',{type:'warning',confirmButtonText:'确定删除',cancelButtonText:'取消'}).then(()=>true).catch(()=>false); if (ok) { rows.value = rows.value.filter((item) => item.id !== row.id); ElMessage.success('删除成功'); } }
            function toggleStatus(row: EquipmentRow) { ElMessage.success(`${row.name}已${row.enabled ? '启用' : '停用'}`); }

            function findPath(id: string) { return flatCategories.value.find(({node}) => node.id === id)?.path ?? []; }
            function openCategory(row?: CategoryNode) { editingCategoryId.value = row?.id ?? null; const ownPath = row ? findPath(row.id) : []; Object.assign(categoryForm, row ? { name: row.name, parentPath: ownPath.slice(0,-1), code: row.code, status: row.status, sort: row.sort } : { name: '', parentPath: [], code: '', status: '启用', sort: 10 }); categoryDialog.value = true; }
            function openChildCategory(row: CategoryNode) { const path = findPath(row.id); if (path.length >= 3) { ElMessage.warning('最多支持三级分类'); return; } editingCategoryId.value = null; Object.assign(categoryForm,{name:'',parentPath:path,code:`${row.code}-`,status:'启用',sort:10}); categoryDialog.value = true; }
            function normalizeCategoryCode(value: string) { categoryForm.code = value.toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/--+/g,'-'); }
            function insertCategory(nodes: CategoryNode[], parentId: string|undefined, node: CategoryNode): boolean { if (!parentId) { nodes.push(node); return true; } for (const parent of nodes) { if (parent.id === parentId) { (parent.children ??= []).push(node); return true; } if (insertCategory(parent.children ?? [],parentId,node)) return true; } return false; }
            function removeCategory(nodes: CategoryNode[], id: string): boolean { const index = nodes.findIndex((node)=>node.id===id); if (index>=0) { nodes.splice(index,1); return true; } return nodes.some((node)=>removeCategory(node.children ?? [],id)); }
            function saveCategory() { if (!categoryForm.name || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(categoryForm.code)) { ElMessage.warning('请填写分类名称和有效分类编码'); return; } if (flatCategories.value.some(({node}) => node.code === categoryForm.code && node.id !== editingCategoryId.value)) { ElMessage.warning('分类编码已存在'); return; } if (categoryForm.parentPath.length >= 3) { ElMessage.warning('最多支持三级分类'); return; } if (editingCategoryId.value) { const targetNode = findCategory(categories.value,editingCategoryId.value); if (targetNode) Object.assign(targetNode,{name:categoryForm.name,code:categoryForm.code,status:categoryForm.status,sort:categoryForm.sort}); } else { const parentId = categoryForm.parentPath[categoryForm.parentPath.length - 1]; insertCategory(categories.value,parentId,{id:`category-${Date.now()}`,name:categoryForm.name,code:categoryForm.code,itemCount:0,status:categoryForm.status,sort:categoryForm.sort}); } categories.value=[...categories.value]; categoryDialog.value=false; ElMessage.success(editingCategoryId.value?'分类已更新':'分类已新增'); }
            async function removeCategoryRow(row: CategoryNode) { if (row.children?.length) { ElMessage.warning('该分类包含下级分类，请先处理下级分类'); return; } if (row.itemCount > 0 || rows.value.some((item)=>item.categoryPath.includes(row.id))) { ElMessage.warning('该分类已关联装备，无法删除'); return; } const ok = await ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`,'删除确认',{type:'warning'}).then(()=>true).catch(()=>false); if (ok) { removeCategory(categories.value,row.id); categories.value=[...categories.value]; ElMessage.success('分类已删除'); } }
            function levelLabel(id: string) { return ['一级分类','二级分类','三级分类'][findPath(id).length-1] ?? ''; }

            return { activeModule, nowLabel, navBefore, navAfter, equipmentChildren, filters, categoryFilters, page, rows, filteredRows, visibleRows, categories, categoryOptions, flatCategories, filteredCategoryTree, filterCascaderProps, equipmentCascaderProps, parentCascaderProps, equipmentDialog, categoryDialog, editingId, editingCategoryId, equipmentForm, categoryForm, runSearch, resetFilters, querySuppliers, handleEquipmentCategoryChange, openEquipment, saveEquipment, removeRow, toggleStatus, openCategory, openChildCategory, normalizeCategoryCode, saveCategory, removeCategoryRow, levelLabel };
        },
    });
    const app = Vue.createApp(component);
    app.use(ElementPlus);
    Object.entries(Icons).forEach(([name, icon]) => app.component(name, icon));
    app.mount(target);
    return () => app.unmount();
}
