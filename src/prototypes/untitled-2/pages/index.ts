import { defineHashPageRoute } from '../../../common/useHashPage';

export type EquipmentPage = 'home' | 'flow' | 'transfer' | 'stocktake' | 'project-check';

export const equipmentPageRoute = defineHashPageRoute([
    { id: 'home', title: '功能中心' },
    { id: 'flow', title: '出入库管理' },
    { id: 'transfer', title: '调拨管理' },
    { id: 'stocktake', title: '库存盘点' },
    { id: 'project-check', title: '项目装备盘点' },
], { defaultPageId: 'home' });

export function isEquipmentPage(pageId: string): pageId is EquipmentPage {
    return equipmentPageRoute.pages.some((page) => page.id === pageId);
}
