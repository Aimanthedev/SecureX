import { products, purchaseOrders } from './mock-data';
export type Batch = { id:string; productId:string; supplier:string; po:string; receipt:string; date:string; warehouse:string; initial:number; onHand:number; reserved:number; available:number; issued:number; returned:number; damaged:number; purchase:number; freight:number; insurance:number; duties:number; handling:number; other:number; landed:number; status:string; serials:string[] };
// Static demo batches retain the catalogue's aggregate stock and reservation counts.
const lots = [
 ['PR-01',24,9,600,628,'Main Warehouse'],['PR-01',18,6,640,664,'Service Store'],
 ['PR-02',28,6,640,670,'Main Warehouse'],['PR-03',5,1,2400,2490,'Main Warehouse'],
 ['PR-04',4,0,4200,4330,'Main Warehouse'],['PR-05',2,1,1900,1970,'Service Store'],
 ['PR-06',3,2,780,810,'Service Store'],['PR-07',22,4,480,506,'Main Warehouse'],['PR-08',6,1,1200,1250,'Main Warehouse'],
] as const;
export const batches:Batch[] = lots.map(([productId,onHand,reserved,purchase,landed,warehouse],i)=>({id:`B-26-${String(i+1).padStart(3,'0')}`,productId,supplier:products.find(p=>p.id===productId)?.supplier??'',po:purchaseOrders[i%4]?.number??'',receipt:`GR-26-${String(i+1).padStart(3,'0')}`,date:i===1?'2026-10-28':'2026-10-12',warehouse,initial:onHand+4,onHand,reserved,available:onHand-reserved,issued:4,returned:0,damaged:0,purchase,freight:12,insurance:2,duties:0,handling:8,other:landed-purchase-22,landed,status:'Available',serials:Array.from({length:Math.min(onHand,3)},(_,n)=>`SN-${i+1}-${String(n+1).padStart(5,'0')}`)}));
export const quarantineBatch:Batch = {...batches[0],id:'B-26-Q01',initial:2,onHand:2,reserved:0,available:0,issued:0,damaged:2,status:'Quarantined',serials:['SN-Q-00001','SN-Q-00002']};
export const allBatches=[...batches,quarantineBatch];
export function batchSelectable(batch:Batch){return batch.status==='Available' && batch.available>0;}
export const warehouses=[{name:'Main Warehouse',location:'Industrial Area • Aisles A–D',manager:'Aisha Rahman',units:89,status:'Operational'},{name:'Service Store',location:'Service centre • Rack S',manager:'Bilal Farooq',units:23,status:'Operational'}];
export const movements=[
 {id:'MV-26-081',date:'2026-10-30 09:40',productId:'PR-01',batch:'B-26-001',warehouse:'Main Warehouse',type:'Project Issue',qtyIn:0,qtyOut:4,before:28,after:24,document:'DN-26-014',by:'Aisha Rahman',projectId:'P-041'},
 {id:'MV-26-080',date:'2026-10-28 14:15',productId:'PR-01',batch:'B-26-002',warehouse:'Service Store',type:'Goods Receipt',qtyIn:22,qtyOut:0,before:0,after:22,document:'GR-26-002',by:'Bilal Farooq',projectId:'P-038'},
 {id:'MV-26-079',date:'2026-10-27 11:00',productId:'PR-06',batch:'B-26-007',warehouse:'Service Store',type:'Reservation',qtyIn:0,qtyOut:0,before:3,after:3,document:'QTN-26-054',by:'Anitha Verghese',projectId:'P-041'},
 {id:'MV-26-078',date:'2026-10-25 10:20',productId:'PR-05',batch:'B-26-006',warehouse:'Service Store',type:'Warehouse Transfer',qtyIn:2,qtyOut:0,before:0,after:2,document:'TR-26-008',by:'Aisha Rahman',projectId:'P-044'},
 {id:'MV-26-077',date:'2026-10-24 16:05',productId:'PR-01',batch:'B-26-Q01',warehouse:'Main Warehouse',type:'Damaged Stock',qtyIn:0,qtyOut:2,before:4,after:2,document:'ADJ-26-003',by:'Aisha Rahman',projectId:'P-041'},
];
export const receiving=[{id:'GR-26-010',supplier:'Al Manara Distribution',po:'AHC-PO-2026-338',warehouse:'Main Warehouse',date:'2026-11-03',productId:'PR-02',quantity:20,status:'Awaiting Delivery',batch:'Unassigned'},{id:'GR-26-009',supplier:'Storage Traders LLC',po:'AHC-PO-2026-339',warehouse:'Service Store',date:'2026-11-04',productId:'PR-06',quantity:6,status:'Partially Received',batch:'B-26-007'}];
export const movementTypes=['Opening Stock','Goods Receipt','Reservation','Reservation Release','Project Issue','Customer Delivery','Return','Warehouse Transfer','Stock Adjustment','Damaged Stock'];
