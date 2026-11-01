/* Ритм Lite — лёгкий планировщик (день / неделя / месяц / цели) */
const KEY='ritm-lite-v1';
const $= (s,r=document)=>r.querySelector(s);
const $$= (s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const WD=['вс','пн','вт','ср','чт','пт','сб'];
const WD_FULL=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const MO=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MO_NOM=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];

function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseYMD(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseYMD(s);d.setDate(d.getDate()+n);return ymd(d)}
function weekKey(d){ // ISO week yyyy-Www
  const dt=typeof d==='string'?parseYMD(d):new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const day=(dt.getDay()+6)%7; // Mon=0
  const thu=new Date(dt);thu.setDate(dt.getDate()-day+3);
  const yearStart=new Date(thu.getFullYear(),0,1);
  const week=1+Math.round(((thu-yearStart)/86400000-3+(yearStart.getDay()+6)%7)/7);
  return thu.getFullYear()+'-W'+pad(week);
}
function weekRange(wk){
  const [y,w]=wk.split('-W').map(Number);
  const jan4=new Date(y,0,4);
  const day=(jan4.getDay()+6)%7;
  const mon=new Date(jan4);mon.setDate(jan4.getDate()-day+(w-1)*7);
  const sun=new Date(mon);sun.setDate(mon.getDate()+6);
  return {mon:ymd(mon),sun:ymd(sun),monD:mon,sunD:sun};
}
function monthKey(d){const dt=typeof d==='string'?parseYMD(d):d;return dt.getFullYear()+'-'+pad(dt.getMonth()+1)}
function fmtDay(s){const d=parseYMD(s);return d.getDate()+' '+MO[d.getMonth()]}
function fmtDayLong(s){const d=parseYMD(s);return WD_FULL[d.getDay()]+', '+d.getDate()+' '+MO[d.getMonth()]}
function fmtWeek(wk){const {monD,sunD}=weekRange(wk);const a=monD.getDate()+' '+MO[monD.getMonth()].slice(0,3);const b=sunD.getDate()+' '+MO[sunD.getMonth()].slice(0,3);return a+' – '+b}
function fmtMonth(mk){const [y,m]=mk.split('-').map(Number);return MO_NOM[m-1]+' '+y}

const I={
  day:`<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  week:`<svg class="i" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
  month:`<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 9h18"/><circle cx="8" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="17" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>`,
  goals:`<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  gear:`<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>`,
  plus:`<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  chevL:`<svg class="i" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>`,
  chevR:`<svg class="i" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>`,
  check:`<svg class="i" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`,
  x:`<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
};

let S=load();
let tab=localStorage.getItem('ritm-lite-tab')||'day';
let curDay=ymd(new Date());
let curWeek=weekKey(new Date());
let curMonth=monthKey(new Date());
let undo=null;
let toastT=0;

function blank(){
  return {v:1,theme:'light',day:{},week:{},month:{},goals:[]};
}
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return blank();
    const o=JSON.parse(raw);
    return {...blank(),...o,day:o.day||{},week:o.week||{},month:o.month||{},goals:Array.isArray(o.goals)?o.goals:[]};
  }catch{return blank()}
}
function save(){
  localStorage.setItem(KEY,JSON.stringify(S));
  document.documentElement.dataset.theme=S.theme==='dark'?'dark':'';
  const meta=$('meta[name=theme-color]');
  if(meta)meta.content=S.theme==='dark'?'#11100E':'#F3EFE6';
}
document.documentElement.dataset.theme=S.theme==='dark'?'dark':'';

function toast(msg,undoFn){
  const el=$('#toast');
  el.innerHTML=esc(msg)+(undoFn?`<button type="button">Отменить</button>`:'');
  el.classList.add('show');
  clearTimeout(toastT);
  const btn=$('button',el);
  if(btn)btn.onclick=()=>{undoFn();el.classList.remove('show')};
  toastT=setTimeout(()=>el.classList.remove('show'),4200);
}

function goalPct(g){
  if(g.mode==='steps'&&g.steps&&g.steps.length){
    const d=g.steps.filter(s=>s.done).length;
    return Math.round(100*d/g.steps.length);
  }
  return Math.max(0,Math.min(100,Math.round(+g.progress||0)));
}
function overallPct(){
  if(!S.goals.length)return 0;
  return Math.round(S.goals.reduce((a,g)=>a+goalPct(g),0)/S.goals.length);
}

/* —— tabs —— */
const TABS=[
  {id:'day',label:'День',icon:I.day},
  {id:'week',label:'Неделя',icon:I.week},
  {id:'month',label:'Месяц',icon:I.month},
  {id:'goals',label:'Цели',icon:I.goals},
];
function renderTabs(){
  $('#tabs').innerHTML=TABS.map(t=>`<button type="button" data-tab="${t.id}" class="${tab===t.id?'on':''}" aria-current="${tab===t.id?'page':'false'}">${t.icon}<span>${t.label}</span></button>`).join('');
}

/* —— views —— */
function go(t){
  tab=t;localStorage.setItem('ritm-lite-tab',t);
  renderTabs();paint();
}

function paint(){
  const v=$('#view');
  v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter');
  if(tab==='day')v.innerHTML=viewDay();
  else if(tab==='week')v.innerHTML=viewWeek();
  else if(tab==='month')v.innerHTML=viewMonth();
  else v.innerHTML=viewGoals();
}

function header(title,sub){
  return`<header class="hd"><div><div class="eyebrow">Ритм Lite</div><h1 class="display">${title}</h1>${sub?`<div class="meta" style="margin-top:6px">${sub}</div>`:''}</div><div class="hd-act"><button type="button" class="ib" data-a="settings" aria-label="Настройки">${I.gear}</button></div></header>`;
}

function navRow(label,sub,prev,next){
  return`<div class="nav-row">
    <button type="button" class="ib sm" data-a="${prev}" aria-label="Назад">${I.chevL}</button>
    <div class="label">${esc(label)}${sub?`<span class="sub">${esc(sub)}</span>`:''}</div>
    <button type="button" class="ib sm" data-a="${next}" aria-label="Вперёд">${I.chevR}</button>
  </div>`;
}

function qa(ph,action){
  return`<form class="qa" data-a="${action}"><input name="q" placeholder="${esc(ph)}" autocomplete="off" maxlength="200"><button type="submit" aria-label="Добавить">${I.plus}</button></form>`;
}

function itemHTML(it,{checkable=true,meta=''}={}){
  return`<li class="item${it.done?' done':''}" data-id="${it.id}">
    ${checkable?`<button type="button" class="check${it.done?' on':''}" data-a="toggle" aria-label="Готово">${it.done?I.check:''}</button>`:''}
    <div class="body" data-a="edit"><div class="ttl">${esc(it.title)}</div>${meta||it.notes?`<div class="meta">${esc(meta||(it.notes||'').split('\n')[0])}</div>`:''}</div>
    <button type="button" class="del" data-a="del" aria-label="Удалить">${I.x}</button>
  </li>`;
}

/* —— Day —— */
function dayList(){return S.day[curDay]||[]}
function viewDay(){
  const list=dayList();
  const done=list.filter(x=>x.done).length;
  const today=ymd(new Date())===curDay;
  return header(today?'Сегодня':fmtDay(curDay),fmtDayLong(curDay))+
    navRow(fmtDay(curDay),today?'сегодня':WD_FULL[parseYMD(curDay).getDay()],'dayPrev','dayNext')+
    qa('Что сделать…','addDay')+
    (list.length?`<ul class="list">${list.map(it=>itemHTML(it)).join('')}</ul>`:`<div class="empty"><span class="serif">Пусто</span>Добавьте первое дело на день</div>`)+
    (list.length?`<p class="meta" style="margin:12px 4px 0">${done} из ${list.length} готово</p>`:'');
}

/* —— Week —— */
function weekList(){return S.week[curWeek]||[]}
function viewWeek(){
  const list=weekList();
  const {mon,sun}=weekRange(curWeek);
  const byDay={};list.forEach(it=>{const k=it.weekday||'_';(byDay[k]=byDay[k]||[]).push(it)});
  const days=[];
  for(let i=0;i<7;i++){const d=addDays(mon,i);days.push({ymd:d,wd:parseYMD(d).getDay(),label:WD[parseYMD(d).getDay()]})}
  let body='';
  if(!list.length)body=`<div class="empty"><span class="serif">Неделя свободна</span>Запишите планы на неделю</div>`;
  else{
    // unassigned first
    if(byDay['_']?.length)body+=`<ul class="list" style="margin-bottom:12px">${byDay['_'].map(it=>itemHTML(it,{meta:'без дня'})).join('')}</ul>`;
    days.forEach(({ymd:d,wd,label})=>{
      const items=byDay[String(wd)]||[];
      if(!items.length)return;
      body+=`<div class="meta" style="margin:14px 4px 8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:11px">${label} · ${fmtDay(d)}</div>`;
      body+=`<ul class="list">${items.map(it=>itemHTML(it)).join('')}</ul>`;
    });
  }
  return header('Неделя',fmtWeek(curWeek))+
    navRow(fmtWeek(curWeek),curWeek,'weekPrev','weekNext')+
    qa('План на неделю…','addWeek')+body;
}

/* —— Month —— */
function monthList(){return S.month[curMonth]||[]}
function viewMonth(){
  const list=monthList();
  return header('Месяц',fmtMonth(curMonth))+
    navRow(fmtMonth(curMonth),'','monthPrev','monthNext')+
    qa('План на месяц…','addMonth')+
    (list.length?`<ul class="list">${list.map(it=>itemHTML(it,{meta:it.notes?it.notes.split('\n')[0]:''})).join('')}</ul>`:`<div class="empty"><span class="serif">Пока пусто</span>Крупные планы на месяц</div>`);
}

/* —— Goals —— */
function viewGoals(){
  const pct=overallPct();
  const R=28,C=2*Math.PI*R,off=C*(1-pct/100);
  const ring=`<div class="ring"><svg width="64" height="64" viewBox="0 0 64 64"><circle class="bgc" cx="32" cy="32" r="${R}"/><circle class="fgc" cx="32" cy="32" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div class="rv">${pct}<small>%</small></div></div>`;
  const overall=`<div class="card overall">${ring}<div class="txt"><b>Общий прогресс</b><span>${S.goals.length?S.goals.length+' '+plural(S.goals.length,['цель','цели','целей']):'Добавьте первую цель'}</span></div></div>`;
  const cards=S.goals.length?S.goals.map(g=>{
    const p=goalPct(g);
    return`<div class="card goal" data-id="${g.id}" data-a="editGoal">
      <div class="goal-hd"><div class="ttl">${esc(g.title)}</div><div class="pct">${p}%</div></div>
      <div class="bar"><i style="width:${p}%"></i></div>
      ${g.notes?`<div class="notes">${esc(g.notes)}</div>`:''}
      ${g.mode==='steps'&&g.steps?.length?`<div class="meta" style="margin-top:8px">${g.steps.filter(s=>s.done).length} из ${g.steps.length} шагов</div>`:''}
    </div>`;
  }).join(''):`<div class="empty"><span class="serif">Большие цели</span>Изучить курс, научиться чему-то новому…</div>`;
  return header('Цели','')+overall+
    `<button type="button" class="qa" style="cursor:pointer;width:100%;justify-content:center;gap:8px;padding:14px" data-a="addGoal">${I.plus}<span style="font-weight:600">Новая цель</span></button>`+
    cards;
}
function plural(n,f){const a=n%10,b=n%100;if(a===1&&b!==11)return f[0];if(a>=2&&a<=4&&(b<10||b>=20))return f[1];return f[2]}

/* —— sheets —— */
function openSheet(html){
  $('.sheet-body').innerHTML=html;
  $('#sheet').classList.add('open');
  $('#sheet').setAttribute('aria-hidden','false');
}
function closeSheet(){
  $('#sheet').classList.remove('open');
  $('#sheet').setAttribute('aria-hidden','true');
}

function editItemSheet(kind,id){
  let it,list;
  if(kind==='day'){list=dayList();it=list.find(x=>x.id===id)}
  else if(kind==='week'){list=weekList();it=list.find(x=>x.id===id)}
  else if(kind==='month'){list=monthList();it=list.find(x=>x.id===id)}
  if(!it)return;
  const wdRow=kind==='week'?`<div class="field"><label>День недели</label><div class="wdays" data-wd>
    <button type="button" data-v="" class="${!it.weekday&&it.weekday!==0?'on':''}">—</button>
    ${[1,2,3,4,5,6,0].map(d=>`<button type="button" data-v="${d}" class="${String(it.weekday)===String(d)?'on':''}">${WD[d]}</button>`).join('')}
  </div></div>`:'';
  openSheet(`<h2>Изменить</h2>
    <div class="field"><label>Название</label><input class="inp" id="edTitle" value="${esc(it.title)}" maxlength="200"></div>
    <div class="field"><label>Заметки</label><textarea class="ta" id="edNotes" maxlength="4000">${esc(it.notes||'')}</textarea></div>
    ${wdRow}
    <div class="row-btns">
      <button type="button" class="btn primary" data-a="saveItem" data-kind="${kind}" data-id="${id}">Сохранить</button>
      <button type="button" class="btn danger" data-a="delItem" data-kind="${kind}" data-id="${id}">Удалить</button>
    </div>`);
  setTimeout(()=>$('#edTitle')?.focus(),50);
}

function goalSheet(id){
  const g=id?S.goals.find(x=>x.id===id):null;
  const isNew=!g;
  const G=g||{id:uid(),title:'',notes:'',progress:0,mode:'manual',steps:[]};
  const p=goalPct(G);
  openSheet(`<h2>${isNew?'Новая цель':'Цель'}</h2>
    <div class="field"><label>Название</label><input class="inp" id="gTitle" value="${esc(G.title)}" placeholder="Изучить курс…" maxlength="200"></div>
    <div class="field"><label>Подробности</label><textarea class="ta" id="gNotes" placeholder="Что именно хотите сделать, ссылки, мысли…" maxlength="8000">${esc(G.notes||'')}</textarea></div>
    <div class="field"><label>Прогресс</label>
      <div class="seg" data-mode>
        <button type="button" data-v="manual" class="${G.mode!=='steps'?'on':''}">Вручную</button>
        <button type="button" data-v="steps" class="${G.mode==='steps'?'on':''}">По шагам</button>
      </div>
      <div id="gManual" style="display:${G.mode==='steps'?'none':'block'}">
        <div class="slider-row"><input type="range" id="gPct" min="0" max="100" step="1" value="${p}"><span class="v" id="gPctV">${p}%</span></div>
        <div class="quick">
          <button type="button" data-a="pct" data-d="-10">−10%</button>
          <button type="button" data-a="pct" data-d="10">+10%</button>
          <button type="button" data-a="pct" data-d="0" data-set="0">0%</button>
          <button type="button" data-a="pct" data-d="0" data-set="100">100%</button>
        </div>
      </div>
      <div id="gSteps" style="display:${G.mode==='steps'?'block':'none'}">
        <ul class="steps" id="stepList">${(G.steps||[]).map(s=>`<li class="${s.done?'done':''}" data-sid="${s.id}">
          <button type="button" class="check${s.done?' on':''}" data-a="togStep">${s.done?I.check:''}</button>
          <span class="st">${esc(s.title)}</span>
          <button type="button" class="del" data-a="delStep" aria-label="Удалить">${I.x}</button>
        </li>`).join('')}</ul>
        <form class="qa" style="margin-top:8px" data-a="addStep"><input name="q" placeholder="Шаг…" maxlength="200"><button type="submit" aria-label="Добавить">${I.plus}</button></form>
      </div>
    </div>
    <div class="row-btns">
      <button type="button" class="btn primary" data-a="saveGoal" data-id="${G.id}" data-new="${isNew?1:0}">Сохранить</button>
      ${isNew?'':`<button type="button" class="btn danger" data-a="delGoal" data-id="${G.id}">Удалить</button>`}
      <button type="button" class="btn ghost" data-a="close">Закрыть</button>
    </div>`);
  // stash draft on sheet element
  $('#sheet')._draft=JSON.parse(JSON.stringify(G));
  setTimeout(()=>$('#gTitle')?.focus(),50);
}

function settingsSheet(){
  openSheet(`<h2>Настройки</h2>
    <div class="set-row"><span class="lbl">Тёмная тема</span><button type="button" class="toggle${S.theme==='dark'?' on':''}" data-a="theme" aria-label="Тема"><i></i></button></div>
    <div class="set-row"><span class="lbl">Экспорт</span><button type="button" class="btn ghost" data-a="export">Скачать JSON</button></div>
    <div class="set-row"><span class="lbl">Импорт</span><button type="button" class="btn ghost" data-a="import">Из файла…</button></div>
    <div class="set-row"><span class="lbl">Сбросить всё</span><button type="button" class="btn danger" data-a="wipe">Очистить</button></div>
    <p class="meta" style="margin-top:18px">Данные только на этом устройстве · Ритм Lite</p>
    <div class="row-btns" style="margin-top:12px"><button type="button" class="btn ghost" data-a="close">Закрыть</button></div>`);
}

/* —— mutations —— */
function addTo(bucket,key,title,extra={}){
  title=title.trim();if(!title)return;
  if(!S[bucket][key])S[bucket][key]=[];
  S[bucket][key].unshift({id:uid(),title,notes:'',done:false,created:Date.now(),...extra});
  save();paint();
}
function removeItem(bucket,key,id){
  const list=S[bucket][key]||[];
  const i=list.findIndex(x=>x.id===id);if(i<0)return;
  const [it]=list.splice(i,1);
  if(!list.length)delete S[bucket][key];
  save();
  undo={bucket,key,it,i};
  toast('Удалено',()=>{
    if(!S[bucket][key])S[bucket][key]=[];
    S[bucket][key].splice(Math.min(i,S[bucket][key].length),0,it);
    save();paint();undo=null;
  });
  paint();
}
function toggleItem(bucket,key,id){
  const it=(S[bucket][key]||[]).find(x=>x.id===id);if(!it)return;
  it.done=!it.done;save();paint();
}

/* —— events —— */
document.addEventListener('click',e=>{
  const tabBtn=e.target.closest('[data-tab]');
  if(tabBtn){go(tabBtn.dataset.tab);return}

  const a=e.target.closest('[data-a]');
  if(!a)return;
  const act=a.dataset.a;

  if(act==='close'){closeSheet();return}
  if(act==='settings'){settingsSheet();return}
  if(act==='theme'){S.theme=S.theme==='dark'?'light':'dark';save();settingsSheet();return}
  if(act==='export'){
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const l=document.createElement('a');
    l.href=url;l.download='ritm-lite-'+ymd(new Date())+'.json';l.click();URL.revokeObjectURL(url);return;
  }
  if(act==='import'){$('#importFile').click();return}
  if(act==='wipe'){
    if(!confirm('Удалить все данные Lite на этом устройстве?'))return;
    S=blank();save();closeSheet();paint();toast('Очищено');return;
  }

  if(act==='dayPrev'){curDay=addDays(curDay,-1);paint();return}
  if(act==='dayNext'){curDay=addDays(curDay,1);paint();return}
  if(act==='weekPrev'){const {mon}=weekRange(curWeek);curWeek=weekKey(addDays(mon,-7));paint();return}
  if(act==='weekNext'){const {mon}=weekRange(curWeek);curWeek=weekKey(addDays(mon,7));paint();return}
  if(act==='monthPrev'){const [y,m]=curMonth.split('-').map(Number);const d=new Date(y,m-2,1);curMonth=monthKey(d);paint();return}
  if(act==='monthNext'){const [y,m]=curMonth.split('-').map(Number);const d=new Date(y,m,1);curMonth=monthKey(d);paint();return}

  if(act==='addGoal'){goalSheet(null);return}
  if(act==='editGoal'){goalSheet(a.dataset.id||a.closest('[data-id]')?.dataset.id);return}

  // list item actions
  const item=a.closest('.item');
  if(item&&(act==='toggle'||act==='del'||act==='edit')){
    const id=item.dataset.id;
    const bucket=tab==='day'?'day':tab==='week'?'week':'month';
    const key=tab==='day'?curDay:tab==='week'?curWeek:curMonth;
    if(act==='toggle'){toggleItem(bucket,key,id);return}
    if(act==='del'){
      item.classList.add('removing');
      setTimeout(()=>removeItem(bucket,key,id),220);
      return;
    }
    if(act==='edit'){editItemSheet(bucket,id);return}
  }

  if(act==='saveItem'){
    const kind=a.dataset.kind,id=a.dataset.id;
    const title=$('#edTitle').value.trim();
    if(!title)return;
    const notes=$('#edNotes').value;
    const key=kind==='day'?curDay:kind==='week'?curWeek:curMonth;
    const it=(S[kind][key]||[]).find(x=>x.id===id);
    if(it){
      it.title=title;it.notes=notes;
      if(kind==='week'){
        const on=$('.wdays button.on');
        const v=on?.dataset.v;
        it.weekday=(v===''||v==null)?null:Number(v);
      }
      save();closeSheet();paint();
    }
    return;
  }
  if(act==='delItem'){
    const kind=a.dataset.kind,id=a.dataset.id;
    const key=kind==='day'?curDay:kind==='week'?curWeek:curMonth;
    closeSheet();removeItem(kind,key,id);return;
  }

  // goal sheet internals
  if(act==='pct'){
    const inp=$('#gPct');if(!inp)return;
    let v=a.dataset.set!=null?+a.dataset.set:(+inp.value+(+a.dataset.d||0));
    v=Math.max(0,Math.min(100,v));inp.value=v;$('#gPctV').textContent=v+'%';
    if($('#sheet')._draft){$('#sheet')._draft.progress=v;$('#sheet')._draft.mode='manual'}
    return;
  }
  if(act==='togStep'){
    const li=a.closest('[data-sid]');const d=$('#sheet')._draft;if(!li||!d)return;
    const s=d.steps.find(x=>x.id===li.dataset.sid);if(!s)return;
    s.done=!s.done;li.classList.toggle('done',s.done);a.classList.toggle('on',s.done);a.innerHTML=s.done?I.check:'';
    return;
  }
  if(act==='delStep'){
    const li=a.closest('[data-sid]');const d=$('#sheet')._draft;if(!li||!d)return;
    d.steps=d.steps.filter(x=>x.id!==li.dataset.sid);li.remove();return;
  }
  if(act==='saveGoal'){
    const d=$('#sheet')._draft;if(!d)return;
    d.title=$('#gTitle').value.trim();
    if(!d.title){$('#gTitle').focus();return}
    d.notes=$('#gNotes').value;
    if(d.mode!=='steps')d.progress=+$('#gPct').value||0;
    const isNew=a.dataset.new==='1';
    if(isNew)S.goals.unshift(d);
    else{const i=S.goals.findIndex(x=>x.id===d.id);if(i>=0)S.goals[i]=d;else S.goals.unshift(d)}
    save();closeSheet();paint();return;
  }
  if(act==='delGoal'){
    const id=a.dataset.id;
    const i=S.goals.findIndex(x=>x.id===id);if(i<0)return;
    const [g]=S.goals.splice(i,1);save();closeSheet();
    toast('Цель удалена',()=>{S.goals.splice(i,0,g);save();paint()});
    paint();return;
  }
});

document.addEventListener('input',e=>{
  if(e.target.id==='gPct'){
    $('#gPctV').textContent=e.target.value+'%';
    if($('#sheet')._draft){$('#sheet')._draft.progress=+e.target.value;$('#sheet')._draft.mode='manual'}
  }
});

document.addEventListener('change',e=>{
  // mode seg handled via click on buttons
});

document.addEventListener('click',e=>{
  const modeBtn=e.target.closest('[data-mode] button');
  if(modeBtn){
    $$('[data-mode] button').forEach(b=>b.classList.toggle('on',b===modeBtn));
    const v=modeBtn.dataset.v;
    if($('#sheet')._draft)$('#sheet')._draft.mode=v;
    $('#gManual').style.display=v==='steps'?'none':'block';
    $('#gSteps').style.display=v==='steps'?'block':'none';
    return;
  }
  const wdBtn=e.target.closest('.wdays button');
  if(wdBtn){
    $$('.wdays button').forEach(b=>b.classList.toggle('on',b===wdBtn));
  }
});

document.addEventListener('submit',e=>{
  const form=e.target.closest('form[data-a]');
  if(!form)return;
  e.preventDefault();
  const q=form.q?.value||'';
  const act=form.dataset.a;
  if(act==='addDay'){addTo('day',curDay,q);form.reset();form.q?.focus();return}
  if(act==='addWeek'){addTo('week',curWeek,q,{weekday:null});form.reset();form.q?.focus();return}
  if(act==='addMonth'){addTo('month',curMonth,q);form.reset();form.q?.focus();return}
  if(act==='addStep'){
    const d=$('#sheet')._draft;if(!d)return;
    const t=q.trim();if(!t)return;
    d.steps=d.steps||[];
    const s={id:uid(),title:t,done:false};
    d.steps.push(s);
    const ul=$('#stepList');
    ul.insertAdjacentHTML('beforeend',`<li data-sid="${s.id}"><button type="button" class="check" data-a="togStep"></button><span class="st">${esc(t)}</span><button type="button" class="del" data-a="delStep" aria-label="Удалить">${I.x}</button></li>`);
    form.reset();form.q?.focus();
  }
});

$('#importFile').addEventListener('change',async e=>{
  const f=e.target.files?.[0];e.target.value='';
  if(!f)return;
  try{
    const o=JSON.parse(await f.text());
    if(!o||typeof o!=='object')throw new Error('bad');
    S={...blank(),...o,day:o.day||{},week:o.week||{},month:o.month||{},goals:Array.isArray(o.goals)?o.goals:[]};
    save();closeSheet();paint();toast('Импортировано');
  }catch{toast('Не удалось импортировать')}
});

// SW
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
}

renderTabs();
paint();
