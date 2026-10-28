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
function defaults(){return{v:1,tasks:[],events:[],habits:[],goals:[],notes:[],tags:['Работа','Личное','Учёба','Здоровье','Дом'],log:{},focus:[],timer:null,journal:{},templates:[],countdowns:[],ach:{},stats:{},spaces:[],space:'all',lessons:[],homework:[],exams:[],health:{},money:[],budgets:{},
 settings:{capacity:6,dayStart:'09:00',dayEnd:'21:00',peak:'morning',theme:'auto',accent:'#D4572A',weekStart:1,pomo:{work:25,short:5,long:15,rounds:4},notify:false,sound:true,autoBreak:false,tz:'Europe/Moscow',waterGoal:8,glassMl:250,lightSkin:'paper',darkSkin:'night',reduceMotion:false,parityFlip:false}}}
const mkTask=o=>Object.assign({id:uid(),sp:curSp(),title:'',notes:'',prio:0,tag:null,date:null,time:'',subtasks:[],repeat:'none',remind:false,est:0,energy:'',frog:false,done:false,doneAt:null,created:Date.now(),order:0},o);
function load(){
 try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw),def=defaults();purgeDemo(d);return Object.assign(def,d,{settings:Object.assign(def.settings,d.settings,{pomo:Object.assign(def.settings.pomo,(d.settings||{}).pomo)})})}}catch(e){console.warn(e)}
 const d=defaults();d.clean=2;return d;
}
/* разовая миграция: убрать демо-данные прошлых версий, не трогая созданное пользователем */
const DEMO={
 tasks:['Разобрать входящие письма','Подготовить презентацию','Прогулка 30 минут','Позвонить маме','Купить продукты','Оплатить интернет','Прочитать главу книги','Записаться к стоматологу'],
 events:['Созвон с командой','Обед','Йога','Спортзал','Встреча с другом'],
 habits:['Вода 2 литра','Чтение 20 минут','Без сахара','Медитация'],
 goals:['Прочитать 24 книги','Пробежать 100 км','Накопить на отпуск'],
 notes:['Идеи для выходных\nСходить в музей','Книги в список\n— «Мастер и Маргарита»','Пароль от Wi‑Fi у родителей']
};
function purgeDemo(d){
 if(d.clean>=2)return false;
 if(!d.seeded){d.clean=2;return true}
 const tk=(d.tasks||[]).filter(x=>DEMO.tasks.includes(x.title));
 let seedDay=null;
 const cr=tk.map(x=>x.created).filter(Boolean);if(cr.length)seedDay=ymd(new Date(Math.min(...cr)));
 const sf=(d.focus||[]).filter(f=>!('taskId' in f));
 if(!seedDay&&sf.length)seedDay=addD(sf.map(f=>f.date).sort().pop(),1);
 const removed=new Set(tk.map(x=>x.id));
 d.tasks=(d.tasks||[]).filter(x=>!removed.has(x.id)&&!DEMO.tasks.includes(x.title));
 d.events=(d.events||[]).filter(x=>!DEMO.events.includes(x.title));
 d.habits=(d.habits||[]).filter(x=>!DEMO.habits.includes(x.name));
 d.goals=(d.goals||[]).filter(x=>!DEMO.goals.includes(x.title));
 d.notes=(d.notes||[]).filter(x=>!DEMO.notes.some(n=>String(x.text||'').startsWith(n)));
 d.focus=(d.focus||[]).filter(f=>'taskId' in f);
 if(d.log){if(seedDay){for(const k of Object.keys(d.log)){if(k<seedDay)delete d.log[k]}if(d.log[seedDay])d.log[seedDay]=Math.max(0,d.log[seedDay]-1);if(!d.log[seedDay])delete d.log[seedDay]}else d.log={}}
 if(d.timer&&d.timer.taskId&&!d.tasks.some(x=>x.id===d.timer.taskId))d.timer.taskId=null;
 d.clean=2;return true;
}
let S=load();
let saveT;
function save(){try{if(window.ACH_ON&&!SCF)checkAch();localStorage.setItem(KEY,JSON.stringify(SCF?Object.assign({},S,SCF):S))}catch(e){toast('Не удалось сохранить: память заполнена')}}
const ui={view:'today',calMode:'month',calSel:todayS(),calCursor:todayS().slice(0,7),f:'all',tag:null,sort:S.settings.sort||'manual',q:'',nq:'',showDone:false,prev:null};

/* ===== тема ===== */
const mq=matchMedia('(prefers-color-scheme: dark)');
const DARKSK=['night','oled'];
const skinNow=()=>{const s=S.settings,t=s.theme;if(t==='auto')return mq.matches?(s.darkSkin||'night'):(s.lightSkin||'paper');if(t==='light')return s.lightSkin||'paper';if(t==='dark')return s.darkSkin||'night';return t||'paper'};
const isDark=()=>DARKSK.includes(skinNow());
function applyTheme(){
 const dark=isDark(),r=document.documentElement,sk=skinNow();r.dataset.theme=dark?'dark':'light';r.dataset.skin=sk;
 let a=S.settings.accent;if(sk==='mono')a=dark?'#EDEDED':'#111111';if(dark&&a==='#2F2E2A')a='#E8E2D6';
 r.style.setProperty('--acc',a);r.classList.toggle('rm',!!S.settings.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches);
 const m=$('meta[name=theme-color]');if(m)m.content={paper:'#F3EFE6',sage:'#EEF1EA',lavender:'#F1EEF6',mono:'#F4F4F2',night:'#11100E',oled:'#000000'}[sk]||(dark?'#11100E':'#F3EFE6');
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
  x.doneAt=Date.now();logDelta(1);if(x.frog)bump('frogs');if(new Date().getHours()<8)bump('early');
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
 if(x.date===t&&list.length&&list.every(y=>y.done)){if(list.length>=3&&S.journal[t]?.perfect!==1){J(t).perfect=1;bump('perfect');save()}toast('День закрыт. Все задачи выполнены ✦')}
 else if(x.repeat!=='none')toast('Готово. Следующий повтор — '+fmtDate(nextDate(x.date||t,x.repeat)).toLowerCase());
 else toast('Выполнено',()=>{setDone(x,false);save();render()});
}
function deleteTask(id){
 const i=S.tasks.findIndex(t=>t.id===id);if(i<0)return;const x=S.tasks[i];S.tasks.splice(i,1);save();render();vib(8);
 toast('Задача удалена',()=>{S.tasks.splice(i,0,x);save();render()});
}
function parseQuick(s,def,dry){
 let date=def||null,time='',prio=0,tag=null,repeat='none',est=0,frog=false;const t=todayS(),now=new Date();
 const cut=(re,f)=>{s=s.replace(re,(...m)=>{f(...m);return ' '})};
 cut(/(^|\s)#([^\s#]+)/g,(m,a,b)=>{b=b.replace(/_/g,' ');const f=S.tags.find(x=>x.toLowerCase()===b.toLowerCase());tag=f||cap(b);if(!f&&!dry)S.tags.push(tag)});
 cut(/🐸|(^|\s)!лягушка(?=\s|$)/i,()=>{frog=true});
 cut(/(^|\s)(!{1,3})(?=\s|$)/,(m,a,b)=>{prio=b.length});
 const WN={по:1,пн:1,вт:2,ср:3,че:4,чт:4,пя:5,пт:5,су:6,сб:6,во:0,вс:0};
 const WDRE='(понедельник|вторник|сред[ау]|четверг|пятниц[ау]|суббот[ау]|воскресенье|пн|вт|ср|чт|пт|сб|вс)';
 const nextWd=(w,allowToday)=>addD(t,((w-now.getDay()+7)%7)||(allowToday?0:7));
 cut(/(^|\s)(каждый день|ежедневно)(?=\s|$)/i,()=>{repeat='daily';date=date||t});
 cut(/(^|\s)(по будням|каждый будний день)(?=\s|$)/i,()=>{repeat='weekdays';if(!date){let d=t;while([0,6].includes(pd(d).getDay()))d=addD(d,1);date=d}});
 cut(new RegExp('(^|\\s)(?:кажд(?:ый|ую|ое)|по)\\s'+WDRE+'(?:ам|м)?(?=\\s|$)','i'),(m,a,b)=>{repeat='weekly';date=nextWd(WN[b.slice(0,2).toLowerCase()],true)});
 cut(/(^|\s)(каждую неделю|еженедельно)(?=\s|$)/i,()=>{repeat='weekly';date=date||t});
 cut(/(^|\s)(каждый месяц|ежемесячно)(?=\s|$)/i,()=>{repeat='monthly';date=date||t});
 cut(/(^|\s)через\s+(?:(\d+(?:[.,]\d+)?)\s*)?(полчаса|минут[уы]?|мин|час(?:а|ов)?|дн(?:я|ей)|день|недел[июь]|месяц(?:а|ев)?)(?=\s|$)/i,(m,a,n,u)=>{
  u=u.toLowerCase();const k=n?parseFloat(n.replace(',','.')):1;
  if(u==='полчаса'||u.startsWith('мин')||u.startsWith('час')){const mins=u==='полчаса'?30:u.startsWith('мин')?k:k*60;const d=new Date(Date.now()+mins*6e4);d.setMinutes(Math.ceil(d.getMinutes()/5)*5,0,0);date=ymd(d);time=pad(d.getHours())+':'+pad(d.getMinutes())}
  else if(u.startsWith('нед'))date=addD(t,7*k);
  else if(u.startsWith('мес')){const d=pd(t);d.setMonth(d.getMonth()+k);date=ymd(d)}
  else date=addD(t,k)});
 const W={'сегодня':0,'завтра':1,'послезавтра':2};
 cut(/(^|\s)(сегодня|послезавтра|завтра)(?=\s|$)/i,(m,a,b)=>{date=addD(t,W[b.toLowerCase()])});
 const MON=['январ','феврал','март','апрел','ма','июн','июл','август','сентябр','октябр','ноябр','декабр'];
 cut(/(^|\s)(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+(\d{4}))?(?=\s|$)/i,(m,a,d,mo,y)=>{const mi=MON.findIndex(x=>mo.toLowerCase().startsWith(x)&&(x!=='ма'||mo.toLowerCase()==='мая'));let yy=y?+y:now.getFullYear();let r=yy+'-'+pad(mi+1)+'-'+pad(d);if(!y&&r<t)r=(yy+1)+r.slice(4);date=r});
 cut(/(^|\s)(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?(?=\s|$)/,(m,a,d,mo,y)=>{if(+mo>12||+d>31||+mo<1)return;let yy=y?(y.length===2?2000+ +y:+y):now.getFullYear();let r=yy+'-'+pad(mo)+'-'+pad(d);if(!y&&r<t)r=(yy+1)+r.slice(4);date=r});
 cut(new RegExp('(^|\\s)(?:во?\\s)?'+WDRE+'(?=\\s|$)','i'),(m,a,b)=>{date=nextWd(WN[b.slice(0,2).toLowerCase()],false)});
 cut(/(^|\s)(?:в\s)?([01]?\d|2[0-3])[:.]([0-5]\d)(?=\s|$)/,(m,a,h,mm)=>{time=pad(h)+':'+mm});
 cut(/(^|\s)в\s([01]?\d|2[0-3])(?:\s*(утра|дня|вечера|ночи))?(?=\s|$)/i,(m,a,h,pp)=>{h=+h;pp=(pp||'').toLowerCase();if((pp==='вечера'||pp==='дня')&&h<12)h+=12;if(pp==='ночи'&&h===12)h=0;time=pad(h)+':00'});
 cut(/(^|\s)(утром|днём|днем|вечером)(?=\s|$)/i,(m,a,b)=>{if(!time)time={утром:'09:00',днём:'13:00',днем:'13:00',вечером:'19:00'}[b.toLowerCase()]});
 cut(/(^|\s)~\s?(\d+(?:[.,]\d+)?)\s*(ч|час|часа|м|мин)?(?=\s|$)/i,(m,a,n,u)=>{n=parseFloat(n.replace(',','.'));est=u&&u[0].toLowerCase()==='ч'?Math.round(n*60):Math.round(n)});
 cut(/(^|\s)(\d+(?:[.,]\d+)?)\s?(ч|мин|м)(?=\s|$)/i,(m,a,n,u)=>{n=parseFloat(n.replace(',','.'));est=u.toLowerCase()==='ч'?Math.round(n*60):Math.round(n)});
 if(time&&!date)date=t;
 return{title:s.replace(/\s+/g,' ').trim(),date,time,prio,tag,repeat,est:Math.min(est,720),frog};
}
function quickAdd(text,def){
 const p=parseQuick(text,def);if(!p.title)return false;
 const x=mkTask(Object.assign(p,{order:maxOrder()+1}));S.tasks.push(x);save();render();vib(8);
 if(x.frog)S.tasks.forEach(y=>{if(y!==x&&y.date===x.date)y.frog=false});
 toast(`Добавлено${x.date?' · '+fmtDate(x.date).toLowerCase():''}${x.time?' в '+x.time:''}${x.repeat!=='none'?' · '+REPEAT[x.repeat].toLowerCase():''}${x.est?' · '+fmtDur(x.est):''}${x.frog?' · 🐸':''}`,()=>{S.tasks=S.tasks.filter(y=>y.id!==x.id);save();render()});
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
 if(x.est)m.push(`<span>${I('hourglass')}${shortDur(x.est)}</span>`);
 if(x.energy==='hi')m.push(`<span title="Тяжёлая">${I('bolt')}</span>`);
 if(x.tag)m.push(`<span class="tagm">#${esc(x.tag)}</span>`);
 if(x.subtasks.length)m.push(`<span>${I('tasks')}${x.subtasks.filter(s=>s.done).length}/${x.subtasks.length}</span>`);
 if(x.repeat&&x.repeat!=='none')m.push(`<span title="${REPEAT[x.repeat]}">${I('repeat')}</span>`);
 if(x.remind)m.push(`<span>${I('bell')}</span>`);
 if(x.notes)m.push(`<span>${I('note')}</span>`);
 const sm=!!ui.sel,pk=sm&&ui.sel.has(x.id);
 if(sm)return`<li class="task p${x.prio}${x.done?' done':''} selm${pk?' picked':''}" data-id="${x.id}"><div class="task-in" data-a="selTog" data-id="${x.id}"><span class="pick">${I('check')}</span><div class="t-body"><div class="t-title">${x.frog?'<span class="frog" title="Лягушка дня">🐸</span>':''}${esc(x.title)}</div>${m.length?`<div class="t-meta">${m.join('')}</div>`:''}</div></div></li>`;
 return`<li class="task p${x.prio}${x.done?' done':''}" data-id="${x.id}"><div class="sw-bg"><span>${I('check')} Готово</span><span>Удалить ${I('trash')}</span></div><div class="task-in"><button class="chk" data-a="toggleTask" data-id="${x.id}" aria-label="Отметить">${I('check')}</button><div class="t-body" data-a="editTask" data-id="${x.id}"><div class="t-title">${x.frog?'<span class="frog" title="Лягушка дня">🐸</span>':''}${esc(x.title)}</div>${m.length?`<div class="t-meta">${m.join('')}</div>`:''}</div><button class="tdel" data-a="delTask" data-id="${x.id}" aria-label="Удалить задачу">${I('trash')}</button>${o.drag?`<span class="handle" aria-label="Перетащить">${I('drag')}</span>`:''}</div></li>`;
}
const list=(arr,o={})=>`<ul class="list"${o.drag&&!ui.sel?' data-sortable':''}>${arr.map(x=>taskItem(x,o)).join('')}</ul>`;
const qaForm=(d,ph)=>`<form class="qa" data-f="qa" data-d="${d||''}"><input name="q" placeholder="${ph||'Новая задача…'}" autocomplete="off" enterkeyhint="done" aria-label="Быстрое добавление">${SR?`<button type="button" class="mic" data-a="mic" aria-label="Голосовой ввод">${I('mic')}</button>`:''}<button aria-label="Добавить">${I('plus')}</button></form>`;
function lanes(items){const ends=[];items.sort((a,b)=>a.s-b.s||b.e-a.e);for(const it of items){let l=ends.findIndex(e=>e<=it.s);if(l<0){l=ends.length;ends.push(0)}ends[l]=it.e;it.l=l}return Math.max(1,ends.length)}
function dayItems(date){
 const ev=S.events.filter(e=>e.date===date&&e.start).map(e=>({k:'ev',id:e.id,title:e.title,s:tmin(e.start),e:Math.max(tmin(e.end||e.start)||0,tmin(e.start)+15),c:e.color,sub:`${e.start}–${e.end||''}`}));
 const tk=S.tasks.filter(x=>x.date===date&&x.time).map(x=>({k:'task',id:x.id,title:x.title,s:tmin(x.time),e:tmin(x.time)+(x.est||30),c:x.frog?'var(--acc)':'var(--ink3)',sub:x.time+(x.est?' · '+shortDur(x.est):''),done:x.done}));
 const ls=lessonsOn(date).map(l=>({k:'ls',id:l.id,title:l.subj+(l.room?' · '+l.room:''),s:tmin(l.start),e:Math.max(tmin(l.end)||0,tmin(l.start)+15),c:l.color||'#3E5C8A',sub:`${l.start}–${l.end}${l.teacher?' · '+l.teacher:''}`}));
 return ev.concat(tk,ls);
}
function timeline(date){
 const it=dayItems(date);
 if(!it.length)return empty('Свободный день','<br>Нажмите «+ Событие» или «Распланировать день».');
 let h0=Math.min(8,Math.floor(Math.min(...it.map(i=>i.s))/60)),h1=Math.max(21,Math.ceil(Math.max(...it.map(i=>i.e))/60));h1=Math.min(24,h1);
 const HH=52,n=lanes(it),top=m=>(m/60-h0)*HH+10;
 let h='';for(let k=h0;k<=h1;k++)h+=`<div class="tl-h" style="top:${(k-h0)*HH+10}px"><span>${pad(k)}:00</span></div>`;
 const w=`(100% - 60px)/${n}`;
 const b=it.map(i=>`<div class="tl-b ${i.k==='task'?'task':''}${i.done?' isdone':''}" data-a="${i.k==='ev'?'editEvent':i.k==='ls'?'editLesson':'editTask'}" data-id="${i.id}" style="--c:${i.c};top:${top(i.s)+1}px;height:${Math.max(26,(i.e-i.s)/60*HH-3)}px;left:calc(56px + ${w}*${i.l});width:calc(${w} - 4px)">${i.k==='ev'?`<button class="tl-x" data-a="delEvent" data-id="${i.id}" aria-label="Удалить событие">${I('x')}</button>`:''}<b>${esc(i.title)}</b><small>${i.sub}</small></div>`).join('');
 let now='';if(date===todayS()){const d=new Date(),m=d.getHours()*60+d.getMinutes();if(m>=h0*60&&m<=h1*60)now=`<div class="tl-now" style="top:${top(m)}px"></div>`}
 return`<div class="tl" data-a="tlNew" data-d="${date}" data-h0="${h0}" style="height:${(h1-h0)*HH+22}px">${h}${b}${now}</div>`;
}
function greet(){const h=new Date().getHours();return h<5?'Доброй <em>ночи</em>':h<12?'Доброе <em>утро</em>':h<18?'Добрый <em>день</em>':'Добрый <em>вечер</em>'}

/* ===== экраны ===== */
const V={};
V.today=()=>{
 const t=todayS(),d=new Date(),day=S.tasks.filter(x=>x.date===t),open=day.filter(x=>!x.done).sort((a,b)=>(b.frog?1:0)-(a.frog?1:0)||byOrder(a,b)),done=day.filter(x=>x.done).sort((a,b)=>b.doneAt-a.doneAt);
 const over=S.tasks.filter(x=>!x.done&&x.date&&x.date<t).sort(byDate);
 const pct=day.length?Math.round(done.length/day.length*100):0,hd=S.habits.filter(h=>h.log[t]).length,fm=focusMin(t);
 const tm=S.timer&&S.timer.running?`<span class="timer-pill" data-a="go" data-v="focus">${I('timer')}<span id="pill-t">${fmtSec(remain())}</span></span>`:'';
 return`<header class="hd"><div><div class="eyebrow">${WDF[d.getDay()]} · ${d.getDate()} ${MONG[d.getMonth()]}</div><h1 class="display">${greet()}</h1></div><div class="hd-act">${tm}<button class="ib" data-a="share" aria-label="Поделиться планом дня">${I('share')}</button><button class="ib" data-a="theme" aria-label="Тема">${I(isDark()?'sun':'moon')}</button></div></header>
 ${ritualCard()}<section class="card hero">${ring(pct)}<div class="hero-st">
  <div class="row">${I('tasks')}<span><b>${done.length}</b> из ${day.length} ${plural(day.length,['задачи','задач','задач'])}</span></div>
  <div class="row">${I('habits')}<span><b>${hd}</b> из ${S.habits.length} привычек</span></div>
  <div class="row">${I('timer')}<span><b>${fm}</b> мин фокуса</span></div>
  <div class="row">${I('fire')}<span>серия <b>${dayStreak()}</b> ${plural(dayStreak(),['день','дня','дней'])}</span></div>
 </div></section>
 ${cdChips()}${healthStrip()}${studyToday()}${nowCard()}
 ${qaForm(t,'Задача… «в 7 вечера ~30м #Дом !!»')}${capCard(t)}
 ${over.length?`<h3 class="sec">Просрочено <span>${over.length}</span><i class="grow"></i><button data-a="moveOverdue">Перенести на сегодня</button></h3>${list(over)}`:''}
 <h3 class="sec">На сегодня <span>${open.length}</span></h3>
 ${open.length?list(open,{drag:true,hideToday:true}):empty(day.length?'Всё сделано':'Чистый лист',day.length?'<br>Можно выдохнуть.':'<br>Добавьте первую задачу выше.')}
 ${done.length?`<div class="linkrow"><button class="link" data-a="toggleDone">${ui.showDone?'Скрыть':'Показать'} выполненные · ${done.length}</button>${ui.showDone?`<button class="link red" data-a="delDone" data-d="${t}">${I('trash')} Удалить выполненные</button>`:''}</div>${ui.showDone?list(done,{hideToday:true}):''}`:''}
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
function selBar(){const n=ui.sel.size,vis=filtered().length;return`<div class="selbar" role="toolbar"><div class="sb-top"><b>Выбрано: ${n}</b><button data-a="selAll">${n&&n>=vis?'Снять все':'Выбрать все'}</button><button data-a="selMode" aria-label="Закрыть">${I('x')}</button></div><div class="sb-row"><button class="btn" data-a="selDone"${n?'':' disabled'}>${I('check')} Выполнить</button>${S.spaces.length>1?`<button class="btn" data-a="selSp"${n?'':' disabled'}>${I('layers')} В…</button>`:''}<button class="btn red" data-a="selDel"${n?'':' disabled'}>${I('trash')} Удалить</button></div></div>`}
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
 return`<header class="hd"><div><div class="eyebrow">${open} ${plural(open,['открытая','открытые','открытых'])}</div><h1 class="display">Задачи</h1></div><div class="hd-act"><button class="ib" data-a="go" data-v="matrix" aria-label="Матрица Эйзенхауэра">${I('grid')}</button><button class="ib" data-a="newDump" aria-label="Разгрузить голову">${I('dump')}</button></div></header>
 <label class="search">${I('search')}<input type="search" placeholder="Поиск по задачам, заметкам, тегам" value="${esc(ui.q)}" data-in="q" autocomplete="off"></label>
 <div class="chips">${Object.entries(FILTERS).map(([k,v])=>`<button class="chip${ui.f===k?' on':''}" data-a="filt" data-v="${k}">${v}${cnt[k]?`<b>${cnt[k]}</b>`:''}</button>`).join('')}</div>
 <div class="chips" style="margin-top:8px">${S.tags.map(g=>`<button class="chip acc${ui.tag===g?' on':''}" data-a="tagF" data-v="${esc(g)}">#${esc(g)}</button>`).join('')}</div>
 ${qaForm(qd,'Например: «Отчёт завтра 10:00 #Работа !!!»')}
 <p class="hint">Подсказка: «завтра», «пт», «18:30», «#тег», «!»–«!!!» — приоритет. Свайп вправо — готово, влево — удалить. Корзина справа тоже удаляет.</p>
 <div class="toolbar"><button class="tb-btn${ui.sel?' on':''}" data-a="selMode">${I('check')} ${ui.sel?'Готово':'Выбрать'}</button>${S.tasks.some(x=>x.done)?`<button class="tb-btn red" data-a="delDone">${I('trash')} Удалить выполненные</button>`:''}<i class="grow"></i><span class="tb-l">Сортировка</span><select data-ch="sort" aria-label="Сортировка">${[['manual','Вручную'],['date','По сроку'],['prio','По приоритету'],['name','По названию']].map(([k,v])=>`<option value="${k}"${ui.sort===k?' selected':''}>${v}</option>`).join('')}</select></div>
 <div id="tlist">${tasksList()}</div>${ui.sel?selBar():''}`;
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
 const cols=days.map(d=>{const it=dayItems(d),n=lanes(it);return`<div class="wk-col${d===ui.calSel?' sel':''}" data-a="calPick" data-d="${d}">${it.map(i=>{const top=Math.max(0,(i.s/60-H0)*HH);return`<div class="wk-b ${i.k==='task'?'task':''}" data-a="${i.k==='ev'?'editEvent':i.k==='ls'?'editLesson':'editTask'}" data-id="${i.id}" style="--c:${i.c};top:${top}px;height:${Math.max(18,(i.e-i.s)/60*HH-2)}px;left:calc(${100/n}% * ${i.l} + 1px);width:calc(${100/n}% - 3px);right:auto">${esc(i.title)}</div>`}).join('')}</div>`}).join('');
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
 ${S.habits.length?`<div class="hgrid">${S.habits.map(h=>{const st=streak(h);return`<div class="card habit" style="--c:${h.color}"><div class="h-top" data-a="editHabit" data-id="${h.id}"><span class="h-ic">${h.icon}</span><div><div class="h-name">${esc(h.name)}</div><div class="h-sub">лучшая серия ${bestStreak(h)} · ${rate(h)}% за 30 дней</div></div><div class="h-streak">${st}<small>${plural(st,['день','дня','дней'])}</small></div><button class="cdel st" data-a="delHabit" data-id="${h.id}" aria-label="Удалить привычку">${I('trash')}</button></div>
 <div class="h-days">${days.map(d=>`<button class="hd-dot${h.log[d]?' on':''}${d===t?' td':''}" data-a="habitToggle" data-id="${h.id}" data-d="${d}" aria-label="${fmtLong(d)}"><i>${I('check')}</i>${d===t?'сег':WDS[pd(d).getDay()]}</button>`).join('')}</div></div>`}).join('')}</div>`
 :empty('Начните с малого','<br>Одна привычка — уже ритм. Нажмите «+».')}`;
};
V.more=()=>{
 const t=todayS(),wk=[...Array(7)].reduce((a,_,i)=>a+focusMin(addD(t,-i)),0),gAvg=S.goals.length?Math.round(S.goals.reduce((a,g)=>a+Math.min(1,g.current/g.target),0)/S.goals.length*100):0;
 const tile=(v,ic,b,s,c='')=>`<button class="tile ${c}" data-a="go" data-v="${v}"><span class="ti">${I(ic)}</span><div><b>${b}</b><span>${s}</span></div></button>`;
 return`<header class="hd"><div><div class="eyebrow">Ритм</div><h1 class="display">Ещё</h1></div><div class="hd-act"><button class="ib" data-a="theme" aria-label="Тема">${I(isDark()?'sun':'moon')}</button></div></header>
 ${(()=>{const j=S.journal[t]||{},wd=rangeSum(addD(t,-6),7,d=>S.log[d]),cd=S.countdowns.filter(c=>cdLeft(c)>=0).sort((x,y)=>cdLeft(x)-cdLeft(y))[0],got=ACH.filter(a=>S.ach&&S.ach[a[0]]).length;
 return`<h3 class="sec">Ритуалы</h3><div class="tiles">${tile('plan','sunrise','План дня',j.planned?'готов ✓':'3 минуты утром')}${tile('review','sunset','Итоги дня',j.reviewed?'день закрыт ✓':'2 минуты вечером')}${tile('week','week','Обзор недели',`${wd} ${plural(wd,['задача','задачи','задач'])} за 7 дней · сравнение`,'wide')}</div>
 <h3 class="sec">Инструменты</h3><div class="tiles">${tile('focus','timer','Фокус',S.timer&&S.timer.running?'Идёт сессия · '+fmtSec(remain()):wk+' мин за неделю','dark')}${tile('now','now','Сейчас','одна задача, без шума')}${tile('matrix','grid','Матрица','срочно / важно')}${tile('routines','copy','Шаблоны',S.templates.length?`${S.templates.length} ${plural(S.templates.length,['рутина','рутины','рутин'])}`:'рутины в одно касание')}${tile('countdowns','hourglass','Отсчёты',cd?`${cdLeft(cd)} дн. до «${esc(cd.title)}»`:'важные даты')}${tile('notes','note','Заметки',`${S.notes.length} ${plural(S.notes.length,['заметка','заметки','заметок'])}`)}</div>
 <h3 class="sec">Прогресс</h3><div class="tiles">${tile('goals','target','Цели',`${S.goals.length} · в среднем ${gAvg}%`)}${tile('stats','chart','Статистика',`серия ${dayStreak()} ${plural(dayStreak(),['день','дня','дней'])}`)}${tile('achieve','medal','Достижения',`${got} из ${ACH.length} открыто`,'wide')}</div>
 <div class="tiles" style="margin-top:10px">${tile('settings','gear','Настройки','тема, день и энергия, резервная копия','wide')}</div>`})()}`;
};
const back=(v='more',l='Ещё')=>`<button class="back" data-a="go" data-v="${v}">${I('chevL')} ${l}</button>`;
V.goals=()=>`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${S.goals.filter(g=>g.current>=g.target).length} из ${S.goals.length} достигнуто</div><h1 class="display">Цели</h1></div></header>
 ${S.goals.length?`<div class="hgrid">${S.goals.map(g=>{const p=Math.min(100,Math.round(g.current/g.target*100)),left=g.deadline?diffD(todayS(),g.deadline):null;return`<div class="card goal${p>=100?' complete':''}" style="--c:${g.color}"><div class="g-top"><div class="g-title" data-a="editGoal" data-id="${g.id}">${esc(g.title)}<div class="g-sub">${g.deadline?`до ${fmtDate(g.deadline).toLowerCase()} · ${left>=0?'осталось '+left+' '+plural(left,['день','дня','дней']):'срок прошёл'}`:'без срока'}</div></div><div class="g-pct">${p}<small>%</small></div><button class="cdel st" data-a="delGoal" data-id="${g.id}" aria-label="Удалить цель">${I('trash')}</button></div><div class="g-bar"><i style="width:${p}%"></i></div><div class="g-foot"><span><b>${fmtNum(g.current)}</b> / ${fmtNum(g.target)} ${esc(g.unit||'')}</span><div class="stepper"><button data-a="goalStep" data-id="${g.id}" data-v="-1" aria-label="Меньше">−</button><button data-a="goalStep" data-id="${g.id}" data-v="1" aria-label="Больше">+</button></div></div></div>`}).join('')}</div>`:empty('Куда вы идёте?','<br>Добавьте цель и отмечайте прогресс.')}`;
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
 return`<div class="notes">${a.map(n=>{const[h,...r]=n.text.split('\n');const d=new Date(n.updated);return`<div class="note" style="${n.color?'--c:'+n.color:''}" data-a="editNote" data-id="${n.id}"><button class="cdel" data-a="delNote" data-id="${n.id}" aria-label="Удалить заметку">${I('trash')}</button><h4>${esc(h)}</h4>${r.join('\n').trim()?`<p>${esc(r.join('\n').trim())}</p>`:''}<div class="nd"><span>${d.getDate()} ${MONG[d.getMonth()]}</span>${n.pinned?I('pin'):''}</div></div>`}).join('')}</div>`;
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
  ${themeRow()}
  <div class="set-row"><span class="lbl">Акцент<small>${(ACCENTS.find(a=>a[0]===s.accent)||['','Свой'])[1]}</small></span><div class="swatches">${ACCENTS.map(([c,n])=>`<button class="sw${s.accent===c?' on':''}" style="--c:${c}" data-a="setAccent" data-v="${c}" aria-label="${n}"></button>`).join('')}</div></div>
  ${motionRow()}
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
 <h3 class="sec">День и энергия</h3><div class="set">
  <div class="set-row"><span class="lbl">Начало дня</span><input class="tinp" type="time" data-ch="dayT" data-k="dayStart" value="${s.dayStart}"></div>
  <div class="set-row"><span class="lbl">Конец дня</span><input class="tinp" type="time" data-ch="dayT" data-k="dayEnd" value="${s.dayEnd}"></div>
  <div class="set-row"><span class="lbl">Ёмкость дня, часов<small>Сколько реально успеть, кроме встреч</small></span><input class="num" type="number" min="1" max="16" data-ch="cap" value="${s.capacity}"></div>
  <div class="set-row"><span class="lbl">Пик энергии<small>Сюда встают тяжёлые задачи</small></span><div class="seg" style="min-width:190px">${[['morning','Утро'],['day','День'],['evening','Вечер']].map(([k,v])=>`<button class="${s.peak===k?'on':''}" data-a="setPeak" data-v="${k}">${v}</button>`).join('')}</div></div>
 </div>
 <h3 class="sec">Теги</h3><div class="set"><div class="tagchips">${S.tags.map(g=>`<span class="chip">#${esc(g)}<button data-a="tagDel" data-v="${esc(g)}" aria-label="Удалить тег">${I('x')}</button></span>`).join('')}<form data-f="tagAdd"><input name="t" placeholder="+ новый тег" maxlength="24"></form></div></div>
 <h3 class="sec">Данные</h3><div class="set">
  <div class="set-row"><button class="rowbtn" data-a="export">${I('down')} Экспорт в JSON</button></div>
  <div class="set-row"><button class="rowbtn" data-a="import">${I('up')} Импорт из JSON</button></div>
  ${installEvt?`<div class="set-row"><button class="rowbtn" data-a="install">${I('phone')} Установить на главный экран</button></div>`:''}
  <div class="set-row"><button class="rowbtn" data-a="clearDemo">${I('spark')} Начать с чистого листа</button></div>
  <div class="set-row"><button class="rowbtn" style="color:#C2412D" data-a="resetAll">${I('trash')} Сбросить всё</button></div>
 </div>
 <p class="hint" style="text-align:center;margin:26px 0">Ритм · данные хранятся только на этом устройстве · работает офлайн</p>`;
};

/* ===== рендер и навигация ===== */
const TABS=[['today','today','Сегодня'],['tasks','tasks','Задачи'],['calendar','cal','Календарь'],['habits','habits','Привычки'],['more','more','Ещё']];
const SUB=['goals','notes','focus','stats','settings','plan','review','week','now','matrix','routines','countdowns','achieve'];
function render0(anim){
 const v=$('#view'),y=window.scrollY;v.innerHTML=V[ui.view]();
 if(anim){v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter')}else window.scrollTo(0,y);
 const cur=SUB.includes(ui.view)?'more':ui.view,t=todayS(),badge=S.tasks.filter(x=>!x.done&&x.date&&x.date<=t).length;
 $('#tabs').innerHTML=`<div class="tabs-in">${TABS.map(([k,ic,n])=>`<button class="tab${cur===k?' on':''}" data-a="go" data-v="${k}">${I(ic)}${n}${k==='today'&&badge?`<span class="badge">${badge}</span>`:''}</button>`).join('')}</div>`;
 $('#fab').innerHTML||($('#fab').innerHTML=I('plus'));$('#fab').classList.toggle('hide',['more','stats','settings','focus','plan','review','week','now','achieve','health'].includes(ui.view));
 if(ui.view==='calendar'&&ui.calMode==='week'){const w=$('#wkscroll');if(w&&anim)w.scrollTop=7*42}
}
function go(v){if(v!=='tasks')ui.sel=null;if(ui.view===v){window.scrollTo({top:0,behavior:'smooth'});return}ui.view=v;render(true);window.scrollTo(0,0);try{history.replaceState(null,'','#'+v)}catch(e){}}

/* ===== тосты ===== */
let toastT,undoFn=null;
function toast(msg,undo){const el=$('#toast');el.innerHTML=`<span>${esc(msg)}</span>${undo?'<button data-a="undo">Отменить</button>':''}`;undoFn=undo||null;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>{el.classList.remove('show');undoFn=null},4000)}

/* ===== подтверждение (своё, не системное) ===== */
let cfFn=null;
function ask(title,text,ok,fn){
 let el=$('#confirm');if(!el){el=document.createElement('div');el.id='confirm';el.className='cf-wrap';document.body.appendChild(el)}
 el.innerHTML=`<div class="cf-bd" data-a="cfNo"></div><div class="cf" role="alertdialog" aria-modal="true"><div class="cf-ic">${I('trash')}</div><h3>${esc(title)}</h3>${text?`<p>${esc(text)}</p>`:''}<div class="cf-row"><button class="btn ghost" data-a="cfNo">Отмена</button><button class="btn red" data-a="cfOk">${esc(ok||'Удалить')}</button></div></div>`;
 cfFn=fn;void el.offsetWidth;el.classList.add('open');vib(6);setTimeout(()=>{const b=$('#confirm [data-a=cfOk]');b&&b.focus()},60);
}
function cfClose(){const el=$('#confirm');if(el)el.classList.remove('open');cfFn=null}
const LBL={tasks:['Удалить задачу?','Задача удалена'],events:['Удалить событие?','Событие удалено'],habits:['Удалить привычку?','Привычка удалена'],goals:['Удалить цель?','Цель удалена'],notes:['Удалить заметку?','Заметка удалена'],templates:['Удалить шаблон?','Шаблон удалён'],countdowns:['Удалить отсчёт?','Отсчёт удалён']};
const nameOf=x=>x.title||x.name||String(x.text||'').split('\n')[0]||'';
function delItem(coll,id,after){
 const arr=S[coll],x=arr.find(y=>y.id===id);if(!x)return;
 const extra=coll==='habits'?'История отметок тоже исчезнет.':coll==='goals'?'Прогресс по цели будет потерян.':'';
 ask(LBL[coll][0],`«${nameOf(x).slice(0,60)}»${extra?' — '+extra:''}`,'Удалить',()=>{
  const i=arr.indexOf(x);if(i<0)return;arr.splice(i,1);
  if(coll==='tasks'&&S.timer&&S.timer.taskId===id)S.timer.taskId=null;
  save();after&&after();render();vib(10);
  toast(LBL[coll][1],()=>{S[coll].splice(Math.min(i,S[coll].length),0,x);save();render()});
 });
}

/* ===== нижний лист (sheet) ===== */
let D=null;
function openSheet(kind,draft){D=Object.assign(draft,{_k:kind});$(".sheet-body").innerHTML="";renderSheet();const w=$('#sheet');w.classList.add('open');w.setAttribute('aria-hidden','false');$('.sheet',w).scrollTop=0;
 if(draft._focus)setTimeout(()=>{const i=$('.sheet [data-auto]');i&&i.focus()},350)}
function closeSheet(){const w=$('#sheet');w.classList.remove('open');w.setAttribute('aria-hidden','true');D=null;document.activeElement&&document.activeElement.blur&&document.activeElement.blur()}
function syncD(){if(!D)return;$$('.sheet [data-m]').forEach(el=>{const k=el.dataset.m;D[k]=el.type==='number'?Number(el.value):el.value})}
function renderSheet(){syncD();$('.sheet-body').innerHTML=F[D._k]()}
const delBtn=w=>D._new?'':`<button class="btn del-wide" data-a="dDel">${I('trash')} Удалить ${w}</button>`;
const seg=(k,opts,cur)=>`<div class="seg">${opts.map(([v,n])=>`<button class="${String(cur)===String(v)?'on':''}" data-a="dSet" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
const swatches=cur=>`<div class="swatches">${COLORS.map(c=>`<button class="sw${cur===c?' on':''}" style="--c:${c}" data-a="dSet" data-k="color" data-v="${c}" aria-label="Цвет"></button>`).join('')}</div>`;
const F={};
F.choose=()=>`<h2 class="sh-title">Добавить</h2><div class="chooser">
 <button data-a="chooseNew" data-v="task"><span class="ti">${I('tasks')}</span><span>Задача<small>С приоритетом, подзадачами и повтором</small></span></button>
 <button data-a="chooseNew" data-v="event"><span class="ti">${I('event')}</span><span>Событие<small>Блок времени в расписании</small></span></button>
 <button data-a="chooseNew" data-v="note"><span class="ti">${I('note')}</span><span>Заметка<small>Мысль, список, идея</small></span></button>
 <button data-a="chooseNew" data-v="habit"><span class="ti">${I('habits')}</span><span>Привычка<small>Ежедневная отметка и серии</small></span></button>
 <button data-a="chooseNew" data-v="goal"><span class="ti">${I('target')}</span><span>Цель<small>Числовой прогресс к сроку</small></span></button>
 <button data-a="chooseNew" data-v="dump"><span class="ti">${I('dump')}</span><span>Разгрузить голову<small>Много задач списком или голосом</small></span></button>
 <button data-a="chooseNew" data-v="cd"><span class="ti">${I('hourglass')}</span><span>Отсчёт<small>Сколько дней до важной даты</small></span></button></div>`;
F.task=()=>`<h2 class="sh-title">${D._new?'Новая задача':'Задача'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Что нужно сделать?" value="${esc(D.title)}" maxlength="200"></div>
 <div class="two"><div class="field"><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date||''}"></div><div class="field"><label>Время</label><input class="inp" type="time" data-m="time" value="${D.time||''}"></div></div>
 <div class="chips" style="margin:-4px -20px 14px">${[['Сегодня',todayS()],['Завтра',addD(todayS(),1)],['Через неделю',addD(todayS(),7)],['Без даты','']].map(([n,v])=>`<button class="chip${(D.date||'')===v?' on':''}" data-a="dSet" data-k="date" data-v="${v}">${n}</button>`).join('')}</div>
 <div class="field"><label>Приоритет</label>${seg('prio',[[0,'Нет'],[1,'Низкий'],[2,'Средний'],[3,'Высокий']],D.prio)}</div>
 <div class="field"><label>Длительность</label>${seg('est',[[0,'—'],[15,'15м'],[30,'30м'],[60,'1ч'],[90,'1,5ч'],[120,'2ч']],D.est||0)}</div>
 <div class="field"><label>Энергия</label>${seg('energy',[['','Обычная'],['hi','Тяжёлая'],['lo','Лёгкая']],D.energy||'')}</div>
 <div class="togrow"><span>🐸 Лягушка дня<small>Самое важное и неприятное — делаем первым</small></span><button class="tog${D.frog?' on':''}" data-a="dTog" data-k="frog" aria-label="Лягушка дня"></button></div>
 <div class="field"><label>Тег</label><div class="chips" style="margin:0 -20px">${['',...S.tags].map(g=>`<button class="chip${(D.tag||'')===g?' on':''}" data-a="dSet" data-k="tag" data-v="${esc(g)}">${g?'#'+esc(g):'Без тега'}</button>`).join('')}</div></div>
 <div class="field"><label>Повтор</label><div class="chips" style="margin:0 -20px">${Object.entries(REPEAT).map(([k,v])=>`<button class="chip${D.repeat===k?' on':''}" data-a="dSet" data-k="repeat" data-v="${k}">${v}</button>`).join('')}</div></div>
 <div class="togrow"><span>Напомнить<small>${D.time?'В '+D.time+(D.date?' · '+fmtDate(D.date).toLowerCase():''):'Укажите время, чтобы получить уведомление'}</small></span><button class="tog${D.remind?' on':''}" data-a="dTog" data-k="remind" aria-label="Напомнить"></button></div>
 <div class="field"><label>Подзадачи ${D.subtasks.length?`· ${D.subtasks.filter(s=>s.done).length}/${D.subtasks.length}`:''}</label><div class="subs">${D.subtasks.map(s=>`<div class="sub${s.done?' done':''}"><button class="chk" data-a="dSub" data-id="${s.id}">${I('check')}</button><span>${esc(s.t)}</span><button class="x" data-a="dSubDel" data-id="${s.id}" aria-label="Удалить">${I('x')}</button></div>`).join('')}</div><input class="inp" data-sub placeholder="+ Добавить подзадачу и Enter" enterkeyhint="enter"></div>
 <div class="field"><label>Заметка</label><textarea class="inp" data-m="notes" placeholder="Детали, ссылки, мысли…" rows="3">${esc(D.notes)}</textarea></div>
 <div class="btnrow">${D._new?'':`<button class="btn ghost" data-a="dDup">Копия</button>`}<button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('задачу')}`;
F.event=()=>`<h2 class="sh-title">${D._new?'Новое событие':'Событие'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Название" value="${esc(D.title)}" maxlength="200"></div>
 <div class="field"><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date}"></div>
 <div class="two"><div class="field"><label>Начало</label><input class="inp" type="time" data-m="start" value="${D.start}"></div><div class="field"><label>Конец</label><input class="inp" type="time" data-m="end" value="${D.end}"></div></div>
 <div class="chips" style="margin:-4px -20px 14px">${[15,30,45,60,90,120].map(m=>`<button class="chip" data-a="dDur" data-v="${m}">${m<60?m+' мин':m/60+' ч'}</button>`).join('')}</div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="togrow"><span>Напомнить за 10 минут<small>Если уведомления включены</small></span><button class="tog${D.remind?' on':''}" data-a="dTog" data-k="remind"></button></div>
 <div class="field"><label>Описание</label><textarea class="inp" data-m="note" placeholder="Место, ссылка на звонок…" rows="2">${esc(D.note)}</textarea></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('событие')}`;
F.habit=()=>{
 let stats='';if(!D._new){const h=S.habits.find(x=>x.id===D.id),t=todayS(),s=weekStartOf(addD(t,-7*17));let cells='';for(let i=0;i<18*7;i++){const d=addD(s,i);cells+=`<i class="${h.log[d]?'on':''}${d>t?' fut':''}" title="${d}"></i>`}
  stats=`<div class="kpis"><div class="kpi"><div class="v">${streak(h)}</div><div class="l">текущая серия</div></div><div class="kpi"><div class="v">${bestStreak(h)}</div><div class="l">лучшая серия</div></div><div class="kpi"><div class="v">${Object.values(h.log).filter(Boolean).length}</div><div class="l">всего отметок</div></div><div class="kpi"><div class="v">${rate(h)}<small>%</small></div><div class="l">за 30 дней</div></div></div><div class="heat" style="--c:${h.color}">${cells}</div>`}
 return`<h2 class="sh-title">${D._new?'Новая привычка':esc(D.name)}</h2>${stats}
 <div class="field"><label>Название</label><input class="inp big" data-m="name" ${D._new?'data-auto':''} placeholder="Например, «Зарядка»" value="${esc(D.name)}" maxlength="60"></div>
 <div class="field"><label>Символ</label><div class="icons">${HICONS.map(c=>`<button class="${D.icon===c?'on':''}" data-a="dSet" data-k="icon" data-v="${c}">${c}</button>`).join('')}</div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="field"><label>Напомнить в · если ещё не отмечено</label><input class="inp" type="time" data-m="time" value="${D.time||''}"></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('привычку')}`;
};
F.goal=()=>`<h2 class="sh-title">${D._new?'Новая цель':'Цель'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Например, «Прочитать 20 книг»" value="${esc(D.title)}" maxlength="120"></div>
 <div class="three"><div class="field"><label>Сейчас</label><input class="inp" type="number" inputmode="decimal" data-m="current" value="${D.current}"></div><div class="field"><label>Цель</label><input class="inp" type="number" inputmode="decimal" data-m="target" value="${D.target}"></div><div class="field"><label>Шаг</label><input class="inp" type="number" inputmode="decimal" data-m="step" value="${D.step}"></div></div>
 <div class="two"><div class="field"><label>Единица</label><input class="inp" data-m="unit" placeholder="км, книг, ₽" value="${esc(D.unit)}" maxlength="12"></div><div class="field"><label>Срок</label><input class="inp" type="date" data-m="deadline" value="${D.deadline||''}"></div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('цель')}`;
F.note=()=>`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">${swatches(D.color)}<button class="ib sm${D.pinned?' on':''}" data-a="dTog" data-k="pinned" aria-label="Закрепить" style="${D.pinned?'background:var(--ink);color:var(--bg)':''}">${I('pin')}</button></div>
 <div class="field"><textarea class="inp note-ta" data-m="text" data-auto placeholder="Первая строка станет заголовком…">${esc(D.text)}</textarea></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">Готово</button></div>${delBtn('заметку')}`;

function nextHour(){const d=new Date();return pad(Math.min(23,d.getHours()+1))+':00'}
const NEW={
 task:(o={})=>openSheet('task',Object.assign(mkTask({date:o.date??(ui.view==='today'?todayS():null),prio:o.prio||0,title:o.title||''}),{_new:1,_focus:1})),
 event:(o={})=>{const s=o.start||nextHour();openSheet('event',{id:uid(),title:'',date:o.date||ui.calSel||todayS(),start:s,end:mstr(Math.min(tmin(s)+60,23*60+59)),color:COLORS[2],note:'',remind:false,_new:1,_focus:1})},
 habit:()=>openSheet('habit',{id:uid(),name:'',icon:HICONS[Math.floor(Math.random()*HICONS.length)],color:COLORS[S.habits.length%COLORS.length],log:{},created:todayS(),_new:1,_focus:1}),
 goal:()=>openSheet('goal',{id:uid(),title:'',current:0,target:10,step:1,unit:'',deadline:'',color:COLORS[S.goals.length%COLORS.length],_new:1,_focus:1}),
 dump:()=>openSheet('dump',{text:'',_new:1,_focus:1}),
 tpl:(o={})=>openSheet('tpl',{id:uid(),name:o.name||'',text:o.text||'',tag:null,_new:1,_focus:1}),
 cd:()=>openSheet('cd',{id:uid(),title:'',date:addD(todayS(),30),yearly:false,color:COLORS[S.countdowns.length%COLORS.length],created:Date.now(),_new:1,_focus:1}),
 note:()=>openSheet('note',{id:uid(),text:'',color:null,pinned:false,updated:Date.now(),_new:1,_focus:1}),
};
const COLL={task:'tasks',event:'events',habit:'habits',goal:'goals',note:'notes',tpl:'templates',cd:'countdowns'};
const clean=o=>{const c={};for(const k in o)if(k[0]!=='_')c[k]=o[k];return c};
function saveDraft(){
 syncD();const k=D._k,arr=S[COLL[k]];
 const req={task:'title',event:'title',habit:'name',goal:'title',note:'text',tpl:'name',cd:'title',lesson:'subj',hw:'text',exam:'title',money:'amt',space:'name'}[k];
 if(!String(D[req]||'').trim()){const i=$('.sheet [data-auto]')||$('.sheet .inp');if(i){i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');i.focus()}return}
 if(v5pre(k)===false)return;
 if(k==='task'){D.title=D.title.trim();D.date=D.date||null;const old=S.tasks.find(x=>x.id===D.id);if(!old||old.date!==D.date||old.time!==D.time)D.notified=false;if(D._new)D.order=maxOrder()+1}
 if(k==='event'){if(!D.end||tmin(D.end)<=tmin(D.start))D.end=mstr(Math.min(tmin(D.start)+60,23*60+59));D.notified=false}
 if(k==='goal'){D.target=Math.max(1,Number(D.target)||1);D.current=Number(D.current)||0;D.step=Math.abs(Number(D.step))||1}
 if(k==='note')D.updated=Date.now();
 if(k==='tpl'){D.name=D.name.trim();D.items=String(D.text||'').split('\n').map(x=>x.trim()).filter(Boolean);if(!D.items.length){const i=$('.sheet textarea');if(i){i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');i.focus()}return}delete D.text}
 if(k==='cd'&&!D.date){const i=$('.sheet [data-m=date]');i&&i.focus();return}
 if(k==='task'){D.est=Number(D.est)||0;if(D.frog)S.tasks.forEach(y=>{if(y.id!==D.id&&y.date===D.date)y.frog=false})}
 if(k==='habit'&&!D.time)D.notified=null;
 const obj=clean(D),i=arr.findIndex(x=>x.id===obj.id);
 if(i>-1){if(k==='task'&&arr[i].done!==obj.done)setDone(arr[i],obj.done);arr[i]=Object.assign(arr[i],obj)}else arr.push(obj);
 v5post(k,obj,i<0);
 save();closeSheet();render();vib(8);
 if(D===null&&i<0)toast({task:'Задача добавлена',event:'Событие добавлено',habit:'Привычка добавлена',goal:'Цель добавлена',note:'Заметка сохранена',tpl:'Шаблон создан',cd:'Отсчёт добавлен',lesson:'Пара добавлена в расписание',hw:'Задание добавлено',exam:'Добавлено',money:'Записано',space:'Пространство создано'}[k]);
 if(k==='task'&&obj.remind&&S.settings.notify!==true&&'Notification' in window)setTimeout(()=>toast('Включите уведомления в настройках, чтобы получать напоминания'),1500);
}
function deleteDraft(){
 const k=D._k,id=D.id;if(!S[COLL[k]].some(x=>x.id===id)){closeSheet();return}
 delItem(COLL[k],id,()=>closeSheet());
}

/* ===== действия ===== */
const A={
 go:el=>go(el.dataset.v),
 share:async()=>{const txt=dayText(todayS());try{if(navigator.share){await navigator.share({title:'План дня',text:txt});return}}catch(e){if(e&&e.name==='AbortError')return}toast(await copyText(txt)?'План дня скопирован — вставьте в любой чат':'Не удалось скопировать')},
 mic:el=>{const i=el.closest('form').q;listen((s,fin)=>{i.value=s;if(fin)i.focus()},el)},
 dumpMic:el=>{const ta=$('.sheet textarea');const base=ta.value.replace(/\s+$/,'');listen(s=>{ta.value=(base?base+'\n':'')+s;D.text=ta.value},el)},
 newDump:()=>NEW.dump(),
 dumpSave:()=>{syncD();const lines=String(D.text||'').split('\n').map(x=>x.replace(/^\s*(?:[•\-–*]|\d+[.)])\s+/,'').trim()).filter(Boolean);if(!lines.length){const i=$('.sheet textarea');i&&i.focus();return}
  const undo=snapT();let o=maxOrder(),n=0;lines.forEach(l=>{const p=parseQuick(l,null);if(p.title){S.tasks.push(mkTask(Object.assign(p,{order:++o})));n++}});closeSheet();save();render();vib(12);toast(`Добавлено ${n} ${plural(n,['задача','задачи','задач'])}`,undo)},
 autoPlan:el=>autoPlan(el.dataset.d),
 shed:el=>shed(el.dataset.d),
 tlNew:(el,e)=>{if(!e||e.target.closest('.tl-b'))return;const r=el.getBoundingClientRect(),y=e.clientY-r.top-10,m=Math.max(0,Math.min(23*60,(+el.dataset.h0)*60+Math.floor(y/52*2)*30));NEW.event({date:el.dataset.d,start:mstr(m)})},
 nowDone:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;setDone(x,true);save();vib([12,50,12]);render(ui.view==='now');afterToggle(true,x)},
 nowSkip:el=>{ui.skip=ui.skip||[];ui.skip.push(el.dataset.id);vib(6);render(ui.view==='now')},
 nowFocus:el=>{const t=T();t.taskId=el.dataset.id;if(!t.running){if(t.mode!=='work'){t.mode='work';t.remain=dur('work')}if(!(t.remain>0))t.remain=dur('work');t.endAt=Date.now()+t.remain*1000;t.running=true;try{unlockAudio()}catch(e){}}save();if(ui.view==='now')render();else go('focus')},
 nowSub:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id),s=x&&x.subtasks.find(y=>y.id===el.dataset.s);if(!s)return;s.done=!s.done;save();vib(6);render()},
 jSet:el=>{const j=J(todayS()),k=el.dataset.k,v=Number(el.dataset.v);j[k]=j[k]===v?0:v;save();vib(6);render()},
 toToday:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;const undo=snapT();x.date=todayS();x.notified=false;save();render();toast('На сегодня',undo)},
 toTomorrow:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;const undo=snapT();x.date=addD(todayS(),1);x.time='';x.notified=false;save();render();toast('Перенесено на завтра',undo)},
 toNoDate:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;const undo=snapT();x.date=null;x.time='';x.frog=false;save();render();toast('Убрано во «Без даты»',undo)},
 allTomorrow:()=>{const t=todayS(),undo=snapT(),a=S.tasks.filter(x=>!x.done&&x.date&&x.date<=t);a.forEach(x=>{x.date=addD(t,1);x.time='';x.notified=false});save();render();toast(`На завтра: ${a.length}`,undo)},
 setFrog:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;const on=!x.frog;S.tasks.forEach(y=>{if(y.date===x.date)y.frog=false});x.frog=on;save();vib(8);render()},
 setEst:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(!x)return;const v=Number(el.dataset.v);x.est=x.est===v?0:v;save();render()},
 planDone:()=>{const t=todayS();J(t).planned=true;save();go('today');if(S.tasks.some(x=>x.date===t&&!x.done&&!x.time))autoPlan(t);else toast('План готов. Хорошего дня ✦')},
 reviewDone:()=>{const t=todayS(),j=J(t);j.reviewed=true;if(j.top&&j.top.trim()){const tm=addD(t,1),p=parseQuick(j.top,tm);if(p.title&&!S.tasks.some(x=>x.title===p.title&&x.date===p.date&&!x.done)){S.tasks.forEach(y=>{if(y.date===p.date)y.frog=false});S.tasks.push(mkTask(Object.assign(p,{frog:true,order:maxOrder()+1})))}}save();go('today');vib([10,40,10]);toast('День завершён. Хорошего отдыха ✦')},
 goOverdue:()=>{ui.f='overdue';go('tasks')},
 mxAdd:el=>{const q=el.dataset.q,t=todayS();NEW.task({do:{prio:3,date:t},plan:{prio:2,date:null},quick:{prio:1,date:t},drop:{prio:0,date:null}}[q])},
 runTpl:el=>{const tp=S.templates.find(x=>x.id===el.dataset.id);if(tp)runTpl(tp,addD(todayS(),+el.dataset.v))},
 editTpl:el=>{const tp=S.templates.find(x=>x.id===el.dataset.id);if(tp)openSheet('tpl',Object.assign(JSON.parse(JSON.stringify(tp)),{text:tp.items.join('\n')}))},
 delTpl:el=>delItem('templates',el.dataset.id),
 addPreset:el=>{const pr=TPL_PRESETS.find(x=>x[0]===el.dataset.v);if(!pr)return;S.templates.push({id:uid(),name:pr[0],items:pr[1].split('\n'),tag:null});save();render();vib(8);toast('Шаблон «'+pr[0]+'» добавлен')},
 editCd:(el,e)=>{if(e&&e.target.closest('[data-a=delCd]'))return;const c=S.countdowns.find(x=>x.id===el.dataset.id);if(c)openSheet('cd',JSON.parse(JSON.stringify(c)))},
 delCd:el=>delItem('countdowns',el.dataset.id),
 setPeak:el=>{S.settings.peak=el.dataset.v;save();render()},
 theme:()=>{S.settings.theme=isDark()?'light':'dark';save();applyTheme();render()},
 toggleTask:el=>toggleTask(el.dataset.id,el.closest('.task')),
 editTask:el=>{const x=S.tasks.find(t=>t.id===el.dataset.id);if(x)openSheet('task',JSON.parse(JSON.stringify(x)))},
 newTask:el=>NEW.task({date:el.dataset.d||null}),
 newEvent:el=>NEW.event({date:el.dataset.d}),
 editEvent:el=>{const x=S.events.find(t=>t.id===el.dataset.id);if(x)openSheet('event',JSON.parse(JSON.stringify(x)))},
 editHabit:el=>{const x=S.habits.find(t=>t.id===el.dataset.id);if(x)openSheet('habit',JSON.parse(JSON.stringify(x)))},
 editGoal:el=>{const x=S.goals.find(t=>t.id===el.dataset.id);if(x)openSheet('goal',JSON.parse(JSON.stringify(x)))},
 editNote:el=>{const x=S.notes.find(t=>t.id===el.dataset.id);if(x)openSheet('note',JSON.parse(JSON.stringify(x)))},
 fab:()=>{const v=ui.view;if(v==='today'||v==='tasks')NEW.task(ui.view==='tasks'?{date:ui.f==='today'?todayS():ui.f==='tomorrow'?addD(todayS(),1):null}:{});else if(v==='calendar')openSheet('choose',{});else if(v==='habits')NEW.habit();else if(v==='goals')NEW.goal();else if(v==='notes')NEW.note();else if(v==='routines')NEW.tpl();else if(v==='countdowns')NEW.cd();else if(v==='matrix')NEW.task({date:null});else openSheet('choose',{})},
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
 goalStep:el=>{const g=S.goals.find(x=>x.id===el.dataset.id);if(!g)return;const was=g.current>=g.target;g.current=Math.max(0,+(g.current+Number(el.dataset.v)*(g.step||1)).toFixed(2));save();render();vib(8);if(!was&&g.current>=g.target){bump('goals');save()}if(!was&&g.current>=g.target)toast('Цель достигнута: '+g.title+' ✦')},
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
 tagDel:el=>{const g=el.dataset.v,n=S.tasks.filter(x=>x.tag===g).length;ask(`Удалить тег #${g}?`,n?`У ${n} ${plural(n,['задачи','задач','задач'])} тег будет снят, сами задачи останутся.`:'Тег ни к чему не привязан.','Удалить',()=>{const i=S.tags.indexOf(g),ids=S.tasks.filter(x=>x.tag===g).map(x=>x.id);S.tags=S.tags.filter(x=>x!==g);S.tasks.forEach(x=>{if(x.tag===g)x.tag=null});if(ui.tag===g)ui.tag=null;save();render();toast('Тег удалён',()=>{S.tags.splice(i,0,g);S.tasks.forEach(x=>{if(ids.includes(x.id))x.tag=g});save();render()})})},
 delTask:el=>delItem('tasks',el.dataset.id),
 delEvent:el=>delItem('events',el.dataset.id),
 delHabit:el=>delItem('habits',el.dataset.id),
 delGoal:el=>delItem('goals',el.dataset.id),
 delNote:el=>delItem('notes',el.dataset.id),
 cfOk:()=>{const f=cfFn;cfClose();f&&f()},
 cfNo:()=>cfClose(),
 selMode:()=>{ui.sel=ui.sel?null:new Set();render()},
 selTog:el=>{const id=el.dataset.id;if(ui.sel.has(id))ui.sel.delete(id);else ui.sel.add(id);vib(5);render()},
 selAll:()=>{const v=filtered().map(x=>x.id);if(ui.sel.size>=v.length)ui.sel.clear();else v.forEach(id=>ui.sel.add(id));render()},
 selDel:()=>{const ids=[...ui.sel];if(!ids.length)return;ask(`Удалить ${ids.length} ${plural(ids.length,['задачу','задачи','задач'])}?`,'Действие можно отменить в течение нескольких секунд.','Удалить',()=>{const snap=JSON.stringify(S.tasks);S.tasks=S.tasks.filter(x=>!ids.includes(x.id));ui.sel=null;save();render();vib(12);toast(`Удалено: ${ids.length}`,()=>{S.tasks=JSON.parse(snap);save();render()})})},
 selDone:()=>{const ids=[...ui.sel];if(!ids.length)return;const snap=JSON.stringify({t:S.tasks,l:S.log});let n=0;S.tasks.filter(x=>ids.includes(x.id)&&!x.done).forEach(x=>{setDone(x,true);n++});ui.sel=null;save();render();toast(`Выполнено: ${n}`,()=>{const o=JSON.parse(snap);S.tasks=o.t;S.log=o.l;save();render()})},
 delDone:el=>{const d=el.dataset.d,ids=S.tasks.filter(x=>x.done&&(!d||x.date===d)).map(x=>x.id);if(!ids.length)return;ask(`Удалить выполненные (${ids.length})?`,d?'Будут удалены выполненные задачи этого дня. Статистика сохранится.':'Будут удалены все выполненные задачи. Статистика сохранится.','Удалить',()=>{const snap=JSON.stringify(S.tasks);S.tasks=S.tasks.filter(x=>!ids.includes(x.id));save();render();toast(`Удалено: ${ids.length}`,()=>{S.tasks=JSON.parse(snap);save();render()})})},
 export:()=>{const data=JSON.stringify(Object.assign({app:'ritm',exported:new Date().toISOString()},S),null,2),b=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ritm-backup-${todayS()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast('Резервная копия сохранена')},
 import:()=>$('#importFile').click(),
 install:async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice.catch(()=>{});installEvt=null;render()},
 clearDemo:()=>ask('Удалить все данные?','Все задачи, события, привычки, цели и заметки. Настройки и теги сохранятся.','Удалить всё',()=>{const snap=JSON.stringify(S);const st=S.settings,tg=S.tags;S=defaults();S.settings=st;S.tags=tg;S.clean=2;save();render();toast('Чистый лист',()=>{S=JSON.parse(snap);save();render()})}),
 resetAll:()=>ask('Сбросить приложение?','Данные и настройки вернутся к исходному пустому состоянию.','Сбросить',()=>{const snap=JSON.stringify(S);localStorage.removeItem(KEY);S=load();save();applyTheme();ui.view='today';render(true);toast('Приложение сброшено',()=>{S=JSON.parse(snap);save();applyTheme();render(true)})}),
 undo:()=>{if(undoFn){const f=undoFn;undoFn=null;f()}$('#toast').classList.remove('show')},
 sheetClose:()=>closeSheet(),
 dSet:el=>{const k=el.dataset.k;let v=el.dataset.v;if(k==='prio'||k==='est')v=Number(v);if(k==='energy')v=v||'';if(k==='tag'||k==='color')v=v||null;if(k==='date')v=v||null;syncD();D[k]=v;if(k==='date'){const i=$('.sheet [data-m=date]');if(i)i.value=v||''}renderSheet()},
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
let jT;
document.addEventListener('input',e=>{
 if(e.target.dataset.j){J(todayS())[e.target.dataset.j]=e.target.value;clearTimeout(jT);jT=setTimeout(save,400);return}
 const k=e.target.dataset.in;if(!k)return;ui[k]=e.target.value;
 if(k==='q')$('#tlist').innerHTML=tasksList();if(k==='nq')$('#nlist').innerHTML=notesList();
});
document.addEventListener('change',e=>{
 const el=e.target,k=el.dataset.ch;
 if(k==='sort'){ui.sort=el.value;S.settings.sort=el.value;save();render()}
 if(k==='tmTask'){T().taskId=el.value||null;save()}
 if(k==='dayT'&&el.value){S.settings[el.dataset.k]=el.value;if(tmin(S.settings.dayEnd)<=tmin(S.settings.dayStart)){toast('Конец дня должен быть позже начала')}save();toast('Сохранено')}
 if(k==='cap'){S.settings.capacity=Math.max(1,Math.min(16,Math.round(Number(el.value)||6)));el.value=S.settings.capacity;save();toast('Сохранено')}
 if(k==='pomo'){const v=Math.max(1,Math.min(el.dataset.k==='rounds'?12:120,Math.round(Number(el.value)||1)));S.settings.pomo[el.dataset.k]=v;const t=T();if(!t.running)t.remain=dur(t.mode);save();toast('Сохранено')}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&cfFn){cfClose();return}if(e.key==='Escape'&&D){closeSheet();return}
 if(e.key==='Enter'&&e.target.matches('[data-sub]')){e.preventDefault();const v=e.target.value.trim();if(v){syncD();D.subtasks.push({id:uid(),t:v,done:false});renderSheet();setTimeout(()=>{const n=$('.sheet [data-sub]');n&&n.focus()},10)}}
 if(e.key==='Enter'&&D&&e.target.matches('.inp.big')){e.preventDefault();saveDraft()}
});
$('#importFile').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const d=JSON.parse(await f.text());if(!d||!Array.isArray(d.tasks))throw new Error('format');
  ask('Заменить данные?','Текущие данные будут заменены данными из файла.','Заменить',()=>{const snap=JSON.stringify(S);const def=defaults();delete d.app;delete d.exported;purgeDemo(d);S=Object.assign(def,d,{settings:Object.assign(def.settings,d.settings||{})});save();applyTheme();render(true);toast('Данные импортированы',()=>{S=JSON.parse(snap);save();applyTheme();render(true)})});
 }catch(err){toast('Не удалось прочитать файл')}finally{e.target.value=''}
});

/* ===== свайпы и перетаскивание ===== */
let sw=null,dr=null;
document.addEventListener('pointerdown',e=>{
 const h=e.target.closest('.handle');if(h){startDrag(e,h.closest('.task'));return}
 const ti=e.target.closest('.task-in');if(ti&&!ui.sel&&!e.target.closest('.chk,.tdel'))sw={el:ti,li:ti.closest('.task'),x:e.clientX,y:e.clientY,dx:0,on:false,dead:false};
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
 const td=todayS(),nm=nowMin();S.habits.forEach(h=>{if(h.time&&!h.log[td]&&h.notified!==td&&nm>=tmin(h.time)){h.notified=td;ch=true;if(nm-tmin(h.time)<120){notify('Привычка',`${h.icon} ${h.name} — самое время`);toast('Пора: '+h.icon+' '+h.name)}}});
 if(ch)save();
}
setInterval(checkReminders,20000);

/* ===== новые возможности: ритуалы, тайм-блоки, энергия, матрица, шаблоны, отсчёты, достижения ===== */
Object.assign(IC,{
 bolt:'<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
 mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
 share:'<path d="M12 15V4M8 7.5L12 3.5l4 4M6 11v8.5h12V11"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
 dump:'<path d="M4 6h16M4 10.5h11M4 15h14M4 19.5h8"/>',
 sunrise:'<path d="M3.5 18.5h17M7 15a5 5 0 0 1 10 0M12 4v5M9.5 6.5L12 4l2.5 2.5M4.8 10.2l1.4 1.4M19.2 10.2l-1.4 1.4"/>',
 sunset:'<path d="M3.5 18.5h17M7 15a5 5 0 0 1 10 0M12 4v5M9.5 6.5L12 9l2.5-2.5M4.8 10.2l1.4 1.4M19.2 10.2l-1.4 1.4"/>',
 week:'<rect x="4" y="5" width="16" height="15" rx="3.5"/><path d="M4 10h16M8 14.5h1M11.5 14.5h1M15 14.5h1M8 17.5h1"/>',
 copy:'<rect x="8" y="8" width="11" height="12" rx="2.5"/><path d="M5 15.5V6.5A2.5 2.5 0 0 1 7.5 4h8"/>',
 hourglass:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 4.5 8 5 8 8.5s-8 4-8 8.5M16 3.5c0 4.5-8 5-8 8.5s8 4 8 8.5"/>',
 medal:'<circle cx="12" cy="14.5" r="5.5"/><path d="M9 9.6L6.5 3.5h3L12 8l2.5-4.5h3L15 9.6"/>',
 now:'<circle cx="12" cy="12" r="8"/><path d="M10.3 8.6l4.8 3.4-4.8 3.4z"/>',
 edit:'<path d="M5 19l1-4L16 5l3 3L9 18z"/>'
});
const fmtDur=m=>{m=Math.round(m||0);if(m<60)return m+' мин';const h=Math.floor(m/60),r=m%60;return h+' ч'+(r?' '+r+' мин':'')};
const shortDur=m=>m<60?m+'м':(m%60?(m/60).toFixed(1).replace('.',','):m/60)+'ч';
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const J=d=>S.journal[d]||(S.journal[d]={});
const PEAK={morning:[540,720],day:[720,960],evening:[1020,1260]};
const inPeak=m=>{const p=PEAK[S.settings.peak]||PEAK.morning;return m>=p[0]&&m<p[1]};
const ST=k=>(S.stats||{})[k]||0;
const bump=k=>{S.stats=S.stats||{};S.stats[k]=(S.stats[k]||0)+1};
const snapT=()=>{const s=JSON.stringify(ALL('tasks'));return()=>{S.tasks=JSON.parse(s);save();render()}};
const dS=()=>tmin(S.settings.dayStart)??540, dE=()=>tmin(S.settings.dayEnd)??1260;

/* --- нагрузка дня и автопланирование --- */
function evBusy(date){return ALL('events').filter(e=>e.date===date&&e.start).map(e=>[tmin(e.start),Math.max(tmin(e.end||e.start)||0,tmin(e.start)+15)]).concat(lessonsOn(date,ALL('lessons')).map(l=>[tmin(l.start),Math.max(tmin(l.end)||0,tmin(l.start)+15)]))}
function dayLoad(date){
 const t=todayS(),de=dE(),from=date===t?Math.max(dS(),nowMin()):dS();
 const open=S.tasks.filter(x=>x.date===date&&!x.done),plan=open.reduce((a,x)=>a+(x.est||30),0);
 const doneMin=S.tasks.filter(x=>x.date===date&&x.done).reduce((a,x)=>a+(x.est||0),0);
 const ev=evBusy(date).reduce((a,[s,e])=>a+Math.max(0,Math.min(e,de)-Math.max(s,from)),0);
 const en=(S.journal[date]||{}).energy,low=!!en&&en<=2;
 const cap=S.settings.capacity*60*(low?.7:1)-doneMin,win=Math.max(0,de-from)-ev;
 const avail=date<t?0:Math.max(0,Math.round(Math.min(cap,win)));
 return{plan,avail,over:plan-avail,low,count:open.length,noEst:open.filter(x=>!x.est).length};
}
function freeSlots(date,from){
 const de=dE(),busy=evBusy(date).concat(ALL('tasks').filter(x=>x.date===date&&x.time&&!x.done).map(x=>[tmin(x.time),tmin(x.time)+(x.est||30)])).sort((a,b)=>a[0]-b[0]);
 const out=[];let c=from;for(const[s,e]of busy){if(s>c)out.push([c,Math.min(s,de)]);c=Math.max(c,e)}if(c<de)out.push([c,de]);return out.filter(([s,e])=>e-s>=10);
}
function autoPlan(date){
 date=date||todayS();const t=todayS();if(date<t)return;
 let from=dS();if(date===t)from=Math.max(from,Math.ceil((nowMin()+5)/15)*15);
 const left=S.tasks.filter(x=>x.date===date&&!x.done&&!x.time);
 if(!left.length){toast('Все задачи дня уже стоят во времени');return}
 const undo=snapT(),score=(x,m)=>(x.frog?1000:0)+x.prio*10+(x.energy==='hi'?(inPeak(m)?8:-8):x.energy==='lo'?(inPeak(m)?-4:4):0)-x.order*1e-4;let placed=0;
 for(const sl of freeSlots(date,from)){let c=sl[0];
  while(left.length){const fit=left.filter(x=>(x.est||30)<=sl[1]-c);if(!fit.length)break;fit.sort((a,b)=>score(b,c)-score(a,c));const x=fit[0];
   x.time=mstr(c);x.notified=false;x.auto=true;c=Math.ceil((c+(x.est||30)+5)/5)*5;left.splice(left.indexOf(x),1);placed++}}
 save();render();vib([10,40,10]);
 toast(placed?`Распланировано: ${placed}${left.length?` · не влезло: ${left.length}`:''}`:'Свободного времени сегодня не осталось',placed?undo:null);
}
function shed(date){
 const L=dayLoad(date);if(L.over<=0)return;const undo=snapT();let over=L.over,n=0;
 const c=S.tasks.filter(x=>x.date===date&&!x.done&&!x.frog).sort((a,b)=>a.prio-b.prio||(b.est||30)-(a.est||30));
 for(const x of c){if(over<=0)break;x.date=addD(date,1);x.time='';x.notified=false;over-=(x.est||30);n++}
 save();render();toast(`На завтра: ${n} ${plural(n,['задача','задачи','задач'])}`,undo);
}
function capCard(date){
 const L=dayLoad(date);if(!L.count)return'';
 const pct=L.avail?Math.min(100,Math.round(L.plan/L.avail*100)):100,ov=L.over>0,unt=S.tasks.filter(x=>x.date===date&&!x.done&&!x.time).length;
 return`<div class="cap${ov?' ov':''}"><div class="cap-top">${I('hourglass')}<span>План <b>${fmtDur(L.plan)}</b> <span class="muted">из ${fmtDur(L.avail)} свободных${L.low?' · бережный режим':''}</span></span></div><div class="g-bar cap-bar"><i style="width:${pct}%"></i></div>${ov?`<div class="cap-w">Перегруз на ${fmtDur(L.over)} — лучше перенести часть.</div>`:''}<div class="cap-act">${unt&&date>=todayS()?`<button class="tb-btn" data-a="autoPlan" data-d="${date}">${I('spark')} Распланировать день</button>`:''}${ov?`<button class="tb-btn red" data-a="shed" data-d="${date}">Лишнее на завтра</button>`:''}</div>${L.noEst?`<div class="cap-n">Без оценки: ${L.noEst} — считаю по 30 мин</div>`:''}</div>`;
}

/* --- «Сейчас»: одна следующая задача --- */
function nextTask(){
 const t=todayS(),m=nowMin(),c=S.tasks.filter(x=>!x.done&&x.date&&x.date<=t);if(!c.length)return null;
 const sc=x=>(x.frog?1e4:0)+(x.time?(tmin(x.time)<=m+15?5e3-Math.abs(tmin(x.time)-m):-2e3):0)+(x.date<t?300:0)+x.prio*100+(x.energy==='hi'?(inPeak(m)?40:-40):x.energy==='lo'?(inPeak(m)?-20:20):0)-x.order*1e-3;
 c.sort((a,b)=>sc(b)-sc(a));ui.skip=ui.skip||[];const r=c.filter(x=>!ui.skip.includes(x.id));if(!r.length)ui.skip=[];return r[0]||c[0];
}
function taskMeta(x){const s=x.subtasks.length?`${x.subtasks.filter(y=>y.done).length}/${x.subtasks.length} подзадач`:'';return[x.frog?'🐸 лягушка дня':'',x.time?'в '+x.time:'',x.est?fmtDur(x.est):'',x.energy==='hi'?'тяжёлая':x.energy==='lo'?'лёгкая':'',s].filter(Boolean).join(' · ')}
function nowCard(){
 const x=nextTask();if(!x)return'';const m=taskMeta(x);
 return`<section class="card now"><div class="now-top"><span class="eyebrow" style="margin:0">Сейчас</span><button class="nlink" data-a="go" data-v="now">Только эта задача ${I('chevR')}</button></div><div class="now-t" data-a="editTask" data-id="${x.id}">${esc(x.title)}</div>${m?`<div class="now-m">${m}</div>`:''}<div class="now-b"><button class="btn pri" data-a="nowDone" data-id="${x.id}">${I('check')} Готово</button><button class="btn" data-a="nowFocus" data-id="${x.id}">${I('play')} Фокус</button><button class="ib" data-a="nowSkip" data-id="${x.id}" aria-label="Другая задача">${I('chevR')}</button></div></section>`;
}
V.now=()=>{
 const x=nextTask(),tm=S.timer&&S.timer.running,left=S.tasks.filter(y=>!y.done&&y.date&&y.date<=todayS()).length;
 if(!x)return`${back('today','Сегодня')}<div class="nowfull">${empty('Пусто — и это прекрасно','<br>На сегодня задач нет. Отдохните или добавьте новую.')}</div>`;
 return`${back('today','Сегодня')}<div class="nowfull"><div class="eyebrow">Одна задача · сейчас</div><h1 class="display now-h" data-a="editTask" data-id="${x.id}">${esc(x.title)}</h1><div class="now-m">${taskMeta(x)}</div>
 ${x.notes?`<p class="now-n">${esc(x.notes)}</p>`:''}
 ${x.subtasks.length?`<div class="subs now-subs">${x.subtasks.map(s=>`<div class="sub${s.done?' done':''}"><button class="chk" data-a="nowSub" data-id="${x.id}" data-s="${s.id}">${I('check')}</button><span>${esc(s.t)}</span></div>`).join('')}</div>`:''}
 <div class="now-timer" data-a="go" data-v="focus">${tm?`${I('timer')}<span id="pill-t">${fmtSec(remain())}</span><span class="muted">· ${MODES[S.timer.mode]}</span>`:''}</div>
 <div class="now-b col"><button class="btn acc" data-a="nowDone" data-id="${x.id}">${I('check')} Готово, дальше</button><div class="btnrow" style="margin:0"><button class="btn" data-a="nowFocus" data-id="${x.id}">${I('play')} ${tm?'Таймер':'Фокус '+S.settings.pomo.work+' мин'}</button><button class="btn" data-a="nowSkip" data-id="${x.id}">Другая ${I('chevR')}</button></div></div>
 <p class="hint" style="text-align:center;margin-top:18px">Остальное подождёт · всего на сегодня: ${left}</p></div>`;
};

/* --- ритуалы --- */
function ritualCard(){
 const t=todayS(),h=new Date().getHours(),j=S.journal[t]||{};
 if(h>=18&&!j.reviewed)return`<button class="ritual" data-a="go" data-v="review"><span class="ti">${I('sunset')}</span><span><b>Подвести итоги дня</b><small>2 минуты: сделанное, хвосты на завтра, настроение</small></span>${I('chevR')}</button>`;
 if(h>=4&&h<14&&!j.planned)return`<button class="ritual" data-a="go" data-v="plan"><span class="ti">${I('sunrise')}</span><span><b>Спланировать день</b><small>Энергия, лягушка, время — 3 минуты</small></span>${I('chevR')}</button>`;
 return'';
}
const ENERGY=['Без сил','Мало','Ровно','Бодро','Огонь'],MOOD=['Тяжело','Так себе','Нормально','Хорошо','Отлично'];
const scale=(k,labels,cur)=>`<div class="scale">${labels.map((l,i)=>`<button class="${cur===i+1?'on':''}" data-a="jSet" data-k="${k}" data-v="${i+1}"><b>${i+1}</b>${l}</button>`).join('')}</div>`;
const step=(n,title,sub,body)=>`<section class="step"><h3><i>${n}</i>${title}</h3>${sub?`<p>${sub}</p>`:''}${body}</section>`;
const prow=(x,btns)=>`<div class="prow"><span data-a="editTask" data-id="${x.id}">${esc(x.title)}<small>${[x.date?fmtDate(x.date):'без даты',x.tag?'#'+esc(x.tag):''].filter(Boolean).join(' · ')}</small></span>${btns}</div>`;
V.plan=()=>{
 const t=todayS(),j=S.journal[t]||{},tails=S.tasks.filter(x=>!x.done&&x.date&&x.date<t).sort(byDate),inbox=S.tasks.filter(x=>!x.done&&!x.date).sort(byOrder).slice(0,6),day=S.tasks.filter(x=>x.date===t&&!x.done).sort(byOrder);
 return`${back('today','Сегодня')}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Утренний ритуал · ${fmtLong(t).toLowerCase()}</div><h1 class="display">План <em>дня</em></h1></div></header>
 ${step(1,'Как ваша энергия?','Если сил мало — Ритм уменьшит план на 30% и не будет ставить тяжёлое на спад.',scale('energy',ENERGY,j.energy))}
 ${step(2,'Хвосты',tails.length?'Что не успели раньше. Возьмите только то, что реально сделать.':'',tails.length?`<div>${tails.slice(0,8).map(x=>prow(x,`<button class="tb-btn" data-a="toToday" data-id="${x.id}">Сегодня</button><button class="tb-btn" data-a="toTomorrow" data-id="${x.id}">Завтра</button>`)).join('')}</div><div class="cap-act"><button class="tb-btn on" data-a="moveOverdue">Все на сегодня</button></div>`:'<p class="okline">Хвостов нет ✦</p>')}
 ${inbox.length?step(3,'Из входящих','Задачи без даты — возможно, им пора.',inbox.map(x=>prow(x,`<button class="tb-btn" data-a="toToday" data-id="${x.id}">+ Сегодня</button>`)).join('')):''}
 ${step(inbox.length?4:3,'Лягушка дня 🐸','Самое важное и неприятное. Сделаете первым — день уже удался.',day.length?`<div class="chips wrap">${day.map(x=>`<button class="chip${x.frog?' on':''}" data-a="setFrog" data-id="${x.id}">${x.frog?'🐸 ':''}${esc(x.title)}</button>`).join('')}</div>`:`<p class="okline">Пока нет задач на сегодня — добавьте ниже.</p>`)}
 ${step(inbox.length?5:4,'Сколько займёт?','Честные оценки защищают от перегруза.',`${day.length?day.map(x=>`<div class="prow"><span data-a="editTask" data-id="${x.id}">${esc(x.title)}</span><div class="estrow">${[15,30,60,90].map(m=>`<button class="mini${x.est===m?' on':''}" data-a="setEst" data-id="${x.id}" data-v="${m}">${shortDur(m)}</button>`).join('')}</div></div>`).join(''):''}${qaForm(t,'Ещё задача на сегодня… «~30м»')}${capCard(t)}`)}
 <button class="btn acc wide-cta" data-a="planDone">${I('spark')} Распланировать и начать день</button>
 <p class="hint" style="text-align:center">Задачи без времени встанут в свободные окна между событиями: тяжёлые — на пик энергии (${{morning:'утро',day:'день',evening:'вечер'}[S.settings.peak]}), лягушка — первой.</p>`;
};
V.review=()=>{
 const t=todayS(),j=S.journal[t]||{},done=S.tasks.filter(x=>x.done&&x.doneAt&&ymd(new Date(x.doneAt))===t),open=S.tasks.filter(x=>!x.done&&x.date&&x.date<=t).sort(byDate),fm=focusMin(t),hd=S.habits.filter(h=>h.log[t]).length;
 return`${back('today','Сегодня')}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Вечерний ритуал · ${fmtLong(t).toLowerCase()}</div><h1 class="display">Итоги <em>дня</em></h1></div></header>
 <div class="kpis three-k"><div class="kpi"><div class="v">${done.length}</div><div class="l">сделано</div></div><div class="kpi"><div class="v">${fm}<small> мин</small></div><div class="l">фокуса</div></div><div class="kpi"><div class="v">${hd}<small>/${S.habits.length}</small></div><div class="l">привычек</div></div></div>
 ${done.length?`<h3 class="sec">Получилось <span>${done.length}</span></h3><div class="card donel">${done.slice(0,10).map(x=>`<div>${I('check')}<span>${esc(x.title)}</span></div>`).join('')}${done.length>10?`<div class="muted">и ещё ${done.length-10}</div>`:''}</div>`:''}
 ${step(1,'Хвосты',open.length?'Перенесите честно — без чувства вины.':'',open.length?`${open.map(x=>prow(x,`<button class="tb-btn" data-a="toTomorrow" data-id="${x.id}">Завтра</button><button class="tb-btn" data-a="toNoDate" data-id="${x.id}">Позже</button>`)).join('')}<div class="cap-act"><button class="tb-btn on" data-a="allTomorrow">Всё на завтра</button></div>`:'<p class="okline">Всё закрыто ✦</p>')}
 ${step(2,'Настроение','',scale('mood',MOOD,j.mood))}
 ${step(3,'Энергия к вечеру','',scale('eve',ENERGY,j.eve))}
 ${step(4,'Пара строк себе','Что получилось? Что мешало? Чему научился?',`<textarea class="inp" rows="3" data-j="text" placeholder="Сегодня…">${esc(j.text||'')}</textarea>`)}
 ${step(5,'Главное на завтра 🐸','Станет лягушкой дня — завтра начнёте с неё.',`<input class="inp" data-j="top" placeholder="Например: «Сдать отчёт ~1ч»" value="${esc(j.top||'')}">`)}
 <button class="btn acc wide-cta" data-a="reviewDone">${I('moon')} Завершить день</button>`;
};
function rangeSum(from,n,f){let s=0;for(let i=0;i<n;i++)s+=f(addD(from,i))||0;return s}
const delta=(a,b,u='')=>{const d=a-b;return d===0?'<span class="dl">как на прошлой</span>':`<span class="dl ${d>0?'up':'down'}">${d>0?'+':'−'}${Math.abs(d)}${u} к прошлой</span>`};
V.week=()=>{
 const t=todayS(),a=addD(t,-6),p=addD(t,-13),done=rangeSum(a,7,d=>S.log[d]),pdone=rangeSum(p,7,d=>S.log[d]),fm=rangeSum(a,7,focusMin),pfm=rangeSum(p,7,focusMin);
 const hr=S.habits.length?Math.round(rangeSum(a,7,d=>S.habits.filter(h=>h.log[d]).length)/(S.habits.length*7)*100):0;
 const md=[...Array(7)].map((_,i)=>(S.journal[addD(a,i)]||{}).mood).filter(Boolean),mood=md.length?(md.reduce((x,y)=>x+y,0)/md.length).toFixed(1).replace('.',','):'—';
 let best=null;for(let i=0;i<7;i++){const d=addD(a,i);if((S.log[d]||0)>0&&(!best||S.log[d]>S.log[best]))best=d}
 const stuck=S.tasks.filter(x=>!x.done&&x.date&&diffD(x.date,t)>3).length,next=S.tasks.filter(x=>!x.done&&x.date&&x.date>t&&x.date<=addD(t,7)),nextMin=next.reduce((s,x)=>s+(x.est||30),0);
 const refl=[...Array(7)].map((_,i)=>addD(t,-i)).filter(d=>(S.journal[d]||{}).text);
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${fmtDate(a)} — ${fmtDate(t).toLowerCase()}</div><h1 class="display">Обзор <em>недели</em></h1></div></header>
 <div class="kpis"><div class="kpi"><div class="v">${done}</div><div class="l">задач сделано</div>${delta(done,pdone)}</div><div class="kpi"><div class="v">${fm}<small> мин</small></div><div class="l">фокуса</div>${delta(fm,pfm,' мин')}</div><div class="kpi"><div class="v">${hr}<small>%</small></div><div class="l">выполнение привычек</div></div><div class="kpi"><div class="v">${mood}</div><div class="l">среднее настроение</div></div></div>
 <h3 class="sec">Выполнено по дням</h3><div class="card">${barChart(7,d=>S.log[d]||0)}</div>
 <h3 class="sec">Настроение по дням</h3><div class="card">${barChart(7,d=>(S.journal[d]||{}).mood||0)}</div>
 <h3 class="sec">Выводы</h3><div class="card insights">
  <div>${I('fire')}<span>${best?`Самый продуктивный день — <b>${WDF[pd(best).getDay()]}</b> (${S.log[best]})`:'Пока нет выполненных задач за неделю'}</span></div>
  <div>${I('hourglass')}<span>Следующие 7 дней: <b>${next.length}</b> ${plural(next.length,['задача','задачи','задач'])} ≈ ${fmtDur(nextMin)}</span></div>
  <div>${I('flag')}<span>${stuck?`Застряло дольше 3 дней: <b>${stuck}</b>`:'Застрявших задач нет ✦'}</span>${stuck?`<button class="tb-btn" data-a="goOverdue">Разобрать</button>`:''}</div>
 </div>
 ${refl.length?`<h3 class="sec">Ваши заметки за неделю</h3><div class="hgrid">${refl.map(d=>`<div class="card refl"><div class="eyebrow">${fmtLong(d)}${S.journal[d].mood?' · '+MOOD[S.journal[d].mood-1].toLowerCase():''}</div>${esc(S.journal[d].text)}</div>`).join('')}</div>`:''}
 <p class="hint" style="text-align:center;margin:20px 0">Подводите итоги каждый вечер — здесь появятся настроение и выводы.</p>`;
};

/* --- матрица Эйзенхауэра --- */
const MXQ=[['do','Сделать сейчас','срочно и важно','var(--red)'],['plan','Запланировать','важно, не срочно','var(--acc)'],['quick','Быстро или делегировать','срочно, не важно','var(--p2)'],['drop','Отложить или убрать','не срочно, не важно','var(--ink3)']];
function quad(x){const t=todayS(),u=!!x.date&&x.date<=addD(t,1),i=x.prio>=2||x.frog;return u&&i?'do':i?'plan':u?'quick':'drop'}
V.matrix=()=>{
 const open=S.tasks.filter(x=>!x.done);
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${open.length} ${plural(open.length,['открытая задача','открытые задачи','открытых задач'])}</div><h1 class="display">Матрица</h1></div></header>
 <div class="mx">${MXQ.map(([q,n,s,c])=>{const it=open.filter(x=>quad(x)===q).sort(byDate);return`<div class="mxq" style="--c:${c}"><h4>${n}<span>${it.length}</span></h4><small>${s}</small>${it.slice(0,6).map(x=>`<div class="mxi"><button class="c" data-a="toggleTask" data-id="${x.id}" aria-label="Готово"></button><span data-a="editTask" data-id="${x.id}">${x.frog?'🐸 ':''}${esc(x.title)}</span></div>`).join('')}${it.length>6?`<div class="mxmore">ещё ${it.length-6}</div>`:''}<button class="add" data-a="mxAdd" data-q="${q}">+ Добавить</button></div>`}).join('')}</div>
 <p class="hint">«Важно» — приоритет «Средний» и выше или лягушка. «Срочно» — срок сегодня, завтра или просрочен. Меняйте приоритет и дату — задача переедет сама.</p>`;
};

/* --- шаблоны и рутины --- */
const TPL_PRESETS=[
 ['Утренняя рутина','Стакан воды ~5м\nЗарядка ~15м\nДуш ~10м\nЗавтрак без телефона ~20м\nПросмотреть план дня ~5м'],
 ['Вечерняя рутина','Разобрать входящие ~10м\nПодготовить вещи на завтра ~10м\nПодвести итоги дня ~5м\nЧтение ~20м\nОтбой без экрана'],
 ['Уборка дома','Пропылесосить ~30м #Дом\nПротереть пыль ~15м #Дом\nЗапустить стирку ~10м #Дом\nВынести мусор ~5м #Дом'],
 ['Сборы в поездку','Документы и билеты\nЗарядки и наушники\nАптечка\nОдежда по погоде\nКлючи и кошелёк'],
 ['Старт недели','Обзор прошлой недели ~15м\nТри главные цели недели ~10м\nРасставить задачи по дням ~15м\nЗаписать встречи в календарь ~10м']
];
const tplEst=tp=>tp.items.reduce((a,l)=>a+(parseQuick(l,null,true).est||0),0);
V.routines=()=>{
 const have=S.templates.map(x=>x.name),sug=TPL_PRESETS.filter(([n])=>!have.includes(n));
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Рутины в одно касание</div><h1 class="display">Шаблоны</h1></div></header>
 ${S.templates.length?`<div class="hgrid">${S.templates.map(tp=>{const e=tplEst(tp);return`<div class="card tpl"><div class="g-top"><div class="g-title" data-a="editTpl" data-id="${tp.id}">${esc(tp.name)}<div class="g-sub">${tp.items.length} ${plural(tp.items.length,['пункт','пункта','пунктов'])}${e?' · ≈ '+fmtDur(e):''}${tp.tag?' · #'+esc(tp.tag):''}</div></div><button class="cdel st" data-a="editTpl" data-id="${tp.id}" aria-label="Изменить">${I('edit')}</button><button class="cdel st" data-a="delTpl" data-id="${tp.id}" aria-label="Удалить шаблон">${I('trash')}</button></div><div class="tp-items">${tp.items.slice(0,4).map(l=>'· '+esc(parseQuick(l,null,true).title)).join('<br>')}${tp.items.length>4?'<br>…':''}</div><div class="btnrow" style="margin:0"><button class="btn pri" data-a="runTpl" data-id="${tp.id}" data-v="0">${I('play')} На сегодня</button><button class="btn" data-a="runTpl" data-id="${tp.id}" data-v="1">На завтра</button></div></div>`}).join('')}</div>`
 :empty('Рутины без усилий','<br>Соберите повторяющиеся списки и запускайте их одним касанием.')}
 ${sug.length?`<h3 class="sec">Готовые идеи</h3><div class="chips wrap">${sug.map(([n])=>`<button class="chip" data-a="addPreset" data-v="${esc(n)}">+ ${esc(n)}</button>`).join('')}</div>`:''}`;
};
F.tpl=()=>`<h2 class="sh-title">${D._new?'Новый шаблон':'Шаблон'}</h2>
 <div class="field"><input class="inp big" data-m="name" data-auto placeholder="Например, «Утро»" value="${esc(D.name)}" maxlength="60"></div>
 <div class="field"><label>Пункты · по одному в строке</label><textarea class="inp" rows="7" data-m="text" placeholder="Зарядка ~15м&#10;Душ ~10м&#10;Завтрак">${esc(D.text)}</textarea></div>
 <div class="field"><label>Тег для всех задач</label><div class="chips" style="margin:0 -20px">${['',...S.tags].map(g=>`<button class="chip${(D.tag||'')===g?' on':''}" data-a="dSet" data-k="tag" data-v="${esc(g)}">${g?'#'+esc(g):'Без тега'}</button>`).join('')}</div></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Создать':'Сохранить'}</button></div>${delBtn('шаблон')}`;
function runTpl(tp,date){
 const undo=snapT();let o=maxOrder();const made=tp.items.map(l=>{const p=parseQuick(l,date);if(!p.title)return null;if(tp.tag&&!p.tag)p.tag=tp.tag;const x=mkTask(Object.assign(p,{order:++o}));S.tasks.push(x);return x}).filter(Boolean);
 bump('tpl');save();render();vib(12);toast(`«${tp.name}»: ${made.length} ${plural(made.length,['задача','задачи','задач'])} на ${fmtDate(date).toLowerCase()}`,undo);
}

/* --- отсчёты --- */
function cdNext(c){const t=todayS();if(!c.yearly)return c.date;let d=t.slice(0,4)+c.date.slice(4);if(d<t)d=String(+t.slice(0,4)+1)+c.date.slice(4);return d}
const cdLeft=c=>diffD(todayS(),cdNext(c));
function cdChips(){
 const a=S.countdowns.filter(c=>cdLeft(c)>=0).sort((x,y)=>cdLeft(x)-cdLeft(y)).slice(0,3);if(!a.length)return'';
 return`<div class="cdchips">${a.map(c=>{const n=cdLeft(c);return`<button class="cdchip" style="--c:${c.color}" data-a="go" data-v="countdowns"><b>${n||'✦'}</b><span>${n?plural(n,['день','дня','дней'])+' до ':'Сегодня: '}${esc(c.title)}</span></button>`}).join('')}</div>`;
}
V.countdowns=()=>{
 const a=S.countdowns.slice().sort((x,y)=>{const p=cdLeft(x),q=cdLeft(y);return(p<0)-(q<0)||Math.abs(p)-Math.abs(q)});
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Важные даты</div><h1 class="display">Отсчёты</h1></div></header>
 ${a.length?`<div class="hgrid">${a.map(c=>{const n=cdLeft(c),d=cdNext(c);return`<div class="card cd${n<0?' past':''}" style="--c:${c.color}" data-a="editCd" data-id="${c.id}"><div class="n">${n===0?'✦':Math.abs(n)}</div><div class="cd-b"><b>${esc(c.title)}</b><span>${n===0?'Сегодня!':n>0?plural(n,['день','дня','дней'])+' · '+fmtDate(d).toLowerCase():'прошло '+plural(-n,['день','дня','дней'])}${c.yearly?' · каждый год':''}</span>${n>0&&n<=400?`<div class="g-bar"><i style="width:${Math.max(3,100-n/(c.yearly?365:Math.max(n,diffD(ymd(new Date(c.created||Date.now())),d)||n))*100)}%"></i></div>`:''}</div><button class="cdel st" data-a="delCd" data-id="${c.id}" aria-label="Удалить отсчёт">${I('trash')}</button></div>`}).join('')}</div>`
 :empty('Чего вы ждёте?','<br>Отпуск, день рождения, дедлайн — добавьте дату и смотрите, сколько осталось.')}`;
};
F.cd=()=>`<h2 class="sh-title">${D._new?'Новый отсчёт':'Отсчёт'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Например, «Отпуск»" value="${esc(D.title)}" maxlength="60"></div>
 <div class="field"><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date||''}"></div>
 <div class="togrow"><span>Каждый год<small>Для дней рождения и годовщин</small></span><button class="tog${D.yearly?' on':''}" data-a="dTog" data-k="yearly" aria-label="Каждый год"></button></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('отсчёт')}`;

/* --- разгрузка головы и голос --- */
F.dump=()=>`<h2 class="sh-title">Разгрузить голову</h2><p class="hint" style="margin:-8px 0 12px">Пишите всё подряд — каждая строка станет задачей. Понимаю «завтра», «в пятницу», «15 ноября», «через 2 часа», «вечером», «каждый пн», «18:30», «#тег», «!!», «~30м», «🐸».</p>
 <div class="field"><textarea class="inp dump-ta" data-m="text" data-auto placeholder="Купить подарок в пятницу #Личное&#10;Отчёт завтра в 10 !!! ~1ч&#10;Позвонить в банк через 2 часа&#10;Спортзал каждый пн вечером">${esc(D.text)}</textarea></div>
 <div class="btnrow">${SR?`<button class="btn ghost mic" data-a="dumpMic" style="flex:none;width:52px" aria-label="Голосом">${I('mic')}</button>`:''}<button class="btn pri" data-a="dumpSave">Добавить задачи</button></div>`;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null;
function listen(onText,btn){
 if(!SR){toast('Голосовой ввод не поддерживается этим браузером');return}
 if(rec){try{rec.stop()}catch(e){}rec=null;return}
 try{rec=new SR();rec.lang='ru-RU';rec.interimResults=true;rec.maxAlternatives=1;
  rec.onresult=e=>{let s='';for(const r of e.results)s+=r[0].transcript;onText(s.trim(),e.results[e.results.length-1].isFinal)};
  rec.onerror=e=>toast(e.error==='not-allowed'||e.error==='service-not-allowed'?'Нет доступа к микрофону':'Не удалось распознать речь');
  rec.onend=()=>{rec=null;$$('.mic.on').forEach(b=>b.classList.remove('on'))};
  rec.start();btn&&btn.classList.add('on');vib(10);toast('Говорите… например «позвонить маме завтра в 7 вечера»');
 }catch(e){rec=null;toast('Микрофон недоступен')}
}

/* --- поделиться планом дня --- */
function dayText(d){
 const it=dayItems(d).sort((a,b)=>a.s-b.s),un=S.tasks.filter(x=>x.date===d&&!x.time).sort((a,b)=>(b.frog-a.frog)||byOrder(a,b));
 let s=`План на ${fmtLong(d).toLowerCase()}\n\n`;
 it.forEach(i=>s+=`${mstr(i.s)}–${mstr(i.e)}  ${i.done?'✓ ':''}${i.title}\n`);
 if(un.length){if(it.length)s+='\n';un.forEach(x=>s+=`${x.done?'✓':'○'} ${x.frog?'🐸 ':''}${x.title}${x.est?' ('+fmtDur(x.est)+')':''}\n`)}
 if(!it.length&&!un.length)s+='Свободный день ✦\n';
 return s+'\n— Ритм';
}
async function copyText(txt){try{await navigator.clipboard.writeText(txt);return true}catch(e){try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(_){return false}}}

/* --- достижения --- */
const totalDone=()=>Object.values(S.log).reduce((a,b)=>a+b,0);
function bestDayStreak(){return Object.keys(S.log).filter(k=>S.log[k]>0).sort().reduce((o,d)=>{o.c=o.p&&diffD(o.p,d)===1?o.c+1:1;o.b=Math.max(o.b,o.c);o.p=d;return o},{b:0,c:0,p:null}).b}
const maxFocusDay=()=>{const m={};S.focus.forEach(f=>m[f.date]=(m[f.date]||0)+f.min);return Math.max(0,...Object.values(m))};
const jCount=k=>Object.values(S.journal).filter(j=>j[k]).length;
const ACH=[
 ['first','Первый шаг','Выполнить первую задачу',()=>totalDone()>=1],
 ['t10','Разгон','10 выполненных задач',()=>totalDone()>=10],
 ['t100','Сотня','100 выполненных задач',()=>totalDone()>=100],
 ['s3','Три дня подряд','Серия активных дней — 3',()=>bestDayStreak()>=3],
 ['s7','Неделя в ритме','Серия активных дней — 7',()=>bestDayStreak()>=7],
 ['s30','Месяц в ритме','Серия активных дней — 30',()=>bestDayStreak()>=30],
 ['frog','Съел лягушку','Выполнить лягушку дня',()=>ST('frogs')>=1],
 ['frog10','Укротитель лягушек','10 лягушек дня',()=>ST('frogs')>=10],
 ['perfect','Чистый день','Закрыть все задачи дня (от трёх)',()=>ST('perfect')>=1],
 ['early','Ранняя пташка','Выполнить задачу до 8 утра',()=>ST('early')>=1],
 ['f60','Час тишины','60 минут фокуса за день',()=>maxFocusDay()>=60],
 ['f600','Глубокая работа','10 часов фокуса всего',()=>S.focus.reduce((a,f)=>a+f.min,0)>=600],
 ['plan','Утро с планом','Пройти утреннее планирование',()=>jCount('planned')>=1],
 ['review7','Неделя рефлексии','7 вечерних итогов',()=>jCount('reviewed')>=7],
 ['h7','Привычка прижилась','Серия привычки — 7 дней',()=>S.habits.some(h=>bestStreak(h)>=7)],
 ['h21','21 день','Серия привычки — 21 день',()=>S.habits.some(h=>bestStreak(h)>=21)],
 ['goal','В яблочко','Достичь цели',()=>ST('goals')>=1||S.goals.some(g=>g.current>=g.target)],
 ['tpl','Автопилот','Запустить шаблон',()=>ST('tpl')>=1]
];
let achQ=[];window.ACH_ON=1;
function checkAch(silent){
 if(!S.ach)S.ach={};const nw=[];
 for(const[id,n,,f]of ACH){if(S.ach[id])continue;let ok=false;try{ok=f()}catch(e){}if(ok){S.ach[id]=todayS();nw.push(n)}}
 if(nw.length&&!silent){achQ.push(...nw);setTimeout(flushAch,1200)}
}
function flushAch(){if(!achQ.length)return;if(undoFn||$('#confirm.open')){setTimeout(flushAch,1500);return}const n=achQ.splice(0);toast((n.length>1?'Достижения: ':'Достижение: ')+n.join(', ')+' ✦');vib([20,60,20])}
V.achieve=()=>{
 const got=ACH.filter(a=>S.ach&&S.ach[a[0]]).length;
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${got} из ${ACH.length} открыто</div><h1 class="display">Достижения</h1></div></header>
 <div class="g-bar" style="--c:var(--acc);margin:0 0 18px"><i style="width:${got/ACH.length*100}%"></i></div>
 <div class="ach">${ACH.map(([id,n,d])=>{const on=S.ach&&S.ach[id];return`<div class="achi${on?' on':''}"><div class="m">${I(on?'medal':'medal')}</div><b>${n}</b><span>${d}</span>${on?`<small>${fmtDate(on)}</small>`:''}</div>`}).join('')}</div>`;
};

/* ===== v5: пространства · учёба · здоровье · деньги · темы · анимации ===== */
Object.assign(IC,{
 layers:'<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
 cap:'<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c3.5 2.2 7.5 2.2 11 0v-4.5M21.5 9.5v5"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 wallet:'<rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M3.5 10h17M16 14.5h1.5"/>',
 drop:'<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/>',
 bed:'<path d="M3 18V7M3 14h18v4M21 14v-2.5a3 3 0 0 0-3-3h-7v5.5"/><circle cx="7" cy="11" r="1.8"/>',
 palette:'<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.1-1.6-1.1-2.8 0-.9.8-1.6 1.8-1.6h2A4 4 0 0 0 20.5 10c0-3.6-3.8-6.5-8.5-6.5z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="8" r="1"/>',
 minus:'<path d="M5 12h14"/>',edit:'<path d="M5 19l1-4L16 5l3 3L9 18z"/>'
});
ACCENTS.push(['#7A5BA8','Лаванда']);
const SCOPED=['tasks','events','notes','goals','habits','templates','countdowns','lessons','homework','exams'];
const SPK=['task','event','note','habit','goal','tpl','cd','lesson','hw','exam'];
const STUDYK=['lesson','hw','exam'];
const SP_PRE=[['Жизнь','🌿','#5E7D63'],['Учёба','🎓','#3E5C8A'],['Работа','💼','#D4572A'],['Спорт','🏃','#C49A3A'],['Дом','🏠','#8A5A83']];
const SP_EMO=['🌿','🎓','💼','🏠','🏃','🎨','💡','❤️','📚','✈️','🧘','⭐','🎮','🌙','🛠','💰'];
var SCF=null,LT=null;
function ALL(k){return SCF&&SCF[k]?SCF[k]:S[k]}
function spById(id){return S.spaces.find(s=>s.id===id)}
function spOf(x){return spById(x.sp)?x.sp:(S.spaces[0]||{}).id}
function spActive(){return S.spaces.length&&spById(S.space)?S.space:null}
function curSp(){try{return S.spaces.length?(spActive()||S.spaces[0].id):null}catch(e){return null}}
function studySp(){const a=spActive();if(a)return a;const st=S.spaces.find(s=>/уч[её]б/i.test(s.name));return st?st.id:curSp()}
const spLbl=s=>s?`${s.emoji} ${esc(s.name)}`:'';
function scoped(fn){
 const id=spActive();if(SCF||!id)return fn();
 SCF={};for(const k of SCOPED){SCF[k]=S[k];S[k]=S[k].filter(x=>spOf(x)===id)}
 SCF.log=S.log;const lg={};S.tasks.forEach(x=>{if(x.done&&x.doneAt){const d=ymd(new Date(x.doneAt));lg[d]=(lg[d]||0)+1}});S.log=lg;
 try{return fn()}finally{for(const k in SCF)S[k]=SCF[k];SCF=null}
}
function migrateToSpace(id){let n=0;for(const k of SCOPED)S[k].forEach(x=>{if(!spById(x.sp)||!x.sp){x.sp=id;n++}});return n}
function spCount(id){return SCOPED.reduce((a,k)=>a+ALL(k).filter(x=>spOf(x)===id).length,0)}
const SPBAR_V=['today','tasks','calendar','habits','matrix','now','notes','goals','routines','countdowns','stats','study','plan','week'];
function spBar(){
 if(!SPBAR_V.includes(ui.view))return;const v=$('#view');
 if(!S.spaces.length){if(['today','tasks'].includes(ui.view))v.insertAdjacentHTML('afterbegin',`<div class="spbar"><button class="spc ghost" data-a="go" data-v="spaces">${I('layers')} Пространства</button></div>`);return}
 const a=spActive()||'all';
 v.insertAdjacentHTML('afterbegin',`<div class="spbar" role="tablist" aria-label="Пространства"><button class="spc${a==='all'?' on':''}" data-a="spSet" data-v="all">Все</button>${S.spaces.map(s=>`<button class="spc${a===s.id?' on':''}" style="--c:${s.color}" data-a="spSet" data-v="${s.id}"><span class="e">${s.emoji}</span>${esc(s.name)}</button>`).join('')}<button class="spc set" data-a="go" data-v="spaces" aria-label="Управлять пространствами">${I('gear')}</button></div>`);
}
function render(anim){if(SPBAR_V.includes(ui.view))scoped(()=>render0(anim));else render0(anim);spBar()}
for(const k of ['autoPlan','shed','allTomorrow','moveOverdue','share','selAll']){const f=A[k];if(f)A[k]=(el,e)=>scoped(()=>f(el,e))}
const _open=openSheet;
openSheet=function(kind,draft){if(draft&&draft._new&&SPK.includes(kind)&&!draft.sp&&S.spaces.length)draft.sp=STUDYK.includes(kind)?studySp():curSp();return _open(kind,draft)};
const _rs=renderSheet;
renderSheet=function(){_rs();if(D&&SPK.includes(D._k)&&S.spaces.length){const b=$('.sheet-body .btnrow');if(b)b.insertAdjacentHTML('beforebegin',`<div class="field"><label>Пространство</label><div class="chips" style="margin:0 -20px">${S.spaces.map(s=>`<button class="chip${spOf(D)===s.id?' on':''}" data-a="dSet" data-k="sp" data-v="${s.id}">${spLbl(s)}</button>`).join('')}</div></div>`)}};
const _pq=parseQuick;
parseQuick=function(s,def,dry){let sp;if(S.spaces.length)s=String(s).replace(/(^|\s)@([^\s@]+)/,(m,a,b)=>{const q=b.toLowerCase().replace(/_/g,' ');const f=S.spaces.find(x=>x.name.toLowerCase()===q)||S.spaces.find(x=>x.name.toLowerCase().startsWith(q));if(f){sp=f.id;return ' '}return m});const r=_pq(s,def,dry);if(sp)r.sp=sp;return r};
const _qa=quickAdd;
quickAdd=function(text,def){const ok=_qa(text,def);if(ok){const x=S.tasks[S.tasks.length-1],a=spActive();if(x&&a&&x.sp!==a){const s=spById(x.sp);toast(`Добавлено в ${s.emoji} ${s.name}`,()=>{S.tasks=S.tasks.filter(y=>y.id!==x.id);save();render()})}}return ok};
const _ti=taskItem;
taskItem=function(x,...r){let h=_ti(x,...r);if(S.spaces.length>1&&!spActive()){const s=spById(spOf(x));if(s)h=h.replace('<div class="t-title">',`<div class="t-title"><span class="spm" title="${esc(s.name)}">${s.emoji}</span>`)}return h};
Object.assign(COLL,{lesson:'lessons',hw:'homework',exam:'exams',money:'money',space:'spaces'});
Object.assign(LBL,{lessons:['Удалить пару?','Пара удалена'],homework:['Удалить задание?','Задание удалено'],exams:['Удалить экзамен?','Удалено'],money:['Удалить запись?','Запись удалена']});
function v5pre(k){
 if(k==='lesson'){D.subj=D.subj.trim();D.day=Number(D.day)||1;if(!D.start)D.start='09:00';if(!D.end||tmin(D.end)<=tmin(D.start))D.end=mstr(Math.min(tmin(D.start)+90,1439))}
 if(k==='hw'){D.text=D.text.trim();D.subj=String(D.subj||'').trim();D.due=D.due||null}
 if(k==='exam'&&!D.date){const i=$('.sheet [data-m=date]');i&&i.focus();return false}
 if(k==='money'){D.amt=Math.round(Math.abs(Number(D.amt))*100)/100;if(!(D.amt>0)){const i=$('.sheet [data-m=amt]');if(i){i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');i.focus()}return false}const cs=D.type==='inc'?INC:EXP;if(!cs.some(c=>c[0]===D.cat))D.cat=cs[cs.length-1][0];D.date=D.date||todayS()}
 if(k==='space'){D.name=D.name.trim().slice(0,24)}
}
function v5post(k,obj,isNew){
 if(k==='space'&&isNew&&S.spaces.length===1){const n=migrateToSpace(obj.id);if(n)setTimeout(()=>toast(`Всё, что было раньше (${n}), — теперь в «${obj.name}»`),900)}
}

/* --- пространства: экраны и листы --- */
V.spaces=()=>{
 const a=S.spaces;
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Разделяйте сферы</div><h1 class="display">Пространства</h1></div></header>
 ${a.length?`<div class="hgrid">${a.map((s,i)=>{const n=spCount(s.id);return`<div class="card spcard" style="--c:${s.color}"><span class="spe">${s.emoji}</span><div class="cd-b" data-a="spEdit" data-id="${s.id}"><b>${esc(s.name)}</b><span>${n} ${plural(n,['запись','записи','записей'])}${i===0?' · основное':''}</span></div><button class="cdel st" data-a="spEdit" data-id="${s.id}" aria-label="Изменить">${I('edit')}</button><button class="cdel st" data-a="spDel" data-id="${s.id}" aria-label="Удалить пространство">${I('trash')}</button></div>`}).join('')}</div>
 <p class="hint" style="margin:14px 4px">Наверху экранов — переключатель: «Все» показывает всё вместе. В быстром вводе можно написать <b>@${esc(a[a.length-1].name)}</b>, чтобы отправить задачу в нужное пространство. Перенести запись — откройте её и выберите пространство; задачи — пачкой через «Выбрать».</p>
 <div class="btnrow"><button class="btn pri" data-a="spNew">${I('plus')} Новое пространство</button></div>`
 :`<div class="card spintro"><p>Разделите, например, повседневную жизнь и учёбу — задачи, события, заметки, привычки и расписание не будут смешиваться. Переключаться — одним касанием наверху экрана.</p>
 <div class="btnrow"><button class="btn pri" data-a="spPresets">🌿 Жизнь + 🎓 Учёба</button></div><div class="btnrow"><button class="btn" data-a="spNew">${I('plus')} Своё пространство</button></div>
 <p class="hint" style="margin:12px 2px 0">Всё, что уже есть, попадёт в первое пространство.</p></div>`}`;
};
F.space=()=>`<h2 class="sh-title">${D._new?'Новое пространство':'Пространство'}</h2>
 ${D._new?`<div class="chips" style="margin:-6px -20px 12px">${SP_PRE.filter(p=>!S.spaces.some(s=>s.name===p[0])).map(p=>`<button class="chip" data-a="spPre" data-v="${p[0]}">${p[1]} ${p[0]}</button>`).join('')}</div>`:''}
 <div class="field"><input class="inp big" data-m="name" data-auto placeholder="Например, «Учёба»" value="${esc(D.name)}" maxlength="24"></div>
 <div class="field"><label>Значок</label><div class="emogrid">${SP_EMO.map(e=>`<button class="${D.emoji===e?'on':''}" data-a="dSet" data-k="emoji" data-v="${e}">${e}</button>`).join('')}</div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Создать':'Сохранить'}</button></div>${D._new?'':`<button class="btn del-wide" data-a="spDel" data-id="${D.id}">${I('trash')} Удалить пространство</button>`}`;
F.spdel=()=>{const s=spById(D.id),n=spCount(D.id),o=S.spaces.filter(x=>x.id!==D.id);
 return`<h2 class="sh-title">Удалить «${esc(s.name)}»?</h2><p class="hint" style="margin:-6px 0 14px">${n?`Внутри ${n} ${plural(n,['запись','записи','записей'])}. Что с ними сделать?`:'Пространство пустое.'}</p>
 <div class="hgrid">${n?o.map(x=>`<button class="btn" data-a="spDelGo" data-v="${x.id}">Перенести в ${spLbl(x)}</button>`).join('')+(o.length?'':`<button class="btn" data-a="spDelGo" data-v="keep">Оставить записи (станут общими)</button>`):`<button class="btn" data-a="spDelGo" data-v="keep">Удалить пространство</button>`}
 ${n?`<button class="btn red" data-a="spDelGo" data-v="wipe">${I('trash')} Удалить вместе с записями</button>`:''}<button class="btn" data-a="dClose">Отмена</button></div>`};
F.sppick=()=>`<h2 class="sh-title">Перенести ${D.n} ${plural(D.n,['задачу','задачи','задач'])}</h2><div class="hgrid">${S.spaces.map(s=>`<button class="btn" data-a="selSpGo" data-v="${s.id}">${spLbl(s)}</button>`).join('')}</div>`;
NEW.space=(o={})=>openSheet('space',{id:uid(),name:o.name||'',emoji:o.emoji||SP_EMO[S.spaces.length%SP_EMO.length],color:o.color||COLORS[S.spaces.length%COLORS.length],_new:1,_focus:1});
Object.assign(A,{
 spSet:el=>{S.space=el.dataset.v;ui.skip=[];ui.sel=null;save();vib(6);render();window.scrollTo(0,0)},
 spNew:()=>NEW.space(),
 spPre:el=>{const p=SP_PRE.find(x=>x[0]===el.dataset.v);syncD();D.name=p[0];D.emoji=p[1];D.color=p[2];const i=$('.sheet [data-m=name]');if(i)i.value=p[0];renderSheet()},
 spPresets:()=>{const first=!S.spaces.length;SP_PRE.slice(0,2).forEach(p=>{if(!S.spaces.some(s=>s.name===p[0]))S.spaces.push({id:uid(),name:p[0],emoji:p[1],color:p[2]})});let n=0;if(first)n=migrateToSpace(S.spaces[0].id);save();render();toast(n?`Готово. Прежние записи (${n}) — в «${S.spaces[0].name}»`:'Пространства созданы')},
 spEdit:el=>{const s=spById(el.dataset.id);if(s)openSheet('space',JSON.parse(JSON.stringify(s)))},
 spDel:el=>{openSheet('spdel',{id:el.dataset.id})},
 dClose:()=>closeSheet(),
 spDelGo:el=>{const id=D.id,v=el.dataset.v,s=spById(id);if(!s)return;
  const go2=()=>{const snap=JSON.stringify(S);const first=S.spaces[0];
   if(v==='wipe'){for(const k of SCOPED)S[k]=S[k].filter(x=>spOf(x)!==id)}
   else if(v!=='keep'){for(const k of SCOPED)S[k].forEach(x=>{if(spOf(x)===id)x.sp=v})}
   if(v!=='keep'&&v!=='wipe'||first.id!==id){} // остальные записи остаются при своих
   for(const k of SCOPED)S[k].forEach(x=>{if(!x.sp&&first&&first.id!==id)x.sp=first.id});
   S.spaces=S.spaces.filter(x=>x.id!==id);if(S.space===id)S.space='all';
   if(!S.spaces.length)for(const k of SCOPED)S[k].forEach(x=>{delete x.sp});
   closeSheet();save();render();vib(10);toast(`«${s.name}» удалено`,()=>{S=JSON.parse(snap);save();render()})};
  if(v==='wipe')ask('Удалить вместе с записями?',`Всё из «${s.name}» исчезнет. Отменить можно сразу после.`,'Удалить',go2);else go2()},
 selSp:()=>{if(!ui.sel||!ui.sel.size)return;openSheet('sppick',{n:ui.sel.size})},
 selSpGo:el=>{const ids=ui.sel,undo=snapT(),s=spById(el.dataset.v);S.tasks.forEach(x=>{if(ids.has(x.id))x.sp=s.id});const n=ids.size;ui.sel=null;closeSheet();save();render();toast(`${n} → ${s.emoji} ${s.name}`,undo)},
});

/* --- учёба --- */
const wdn=s=>pd(s).getDay()||7;
const WDN=['','Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
function isoWeek(s){const d=pd(s);d.setDate(d.getDate()+3-((d.getDay()+6)%7));const w1=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-w1)/864e5-3+((w1.getDay()+6)%7))/7)}
const parity=s=>((isoWeek(s)+(S.settings.parityFlip?1:0))%2)?'odd':'even';
const PAR={all:'Каждую неделю',odd:'Нечётные',even:'Чётные'};
function lessonsOn(d,arr){const w=wdn(d),p=parity(d);return(arr||S.lessons).filter(l=>l.day===w&&(l.week==='all'||!l.week||l.week===p)).sort((a,b)=>a.start.localeCompare(b.start))}
function nextLessonDate(subj,from){if(!subj)return null;const q=subj.toLowerCase();from=from||todayS();for(let i=1;i<=70;i++){const d=addD(from,i);if(lessonsOn(d,ALL('lessons')).some(l=>l.subj.toLowerCase()===q))return d}return null}
const subjects=()=>[...new Set([...ALL('lessons'),...ALL('homework'),...ALL('exams')].map(x=>(x.subj||'').trim()).filter(Boolean))];
const subjColor=n=>{const l=ALL('lessons').find(x=>x.subj===n);return l?l.color:'var(--ink3)'};
const EXK={exam:'Экзамен',test:'Контрольная',deadline:'Дедлайн'};
const exLeft=e=>diffD(todayS(),e.date);
function hwRow(h){const t=todayS(),late=!h.done&&h.due&&h.due<t;return`<div class="hwr${h.done?' done':''}" style="--c:${subjColor(h.subj)}"><button class="chk${h.done?' on':''}" data-a="hwTog" data-id="${h.id}" aria-label="Готово">${I('check')}</button><div class="hw-b" data-a="hwEdit" data-id="${h.id}"><b>${esc(h.text)}</b><span>${h.subj?`<i class="dot"></i>${esc(h.subj)}`:''}${h.due?` · <em class="${late?'late':''}">${late?'просрочено, ':''}${fmtDate(h.due).toLowerCase()}</em>`:''}</span></div></div>`}
V.study=()=>{
 const t=todayS(),tab=ui.stTab||'tt';ui.stOff=ui.stOff||0;
 const mon=addD(t,-(wdn(t)-1)+7*ui.stOff),day=ui.stDay||wdn(t),d=addD(mon,day-1),ls=lessonsOn(d),par=parity(mon);
 const nowm=nowMin();let body='';
 if(tab==='tt'){
  body=`<div class="wkbar"><button class="ib" data-a="stWk" data-v="-1" aria-label="Прошлая неделя">${I('chevL')}</button><span>${ui.stOff?fmtDate(mon)+' – '+fmtDate(addD(mon,6)):'Эта неделя'} · <b>${par==='odd'?'нечётная':'чётная'}</b></span><button class="ib" data-a="stWk" data-v="1" aria-label="Следующая неделя">${I('chevR')}</button></div>
  <div class="daypick">${[1,2,3,4,5,6,7].map(n=>{const dd=addD(mon,n-1),c=lessonsOn(dd).length;return`<button class="${n===day?'on':''}${dd===t?' td':''}" data-a="stDay" data-v="${n}">${WDN[n]}<small>${pd(dd).getDate()}</small>${c?`<i>${c}</i>`:''}</button>`}).join('')}</div>
  <h3 class="sec">${cap(fmtLong(d))}</h3>
  ${ls.length?`<div class="lsl">${ls.map(l=>{const on=d===t&&nowm>=tmin(l.start)&&nowm<tmin(l.end),hw=S.homework.filter(h=>!h.done&&h.due===d&&h.subj===l.subj).length;return`<div class="ls${on?' now':''}" style="--c:${l.color}" data-a="editLesson" data-id="${l.id}"><div class="ls-t"><b>${l.start}</b><span>${l.end}</span></div><div class="ls-b"><b>${esc(l.subj)}</b><span>${[l.room?'ауд. '+esc(l.room):'',l.teacher?esc(l.teacher):'',l.week&&l.week!=='all'?PAR[l.week].toLowerCase():''].filter(Boolean).join(' · ')}</span>${on?'<em class="pill">идёт</em>':''}${hw?`<em class="pill hw">${hw} ${plural(hw,['задание','задания','заданий'])}</em>`:''}</div></div>`}).join('')}</div>`:empty(S.lessons.length?'Пар нет':'Расписание пустое',S.lessons.length?'<br>Свободный день.':'<br>Нажмите «+», чтобы добавить первую пару — она будет повторяться каждую неделю.')}
  <div class="togrow" style="margin-top:18px"><span>Чётность недель<small>Сейчас ${parity(t)==='odd'?'нечётная':'чётная'} неделя — если у вас наоборот, переключите</small></span><button class="tog${S.settings.parityFlip?' on':''}" data-a="stFlip" aria-label="Поменять чётность"></button></div>`;
 }else if(tab==='hw'){
  const open=S.homework.filter(h=>!h.done),done=S.homework.filter(h=>h.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0)),tm=addD(t,1);
  const g=[['Просрочено',h=>h.due&&h.due<t],['Сегодня',h=>h.due===t],['Завтра',h=>h.due===tm],['Позже',h=>h.due&&h.due>tm],['Без срока',h=>!h.due]];
  body=open.length||done.length?g.map(([n,f])=>{const a=open.filter(f).sort((x,y)=>(x.due||'').localeCompare(y.due||''));return a.length?`<h3 class="sec">${n}<span class="cnt">${a.length}</span></h3><div class="hgrid">${a.map(hwRow).join('')}</div>`:''}).join('')+(done.length?`<h3 class="sec">Сделано<span class="cnt">${done.length}</span></h3><div class="hgrid">${done.slice(0,ui.hwAll?99:5).map(hwRow).join('')}</div>${done.length>5&&!ui.hwAll?`<button class="linkbtn" data-a="hwAll">Показать все</button>`:''}`:'')
   :empty('Заданий нет','<br>Добавьте задание — срок сам встанет на следующую пару по этому предмету.');
 }else{
  const a=S.exams.slice().sort((x,y)=>(exLeft(x)<0)-(exLeft(y)<0)||Math.abs(exLeft(x))-Math.abs(exLeft(y)));
  body=a.length?`<div class="hgrid">${a.map(e=>{const n=exLeft(e);return`<div class="card cd${n<0?' past':''}" style="--c:${subjColor(e.subj)==='var(--ink3)'?'var(--acc)':subjColor(e.subj)}" data-a="editExam" data-id="${e.id}"><div class="n">${n===0?'✦':Math.abs(n)}</div><div class="cd-b"><b>${esc(e.title)}</b><span>${EXK[e.kind]||'Экзамен'}${e.subj?' · '+esc(e.subj):''} · ${n===0?'сегодня':n>0?'через '+plural(n,['день','дня','дней']).replace(/^/,n+' '):'прошло'}${e.time?' · '+e.time:''}</span></div></div>`}).join('')}</div>`
   :empty('Экзаменов нет','<br>Добавьте экзамен, контрольную или дедлайн — увидите обратный отсчёт и на «Сегодня».');
 }
 const ohw=S.homework.filter(h=>!h.done).length;
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Расписание и задания</div><h1 class="display">Учёба</h1></div></header>
 <div class="seg" style="margin-bottom:6px">${[['tt','Расписание'],['hw','Задания'+(ohw?' · '+ohw:'')],['ex','Экзамены']].map(([k,v])=>`<button class="${tab===k?'on':''}" data-a="stTab" data-v="${k}">${v}</button>`).join('')}</div>${body}`;
};
function studyToday(){
 const t=todayS(),ls=lessonsOn(t),tm=addD(t,1),hw=S.homework.filter(h=>!h.done&&h.due&&h.due<=tm),ex=S.exams.filter(e=>exLeft(e)>=0&&exLeft(e)<=14).sort((a,b)=>exLeft(a)-exLeft(b))[0];
 if(!ls.length&&!hw.length&&!ex)return'';const nm=nowMin();
 return`<section class="card stud" data-a="go" data-v="study"><div class="st-h"><span>${I('cap')} Учёба</span><small>${ls.length?ls.length+' '+plural(ls.length,['пара','пары','пар'])+' сегодня':'сегодня пар нет'}</small></div>
 ${ls.map(l=>{const on=nm>=tmin(l.start)&&nm<tmin(l.end),past=nm>=tmin(l.end);return`<div class="st-l${on?' now':''}${past?' past':''}" style="--c:${l.color}"><b>${l.start}</b><span>${esc(l.subj)}${l.room?` <small>· ${esc(l.room)}</small>`:''}</span>${on?'<em class="pill">идёт</em>':''}</div>`}).join('')}
 ${hw.length?`<div class="st-x">📚 Задания к ${hw.some(h=>h.due<=t)?'сегодня':'завтра'}: <b>${hw.length}</b></div>`:''}${ex?`<div class="st-x">⏳ ${esc(ex.title)} — <b>${exLeft(ex)?'через '+exLeft(ex)+' '+plural(exLeft(ex),['день','дня','дней']):'сегодня'}</b></div>`:''}</section>`;
}
F.lesson=()=>{const subs=subjects();return`<h2 class="sh-title">${D._new?'Новая пара':'Пара'}</h2>
 <div class="field"><input class="inp big" data-m="subj" data-auto placeholder="Предмет" value="${esc(D.subj)}" maxlength="50" list="subjl"><datalist id="subjl">${subs.map(s=>`<option value="${esc(s)}">`).join('')}</datalist></div>
 <div class="field"><label>День недели</label>${seg('day',[1,2,3,4,5,6,7].map(n=>[n,WDN[n]]),D.day)}</div>
 <div class="field two"><div><label>Начало</label><input class="inp" type="time" data-m="start" value="${D.start}"></div><div><label>Конец</label><input class="inp" type="time" data-m="end" value="${D.end}"></div></div>
 <div class="chips" style="margin:-6px -20px 14px">${[45,80,90,95].map(m=>`<button class="chip" data-a="lsDur" data-v="${m}">${m} мин</button>`).join('')}</div>
 <div class="field"><label>Недели</label>${seg('week',Object.entries(PAR).map(([k,v])=>[k,k==='all'?'Каждую':v]),D.week||'all')}</div>
 <div class="field two"><div><label>Аудитория</label><input class="inp" data-m="room" value="${esc(D.room)}" placeholder="301" maxlength="20"></div><div><label>Преподаватель</label><input class="inp" data-m="teacher" value="${esc(D.teacher)}" placeholder="Иванова А. П." maxlength="40"></div></div>
 <div class="field"><label>Цвет</label>${swatches(D.color)}</div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('пару')}`};
F.hw=()=>{const subs=subjects(),nx=nextLessonDate(D.subj);return`<h2 class="sh-title">${D._new?'Новое задание':'Задание'}</h2>
 <div class="field"><textarea class="inp big" rows="2" data-m="text" data-auto placeholder="Что задали?" maxlength="300">${esc(D.text)}</textarea></div>
 <div class="field"><label>Предмет</label>${subs.length?`<div class="chips" style="margin:0 -20px 8px">${subs.map(s=>`<button class="chip${D.subj===s?' on':''}" data-a="hwSubj" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}<input class="inp" data-m="subj" value="${esc(D.subj)}" placeholder="Например, «Матанализ»" maxlength="50"></div>
 <div class="field"><label>Сдать</label><input class="inp" type="date" data-m="due" value="${D.due||''}"></div>
 <div class="chips" style="margin:-6px -20px 14px">${nx?`<button class="chip${D.due===nx?' on':''}" data-a="dVal" data-k="due" data-v="${nx}">К следующей паре · ${WDS[pd(nx).getDay()]}, ${fmtDate(nx).toLowerCase()}</button>`:''}<button class="chip" data-a="dVal" data-k="due" data-v="${addD(todayS(),1)}">Завтра</button><button class="chip" data-a="dVal" data-k="due" data-v="${addD(todayS(),7)}">Через неделю</button><button class="chip" data-a="dVal" data-k="due" data-v="">Без срока</button></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('задание')}`};
F.exam=()=>`<h2 class="sh-title">${D._new?'Экзамен или дедлайн':'Экзамен'}</h2>
 <div class="field"><input class="inp big" data-m="title" data-auto placeholder="Например, «Экзамен по физике»" value="${esc(D.title)}" maxlength="60"></div>
 <div class="field"><label>Тип</label>${seg('kind',Object.entries(EXK),D.kind)}</div>
 <div class="field"><label>Предмет</label><input class="inp" data-m="subj" value="${esc(D.subj)}" list="subjl2" maxlength="50"><datalist id="subjl2">${subjects().map(s=>`<option value="${esc(s)}">`).join('')}</datalist></div>
 <div class="field two"><div><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date||''}"></div><div><label>Время</label><input class="inp" type="time" data-m="time" value="${D.time||''}"></div></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('экзамен')}`;
NEW.lesson=(o={})=>{const last=S.lessons[S.lessons.length-1];openSheet('lesson',{id:uid(),subj:'',day:o.day||ui.stDay||wdn(todayS()),start:last?last.end:'09:00',end:last?mstr(Math.min(tmin(last.end)+90,1439)):'10:30',room:'',teacher:'',week:'all',color:COLORS[S.lessons.length%COLORS.length],_new:1,_focus:1})};
NEW.hw=(o={})=>openSheet('hw',{id:uid(),subj:o.subj||'',text:'',due:o.subj?nextLessonDate(o.subj):null,done:false,created:Date.now(),_new:1,_focus:1});
NEW.exam=()=>openSheet('exam',{id:uid(),title:'',kind:'exam',subj:'',date:addD(todayS(),14),time:'',_new:1,_focus:1});
Object.assign(A,{
 stTab:el=>{ui.stTab=el.dataset.v;render()},
 stDay:el=>{ui.stDay=+el.dataset.v;render()},
 stWk:el=>{ui.stOff=(ui.stOff||0)+(+el.dataset.v);render()},
 stFlip:()=>{S.settings.parityFlip=!S.settings.parityFlip;save();render()},
 hwAll:()=>{ui.hwAll=1;render()},
 editLesson:el=>{const x=ALL('lessons').find(y=>y.id===el.dataset.id)||S.lessons.find(y=>y.id===el.dataset.id);if(x)openSheet('lesson',JSON.parse(JSON.stringify(x)))},
 hwEdit:el=>{const x=S.homework.find(y=>y.id===el.dataset.id);if(x)openSheet('hw',JSON.parse(JSON.stringify(x)))},
 editExam:el=>{const x=S.exams.find(y=>y.id===el.dataset.id);if(x)openSheet('exam',JSON.parse(JSON.stringify(x)))},
 hwTog:el=>{const x=S.homework.find(y=>y.id===el.dataset.id);if(!x)return;x.done=!x.done;x.doneAt=x.done?Date.now():null;save();vib(x.done?12:6);if(x.done)burst();render();if(x.done)toast('Задание сдано',()=>{x.done=false;x.doneAt=null;save();render()})},
 hwSubj:el=>{syncD();const v=el.dataset.v,old=nextLessonDate(D.subj);D.subj=v;const i=$('.sheet [data-m=subj]');if(i)i.value=v;if(!D.due||D.due===old){const n=nextLessonDate(v);if(n){D.due=n;const j=$('.sheet [data-m=due]');if(j)j.value=n}}renderSheet()},
 dVal:el=>{syncD();const k=el.dataset.k,v=el.dataset.v;D[k]=v||null;const i=$(`.sheet [data-m="${k}"]`);if(i)i.value=v;renderSheet()},
 lsDur:el=>{syncD();const s=tmin(D.start)||540;D.end=mstr(Math.min(s+(+el.dataset.v),1439));const i=$('.sheet [data-m=end]');if(i)i.value=D.end;renderSheet()},
});

/* --- здоровье --- */
const H=d=>S.health[d]||(S.health[d]={});
const MOODE=['😣','😕','😐','🙂','😄'],SQ=['Ужасно','Плохо','Средне','Хорошо','Отлично'];
function sleepMin(d){const h=S.health[d];if(!h||!h.bed||!h.wake)return 0;let a=tmin(h.bed),b=tmin(h.wake);if(b<=a)b+=1440;const m=b-a;return m>0&&m<=16*60?m:0}
const hm=m=>`${Math.floor(m/60)} ч${m%60?' '+pad(m%60):''}`;
const fmt1=n=>(Math.round(n*10)/10).toString().replace('.',',');
function healthStrip(){const t=todayS(),h=S.health[t]||{},w=h.water||0,G=S.settings.waterGoal||8,sl=sleepMin(t),m=(S.journal[t]||{}).mood;
 return`<div class="hstrip"><button class="hs-w${w>=G?' ok':''}" data-a="water" data-v="1" aria-label="Плюс стакан воды"><span class="hs-i">${I('drop')}</span><b>${w}<small>/${G}</small></b><em>+</em></button><button data-a="go" data-v="health"><span class="hs-i">${I('bed')}</span><b>${sl?hm(sl):'—'}</b><small>сон</small></button><button data-a="go" data-v="health"><span class="hs-e">${m?MOODE[m-1]:'·'}</span><small>${m?MOOD[m-1].toLowerCase():'настроение'}</small></button></div>`}
function pearson(xs,ys){const n=xs.length;if(n<5)return null;const mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;let s=0,a=0,b=0;for(let i=0;i<n;i++){s+=(xs[i]-mx)*(ys[i]-my);a+=(xs[i]-mx)**2;b+=(ys[i]-my)**2}return a&&b?s/Math.sqrt(a*b):null}
function hInsights(){
 const t=todayS(),G=S.settings.waterGoal||8,log=ALL('log'),R=[...Array(45)].map((_,i)=>addD(t,-i)).map(d=>{const h=S.health[d]||{},j=S.journal[d]||{};return{d,done:log[d]||0,focus:focusMin(d),sl:sleepMin(d),sq:h.sq||0,w:h.water||0,mood:j.mood||0}});
 const tracked=R.filter(r=>r.sl||r.w||r.mood).length;
 const av=(a,k)=>a.reduce((s,r)=>s+r[k],0)/a.length;
 const C=[['🛏','спите 7+ часов','спите меньше',r=>r.sl>0,r=>r.sl>=420],['💧','выпиваете норму воды','воды меньше нормы',r=>r.w>0||r.sl>0||r.mood>0,r=>r.w>=G],['🙂','настроение хорошее','настроение так себе',r=>r.mood>0,r=>r.mood>=4],['✨','спится качественно','сон беспокойный',r=>r.sq>0,r=>r.sq>=4]];
 const out=[];for(const[ic,g,b,has,good]of C){const A1=R.filter(r=>has(r)&&good(r)),B1=R.filter(r=>has(r)&&!good(r));if(A1.length<2||B1.length<2)continue;
  const d1=av(A1,'done'),d2=av(B1,'done'),f1=av(A1,'focus'),f2=av(B1,'focus'),pc=d2>0?Math.round((d1/d2-1)*100):d1>0?100:0;
  out.push({w:Math.abs(pc)+Math.abs(f1-f2)/3,h:`<div class="ins"><span class="ins-i">${ic}</span><p>Когда вы <b>${g}</b>, вы закрываете в среднем <b>${fmt1(d1)}</b> ${plural(Math.round(d1),['задачу','задачи','задач'])} ${f1||f2?` и фокусируетесь <b>${Math.round(f1)} мин</b> — против ${fmt1(d2)} и ${Math.round(f2)} мин`:` — против ${fmt1(d2)}`}, когда ${b}.</p><em class="${pc>=0?'up':'dn'}">${pc>0?'+':''}${pc}%</em></div>`})}
 const ps=R.filter(r=>r.sl),r=pearson(ps.map(x=>x.sl),ps.map(x=>x.done+x.focus/25));
 const rl=r===null?'':`<div class="ins"><span class="ins-i">📈</span><p>Связь сна и продуктивности: <b>${Math.abs(r)>=.5?'сильная':Math.abs(r)>=.3?'заметная':'слабая'}</b>${Math.abs(r)>=.3?(r>0?' — чем больше спите, тем больше успеваете':' — недосып пока не мешает'):''}. <small>r = ${fmt1(r*100/100).replace(/^(-?\d+,\d).*/,'$1')}, ${ps.length} ${plural(ps.length,['день','дня','дней'])}</small></p></div>`;
 if(!out.length&&!rl){const need=Math.max(0,6-tracked);return`<div class="card ins-empty"><p>Отмечайте сон, воду и настроение — и через несколько дней здесь появятся связи с выполненными задачами и минутами фокуса.</p><div class="g-bar"><i style="width:${Math.min(100,tracked/6*100)}%"></i></div><small>${tracked} из 6 дней${need?` · ещё ${need}`:''}</small></div>`}
 return`<div class="hgrid">${out.sort((a,b)=>b.w-a.w).map(o=>o.h).join('')}${rl}</div>`;
}
V.health=()=>{
 const t=todayS(),h=S.health[t]||{},w=h.water||0,G=S.settings.waterGoal||8,ml=S.settings.glassMl||250,sl=sleepMin(t),j=S.journal[t]||{};
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">${cap(fmtLong(t))}</div><h1 class="display">Здоровье</h1></div></header>
 <section class="card water"><div class="w-top"><div><div class="flabel">Вода</div><b class="w-n">${w}<small> / ${G}</small></b><span class="w-ml">${(w*ml/1000).toString().replace('.',',')} л из ${(G*ml/1000).toString().replace('.',',')} л</span></div><div class="w-act"><button class="ib" data-a="water" data-v="-1" aria-label="Минус стакан"${w?'':' disabled'}>${I('minus')}</button><button class="btn pri" data-a="water" data-v="1">${I('plus')} Стакан</button></div></div>
 <div class="glasses">${[...Array(Math.max(G,w))].map((_,i)=>`<i class="${i<w?'on':''}${i>=G?' x':''}"></i>`).join('')}</div>
 <div class="w-goal"><span>Норма</span><button class="ib sm" data-a="wGoal" data-v="-1" aria-label="Меньше">${I('minus')}</button><b>${G}</b><button class="ib sm" data-a="wGoal" data-v="1" aria-label="Больше">${I('plus')}</button><span>стаканов по</span><select data-ch="glassMl" aria-label="Объём стакана">${[200,250,300,330,500].map(v=>`<option${v===ml?' selected':''} value="${v}">${v} мл</option>`).join('')}</select></div></section>
 <section class="card"><div class="flabel">Сон прошлой ночью</div><div class="sleep"><label>Лёг<input type="time" data-ch="hT" data-k="bed" value="${h.bed||''}"></label><span class="sl-d">${sl?hm(sl):'—'}</span><label>Встал<input type="time" data-ch="hT" data-k="wake" value="${h.wake||''}"></label></div>
 <div class="flabel" style="margin-top:16px">Качество</div><div class="scale">${SQ.map((l,i)=>`<button class="${h.sq===i+1?'on':''}" data-a="hSet" data-k="sq" data-v="${i+1}"><b>${i+1}</b>${l}</button>`).join('')}</div></section>
 <section class="card"><div class="flabel">Настроение</div><div class="moods">${MOODE.map((e,i)=>`<button class="${j.mood===i+1?'on':''}" data-a="jSet" data-k="mood" data-v="${i+1}" aria-label="${MOOD[i]}"><span>${e}</span><small>${MOOD[i]}</small></button>`).join('')}</div></section>
 <h3 class="sec">7 дней</h3><div class="card"><div class="flabel">Сон, часов</div>${barChart(7,d=>{const m=sleepMin(d);return m?Math.round(m/6)/10:0})}<div class="flabel" style="margin-top:14px">Вода, стаканов</div>${barChart(7,d=>(S.health[d]||{}).water||0)}<div class="flabel" style="margin-top:14px">Настроение</div><div class="mood7">${[...Array(7)].map((_,i)=>{const d=addD(t,i-6),m=(S.journal[d]||{}).mood;return`<span><b>${m?MOODE[m-1]:'·'}</b><small>${WDS[pd(d).getDay()]}</small></span>`}).join('')}</div></div>
 <h3 class="sec">Что влияет на ваши дни</h3>${hInsights()}`;
};
Object.assign(A,{
 water:el=>{const h=H(todayS()),G=S.settings.waterGoal||8,was=h.water||0;h.water=Math.max(0,Math.min(30,was+(+el.dataset.v)));save();vib(8);if(+el.dataset.v>0){burst(null,'#3E8ED0');if(h.water===G)setTimeout(()=>toast('Норма воды выполнена 💧'),200)}render()},
 wGoal:el=>{S.settings.waterGoal=Math.max(1,Math.min(20,(S.settings.waterGoal||8)+(+el.dataset.v)));save();render()},
 hSet:el=>{const h=H(todayS()),k=el.dataset.k,v=+el.dataset.v;h[k]=h[k]===v?0:v;save();vib(6);render()},
});

/* --- деньги --- */
const EXP=[['food','Продукты','🛒'],['cafe','Кафе','☕'],['transport','Транспорт','🚇'],['home','Дом','🏠'],['shop','Покупки','🛍'],['fun','Досуг','🎬'],['health','Здоровье','💊'],['study','Учёба','📚'],['subs','Подписки','🔁'],['gifts','Подарки','🎁'],['other','Другое','•']];
const INC=[['salary','Зарплата','💼'],['side','Подработка','🧩'],['grant','Стипендия','🎓'],['gift','Подарок','🎁'],['iother','Другое','•']];
const catOf=k=>EXP.find(c=>c[0]===k)||INC.find(c=>c[0]===k)||['other','Другое','•'];
const KW=[[/прод|магаз|супер|пятёр|пятер|ашан|перекр|еда|овощ|хлеб/i,'food'],[/коф|кафе|ресто|обед|ужин|завтрак|бар|пицц|суши|доставк/i,'cafe'],[/метро|такси|автоб|бенз|транс|проезд|электрич|самок/i,'transport'],[/кварт|аренд|жкх|свет|интернет|дом/i,'home'],[/одежд|обув|покуп|wb|wildb|озон|ozon/i,'shop'],[/кино|театр|игр|концерт|досуг|книг/i,'fun'],[/апте|врач|лекар|спорт|зал|здоров/i,'health'],[/учеб|учёб|курс|репет|тетрад/i,'study'],[/подпис|яндекс|spotify|netflix|icloud/i,'subs'],[/подар/i,'gifts']];
const KWI=[[/зарпл|аванс|оклад/i,'salary'],[/подраб|фриланс|заказ/i,'side'],[/стипен/i,'grant'],[/подар/i,'gift']];
const rub=n=>(Math.round(n*100)/100).toLocaleString('ru-RU',{maximumFractionDigits:2})+' ₽';
const kfmt=n=>n>=1e6?fmt1(n/1e6)+'м':n>=1e3?(n>=1e4?Math.round(n/1e3):fmt1(n/1e3))+'к':String(Math.round(n));
const monOf=s=>s.slice(0,7);
const sumM=(m,type,cat)=>S.money.filter(x=>monOf(x.date)===m&&x.type===type&&(!cat||x.cat===cat)).reduce((a,x)=>a+x.amt,0);
function parseMoney(s){const m=String(s).trim().match(/^([+-])?\s*(\d[\d\s]*(?:[.,]\d{1,2})?)\s*(?:₽|р\.?|руб\.?)?\s*(.*)$/i);if(!m)return null;const amt=parseFloat(m[2].replace(/\s/g,'').replace(',','.'));if(!(amt>0))return null;
 let note=m[3].trim(),type=m[1]==='+'?'inc':'exp';const list=type==='inc'?INC:EXP,kw=type==='inc'?KWI:KW;
 let cat=list.find(c=>note&&c[1].toLowerCase().startsWith(note.split(/\s/)[0].toLowerCase()))?.[0];
 if(!cat){const k=kw.find(([re])=>re.test(note));cat=k?k[1]:null}
 if(!cat&&type==='exp'){const k=KWI.find(([re])=>re.test(note));if(k){type='inc';cat=k[1]}}
 return{amt,type,cat:cat||(type==='inc'?'iother':'other'),note}}
function moneyChart(m){const ms=[...Array(6)].map((_,i)=>addM(m+'-01',i-5).slice(0,7)),v=ms.map(k=>[sumM(k,'exp'),sumM(k,'inc')]),max=Math.max(1,...v.flat()),W=340,H2=150,gw=W/6,bw=16;
 return`<svg class="chart mchart" viewBox="0 0 ${W} ${H2}" role="img" aria-label="Расходы и доходы по месяцам">${ms.map((k,i)=>{const x=i*gw+gw/2-bw-2,[e,n]=v[i],he=Math.max(e?4:2,e/max*(H2-44)),hi=Math.max(n?4:2,n/max*(H2-44));return`<rect x="${x}" y="${H2-22-he}" width="${bw}" height="${he}" rx="5" class="${k===m?'acc':e?'has':''}"/><rect x="${x+bw+4}" y="${H2-22-hi}" width="${bw}" height="${hi}" rx="5" class="inc${n?'':' z'}"/>${e?`<text class="v" x="${x+bw/2}" y="${H2-28-he}" text-anchor="middle">${kfmt(e)}</text>`:''}<text x="${i*gw+gw/2}" y="${H2-6}" text-anchor="middle">${MON[+k.slice(5)-1].slice(0,3)}</text>`}).join('')}</svg><div class="legend"><span><i class="acc"></i>Расходы</span><span><i class="inc"></i>Доходы</span></div>`}
V.money=()=>{
 const t=todayS(),m=ui.mMonth||monOf(t),[y,mo]=m.split('-').map(Number),exp=sumM(m,'exp'),inc=sumM(m,'inc'),items=S.money.filter(x=>monOf(x.date)===m).sort((a,b)=>b.date.localeCompare(a.date)||(b.created||0)-(a.created||0));
 const bud=S.budgets||{},tb=EXP.reduce((a,c)=>a+(bud[c[0]]||0),0),cats=EXP.filter(c=>bud[c[0]]||sumM(m,'exp',c[0])).sort((a,b)=>sumM(m,'exp',b[0])-sumM(m,'exp',a[0]));
 const dim=new Date(y,mo,0).getDate(),dleft=m===monOf(t)?dim-pd(t).getDate()+1:0;
 let byDay='',cur='';for(const x of items){if(x.date!==cur){cur=x.date;const ds=items.filter(z=>z.date===cur&&z.type==='exp').reduce((a,z)=>a+z.amt,0);byDay+=`<h3 class="sec">${fmtDate(cur)}${ds?`<span class="cnt">−${rub(ds)}</span>`:''}</h3>`}const c=catOf(x.cat);byDay+=`<div class="mrow" data-a="mEdit" data-id="${x.id}"><span class="m-e">${c[2]}</span><span class="m-b"><b>${esc(x.note||c[1])}</b><small>${c[1]}</small></span><b class="m-a ${x.type}">${x.type==='inc'?'+':'−'}${rub(x.amt)}</b><button class="cdel st" data-a="mDel" data-id="${x.id}" aria-label="Удалить запись">${I('trash')}</button></div>`}
 return`${back()}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Бюджет · ₽</div><h1 class="display">Деньги</h1></div></header>
 <div class="wkbar"><button class="ib" data-a="mMon" data-v="-1" aria-label="Прошлый месяц">${I('chevL')}</button><span><b>${cap(MON[mo-1])}</b> ${y}</span><button class="ib" data-a="mMon" data-v="1" aria-label="Следующий месяц">${I('chevR')}</button></div>
 <div class="kpis three-k mk"><div class="kpi"><div class="v">${kfmt(exp)}</div><div class="l">Расходы</div></div><div class="kpi"><div class="v">${kfmt(inc)}</div><div class="l">Доходы</div></div><div class="kpi"><div class="v${inc-exp<0?' neg':''}">${inc-exp<0?'−':''}${kfmt(Math.abs(inc-exp))}</div><div class="l">Остаток</div></div></div>
 <form class="qa" data-f="mq" autocomplete="off"><input name="q" inputmode="text" placeholder="350 кофе  ·  +40000 зарплата" aria-label="Быстрая запись"><button aria-label="Добавить">${I('plus')}</button></form>
 <div class="chips" style="margin-top:10px">${EXP.slice(0,8).map(c=>`<button class="chip" data-a="mNew" data-v="${c[0]}">${c[2]} ${c[1]}</button>`).join('')}<button class="chip" data-a="mNew" data-v="inc">＋ Доход</button></div>
 <h3 class="sec">Бюджет месяца<button class="linkbtn" data-a="budEdit">${tb?'Изменить':'Настроить'}</button></h3>
 ${tb||cats.length?`<div class="card budget">${tb?`<div class="bud-tot"><span>Потрачено <b>${rub(exp)}</b> из ${rub(tb)}</span><small>${exp<=tb?(dleft?`можно ${rub((tb-exp)/dleft)} в день`:`осталось ${rub(tb-exp)}`):`перерасход ${rub(exp-tb)}`}</small></div><div class="g-bar"><i class="${exp>tb?'over':''}" style="width:${Math.min(100,exp/tb*100)}%"></i></div>`:''}
 ${cats.map(c=>{const s=sumM(m,'exp',c[0]),b=bud[c[0]]||0,p=b?s/b*100:0;return`<div class="bud"><div class="bud-h"><span>${c[2]} ${c[1]}</span><span><b>${rub(s)}</b>${b?` / ${rub(b)}`:''}</span></div>${b?`<div class="g-bar sm"><i class="${p>100?'over':p>85?'warn':''}" style="width:${Math.min(100,p)}%"></i></div>`:''}</div>`}).join('')}</div>`:empty('Без лимитов','<br>Задайте бюджет по категориям — увидите, сколько ещё можно тратить.')}
 <h3 class="sec">Полгода</h3><div class="card">${moneyChart(m)}</div>
 ${items.length?byDay:`<h3 class="sec">Записи</h3>`+empty('Пока пусто','<br>Запишите первую трату — например «350 кофе».')}`;
};
F.money=()=>{const cs=D.type==='inc'?INC:EXP;return`<h2 class="sh-title">${D._new?(D.type==='inc'?'Доход':'Расход'):'Запись'}</h2>
 <div class="field">${seg('type',[['exp','Расход'],['inc','Доход']],D.type)}</div>
 <div class="field amt"><input class="inp big" type="number" inputmode="decimal" step="0.01" min="0" data-m="amt" data-auto placeholder="0" value="${D.amt||''}"><span>₽</span></div>
 <div class="field"><label>Категория</label><div class="catgrid">${cs.map(c=>`<button class="${D.cat===c[0]?'on':''}" data-a="dSet" data-k="cat" data-v="${c[0]}"><span>${c[2]}</span>${c[1]}</button>`).join('')}</div></div>
 <div class="field two"><div><label>Дата</label><input class="inp" type="date" data-m="date" value="${D.date||''}"></div><div><label>Заметка</label><input class="inp" data-m="note" value="${esc(D.note)}" placeholder="Необязательно" maxlength="60"></div></div>
 <div class="btnrow"><button class="btn pri" data-a="dSave">${D._new?'Добавить':'Сохранить'}</button></div>${delBtn('запись')}`};
F.budget=()=>`<h2 class="sh-title">Бюджет на месяц</h2><p class="hint" style="margin:-6px 0 12px">Лимит по категориям в рублях. Пустое поле — без лимита.</p>
 <div class="set">${EXP.map(c=>`<div class="set-row"><span class="lbl">${c[2]} ${c[1]}</span><input class="num wide" type="number" inputmode="numeric" min="0" step="100" data-b="${c[0]}" value="${(S.budgets||{})[c[0]]||''}" placeholder="—"></div>`).join('')}</div>
 <div class="btnrow"><button class="btn pri" data-a="budSave">Сохранить</button></div>`;
NEW.money=(o={})=>{const inc=o.type==='inc'||o.cat==='inc';openSheet('money',{id:uid(),type:inc?'inc':'exp',amt:'',cat:inc?'salary':(o.cat||'food'),date:o.date||todayS(),note:'',created:Date.now(),_new:1,_focus:1})};
Object.assign(A,{
 mMon:el=>{ui.mMonth=addM((ui.mMonth||monOf(todayS()))+'-01',+el.dataset.v).slice(0,7);render()},
 mNew:el=>NEW.money({cat:el.dataset.v,date:(ui.mMonth&&ui.mMonth!==monOf(todayS()))?ui.mMonth+'-01':todayS()}),
 mEdit:(el,e)=>{if(e&&e.target.closest('.cdel'))return;const x=S.money.find(y=>y.id===el.dataset.id);if(x)openSheet('money',JSON.parse(JSON.stringify(x)))},
 mDel:el=>{const i=S.money.findIndex(y=>y.id===el.dataset.id);if(i<0)return;const x=S.money.splice(i,1)[0];save();render();vib(8);toast('Запись удалена',()=>{S.money.splice(i,0,x);save();render()})},
 budEdit:()=>openSheet('budget',{}),
 budSave:()=>{const b={};$$('.sheet [data-b]').forEach(i=>{const v=Math.round(Number(i.value));if(v>0)b[i.dataset.b]=v});S.budgets=b;save();closeSheet();render();toast('Бюджет сохранён')},
});
function mqSubmit(f){const i=f.q,p=parseMoney(i.value);if(!p){i.classList.remove('shake');void i.offsetWidth;i.classList.add('shake');toast('Начните с суммы: «350 кофе» или «+5000 стипендия»');return}
 const m=ui.mMonth,d=m&&m!==monOf(todayS())?m+'-01':todayS(),x={id:uid(),type:p.type,amt:p.amt,cat:p.cat,note:p.note,date:d,created:Date.now()};S.money.push(x);i.value='';save();render();vib(8);
 const c=catOf(x.cat);toast(`${x.type==='inc'?'+':'−'}${rub(x.amt)} · ${c[2]} ${c[1]}`,()=>{S.money=S.money.filter(y=>y.id!==x.id);save();render()});setTimeout(()=>{const q=$('[data-f=mq] input');q&&q.focus()},30)}

/* --- темы --- */
const SKINS=[['paper','Бумага',0,'#F3EFE6','#FBF9F4','#D4572A'],['sage','Шалфей',0,'#EEF1EA','#F8FAF5','#5E7D63'],['lavender','Лаванда',0,'#F1EEF6','#FAF8FD','#7A5BA8'],['mono','Монохром',0,'#F4F4F2','#FFFFFF','#111111'],['night','Ночь',1,'#11100E','#1A1917','#D4572A'],['oled','OLED',1,'#000000','#0B0B0B','#E8E2D6']];
function themeRow(){const s=S.settings,cur=s.theme==='light'?(s.lightSkin||'paper'):s.theme==='dark'?(s.darkSkin||'night'):s.theme;
 const card=(k,n,bg,sf,ac,dk)=>`<button class="skin${cur===k?' on':''}" data-a="setTheme" data-v="${k}" aria-label="Тема ${n}"><span class="sk-p" style="background:${bg}"><i style="background:${sf}"></i><i style="background:${sf};width:60%"></i><b style="background:${ac}"></b></span><span>${n}</span></button>`;
 return`<div class="set-row col"><span class="lbl">Тема<small>«Авто» — как в системе: ${SKINS.find(x=>x[0]===(s.lightSkin||'paper'))[1]} днём, ${SKINS.find(x=>x[0]===(s.darkSkin||'night'))[1]} ночью</small></span><div class="skins"><button class="skin auto${cur==='auto'?' on':''}" data-a="setTheme" data-v="auto" aria-label="Авто"><span class="sk-p sk-auto"><i></i><i></i><b></b></span><span>Авто</span></button>${SKINS.map(x=>card(x[0],x[1],x[3],x[4],x[5])).join('')}</div></div>`}
function motionRow(){return`<div class="set-row"><span class="lbl">Меньше анимаций<small>Без конфетти и вспышек${matchMedia('(prefers-reduced-motion: reduce)').matches?' · в системе уже включено':''}</small></span><button class="tog${S.settings.reduceMotion?' on':''}" data-a="motionTog" aria-label="Меньше анимаций"></button></div>`}
A.theme=()=>{const s=S.settings;s.theme=isDark()?(s.lightSkin||'paper'):(s.darkSkin||'night');save();applyTheme();render()};
A.setTheme=el=>{const v=el.dataset.v,s=S.settings,k=SKINS.find(x=>x[0]===v);s.theme=v;if(k){if(k[2])s.darkSkin=v;else s.lightSkin=v;if(v==='sage'||v==='lavender')s.accent=k[5];else if(v==='paper'&&['#5E7D63','#7A5BA8'].includes(s.accent))s.accent='#D4572A'}save();applyTheme();render()};
A.motionTog=()=>{S.settings.reduceMotion=!S.settings.reduceMotion;save();applyTheme();render()};
const rmq=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>!!S.settings.reduceMotion||rmq.matches;

/* --- анимации --- */
document.addEventListener('pointerdown',e=>{LT={x:e.clientX,y:e.clientY}},true);
function burst(pt,color){if(reduced())return;pt=pt||LT;if(!pt)return;const b=document.createElement('div');b.className='burst';b.style.left=pt.x+'px';b.style.top=pt.y+'px';if(color)b.style.setProperty('--bc',color);
 b.innerHTML='<b></b>'+[...Array(8)].map((_,i)=>`<i style="--a:${i*45+(Math.random()*16-8)}deg"></i>`).join('');document.body.appendChild(b);setTimeout(()=>b.remove(),700)}
function confetti(){if(reduced())return;const c=document.createElement('div');c.className='confetti';const cols=[getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()||'#D4572A','#5E7D63','#3E5C8A','#C49A3A','#8A5A83','#E5674F'];
 c.innerHTML=[...Array(70)].map(()=>`<i style="left:${Math.random()*100}%;background:${cols[Math.floor(Math.random()*cols.length)]};--x:${Math.round(Math.random()*160-80)}px;--r:${Math.round(Math.random()*900-450)}deg;--d:${(1.6+Math.random()*1.4).toFixed(2)}s;--dl:${(Math.random()*.35).toFixed(2)}s;${Math.random()<.4?'border-radius:50%;width:7px;height:7px':''}"></i>`).join('');document.body.appendChild(c);setTimeout(()=>c.remove(),3400)}
const _at=afterToggle;
const _tt=toggleTask;
toggleTask=function(id,li){const x=S.tasks.find(t=>t.id===id);if(x&&!x.done){let pt=null;const c=li&&li.querySelector('.chk');if(c){const r=c.getBoundingClientRect();pt={x:r.left+r.width/2,y:r.top+r.height/2}}burst(pt)}return _tt(id,li)};
afterToggle=function(done,x){_at(done,x);if(!done)return;const t=todayS(),list=S.tasks.filter(y=>y.date===t);if(x.date===t&&list.length>=3&&list.every(y=>y.done)&&!J(t).confetti){J(t).confetti=1;save();setTimeout(confetti,120)}};
if(A.habitToggle){const f=A.habitToggle;A.habitToggle=(el,e)=>{f(el,e);const h=S.habits.find(y=>y.id===el.dataset.id);if(h&&h.log[el.dataset.d||todayS()])burst()}}

/* --- достижения, выбор, «Ещё» --- */
ACH.push(['space','По полочкам','Создать пространство',()=>S.spaces.length>=1],['hw10','Отличник','Сдать 10 заданий',()=>S.homework.filter(h=>h.done).length>=10],['water7','Водный баланс','7 дней с нормой воды',()=>Object.values(S.health).filter(h=>h.water>=(S.settings.waterGoal||8)).length>=7],['money30','Счёт любит деньги','30 записей в «Деньгах»',()=>S.money.length>=30]);
SUB.push('study','health','money','spaces');
const _choose=F.choose;
F.choose=()=>_choose().replace(/<\/div>\s*$/,`<button data-a="chooseNew" data-v="money"><span class="ti">${I('wallet')}</span><span>Расход или доход<small>Деньги и бюджет</small></span></button><button data-a="chooseNew" data-v="hw"><span class="ti">${I('cap')}</span><span>Домашнее задание<small>Срок — к следующей паре</small></span></button></div>`);
const _more=V.more;
const tile2=(v,ic,b,s)=>`<button class="tile" data-a="go" data-v="${v}"><span class="ti">${I(ic)}</span><span><b>${b}</b><span>${s}</span></span></button>`;
V.more=()=>{const t=todayS(),h=S.health[t]||{},ohw=S.homework.filter(x=>!x.done).length,ls=lessonsOn(t).length,exp=sumM(monOf(t),'exp');
 return _more().replace(/(<h3 class="sec">Прогресс)/,`<h3 class="sec">Жизнь</h3><div class="tiles">${tile2('study','cap','Учёба',ls?`${ls} ${plural(ls,['пара','пары','пар'])} сегодня`:ohw?`${ohw} ${plural(ohw,['задание','задания','заданий'])}`:'Расписание и задания')}${tile2('health','heart','Здоровье',`💧 ${h.water||0}/${S.settings.waterGoal||8}${sleepMin(t)?' · сон '+hm(sleepMin(t)):''}`)}${tile2('money','wallet','Деньги',exp?`${rub(exp)} за месяц`:'Расходы и бюджет')}${tile2('spaces','layers','Пространства',S.spaces.length?S.spaces.map(s=>s.emoji).join(' '):'Жизнь, учёба…')}</div>$1`)};
const _fab=A.fab;
A.fab=(el,e)=>{const v=ui.view;if(v==='study'){const tb=ui.stTab||'tt';return tb==='hw'?NEW.hw():tb==='ex'?NEW.exam():NEW.lesson()}if(v==='money')return NEW.money();if(v==='spaces')return NEW.space();return _fab(el,e)};
document.addEventListener('submit',e=>{const f=e.target;if(f.dataset&&f.dataset.f==='mq'){e.preventDefault();e.stopImmediatePropagation();mqSubmit(f)}},true);
document.addEventListener('change',e=>{const el=e.target;
 if(el.dataset.ch==='hT'){const h=H(todayS());h[el.dataset.k]=el.value;save();e.stopImmediatePropagation();render()}
 else if(el.dataset.ch==='glassMl'){S.settings.glassMl=+el.value;save();e.stopImmediatePropagation();render()}},true);

/* ===== v6: аккаунт и синхронизация ===== */
Object.assign(IC,{
 user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5"/>',
 cloud:'<path d="M7.5 17.5h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6-1.5A3.5 3.5 0 0 0 7.5 17.5z"/>',
 sync:'<path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3M4.5 12A7.5 7.5 0 0 1 17.3 6.7"/><path d="M19.5 7.5V12h-4.5M4.5 16.5V12H9"/>'
});
const API_BASE=(typeof location!=='undefined'&&/localhost|127\.0\.0\.1/.test(location.hostname))
  ? (localStorage.getItem('ritm.api')||'https://ritm-api-3wh7.onrender.com')
  : 'https://ritm-api-3wh7.onrender.com';
const SYNC_KEY='ritm.sync.v1';
const ARR_E=['tasks','events','habits','goals','notes','templates','countdowns','spaces','lessons','homework','exams','money'];
const MAP_E=['log','journal','ach','stats','health','budgets'];
const ONE_E=['settings','timer','focus','tags','space','clean'];
const ALL_E=ARR_E.concat(MAP_E,ONE_E);
let syncMeta=null,syncBusy=false,syncTimer=null,syncPoll=null,syncStatus='idle',syncErr='',syncOffer=false;
function loadSyncMeta(){
 try{syncMeta=JSON.parse(localStorage.getItem(SYNC_KEY)||'null')}catch(e){syncMeta=null}
 if(!syncMeta||typeof syncMeta!=='object')syncMeta={token:null,email:null,since:'1970-01-01T00:00:00.000Z',lastOk:null,tomb:[]};
 if(!Array.isArray(syncMeta.tomb))syncMeta.tomb=[];
}
function saveSyncMeta(){try{localStorage.setItem(SYNC_KEY,JSON.stringify(syncMeta))}catch(e){}}
loadSyncMeta();
function touch(x){if(x&&typeof x==='object')x.updatedAt=new Date().toISOString();return x}
function ensureTimes(){
 const now=new Date().toISOString();
 ARR_E.forEach(k=>{(S[k]||[]).forEach(x=>{if(x&&!x.updatedAt)x.updatedAt=now})});
 MAP_E.forEach(k=>{const o=S[k]||{};Object.keys(o).forEach(id=>{const v=o[id];if(v&&typeof v==='object'&&!Array.isArray(v)&&!v.updatedAt)v.updatedAt=now})});
}
function collectChanges(full){
 ensureTimes();
 const out=[];
 ARR_E.forEach(ent=>{(S[ent]||[]).forEach(x=>{if(!x||!x.id)return;if(!x.updatedAt)x.updatedAt=new Date().toISOString();out.push({entity:ent,id:String(x.id),data:x,updatedAt:x.updatedAt})})});
 MAP_E.forEach(ent=>{const o=S[ent]||{};Object.keys(o).forEach(id=>{
  const v=o[id];const ua=(v&&typeof v==='object'&&v.updatedAt)||(full?new Date().toISOString():null);
  if(!ua&&!full)return;
  out.push({entity:ent,id:String(id),data:v,updatedAt:ua||new Date().toISOString()});
 })});
 ONE_E.forEach(ent=>{
  const v=S[ent];
  const ua=(v&&typeof v==='object'&&!Array.isArray(v)&&v.updatedAt)||syncMeta._one&&syncMeta._one[ent]||new Date().toISOString();
  if(!syncMeta._one)syncMeta._one={};syncMeta._one[ent]=ua;
  out.push({entity:ent,id:'_',data:v,updatedAt:ua});
 });
 (syncMeta.tomb||[]).forEach(t=>out.push({entity:t.entity,id:String(t.id),data:null,updatedAt:t.updatedAt,deletedAt:t.updatedAt}));
 return out;
}
function markOne(ent){if(!syncMeta._one)syncMeta._one={};syncMeta._one[ent]=new Date().toISOString();saveSyncMeta()}
function tomb(entity,id){
 const ua=new Date().toISOString();
 syncMeta.tomb=syncMeta.tomb.filter(t=>!(t.entity===entity&&String(t.id)===String(id)));
 syncMeta.tomb.push({entity,id:String(id),updatedAt:ua});
 if(syncMeta.tomb.length>2000)syncMeta.tomb=syncMeta.tomb.slice(-1500);
 saveSyncMeta();scheduleSync();
}
function applyRemote(items){
 if(!items||!items.length)return false;
 let changed=false;
 const nowIso=new Date().toISOString();
 items.forEach(it=>{
  const ent=it.entity,id=String(it.id);
  if(!ALL_E.includes(ent))return;
  const ua=it.updatedAt||nowIso;
  if(it.deletedAt||it.data==null){
   if(ARR_E.includes(ent)){
    const i=(S[ent]||[]).findIndex(x=>String(x.id)===id);
    if(i>=0){const loc=S[ent][i];if(!loc.updatedAt||loc.updatedAt<=ua){S[ent].splice(i,1);changed=true}}
   }else if(MAP_E.includes(ent)){
    const loc=S[ent]&&S[ent][id];
    if(S[ent]&&Object.prototype.hasOwnProperty.call(S[ent],id)){
     if(!loc||typeof loc!=='object'||!loc.updatedAt||loc.updatedAt<=ua){delete S[ent][id];changed=true}
    }
   }else if(ONE_E.includes(ent)&&id==='_'){
    /* ignore delete of singleton */
   }
   syncMeta.tomb=syncMeta.tomb.filter(t=>!(t.entity===ent&&String(t.id)===id));
   return;
  }
  const data=it.data;
  if(ARR_E.includes(ent)){
   if(!Array.isArray(S[ent]))S[ent]=[];
   const i=S[ent].findIndex(x=>String(x.id)===id);
   if(i<0){S[ent].push(Object.assign({},data,{updatedAt:ua}));changed=true}
   else{const loc=S[ent][i];if(!loc.updatedAt||loc.updatedAt<=ua){S[ent][i]=Object.assign({},data,{updatedAt:ua});changed=true}}
  }else if(MAP_E.includes(ent)){
   if(!S[ent]||typeof S[ent]!=='object')S[ent]={};
   const loc=S[ent][id];
   if(!loc||typeof loc!=='object'||!loc.updatedAt||loc.updatedAt<=ua){
    S[ent][id]=(data&&typeof data==='object'&&!Array.isArray(data))?Object.assign({},data,{updatedAt:ua}):data;
    changed=true;
   }
  }else if(ONE_E.includes(ent)&&id==='_'){
   const locUa=syncMeta._one&&syncMeta._one[ent];
   if(!locUa||locUa<=ua){
    if(ent==='settings')S.settings=Object.assign(defaults().settings,data||{});
    else S[ent]=data;
    if(!syncMeta._one)syncMeta._one={};syncMeta._one[ent]=ua;
    changed=true;
   }
  }
 });
 return changed;
}
async function api(path,opts){
 const ctrl=new AbortController();
 const t=setTimeout(()=>ctrl.abort(),90000);
 try{
  const headers=Object.assign({'Content-Type':'application/json'},(opts&&opts.headers)||{});
  if(syncMeta.token)headers.Authorization='Bearer '+syncMeta.token;
  const r=await fetch(API_BASE+path,{method:(opts&&opts.method)||'GET',headers,body:opts&&opts.body?JSON.stringify(opts.body):undefined,signal:ctrl.signal});
  const text=await r.text();
  let j=null;try{j=JSON.parse(text)}catch(e){j={error:text||('HTTP '+r.status)}}
  if(!r.ok){const err=new Error((j&&j.error)||('HTTP '+r.status));err.status=r.status;err.body=j;throw err}
  return j;
 }finally{clearTimeout(t)}
}
function setSyncStatus(st,err){syncStatus=st;syncErr=err||'';if(ui.view==='account'||ui.view==='settings')try{render()}catch(e){}}
let syncQueued=false;
async function doSync(reason){
 if(!syncMeta.token)return;
 if(syncBusy){syncQueued=true;return}
 syncBusy=true;setSyncStatus(reason==='wake'?'connecting':'syncing');
 try{
  // push then pull
  const changes=collectChanges(true);
  if(changes.length){
   const push=await api('/sync',{method:'POST',body:{changes}});
   if(push&&push.serverTime){/* ok */}
   // clear tombs that were pushed
   syncMeta.tomb=[];
  }
  const pull=await api('/sync?since='+encodeURIComponent(syncMeta.since||'1970-01-01T00:00:00.000Z'));
  const ch=applyRemote(pull.items||[]);
  if(pull.serverTime)syncMeta.since=pull.serverTime;
  syncMeta.lastOk=new Date().toISOString();
  saveSyncMeta();
  if(ch){rememberItems();save();applyTheme();render()}
  setSyncStatus('ok');
 }catch(e){
  if(e.status===401){syncMeta.token=null;syncMeta.email=null;saveSyncMeta();setSyncStatus('out','Сессия истекла');toast('Войдите снова');return}
  setSyncStatus('err',e.name==='AbortError'?'подключение…':(e.message||'Ошибка сети'));
 }finally{syncBusy=false;if(syncQueued){syncQueued=false;setTimeout(()=>doSync('queue'),80)}}
}
function scheduleSync(ms){
 if(!syncMeta.token)return;
 clearTimeout(syncTimer);
 syncTimer=setTimeout(()=>doSync('debounce'),ms==null?1200:ms);
}
function startSyncLoop(){
 clearInterval(syncPoll);
 if(!syncMeta.token)return;
 doSync('open');
 syncPoll=setInterval(()=>doSync('poll'),60000);
}
async function authRegister(email,password){
 setSyncStatus('connecting');
 const j=await api('/auth/register',{method:'POST',body:{email,password}});
 syncMeta.token=j.token;syncMeta.email=j.user.email;syncMeta.since='1970-01-01T00:00:00.000Z';saveSyncMeta();
 const localN=ARR_E.reduce((a,k)=>a+(S[k]||[]).length,0);
 syncOffer=localN>0;setSyncStatus('ok');
 if(syncOffer){/* wait */}else startSyncLoop();
}
async function authLogin(email,password){
 setSyncStatus('connecting');
 const j=await api('/auth/login',{method:'POST',body:{email,password}});
 syncMeta.token=j.token;syncMeta.email=j.user.email;saveSyncMeta();
 // ask upload if local has data
 const localN=ARR_E.reduce((a,k)=>a+(S[k]||[]).length,0);
 syncOffer=localN>0;setSyncStatus('ok');
 if(syncOffer){/* wait for user */}
 else{syncMeta.since='1970-01-01T00:00:00.000Z';saveSyncMeta();startSyncLoop()}
}
function authLogout(){
 syncMeta.token=null;syncMeta.email=null;syncMeta.since='1970-01-01T00:00:00.000Z';saveSyncMeta();
 clearInterval(syncPoll);clearTimeout(syncTimer);setSyncStatus('out');toast('Вы вышли');render();
}
async function acceptUpload(){
 syncOffer=false;syncMeta.since='1970-01-01T00:00:00.000Z';saveSyncMeta();
 await doSync('upload');toast('Локальные данные отправлены');
}
async function skipUpload(){
 syncOffer=false;syncMeta.since='1970-01-01T00:00:00.000Z';saveSyncMeta();
 // pull remote over — still LWW merge
 await doSync('open');toast('Синхронизация без полной выгрузки');
}

let _prevItems={};
function rememberItems(){
 _prevItems={};
 ARR_E.forEach(ent=>{(S[ent]||[]).forEach(x=>{
  if(!x||x.id==null)return;
  _prevItems[ent+'\0'+String(x.id)]=JSON.stringify(x);
 })});
}
const _save=save;
save=function(){
 const now=new Date().toISOString();
 try{
  ARR_E.forEach(ent=>{(S[ent]||[]).forEach(x=>{
   if(!x||x.id==null)return;
   const k=ent+'\0'+String(x.id);
   const ser=JSON.stringify(Object.assign({},x,{updatedAt:x.updatedAt||null}));
   const prev=_prevItems[k];
   if(!prev){if(!x.updatedAt)x.updatedAt=now;_prevItems[k]=JSON.stringify(x);return}
   // compare without updatedAt noise
   const strip=o=>{const c=JSON.parse(JSON.stringify(o));delete c.updatedAt;return JSON.stringify(c)};
   if(strip(JSON.parse(prev))!==strip(x)){x.updatedAt=now}
   else if(!x.updatedAt)x.updatedAt=now;
   _prevItems[k]=JSON.stringify(x);
  })});
  MAP_E.forEach(ent=>{const o=S[ent]||{};Object.keys(o).forEach(id=>{
   const v=o[id];if(v&&typeof v==='object'&&!v.updatedAt)v.updatedAt=now;
  })});
 }catch(e){}
 _save();
 if(syncMeta.token)scheduleSync();
};
rememberItems();

V.account=()=>{
 const on=!!syncMeta.token;
 const st=syncStatus==='connecting'||syncStatus==='syncing'?'подключение…'
  :syncStatus==='ok'?(syncMeta.lastOk?'Синхронизировано · '+new Date(syncMeta.lastOk).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}):'В сети')
  :syncStatus==='err'?(syncErr||'Ошибка'):'Не в сети';
 return`${back('settings','Настройки')}<header class="hd" style="margin-top:0"><div><div class="eyebrow">Облако</div><h1 class="display">Аккаунт</h1></div></header>
 <div class="card acct">
  <div class="acct-st"><span class="dot ${syncStatus}"></span><span>${esc(st)}</span></div>
  ${on?`<p class="muted" style="margin:8px 0 0">Вы вошли как <b>${esc(syncMeta.email||'')}</b></p>
   <div class="rowbtns" style="margin-top:14px">
    <button class="btn" data-a="syncNow">${I('sync')} Синхронизировать сейчас</button>
    <button class="btn" data-a="logout">Выйти</button>
   </div>`
  :`<p class="muted" style="margin:8px 0 14px">Войдите, чтобы видеть и менять данные на разных устройствах. Без аккаунта всё работает локально.</p>
   <form data-f="auth" class="authf">
    <div class="field"><label>Email</label><input name="email" type="email" autocomplete="username" required placeholder="you@example.com"></div>
    <div class="field"><label>Пароль</label><input name="password" type="password" autocomplete="current-password" required minlength="8" placeholder="минимум 8 символов"></div>
    <div class="rowbtns"><button class="btn primary" name="mode" value="login" type="submit">Войти</button>
    <button class="btn" name="mode" value="register" type="submit">Регистрация</button></div>
   </form>`}
  ${syncOffer?`<div class="card warn" style="margin-top:14px"><b>На этом устройстве есть данные</b><p class="muted">Загрузить их в аккаунт и объединить с облаком?</p>
   <div class="rowbtns"><button class="btn primary" data-a="syncUpload">Загрузить и объединить</button>
   <button class="btn" data-a="syncSkip">Только скачать</button></div></div>`:''}
  <p class="hint" style="margin-top:18px">Сервер может «засыпать» на бесплатном тарифе — при первом запросе подождите около минуты («подключение…»).</p>
 </div>`;
};

// Patch settings: account row + hint
const _settings=V.settings;
V.settings=()=>_settings()
  .replace('<h3 class="sec">Данные</h3>',`<h3 class="sec">Аккаунт</h3><div class="set"><div class="set-row"><button class="rowbtn" data-a="go" data-v="account">${I('user')} Аккаунт${syncMeta.token?`<small>${esc(syncMeta.email||'синхронизация')}</small>`:'<small>вход и синхронизация</small>'}</button></div></div><h3 class="sec">Данные</h3>`)
  .replace('данные хранятся только на этом устройстве · работает офлайн',
    syncMeta.token?'синхронизация с аккаунтом · локальная копия всегда с вами':'данные на устройстве · аккаунт — по желанию');

if(!SUB.includes('account'))SUB.push('account');
const _fabHide=['more','stats','settings','focus','plan','review','week','now','achieve','health','account','spaces'];
const _render0=render0;
render0=function(anim){
 _render0(anim);
 try{$('#fab').classList.toggle('hide',_fabHide.includes(ui.view)||['health'].includes(ui.view))}catch(e){}
};

A.syncNow=()=>{if(!syncMeta.token)return go('account');toast('Синхронизация…');doSync('manual')};
A.logout=()=>ask('Выйти из аккаунта?','Локальные данные на этом устройстве останутся.','Выйти',()=>authLogout());
A.syncUpload=()=>acceptUpload().catch(e=>toast(e.message||'Ошибка'));
A.syncSkip=()=>skipUpload().catch(e=>toast(e.message||'Ошибка'));

document.addEventListener('submit',e=>{
 const f=e.target;if(!(f&&f.dataset&&f.dataset.f==='auth'))return;
 e.preventDefault();e.stopImmediatePropagation();
 const fd=new FormData(f);const email=String(fd.get('email')||'').trim();const password=String(fd.get('password')||'');
 const mode=(e.submitter&&e.submitter.value)||'login';
 (async()=>{
  try{
   if(mode==='register')await authRegister(email,password);else await authLogin(email,password);
   toast(mode==='register'?'Аккаунт создан':'Вы вошли');render();
   if(syncOffer){/* stay on account */}else startSyncLoop();
  }catch(err){toast(err.message||'Ошибка');setSyncStatus('err',err.message)}
 })();
},true);

// Hook deletes for tombstones — wrap common removers via A after they mutate is hard; patch snap-based paths:
const _delTask=typeof delTask==='function'?delTask:null;
// Wrap remove helpers used widely
(function(){
 const wrapDel=k=>{
  const orig=A[k];if(!orig)return;
  A[k]=function(el,e){
   // capture ids before
   return orig.call(this,el,e);
  };
 };
})();
// Better: observe array length changes is heavy. Stamp tombstones in known delete actions by wrapping.
const delWrap=(name,getIds)=>{
 const o=A[name];if(!o)return;
 A[name]=function(el,e){
  let ids=[];try{ids=getIds(el)||[]}catch(ex){}
  const r=o.call(this,el,e);
  // ask() is async — for confirm dialogs, tomb after confirm is inside; patch those specifically below
  return r;
 };
};

// Patch ask-based deletes by intercepting after toast undo pattern is complex.
// Instead: monkey-patch Array splice on tracked arrays? Too magic.
// Use Mutation via wrapping save after detecting removals with a weak snapshot:
let _snapArr=null;
function snapArr(){ _snapArr={}; ARR_E.forEach(k=>_snapArr[k]=new Set((S[k]||[]).map(x=>String(x.id)))); }
function diffTomb(){
 if(!_snapArr)return;
 ARR_E.forEach(k=>{
  const now=new Set((S[k]||[]).map(x=>String(x.id)));
  _snapArr[k].forEach(id=>{if(!now.has(id))tomb(k,id)});
 });
 _snapArr=null;
}
const _ask=ask;
ask=function(title,text,ok,fn){
 return _ask(title,text,ok,function(){snapArr();try{fn()}finally{diffTomb()}});
};
// Also for immediate deletes without ask (rare): wrap save? Already scheduled.
// For A.del that splices immediately:
['dDel'].forEach(n=>{
 const o=A[n];if(!o)return;
 A[n]=function(el,e){snapArr();const r=o.call(this,el,e);diffTomb();return r};
});

document.addEventListener('visibilitychange',()=>{if(!document.hidden&&syncMeta.token)doSync('focus')});
window.addEventListener('online',()=>{if(syncMeta.token)doSync('online')});

const _setTheme=A.setTheme;if(_setTheme)A.setTheme=function(el){const r=_setTheme.call(this,el);markOne('settings');scheduleSync();return r};
const _setAccent=A.setAccent;if(_setAccent)A.setAccent=function(el){const r=_setAccent.call(this,el);markOne('settings');scheduleSync();return r};
const _setBool=A.setBool;if(_setBool)A.setBool=function(el){const r=_setBool.call(this,el);markOne('settings');scheduleSync();return r};

if(syncMeta.token)setTimeout(()=>startSyncLoop(),800);

/* ===== запуск ===== */
let lastDay=todayS();
setInterval(()=>{const t=todayS();if(t!==lastDay){lastDay=t;ui.calSel=t;render()}else if(ui.view==='today'&&!D&&!dr&&!sw&&document.activeElement.tagName!=='INPUT'&&new Date().getSeconds()<1)render()},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();checkReminders();if(!D)render()}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(ui.view==='settings')render()});
applyTheme();
{const h=location.hash.slice(1);if(V[h])ui.view=h}
if(!S.achInit){checkAch(true);S.achInit=1}
render(true);save();checkReminders();
{const p=new URLSearchParams(location.search),txt=[p.get('title'),p.get('text'),p.get('url')].filter(Boolean).join(' ').trim().slice(0,300),nw=p.get('new');
 if(txt||nw){try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}setTimeout(()=>{if(txt)NEW.task({title:txt,date:null});else if(NEW[nw]&&['task','note','dump','event','habit','cd','money','hw'].includes(nw))NEW[nw]()},350)}}
if('serviceWorker' in navigator&&location.protocol!=='file:'){
 const hadCtl=!!navigator.serviceWorker.controller;let reloaded=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadCtl&&!reloaded){reloaded=true;location.reload()}});
 addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}));
}
