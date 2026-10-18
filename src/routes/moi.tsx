import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Activity, AlertTriangle, Award, CalendarClock, CheckCheck, Files, FolderOpen, GitBranch, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOI_PROJECTS, MOI_SUBMISSIONS, MOI_INSPECTIONS, MOI_CERTS, MOI_DOC_FOLDERS } from '@/lib/moi-data';
import { MoiOverview } from '@/components/moi/overview';
import { ProjectsTab, SubmissionsTab, InspectionsTab, CertificatesTab, DocumentsTab, ChecklistTab } from '@/components/moi/record-tabs';
import { RenewalCalendar } from '@/components/moi/renewal-calendar';
import '@/components/moi/moi.css';
import { toast } from 'sonner';

export const Route=createFileRoute('/moi')({head:()=>({meta:[
 {title:'MOI Compliance | SecureX'},
 {name:'description',content:'SecureX MOI and SSD compliance intelligence: project approvals, inspections, certificates, evidence and renewal tracking.'},
 {property:'og:title',content:'MOI Compliance | SecureX'},
 {property:'og:description',content:'Compliance intelligence for Qatar CCTV projects, MOI inspections, certificates and renewals.'},
 {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary_large_image'},
]}),component:MoiPage});
const navigation=[{name:'Overview',icon:Activity},{name:'MOI Projects',icon:ShieldCheck},{name:'Submissions',icon:GitBranch},{name:'Inspections',icon:CheckCheck},{name:'Certificates & Permits',icon:Award},{name:'Document Register',icon:Files},{name:'Renewal Calendar',icon:CalendarClock},{name:'Compliance Checklist',icon:FolderOpen}];
function MoiPage(){
 const [tab,setTab]=useState('Overview');const [open,setOpen]=useState(false);
 const pending=MOI_SUBMISSIONS.filter(s=>['Submitted','Pending'].includes(s.status)).length;
 const inspections=MOI_INSPECTIONS.filter(i=>['Requested','Scheduled'].includes(i.result)).length;
 const expiry=MOI_CERTS.filter(c=>c.type!=='Maintenance'&&c.status!=='Valid').length;
 const metrics=[{label:'Active MOI Projects',value:MOI_PROJECTS.length,note:`${MOI_PROJECTS.filter(p=>['High','Critical'].includes(p.risk)).length} priority project matters`,icon:ShieldCheck,tone:'brand'},{label:'Pending Submissions',value:pending,note:`${MOI_SUBMISSIONS.filter(s=>s.status==='Submitted').length} submitted · ${MOI_SUBMISSIONS.filter(s=>s.status==='Pending').length} pending`,icon:Files,tone:'blue'},{label:'Inspections Awaiting Action',value:inspections,note:`${MOI_INSPECTIONS.filter(i=>i.result==='Scheduled').length} scheduled · ${MOI_INSPECTIONS.filter(i=>i.result==='Requested').length} requested`,icon:CheckCheck,tone:'teal'},{label:'Expiring Certificates',value:expiry,note:'Company & project certificates',icon:Award,tone:'amber'}];
 const secondary=[{label:'Corrections required',value:MOI_PROJECTS.filter(p=>p.stage.includes('Correction')).length,icon:AlertTriangle},{label:'Maintenance expiries',value:MOI_CERTS.filter(c=>c.type==='Maintenance'&&c.status!=='Valid').length,icon:CalendarClock},{label:'Missing documents',value:MOI_SUBMISSIONS.filter(s=>s.status==='Missing').length,icon:Files},{label:'Approved categories',value:MOI_DOC_FOLDERS.filter(f=>f.status==='Approved').length,icon:ShieldCheck}];
 return <div className="moi-page">
  <header className="moi-header"><div className="min-w-0"><div className="moi-eyebrow mb-2 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-login-brand" />Qatar · MOI / SSD</div><h1 className="text-2xl font-semibold sm:text-3xl">MOI Compliance</h1><p className="mt-2 text-xs text-muted-foreground sm:text-sm">Security Systems Department · Compliance Intelligence</p></div><Button className="moi-primary shrink-0 justify-self-start rounded-lg" onClick={()=>setOpen(true)}><Plus className="h-4 w-4" />New MOI Record</Button></header>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m=><section key={m.label} className={`moi-kpi moi-kpi-${m.tone}`}><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><h2 className="text-xs font-medium text-muted-foreground">{m.label}</h2><span className="moi-kpi-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg"><m.icon className="h-4 w-4" /></span></div><div className="mt-1 text-4xl font-semibold tabular-nums">{m.value}</div><p className="mt-3 text-[10px] text-muted-foreground">{m.note}</p></section>)}</div>
  <div className="moi-secondary">{secondary.map(s=><div key={s.label}><s.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><span className="text-lg font-semibold">{s.value}</span><span className="text-[10px] leading-4 text-muted-foreground">{s.label}</span></div>)}</div>
  <Tabs value={tab} onValueChange={setTab}>
   <div className="mb-5 md:hidden"><Select value={tab} onValueChange={setTab}><SelectTrigger aria-label="MOI section" className="w-full bg-card"><SelectValue /></SelectTrigger><SelectContent>{navigation.map(n=><SelectItem key={n.name} value={n.name}>{n.name}</SelectItem>)}</SelectContent></Select></div>
   <TabsList aria-label="MOI sections" className="moi-tabs hidden md:grid">{navigation.map(n=><TabsTrigger key={n.name} value={n.name} className="moi-tab"><n.icon className="h-3.5 w-3.5 shrink-0" /><span>{n.name}</span></TabsTrigger>)}</TabsList>
   <TabsContent value="Overview"><MoiOverview onTab={setTab} /></TabsContent>
   <TabsContent value="MOI Projects"><ProjectsTab /></TabsContent>
   <TabsContent value="Submissions"><SubmissionsTab /></TabsContent>
   <TabsContent value="Inspections"><InspectionsTab /></TabsContent>
   <TabsContent value="Certificates & Permits"><CertificatesTab /></TabsContent>
   <TabsContent value="Document Register"><DocumentsTab /></TabsContent>
   <TabsContent value="Renewal Calendar"><RenewalCalendar /></TabsContent>
   <TabsContent value="Compliance Checklist"><ChecklistTab /></TabsContent>
  </Tabs>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New MOI record</DialogTitle></DialogHeader><div className="space-y-4">{['Project name','Client','Assigned coordinator'].map((field,i)=><div key={field} className="space-y-2"><Label htmlFor={`moi-record-${i}`}>{field}</Label><Input id={`moi-record-${i}`} placeholder={field} /></div>)}</div><DialogFooter><Button className="moi-primary" onClick={()=>{setOpen(false);toast('Demo UI only')}}>Save (demo)</Button></DialogFooter></DialogContent></Dialog>
 </div>;
}
