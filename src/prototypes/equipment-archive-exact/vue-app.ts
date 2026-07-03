import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus';
import * as Icons from '@element-plus/icons-vue';
import { Ecc, QrCode } from '@rc-component/qrcode/es/libs/qrcodegen';
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

interface InventoryRow extends EquipmentRow {
    stock: number;
    warningThreshold: number;
}

interface OutboundRow extends InventoryRow {
    quantity: number;
}

type StatisticsReport = 'monthly' | 'summary' | 'detail';

type CheckStatus = '待开始' | '进行中' | '已完成';
interface CheckTask {
    id: string;
    name: string;
    warehouse: string;
    type: '全盘' | '抽盘';
    operator: string;
    date: string;
    description: string;
    status: CheckStatus;
}

const template = String.raw`
<div class="security-shell">
  <header v-if="showShell" class="security-header">
    <div class="brand-block">
      <img class="brand-mark" src="https://sms.axjyun.com/img/sign.b6351558.png" width="32" height="25" alt="智慧安保管理平台" />
      <span class="brand-name">智慧安保管理平台</span><span class="version-chip">v 1.8.96</span>
    </div>
    <div class="header-tools"><strong>{{ nowLabel }}</strong><span class="round-tool"><el-icon><BellFilled /></el-icon></span><span class="account"><span class="round-tool"><el-icon><UserFilled /></el-icon></span><b>山东振邦保安服务有限责任公司</b><el-icon class="account-arrow"><ArrowDown /></el-icon></span></div>
  </header>

  <aside v-if="showShell" class="security-sidebar"><nav class="side-nav">
    <div v-for="item in navBefore" :key="item.label" class="nav-group"><div class="nav-row"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span><el-icon v-if="item.expandable" class="nav-arrow"><ArrowDown /></el-icon></div></div>
    <div class="nav-group equipment-group"><div class="nav-row"><el-icon><Box /></el-icon><span>装备管理</span><el-icon class="nav-arrow"><ArrowUp /></el-icon></div><button v-for="child in equipmentChildren" :key="child" type="button" :class="['nav-child', {active: (child === '装备档案管理' && activePage === 'equipment') || (child === '库存管理' && activePage === 'inventory') || (child === '库存统计' && activePage === 'inventory-statistics') || (child === '库存盘点' && activePage.startsWith('inventory-check'))}]" @click="openChildPage(child)">{{ child }}</button></div>
    <div v-for="item in navAfter" :key="item.label" class="nav-group"><div class="nav-row"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span><el-icon class="nav-arrow"><ArrowDown /></el-icon></div></div>
  </nav></aside>

  <main :class="['security-main', {'is-standalone': !showShell}]">
    <div v-if="showShell" class="page-tabs"><button v-for="tab in openTabs" :key="tab.id" :class="['tab-item', 'tab-' + tab.id, {active: activePage === tab.id}]" @click="activePage = tab.id">{{ tab.label }}<span v-if="tab.closable && activePage === tab.id" class="tab-close" role="button" :aria-label="'关闭' + tab.label" @click.stop="closePage(tab.id)">×</span></button></div>
    <section v-if="(!showShell && activePage === 'equipment') || activePage === 'equipment'" class="content-area">
      <div class="module-tabs" data-annotation-id="archive-tabs"><button :class="{active: activeModule === 'archive'}" @click="activeModule='archive'">装备档案</button><button :class="{active: activeModule === 'categories'}" @click="activeModule='categories'">分类管理</button></div>

      <template v-if="activeModule === 'archive'">
        <section class="filter-card archive-filter-card" data-annotation-id="archive-filter"><div class="filter-grid archive-filter-grid">
          <label class="field-shell name-field"><span>装备名称：</span><el-input v-model="filters.name" placeholder="请输入装备名称或编码" clearable @keyup.enter="runSearch" /></label>
          <label class="field-shell"><span>装备分类：</span><el-cascader v-model="filters.categoryPath" :options="categoryOptions" :props="filterCascaderProps" placeholder="全部分类" clearable /></label>
          <label class="field-shell"><span>供应商：</span><el-autocomplete v-model="filters.supplier" :fetch-suggestions="querySuppliers" placeholder="请输入供应商" clearable /></label>
          <label class="field-shell status-field"><span>状态：</span><el-radio-group v-model="filters.status"><el-radio value="全部">全部</el-radio><el-radio value="启用">启用</el-radio><el-radio value="未启用">未启用</el-radio></el-radio-group></label>
          <div class="filter-actions"><el-button type="primary" @click="runSearch">查询</el-button><el-button @click="resetFilters">重置</el-button></div>
        </div></section>
        <div class="table-toolbar"><el-button type="primary" @click="openEquipment()"><el-icon><Plus /></el-icon>新增装备</el-button></div>
        <section class="table-wrap" data-annotation-id="archive-table"><el-table :data="visibleRows" stripe row-key="id" class="equipment-table" empty-text="暂无筛选结果">
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
        <section class="table-wrap" data-annotation-id="category-tree-table"><el-table :data="filteredCategoryTree" stripe row-key="id" default-expand-all :tree-props="{children:'children'}" class="equipment-table category-table">
          <el-table-column prop="name" label="分类名称" min-width="260" fixed="left"/><el-table-column label="分类层级" width="120"><template #default="scope">{{ levelLabel(scope.row.id) }}</template></el-table-column><el-table-column prop="code" label="分类编码" min-width="170"><template #default="scope"><span class="code-text">{{ scope.row.code }}</span></template></el-table-column><el-table-column prop="itemCount" label="装备数" width="100" align="center"/><el-table-column label="状态" width="100" align="center"><template #default="scope"><el-tag :type="scope.row.status==='启用'?'success':'info'">{{ scope.row.status }}</el-tag></template></el-table-column><el-table-column prop="sort" label="排序" width="90" align="center"/>
          <el-table-column label="操作" width="200" fixed="right"><template #default="scope"><el-button link type="primary" @click="openCategory(scope.row)">编辑</el-button><el-button link type="primary" @click="openChildCategory(scope.row)">新增下级</el-button><el-button link type="danger" @click="removeCategoryRow(scope.row)">删除</el-button></template></el-table-column>
        </el-table><div class="pagination-bar"><span>共 {{ flatCategories.length }} 个分类，支持三级分类结构</span></div></section>
      </template>
    </section>
    <section v-else-if="activePage === 'inventory'" class="content-area inventory-content">
      <div class="warehouse-row"><label><span>所属仓库：</span><el-select v-model="inventoryFilters.warehouse" style="width: 202px"><el-option v-for="warehouse in warehouseOptions" :key="warehouse" :label="warehouse" :value="warehouse"/></el-select></label></div>
      <section class="filter-card inventory-filter-card" data-annotation-id="inventory-filter"><div class="filter-grid inventory-filter-grid">
        <label class="field-shell"><span>装备名称：</span><el-input v-model="inventoryFilters.name" placeholder="请输入装备名称" clearable @keyup.enter="runInventorySearch" /></label>
        <label class="field-shell"><span>分类：</span><el-cascader v-model="inventoryFilters.categoryPath" :options="categoryOptions" :props="filterCascaderProps" placeholder="分类" clearable /></label>
        <label class="field-shell inventory-status-field"><span>状态：</span><el-radio-group v-model="inventoryFilters.status"><el-radio value="全部">全部</el-radio><el-radio value="启用">启用</el-radio><el-radio value="未启用">未启用</el-radio></el-radio-group></label>
        <label class="field-shell"><span>供应商：</span><el-autocomplete v-model="inventoryFilters.supplier" :fetch-suggestions="querySuppliers" placeholder="供应商" clearable /></label>
        <div class="filter-actions"><el-button type="primary" @click="runInventorySearch">查询</el-button><el-button @click="resetInventoryFilters">重置</el-button></div>
      </div></section>
      <div class="table-toolbar inventory-toolbar" data-annotation-id="inventory-warning-actions">
        <el-button><el-icon><Download /></el-icon>导出</el-button>
        <el-button type="primary" :disabled="!selectedInventoryRows.length" @click="openWarningDialog()">批量设置预警</el-button>
        <span v-if="selectedInventoryRows.length" class="toolbar-note">已选择 {{ selectedInventoryRows.length }} 件装备</span>
      </div>
      <section class="table-wrap" data-annotation-id="inventory-table"><el-table ref="inventoryTableRef" :data="visibleInventoryRows" stripe row-key="id" class="equipment-table inventory-table" empty-text="暂无筛选结果" @selection-change="handleInventorySelection">
        <el-table-column type="selection" width="46" fixed="left" />
        <el-table-column prop="name" label="装备名称" min-width="210" fixed="left" />
        <el-table-column label="状态" width="76"><template #default="scope">{{ scope.row.enabled ? '启用' : '未启用' }}</template></el-table-column>
        <el-table-column prop="category" label="分类" min-width="170" show-overflow-tooltip /><el-table-column prop="supplier" label="供应商" min-width="130" show-overflow-tooltip /><el-table-column prop="unit" label="单位" width="75" /><el-table-column prop="price" label="参考价格" width="100" align="right" /><el-table-column label="图片" width="72" align="center"><template #default>—</template></el-table-column>
        <el-table-column prop="stock" label="库存数量" width="105" align="right" sortable><template #default="scope"><span :class="stockClass(scope.row)">{{ scope.row.stock }}</span></template></el-table-column>
        <el-table-column prop="warningThreshold" label="预警数量" width="100" align="right" />
        <el-table-column label="库存状态" width="110" align="center"><template #default="scope"><el-tag v-if="scope.row.stock === 0" type="danger" effect="light">无货</el-tag><el-tag v-else-if="isLowStock(scope.row)" type="warning" effect="light">库存不足</el-tag><el-tag v-else type="success" effect="plain">正常</el-tag></template></el-table-column>
        <el-table-column label="操作" width="105" fixed="right" align="center"><template #default="scope"><el-button link type="primary" @click="openWarningDialog(scope.row)">设置预警</el-button></template></el-table-column>
      </el-table><div class="pagination-bar"><span>共 {{ filteredInventoryRows.length }} 条</span><el-pagination v-model:current-page="inventoryPage" :page-size="10" layout="prev, pager, next" :total="filteredInventoryRows.length" /></div></section>
    </section>
    <section v-else-if="activePage === 'inventory-statistics'" class="content-area statistics-content">
      <div class="warehouse-row statistics-warehouse"><label><span>所属仓库：</span><el-select v-model="statisticsFilters.warehouse" style="width: 270px"><el-option v-for="warehouse in warehouseOptions" :key="warehouse" :label="warehouse" :value="warehouse"/></el-select></label></div>
      <div class="module-tabs statistics-tabs" data-annotation-id="statistics-tabs">
        <button v-for="tab in statisticsTabs" :key="tab.id" :class="{active: statisticsReport === tab.id}" @click="switchStatisticsReport(tab.id)">{{ tab.label }}</button>
      </div>
      <section class="filter-card statistics-filter-card" data-annotation-id="statistics-filter"><div class="filter-grid statistics-filter-grid">
        <label class="field-shell date-range-field"><span>月份：</span><el-date-picker v-model="statisticsFilters.monthRange" type="monthrange" range-separator="-" start-placeholder="开始月份" end-placeholder="结束月份" value-format="YYYY-MM"/></label>
        <label class="field-shell"><span>装备名称：</span><el-input v-model="statisticsFilters.name" placeholder="请输入装备名称" clearable @keyup.enter="runStatisticsSearch"/></label>
        <label class="field-shell"><span>分类：</span><el-select v-model="statisticsFilters.category" placeholder="分类" clearable><el-option label="服装标志" value="服装标志"/><el-option label="执勤装备" value="执勤装备"/><el-option label="被动防护装备" value="被动防护装备"/></el-select></label>
        <label class="field-shell"><span>供应商：</span><el-select v-model="statisticsFilters.supplier" placeholder="供应商" clearable><el-option label="三棵树" value="三棵树"/><el-option label="安豹" value="安豹"/><el-option label="易安通设备" value="易安通设备"/></el-select></label>
        <label v-if="statisticsReport !== 'monthly'" class="field-shell department-field" data-annotation-id="statistics-department-filter"><span>部门：</span><el-select v-model="statisticsFilters.department" placeholder="全部下一级部门" clearable><el-option v-for="department in departmentOptions" :key="department" :label="department" :value="department"/></el-select></label>
        <div class="filter-actions statistics-filter-actions"><el-button type="primary" @click="runStatisticsSearch">查询</el-button><el-button @click="resetStatisticsFilters">重置</el-button></div>
      </div></section>
      <div class="table-toolbar statistics-toolbar"><el-button @click="exportStatistics"><el-icon><Download /></el-icon>导出</el-button><span class="statistics-caption">{{ statisticsCaption }}</span></div>
      <section class="table-wrap statistics-table-wrap" data-annotation-id="statistics-report-table">
        <el-table v-if="statisticsReport === 'monthly'" :data="filteredMonthlyRows" stripe class="equipment-table statistics-table" empty-text="暂无统计数据">
          <el-table-column prop="name" label="装备名称" min-width="160" fixed="left"><template #default="scope"><el-link type="primary" underline="never">{{ scope.row.name }}</el-link></template></el-table-column><el-table-column prop="category" label="分类" min-width="130"/><el-table-column prop="supplier" label="供应商" min-width="120"/><el-table-column prop="unit" label="单位" width="70"/><el-table-column prop="opening" label="月初库存" width="95" align="right"/>
          <el-table-column label="入库数量" align="center"><el-table-column prop="returnIn" label="归还入库" width="95" align="right"/><el-table-column prop="purchaseIn" label="采购入库" width="95" align="right"/><el-table-column prop="transferIn" label="调拨入库" width="95" align="right"/><el-table-column prop="otherIn" label="其他入库" width="95" align="right"/></el-table-column>
          <el-table-column label="出库数量" align="center"><el-table-column prop="issueOut" label="领用出库" width="95" align="right"/><el-table-column prop="transferOut" label="调拨出库" width="95" align="right"/><el-table-column prop="otherOut" label="其他出库" width="95" align="right"/></el-table-column><el-table-column prop="closing" label="月末库存" width="95" align="right" fixed="right"/>
        </el-table>
        <el-table v-else-if="statisticsReport === 'summary'" :data="filteredSummaryRows" stripe class="equipment-table statistics-table" empty-text="暂无统计数据"><el-table-column prop="department" label="部门" min-width="145" fixed="left"/><el-table-column prop="category" label="分类" min-width="120"/><el-table-column prop="supplier" label="供应商" min-width="120"/><el-table-column prop="unit" label="单位" width="70"/><el-table-column prop="total" label="领用总量" width="95" align="right"/><el-table-column v-for="item in summaryEquipmentColumns" :key="item.prop" :prop="item.prop" :label="item.label" min-width="115" align="right"/></el-table>
        <el-table v-else :data="filteredDetailRows" stripe class="equipment-table statistics-table" empty-text="暂无统计数据"><el-table-column prop="orderNo" label="出库单号" min-width="155" fixed="left"><template #default="scope"><el-link type="primary" underline="never" @click="showOrder(scope.row)">{{ scope.row.orderNo }}</el-link></template></el-table-column><el-table-column prop="applicant" label="申请人" width="90"/><el-table-column prop="department" label="申请部门" min-width="130"/><el-table-column prop="project" label="所属项目" min-width="145"/><el-table-column prop="category" label="分类" min-width="115"/><el-table-column prop="quantity" label="领用数量" width="95" align="right"/><el-table-column prop="name" label="装备名称" min-width="130"/><el-table-column prop="supplier" label="供应商" min-width="120"/><el-table-column prop="price" label="单价" width="85" align="right"/><el-table-column prop="time" label="时间" min-width="160"/></el-table>
        <div class="pagination-bar"><span>共 {{ statisticsTotal }} 条</span><el-pagination v-model:current-page="statisticsPage" :page-size="10" layout="prev, pager, next" :total="statisticsTotal"/></div>
      </section>
    </section>
    <section v-else-if="activePage === 'inventory-check'" class="content-area check-content" data-annotation-id="check-list">
      <div class="warehouse-row"><label><span>所属仓库：</span><el-select v-model="checkWarehouse" style="width: 202px"><el-option v-for="warehouse in warehouseOptions" :key="warehouse" :label="warehouse" :value="warehouse"/></el-select></label></div>
      <section class="filter-card check-filter-card"><div class="filter-grid check-filter-grid">
        <label class="field-shell"><span>盘点单号：</span><el-input v-model="checkFilters.id" placeholder="请输入盘点单号" clearable /></label>
        <label class="field-shell"><span>盘点名称：</span><el-input v-model="checkFilters.name" placeholder="请输入盘点名称" clearable /></label>
        <label class="field-shell"><span>仓库：</span><el-select v-model="checkFilters.warehouse" clearable placeholder="全部仓库"><el-option label="历下仓库1" value="历下仓库1"/><el-option label="历城分公司仓库" value="历城分公司仓库"/></el-select></label>
        <label class="field-shell check-status-filter"><span>盘点状态：</span><el-select v-model="checkFilters.status" placeholder="全部状态"><el-option label="全部状态" value=""/><el-option label="待开始" value="待开始"/><el-option label="进行中" value="进行中"/><el-option label="已完成" value="已完成"/></el-select></label>
        <div class="filter-actions"><el-button @click="resetCheckFilters">重置</el-button><el-button type="primary" @click="searchChecks">查询</el-button></div>
      </div></section>
      <div class="table-toolbar"><el-button type="primary" @click="openCheckForm()"><el-icon><Plus /></el-icon>新增盘点</el-button><el-button><el-icon><Download /></el-icon>导出</el-button></div>
      <section class="table-wrap" data-annotation-id="check-status-actions"><el-table :data="filteredCheckTasks" stripe class="equipment-table check-table">
        <el-table-column type="index" label="序号" width="64"/><el-table-column prop="id" label="盘点单号" min-width="170"><template #default="scope"><span class="check-code">{{ scope.row.id }}</span></template></el-table-column><el-table-column prop="name" label="盘点名称" min-width="210"><template #default="scope"><el-link type="primary" underline="never" @click="viewCheck(scope.row)">{{ scope.row.name }}</el-link></template></el-table-column><el-table-column prop="warehouse" label="仓库" min-width="150"/><el-table-column prop="type" label="盘点类型" width="100"><template #default="scope"><el-tag size="small" :type="scope.row.type==='抽盘'?'success':''" effect="plain">{{ scope.row.type }}</el-tag></template></el-table-column><el-table-column prop="operator" label="经办人" width="100"/><el-table-column prop="date" label="盘点日期" width="120"/><el-table-column prop="description" label="盘点说明" min-width="150" show-overflow-tooltip/><el-table-column label="盘点状态" width="115"><template #default="scope"><span :class="['check-status-dot', 'is-' + scope.row.status]">{{ scope.row.status }}</span></template></el-table-column>
        <el-table-column label="操作" width="220" fixed="right"><template #default="scope"><template v-if="scope.row.status==='待开始'"><el-button link type="primary" @click="openCheckForm(scope.row)">编辑</el-button><el-button link class="start-action" @click="startCheck(scope.row)">开始盘点</el-button><el-button link type="danger" @click="removeCheck(scope.row)">删除</el-button></template><el-button v-else-if="scope.row.status==='进行中'" link type="primary" @click="openCheckEntry(scope.row)">录入盘点</el-button><el-button v-else link type="primary" @click="viewCheck(scope.row)">查看详情</el-button></template></el-table-column>
      </el-table><div class="pagination-bar"><span>共 {{ filteredCheckTasks.length }} 条</span><el-pagination :current-page="1" :page-size="10" layout="prev, pager, next" :total="filteredCheckTasks.length"/></div></section>
    </section>

    <section v-else-if="activePage === 'inventory-check-form'" class="check-document-page standard-create-page" data-annotation-id="check-form">
      <div class="check-page-body standard-create-body"><h2 class="section-title">基本信息</h2><el-form class="check-basic-form standard-create-form" label-width="90px">
        <el-form-item label="盘点名称" required data-annotation-id="check-auto-name"><el-input v-model="checkForm.name" placeholder="请输入盘点名称"/></el-form-item><el-form-item label="仓库" required><el-select v-model="checkForm.warehouse" placeholder="请选择仓库"><el-option label="历下仓库1" value="历下仓库1"/><el-option label="历城分公司仓库" value="历城分公司仓库"/></el-select></el-form-item><el-form-item label="盘点类型" required><el-select v-model="checkForm.type"><el-option label="全盘" value="全盘"/><el-option label="抽盘" value="抽盘"/></el-select></el-form-item><el-form-item label="经办人"><el-input v-model="checkForm.operator" disabled/></el-form-item><el-form-item label="盘点日期"><el-date-picker v-model="checkForm.date" type="date" value-format="YYYY-MM-DD"/></el-form-item><el-form-item label="盘点说明" class="check-description"><el-input v-model="checkForm.description" type="textarea" :rows="2" placeholder="请输入盘点说明"/></el-form-item>
      </el-form><h2 class="section-title detail-title">明细</h2><div class="check-detail-toolbar standard-create-toolbar"><el-button type="primary"><el-icon><Plus /></el-icon>添加装备</el-button><el-button type="primary"><el-icon><Upload /></el-icon>导入</el-button></div><el-table :data="checkDetailRows" stripe class="equipment-table check-detail-table standard-create-table"><el-table-column prop="name" label="装备名称" min-width="220"/><el-table-column prop="category" label="装备分类" min-width="180"/><el-table-column prop="unit" label="单位" width="110"/><el-table-column prop="supplier" label="供应商" min-width="160"/><el-table-column prop="stock" label="系统库存" width="150"/><el-table-column v-if="checkForm.type==='抽盘'" label="操作" width="100"><template #default><el-button link type="danger">删除</el-button></template></el-table-column></el-table></div>
      <div class="document-footer standard-create-footer"><el-button @click="backToCheckList">取消</el-button><el-button @click="saveCheck(true)">暂存</el-button><el-button type="primary" @click="saveCheck(false)">保存盘点单</el-button></div>
    </section>

    <section v-else-if="activePage === 'inventory-check-entry'" class="check-document-page standard-create-page" data-annotation-id="check-entry">
      <div class="check-page-body standard-create-body"><h2 class="section-title">基本信息</h2><div class="check-summary-grid standard-create-summary"><span>盘点名称</span><b>{{ activeCheck?.name }}</b><span>仓库</span><b>{{ activeCheck?.warehouse }}</b><span>盘点类型</span><b>{{ activeCheck?.type }}</b><span>经办人</span><b>{{ activeCheck?.operator }}</b><span>盘点日期</span><b>{{ activeCheck?.date }}</b><span>盘点说明</span><b>{{ activeCheck?.description || '—' }}</b></div>
      <h2 class="section-title detail-title">明细</h2><div class="entry-toolbar standard-create-toolbar"><div><el-button type="primary"><el-icon><Download /></el-icon>导出</el-button><el-button type="primary"><el-icon><Upload /></el-icon>导入</el-button></div><div class="entry-tools"><el-input v-model="entryKeyword" placeholder="输入编号/名称筛选" clearable/><el-checkbox v-model="hideZero">过滤无库存装备</el-checkbox><el-checkbox v-model="hideNoDiff">过滤无差异装备</el-checkbox></div></div>
      <el-table :data="visibleEntryRows" stripe class="equipment-table entry-table standard-create-table" data-annotation-id="check-difference-table"><el-table-column prop="name" label="装备名称" min-width="190" fixed="left"/><el-table-column prop="category" label="装备分类" min-width="150"/><el-table-column prop="unit" label="单位" width="90"/><el-table-column prop="supplier" label="供应商" min-width="130"/><el-table-column prop="stock" label="系统库存" width="105" align="right"/><el-table-column label="实际库存" width="150"><template #default="scope"><el-input-number v-model="scope.row.actual" :min="0" :controls="false"/></template></el-table-column><el-table-column label="物码" width="120"><template #default="scope"><el-link v-if="scope.row.code==='FZ-WYK-001'" type="primary" underline="never">添加一物一码</el-link><span v-else>—</span></template></el-table-column><el-table-column label="差异" width="90" align="center"><template #default="scope"><span :class="{'difference-value': scope.row.actual-scope.row.stock !== 0}">{{ scope.row.actual-scope.row.stock }}</span></template></el-table-column><el-table-column label="备注" min-width="180"><template #default="scope"><el-input v-model="scope.row.remark" placeholder="请输入"/></template></el-table-column></el-table></div>
      <div class="document-footer standard-create-footer"><el-button @click="backToCheckList">取消</el-button><el-button @click="saveEntryDraft">暂存</el-button><el-button type="primary" @click="submitCheck">提交盘点</el-button></div>
    </section>
    <section v-else-if="activePage === 'outbound-create'" class="outbound-create-page" data-annotation-id="outbound-create-page">
      <div class="outbound-page-body">
        <h2 class="section-title">基本信息</h2>
        <div class="outbound-basic-grid">
          <label class="outbound-radio-field"><span>出库类型：</span><el-radio-group v-model="outboundForm.type"><el-radio value="报损">报损</el-radio><el-radio value="其他">其他</el-radio></el-radio-group></label>
          <label><span>经办人：</span><el-input v-model="outboundForm.operator" suffix-icon="Search" /></label>
          <label><span>经办日期：</span><el-date-picker v-model="outboundForm.date" type="date" value-format="YYYY-MM-DD" /></label>
          <label class="outbound-description"><span>出库说明：</span><el-input v-model="outboundForm.description" type="textarea" :rows="2" placeholder="请输入出库说明" /></label>
        </div>
        <h2 class="section-title outbound-detail-title">明细</h2>
        <div class="outbound-toolbar" data-annotation-id="outbound-qr-action"><el-button type="primary" @click="openOutboundEquipment"><el-icon><Plus /></el-icon>添加装备</el-button><el-button type="primary" :disabled="!outboundRows.length" @click="downloadOutboundQr"><el-icon><Download /></el-icon>下载清单二维码</el-button></div>
        <el-table :data="outboundRows" stripe class="outbound-table" empty-text="暂无数据" data-annotation-id="outbound-equipment-list">
          <el-table-column prop="name" label="装备名称" min-width="190"/><el-table-column prop="category" label="装备分类" min-width="190"/><el-table-column prop="unit" label="单位" min-width="110"/><el-table-column prop="supplier" label="供应商" min-width="190"/><el-table-column prop="stock" label="现库存" min-width="110"/><el-table-column label="出库数量" min-width="150"><template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" :max="scope.row.stock" :controls="false"/></template></el-table-column><el-table-column label="操作" min-width="110"><template #default="scope"><el-button link type="danger" @click="removeOutboundRow(scope.row)">删除</el-button></template></el-table-column>
        </el-table>
      </div>
      <div class="document-footer"><el-button @click="cancelOutbound">取消</el-button><el-button @click="saveOutbound(true)">暂存</el-button><el-button type="primary" @click="saveOutbound(false)">确认</el-button></div>
    </section>
    <section v-else class="subpage-placeholder"><el-icon><Document /></el-icon><h2>{{ activePageLabel }}</h2><p>子页面框架已就绪，可继续接入对应业务内容。</p></section>
  </main>

  <el-dialog v-model="equipmentDialog" :title="editingId ? '编辑装备' : '新增装备'" width="720px" class="source-dialog" destroy-on-close>
    <el-form label-width="105px"><el-form-item label="装备名称" required><el-input v-model="equipmentForm.name" maxlength="20" show-word-limit placeholder="请输入装备名称" /></el-form-item><el-form-item label="装备分类" required><el-cascader v-model="equipmentForm.categoryPath" :options="categoryOptions" :props="equipmentCascaderProps" filterable clearable placeholder="请选择末级分类" @change="handleEquipmentCategoryChange" /></el-form-item><el-form-item label="装备编码"><el-input :model-value="equipmentForm.code || '选择末级分类后自动生成'" disabled/><div class="form-help">编码规则：末级分类编码 + 三位流水号，例如 FZ-YD-001。</div></el-form-item><el-form-item label="单位" required><el-input v-model="equipmentForm.unit" placeholder="请输入单位" /></el-form-item><el-form-item label="供应商" required data-annotation-id="supplier-dynamic-input"><el-autocomplete v-model="equipmentForm.supplier" :fetch-suggestions="querySuppliers" placeholder="选择或输入供应商名称" clearable /><div class="form-help">可选择已有供应商，也可直接输入新供应商；保存后会加入后续联想。</div></el-form-item><el-form-item label="参考价格"><el-input-number v-model="equipmentForm.price" :min="0" :controls="false" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="equipmentForm.enabled"><el-radio :value="true">启用</el-radio><el-radio :value="false">未启用</el-radio></el-radio-group></el-form-item><el-form-item label="图片"><div class="upload-tile"><el-icon><Plus /></el-icon></div></el-form-item></el-form>
    <template #footer><el-button @click="equipmentDialog=false">取消</el-button><el-button type="primary" @click="saveEquipment">确认</el-button></template>
  </el-dialog>

  <el-dialog v-model="categoryDialog" :title="editingCategoryId ? '编辑分类' : '新增分类'" width="610px" class="source-dialog" destroy-on-close>
    <el-form label-width="105px"><el-form-item label="分类名称" required><el-input v-model="categoryForm.name" maxlength="20" show-word-limit /></el-form-item><el-form-item label="上级分类"><el-cascader v-model="categoryForm.parentPath" :options="categoryOptions" :props="parentCascaderProps" clearable placeholder="不选择则创建一级分类"/><div class="form-help">最多支持三级分类。</div></el-form-item><el-form-item label="分类编码" required><el-input v-model="categoryForm.code" maxlength="20" @input="normalizeCategoryCode" placeholder="大写字母、数字或短横线"/><div class="form-help">编码全局唯一，将作为装备编码前缀。</div></el-form-item><el-form-item label="状态"><el-radio-group v-model="categoryForm.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item><el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="1" :max="999" /></el-form-item></el-form>
    <template #footer><el-button @click="categoryDialog=false">取消</el-button><el-button type="primary" @click="saveCategory">确认</el-button></template>
  </el-dialog>

  <el-dialog v-model="warningDialog" :title="warningTarget ? '设置库存预警' : '批量设置库存预警'" width="500px" class="source-dialog warning-dialog" destroy-on-close data-annotation-id="inventory-warning-dialog">
    <div v-if="warningTarget" class="warning-target"><span>装备名称</span><strong>{{ warningTarget.name }}</strong><span>当前库存</span><strong>{{ warningTarget.stock }} {{ warningTarget.unit }}</strong></div>
    <el-alert v-else :title="'将统一覆盖所选 ' + selectedInventoryRows.length + ' 件装备原有的预警数量'" type="warning" :closable="false" show-icon />
    <el-form label-width="105px"><el-form-item label="预警数量" required><el-input-number v-model="warningForm.threshold" :min="0" :max="999999" :precision="0" controls-position="right"/><div class="form-help">库存数量小于或等于预警数量时，显示“库存不足”；填写 0 表示不启用库存预警。</div></el-form-item></el-form>
    <template #footer><el-button @click="warningDialog=false">取消</el-button><el-button type="primary" @click="saveWarningThreshold">确认</el-button></template>
  </el-dialog>
  <el-dialog v-model="outboundEquipmentDialog" title="添加装备" width="860px" class="source-dialog outbound-equipment-dialog" destroy-on-close>
    <el-table ref="outboundPickerRef" :data="selectableOutboundRows" stripe row-key="id" height="390" @selection-change="handleOutboundPickerSelection"><el-table-column type="selection" width="48"/><el-table-column prop="name" label="装备名称" min-width="190"/><el-table-column prop="category" label="装备分类" min-width="180"/><el-table-column prop="unit" label="单位" width="80"/><el-table-column prop="supplier" label="供应商" min-width="150"/><el-table-column prop="stock" label="现库存" width="90"/></el-table>
    <template #footer><el-button @click="outboundEquipmentDialog=false">取消</el-button><el-button type="primary" :disabled="!outboundPickerSelection.length" @click="confirmOutboundEquipment">确认添加</el-button></template>
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

const inventoryStock = [315, 285, 186, 165, 119, 117, 0];
const inventoryThresholds: number[] = [100, 300, 0, 120, 120, 80, 5];
const checkTaskSeed: CheckTask[] = [
    { id: 'PD202607020001', name: '2026年7月历下仓库月度盘点', warehouse: '历下仓库1', type: '全盘', operator: '张三', date: '2026-07-02', description: '月度例行全盘', status: '待开始' },
    { id: 'PD202606250002', name: '执勤装备专项盘点', warehouse: '历城分公司仓库', type: '抽盘', operator: '张三', date: '2026-06-25', description: '核对高频领用装备', status: '进行中' },
    { id: 'PD202606180003', name: '2026年6月历下仓库盘点', warehouse: '历下仓库1', type: '全盘', operator: '张三', date: '2026-06-18', description: '月度例行全盘', status: '已完成' },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function buildOutboundQrImage(rows: OutboundRow[]) {
    const payload = JSON.stringify({ type: 'equipment-list', version: 1, items: rows.map(({ code, name, quantity, unit }) => ({ code, name, quantity, unit })) });
    const qr = QrCode.encodeText(payload, Ecc.MEDIUM);
    const width = 1080;
    const rowHeight = 68;
    const height = 900 + rows.length * rowHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#07152f'; ctx.textAlign = 'center'; ctx.font = '700 58px Microsoft YaHei, sans-serif'; ctx.fillText('扫码添加装备清单', width / 2, 92);
    ctx.strokeStyle = '#1677ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(100, 112); ctx.lineTo(245, 112); ctx.moveTo(835, 112); ctx.lineTo(980, 112); ctx.stroke();
    ctx.font = '30px Microsoft YaHei, sans-serif'; ctx.fillStyle = '#526078'; ctx.fillText('APP「审批-装备领用」→ 选择装备 → 扫码添加', width / 2, 156);
    const quiet = 4; const qrSize = 430; const cell = qrSize / (qr.size + quiet * 2); const qx = (width - qrSize) / 2; const qy = 195;
    ctx.fillStyle = '#fff'; ctx.fillRect(qx - 16, qy - 16, qrSize + 32, qrSize + 32); ctx.strokeStyle = '#d9e1ec'; ctx.lineWidth = 2; ctx.strokeRect(qx - 16, qy - 16, qrSize + 32, qrSize + 32);
    ctx.fillStyle = '#000'; for (let y = 0; y < qr.size; y += 1) for (let x = 0; x < qr.size; x += 1) if (qr.getModule(x, y)) ctx.fillRect(qx + (x + quiet) * cell, qy + (y + quiet) * cell, Math.ceil(cell), Math.ceil(cell));
    const tableTop = 700; ctx.textAlign = 'left'; ctx.fillStyle = '#07152f'; ctx.font = '700 34px Microsoft YaHei, sans-serif'; ctx.fillText('▣  装备清单明细', 70, tableTop - 28);
    ctx.strokeStyle = '#1677ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, tableTop - 12); ctx.lineTo(1010, tableTop - 12); ctx.stroke();
    ctx.fillStyle = '#edf5ff'; ctx.fillRect(70, tableTop, 940, 58); ctx.fillStyle = '#111827'; ctx.font = '700 25px Microsoft YaHei, sans-serif';
    const columns = [100, 300, 715, 885]; ['编号','名称','数量','单位'].forEach((label, index) => ctx.fillText(label, columns[index], tableTop + 38));
    ctx.font = '24px Microsoft YaHei, sans-serif'; rows.forEach((row, index) => { const y = tableTop + 58 + index * rowHeight; ctx.strokeStyle = '#d9e1ec'; ctx.beginPath(); ctx.moveTo(70, y + rowHeight); ctx.lineTo(1010, y + rowHeight); ctx.stroke(); [row.code, row.name, String(row.quantity), row.unit].forEach((value, column) => ctx.fillText(value, columns[column], y + 43)); });
    const noteTop = tableTop + 82 + rows.length * rowHeight; ctx.fillStyle = '#eef5ff'; ctx.fillRect(70, noteTop, 940, 118); ctx.fillStyle = '#325078'; ctx.font = '23px Microsoft YaHei, sans-serif'; ctx.fillText('✓  请保持二维码完整清晰，截图、打印后均可扫码使用。', 110, noteTop + 45); ctx.fillText('二维码仅用于带出清单明细，不代表申请已提交。', 110, noteTop + 84);
    return canvas.toDataURL('image/png');
}
const flatten = (nodes: CategoryNode[], path: string[] = []): Array<{node: CategoryNode; path: string[]}> => nodes.flatMap((node) => { const next = [...path, node.id]; return [{ node, path: next }, ...flatten(node.children ?? [], next)]; });
function findCategory(nodes: CategoryNode[], id: string): CategoryNode | undefined { for (const node of nodes) { if (node.id === id) return node; const found = findCategory(node.children ?? [], id); if (found) return found; } }
const makeOptions = (nodes: CategoryNode[]): any[] => nodes.map((node) => ({ value: node.id, label: `${node.name}（${node.code}）`, disabled: node.status === '停用', children: node.children?.length ? makeOptions(node.children) : undefined }));
function filterTree(nodes: CategoryNode[], name: string, code: string, status: string, levelFilter: string, level = 1): CategoryNode[] { const nameKey = name.trim().toLowerCase(); const codeKey = code.trim().toLowerCase(); return nodes.flatMap((node) => { const children = filterTree(node.children ?? [], name, code, status, levelFilter, level + 1); const match = (!nameKey || node.name.toLowerCase().includes(nameKey)) && (!codeKey || node.code.toLowerCase().includes(codeKey)) && (status === '全部' || node.status === status) && (levelFilter === '全部' || Number(levelFilter) === level); return match || children.length ? [{ ...node, children }] : []; }); }

const render = new Function('Vue', compile(template, { mode: 'function' }).code)(Vue);

export function mountEquipmentArchiveExact(target: HTMLElement, options: { showShell?: boolean; onNavigate?: (pageId: string) => void; onModuleChange?: (moduleId: string) => void; initialModule?: string } = {}) {
    const component = Vue.defineComponent({
        name: 'EquipmentArchiveExactVue', render,
        setup() {
            const showShell = options.showShell !== false;
            const initialInventory = options.initialModule === 'inventory';
            const initialStatistics = options.initialModule === 'inventory-statistics';
            const initialCheckPage = options.initialModule?.startsWith('inventory-check') ? options.initialModule : '';
            const initialOutbound = options.initialModule === 'outbound-create';
            const activeModule = Vue.ref(options.initialModule ?? 'archive');
            const externalModuleHandler = (event: Event) => {
                const next = (event as CustomEvent).detail;
                if (['archive', 'categories', 'inventory', 'inventory-statistics', 'inventory-check', 'inventory-check-form', 'inventory-check-entry', 'outbound-create'].includes(next)) {
                    activeModule.value = next;
                    if (next === 'inventory-statistics' || next.startsWith('inventory-check') || next === 'outbound-create') activePage.value = next;
                }
            };
            Vue.watch(activeModule, (next) => options.onModuleChange?.(next));
            window.addEventListener('equipment-archive-module', externalModuleHandler);
            Vue.onUnmounted(() => window.removeEventListener('equipment-archive-module', externalModuleHandler));
            const openTabs = Vue.ref([
                { id: 'home', label: '首页', closable: false },
                { id: 'equipment', label: '装备档案管理', closable: true },
                { id: 'purchase', label: '采购管理', closable: true },
                { id: 'transfer', label: '调拨管理', closable: true },
                ...(initialInventory ? [{ id: 'inventory', label: '库存管理', closable: true }] : []),
                ...(initialStatistics ? [{ id: 'inventory-statistics', label: '库存统计', closable: true }] : []),
                ...(initialCheckPage ? [{ id: initialCheckPage, label: initialCheckPage === 'inventory-check-entry' ? '盘点录入' : initialCheckPage === 'inventory-check-form' ? '新增盘点' : '库存盘点', closable: true }] : []),
                ...(initialOutbound ? [{ id: 'outbound-create', label: '新增出库', closable: true }] : []),
            ]);
            const activePage = Vue.ref(initialOutbound ? 'outbound-create' : initialCheckPage || (initialStatistics ? 'inventory-statistics' : initialInventory ? 'inventory' : 'equipment'));
            Vue.watch(activePage, (next) => {
                if (next === 'inventory') activeModule.value = 'inventory';
                else if (next === 'inventory-statistics') activeModule.value = 'inventory-statistics';
                else if (next.startsWith('inventory-check')) activeModule.value = next;
                else if (next === 'outbound-create') activeModule.value = 'outbound-create';
                else if (next === 'equipment' && activeModule.value === 'inventory') activeModule.value = 'archive';
            });
            const activePageLabel = Vue.computed(() => openTabs.value.find((tab) => tab.id === activePage.value)?.label ?? '首页');
            const rows = Vue.ref(clone(rowsSeed));
            const categories = Vue.ref(clone(categorySeed));
            const page = Vue.ref(1);
            const inventoryRows = Vue.ref<InventoryRow[]>(rowsSeed.map((row, index) => ({ ...clone(row), stock: inventoryStock[index] ?? 0, warningThreshold: inventoryThresholds[index] ?? 0 })));
            const outboundRows = Vue.ref<OutboundRow[]>([]);
            const outboundForm = Vue.reactive({ type: '报损', operator: '董涛', date: '2026-07-02', description: '' });
            const outboundEquipmentDialog = Vue.ref(false);
            const outboundPickerSelection = Vue.ref<InventoryRow[]>([]);
            const outboundPickerRef = Vue.ref();
            const selectableOutboundRows = Vue.computed(() => inventoryRows.value.filter((row) => row.enabled && row.stock > 0 && !outboundRows.value.some((item) => item.id === row.id)));
            const inventoryPage = Vue.ref(1);
            const nowLabel = Vue.ref('2026-07-01 01:26:46');
            const filters = Vue.reactive({ name: '', categoryPath: [] as string[], supplier: '', status: '全部' });
            const categoryFilters = Vue.reactive({ name: '', code: '', level: '全部', status: '全部' });
            const warehouseOptions = ['山东振邦保安服务有限责任公司', '直属分公司', '历城分公司', '历下分公司', '天桥分公司', '槐荫分公司'];
            const inventoryFilters = Vue.reactive({ warehouse: warehouseOptions[0], name: '', categoryPath: [] as string[], supplier: '', status: '全部' });
            const statisticsReport = Vue.ref<StatisticsReport>('monthly');
            const statisticsPage = Vue.ref(1);
            const statisticsTabs: Array<{id: StatisticsReport; label: string}> = [{ id: 'monthly', label: '月库存统计' }, { id: 'summary', label: '装备领用汇总' }, { id: 'detail', label: '装备领用明细' }];
            const departmentByWarehouse: Record<string, string[]> = {
                '山东振邦保安服务有限责任公司': ['直属分公司', '历城分公司', '历下分公司', '天桥分公司', '槐荫分公司'],
                '直属分公司': ['直属第一大队', '直属第二大队', '直属第三大队'],
                '历城分公司': ['历城第一大队', '历城第二大队', '历城第三大队', '历城第四大队', '历城第五大队'],
                '历下分公司': ['历下第一大队', '历下第二大队', '历下第三大队'],
                '天桥分公司': ['天桥第一大队', '天桥第二大队', '天桥第三大队'],
                '槐荫分公司': ['槐荫第一大队', '槐荫第二大队', '槐荫第三大队'],
            };
            const statisticsFilters = Vue.reactive({ warehouse: warehouseOptions[0], monthRange: ['2026-05', '2026-06'], name: '', category: '', supplier: '', department: '' });
            const departmentOptions = Vue.computed(() => departmentByWarehouse[statisticsFilters.warehouse] ?? []);
            Vue.watch(() => statisticsFilters.warehouse, () => { statisticsFilters.department = ''; statisticsPage.value = 1; });
            const monthlyRows = Vue.ref([
                { name:'卫宏标志6件套',category:'服装标志',supplier:'三棵树',unit:'套',opening:120,returnIn:8,purchaseIn:50,transferIn:0,otherIn:2,issueOut:36,transferOut:4,otherOut:0,closing:140 },
                { name:'城管标志',category:'服装标志',supplier:'安豹',unit:'套',opening:86,returnIn:6,purchaseIn:20,transferIn:10,otherIn:0,issueOut:28,transferOut:2,otherOut:0,closing:92 },
                { name:'城管帽子',category:'服装标志',supplier:'安豹',unit:'顶',opening:75,returnIn:3,purchaseIn:30,transferIn:0,otherIn:0,issueOut:25,transferOut:5,otherOut:0,closing:78 },
                { name:'夏季保安服',category:'服装标志',supplier:'三棵树',unit:'套',opening:210,returnIn:12,purchaseIn:80,transferIn:10,otherIn:0,issueOut:95,transferOut:8,otherOut:1,closing:208 },
                { name:'防刺服',category:'被动防护装备',supplier:'易安通设备',unit:'件',opening:42,returnIn:5,purchaseIn:10,transferIn:0,otherIn:0,issueOut:8,transferOut:3,otherOut:0,closing:46 },
            ]);
            const summaryRows = Vue.computed(() => departmentOptions.value.map((department, index) => ({ department, category:'服装标志', supplier:'三棵树', unit:'件', total: 42 + index * 4, badge:8+index, cityMark:7+index, cap:9, summer:10+index, autumn:8 })));
            const summaryEquipmentColumns = [{prop:'badge',label:'卫宏标志6件套'},{prop:'cityMark',label:'城管标志'},{prop:'cap',label:'城管帽子'},{prop:'summer',label:'夏季保安服'},{prop:'autumn',label:'秋季保安服'}];
            const detailRows = Vue.computed(() => ['张三','李四','王五','赵六','孙七','周八'].map((applicant,index)=>({ orderNo:`CK20260522${String(index+1).padStart(4,'0')}`, applicant, department:departmentOptions.value[index%Math.max(departmentOptions.value.length,1)] ?? '—', project:index%2?'洪楼广场安保项目':'华山湿地公园', category:'服装标志', quantity:index%3+1, name:index%2?'城管帽子':'夏季保安服', supplier:index%2?'安豹':'三棵树', price:index%2?15:68, time:`2026-05-${22+index} 10:${String(10+index).padStart(2,'0')}:10` })));
            const checkWarehouse = Vue.ref(warehouseOptions[0]);
            const checkTasks = Vue.ref<CheckTask[]>(clone(checkTaskSeed));
            const checkFilters = Vue.reactive({ id: '', name: '', warehouse: '', status: '' });
            const editingCheckId = Vue.ref<string|null>(null);
            const activeCheck = Vue.ref<CheckTask|null>(checkTasks.value.find((item) => item.status === '进行中') ?? null);
            const checkForm = Vue.reactive({ name: '', warehouse: warehouseOptions[0], type: '全盘' as '全盘'|'抽盘', operator: '张三', date: '2026-07-02', description: '' });
            function nextCheckName(warehouse: string, date: string) {
                const [year, monthValue] = date.split('-');
                if (!warehouse || !year || !monthValue) return '';
                const prefix = `${year}年${Number(monthValue)}月${warehouse}盘点`;
                const max = checkTasks.value.reduce((value, task) => {
                    if (!task.name.startsWith(prefix)) return value;
                    const serial = Number(task.name.slice(prefix.length));
                    return Number.isInteger(serial) ? Math.max(value, serial) : value;
                }, 0);
                return `${prefix}${max + 1}`;
            }
            checkForm.name = nextCheckName(checkForm.warehouse, checkForm.date);
            const entryRows = Vue.ref(rowsSeed.map((row, index) => ({ ...clone(row), stock: inventoryStock[index] ?? 0, actual: inventoryStock[index] ?? 0, remark: '' })));
            const entryKeyword = Vue.ref('');
            const hideZero = Vue.ref(false);
            const hideNoDiff = Vue.ref(false);
            const equipmentDialog = Vue.ref(false);
            const categoryDialog = Vue.ref(false);
            const warningDialog = Vue.ref(false);
            const warningTarget = Vue.ref<InventoryRow|null>(null);
            const warningForm = Vue.reactive({ threshold: 0 });
            const selectedInventoryRows = Vue.ref<InventoryRow[]>([]);
            const inventoryTableRef = Vue.ref();
            const editingId = Vue.ref<number|null>(null);
            const editingCategoryId = Vue.ref<string|null>(null);
            const equipmentForm = Vue.reactive<any>({ name: '', code: '', categoryPath: [], unit: '', supplier: '', price: 0, enabled: true });
            const categoryForm = Vue.reactive<any>({ name: '', parentPath: [], code: '', status: '启用', sort: 10 });
            const supplierNames = Vue.ref(['三棵树', '安豹', '易安通设备', '京东慧采-三棵树安保用品']);
            const supplierOptions = Vue.computed(() => Array.from(new Set([
                ...supplierNames.value,
                ...rows.value.map((row) => row.supplier),
            ].map((name) => name.trim()).filter(Boolean))));
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
            const filteredInventoryRows = Vue.computed(() => inventoryRows.value.filter((row) => {
                const key = inventoryFilters.name.trim().toLowerCase();
                return (!key || row.name.toLowerCase().includes(key))
                    && (!inventoryFilters.supplier || row.supplier.toLowerCase().includes(inventoryFilters.supplier.toLowerCase()))
                    && (inventoryFilters.status === '全部' || (inventoryFilters.status === '启用' ? row.enabled : !row.enabled))
                    && (!inventoryFilters.categoryPath.length || inventoryFilters.categoryPath.every((id, i) => row.categoryPath[i] === id));
            }));
            const matchesStatistics = (row: any) => (!statisticsFilters.name || String(row.name ?? '').includes(statisticsFilters.name.trim())) && (!statisticsFilters.category || row.category === statisticsFilters.category) && (!statisticsFilters.supplier || row.supplier === statisticsFilters.supplier) && (!statisticsFilters.department || row.department === statisticsFilters.department);
            const filteredMonthlyRows = Vue.computed(() => monthlyRows.value.filter(matchesStatistics));
            const filteredSummaryRows = Vue.computed(() => summaryRows.value.filter(matchesStatistics));
            const filteredDetailRows = Vue.computed(() => detailRows.value.filter(matchesStatistics));
            const statisticsTotal = Vue.computed(() => statisticsReport.value === 'monthly' ? filteredMonthlyRows.value.length : statisticsReport.value === 'summary' ? filteredSummaryRows.value.length : filteredDetailRows.value.length);
            const statisticsCaption = Vue.computed(() => statisticsReport.value === 'monthly' ? '统计所选月份内各装备的期初、出入库与期末库存' : statisticsReport.value === 'summary' ? '按领用部门汇总各装备领用数量' : '逐笔展示装备领用出库记录');
            const visibleInventoryRows = Vue.computed(() => filteredInventoryRows.value.slice((inventoryPage.value - 1) * 10, inventoryPage.value * 10));
            const filteredCheckTasks = Vue.computed(() => checkTasks.value.filter((task) => (!checkFilters.id || task.id.includes(checkFilters.id.trim())) && (!checkFilters.name || task.name.includes(checkFilters.name.trim())) && (!checkFilters.warehouse || task.warehouse === checkFilters.warehouse) && (!checkFilters.status || task.status === checkFilters.status)));
            const checkDetailRows = Vue.computed(() => inventoryRows.value.slice(0, checkForm.type === '抽盘' ? 4 : undefined));
            const visibleEntryRows = Vue.computed(() => entryRows.value.filter((row) => {
                const key = entryKeyword.value.trim().toLowerCase();
                return (!key || row.name.toLowerCase().includes(key) || row.code.toLowerCase().includes(key))
                    && (!hideZero.value || row.stock > 0)
                    && (!hideNoDiff.value || row.actual !== row.stock);
            }));
            const filterCascaderProps = { checkStrictly: true, emitPath: true };
            const equipmentCascaderProps = { emitPath: true };
            const parentCascaderProps = { checkStrictly: true, emitPath: true };

            const navBefore = [{ label: '可视化调度', icon: Icons.DataAnalysis },{ label: '智慧安检数据大屏', icon: Icons.Monitor },{ label: '安保数据', icon: Icons.Histogram, expandable: true },{ label: '审批管理', icon: Icons.WarningFilled, expandable: true },{ label: '合同管理', icon: Icons.Document, expandable: true },{ label: '项目管理', icon: Icons.Tickets, expandable: true }];
            const navAfter = [{ label: '考勤管理', icon: Icons.Calendar },{ label: '督导管理', icon: Icons.Flag },{ label: '客户管理', icon: Icons.UserFilled },{ label: '薪酬', icon: Icons.Money },{ label: '人事管理', icon: Icons.User },{ label: '组织架构管理', icon: Icons.Tools },{ label: '服务管理', icon: Icons.Briefcase },{ label: '系统管理', icon: Icons.Setting }];
            const equipmentChildren = ['装备档案管理','采购管理','调拨管理','库存管理','库存统计','库存盘点','出库管理','入库管理'];

            function openChildPage(label: string) {
                if (label === '装备档案管理') {
                    activePage.value = 'equipment';
                    activeModule.value = 'archive';
                } else if (label === '库存管理') {
                    if (!openTabs.value.some((tab) => tab.id === 'inventory')) openTabs.value.push({ id: 'inventory', label: '库存管理', closable: true });
                    activePage.value = 'inventory';
                    activeModule.value = 'inventory';
                } else if (label === '库存统计') {
                    if (!openTabs.value.some((tab) => tab.id === 'inventory-statistics')) openTabs.value.push({ id: 'inventory-statistics', label: '库存统计', closable: true });
                    activePage.value = 'inventory-statistics';
                    activeModule.value = 'inventory-statistics';
                } else if (label === '库存盘点') {
                    openCheckPage('inventory-check', '库存盘点');
                } else if (label === '出库管理') {
                    openCheckPage('outbound-create', '新增出库');
                }
                else ElMessage.info(`${label}子页面待接入`);
            }

            function closePage(id: string) {
                const index = openTabs.value.findIndex((tab) => tab.id === id);
                if (index < 0 || !openTabs.value[index].closable) return;
                const wasActive = activePage.value === id;
                openTabs.value.splice(index, 1);
                if (wasActive) activePage.value = openTabs.value[Math.min(index, openTabs.value.length - 1)]?.id ?? 'home';
            }

            function openCheckPage(id: string, label: string) {
                const existing = openTabs.value.find((tab) => tab.id === id);
                if (!existing) openTabs.value.push({ id, label, closable: true });
                activePage.value = id;
                activeModule.value = id;
            }
            function backToCheckList() { openCheckPage('inventory-check', '库存盘点'); }
            function searchChecks() { ElMessage.success(`已找到 ${filteredCheckTasks.value.length} 条盘点任务`); }
            function resetCheckFilters() { Object.assign(checkFilters, { id: '', name: '', warehouse: '', status: '' }); }
            function openCheckForm(task?: CheckTask) {
                editingCheckId.value = task?.id ?? null;
                if (task) Object.assign(checkForm, { name: task.name, warehouse: task.warehouse, type: task.type, operator: task.operator, date: task.date, description: task.description });
                else {
                    Object.assign(checkForm, { name: '', warehouse: checkWarehouse.value, type: '全盘', operator: '张三', date: '2026-07-02', description: '' });
                    checkForm.name = nextCheckName(checkForm.warehouse, checkForm.date);
                }
                openCheckPage('inventory-check-form', task ? '编辑盘点' : '新增盘点');
            }
            function nextCheckId() {
                const prefix = 'PD20260702';
                const max = checkTasks.value.reduce((value, task) => task.id.startsWith(prefix) ? Math.max(value, Number(task.id.slice(prefix.length)) || 0) : value, 0);
                return `${prefix}${String(max + 1).padStart(4, '0')}`;
            }
            function saveCheck(draft: boolean) {
                if (!checkForm.name.trim() || !checkForm.warehouse) { ElMessage.warning('请填写盘点名称并选择仓库'); return; }
                const payload: CheckTask = { id: editingCheckId.value ?? nextCheckId(), name: checkForm.name.trim(), warehouse: checkForm.warehouse, type: checkForm.type, operator: checkForm.operator, date: checkForm.date, description: checkForm.description.trim(), status: '待开始' };
                const index = checkTasks.value.findIndex((task) => task.id === editingCheckId.value);
                if (index >= 0) checkTasks.value.splice(index, 1, payload); else checkTasks.value.unshift(payload);
                ElMessage.success(draft ? '盘点单已暂存' : `盘点单已保存，单号为 ${payload.id}`);
                backToCheckList();
            }
            async function startCheck(task: CheckTask) {
                const ok = await ElMessageBox.confirm(`开始后将锁定“${task.warehouse}”。锁定期间仍可申请和创建出入库单，但无法执行实际出入库操作。是否确认开始盘点？`, '开始盘点并锁定仓库', { type: 'warning', confirmButtonText: '确认开始', cancelButtonText: '取消' }).then(() => true).catch(() => false);
                if (!ok) return;
                task.status = '进行中';
                activeCheck.value = task;
                ElMessage.success(`${task.warehouse}已锁定，盘点任务进入进行中`);
            }
            async function removeCheck(task: CheckTask) {
                const ok = await ElMessageBox.confirm(`确定删除盘点任务“${task.name}”吗？删除后无法恢复。`, '删除确认', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }).then(() => true).catch(() => false);
                if (!ok) return;
                checkTasks.value = checkTasks.value.filter((item) => item.id !== task.id);
                ElMessage.success('盘点任务已删除');
            }
            function openCheckEntry(task: CheckTask) {
                activeCheck.value = task;
                entryRows.value = rowsSeed.map((row, index) => ({ ...clone(row), stock: inventoryStock[index] ?? 0, actual: inventoryStock[index] ?? 0, remark: '' }));
                openCheckPage('inventory-check-entry', '盘点录入');
            }
            function viewCheck(task: CheckTask) {
                if (task.status === '进行中') openCheckEntry(task);
                else ElMessage.info(`${task.id}：${task.status}盘点任务详情`);
            }
            function saveEntryDraft() { ElMessage.success('盘点数据已暂存'); }
            async function submitCheck() {
                if (!activeCheck.value) return;
                const differences = entryRows.value.filter((row) => row.actual !== row.stock);
                const ok = await ElMessageBox.confirm(`本次盘点有 ${differences.length} 项库存差异。提交后将生成盘点出入库单、结束盘点并解除仓库锁定。`, '提交盘点确认', { type: 'warning', confirmButtonText: '确认提交', cancelButtonText: '取消' }).then(() => true).catch(() => false);
                if (!ok) return;
                activeCheck.value.status = '已完成';
                const warehouse = activeCheck.value.warehouse;
                ElMessage.success(`盘点已完成，已生成差异单据并解除${warehouse}锁定`);
                backToCheckList();
            }

            function runSearch() { page.value = 1; ElMessage.success(`已找到 ${filteredRows.value.length} 条装备档案`); }
            function resetFilters() { Object.assign(filters, { name: '', categoryPath: [], supplier: '', status: '全部' }); page.value = 1; }
            function querySuppliers(query: string, cb: (items: Array<{value:string}>) => void) { const key = query.trim().toLowerCase(); cb(supplierOptions.value.filter((name) => !key || name.toLowerCase().includes(key)).map((value) => ({ value }))); }
            function nextCode(path: string[]) { const leaf = findCategory(categories.value, path[path.length - 1] ?? ''); if (!leaf) return ''; const prefix = `${leaf.code}-`; const max = rows.value.reduce((n, row) => row.id !== editingId.value && row.code.startsWith(prefix) ? Math.max(n, Number(row.code.slice(prefix.length)) || 0) : n, 0); return `${prefix}${String(max + 1).padStart(3, '0')}`; }
            function handleEquipmentCategoryChange(path: string[]) { const leaf = findCategory(categories.value, path?.[path.length - 1] ?? ''); if (leaf?.children?.length) { equipmentForm.code = ''; ElMessage.warning('请选择末级分类'); } else equipmentForm.code = nextCode(path ?? []); }
            function openEquipment(row?: EquipmentRow) { editingId.value = row?.id ?? null; Object.assign(equipmentForm, row ? { ...row, categoryPath: [...row.categoryPath] } : { name: '', code: '', categoryPath: [], unit: '', supplier: '', price: 0, enabled: true }); equipmentDialog.value = true; }
            function saveEquipment() { const leafId = equipmentForm.categoryPath[equipmentForm.categoryPath.length - 1] ?? ''; const leaf = findCategory(categories.value, leafId); equipmentForm.supplier = equipmentForm.supplier.trim(); if (!equipmentForm.name || !equipmentForm.unit || !equipmentForm.supplier || !leaf || leaf.children?.length) { ElMessage.warning('请完整填写装备名称、末级分类、单位和供应商'); return; } if (!supplierOptions.value.includes(equipmentForm.supplier)) supplierNames.value.push(equipmentForm.supplier); const payload: EquipmentRow = { id: editingId.value ?? Date.now(), code: equipmentForm.code || nextCode(equipmentForm.categoryPath), name: equipmentForm.name, enabled: equipmentForm.enabled, categoryPath: [...equipmentForm.categoryPath], category: equipmentForm.categoryPath.map((id: string) => findCategory(categories.value,id)?.name).filter(Boolean).join(' / '), unit: equipmentForm.unit, supplier: equipmentForm.supplier, price: Number(equipmentForm.price), modifier: '当前用户', modifiedAt: '2026-07-01 01:26' }; const index = rows.value.findIndex((row) => row.id === editingId.value); if (index >= 0) rows.value.splice(index,1,payload); else rows.value.unshift(payload); equipmentDialog.value = false; page.value = 1; ElMessage.success(editingId.value ? '装备档案已更新' : `装备已新增，编码为 ${payload.code}`); }
            async function removeRow(row: EquipmentRow) { const ok = await ElMessageBox.confirm(`确定删除“${row.name}”吗？`,'删除确认',{type:'warning',confirmButtonText:'确定删除',cancelButtonText:'取消'}).then(()=>true).catch(()=>false); if (ok) { rows.value = rows.value.filter((item) => item.id !== row.id); ElMessage.success('删除成功'); } }
            function toggleStatus(row: EquipmentRow) { ElMessage.success(`${row.name}已${row.enabled ? '启用' : '停用'}`); }

            function runInventorySearch() { inventoryPage.value = 1; ElMessage.success(`已找到 ${filteredInventoryRows.value.length} 条库存记录`); }
            function resetInventoryFilters() { Object.assign(inventoryFilters, { name: '', categoryPath: [], supplier: '', status: '全部' }); inventoryPage.value = 1; }
            function handleInventorySelection(selection: InventoryRow[]) { selectedInventoryRows.value = selection; }
            function isLowStock(row: InventoryRow) { return row.stock > 0 && row.warningThreshold > 0 && row.stock <= row.warningThreshold; }
            function stockClass(row: InventoryRow) { return row.stock === 0 ? 'stock-empty' : isLowStock(row) ? 'stock-warning' : ''; }
            function openWarningDialog(row?: InventoryRow) {
                if (!row && !selectedInventoryRows.value.length) { ElMessage.warning('请先选择需要设置预警的装备'); return; }
                warningTarget.value = row ?? null;
                warningForm.threshold = row?.warningThreshold ?? 0;
                warningDialog.value = true;
            }
            function saveWarningThreshold() {
                const targets = warningTarget.value ? [warningTarget.value] : selectedInventoryRows.value;
                targets.forEach((target) => { target.warningThreshold = Number(warningForm.threshold); });
                warningDialog.value = false;
                ElMessage.success(warningTarget.value ? '库存预警设置成功' : `已统一设置 ${targets.length} 件装备的预警数量`);
            }
            function switchStatisticsReport(report: StatisticsReport) { statisticsReport.value = report; statisticsPage.value = 1; }
            function runStatisticsSearch() { statisticsPage.value = 1; ElMessage.success(`已查询到 ${statisticsTotal.value} 条统计数据`); }
            function resetStatisticsFilters() { Object.assign(statisticsFilters, { monthRange: ['2026-05','2026-06'], name: '', category: '', supplier: '', department: '' }); statisticsPage.value = 1; }
            function exportStatistics() { const label = statisticsTabs.find((tab) => tab.id === statisticsReport.value)?.label; ElMessage.success(`${label}已生成导出任务`); }
            function showOrder(row: any) { ElMessage.info(`正在查看出库单 ${row.orderNo}`); }
            function openOutboundEquipment() { outboundPickerSelection.value = []; outboundEquipmentDialog.value = true; }
            function handleOutboundPickerSelection(selection: InventoryRow[]) { outboundPickerSelection.value = selection; }
            function confirmOutboundEquipment() { outboundRows.value.push(...outboundPickerSelection.value.map((row) => ({ ...clone(row), quantity: 1 }))); outboundEquipmentDialog.value = false; ElMessage.success(`已添加 ${outboundPickerSelection.value.length} 件装备`); }
            function removeOutboundRow(row: OutboundRow) { outboundRows.value = outboundRows.value.filter((item) => item.id !== row.id); }
            function downloadOutboundQr() { if (!outboundRows.value.length) return; const link = document.createElement('a'); link.href = buildOutboundQrImage(outboundRows.value); link.download = `装备清单二维码-${outboundForm.date}.png`; link.click(); ElMessage.success('装备清单二维码已下载'); }
            function cancelOutbound() { outboundRows.value = []; ElMessage.info('已取消新增出库'); }
            function saveOutbound(draft: boolean) { if (!outboundRows.value.length) { ElMessage.warning('请先添加装备'); return; } ElMessage.success(draft ? '出库单已暂存' : '出库单已确认'); }

            function findPath(id: string) { return flatCategories.value.find(({node}) => node.id === id)?.path ?? []; }
            function openCategory(row?: CategoryNode) { editingCategoryId.value = row?.id ?? null; const ownPath = row ? findPath(row.id) : []; Object.assign(categoryForm, row ? { name: row.name, parentPath: ownPath.slice(0,-1), code: row.code, status: row.status, sort: row.sort } : { name: '', parentPath: [], code: '', status: '启用', sort: 10 }); categoryDialog.value = true; }
            function openChildCategory(row: CategoryNode) { const path = findPath(row.id); if (path.length >= 3) { ElMessage.warning('最多支持三级分类'); return; } editingCategoryId.value = null; Object.assign(categoryForm,{name:'',parentPath:path,code:`${row.code}-`,status:'启用',sort:10}); categoryDialog.value = true; }
            function normalizeCategoryCode(value: string) { categoryForm.code = value.toUpperCase().replace(/[^A-Z0-9-]/g,'').replace(/--+/g,'-'); }
            function insertCategory(nodes: CategoryNode[], parentId: string|undefined, node: CategoryNode): boolean { if (!parentId) { nodes.push(node); return true; } for (const parent of nodes) { if (parent.id === parentId) { (parent.children ??= []).push(node); return true; } if (insertCategory(parent.children ?? [],parentId,node)) return true; } return false; }
            function removeCategory(nodes: CategoryNode[], id: string): boolean { const index = nodes.findIndex((node)=>node.id===id); if (index>=0) { nodes.splice(index,1); return true; } return nodes.some((node)=>removeCategory(node.children ?? [],id)); }
            function saveCategory() { if (!categoryForm.name || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(categoryForm.code)) { ElMessage.warning('请填写分类名称和有效分类编码'); return; } if (flatCategories.value.some(({node}) => node.code === categoryForm.code && node.id !== editingCategoryId.value)) { ElMessage.warning('分类编码已存在'); return; } if (categoryForm.parentPath.length >= 3) { ElMessage.warning('最多支持三级分类'); return; } if (editingCategoryId.value) { const targetNode = findCategory(categories.value,editingCategoryId.value); if (targetNode) Object.assign(targetNode,{name:categoryForm.name,code:categoryForm.code,status:categoryForm.status,sort:categoryForm.sort}); } else { const parentId = categoryForm.parentPath[categoryForm.parentPath.length - 1]; insertCategory(categories.value,parentId,{id:`category-${Date.now()}`,name:categoryForm.name,code:categoryForm.code,itemCount:0,status:categoryForm.status,sort:categoryForm.sort}); } categories.value=[...categories.value]; categoryDialog.value=false; ElMessage.success(editingCategoryId.value?'分类已更新':'分类已新增'); }
            async function removeCategoryRow(row: CategoryNode) { if (row.children?.length) { ElMessage.warning('该分类包含下级分类，请先处理下级分类'); return; } if (row.itemCount > 0 || rows.value.some((item)=>item.categoryPath.includes(row.id))) { ElMessage.warning('该分类已关联装备，无法删除'); return; } const ok = await ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`,'删除确认',{type:'warning'}).then(()=>true).catch(()=>false); if (ok) { removeCategory(categories.value,row.id); categories.value=[...categories.value]; ElMessage.success('分类已删除'); } }
            function levelLabel(id: string) { return ['一级分类','二级分类','三级分类'][findPath(id).length-1] ?? ''; }

            return { showShell, activeModule, openTabs, activePage, activePageLabel, closePage, openChildPage, nowLabel, navBefore, navAfter, equipmentChildren, warehouseOptions, filters, categoryFilters, inventoryFilters, statisticsReport, statisticsPage, statisticsTabs, statisticsFilters, departmentOptions, monthlyRows, filteredMonthlyRows, filteredSummaryRows, filteredDetailRows, summaryEquipmentColumns, statisticsTotal, statisticsCaption, switchStatisticsReport, runStatisticsSearch, resetStatisticsFilters, exportStatistics, showOrder, outboundRows, outboundForm, outboundEquipmentDialog, outboundPickerSelection, outboundPickerRef, selectableOutboundRows, openOutboundEquipment, handleOutboundPickerSelection, confirmOutboundEquipment, removeOutboundRow, downloadOutboundQr, cancelOutbound, saveOutbound, checkWarehouse, page, inventoryPage, rows, filteredRows, visibleRows, inventoryRows, filteredInventoryRows, visibleInventoryRows, selectedInventoryRows, inventoryTableRef, categories, categoryOptions, flatCategories, filteredCategoryTree, filterCascaderProps, equipmentCascaderProps, parentCascaderProps, equipmentDialog, categoryDialog, warningDialog, warningTarget, warningForm, editingId, editingCategoryId, equipmentForm, categoryForm, runSearch, resetFilters, runInventorySearch, resetInventoryFilters, handleInventorySelection, isLowStock, stockClass, openWarningDialog, saveWarningThreshold, querySuppliers, handleEquipmentCategoryChange, openEquipment, saveEquipment, removeRow, toggleStatus, openCategory, openChildCategory, normalizeCategoryCode, saveCategory, removeCategoryRow, levelLabel, checkTasks, checkFilters, filteredCheckTasks, checkForm, checkDetailRows, activeCheck, entryRows, entryKeyword, hideZero, hideNoDiff, visibleEntryRows, searchChecks, resetCheckFilters, openCheckForm, saveCheck, startCheck, removeCheck, openCheckEntry, viewCheck, backToCheckList, saveEntryDraft, submitCheck };
        },
    });
    const app = Vue.createApp(component);
    app.use(ElementPlus);
    Object.entries(Icons).forEach(([name, icon]) => app.component(name, icon));
    app.mount(target);
    return () => app.unmount();
}
