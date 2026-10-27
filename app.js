'use strict';
/* ===== Ритм — планировщик. Данные хранятся локально (localStorage). ===== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const todayS=()=>ymd(new Date());
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)};
const addM=(s,n)=>{const d=pd(s),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return ymd(d)};
const diffD=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural=(n,f)=>{const a=Math.abs(n)%100,b=a%10;return f[a>10&&a<20?2:b>1&&b<5?1:b===1?0:2]};
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WDS=['вс','пн','вт','ср','чт','пт','сб'];
const WDF=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const tmin=t=>{if(!t)return null;const[h,m]=t.split(':').map(Number);return h*60+m};
const mstr=m=>`${pad(Math.floor(m/60)%24)}:${pad(m%60)}`;
const fmtDate=s=>{if(!s)return'';const t=todayS();if(s===t)return'Сегодня';if(s===addD(t,1))return'Завтра';if(s===addD(t,-1))return'Вчера';const d=pd(s);return`${d.getDate()} ${MONG[d.getMonth()]}${d.getFullYear()!==new Date().getFullYear()?' '+d.getFullYear():''}`};
const fmtLong=s=>{const d=pd(s);return`${cap(WDF[d.getDay()])}, ${d.getDate()} ${MONG[d.getMonth()]}`};
const vib=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};

/* ===== иконки ===== */
const IC={
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
 chevL:'<path d="M15 6l-6 6 6 6"/>',chevR:'<path d="M9 6l6 6-6 6"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
 today:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/>',
 tasks:'<path d="M4 7l2 2 3-3.5M4 15.5l2 2 3-3.5M12.5 8h7.5M12.5 16.5h7.5"/>',
 cal:'<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 habits:'<path d="M4.5 12a7.5 7.5 0 0 1 13-5M19.5 12a7.5 7.5 0 0 1-13 5"/><path d="M17.8 3.5v3.6h-3.6M6.2 20.5v-3.6h3.6"/>',
 more:'<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="17" r="2.2"/>',
 moon:'<path d="M19.5 14.5A7.8 7.8 0 0 1 9.5 4.5a7.8 7.8 0 1 0 10 10z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
 trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7"/>',repeat:'<path d="M4.5 12a7.5 7.5 0 0 1 13-5M19.5 12a7.5 7.5 0 0 1-13 5"/><path d="M17.8 3.5v3.6h-3.6M6.2 20.5v-3.6h3.6"/>',
 bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5a2 2 0 0 0 4 0"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.8 1.8"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
 timer:'<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3h4M18.5 6.5l1.2-1.2"/>',chart:'<path d="M5 20V12M12 20V5M19 20v-6"/>',
 gear:'<path d="M4 7h9M18 7h2M4 17h3M11 17h9"/><circle cx="15.5" cy="7" r="2.3"/><circle cx="8.5" cy="17" r="2.3"/>',
 note:'<path d="M6 4h8.5L19 8.5V20H6z"/><path d="M14 4v5h5M9 13h6M9 16.5h4"/>',
 play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',pause:'<path d="M9 5.5v13M15 5.5v13" stroke-width="2.6"/>',
 reset:'<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4.5V8h3.5"/>',skip:'<path d="M6 6.5l8 5.5-8 5.5z"/><path d="M18 6v12"/>',
 pin:'<path d="M9 4h6l-1 5.5 3 2.5H7l3-2.5zM12 12v8"/>',flag:'<path d="M6 21V4M6 4h11l-2.2 4L17 12H6"/>',
 drag:'<circle cx="9" cy="7" r="1.1" fill="currentColor"/><circle cx="15" cy="7" r="1.1" fill="currentColor"/><circle cx="9" cy="12" r="1.1" fill="currentColor"/><circle cx="15" cy="12" r="1.1" fill="currentColor"/><circle cx="9" cy="17" r="1.1" fill="currentColor"/><circle cx="15" cy="17" r="1.1" fill="currentColor"/>',
 tag:'<path d="M4 12.5V4h8.5l7.5 7.5-8.5 8.5z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
 down:'<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',up:'<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>',
 event:'<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10h16M9 3v4M15 3v4M8 14h4"/>',
 spark:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
 phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',fire:'<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.4 3.8-8.8 2.4 1.4 3 3.6 3 5.2 1-.6 1.8-1.7 2-3 1.9 1.6 4.2 4 4.2 6.8 0 3.5-2.6 6-6.5 6z"/>'
};
const I=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;

/* ===== состояние ===== */
const KEY='ritm.planner.v1';
const ACCENTS=[['#D4572A','Терракота'],['#5E7D63','Шалфей'],['#3456C7','Кобальт'],['#8C4A7E','Слива'],['#B8862B','Охра'],['#2F2E2A','Графит']];
const COLORS=['#D4572A','#5E7D63','#3E5C8A','#8A5A83','#C49A3A','#7A756B'];
const HICONS=['◐','✦','❋','✿','◆','▲','●','☾','≈','∞','♪','✕'];
const PRIO=['Без приоритета','Низкий','Средний','Высокий'];
const REPEAT={none:'Нет',daily:'Каждый день',weekdays:'По будням',weekly:'Каждую неделю',monthly:'Каждый месяц'};
function defaults(){return{v:1,tasks:[],events:[],habits:[],goals:[],notes:[],tags:['Работа','Личное','Учёба','Здоровье','Дом'],log:{},focus:[],timer:null,
 settings:{theme:'auto',accent:'#D4572A',weekStart:1,pomo:{work:25,short:5,long:15,rounds:4},notify:false,sound:true,autoBreak:false,tz:'Europe/Moscow'}}}
const mkTask=o=>Object.assign({id:uid(),title:'',notes:'',prio:0,tag:null,date:null,time:'',subtasks:[],repeat:'none',remind:false,done:false,doneAt:null,created:Date.now(),order:0},o);
function seed(d){
 const t=todayS();
 d.tasks=[
  mkTask({title:'Разобрать входящие письма',prio:1,tag:'Работа',date:t,time:'10:00'}),
  mkTask({title:'Подготовить презентацию',prio:3,tag:'Работа',date:t,time:'15:00',remind:true,notes:'Не больше 10 слайдов, в конце — выводы.',subtasks:[{id:uid(),t:'Собрать данные',done:true},{id:uid(),t:'Сделать слайды',done:false},{id:uid(),t:'Прогнать выступление',done:false}]}),
  mkTask({title:'Прогулка 30 минут',tag:'Здоровье',date:t,repeat:'daily'}),
  mkTask({title:'Позвонить маме',tag:'Личное',date:t,done:true,doneAt:Date.now()-3600e3}),
  mkTask({title:'Купить продукты',tag:'Дом',date:addD(t,1),prio:2,subtasks:[{id:uid(),t:'Молоко',done:false},{id:uid(),t:'Хлеб',done:false},{id:uid(),t:'Овощи',done:false}]}),
  mkTask({title:'Оплатить интернет',tag:'Дом',date:addD(t,-1),prio:2}),
  mkTask({title:'Прочитать главу книги',tag:'Личное'}),
  mkTask({title:'Записаться к стоматологу',tag:'Здоровье',date:addD(t,3),time:'09:30'}),
 ];
 d.tasks.forEach((x,i)=>x.order=i);
 d.events=[
  {id:uid(),title:'Созвон с командой',date:t,start:'11:00',end:'11:45',color:COLORS[2],note:'',remind:true},
  {id:uid(),title:'Обед',date:t,start:'13:00',end:'14:00',color:COLORS[1],note:''},
  {id:uid(),title:'Йога',date:t,start:'19:00',end:'20:00',color:COLORS[3],note:''},
  {id:uid(),title:'Спортзал',date:addD(t,1),start:'19:00',end:'20:30',color:COLORS[0],note:''},
  {id:uid(),title:'Встреча с другом',date:addD(t,2),start:'18:30',end:'20:00',color:COLORS[4],note:'Кофейня на углу'},
 ];
 const pat=(p)=>{const o={};p.split('').forEach((c,i)=>{if(c==='1')o[addD(t,-(i+1))]=true});return o};
 d.habits=[
  {id:uid(),name:'Вода 2 литра',icon:'≈',color:COLORS[2],log:Object.assign(pat('111111011101111011'),{[t]:true}),created:addD(t,-30)},
  {id:uid(),name:'Чтение 20 минут',icon:'✦',color:COLORS[0],log:pat('11110111011011110'),created:addD(t,-30)},
  {id:uid(),name:'Без сахара',icon:'◆',color:COLORS[1],log:pat('1110011101'),created:addD(t,-20)},
  {id:uid(),name:'Медитация',icon:'☾',color:COLORS[3],log:pat('101101110'),created:addD(t,-12)},
 ];
 const y=new Date().getFullYear();
 d.goals=[
  {id:uid(),title:'Прочитать 24 книги',current:9,target:24,unit:'книг',step:1,deadline:`${y}-12-31`,color:COLORS[0]},
  {id:uid(),title:'Пробежать 100 км',current:37,target:100,unit:'км',step:5,deadline:addM(t,2),color:COLORS[1]},
  {id:uid(),title:'Накопить на отпуск',current:60000,target:150000,unit:'₽',step:5000,deadline:addM(t,6),color:COLORS[4]},
 ];
 d.notes=[
  {id:uid(),text:'Идеи для выходных\nСходить в музей современного искусства, прогулка по набережной, попробовать новый рецепт пасты.',color:COLORS[4],pinned:true,updated:Date.now()-864e5},
  {id:uid(),text:'Книги в список\n— «Мастер и Маргарита»\n— «Атомные привычки»\n— «Дом, в котором…»',color:COLORS[1],pinned:false,updated:Date.now()-3*864e5},
  {id:uid(),text:'Пароль от Wi‑Fi у родителей — спросить заново 🙂',color:null,pinned:false,updated:Date.now()-5*864e5},
 ];
 [3,5,2,4,6,1,0,4,3,5,7,2,4].forEach((n,i)=>{if(n)d.log[addD(t,-(13-i))]=n});d.log[t]=1;
 [[1,4],[2,2],[3,5],[4,3],[5,1],[6,4]].forEach(([b,n])=>{for(let k=0;k<n;k++)d.focus.push({date:addD(t,-b),min:25})});
 d.seeded=true;
}
function load(){
 try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw),def=defaults();return Object.assign(def,d,{settings:Object.assign(def.settings,d.settings,{pomo:Object.assign(def.settings.pomo,(d.settings||{}).pomo)})})}}catch(e){console.warn(e)}
 const d=defaults();seed(d);return d;
}
let S=load();
let saveT;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Не удалось сохранить: память заполнена')}}
const ui={view:'today',calMode:'month',calSel:todayS(),calCursor:todayS().slice(0,7),f:'all',tag:null,sort:S.settings.sort||'manual',q:'',nq:'',showDone:false,prev:null};

/* ===== тема ===== */
const mq=matchMedia('(prefers-color-scheme: dark)');
const isDark=()=>S.settings.theme==='dark'||(S.settings.theme==='auto'&&mq.matches);
function applyTheme(){
 const dark=isDark(),r=document.documentElement;r.dataset.theme=dark?'dark':'light';
 let a=S.settings.accent;if(dark&&a==='#2F2E2A')a='#E8E2D6';
 r.style.setProperty('--acc',a);
 const m=$('meta[name=theme-color]');if(m)m.content=dark?'#11100E':'#F3EFE6';
}
mq.addEventListener&&mq.addEventListener('change',()=>{applyTheme()});

/* ===== логика задач ===== */
const byOrder=(a,b)=>a.order-b.order;
const byDate=(a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||(a.time||'99').localeCompare(b.time||'99')||b.prio-a.prio||a.order-b.order;
const maxOrder=()=>S.tasks.reduce((m,x)=>Math.max(m,x.order),0);
function nextDate(d,rep){
 if(rep==='daily')return addD(d,1);
 if(rep==='weekly')return addD(d,7);
 if(rep==='monthly')return addM(d,1);
 if(rep==='weekdays'){let n=addD(d,1);while([0,6].includes(pd(n).getDay()))n=addD(n,1);return n}
 return d;
}
function logDelta(n){const t=todayS();S.log[t]=Math.max(0,(S.log[t]||0)+n)}
function setDone(x,done){
 if(x.done===done)return;
 x.done=done;
 if(done){
  x.doneAt=Date.now();logDelta(1);
  if(x.repeat&&x.repeat!=='none'&&!x.spawned){
   const nx=mkTask(Object.assign(JSON.parse(JSON.stringify(x)),{id:uid(),done:false,doneAt:null,spawned:null,notified:false,created:Date.now(),date:nextDate(x.date||todayS(),x.repeat),order:x.order+.5}));
   nx.subtasks.forEach(s=>s.done=false);S.tasks.push(nx);x.spawned=nx.id;
  }
 }else{
  x.doneAt=null;logDelta(-1);
  if(x.spawned){const i=S.tasks.findIndex(y=>y.id===x.spawned&&!y.done);if(i>-1)S.tasks.splice(i,1);x.spawned=null}
 }
}
function toggleTask(id,li){
 const x=S.tasks.find(t=>t.id===id);if(!x)return;
 const willDone=!x.done;setDone(x,willDone);save();vib(willDone?12:6);
 if(li){li.classList.add('completing');setTimeout(()=>{render();afterToggle(willDone,x)},260)}else{render();afterToggle(willDone,x)}
}
function afterToggle(done,x){
 if(!done)return;
 const t=todayS(),list=S.tasks.filter(y=>y.date===t);
 if(x.date===t&&list.length&&list.every(y=>y.done))toast('День закрыт. Все задачи выполнены ✦');
 else if(x.repeat!=='none')toast('Готово. Следующий повтор — '+fmtDate(nextDate(x.date||t,x.repeat)).toLowerCase());
 else toast('Выполнено',()=>{setDone(x,false);save();render()});
}
function deleteTask(id){
 const i=S.tasks.findIndex(t=>t.id===id);if(i<0)return;const x=S.tasks[i];S.tasks.splice(i,1);save();render();vib(8);
 toast('Задача удалена',()=>{S.tasks.splice(i,0,x);save();render()});
}
function parseQuick(s,def){
 let date=def||null,time='',prio=0,tag=null;const t=todayS();
 s=s.replace(/(^|\s)#([^\s#]+)/g,(m,a,b)=>{b=b.replace(/_/g,' ');const f=S.tags.find(x=>x.toLowerCase()===b.toLowerCase());tag=f||cap(b);if(!f)S.tags.push(tag);return a});
 s=s.replace(/(^|\s)(!{1,3})(?=\s|$)/,(m,a,b)=>{prio=b.length;return a});
 const W={'сегодня':0,'завтра':1,'послезавтра':2};
 s=s.replace(/(^|\s)(сегодня|послезавтра|завтра)(?=\s|$)/i,(m,a,b)=>{date=addD(t,W[b.toLowerCase()]);return a});
 const WD={'пн':1,'вт':2,'ср':3,'чт':4,'пт':5,'сб':6,'вс':0,'понедельник':1,'вторник':2,'среду':3,'среда':3,'четверг':4,'пятницу':5,'пятница':5,'субботу':6,'суббота':6,'воскресенье':0};
 s=s.replace(/(^|\s)(?:во?\s)?(понедельник|вторник|среду|среда|четверг|пятницу|пятница|субботу|суббота|воскресенье|пн|вт|ср|чт|пт|сб|вс)(?=\s|$)/i,(m,a,b)=>{const w=WD[b.toLowerCase()];const cur=new Date().getDay();date=addD(t,((w-cur+7)%7)||7);return a});
 s=s.replace(/(^|\s)(?:в\s)?([01]?\d|2[0-3])[:.]([0-5]\d)(?=\s|$)/,(m,a,h,mm)=>{time=pad(h)+':'+mm;if(!date)date=t;return a});
 return{title:s.replace(/\s+/g,' ').trim(),date,time,prio,tag};
}
function quickAdd(text,def){
 const p=parseQuick(text,def);if(!p.title)return false;
 const x=mkTask(Object.assign(p,{order:maxOrder()+1}));S.tasks.push(x);save();render();vib(8);
 toast(`Добавлено${x.date?' · '+fmtDate(x.date).toLowerCase():''}${x.time?' в '+x.time:''}`,()=>{S.tasks=S.tasks.filter(y=>y.id!==x.id);save();render()});
 return true;
}

/* ===== привычки ===== */
function streak(h){let d=todayS(),n=0;if(!h.log[d])d=addD(d,-1);while(h.log[d]){n++;d=addD(d,-1)}return n}
function bestStreak(h){const ds=Object.keys(h.log).filter(k=>h.log[k]).sort();let best=0,cur=0,prev=null;for(const d of ds){cur=prev&&diffD(prev,d)===1?cur+1:1;best=Math.max(best,cur);prev=d}return best}
function rate(h,days=30){let n=0;for(let i=0;i<days;i++)if(h.log[addD(todayS(),-i)])n++;return Math.round(n/days*100)}
function dayStreak(){let d=todayS(),n=0;if(!S.log[d])d=addD(d,-1);while(S.log[d]>0){n++;d=addD(d,-1)}return n}
const focusMin=d=>S.focus.filter(f=>f.date===d).reduce((a,f)=>a+f.min,0);

/* ===== компоненты ===== */
function ring(pct,size=112,stroke=7,inner=''){
 const r=(size-stroke)/2-1,c=2*Math.PI*r;
 return`<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle class="bgc" cx="${size/2}" cy="${size/2}" r="${r}" style="stroke-width:${stroke}"/><circle class="fgc" cx="${size/2}" cy="${size/2}" r="${r}" style="stroke-width:${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}"/></svg><div class="rv">${inner||`<span>${pct}<small>%</small></span>`}</div></div>`;
}
const empty=(t,s='')=>`<div class="empty"><span class="serif">${t}</span>${s}</div>`;
function taskItem(x,o={}){
 const t=todayS(),over=!x.done&&x.date&&x.date<t,m=[];
 if(x.date&&!(o.hideToday&&x.date===t))m.push(`<span class="${over?'over':''}">${fmtDate(x.date)}</span>`);
 if(x.time)m.push(`<span>${I('clock')}${x.time}</span>`);
 if(x.tag)m.push(`<span class="tagm">#${esc(x.tag)}</span>`);
 if(x.subtasks.length)m.push(`<span>${I('tasks')}${x.subtasks.filter(s=>s.done).length}/${x.subtasks.length}</span>`);
 if(x.repeat&&x.repeat!=='none')m.push(`<span title="${REPEAT[x.repeat]}">${I('repeat')}</span>`);
 if(x.remind)m.push(`<span>${I('bell')}</span>`);
 if(x.notes)m.push(`<span>${I('note')}</span>`);
 return`<li class="task p${x.prio}${x.done?' done':''}" data-id="${x.id}"><div class="sw-bg"><span>${I('check')} Готово</span><span>Удалить ${I('trash')}</span></div><div class="task-in"><button class="chk" data-a="toggleTask" data-id="${x.id}" aria-label="Отметить">${I('check')}</button><div class="t-body" data-a="editTask" data-id="${x.id}"><div class="t-title">${esc(x.title)}</div>${m.length?`<div class="t-meta">${m.join('')}</div>`:''}</div>${o.drag?`<span class="handle" aria-label="Перетащить">${I('drag')}</span>`:''}</div></li>`;
}
const list=(arr,o={})=>`<ul class="list"${o.drag?' data-sortable':''}>${arr.map(x=>taskItem(x,o)).join('')}</ul>`;
const qaForm=(d,ph)=>`<form class="qa" data-f="qa" data-d="${d||''}"><input name="q" placeholder="${ph||'Новая задача…'}" autocomplete="off" enterkeyhint="done" aria-label="Быстрое добавление"><button aria-label="Добавить">${I('plus')}</button></form>`;
function lanes(items){const ends=[];items.sort((a,b)=>a.s-b.s||b.e-a.e);for(const it of items){let l=ends.findIndex(e=>e<=it.s);if(l<0){l=ends.length;ends.push(0)}ends[l]=it.e;it.l=l}return Math.max(1,ends.length)}
function dayItems(date){
 const ev=S.events.filter(e=>e.date===date&&e.start).map(e=>({k:'ev',id:e.id,title:e.title,s:tmin(e.start),e:Math.max(tmin(e.end||e.start)||0,tmin(e.start)+15),c:e.color,sub:`${e.start}–${e.end||''}`}));
 const tk=S.tasks.filter(x=>x.date===date&&x.time).map(x=>({k:'task',id:x.id,title:x.title,s:tmin(x.time),e:tmin(x.time)+30,c:'var(--ink3)',sub:x.time,done:x.done}));
 return ev.concat(tk);
}
function timeline(date){
 const it=dayItems(date);
 if(!it.length)return empty('Свободный день','<br>Нажмите «+», чтобы добавить событие.');
 let h0=Math.min(8,Math.floor(Math.min(...it.map(i=>i.s))/60)),h1=Math.max(21,Math.ceil(Math.max(...it.map(i=>i.e))/60));h1=Math.min(24,h1);
 const HH=52,n=lanes(it),top=m=>(m/60-h0)*HH+10;
 let h='';for(let k=h0;k<=h1;k++)h+=`<div class="tl-h" style="top:${(k-h0)*HH+10}px"><span>${pad(k)}:00</span></div>`;
 const w=`(100% - 60px)/${n}`;
 const b=it.map(i=>`<div class="tl-b ${i.k==='task'?'task':''}${i.done?' isdone':''}" data-a="${i.k==='ev'?'editEvent':'editTask'}" data-id="${i.id}" style="--c:${i.c};top:${top(i.s)+1}px;height:${Math.max(26,(i.e-i.s)/60*HH-3)}px;left:calc(56px + ${w}*${i.l});width:calc(${w} - 4px)"><b>${esc(i.title)}</b><small>${i.sub}</small></div>`).join('');
 let now='';if(date===todayS()){const d=new Date(),m=d.getHours()*60+d.getMinutes();if(m>=h0*60&&m<=h1*60)now=`<div class="tl-now" style="top:${top(m)}px"></div>`}
 return`<div class="tl" style="height:${(h1-h0)*HH+22}px">${h}${b}${now}</div>`;
}
function greet(){const h=new Date().getHours();return h<5?'Доброй <em>ночи</em>':h<12?'Доброе <em>утро</em>':h<18?'Добрый <em>день</em>':'Добрый <em>вечер</em>'}

/* ===== экраны ===== */
const V={};
V.today=()=>{
 const t=todayS(),d=new Date(),day=S.tasks.filter(x=>x.date===t),open=day.filter(x=>!x.done).sort(byOrder),done=day.filter(x=>x.done).sort((a,b)=>b.doneAt-a.doneAt);
 const over=S.tasks.filter(x=>!x.done&&x.date&&x.date<t).sort(byDate);
 const pct=day.length?Math.round(done.length/day.length*100):0,hd=S.habits.filter(h=>h.log[t]).length,fm=focusMin(t);
 const tm=S.timer&&S.timer.running?`<span class="timer-pill" data-a="go" data-v="focus">${I('timer')}<span id="pill-t">${fmtSec(remain())}</span></span>`:'';
 return`<header class="hd"><div><div class="eyebrow">${WDF[d.getDay()]} · ${d.getDate()} ${MONG[d.getMonth()]}</div><h1 class="display">${greet()}</h1></div><div class="hd-act">${tm}<button class="ib" data-a="theme" aria-label="Тема">${I(isDark()?'sun':'moon')}</button></div></header>
 <section class="card hero">${ring(pct)}<div class="hero-st">
  <div class="row">${I('tasks')}<span><b>${done.length}</b> из ${day.length} ${plural(day.length,['задачи','задач','задач'])}</span></div>
  <div class="row">${I('habits')}<span><b>${hd}</b> из ${S.habits.length} привычек</span></div>
  <div class="row">${I('timer')}<span><b>${fm}</b> мин фокуса</span></div>
  <div class="row">${I('fire')}<span>серия <b>${dayStreak()}</b> ${plural(dayStreak(),['день','дня','дней'])}</span></div>
 </div></section>
 ${qaForm(t,'Задача на сегодня… «15:00 #Работа !!»')}
 ${over.length?`<h3 class="sec">Просрочено <span>${over.length}</span><i class="grow"></i><button data-a="moveOverdue">Перенести на сегодня</button></h3>${list(over)}`:''}
 <h3 class="sec">На сегодня <span>${open.length}</span></h3>
 ${open.length?list(open,{drag:true,hideToday:true}):empty(day.length?'Всё сделано':'Чистый лист',day.length?'<br>Можно выдохнуть.':'<br>Добавьте первую задачу выше.')}
 ${done.length?`<button class="link" data-a="toggleDone">${ui.showDone?'Скрыть':'Показать'} выполненные · ${done.length}</button>${ui.showDone?list(done,{hideToday:true}):''}`:''}
 <h3 class="sec">Расписание<i class="grow"></i><button data-a="newEvent" data-d="${t}">+ Событие</button></h3>${timeline(t)}
 ${S.habits.length?`<h3 class="sec">Привычки <span>${hd}/${S.habits.length}</span></h3><div class="hchips">${S.habits.map(h=>`<button class="hchip${h.log[t]?' on':''}" style="--c:${h.color}" data-a="habitToggle" data-id="${h.id}" data-d="${t}"><span class="dot">${h.icon}</span>${esc(h.name)}</button>`).join('')}</div>`:''}
 <div class="card focus-mini" data-a="go" data-v="focus"><div><div class="eyebrow" style="margin:0 0 4px">Фокус</div><div class="big">${S.settings.pomo.work} минут</div></div><span class="play">${I('play')}</span></div>`;
};
const FILTERS={all:'Все',today:'Сегодня',tomorrow:'Завтра',week:'7 дней',nodate:'Без даты',overdue:'Просрочено',done:'Выполнено'};
function filtered(){
 const t=todayS();let a=S.tasks.slice();
 const f=ui.f;
 if(f==='done')a=a.filter(x=>x.done);else a=a.filter(x=>!x.done);
 if(f==='today')a=a.filter(x=>x.date===t);
 if(f==='tomorrow')a=a.filter(x=>x.date===addD(t,1));
 if(f==='week')a=a.filter(x=>x.date&&x.date>=t&&x.date<=addD(t,6));
 if(f==='nodate')a=a.filter(x=>!x.date);
 if(f==='overdue')a=a.filter(x=>x.date&&x.date<t);
 if(ui.tag)a=a.filter(x=>x.tag===ui.tag);
 if(ui.q){const q=ui.q.toLowerCase();a=a.filter(x=>(x.title+' '+x.notes+' '+(x.tag||'')+' '+x.subtasks.map(s=>s.t).join(' ')).toLowerCase().includes(q))}
 if(f==='done')return a.sort((x,y)=>(y.doneAt||0)-(x.doneAt||0));
 const s=ui.sort;
 a.sort(s==='date'?byDate:s==='prio'?((x,y)=>y.prio-x.prio||byDate(x,y)):s==='name'?((x,y)=>x.title.localeCompare(y.title,'ru')):byOrder);
 return a;
}
function tasksList(){
 const a=filtered();
 if(!a.length)return empty(ui.q?'Ничего не найдено':ui.f==='done'?'Пока пусто':'Нет задач',ui.q?'<br>Попробуйте другой запрос.':'');
 if(ui.sort==='date'&&ui.f==='all'&&!ui.q){
  const t=todayS(),g=[['Просрочено',x=>x.date&&x.date<t],['Сегодня',x=>x.date===t],['Завтра',x=>x.date===addD(t,1)],['На неделе',x=>x.date&&x.date>addD(t,1)&&x.date<=addD(t,7)],['Позже',x=>x.date&&x.date>addD(t,7)],['Без даты',x=>!x.date]];
  return g.map(([n,fn])=>{const it=a.filter(fn);return it.length?`<h3 class="sec">${n} <span>${it.length}</span></h3>${list(it)}`:''}).join('');
 }
 return list(a,{drag:ui.sort==='manual'&&ui.f!=='done'});
}
V.tasks=()=>{
 const open=S.tasks.filter(x=>!x.done).length,t=todayS();
 const cnt={all:open,today:S.tasks.filter(x=>!x.done&&x.date===t).length,overdue:S.tasks.filter(x=>!x.done&&x.date&&x.date<t).length};
 const qd=ui.f==='today'?t:ui.f==='tomorrow'?addD(t,1):'';
 return`<header class="hd"><div><div class="eyebrow">${open} ${plural(open,['открытая','открытые','открытых'])}</div><h1 class="display">Задачи</h1></div></header>
 <label class="search">${I('search')}<input type="search" placeholder="Поиск по задачам, заметкам, тегам" value="${esc(ui.q)}" data-in="q" autocomplete="off"></label>
 <div class="chips">${Object.entries(FILTERS).map(([k,v])=>`<button class="chip${ui.f===k?' on':''}" data-a="filt" data-v="${k}">${v}${cnt[k]?`<b>${cnt[k]}</b>`:''}</button>`).join('')}</div>
 <div class="chips" style="margin-top:8px">${S.tags.map(g=>`<button class="chip acc${ui.tag===g?' on':''}" data-a="tagF" data-v="${esc(g)}">#${esc(g)}</button>`).join('')}</div>
 ${qaForm(qd,'Например: «Отчёт завтра 10:00 #Работа !!!»')}
 <p class="hint">Подсказка: «завтра», «пт», «18:30», «#тег», «!»–«!!!» — приоритет. Свайп вправо — готово, влево — удалить.</p>
 <div class="toolbar"><span>Сортировка</span><select data-ch="sort" aria-label="Сортировка">${[['manual','Вручную'],['date','По сроку'],['prio','По приоритету'],['name','По названию']].map(([k,v])=>`<option value="${k}"${ui.sort===k?' selected':''}>${v}</option>`).join('')}</select></div>
 <div id="tlist">${tasksList()}</div>`;
};
function weekStartOf(s){const d=pd(s),ws=S.settings.weekStart;return addD(s,-((d.getDay()-ws+7)%7))}
function monthGrid(){
 const[y,m]=ui.calCursor.split('-').map(Number),first=new Date(y,m-1,1),ws=S.settings.weekStart,off=(first.getDay()-ws+7)%7;
 const dim=new Date(y,m,0).getDate(),rows=Math.ceil((off+dim)/7),start=addD(ymd(first),-off),t=todayS();
 let h='';for(let i=0;i<7;i++)h+=`<div class="wd">${WDS[(i+ws)%7]}</div>`;
 for(let i=0;i<rows*7;i++){
  const d=addD(start,i),dd=pd(d),ev=S.events.filter(e=>e.date===d),tk=S.tasks.filter(x=>x.date===d&&!x.done);
  const dots=ev.slice(0,3).map(e=>`<i style="--c:${e.color}"></i>`).join('')+(tk.length?`<i style="--c:var(--ink3)"></i>`:'');
  h+=`<button class="mday${dd.getMonth()!==m-1?' out':''}${d===t?' today':''}${d===ui.calSel?' sel':''}${[0,6].includes(dd.getDay())?' we':''}" data-a="calPick" data-d="${d}"><span class="n">${dd.getDate()}</span><span class="dots">${dots}</span></button>`;
 }
 return`<div class="mgrid">${h}</div>`;
}
function weekGrid(){
 const s=weekStartOf(ui.calSel),days=[...Array(7)].map((_,i)=>addD(s,i)),t=todayS(),H0=6,H1=24,HH=42;
 const head=`<div class="wk-head"><div></div>${days.map(d=>{const dd=pd(d);return`<button class="wk-d${d===t?' today':''}${d===ui.calSel?' sel':''}" data-a="calPick" data-d="${d}">${WDS[dd.getDay()]}<b>${dd.getDate()}</b></button>`}).join('')}</div>`;
 let hrs='',lines='';for(let k=H0;k<H1;k++){hrs+=`<span style="top:${(k-H0)*HH}px">${k}</span>`;lines+=`<i style="top:${(k-H0)*HH}px"></i>`}
 const cols=days.map(d=>{const it=dayItems(d),n=lanes(it);return`<div class="wk-col${d===ui.calSel?' sel':''}" data-a="calPick" data-d="${d}">${it.map(i=>{const top=Math.max(0,(i.s/60-H0)*HH);return`<div class="wk-b ${i.k==='task'?'task':''}" data-a="${i.k==='ev'?'editEvent':'editTask'}" data-id="${i.id}" style="--c:${i.c};top:${top}px;height:${Math.max(18,(i.e-i.s)/60*HH-2)}px;left:calc(${100/n}% * ${i.l} + 1px);width:calc(${100/n}% - 3px);right:auto">${esc(i.title)}</div>`}).join('')}</div>`}).join('');
 return`<div class="wk">${head}<div class="wk-scroll" id="wkscroll"><div class="wk-body" style="height:${(H1-H0)*HH}px"><div class="wk-lines">${lines}</div><div class="wk-hours">${hrs}</div>${cols}</div></div></div>`;
}
V.calendar=()=>{
 const sel=ui.calSel,[y,m]=ui.calCursor.split('-').map(Number);
 let title,eyebrow;
 if(ui.calMode==='month'){title=cap(MON[m-1]);eyebrow=String(y)}else{const s=weekStartOf(sel),e=addD(s,6),a=pd(s),b=pd(e);title='Неделя';eyebrow=`${a.getDate()} ${MONG[a.getMonth()]} — ${b.getDate()} ${MONG[b.getMonth()]}`}
 const tk=S.tasks.filter(x=>x.date===sel).sort((a,b)=>a.done-b.done||byDate(a,b));
 return`<header class="hd"><div><div class="eyebrow">${eyebrow}</div><h1 class="display">${title}</h1></div><div class="cal-nav"><button class="ib sm" data-a="calPrev" aria-label="Назад">${I('chevL')}</button><button class="ib sm" data-a="calToday" aria-label="Сегодня">${I('today')}</button><button class="ib sm" data-a="calNext" aria-label="Вперёд">${I('chevR')}</button></div></header>
 <div class="seg"><button class="${ui.calMode==='month'?'on':''}" data-a="calMode" data-v="month">Месяц</button><button class="${ui.calMode==='week'?'on':''}" data-a="calMode" data-v="week">Неделя</button></div>
 ${ui.calMode==='month'?monthGrid():weekGrid()}
 <h3 class="sec">${fmtLong(sel)}</h3>
 <div class="btnrow" style="margin:0 0 14px"><button class="btn" data-a="newTask" data-d="${sel}">${I('tasks')} Задача</button><button class="btn" data-a="newEvent" data-d="${sel}">${I('event')} Событие</button></div>
 ${ui.calMode==='month'?timeline(sel):''}
 ${tk.length?`<h3 class="sec">Задачи дня <span>${tk.length}</span></h3>${list(tk)}`:''}`;
};
V.habits=()=>{
 const t=todayS(),days=[...Array(7)].map((_,i)=>addD(t,i-6)),done=S.habits.filter(h=>h.log[t]).length;
 return`<header class="hd"><div><div class="eyebrow">Сегодня ${done} из ${S.habits.length}</div><h1 class="display">Привычки</h1></div></header>
 ${S.habits.length?`<div class="hgrid">${S.habits.map(h=>{const st=streak(h);return`<div class="card habit" style="--c:${h.color}"><div class="h-top" data-a="editHabit" data-id="${h.id}"><span class="h-ic">${h.icon}</span><div><div class="h-name">${esc(h.name)}</div><div class="h-sub">лучшая серия ${bestStreak(h)} · ${rate(h)}% за 30 дней</div></div><div class="h-streak">${st}<small>${plural(st,['день','дня','дней'])}</small></div></div>
 <div class="h-days">${days.map(d=>`<button class="hd-dot${h.log[d]?' on':''}${d===t?' td':''}" data-a="habitToggle" data-id="${h.id}" data-d="${d}" aria-label="${fmtLong(d)}"><i>${I('check')}</i>${d===t?'сег':WDS[pd(d).getDay()]}</button>`).join('')}</div></div>`}).join('')}</div>`
 :empty('Начните с малого','<br>Одна привычка — уже ритм. Нажмите «+».')}`;
};
V.more=()=>{
 const t=todayS(),wk=[...Array(7)].reduce((a,_,i)=>a+focusMin(addD(t,-i)),0),gAvg=S.goals.length?Math.round(S.goals.reduce((a,g)=>a+Math.min(1,g.current/g.target),0)/S.goals.length*100):0;
 const tile=(v,ic,b,s,c='')=>`<button class="tile ${c}" data-a="go" data-v="${v}"><span class="ti">${I(ic)}</span><div><b>${b}</b><span>${s}</span></div></button>`;
 return`<header class="hd"><div><div class="eyebrow">Ритм</div><h1 class="display">Ещё</h1></div><div class="hd-act"><button class="ib" data-a="theme" aria-label="Тема">${I(isDark()?'sun':'moon')}</button></div></header>
 <div class="tiles">${tile('focus','timer','Фокус',S.timer&&S.timer.running?'Идёт сессия · '+fmtSec(remain()):wk+' мин за неделю','dark')}${tile('goals','target','Цели',`${S.goals.length} · в среднем ${gAvg}%`)}${tile('notes','note','Заметки',`${S.notes.length} ${plural(S.notes.length,['заметка','заметки','заметок'])}`)}${tile('stats','chart','Статистика',`серия ${dayStreak()} ${plural(dayStreak(),['день','дня','дней'])}`)}${tile('settings','gear','Настройки','тема, цвета, резервная копия','wide')}</div>`;
};
const back=()=>`<button class="back" data-a="go" data-v="more">${I('chevL')} Ещё</button>`;
V.goals=()=>`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${S.goals.filter(g=>g.current>=g.target).length} из ${S.goals.length} достигнуто</div><h1 class="display">Цели</h1></div></header>
 ${S.goals.length?`<div class="hgrid">${S.goals.map(g=>{const p=Math.min(100,Math.round(g.current/g.target*100)),left=g.deadline?diffD(todayS(),g.deadline):null;return`<div class="card goal${p>=100?' complete':''}" style="--c:${g.color}"><div class="g-top"><div class="g-title" data-a="editGoal" data-id="${g.id}">${esc(g.title)}<div class="g-sub">${g.deadline?`до ${fmtDate(g.deadline).toLowerCase()} · ${left>=0?'осталось '+left+' '+plural(left,['день','дня','дней']):'срок прошёл'}`:'без срока'}</div></div><div class="g-pct">${p}<small>%</small></div></div><div class="g-bar"><i style="width:${p}%"></i></div><div class="g-foot"><span><b>${fmtNum(g.current)}</b> / ${fmtNum(g.target)} ${esc(g.unit||'')}</span><div class="stepper"><button data-a="goalStep" data-id="${g.id}" data-v="-1" aria-label="Меньше">−</button><button data-a="goalStep" data-id="${g.id}" data-v="1" aria-label="Больше">+</button></div></div></div>`}).join('')}</div>`:empty('Куда вы идёте?','<br>Добавьте цель и отмечайте прогресс.')}`;
const fmtNum=n=>Number(n).toLocaleString('ru-RU');
V.notes=()=>{
 let a=S.notes.slice();if(ui.nq){const q=ui.nq.toLowerCase();a=a.filter(n=>n.text.toLowerCase().includes(q))}
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${S.notes.length} ${plural(S.notes.length,['заметка','заметки','заметок'])}</div><h1 class="display">Заметки</h1></div></header>
 <label class="search">${I('search')}<input type="search" placeholder="Искать в заметках" value="${esc(ui.nq)}" data-in="nq" autocomplete="off"></label>
 <div id="nlist">${notesList(a)}</div>`;
};
function notesList(a){
 if(!a)a=S.notes.filter(n=>!ui.nq||n.text.toLowerCase().includes(ui.nq.toLowerCase()));
 a.sort((x,y)=>(y.pinned-x.pinned)||(y.updated-x.updated));
 if(!a.length)return empty(ui.nq?'Ничего не найдено':'Пусто и спокойно','<br>Запишите мысль, пока не улетела.');
 return`<div class="notes">${a.map(n=>{const[h,...r]=n.text.split('\n');const d=new Date(n.updated);return`<div class="note" style="${n.color?'--c:'+n.color:''}" data-a="editNote" data-id="${n.id}"><h4>${esc(h)}</h4>${r.join('\n').trim()?`<p>${esc(r.join('\n').trim())}</p>`:''}<div class="nd"><span>${d.getDate()} ${MONG[d.getMonth()]}</span>${n.pinned?I('pin'):''}</div></div>`}).join('')}</div>`;
}
/* --- фокус --- */
const MODES={work:'Фокус',short:'Перерыв',long:'Длинный перерыв'};
const dur=m=>S.settings.pomo[m]*60;
function T(){if(!S.timer)S.timer={mode:'work',running:false,endAt:0,remain:dur('work'),round:1,taskId:null};return S.timer}
const remain=()=>{const t=T();return t.running?Math.max(0,Math.ceil((t.endAt-Date.now())/1000)):t.remain};
const fmtSec=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
V.focus=()=>{
 const t=T(),r=remain(),pct=100-r/dur(t.mode)*100,td=todayS(),cand=S.tasks.filter(x=>!x.done&&(!x.date||x.date<=td)).sort(byDate).slice(0,30);
 const ses=S.focus.filter(f=>f.date===td).length;
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${ses} ${plural(ses,['сессия','сессии','сессий'])} · ${focusMin(td)} мин сегодня</div><h1 class="display">Фокус</h1></div></header>
 <div class="seg">${Object.entries(MODES).map(([k,v])=>`<button class="${t.mode===k?'on':''}" data-a="tmMode" data-v="${k}">${v}</button>`).join('')}</div>
 <div class="fz"><div style="margin-top:26px" id="tm-ring">${ring(Math.max(0,pct),272,5,`<span id="tm-time">${fmtSec(r)}</span><small>${MODES[t.mode]}${t.running?'':' · пауза'}</small>`)}</div>
 <div class="rounds">${[...Array(S.settings.pomo.rounds)].map((_,i)=>`<i class="${i<((t.round-1)%S.settings.pomo.rounds)?'on':''}"></i>`).join('')}</div>
 <div class="fctl"><button class="ib" data-a="tmReset" aria-label="Сбросить">${I('reset')}</button><button class="main" data-a="tmToggle" aria-label="${t.running?'Пауза':'Старт'}">${I(t.running?'pause':'play')}</button><button class="ib" data-a="tmSkip" aria-label="Пропустить">${I('skip')}</button></div>
 <div class="fsel"><span class="flabel">Над чем работаем</span><select data-ch="tmTask"><option value="">— без задачи —</option>${cand.map(x=>`<option value="${x.id}"${t.taskId===x.id?' selected':''}>${esc(x.title)}</option>`).join('')}</select></div></div>
 <h3 class="sec">Неделя фокуса</h3><div class="card">${barChart(7,d=>focusMin(d),'мин')}</div>`;
};
/* --- статистика --- */
function barChart(N,val,unit=''){
 const t=todayS(),days=[...Array(N)].map((_,i)=>addD(t,i-N+1)),v=days.map(val),max=Math.max(1,...v),W=340,H=150,bw=N>10?14:26,gap=(W-N*bw)/(N-1);
 return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="График">${days.map((d,i)=>{const h=Math.max(4,v[i]/max*(H-44)),x=i*(bw+gap),y=H-22-h;return`<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="${bw/3}" class="${i===N-1?'acc':v[i]?'has':''}"/>${v[i]?`<text class="v" x="${x+bw/2}" y="${y-6}" text-anchor="middle">${v[i]}</text>`:''}<text x="${x+bw/2}" y="${H-6}" text-anchor="middle">${N>10?pd(d).getDate():WDS[pd(d).getDay()]}</text>`}).join('')}</svg>`;
}
V.stats=()=>{
 const t=todayS(),wk=[...Array(7)].reduce((a,_,i)=>a+(S.log[addD(t,-i)]||0),0),total=Object.values(S.log).reduce((a,b)=>a+b,0),fw=[...Array(7)].reduce((a,_,i)=>a+focusMin(addD(t,-i)),0);
 const best=Object.keys(S.log).filter(k=>S.log[k]>0).sort().reduce((o,d)=>{o.c=o.p&&diffD(o.p,d)===1?o.c+1:1;o.b=Math.max(o.b,o.c);o.p=d;return o},{b:0,c:0,p:null}).b;
 const open=S.tasks.filter(x=>!x.done),tags={};S.tasks.forEach(x=>{const k=x.tag||'Без тега';tags[k]=tags[k]||{a:0,d:0};tags[k].a++;if(x.done)tags[k].d++});
 const pr=[3,2,1,0].map(p=>[PRIO[p],open.filter(x=>x.prio===p).length,p]);
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Ваш ритм</div><h1 class="display">Статистика</h1></div></header>
 <div class="kpis"><div class="kpi"><div class="v">${wk}</div><div class="l">выполнено за 7 дней</div></div><div class="kpi"><div class="v">${dayStreak()}<small> дн</small></div><div class="l">текущая серия · лучшая ${best}</div></div><div class="kpi"><div class="v">${fw}<small> мин</small></div><div class="l">фокуса за неделю</div></div><div class="kpi"><div class="v">${total}</div><div class="l">выполнено всего</div></div></div>
 <h3 class="sec">Выполнено по дням <span>14 дней</span></h3><div class="card">${barChart(14,d=>S.log[d]||0)}</div>
 ${S.habits.length?`<h3 class="sec">Привычки <span>30 дней</span></h3><div class="card hbars">${S.habits.map(h=>`<div class="hbar" style="--c:${h.color}"><div class="top">${h.icon} ${esc(h.name)}<span>${rate(h)}% · серия ${streak(h)}</span></div><div class="g-bar" style="margin:0"><i style="width:${rate(h)}%"></i></div></div>`).join('')}</div>`:''}
 <h3 class="sec">По тегам</h3><div class="card hbars">${Object.entries(tags).sort((a,b)=>b[1].a-a[1].a).map(([k,v])=>`<div class="hbar" style="--c:var(--acc)"><div class="top">#${esc(k)}<span>${v.d} из ${v.a}</span></div><div class="g-bar" style="margin:0"><i style="width:${Math.round(v.d/v.a*100)}%"></i></div></div>`).join('')||'<span class="muted">Нет данных</span>'}</div>
 <h3 class="sec">Открытые по приоритету</h3><div class="card hbars">${pr.map(([n,c,p])=>`<div class="hbar" style="--c:var(--p${p||1})"><div class="top">${n}<span>${c}</span></div><div class="g-bar" style="margin:0"><i style="width:${open.length?c/open.length*100:0}%;${p===0?'background:var(--ink3)':''}"></i></div></div>`).join('')}</div>`;
};
/* --- настройки --- */
let installEvt=null;
V.settings=()=>{
 const s=S.settings,np='Notification' in window?Notification.permission:'unsupported';
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Под себя</div><h1 class="display">Настройки</h1></div></header>
 <h3 class="sec">Оформление</h3><div class="set">
  <div class="set-row"><span class="lbl">Тема</span><div class="seg" style="min-width:210px">${[['auto','Авто'],['light','Светлая'],['dark','Тёмная']].map(([k,v])=>`<button class="${s.theme===k?'on':''}" data-a="setTheme" data-v="${k}">${v}</button>`).join('')}</div></div>
  <div class="set-row"><span class="lbl">Акцент<small>${(ACCENTS.find(a=>a[0]===s.accent)||['','Свой'])[1]}</small></span><div class="swatches">${ACCENTS.map(([c,n])=>`<button class="sw${s.accent===c?' on':''}" style="--c:${c}" data-a="setAccent" data-v="${c}" aria-label="${n}"></button>`).join('')}</div></div>
 </div>
 <h3 class="sec">Календарь</h3><div class="set">
  <div class="set-row"><span class="lbl">Начало недели</span><div class="seg" style="min-width:170px"><button class="${s.weekStart===1?'on':''}" data-a="setWs" data-v="1">Пн</button><button class="${s.weekStart===0?'on':''}" data-a="setWs" data-v="0">Вс</button></div></div>
  <div class="set-row"><span class="lbl">Часовой пояс<small>${esc(s.tz)} · время устройства</small></span><span class="muted">${Intl.DateTimeFormat().resolvedOptions().timeZone||''}</span></div>
 </div>
 <h3 class="sec">Фокус-таймер</h3><div class="set">
  ${[['work','Фокус, мин'],['short','Короткий перерыв'],['long','Длинный перерыв'],['rounds','Сессий до длинного']].map(([k,v])=>`<div class="set-row"><span class="lbl">${v}</span><input class="num" type="number" inputmode="numeric" min="1" max="${k==='rounds'?12:120}" value="${s.pomo[k]}" data-ch="pomo" data-k="${k}"></div>`).join('')}
  <div class="set-row"><span class="lbl">Звук по окончании</span><button class="tog${s.sound?' on':''}" data-a="setBool" data-k="sound" aria-label="Звук"></button></div>
  <div class="set-row"><span class="lbl">Автостарт перерывов</span><button class="tog${s.autoBreak?' on':''}" data-a="setBool" data-k="autoBreak" aria-label="Автостарт"></button></div>
 </div>
 <h3 class="sec">Напоминания</h3><div class="set">
  <div class="set-row"><span class="lbl">Уведомления<small>${np==='unsupported'?'Не поддерживается этим браузером':np==='denied'?'Запрещены в настройках браузера':'Задачи со временем и события (за 10 мин)'}</small></span><button class="tog${s.notify&&np==='granted'?' on':''}" data-a="setNotify" aria-label="Уведомления"></button></div>
 </div>
 <h3 class="sec">Теги</h3><div class="set"><div class="tagchips">${S.tags.map(g=>`<span class="chip">#${esc(g)}<button data-a="tagDel" data-v="${esc(g)}" aria-label="Удалить тег">${I('x')}</button></span>`).join('')}<form data-f="tagAdd"><input name="t" placeholder="+ новый тег" maxlength="24"></form></div></div>
 <h3 class="sec">Данные</h3><div class="set">
  <div class="set-row"><button class="rowbtn" data-a="export">${I('down')} Экспорт в JSON</button></div>
  <div class="set-row"><button class="rowbtn" data-a="import">${I('up')} Импорт из JSON</button></div>
  ${installEvt?`<div class="set-row"><button class="rowbtn" data-a="install">${I('phone')} Установить на главный экран</button></div>`:''}
  <div class="set-row"><button class="rowbtn" data-a="clearDemo">${I('spark')} Начать с чистого листа</button></div>
  <div class="set-row"><button class="rowbtn" style="color:#C2412D" data-a="resetAll">${I('trash')} Сбросить всё и вернуть примеры</button></div>
 </div>
 <p class="hint" style="text-align:center;margin:26px 0">Ритм · данные хранятся только на этом устройстве · работает офлайн</p>`;
};

/* ===== рендер и навигация ===== */
const TABS=[['today','today','Сегодня'],['tasks','tasks','Задачи'],['calendar','cal','Календарь'],['habits','habits','Привычки'],['more','more','Ещё']];
const SUB=['goals','notes','focus','stats','settings'];
function render(anim){
 const v=$('#view'),y=window.scrollY;v.innerHTML=V[ui.view]();
 if(anim){v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter')}else window.scrollTo(0,y);
 const cur=SUB.includes(ui.view)?'more':ui.view,t=todayS(),badge=S.tasks.filter(x=>!x.done&&x.date&&x.date<=t).length;
 $('#tabs').innerHTML=`<div class="tabs-in">${TABS.map(([k,ic,n])=>`<button class="tab${cur===k?' on':''}" data-a="go" data-v="${k}">${I(ic)}${n}${k==='today'&&badge?`<span class="badge">${badge}</span>`:''}</button>`).join('')}</div>`;
 $('#fab').innerHTML||($('#fab').innerHTML=I('plus'));$('#fab').classList.toggle('hide',['more','stats','settings','focus'].includes(ui.view));
 if(ui.view==='calendar'&&ui.calMode==='week'){const w=$('#wkscroll');if(w&&anim)w.scrollTop=7*42}
}
function go(v){if(ui.view===v){window.scrollTo({top:0,behavior:'smooth'});return}ui.view=v;render(true);window.scrollTo(0,0);try{history.replaceState(null,'','#'+v)}catch(e){}}

/* ===== тосты ===== */
let toastT,undoFn=null;
function toast(msg,undo){const el=$('#toast');el.innerHTML=`<span>${esc(msg)}</span>${undo?'<button data-a="undo">Отменить</button>':''}`;undoFn=undo||null;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>{el.classList.remove('show');undoFn=null},4000)}

/* ===== нижний лист (sheet) ===== */
let D=null;
function openSheet(kind,draft){D=Object.assign(draft,{_k:kind});renderSheet();const w=$('#sheet');w.classList.add('open');w.setAttribute('aria-hidden','false');$('.sheet',w).scrollTop=0;
 if(draft._focus)setTimeout(()=>{const i=$('.sheet [data-auto]');i&&i.focus()},350)}
function closeSheet(){const w=$('#sheet');w.classList.remove('open');w.setAttribute('aria-hidden','true');D=null;document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}
function syncD(){if(!D)return;$$('.sheet [data-m]').forEach(el=>{const k=el.dataset.m;D[k]=el.type==='number'?Number(el.value):el.value})}
function renderSheet(){syncD();$('.sheet-body').innerHTML=F[D._k]()}
const seg=(k,opts,cur)=>`<div class="seg">${opts.map(([v,n])=>`<button class="${String(cur)===String(v)?'on':''}" data-a="dSet" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
const swatches=cur=>`<div class="swatches">${COLORS.map(c=>`<button class="sw${cur===c?' on':''}" style="--c:${c}" data-a="dSet" data-k="color" data-v="${c}" aria-label="Цвет"></button>`).join('')}</div>`;
const F={};
F.choose=()=>`<h2 class="sh-title">Добавить</h2><div class="chooser">
 <button data-a="chooseNew" data-v="task"><span class="ti">${I('tasks')}</span><span>Задача<small>С приоритетом, подзадачами и повтором</small></span></button>
 <button data-a="chooseNew" data-v="event"><span class="ti">${I('event')}</span><span>Событие<small>Блок времени в расписании</small></span></button>
 <button data-a="chooseNew" data-v="note"><span class="ti">${I('note')}</span><span>Заметка<small>Мысль, список, идея</small></span></button>
 <button data-a="chooseNew" data-v="habit"><span class="ti">${I('habits')}</span><span>Привычка<small>Ежедневная отметка и серии</small></span></button>
 <button data-a="chooseNew" data-v="goal"><span class="ti">${I('target')}</span><span>Цель<small>Числовой прогресс к сроку</small></span></button></div>`;
F.task=()=>`<h2 class="sh-title">${D._new?'Новая задача':'Задача'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Что нужно сделать?" value="${esc(D.title)}" maxlength="200"></div>
 <div class="two"><div class="field"><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date||''}"></div><div class="field"><label>Время</label><input class="inp" type="time" data-m="time" value="${D.time||''}"></div></div>
 <div class="chips" style="margin:-4px -20px 14px">${[['Сегодня',todayS()],['Завтра',addD(todayS(),1)],['Через неделю',addD(todayS(),7)],['Без даты','']].map(([n,v])=>`<button class="chip${(D.date||'')===v?' on':''}" data-a="dSet" data-k="date" data-v="${v}">${n}</button>`).join('')}</div>
 <div class="field"><label>Приоритет</label>${seg('prio',[[0,'Нет'],[1,'Низкий'],[2,'Средний'],[3,'Высокий']],D.prio)}</div>
 <div class="field"><label>Тег</label><div class="chips" style="margin:0 -20px">${['',...S.tags].map(g=>`<button class="chip${(D.tag||'')===g?' on':''}" data-a="dSet" data-k="tag" data-v="${esc(g)}">${g?'#'+esc(g):'Без тега'}</button>`).join('')}</div></div>
 <div class="field"><label>Повтор</label><div class="chips" style="margin:0 -20px">${Object.entries(REPEAT).map(([k,v])=>`<button class="chip${D.repeat===k?' on':''}" data-a="dSet" data-k="repeat" data-v="${k}">${v}</button>`).join('')}</div></div>
 <div class="togrow"><span>Напомнить<small>${D.time?'В '+D.time+(D.date?' · '+fmtDate(D.date).toLowerCase():''):'Укажите время, чтобы получить уведомление'}</small></span><button class="tog${D.remind?' on':''}" data-a="dTog" data-k="remind" aria-label="Напомнить"></button></div>
 <div class="field"><label>Подзадачи ${D.subtasks.length?`· ${D.subtasks.filter(s=>s.done).length}/${D.subtasks.length}`:''}</label><div class="subs">${D.subtasks.map(s=>`<div class="sub${s.done?' done':''}"><button class="chk" data-a="dSub" data-id="${s.id}">${I('check')}</button><span>${esc(s.t)}</span><button class="x" data-a="dSubDel" data-id="${s.id}" aria-label="Удалить">${I('x')}</button></div>`).join('')}</div><input class="inp" data-sub placeholder="+ Добавить подзадачу и Enter" enterkeyhint="enter"></div>
 <div class="field"><label>Заметка</label><textarea class="inp" data-m="notes" placeholder="Детали, ссылки, мысли…" rows="3">${esc(D.notes)}</textarea></div>
 <div class="btnrow">${D._new?'':`<button class="btn danger" data-a="dDel">${I('trash')}</button><button class="btn ghost" data-a="dDup">Копия</button>`}<button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>`;
F.event=()=>`<h2 class="sh-title">${D._new?'Новое событие':'Событие'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Название" value="${esc(D.title)}" maxlength="200"></div>
 <div class="field"><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date}"></div>
 <div class="two"><div class="field"><label>Начало</label><input class="inp" type="time" data-m="start" value="${D.start}"></div><div class="field"><label>Конец</label><input class="inp" type="time" data-m="end" value="${D.end}"></div></div>
 <div class="chips" style="margin:-4px -20px 14px">${[15,30,45,60,90,120].map(m=>`<button class="chip" data-a="dDur" data-v="${m}">${m<60?m+' мин':m/60+' ч'}</button>`).join('')}</div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="togrow"><span>Напомнить за 10 минут<small>Если уведомления включены</small></span><button class="tog${D.remind?' on':''}" data-a="dTog" data-k="remind"></button></div>
 <div class="field"><label>Описание</label><textarea class="inp" data-m="note" placeholder="Место, ссылка на звонок…" rows="2">${esc(D.note)}</textarea></div>
 <div class="btnrow">${D._new?'':`<button class="btn danger" data-a="dDel">${I('trash')}</button>`}<button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>`;
F.habit=()=>{
 let stats='';if(!D._new){const h=S.habits.find(x=>x.id===D.id),t=todayS(),s=weekStartOf(addD(t,-7*17));let cells='';for(let i=0;i<18*7;i++){const d=addD(s,i);cells+=`<i class="${h.log[d]?'on':''}${d>t?' fut':''}" title="${d}"></i>`}
  stats=`<div class="kpis"><div class="kpi"><div class="v">${streak(h)}</div><div class="l">текущая серия</div></div><div class="kpi"><div class="v">${bestStreak(h)}</div><div class="l">лучшая серия</div></div><div class="kpi"><div class="v">${Object.values(h.log).filter(Boolean).length}</div><div class="l">всего отметок</div></div><div class="kpi"><div class="v">${rate(h)}<small>%</small></div><div class="l">за 30 дней</div></div></div><div class="heat" style="--c:${h.color}">${cells}</div>`}
 return`<h2 class="sh-title">${D._new?'Новая привычка':esc(D.name)}</h2>${stats}
 <div class="field"><label>Название</label><input class="inp big" data-m="name" ${D._new?'data-auto':''} placeholder="Например, «Зарядка»" value="${esc(D.name)}" maxlength="60"></div>
 <div class="field"><label>Символ</label><div class="icons">${HICONS.map(c=>`<button class="${D.icon===c?'on':''}" data-a="dSet" data-k="icon" data-v="${c}">${c}</button>`).join('')}</div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow">${D._new?'':`<button class="btn danger" data-a="dDel">${I('trash')}</button>`}<button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>`;
};
F.goal=()=>`<h2 class="sh-title">${D._new?'Новая цель':'Цель'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Например, «Прочитать 20 книг»" value="${esc(D.title)}" maxlength="120"></div>
 <div class="three"><div class="field"><label>Сейчас</label><input class="inp" type="number" inputmode="decimal" data-m="current" value="${D.current}"></div><div class="field"><label>Цель</label><input class="inp" type="number" inputmode="decimal" data-m="target" value="${D.target}"></div><div class="field"><label>Шаг</label><input class="inp" type="number" inputmode="decimal" data-m="step" value="${D.step}"></div></div>
 <div class="two"><div class="field"><label>Единица</label><input class="inp" data-m="unit" placeholder="км, книг, ₽" value="${esc(D.unit)}" maxlength="12"></div><div class="field"><label>Срок</label><input class="inp" type="date" data-m="deadline" value="${D.deadline||''}"></div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow">${D._new?'':`<button class="btn danger" data-a="dDel">${I('trash')}</button>`}<button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>`;
F.note=()=>`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">${swatches(D.color)}<button class="ib sm${D.pinned?' on':''}" data-a="dTog" data-k="pinned" aria-label="Закрепить" style="${D.pinned?'background:var(--ink);color:var(--bg)':''}">${I('pin')}</button></div>
 <div class="field"><textarea class="inp note-ta" data-m="text" data-auto placeholder="Первая строка станет заголовком…">${esc(D.text)}</textarea></div>
 <div class="btnrow">${D._new?'':`<button class="btn danger" data-a="dDel">${I('trash')}</button>`}<button class="btn pri" data-a="dSave">Готово</button></div>`;

function nextHour(){const d=new Date();return pad(Math.min(23,d.getHours()+1))+':00'}
const NEW={
 task:(o={})=>openSheet('task',Object.assign(mkTask({date:o.date??(ui.view==='today'?todayS():null)}),{_new:1,_focus:1})),
 event:(o={})=>{const s=nextHour();openSheet('event',{id:uid(),title:'',date:o.date||ui.calSel||todayS(),start:s,end:mstr(Math.min(tmin(s)+60,23*60+59)),color:COLORS[2],note:'',remind:false,_new:1,_focus:1})},
 habit:()=>openSheet('habit',{id:uid(),name:'',icon:HICONS[Math.floor(Math.random()*HICONS.length)],color:COLORS[S.habits.length%COLORS.length],log:{},created:todayS(),_new:1,_focus:1}),
 goal:()=>openSheet('goal',{id:uid(),title:'',current:0,target:10,step:1,unit:'',deadline:'',color:COLORS[S.goals.length%COLORS.length],_new:1,_focus:1}),
 note:()=>openSheet('note',{id:uid(),text:'',color:null,pinned:false,updated:Date.now(),_new:1,_focus:1}),
};
const COLL={task:'tasks',event:'events',habit:'habits',goal:'goals',note:'notes'};
const clean=o=>{const c={};for(const k in o)if(k[0]!=='_')c[k]=o[k];return c};
function saveDraft(){
 syncD();const k=D._k,arr=S[COLL[k]];
 const req={task:'title',event:'title',habit:'name',goal:'title',note:'text'}[k];
 if(!String(D[req]||'').trim()){const i=$('.sheet [data-auto]')||$('.sheet .inp');if(i){i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');i.focus()}return}
 if(k==='task'){D.title=D.title.trim();D.date=D.date||null;const old=S.tasks.find(x=>x.id===D.id);if(!old||old.date!==D.date||old.time!==D.time)D.notified=false;if(D._new)D.order=maxOrder()+1}
 if(k==='event'){if(!D.end||tmin(D.end)<=tmin(D.start))D.end=mstr(Math.min(tmin(D.start)+60,23*60+59));D.notified=false}
 if(k==='goal'){D.target=Math.max(1,Number(D.target)||1);D.current=Number(D.current)||0;D.step=Math.abs(Number(D.step))||1}
 if(k==='note')D.updated=Date.now();
 const obj=clean(D),i=arr.findIndex(x=>x.id===obj.id);
 if(i>-1){if(k==='task'&&arr[i].done!==obj.done)setDone(arr[i],obj.done);arr[i]=Object.assign(arr[i],obj)}else arr.push(obj);
 save();closeSheet();render();vib(8);
 if(D===null&&i<0)toast({task:'Задача добавлена',event:'Событие добавлено',habit:'Привычка добавлена',goal:'Цель добавлена',note:'Заметка сохранена'}[k]);
 if(k==='task'&&obj.remind&&S.settings.notify!==true&&'Notification' in window)setTimeout(()=>toast('Включите уведомления в настройках, чтобы получать напоминания'),1500);
}
function deleteDraft(){
 const k=D._k,arr=S[COLL[k]],i=arr.findIndex(x=>x.id===D.id);if(i<0){closeSheet();return}
 const[x]=arr.splice(i,1);save();closeSheet();render();
 toast({task:'Задача удалена',event:'Событие удалено',habit:'Привычка удалена',goal:'Цель удалена',note:'Заметка удалена'}[k],()=>{arr.splice(i,0,x);save();render()});
}

/* ===== действия ===== */
const A={
 go:el=>go(el.dataset.v),
 theme:()=>{S.settings.theme=isDark()?'light':'dark';save();applyTheme();render()},
 toggleTask:el=>toggleTask(el.dataset.id,el.closest('.task')),
 editTask:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(x)openSheet('task',JSON.parse(JSON.stringify(x)))},
 newTask:el=>NEW.task({date:el.dataset.d||null}),
 newEvent:el=>NEW.event({date:el.dataset.d}),
 editEvent:el=>{const x=S.events.find(t=>t.id===el.dataset.id);if(x)openSheet('event',JSON.parse(JSON.stringify(x)))},
 editHabit:el=>{const x=S.habits.find(t=>t.id===el.dataset.id);if(x)openSheet('habit',JSON.parse(JSON.stringify(x)))},
 editGoal:el=>{const x=S.goals.find(t=>t.id===el.dataset.id);if(x)openSheet('goal',JSON.parse(JSON.stringify(x)))},
 editNote:el=>{const x=S.notes.find(t=>t.id===el.dataset.id);if(x)openSheet('note',JSON.parse(JSON.stringify(x)))},
 fab:()=>{const v=ui.view;if(v==='today'||v==='tasks')NEW.task(ui.view==='tasks'?{date:ui.f==='today'?todayS():ui.f==='tomorrow'?addD(todayS(),1):null}:{});else if(v==='calendar')openSheet('choose',{});else if(v==='habits')NEW.habit();else if(v==='goals')NEW.goal();else if(v==='notes')NEW.note();else openSheet('choose',{})},
 chooseNew:el=>{const v=el.dataset.v;closeSheet();setTimeout(()=>NEW[v](v==='task'?{date:ui.view==='calendar'?ui.calSel:null}:{date:ui.calSel}),220)},
 toggleDone:()=>{ui.showDone=!ui.showDone;render()},
 moveOverdue:()=>{const t=todayS(),ov=S.tasks.filter(x=>!x.done&&x.date&&x.date<t),prev=ov.map(x=>x.date);ov.forEach(x=>{x.date=t;x.notified=false});save();render();toast(`Перенесено: ${ov.length}`,()=>{ov.forEach((x,i)=>x.date=prev[i]);save();render()})},
 filt:el=>{ui.f=el.dataset.v;render()},
 tagF:el=>{ui.tag=ui.tag===el.dataset.v?null:el.dataset.v;render()},
 calPick:(el,e)=>{if(e.target.closest('.wk-b'))return;ui.calSel=el.dataset.d;ui.calCursor=ui.calSel.slice(0,7);render()},
 calPrev:()=>calShift(-1),calNext:()=>calShift(1),
 calToday:()=>{ui.calSel=todayS();ui.calCursor=ui.calSel.slice(0,7);render()},
 calMode:el=>{ui.calMode=el.dataset.v;ui.calCursor=ui.calSel.slice(0,7);render(true)},
 habitToggle:el=>{const h=S.habits.find(x=>x.id===el.dataset.id),d=el.dataset.d;if(!h)return;if(h.log[d])delete h.log[d];else{h.log[d]=true;vib(12)}save();render();if(h.log[d]){const s=streak(h);if(s>1&&d===todayS()&&[3,7,14,21,30,50,100].includes(s))toast(`${h.name}: серия ${s} ${plural(s,['день','дня','дней'])}! ✦`)}},
 goalStep:el=>{const g=S.goals.find(x=>x.id===el.dataset.id);if(!g)return;const was=g.current>=g.target;g.current=Math.max(0,+(g.current+Number(el.dataset.v)*(g.step||1)).toFixed(2));save();render();vib(8);if(!was&&g.current>=g.target)toast('Цель достигнута: '+g.title+' ✦')},
 tmToggle:()=>{const t=T();if(t.running){t.remain=remain();t.running=false}else{if(t.remain<=0)t.remain=dur(t.mode);t.endAt=Date.now()+t.remain*1000;t.running=true;unlockAudio()}save();render()},
 tmReset:()=>{const t=T();t.running=false;t.remain=dur(t.mode);save();render()},
 tmSkip:()=>timerDone(true),
 tmMode:el=>{const t=T();t.mode=el.dataset.v;t.running=false;t.remain=dur(t.mode);save();render()},
 setTheme:el=>{S.settings.theme=el.dataset.v;save();applyTheme();render()},
 setAccent:el=>{S.settings.accent=el.dataset.v;save();applyTheme();render()},
 setWs:el=>{S.settings.weekStart=Number(el.dataset.v);save();render()},
 setBool:el=>{const k=el.dataset.k;S.settings[k]=!S.settings[k];save();render()},
 setNotify:async()=>{
  if(!('Notification' in window)){toast('Браузер не поддерживает уведомления');return}
  if(S.settings.notify&&Notification.permission==='granted'){S.settings.notify=false;save();render();return}
  let p=Notification.permission;if(p==='default')p=await Notification.requestPermission();
  S.settings.notify=p==='granted';save();render();toast(p==='granted'?'Уведомления включены':'Разрешение не получено');
  if(p==='granted')notify('Ритм','Так будут выглядеть напоминания');
 },
 tagDel:el=>{const g=el.dataset.v;S.tags=S.tags.filter(x=>x!==g);S.tasks.forEach(x=>{if(x.tag===g)x.tag=null});if(ui.tag===g)ui.tag=null;save();render()},
 export:()=>{const data=JSON.stringify(Object.assign({app:'ritm',exported:new Date().toISOString()},S),null,2),b=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ritm-backup-${todayS()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast('Резервная копия сохранена')},
 import:()=>$('#importFile').click(),
 install:async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice.catch(()=>{});installEvt=null;render()},
 clearDemo:()=>{if(!confirm('Удалить все задачи, события, привычки, цели и заметки? Настройки сохранятся.'))return;const st=S.settings,tg=S.tags;S=defaults();S.settings=st;S.tags=tg;S.seeded=true;save();render();toast('Чистый лист. Удачи!')},
 resetAll:()=>{if(!confirm('Сбросить все данные и настройки и вернуть примеры?'))return;localStorage.removeItem(KEY);S=load();save();applyTheme();ui.view='today';render(true);toast('Данные сброшены')},
 undo:()=>{if(undoFn){const f=undoFn;undoFn=null;f()}$('#toast').classList.remove('show')},
 sheetClose:()=>closeSheet(),
 dSet:el=>{const k=el.dataset.k;let v=el.dataset.v;if(k==='prio')v=Number(v);if(k==='tag'||k==='color')v=v||null;if(k==='date')v=v||null;syncD();D[k]=v;if(k==='date'){const i=$('.sheet [data-m=date]');if(i)i.value=v||''}renderSheet()},
 dTog:el=>{syncD();D[el.dataset.k]=!D[el.dataset.k];renderSheet()},
 dSub:el=>{const s=D.subtasks.find(x=>x.id===el.dataset.id);if(s)s.done=!s.done;renderSheet()},
 dSubDel:el=>{D.subtasks=D.subtasks.filter(x=>x.id!==el.dataset.id);renderSheet()},
 dDur:el=>{syncD();D.end=mstr(Math.min(tmin(D.start||'09:00')+Number(el.dataset.v),23*60+59));renderSheet()},
 dSave:()=>saveDraft(),
 dDel:()=>deleteDraft(),
 dDup:()=>{syncD();const c=mkTask(Object.assign(clean(JSON.parse(JSON.stringify(D))),{id:uid(),done:false,doneAt:null,spawned:null,order:maxOrder()+1,title:D.title+' (копия)'}));S.tasks.push(c);save();closeSheet();render();toast('Создана копия')},
};
function calShift(n){if(ui.calMode==='month'){ui.calCursor=addM(ui.calCursor+'-01',n).slice(0,7);const s=ui.calCursor+'-01';ui.calSel=ui.calCursor===todayS().slice(0,7)?todayS():s}else{ui.calSel=addD(ui.calSel,7*n);ui.calCursor=ui.calSel.slice(0,7)}render()}

/* ===== события DOM ===== */
let suppress=false;
document.addEventListener('click',e=>{
 if(suppress){e.preventDefault();e.stopPropagation();return}
 const el=e.target.closest('[data-a]');if(!el)return;
 if(el.closest('.sheet')===null&&el.tagName==='BUTTON'&&el.closest('form'))e.preventDefault();
 const f=A[el.dataset.a];if(f){if(el.tagName==='BUTTON')e.preventDefault();f(el,e)}
});
document.addEventListener('submit',e=>{
 e.preventDefault();const f=e.target;
 if(f.dataset.f==='qa'){const i=f.q;if(quickAdd(i.value,f.dataset.d||null)){i.value='';setTimeout(()=>{const n=$('.qa input');n&&n.focus()},30)}}
 if(f.dataset.f==='tagAdd'){const v=f.t.value.trim().replace(/^#/,'');if(v&&!S.tags.includes(v)){S.tags.push(v);save();render();setTimeout(()=>{const n=$('form[data-f=tagAdd] input');n&&n.focus()},30)}}
});
document.addEventListener('input',e=>{
 const k=e.target.dataset.in;if(!k)return;ui[k]=e.target.value;
 if(k==='q')$('#tlist').innerHTML=tasksList();if(k==='nq')$('#nlist').innerHTML=notesList();
});
document.addEventListener('change',e=>{
 const el=e.target,k=el.dataset.ch;
 if(k==='sort'){ui.sort=el.value;S.settings.sort=el.value;save();render()}
 if(k==='tmTask'){T().taskId=el.value||null;save()}
 if(k==='pomo'){const v=Math.max(1,Math.min(el.dataset.k==='rounds'?12:120,Math.round(Number(el.value)||1)));S.settings.pomo[el.dataset.k]=v;const t=T();if(!t.running)t.remain=dur(t.mode);save();toast('Сохранено')}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&D){closeSheet();return}
 if(e.key==='Enter'&&e.target.matches('[data-sub]')){e.preventDefault();const v=e.target.value.trim();if(v){syncD();D.subtasks.push({id:uid(),t:v,done:false});renderSheet();setTimeout(()=>{const n=$('.sheet [data-sub]');n&&n.focus()},10)}}
 if(e.key==='Enter'&&D&&e.target.matches('.inp.big')){e.preventDefault();saveDraft()}
});
$('#importFile').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const d=JSON.parse(await f.text());if(!d||!Array.isArray(d.tasks))throw new Error('format');
  if(!confirm('Заменить текущие данные данными из файла?'))return;
  const def=defaults();delete d.app;delete d.exported;S=Object.assign(def,d,{settings:Object.assign(def.settings,d.settings||{})});save();applyTheme();render(true);toast('Данные импортированы');
 }catch(err){toast('Не удалось прочитать файл')}finally{e.target.value=''}
});

/* ===== свайпы и перетаскивание ===== */
let sw=null,dr=null;
document.addEventListener('pointerdown',e=>{
 const h=e.target.closest('.handle');if(h){startDrag(e,h.closest('.task'));return}
 const ti=e.target.closest('.task-in');if(ti&&!e.target.closest('.chk'))sw={el:ti,li:ti.closest('.task'),x:e.clientX,y:e.clientY,dx:0,on:false,dead:false};
 const g=e.target.closest('.grab');if(g&&D){const sh=$('.sheet'),y0=e.clientY;const mv=ev=>{const dy=Math.max(0,ev.clientY-y0);sh.style.transition='none';sh.style.transform=`translateY(${dy}px)`};const up=ev=>{sh.style.transition='';sh.style.transform='';if(ev.clientY-y0>90)closeSheet();removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)}
});
document.addEventListener('pointermove',e=>{
 if(dr){moveDrag(e);return}
 if(!sw||sw.dead)return;
 const dx=e.clientX-sw.x,dy=e.clientY-sw.y;
 if(!sw.on){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){sw.dead=true;return}if(Math.abs(dx)>12){sw.on=true;sw.li.classList.add('swiping')}else return}
 sw.dx=dx;sw.el.style.transform=`translateX(${dx}px)`;sw.li.classList.toggle('sw-r',dx>0);sw.li.classList.toggle('sw-l',dx<0);
},{passive:true});
function endSwipe(cancel){
 if(dr){endDrag();return}
 if(!sw)return;const s=sw;sw=null;if(!s.on)return;
 suppress=true;setTimeout(()=>suppress=false,60);
 s.li.classList.remove('swiping');const id=s.li.dataset.id;
 if(!cancel&&s.dx>90){s.el.style.transform='translateX(100%)';setTimeout(()=>toggleTask(id),180)}
 else if(!cancel&&s.dx<-90){s.el.style.transform='translateX(-100%)';setTimeout(()=>deleteTask(id),180)}
 else{s.el.style.transform='';setTimeout(()=>s.li.classList.remove('sw-r','sw-l'),280)}
}
document.addEventListener('pointerup',()=>endSwipe(false));
document.addEventListener('pointercancel',()=>endSwipe(true));
function startDrag(e,li){
 const ul=li.parentElement;if(!ul.hasAttribute('data-sortable'))return;
 e.preventDefault();dr={li,ul,y0:e.clientY,base:e.clientY};li.classList.add('dragging');vib(10);
 try{e.target.setPointerCapture(e.pointerId)}catch(_){}
}
function moveDrag(e){
 const{li,ul}=dr,y=e.clientY;li.style.transform=`translateY(${y-dr.base}px)`;
 const sibs=[...ul.children].filter(x=>x!==li);let idx=sibs.findIndex(s=>{const r=s.getBoundingClientRect();return y<r.top+r.height/2});
 const ref=idx<0?null:sibs[idx];if(ref===li.nextElementSibling&&ref)return;if(!ref&&li===ul.lastElementChild)return;
 const before=li.offsetTop;ul.insertBefore(li,ref);const after=li.offsetTop;dr.base+=after-before;li.style.transform=`translateY(${y-dr.base}px)`;
 if(y<60)scrollBy(0,-12);if(y>innerHeight-120)scrollBy(0,12);
}
function endDrag(){
 const{li,ul}=dr;dr=null;li.classList.remove('dragging');li.style.transform='';
 const ids=[...ul.children].map(x=>x.dataset.id),items=ids.map(id=>S.tasks.find(t=>t.id===id)).filter(Boolean),ords=items.map(x=>x.order).sort((a,b)=>a-b);
 items.forEach((x,i)=>x.order=ords[i]);save();suppress=true;setTimeout(()=>suppress=false,60);
}

/* ===== таймер ===== */
let actx=null;
function unlockAudio(){try{if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}}
function beep(){if(!S.settings.sound)return;try{unlockAudio();[0,.22,.44].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=i===2?880:660;g.gain.setValueAtTime(0,actx.currentTime+d);g.gain.linearRampToValueAtTime(.25,actx.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d+.35);o.connect(g).connect(actx.destination);o.start(actx.currentTime+d);o.stop(actx.currentTime+d+.4)})}catch(e){}}
function timerDone(skipped){
 const t=T(),p=S.settings.pomo;
 if(t.mode==='work'){
  if(!skipped){S.focus.push({date:todayS(),min:p.work,taskId:t.taskId});const tk=S.tasks.find(x=>x.id===t.taskId);notify('Фокус завершён',tk?`«${tk.title}» — ${p.work} мин. Пора отдохнуть.`:'Отличная работа. Пора отдохнуть.')}
  t.mode=t.round%p.rounds===0?'long':'short';t.round++;
 }else{t.mode='work';if(!skipped)notify('Перерыв окончен','Возвращаемся к делу.')}
 if(!skipped){beep();vib([200,100,200])}
 t.remain=dur(t.mode);t.running=!skipped&&S.settings.autoBreak&&t.mode!=='work';if(t.running)t.endAt=Date.now()+t.remain*1000;
 save();render();if(!skipped)toast(t.mode==='work'?'Перерыв окончен':'Сессия засчитана ✦');
}
function tick(){
 const t=S.timer;if(!t||!t.running){if(document.title!=='Ритм — планировщик')document.title='Ритм — планировщик';return}
 const r=remain();if(r<=0){timerDone(false);return}
 document.title=`${fmtSec(r)} · ${MODES[t.mode]}`;
 const el=$('#tm-time');if(el){el.textContent=fmtSec(r);const c=$('#tm-ring .fgc');if(c){const len=parseFloat(c.getAttribute('stroke-dasharray'));c.setAttribute('stroke-dashoffset',len*(r/dur(t.mode)))}}
 const pl=$('#pill-t');if(pl)pl.textContent=fmtSec(r);
}
setInterval(tick,500);

/* ===== напоминания ===== */
async function notify(title,body){
 if(!S.settings.notify||!('Notification' in window)||Notification.permission!=='granted')return;
 const o={body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',vibrate:[120,60,120],tag:'ritm-'+Date.now()};
 try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(r&&r.showNotification){await r.showNotification(title,o);return}}catch(e){}
 try{new Notification(title,o)}catch(e){}
}
function checkReminders(){
 const now=Date.now();let ch=false;
 S.tasks.forEach(x=>{if(x.remind&&!x.done&&x.date&&x.time&&!x.notified){const at=pd(x.date).getTime()+tmin(x.time)*6e4;if(now>=at){x.notified=true;ch=true;if(now-at<6*36e5){notify('Напоминание',`${x.title} · ${x.time}`);toast('Напоминание: '+x.title)}}}});
 S.events.forEach(x=>{if(x.remind&&x.date&&x.start&&!x.notified){const at=pd(x.date).getTime()+(tmin(x.start)-10)*6e4;if(now>=at){x.notified=true;ch=true;if(now-at<36e5){notify('Через 10 минут',`${x.title} · ${x.start}`);toast('Скоро: '+x.title+' в '+x.start)}}}});
 if(ch)save();
}
setInterval(checkReminders,20000);

/* ===== запуск ===== */
let lastDay=todayS();
setInterval(()=>{const t=todayS();if(t!==lastDay){lastDay=t;ui.calSel=t;render()}else if(ui.view==='today'&&!D&&!dr&&!sw&&document.activeElement.tagName!=='INPUT'&&new Date().getSeconds()<1)render()},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();checkReminders();if(!D)render()}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(ui.view==='settings')render()});
applyTheme();
{const h=location.hash.slice(1);if(V[h])ui.view=h}
render(true);save();checkReminders();
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
