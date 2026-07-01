/**
 * @name 安保管理平台装备档案管理（高精度还原）
 */
import React, { useEffect, useRef } from 'react';
import './vue-flags';
import { mountEquipmentArchiveExact } from './vue-app';
import './style.css';

export default function EquipmentArchiveExactPrototype() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        return mountEquipmentArchiveExact(mountRef.current);
    }, []);

    return <div ref={mountRef} className="equipment-exact-mount" />;
}

