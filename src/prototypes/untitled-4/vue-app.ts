import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';

type PageId = 'archive' | 'categories';

interface MountOptions {
    onTabChange?: (page: PageId) => void;
}

interface CategoryNode {
    id: string;
    name: string;
    code: string;
    itemCount: number;
    status: '启用' | '停用';
    sort: number;
    remark?: string;
    children?: CategoryNode[];
}

interface EquipmentRow {
    id: number;
    code: string;
    name: string;
    status: boolean;
    categoryPath: string[];
    category: string;
    unit: string;
    supplier: string;
    price: number;
    spec: string;
    warehouse: '全部仓库' | '部分仓库';
    remark: string;
    modifier: string;
    modifiedAt: string;
}

const equipmentTemplate = String.raw`
<div class="equipment-page">
  <el-tabs v-model="activeTab" class="archive-tabs" data-annotation-id="archive-tabs">
    <el-tab-pane label="装备档案" name="archive">
      <section class="filter-panel" data-annotation-id="archive-filter">
        <el-form :model="filters" label-position="left" class="filter-form">
          <el-form-item label="装备名称：">
            <el-input v-model="filters.name" clearable placeholder="请输入装备名称或编码" @keyup.enter="searchEquipment" />
          </el-form-item>
          <el-form-item label="装备分类：">
            <el-cascader v-model="filters.categoryPath" :options="categoryOptions" :props="cascaderProps" clearable placeholder="全部分类" />
          </el-form-item>
          <el-form-item label="供应商：">
            <el-autocomplete v-model="filters.supplier" :fetch-suggestions="querySuppliers" clearable placeholder="请输入供应商" />
          </el-form-item>
          <el-form-item label="状态：" class="status-filter">
            <el-radio-group v-model="filters.status">
              <el-radio value="全部">全部</el-radio>
              <el-radio value="启用">启用</el-radio>
              <el-radio value="未启用">未启用</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="searchEquipment">查询</el-button>
            <el-button @click="resetEquipmentFilters">重置</el-button>
          </div>
        </el-form>
      </section>

      <div class="table-toolbar">
        <el-button type="primary" :icon="Plus" @click="openEquipmentDialog()">新增装备</el-button>
      </div>

      <section class="table-panel" data-annotation-id="archive-table">
        <el-table :data="pagedEquipmentRows" stripe row-key="id" class="archive-table" height="520">
          <el-table-column prop="code" label="装备编码" width="142" fixed="left" />
          <el-table-column prop="name" label="装备名称" min-width="190">
            <template #default="scope"><el-link type="primary" underline="never" @click="openEquipmentDialog(scope.row)">{{ scope.row.name }}</el-link></template>
          </el-table-column>
          <el-table-column label="状态" width="90" align="center">
            <template #default="scope"><el-switch v-model="scope.row.status" @change="notifyStatus(scope.row)" /></template>
          </el-table-column>
          <el-table-column prop="category" label="分类" min-width="160" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" width="75" />
          <el-table-column prop="supplier" label="供应商" min-width="165" show-overflow-tooltip />
          <el-table-column prop="price" label="参考价格" width="105" align="right">
            <template #default="scope">{{ formatPrice(scope.row.price) }}</template>
          </el-table-column>
          <el-table-column label="图片" width="75" align="center"><template #default="scope"><span :data-row-id="scope.row.id">—</span></template></el-table-column>
          <el-table-column prop="modifier" label="修改人" width="110" show-overflow-tooltip />
          <el-table-column prop="modifiedAt" label="修改时间" width="155" />
          <el-table-column label="操作" width="112" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="openEquipmentDialog(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="deleteEquipment(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty><el-empty description="暂无符合条件的装备档案" /></template>
        </el-table>
        <div class="pagination-row">
          <span>共 {{ filteredEquipmentRows.length }} 条</span>
          <el-pagination v-model:current-page="currentPage" :page-size="pageSize" layout="prev, pager, next" :total="filteredEquipmentRows.length" />
        </div>
      </section>
    </el-tab-pane>

    <el-tab-pane label="分类管理" name="categories">
      <section class="filter-panel category-filter" data-annotation-id="category-filter">
        <el-form :model="categoryFilters" label-position="left" class="filter-form category-filter-form">
          <el-form-item label="分类名称：">
            <el-input v-model="categoryFilters.name" clearable placeholder="请输入分类名称或编码" @keyup.enter="searchCategories" />
          </el-form-item>
          <el-form-item label="分类层级：">
            <el-select v-model="categoryFilters.level" placeholder="全部层级">
              <el-option label="全部层级" value="全部" />
              <el-option label="一级分类" value="1" />
              <el-option label="二级分类" value="2" />
              <el-option label="三级分类" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态：">
            <el-radio-group v-model="categoryFilters.status">
              <el-radio value="全部">全部</el-radio>
              <el-radio value="启用">启用</el-radio>
              <el-radio value="停用">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="searchCategories">查询</el-button>
            <el-button @click="resetCategoryFilters">重置</el-button>
          </div>
        </el-form>
      </section>

      <div class="table-toolbar category-toolbar">
        <el-button type="primary" :icon="Plus" @click="openCategoryDialog()">新增分类</el-button>
        <span class="toolbar-note">分类编码将用于自动生成装备编码，保存后建议谨慎修改</span>
      </div>

      <section class="table-panel" data-annotation-id="category-tree-table">
        <el-table :data="filteredCategoryTree" row-key="id" stripe default-expand-all :tree-props="{ children: 'children' }" height="555">
          <el-table-column prop="name" label="分类名称" min-width="260" fixed="left" />
          <el-table-column label="分类层级" width="120">
            <template #default="scope">{{ levelLabel(scope.row.id) }}</template>
          </el-table-column>
          <el-table-column prop="code" label="分类编码" min-width="180">
            <template #default="scope"><span class="code-text">{{ scope.row.code }}</span></template>
          </el-table-column>
          <el-table-column prop="itemCount" label="装备数" width="100" align="center" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="scope"><el-tag :type="scope.row.status === '启用' ? 'success' : 'info'" effect="light">{{ scope.row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="90" align="center" />
          <el-table-column label="操作" width="190" fixed="right" class-name="category-actions-cell">
            <template #default="scope">
              <el-button link type="primary" @click="openCategoryDialog(scope.row)">编辑</el-button>
              <el-button link type="primary" @click="openChildCategoryDialog(scope.row)">新增下级</el-button>
              <el-button link type="danger" @click="deleteCategory(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty><el-empty description="暂无符合条件的分类" /></template>
        </el-table>
        <div class="category-summary">共 {{ categoryFlatRows.length }} 个分类，支持三级分类结构</div>
      </section>
    </el-tab-pane>
  </el-tabs>

  <el-dialog v-model="equipmentDialogVisible" :title="equipmentDialogTitle" width="820px" top="3vh" class="archive-dialog" destroy-on-close data-annotation-id="equipment-dialog">
    <el-form ref="equipmentFormRef" :model="equipmentForm" :rules="equipmentRules" label-width="112px" class="archive-form" status-icon>
      <el-form-item label="装备名称" prop="name"><el-input v-model="equipmentForm.name" maxlength="20" show-word-limit placeholder="请输入装备名称" /></el-form-item>
      <el-form-item label="装备分类" prop="categoryPath">
        <el-cascader v-model="equipmentForm.categoryPath" :options="categoryOptions" :props="equipmentCascaderProps" clearable filterable placeholder="请选择末级分类" @change="handleEquipmentCategoryChange" />
      </el-form-item>
      <el-form-item label="装备编码">
        <el-input :model-value="equipmentForm.code || '选择末级分类后自动生成'" disabled>
          <template #append><el-tooltip content="编码由分类编码和三位流水号组成，保存后不可手工修改"><el-icon><InfoFilled /></el-icon></el-tooltip></template>
        </el-input>
        <div class="form-help">编码规则：分类编码 + 三位流水号，例如 FZ-YD-001。</div>
      </el-form-item>
      <el-form-item label="单位" prop="unit"><el-input v-model="equipmentForm.unit" maxlength="20" show-word-limit placeholder="请输入单位" /></el-form-item>
      <el-form-item label="供应商" prop="supplier">
        <el-autocomplete v-model="equipmentForm.supplier" :fetch-suggestions="querySuppliers" clearable placeholder="输入名称可联想选择" style="width:100%" />
      </el-form-item>
      <el-form-item label="规格型号"><el-input v-model="equipmentForm.spec" maxlength="20" show-word-limit placeholder="请输入规格型号" /></el-form-item>
      <el-form-item label="参考价格" prop="price"><el-input-number v-model="equipmentForm.price" :min="0" :precision="2" :controls="false" placeholder="请输入参考价" style="width:100%" /></el-form-item>
      <el-form-item label="使用仓库" prop="warehouse"><el-radio-group v-model="equipmentForm.warehouse"><el-radio value="全部仓库">全部仓库</el-radio><el-radio value="部分仓库">部分仓库</el-radio></el-radio-group></el-form-item>
      <el-form-item label="状态"><el-switch v-model="equipmentForm.status" active-text="启用" inactive-text="未启用" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="equipmentForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入内容" /></el-form-item>
      <el-form-item label="图片"><el-upload action="#" :auto-upload="false" :show-file-list="false" class="picture-uploader"><el-icon><Plus /></el-icon></el-upload></el-form-item>
    </el-form>
    <template #footer><div class="dialog-footer"><el-button @click="equipmentDialogVisible=false">取消</el-button><el-button type="primary" @click="saveEquipment">确定</el-button></div></template>
  </el-dialog>

  <el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="650px" top="8vh" class="archive-dialog category-dialog" destroy-on-close data-annotation-id="category-dialog">
    <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="100px" class="archive-form" status-icon>
      <el-form-item label="分类名称" prop="name"><el-input v-model="categoryForm.name" maxlength="20" show-word-limit placeholder="请输入分类名称" /></el-form-item>
      <el-form-item label="上级分类">
        <el-cascader v-model="categoryForm.parentPath" :options="categoryOptions" :props="parentCascaderProps" clearable filterable placeholder="不选择则创建一级分类" @change="handleCategoryParentChange" />
        <div class="form-help">最多支持三级分类，已有下级分类时不可更换上级分类。</div>
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="categoryForm.code" maxlength="20" placeholder="请输入大写字母、数字或短横线" @input="normalizeCategoryCode" />
        <div class="form-help">编码全局唯一，将作为装备编码前缀，例如 FZ-YD。</div>
      </el-form-item>
      <el-form-item label="状态"><el-radio-group v-model="categoryForm.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="1" :max="999" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="categoryForm.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入分类说明" /></el-form-item>
    </el-form>
    <template #footer><div class="dialog-footer"><el-button @click="categoryDialogVisible=false">取消</el-button><el-button type="primary" @click="saveCategory">确定</el-button></div></template>
  </el-dialog>
</div>
`;

const categorySeed: CategoryNode[] = [
    {
        id: 'fz', name: '保安员服装', code: 'FZ', itemCount: 18, status: '启用', sort: 10, children: [
            { id: 'fz-wyk', name: '外衣裤', code: 'FZ-WYK', itemCount: 8, status: '启用', sort: 10 },
            { id: 'fz-fsbz', name: '服饰标志', code: 'FZ-FSBZ', itemCount: 4, status: '启用', sort: 20 },
            { id: 'fz-yd', name: '腰带', code: 'FZ-YD', itemCount: 2, status: '启用', sort: 30 },
            { id: 'fz-x', name: '鞋', code: 'FZ-X', itemCount: 2, status: '启用', sort: 40 },
            { id: 'fz-m', name: '帽', code: 'FZ-M', itemCount: 2, status: '启用', sort: 50 },
        ],
    },
    {
        id: 'zq', name: '执勤装备', code: 'ZQ', itemCount: 24, status: '启用', sort: 20, children: [
            { id: 'zq-jtgj', name: '交通工具', code: 'ZQ-JTGJ', itemCount: 4, status: '启用', sort: 10 },
            { id: 'zq-zmsb', name: '照明设备', code: 'ZQ-ZMSB', itemCount: 5, status: '启用', sort: 20 },
            { id: 'zq-ajyq', name: '安检仪器', code: 'ZQ-AJYQ', itemCount: 4, status: '启用', sort: 30 },
            { id: 'zq-xgsb', name: '巡更设备', code: 'ZQ-XGSB', itemCount: 4, status: '启用', sort: 40 },
            { id: 'zq-lylx', name: '录音录像设备', code: 'ZQ-LYLX', itemCount: 3, status: '启用', sort: 50 },
            { id: 'zq-txsb', name: '通讯设备', code: 'ZQ-TXSB', itemCount: 4, status: '启用', sort: 60 },
        ],
    },
    {
        id: 'bdfh', name: '被动防护装备', code: 'BDFH', itemCount: 16, status: '启用', sort: 30, children: [
            { id: 'bdfh-fcf', name: '防刺服', code: 'BDFH-FCF', itemCount: 5, status: '启用', sort: 10 },
            { id: 'bdfh-fbtk', name: '防爆头盔', code: 'BDFH-FBTK', itemCount: 2, status: '启用', sort: 20 },
            { id: 'bdfh-fdtk', name: '防弹头盔', code: 'BDFH-FDTK', itemCount: 1, status: '启用', sort: 30 },
            { id: 'bdfh-fdy', name: '防弹衣', code: 'BDFH-FDY', itemCount: 2, status: '启用', sort: 40 },
            { id: 'bdfh-fbt', name: '防爆毯', code: 'BDFH-FBT', itemCount: 1, status: '启用', sort: 50 },
            { id: 'bdfh-dp', name: '盾牌', code: 'BDFH-DP', itemCount: 3, status: '启用', sort: 60 },
            { id: 'bdfh-fgst', name: '防割手套', code: 'BDFH-FGST', itemCount: 2, status: '启用', sort: 70 },
        ],
    },
    {
        id: 'zdfw', name: '主动防卫装备', code: 'ZDFW', itemCount: 5, status: '启用', sort: 40, children: [
            { id: 'zdfw-fbq', name: '防暴枪', code: 'ZDFW-FBQ', itemCount: 1, status: '启用', sort: 10 },
            { id: 'zdfw-bafbg', name: '保安防暴棍', code: 'ZDFW-BAFBG', itemCount: 3, status: '启用', sort: 20 },
            { id: 'zdfw-ysc', name: '约束叉', code: 'ZDFW-YSC', itemCount: 1, status: '启用', sort: 30 },
        ],
    },
    {
        id: 'xf', name: '消防装备', code: 'XF', itemCount: 9, status: '启用', sort: 50, children: [
            { id: 'xf-mhq', name: '灭火器', code: 'XF-MHQ', itemCount: 4, status: '启用', sort: 10 },
            { id: 'xf-fhmj', name: '防火面具', code: 'XF-FHMJ', itemCount: 2, status: '启用', sort: 20 },
            { id: 'xf-jys', name: '救援绳', code: 'XF-JYS', itemCount: 2, status: '启用', sort: 30 },
            { id: 'xf-mht', name: '灭火毯', code: 'XF-MHT', itemCount: 1, status: '启用', sort: 40 },
        ],
    },
    {
        id: 'aj', name: '安检装备', code: 'AJ', itemCount: 7, status: '启用', sort: 60, children: [
            { id: 'aj-sbx', name: '安检设备箱', code: 'AJ-SBX', itemCount: 2, status: '启用', sort: 10 },
            { id: 'aj-xray', name: '微剂量X射线安全检查仪', code: 'AJ-XRAY', itemCount: 1, status: '启用', sort: 20 },
            { id: 'aj-tcm', name: '通过式金属探测门', code: 'AJ-TCM', itemCount: 2, status: '启用', sort: 30 },
            { id: 'aj-hl', name: '不锈钢护栏', code: 'AJ-HL', itemCount: 2, status: '启用', sort: 40 },
        ],
    },
];

const equipmentSeed: EquipmentRow[] = [
    { id: 1, code: 'XF-JYF-001', name: '应急救援服-三棵树', status: true, categoryPath: ['xf', 'xf-fhmj'], category: '消防装备 / 防火面具', unit: '套', supplier: '三棵树', price: 195, spec: '阻燃反光套装', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:20' },
    { id: 2, code: 'XF-JYF-002', name: '应急救援服-安豹', status: true, categoryPath: ['xf', 'xf-fhmj'], category: '消防装备 / 防火面具', unit: '套', supplier: '安豹', price: 480, spec: '阻燃反光套装', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:18' },
    { id: 3, code: 'FZ-WYK-001', name: '速干短衣-安豹', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '安豹', price: 86, spec: '藏蓝色/尺码齐全', warehouse: '全部仓库', remark: '', modifier: '刘珍珍', modifiedAt: '2026-03-03 09:42' },
    { id: 4, code: 'FZ-WYK-002', name: '速干长衣-安豹', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '安豹', price: 96, spec: '藏蓝色/尺码齐全', warehouse: '全部仓库', remark: '', modifier: '刘珍珍', modifiedAt: '2026-03-03 09:40' },
    { id: 5, code: 'FZ-M-001', name: '速干执勤帽子-三棵树', status: true, categoryPath: ['fz', 'fz-m'], category: '保安员服装 / 帽', unit: '个', supplier: '三棵树', price: 20, spec: '均码', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:15' },
    { id: 6, code: 'FZ-WYK-003', name: '速干春秋长袖执勤服-三棵树', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '三棵树', price: 170, spec: '春秋款', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:12' },
    { id: 7, code: 'FZ-WYK-004', name: '速干夏季短袖执勤服-三棵树', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '三棵树', price: 160, spec: '夏季款', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:10' },
    { id: 8, code: 'FZ-M-002', name: '作训帽子-安豹', status: true, categoryPath: ['fz', 'fz-m'], category: '保安员服装 / 帽', unit: '个', supplier: '安豹', price: 15, spec: '均码', warehouse: '部分仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:08' },
    { id: 9, code: 'FZ-WYK-005', name: '作训棉衣-安豹', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '件', supplier: '安豹', price: 160, spec: '冬季款', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:05' },
    { id: 10, code: 'FZ-WYK-006', name: '春秋作训服-安豹', status: true, categoryPath: ['fz', 'fz-wyk'], category: '保安员服装 / 外衣裤', unit: '套', supplier: '安豹', price: 140, spec: '春秋款', warehouse: '全部仓库', remark: '', modifier: '山东振邦集团', modifiedAt: '2026-01-26 11:02' },
    { id: 11, code: 'ZQ-ZMSB-001', name: '强光手电', status: true, categoryPath: ['zq', 'zq-zmsb'], category: '执勤装备 / 照明设备', unit: '个', supplier: '易安通设备', price: 92, spec: '充电式/1200流明', warehouse: '全部仓库', remark: '', modifier: '孙鹏', modifiedAt: '2026-06-18 14:20' },
    { id: 12, code: 'ZQ-TXSB-001', name: '数字对讲机', status: true, categoryPath: ['zq', 'zq-txsb'], category: '执勤装备 / 通讯设备', unit: '台', supplier: '易安通设备', price: 386, spec: '公网集群/含充电座', warehouse: '全部仓库', remark: '', modifier: '孙鹏', modifiedAt: '2026-06-18 14:15' },
    { id: 13, code: 'BDFH-FCF-001', name: '防刺服', status: true, categoryPath: ['bdfh', 'bdfh-fcf'], category: '被动防护装备 / 防刺服', unit: '件', supplier: '安豹', price: 640, spec: 'GA标准/黑色', warehouse: '部分仓库', remark: '', modifier: '王宁', modifiedAt: '2026-06-17 10:05' },
    { id: 14, code: 'ZDFW-BAFBG-001', name: '保安防暴棍', status: true, categoryPath: ['zdfw', 'zdfw-bafbg'], category: '主动防卫装备 / 保安防暴棍', unit: '根', supplier: '安豹', price: 58, spec: '橡胶/标准型', warehouse: '全部仓库', remark: '', modifier: '王宁', modifiedAt: '2026-06-17 09:58' },
    { id: 15, code: 'AJ-SBX-001', name: '手持金属探测器', status: true, categoryPath: ['aj', 'aj-sbx'], category: '安检装备 / 安检设备箱', unit: '台', supplier: '易安通设备', price: 1180, spec: '高灵敏度/充电款', warehouse: '全部仓库', remark: '', modifier: '赵静', modifiedAt: '2026-06-16 16:30' },
];

function cloneCategories() {
    return JSON.parse(JSON.stringify(categorySeed)) as CategoryNode[];
}

function flattenCategories(nodes: CategoryNode[], path: string[] = []): Array<{ node: CategoryNode; path: string[]; level: number }> {
    return nodes.flatMap((node) => {
        const nextPath = [...path, node.id];
        return [{ node, path: nextPath, level: nextPath.length }, ...flattenCategories(node.children ?? [], nextPath)];
    });
}

function findCategory(nodes: CategoryNode[], id: string): CategoryNode | undefined {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findCategory(node.children ?? [], id);
        if (found) return found;
    }
}

function categoryPathLabel(nodes: CategoryNode[], ids: string[]) {
    return ids.map((id) => findCategory(nodes, id)?.name).filter(Boolean).join(' / ');
}

function makeCategoryOptions(nodes: CategoryNode[]): any[] {
    return nodes.map((node) => ({
        value: node.id,
        label: `${node.name}（${node.code}）`,
        disabled: node.status === '停用',
        children: node.children?.length ? makeCategoryOptions(node.children) : undefined,
    }));
}

function filterCategoryTree(nodes: CategoryNode[], name: string, status: string, levelFilter: string, level = 1): CategoryNode[] {
    const keyword = name.trim().toLowerCase();
    return nodes.flatMap((node) => {
        const children = filterCategoryTree(node.children ?? [], name, status, levelFilter, level + 1);
        const selfMatch = (!keyword || node.name.toLowerCase().includes(keyword) || node.code.toLowerCase().includes(keyword))
            && (status === '全部' || node.status === status)
            && (levelFilter === '全部' || Number(levelFilter) === level);
        if (selfMatch || children.length) return [{ ...node, children }];
        return [];
    });
}

const renderCode = compile(equipmentTemplate, { mode: 'function' }).code;
const equipmentRender = new Function('Vue', renderCode)(Vue);

export function mountEquipmentArchiveApp(target: HTMLElement, options: MountOptions = {}) {
    const component = Vue.defineComponent({
        name: 'EquipmentArchiveVueApp',
        render: equipmentRender,
        setup() {
            const activeTab = Vue.ref<PageId>('archive');
            const categories = Vue.ref<CategoryNode[]>(cloneCategories());
            const equipmentRows = Vue.ref<EquipmentRow[]>(equipmentSeed.map((row) => ({ ...row, categoryPath: [...row.categoryPath] })));
            const currentPage = Vue.ref(1);
            const pageSize = 10;
            const filters = Vue.reactive({ name: '', categoryPath: [] as string[], supplier: '', status: '全部' });
            const categoryFilters = Vue.reactive({ name: '', level: '全部', status: '全部' });
            const equipmentDialogVisible = Vue.ref(false);
            const categoryDialogVisible = Vue.ref(false);
            const equipmentFormRef = Vue.ref<any>();
            const categoryFormRef = Vue.ref<any>();
            const editingEquipmentId = Vue.ref<number | null>(null);
            const editingCategoryId = Vue.ref<string | null>(null);
            const supplierNames = ['三棵树', '安豹', '易安通设备', '京东慧采-三棵树安保用品', '京东慧采-易安通设备'];
            const equipmentForm = Vue.reactive<any>({ id: null, name: '', categoryPath: [], code: '', unit: '', supplier: '', spec: '', price: null, warehouse: '全部仓库', status: true, remark: '' });
            const categoryForm = Vue.reactive<any>({ name: '', parentPath: [], code: '', status: '启用', sort: 10, remark: '' });

            const categoryFlatRows = Vue.computed(() => flattenCategories(categories.value));
            const categoryOptions = Vue.computed(() => makeCategoryOptions(categories.value));
            const filteredCategoryTree = Vue.computed(() => filterCategoryTree(categories.value, categoryFilters.name, categoryFilters.status, categoryFilters.level));
            const filteredEquipmentRows = Vue.computed(() => equipmentRows.value.filter((row) => {
                const keyword = filters.name.trim().toLowerCase();
                const nameMatches = !keyword || row.name.toLowerCase().includes(keyword) || row.code.toLowerCase().includes(keyword);
                const supplierMatches = !filters.supplier || row.supplier.toLowerCase().includes(filters.supplier.toLowerCase());
                const statusMatches = filters.status === '全部' || (filters.status === '启用' ? row.status : !row.status);
                const categoryMatches = !filters.categoryPath.length || filters.categoryPath.every((id, index) => row.categoryPath[index] === id);
                return nameMatches && supplierMatches && statusMatches && categoryMatches;
            }));
            const pagedEquipmentRows = Vue.computed(() => {
                const start = (currentPage.value - 1) * pageSize;
                return filteredEquipmentRows.value.slice(start, start + pageSize);
            });
            const equipmentDialogTitle = Vue.computed(() => editingEquipmentId.value ? '编辑装备' : '新增装备');
            const categoryDialogTitle = Vue.computed(() => editingCategoryId.value ? '编辑分类' : '新增分类');

            const cascaderProps = { checkStrictly: true, emitPath: true };
            const equipmentCascaderProps = { emitPath: true };
            const parentCascaderProps = { checkStrictly: true, emitPath: true };
            const equipmentRules = {
                name: [{ required: true, message: '装备名称不能为空', trigger: 'blur' }],
                categoryPath: [{ type: 'array', required: true, min: 1, message: '请选择末级分类', trigger: 'change' }],
                unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
                supplier: [{ required: true, message: '请选择或输入供应商', trigger: 'change' }],
                price: [{ required: true, message: '参考价格不能为空', trigger: 'change' }],
                warehouse: [{ required: true, message: '请选择使用仓库', trigger: 'change' }],
            };
            const categoryRules = Vue.computed(() => ({
                name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
                code: [
                    { required: true, message: '分类编码不能为空', trigger: 'blur' },
                    { pattern: /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, message: '仅支持大写字母、数字和短横线', trigger: 'blur' },
                    { validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
                        const duplicated = categoryFlatRows.value.some(({ node }) => node.code === value && node.id !== editingCategoryId.value);
                        callback(duplicated ? new Error('分类编码已存在') : undefined);
                    }, trigger: 'blur' },
                ],
            }));

            function nextEquipmentCode(path: string[]) {
                const categoryId = path[path.length - 1];
                const category = categoryId ? findCategory(categories.value, categoryId) : undefined;
                if (!category) return '';
                const prefix = `${category.code}-`;
                const max = equipmentRows.value.reduce((current, row) => {
                    if (!row.code.startsWith(prefix) || row.id === editingEquipmentId.value) return current;
                    const seq = Number(row.code.slice(prefix.length));
                    return Number.isFinite(seq) ? Math.max(current, seq) : current;
                }, 0);
                return `${prefix}${String(max + 1).padStart(3, '0')}`;
            }

            function handleEquipmentCategoryChange(value: string[]) {
                const leaf = value?.length ? findCategory(categories.value, value[value.length - 1]) : undefined;
                if (leaf?.children?.length) {
                    equipmentForm.code = '';
                    ElMessage.warning('请选择末级分类');
                    return;
                }
                equipmentForm.code = nextEquipmentCode(value ?? []);
            }

            function resetEquipmentForm() {
                Object.assign(equipmentForm, { id: null, name: '', categoryPath: [], code: '', unit: '', supplier: '', spec: '', price: null, warehouse: '全部仓库', status: true, remark: '' });
                editingEquipmentId.value = null;
            }

            function openEquipmentDialog(row?: EquipmentRow) {
                resetEquipmentForm();
                if (row) {
                    editingEquipmentId.value = row.id;
                    Object.assign(equipmentForm, { ...row, categoryPath: [...row.categoryPath] });
                }
                equipmentDialogVisible.value = true;
                Vue.nextTick(() => equipmentFormRef.value?.clearValidate());
            }

            async function saveEquipment() {
                const valid = await equipmentFormRef.value?.validate().catch(() => false);
                if (!valid) return;
                const selected = findCategory(categories.value, equipmentForm.categoryPath[equipmentForm.categoryPath.length - 1]);
                if (!selected || selected.children?.length) {
                    ElMessage.error('请选择末级分类');
                    return;
                }
                if (!equipmentForm.code) equipmentForm.code = nextEquipmentCode(equipmentForm.categoryPath);
                const payload: EquipmentRow = {
                    id: editingEquipmentId.value ?? Math.max(0, ...equipmentRows.value.map((row) => row.id)) + 1,
                    code: equipmentForm.code,
                    name: equipmentForm.name,
                    status: equipmentForm.status,
                    categoryPath: [...equipmentForm.categoryPath],
                    category: categoryPathLabel(categories.value, equipmentForm.categoryPath),
                    unit: equipmentForm.unit,
                    supplier: equipmentForm.supplier,
                    price: Number(equipmentForm.price),
                    spec: equipmentForm.spec,
                    warehouse: equipmentForm.warehouse,
                    remark: equipmentForm.remark,
                    modifier: '当前用户',
                    modifiedAt: '2026-06-30 17:30',
                };
                const index = equipmentRows.value.findIndex((row) => row.id === editingEquipmentId.value);
                if (index >= 0) equipmentRows.value.splice(index, 1, payload);
                else equipmentRows.value.unshift(payload);
                equipmentDialogVisible.value = false;
                currentPage.value = 1;
                ElMessage.success(editingEquipmentId.value ? '装备档案已更新' : `装备已新增，编码为 ${payload.code}`);
            }

            async function deleteEquipment(row: EquipmentRow) {
                const confirmed = await ElMessageBox.confirm(`确定删除装备“${row.name}”吗？`, '删除确认', { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }).then(() => true).catch(() => false);
                if (!confirmed) return;
                const index = equipmentRows.value.findIndex((item) => item.id === row.id);
                if (index >= 0) {
                    equipmentRows.value.splice(index, 1);
                    ElMessage.success('装备档案已删除');
                }
            }

            function notifyStatus(row: EquipmentRow) {
                ElMessage.success(`${row.name}已${row.status ? '启用' : '停用'}`);
            }

            function searchEquipment() {
                currentPage.value = 1;
                ElMessage.success(`已找到 ${filteredEquipmentRows.value.length} 条装备档案`);
            }

            function resetEquipmentFilters() {
                Object.assign(filters, { name: '', categoryPath: [], supplier: '', status: '全部' });
                currentPage.value = 1;
            }

            function querySuppliers(query: string, callback: (items: Array<{ value: string }>) => void) {
                const normalized = query.trim().toLowerCase();
                callback(supplierNames.filter((name) => !normalized || name.toLowerCase().includes(normalized)).map((value) => ({ value })));
            }

            function resetCategoryForm() {
                Object.assign(categoryForm, { name: '', parentPath: [], code: '', status: '启用', sort: 10, remark: '' });
                editingCategoryId.value = null;
            }

            function findPath(id: string) {
                return categoryFlatRows.value.find(({ node }) => node.id === id)?.path ?? [];
            }

            function openCategoryDialog(row?: CategoryNode) {
                resetCategoryForm();
                if (row) {
                    editingCategoryId.value = row.id;
                    const ownPath = findPath(row.id);
                    Object.assign(categoryForm, { name: row.name, parentPath: ownPath.slice(0, -1), code: row.code, status: row.status, sort: row.sort, remark: row.remark ?? '' });
                }
                categoryDialogVisible.value = true;
                Vue.nextTick(() => categoryFormRef.value?.clearValidate());
            }

            function openChildCategoryDialog(row: CategoryNode) {
                const path = findPath(row.id);
                if (path.length >= 3) {
                    ElMessage.warning('最多支持三级分类');
                    return;
                }
                resetCategoryForm();
                categoryForm.parentPath = path;
                categoryForm.code = `${row.code}-`;
                categoryDialogVisible.value = true;
            }

            function handleCategoryParentChange(path: string[]) {
                if (path?.length >= 3) {
                    ElMessage.warning('最多支持三级分类');
                    categoryForm.parentPath = path.slice(0, 2);
                }
            }

            function normalizeCategoryCode(value: string) {
                categoryForm.code = value.toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/--+/g, '-');
            }

            function insertCategory(nodes: CategoryNode[], parentId: string | undefined, node: CategoryNode) {
                if (!parentId) {
                    nodes.push(node);
                    return true;
                }
                for (const parent of nodes) {
                    if (parent.id === parentId) {
                        parent.children = parent.children ?? [];
                        parent.children.push(node);
                        return true;
                    }
                    if (insertCategory(parent.children ?? [], parentId, node)) return true;
                }
                return false;
            }

            function removeCategory(nodes: CategoryNode[], id: string): boolean {
                const index = nodes.findIndex((node) => node.id === id);
                if (index >= 0) {
                    nodes.splice(index, 1);
                    return true;
                }
                return nodes.some((node) => removeCategory(node.children ?? [], id));
            }

            async function saveCategory() {
                const valid = await categoryFormRef.value?.validate().catch(() => false);
                if (!valid) return;
                if (categoryForm.parentPath.length >= 3) {
                    ElMessage.error('最多支持三级分类');
                    return;
                }
                if (editingCategoryId.value) {
                    const targetNode = findCategory(categories.value, editingCategoryId.value);
                    if (!targetNode) return;
                    Object.assign(targetNode, { name: categoryForm.name, code: categoryForm.code, status: categoryForm.status, sort: categoryForm.sort, remark: categoryForm.remark });
                    equipmentRows.value.forEach((row) => {
                        if (row.categoryPath.includes(targetNode.id)) row.category = categoryPathLabel(categories.value, row.categoryPath);
                    });
                    ElMessage.success('分类已更新');
                } else {
                    const id = `${categoryForm.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
                    const node: CategoryNode = { id, name: categoryForm.name, code: categoryForm.code, itemCount: 0, status: categoryForm.status, sort: categoryForm.sort, remark: categoryForm.remark };
                    insertCategory(categories.value, categoryForm.parentPath.at(-1), node);
                    ElMessage.success('分类已新增');
                }
                categories.value = [...categories.value];
                categoryDialogVisible.value = false;
            }

            async function deleteCategory(row: CategoryNode) {
                if (row.children?.length) {
                    ElMessage.warning('该分类包含下级分类，请先处理下级分类');
                    return;
                }
                if (row.itemCount > 0 || equipmentRows.value.some((item) => item.categoryPath.includes(row.id))) {
                    ElMessage.warning('该分类已关联装备，无法删除');
                    return;
                }
                const confirmed = await ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`, '删除确认', { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }).then(() => true).catch(() => false);
                if (!confirmed) return;
                removeCategory(categories.value, row.id);
                categories.value = [...categories.value];
                ElMessage.success('分类已删除');
            }

            function searchCategories() {
                ElMessage.success(`已找到 ${flattenCategories(filteredCategoryTree.value).length} 个分类`);
            }

            function resetCategoryFilters() {
                Object.assign(categoryFilters, { name: '', level: '全部', status: '全部' });
            }

            function levelLabel(id: string) {
                const level = findPath(id).length;
                return ['一级分类', '二级分类', '三级分类'][level - 1] ?? `${level}级分类`;
            }

            function formatPrice(value: number) {
                return value % 1 === 0 ? String(value) : value.toFixed(2);
            }

            function externalTabHandler(event: Event) {
                const next = (event as CustomEvent<PageId>).detail;
                if (next === 'archive' || next === 'categories') activeTab.value = next;
            }

            Vue.watch(activeTab, (next) => options.onTabChange?.(next));
            Vue.watch(() => filters.categoryPath, () => { currentPage.value = 1; }, { deep: true });
            window.addEventListener('equipment-archive-tab', externalTabHandler);
            Vue.onUnmounted(() => window.removeEventListener('equipment-archive-tab', externalTabHandler));

            return {
                activeTab, categories, categoryOptions, categoryFlatRows, filteredCategoryTree,
                filters, categoryFilters, currentPage, pageSize, filteredEquipmentRows, pagedEquipmentRows,
                equipmentDialogVisible, equipmentDialogTitle, equipmentFormRef, equipmentForm, equipmentRules,
                categoryDialogVisible, categoryDialogTitle, categoryFormRef, categoryForm, categoryRules,
                cascaderProps, equipmentCascaderProps, parentCascaderProps,
                openEquipmentDialog, saveEquipment, deleteEquipment, notifyStatus, searchEquipment, resetEquipmentFilters,
                querySuppliers, handleEquipmentCategoryChange, openCategoryDialog, openChildCategoryDialog,
                saveCategory, deleteCategory, searchCategories, resetCategoryFilters, handleCategoryParentChange,
                normalizeCategoryCode, levelLabel, formatPrice,
                Plus: ElementPlusIconsVue.Plus,
                Search: ElementPlusIconsVue.Search,
            };
        },
    });

    const app = Vue.createApp(component);
    app.config.warnHandler = (message, _instance, trace) => {
        if (message === 'Property undefined was accessed during render but is not defined on instance.') return;
        console.warn(`[Vue warn]: ${message}${trace}`);
    };
    app.use(ElementPlus);
    Object.entries(ElementPlusIconsVue).forEach(([name, icon]) => app.component(name, icon));
    app.mount(target);
    return () => app.unmount();
}
