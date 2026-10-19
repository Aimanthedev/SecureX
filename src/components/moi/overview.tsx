import { AlertTriangle, ArrowUpRight, Award, CalendarClock, Files, GitBranch, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOI_PROJECTS, MOI_SUBMISSIONS, MOI_INSPECTIONS, MOI_CERTS, MOI_DOC_FOLDERS, daysLeftLabel } from '@/lib/moi-data';
import { fmtDate } from '@/lib/format';
import { Badge, Frame, SectionTitle } from './primitives';
const pname = (id: string) => MOI_PROJECTS.find(p => p.id === id)?.name ?? id;
const stages = [
  { label: 'Design Preparation', stages: ['Site Survey', 'Design Package', 'Client Approval'] },
  { label: 'Submission', stages: ['MOI/SSD Submission'] },
  { label: 'Review', stages: ['MOI Review', 'Comments / Corrections'] },
  { label: 'Approval', stages: ['Design Approved'] },
  { label: 'Installation', stages: ['Installation', 'Testing & Commissioning'] },
  { label: 'Inspection', stages: ['Inspection Request', 'MOI Inspection', 'Corrections / Reinspection'] },
  { label: 'Certification', stages: ['Certificate Received', 'Handover', 'AMC / Maintenance'] },
];
export function MoiOverview({ onTab }: { onTab: (tab: string) => void }) {
 const certs = MOI_CERTS.filter(c => c.status !== 'Valid').sort((a,b) => a.expiry.localeCompare(b.expiry));
 const attention = [
  ...MOI_PROJECTS.filter(p => ['High','Critical'].includes(p.risk)).map(p => ({ id:p.id, title:p.name, detail:p.nextAction, reference:p.code, status:p.certStatus, severity:'critical' })),
  ...MOI_SUBMISSIONS.filter(s => s.status === 'Missing').map(s => ({ id:s.id, title:s.item, detail:s.comments, reference:pname(s.project), status:'Missing', severity:'critical' })),
  ...MOI_SUBMISSIONS.filter(s => s.status === 'Submitted').slice(0,1).map(s => ({ id:s.id, title:s.item, detail:pname(s.project), reference:'Submission awaiting review', status:s.status, severity:'info' })),
  ...certs.filter(c => c.type !== 'Maintenance').slice(0,1).map(c => ({ id:c.id, title:c.name, detail:`${fmtDate(c.expiry)} · ${c.owner}`, reference:'Upcoming renewal', status:c.status, severity:'warning' })),
 ];
 const snapshot = [
  {name:'SSD Approval', folders:['Company MOI approval','SSD registration'], status:'Pending'},
  {name:'CCTV Layouts', folders:['Approved CCTV layout'], status:'Approved'},
  {name:'Technical Submissions', folders:['Project design submission','Camera schedule','Technical datasheets'], status:'Missing'},
  {name:'Inspection Reports', folders:['Inspection report'], status:'Approved'},
  {name:'Certificates', folders:['Certificate / approval'], status:'Approved'},
  {name:'Maintenance Contracts', folders:['Maintenance contract'], status:'Expired'},
 ];
 return <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
  <Frame className="moi-attention">
   <SectionTitle icon={AlertTriangle} title="Compliance Attention Center" detail="Priority matters requiring a decision"><Badge status={`${attention.length} attention items`} /></SectionTitle>
   {attention.map(a => <div key={a.id} className="moi-attention-row"><span className={`moi-dot moi-dot-${a.severity}`} /><div className="min-w-0"><div className="text-xs font-semibold leading-5">{a.title}</div><p className="mt-1 text-xs leading-5 text-muted-foreground">{a.detail}</p><div className="mt-2 text-[10px] text-muted-foreground">{a.reference}</div></div><Badge status={a.status} /></div>)}
  </Frame>
  <Frame><SectionTitle icon={CalendarClock} title="Renewal Watchlist" detail="Certificates and maintenance validity"><Button size="icon" variant="ghost" aria-label="Open renewal calendar" onClick={()=>onTab('Renewal Calendar')}><ArrowUpRight className="h-4 w-4" /></Button></SectionTitle>
   {certs.map(c => <div key={c.id} className="moi-watch-row"><div className="moi-date"><div className="text-[9px] uppercase text-muted-foreground">{new Date(c.expiry).toLocaleDateString('en',{month:'short',timeZone:'UTC'})}</div><div className="text-xl font-semibold">{c.expiry.slice(8)}</div></div><div className="min-w-0"><h3 className="text-xs font-medium leading-5">{c.name}</h3><p className="my-1 text-[10px] text-muted-foreground">{fmtDate(c.expiry)} · {c.owner}</p><div className="flex flex-wrap gap-1.5"><Badge status={c.status} /><span className="self-center text-[10px] text-muted-foreground">{daysLeftLabel(c.expiry)}</span></div></div></div>)}
  </Frame>
  <Frame className="lg:col-span-2"><SectionTitle icon={GitBranch} title="MOI Project Workflow" detail="Current project distribution across the approval lifecycle" /><div className="moi-workflow">{stages.map((s,index)=>{const count=MOI_PROJECTS.filter(p=>s.stages.includes(p.stage)).length;return <div key={s.label} className={`moi-stage ${count?'moi-stage-active':''}`}><div className="flex items-center justify-between"><span className="moi-stage-count">{count}</span><span className="mb-3 text-[9px] text-muted-foreground">0{index+1}</span></div><h3 className="min-h-8 text-[11px] font-semibold leading-4">{s.label}</h3><p className="mt-2 text-[9px] text-muted-foreground">{count?'Active records':'No records'}</p></div>})}</div></Frame>
  <Frame><SectionTitle icon={ShieldCheck} title="Inspection Schedule" detail="Inspection dates, requests and corrective visits" /><div className="moi-timeline">{MOI_INSPECTIONS.filter(i=>i.result!=='Passed').sort((a,b)=>(a.scheduled??a.requested).localeCompare(b.scheduled??b.requested)).map(i => <div key={i.id} className="moi-timeline-row"><div className="mb-2 text-[10px] text-muted-foreground">{i.scheduled?'Inspection date':'Requested'} · {fmtDate(i.scheduled??i.requested)}</div><h3 className="text-xs font-semibold leading-5">{pname(i.project)}</h3><p className="my-2 text-[10px] text-muted-foreground">{MOI_PROJECTS.find(p=>p.id===i.project)?.coordinator}</p><Badge status={i.result} /></div>)}</div></Frame>
  <Frame><SectionTitle icon={Files} title="Compliance Documents Snapshot" detail="Evidence library by document category"><span className="text-xs text-muted-foreground">{MOI_DOC_FOLDERS.reduce((a,f)=>a+f.count,0)} files</span></SectionTitle><div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{snapshot.map(s=><Button key={s.name} variant="ghost" className="moi-doc" onClick={()=>onTab('Document Register')}><Award className="h-5 w-5 text-login-blue" /><span className="text-xs font-medium leading-5">{s.name}</span><span className="text-xl font-semibold">{MOI_DOC_FOLDERS.filter(f=>s.folders.includes(f.name)).reduce((a,f)=>a+f.count,0)}<span className="ml-1 text-[10px] font-normal text-muted-foreground">files</span></span><Badge status={s.status} /></Button>)}</div></Frame>
 </div>;
}
