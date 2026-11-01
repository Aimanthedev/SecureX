import { test, expect } from 'bun:test';
import { batches, batchSelectable, quarantineBatch } from './inventory-demo';
import { products } from './mock-data';
import { customerFacingLines, defaultLines } from './commercial-demo';
test('same model retains exact batches with distinct landed costs',()=>{const pair=batches.filter(b=>b.productId==='PR-01');expect(pair.map(b=>b.id)).toEqual(['B-26-001','B-26-002']);expect(pair.map(b=>b.landed)).toEqual([628,664]);});
test('unavailable or quarantined batch cannot be selected',()=>{expect(batchSelectable(quarantineBatch)).toBe(false);expect(batchSelectable({...batches[0],available:0})).toBe(false);expect(batchSelectable(batches[0])).toBe(true);});
test('demo lots preserve catalogue on hand and reservations',()=>{for(const p of products){const lots=batches.filter(b=>b.productId===p.id);expect(lots.reduce((s,b)=>s+b.onHand,0)).toBe(p.stock);expect(lots.reduce((s,b)=>s+b.reserved,0)).toBe(p.reserved);}});
test('customer-facing lines exclude internal costs and margins',()=>{const line={...defaultLines[0],landed:628,purchase:600,margin:32};const result=customerFacingLines([line])[0];expect(result).not.toHaveProperty('landed');expect(result).not.toHaveProperty('purchase');expect(result).not.toHaveProperty('margin');});
