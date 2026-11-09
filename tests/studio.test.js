import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStudio,validateLead,proposalMarkdown,pilotMetrics,outreachDraft,localDate} from '../src/studio-data.js';
import {parseIAMCSV,assessIAM} from '../src/iam-assessment.js';
import {normalizeNotices,noticeStatus} from '../src/procurement-data.js';
import {buildStarterFiles,zipStarter} from '../src/build-workspace.js';
const lead={id:'lead-one',company:'Acme Clinic',countryCode:'COD',stage:'discovery',ideaName:'Access lifecycle',problem:'Account removal is delayed',mvp:'Approved changes in a sandbox',benefit:'Measure overdue removals',risks:'Manager approval before access changes',niche:'Clinic operations',sourceUrl:'https://example.org',verifiedOn:'2026-11-08',optedOut:false};
test('studio imports validate records, limits, dates and safe links before replacing data',()=>{
 const result=normalizeStudio({version:1,leads:[lead],proposals:[],pilots:[],projects:[],partners:[]});assert.equal(result.leads[0].company,'Acme Clinic');assert.throws(()=>validateLead({...lead,sourceUrl:'javascript:alert(1)'}));assert.throws(()=>validateLead({...lead,nextDate:'2026-02-30'}));assert.throws(()=>normalizeStudio({version:1,leads:[lead,lead]}));assert.throws(()=>normalizeStudio({version:7}));assert.match(localDate(),/^\d{4}-\d{2}-\d{2}$/);
});
test('proposal and outreach use the selected client context without claiming work or sending messages',()=>{
 const text=proposalMarkdown(lead,{setup:1500,monthly:350,weeks:6,scope:lead.mvp,acceptance:'No unapproved changes',payment:'Milestones by agreement'});assert.match(text,/Acme Clinic/);assert.match(text,/No unapproved changes/);assert.match(text,/Draft/);assert.match(outreachDraft(lead),/Account removal is delayed/);assert.throws(()=>outreachDraft({...lead,optedOut:true}));
});
test('pilot evidence handles lower-is-better, higher-is-better, zero baselines and actual measured costs',()=>{
 const lower=pilotMetrics({baseline:100,after:60,direction:'lower',volume:20,valuePerUnit:2,cost:300,unit:'minutes'});assert.equal(lower.improvementPercent,40);assert.equal(lower.netValue,1300);assert.equal(pilotMetrics({baseline:0,after:2,direction:'higher',volume:1,valuePerUnit:0,cost:0}).improvementPercent,null);assert.throws(()=>pilotMetrics({baseline:-1,after:3,direction:'lower',volume:1,valuePerUnit:1,cost:1}));
});
test('IAM assessments parse quoted CSV, distinguish unknown controls and never perform access changes',()=>{
 const rows=parseIAMCSV('userId,status,privileged,mfa,lastLogin,owner\n"user,one",active,true,false,2025-01-01,\nuser-two,active,,,,\n');const report=assessIAM(rows,'2026-11-08');assert.equal(report.total,2);assert.ok(report.findings.some(x=>x.rule==='privileged-no-mfa'));assert.ok(report.findings.some(x=>x.rule==='missing-owner'));assert.ok(report.unknownControls>0);assert.ok(report.findings.some(x=>x.rule==='stale-active'));assert.throws(()=>parseIAMCSV('name,status\nOnly Name,active'));assert.throws(()=>parseIAMCSV('userId,status\n"unclosed,active'));assert.equal(assessIAM([{userId:'x',status:'active'}],'2026-11-08').findings.some(x=>x.rule==='privileged-no-mfa'),false);
});
test('radar never confuses publication dates, awards or undated notices with confirmed open deadlines',()=>{
 const rows=normalizeNotices({procnotices:[{id:'OP123',notice_type:'Contract Award',bid_description:'Software',submission_date:'2027-01-01',project_ctry_name:'Congo'},{id:'OP124',notice_type:'Request for Expression of Interest',bid_description:'IAM',submission_date:'2026-11-08',notice_text:'<script>bad</script>'}]});assert.equal(noticeStatus(rows[0],'2026-11-08'),'Awarded / closed');assert.equal(rows[1].deadline,null);assert.equal(noticeStatus(rows[1],'2026-11-08'),'Review deadline');assert.ok(rows.every(x=>!Object.hasOwn(x,'notice_text')));assert.ok(rows[0].sourceUrl.startsWith('https://projects.worldbank.org/'));assert.equal(noticeStatus({...rows[1],deadline:'2020-01-01'},'2026-11-08'),'Past deadline');
});
test('build export has a runnable local starter, requirements and honest evidence checklist',()=>{
 const files=buildStarterFiles(lead);assert.ok(files['package.json']);assert.ok(files['server.mjs'].includes('127.0.0.1'));assert.ok(files['REQUIREMENTS.md'].includes(lead.mvp));assert.ok(files['README.md'].includes('starter'));assert.ok(files['AGENT_PROMPT.md'].includes(lead.risks));assert.ok(files['ACCEPTANCE.md'].includes('Not run'));assert.doesNotMatch(files['package.json'],/token|secret/i);
});
test('workspace evidence and imports reject missing parents and unsupported passing claims',()=>{
 const project={id:'project-one',leadId:lead.id,name:'Pilot',tasks:[{id:'task-one',label:'Authorization',status:'Pass',note:'',evidenceUrl:''}]};assert.throws(()=>normalizeStudio({version:1,leads:[lead],projects:[project]}));assert.throws(()=>normalizeStudio({version:1,proposals:[{id:'draft-one',leadId:'missing',body:'Draft'}]}));assert.throws(()=>parseIAMCSV('userId,password\nx,secret'));assert.throws(()=>assessIAM([{userId:'x'}],'2026-02-30'));
});
test('starter ZIP has a valid central directory and disallows traversal paths',()=>{
 const zip=zipStarter(buildStarterFiles(lead)),view=new DataView(zip.buffer);assert.equal(view.getUint32(0,true),0x04034b50);assert.equal(view.getUint32(zip.length-22,true),0x06054b50);assert.equal(view.getUint16(zip.length-12,true),Object.keys(buildStarterFiles(lead)).length);assert.throws(()=>zipStarter({'../escape':'no'}));
});
test('restored build tasks must have distinct IDs so evidence fields cannot collapse',()=>{
 const task={id:'same-task',label:'Review evidence',status:'Not run',note:'',evidenceUrl:''};assert.throws(()=>normalizeStudio({version:1,leads:[lead],projects:[{id:'project-dupe',leadId:lead.id,name:'Duplicate tasks',tasks:[task,{...task,label:'Another check'}]}]}));
});
