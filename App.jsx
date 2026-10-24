import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import {
  Trophy, Shield, Users, Swords, Medal, Menu, X, Globe, LogIn,
  UserPlus, ChevronLeft, CalendarDays, Zap, ChartNoAxesColumnIncreasing,
  Settings, LogOut, CheckCircle2, AlertCircle
} from 'lucide-react';

const copy = {
  ar: {
    navHome:'الرئيسية', navTournaments:'البطولات', navSquads:'السكوادات', navRanking:'الترتيب',
    login:'دخول', join:'أنشئ حسابك', eyebrow:'منصتك التنافسية تبدأ هنا',
    heroTitle:'نافس بقوة.\\nاكتب تاريخك.', heroDesc:'منصة MADANI لإدارة سكوادات وبطولات Free Fire — كل المنافسة في مكان واحد.',
    tournaments:'البطولات', squads:'السكوادات', ranking:'ترتيب الفرق', dashboard:'لوحة الإدارة',
    explore:'استكشف البطولات', create:'أنشئ سكوادك', live:'ساحة المنافسة', upcoming:'البطولات القادمة',
    all:'عرض الكل', emptyT:'لا توجد بطولات بعد', emptyS:'لا توجد سكوادات بعد',
    emptyR:'ستظهر النتائج هنا بعد إضافة بيانات البطولة.', features:'كل ما يحتاجه فريقك',
    featuresDesc:'أدوات واضحة للاعبين والمنظمين، مصممة لتكبر مع مجتمع MADANI.',
    f1:'إدارة السكوادات', f1d:'أنشئ فريقك وأضف الأعضاء وحدد الكابتن.',
    f2:'بطولات منظمة', f2d:'اعرض تفاصيل البطولة وحالتها وتاريخ بدايتها.',
    f3:'ترتيب شفاف', f3d:'تابع النقاط والمراكز والنتائج في مكان واحد.',
    f4:'لوحة إدارة', f4d:'أضف البطولات والنتائج من قاعدة البيانات.',
    footer:'MADANI ARENA — العب بروح الفريق.', language:'English',
    authTitle:'أهلاً بك في MADANI', email:'البريد الإلكتروني', password:'كلمة المرور',
    nickname:'اسم اللاعب', signIn:'تسجيل الدخول', signUp:'إنشاء الحساب', cancel:'إلغاء',
    authHint:'يتم حفظ الحساب عبر Supabase بعد إعداد المشروع.', needConfig:'اربط Supabase لتفعيل الحسابات والبيانات الحقيقية.',
    signedIn:'تم تسجيل الدخول', signedOut:'تم تسجيل الخروج', authError:'تعذر إكمال العملية',
    profile:'حسابي', admin:'إدارة المنصة', adminHint:'صلاحيات الإدارة تُضبط من قاعدة البيانات، لا من الواجهة فقط.',
    tournamentName:'اسم البطولة', game:'اللعبة', startDate:'تاريخ البداية', status:'الحالة',
    addTournament:'إضافة بطولة', addResult:'إضافة نتيجة', squadName:'اسم السكواد', tag:'التاق',
    createSquad:'إنشاء سكواد', points:'النقاط', kills:'القتلات', placement:'المركز',
    save:'حفظ', saving:'جارٍ الحفظ…', saved:'تم الحفظ', noPermission:'ليس لديك صلاحية الإدارة.',
    statusOpen:'التسجيل مفتوح', statusSoon:'قريباً', statusLive:'مباشرة', statusDone:'انتهت',
    connected:'قاعدة البيانات متصلة', demo:'وضع معاينة — اربط قاعدة البيانات لتفعيل الوظائف.',
    members:'أعضاء', region:'المنطقة', captain:'الكابتن', close:'إغلاق'
  },
  en: {
    navHome:'Home', navTournaments:'Tournaments', navSquads:'Squads', navRanking:'Rankings',
    login:'Log in', join:'Create account', eyebrow:'Your competitive journey starts here',
    heroTitle:'Compete hard.\\nMake history.', heroDesc:'MADANI manages Free Fire squads and tournaments — all your competition in one place.',
    tournaments:'Tournaments', squads:'Squads', ranking:'Team rankings', dashboard:'Admin panel',
    explore:'Explore tournaments', create:'Create your squad', live:'THE ARENA', upcoming:'Upcoming tournaments',
    all:'View all', emptyT:'No tournaments yet', emptyS:'No squads yet',
    emptyR:'Results will appear here when tournament data is added.', features:'Everything your team needs',
    featuresDesc:'Simple tools for players and organizers, built to grow with the MADANI community.',
    f1:'Squad management', f1d:'Create your team, add members and assign a captain.',
    f2:'Organized tournaments', f2d:'Show tournament details, status and start date.',
    f3:'Transparent rankings', f3d:'Track points, placements and results in one place.',
    f4:'Admin dashboard', f4d:'Add tournaments and results through the database.',
    footer:'MADANI ARENA — Play as one.', language:'العربية',
    authTitle:'Welcome to MADANI', email:'Email address', password:'Password',
    nickname:'Player name', signIn:'Log in', signUp:'Create account', cancel:'Cancel',
    authHint:'Accounts are stored with Supabase once configured.', needConfig:'Connect Supabase to enable real accounts and data.',
    signedIn:'Signed in', signedOut:'Signed out', authError:'Could not complete the request',
    profile:'My account', admin:'Platform admin', adminHint:'Admin permissions are enforced by the database, not just the UI.',
    tournamentName:'Tournament name', game:'Game', startDate:'Start date', status:'Status',
    addTournament:'Add tournament', addResult:'Add result', squadName:'Squad name', tag:'Tag',
    createSquad:'Create squad', points:'Points', kills:'Kills', placement:'Placement',
    save:'Save', saving:'Saving…', saved:'Saved', noPermission:'You do not have admin permission.',
    statusOpen:'Registration open', statusSoon:'Coming soon', statusLive:'Live', statusDone:'Finished',
    members:'Members', region:'Region', captain:'Captain', close:'Close'
  }
};

const sampleTournaments = [
  { id:'demo-1', name:'MADANI CHAMPIONSHIP S1', game:'Free Fire', start_date:null, status:'soon', _demo:true },
  { id:'demo-2', name:'MADANI NIGHT CUP', game:'Free Fire', start_date:null, status:'open', _demo:true },
];
const sampleSquads = [
  {id:'demo-s1', name:'MADANI TWISTED', tag:'MDN', region:'MENA', _demo:true},
  {id:'demo-s2', name:'NEON PHANTOMS', tag:'NPH', region:'MENA', _demo:true},
];
const statusKey = {open:'statusOpen', soon:'statusSoon', live:'statusLive', done:'statusDone'};

export default function App() {
  const [lang, setLang] = useState('ar');
  const [page, setPage] = useState('home');
  const [menu, setMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [user, setUser] = useState(null);
  const [tournaments, setTournaments] = useState(sampleTournaments);
  const [squads, setSquads] = useState(sampleSquads);
  const [results, setResults] = useState([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [tName, setTName] = useState('');
  const [tDate, setTDate] = useState('');
  const [tStatus, setTStatus] = useState('soon');
  const [sName, setSName] = useState('');
  const [sTag, setSTag] = useState('');
  const [rSquad, setRSquad] = useState('');
  const [rPoints, setRPoints] = useState('0');
  const [rKills, setRKills] = useState('0');
  const [rPlace, setRPlace] = useState('1');
  const t = copy[lang];
  const connected = !!supabase;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    loadData();
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadData() {
    if (!supabase) return;
    const [ts, ss, rs] = await Promise.all([
      supabase.from('tournaments').select('*').order('created_at', {ascending:false}),
      supabase.from('squads').select('*').order('created_at', {ascending:false}),
      supabase.from('tournament_results').select('*, squads(name,tag)').order('points', {ascending:false})
    ]);
    if (!ts.error) setTournaments(ts.data);
    if (!ss.error) setSquads(ss.data);
    if (!rs.error) setResults(rs.data);
  }

  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setNotice('');
    if (!supabase) { setNotice(t.needConfig); setBusy(false); return; }
    try {
      if (authMode === 'up') {
        const {error} = await supabase.auth.signUp({email, password, options:{data:{nickname}}});
        if (error) throw error;
        setNotice(t.signedIn + ' — تحقق من بريدك إذا طُلب منك ذلك.');
      } else {
        const {error} = await supabase.auth.signInWithPassword({email, password});
        if (error) throw error;
        setAuthOpen(false); setNotice(t.signedIn);
      }
    } catch (e) { setNotice(e.message || t.authError); }
    setBusy(false);
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null); setNotice(t.signedOut);
  }

  async function addTournament(e) {
    e.preventDefault();
    if (!supabase) return setNotice(t.needConfig);
    setBusy(true);
    const {error} = await supabase.from('tournaments').insert({name:tName, game:'Free Fire', start_date:tDate || null, status:tStatus});
    setBusy(false);
    if (error) setNotice(error.message); else {setTName(''); setTDate(''); setNotice(t.saved); loadData();}
  }

  async function addSquad(e) {
    e.preventDefault();
    if (!supabase) return setNotice(t.needConfig);
    setBusy(true);
    const {error} = await supabase.from('squads').insert({name:sName, tag:sTag.toUpperCase(), region:'MENA', captain_id:user.id});
    setBusy(false);
    if (error) setNotice(error.message); else {setSName(''); setSTag(''); setNotice(t.saved); loadData();}
  }

  async function addResult(e) {
    e.preventDefault();
    if (!supabase) return setNotice(t.needConfig);
    setBusy(true);
    const {error} = await supabase.from('tournament_results').insert({squad_id:rSquad, points:Number(rPoints), kills:Number(rKills), placement:Number(rPlace)});
    setBusy(false);
    if (error) setNotice(error.message); else {setNotice(t.saved); loadData();}
  }

  const nav = [
    ['home', t.navHome, Shield], ['tournaments', t.navTournaments, Trophy],
    ['squads', t.navSquads, Users], ['ranking', t.navRanking, Medal]
  ];
  const go = (p) => {setPage(p); setMenu(false); window.scrollTo({top:0,behavior:'smooth'});};

  return <div className="app" dir={dir}>
    <header className="topbar">
      <button className="icon-btn mobile-menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      <button className="brand" onClick={()=>go('home')}><span className="brand-mark"><Swords size={23}/></span><span><b>MADANI</b><small>ARENA</small></span></button>
      <nav className={`nav ${menu?'nav-open':''}`}>{nav.map(([id,label,Icon])=><button key={id} className={page===id?'nav-item active':'nav-item'} onClick={()=>go(id)}><Icon size={16}/>{label}</button>)}</nav>
      <div className="top-actions">
        <button className="language" onClick={()=>setLang(lang==='ar'?'en':'ar')}><Globe size={16}/><span>{t.language}</span></button>
        {user ? <button className="btn btn-outline small" onClick={logout}><LogOut size={16}/>{t.login}</button> :
          <button className="btn btn-green small" onClick={()=>{setAuthMode('in');setAuthOpen(true)}}><LogIn size={16}/>{t.login}</button>}
      </div>
    </header>

    {notice && <div className="notice" role="status"><AlertCircle size={17}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}

    {page==='home' && <>
      <main>
        <section className="hero">
          <div className="hero-grid"></div>
          <div className="hero-content">
            <div className="eyebrow"><span className="pulse"></span>{t.eyebrow}</div>
            <h1>{t.heroTitle.split('\\n').map((line,i)=><React.Fragment key={line}>{i>0&&<br/>}{line}</React.Fragment>)}</h1>
            <p>{t.heroDesc}</p>
            <div className="hero-actions">
              <button className="btn btn-green" onClick={()=>go('tournaments')}>{t.explore}<ChevronLeft size={18}/></button>
              <button className="btn btn-outline" onClick={()=>{if(!user){setAuthMode('up');setAuthOpen(true)}else go('squads')}}>{t.create}<Users size={17}/></button>
            </div>
            <div className="hero-stats">
              <div><b>{connected?tournaments.filter(x=>!x._demo).length:'—'}</b><span>{t.tournaments}</span></div>
              <div><b>{connected?squads.filter(x=>!x._demo).length:'—'}</b><span>{t.squads}</span></div>
              <div><b>24/7</b><span>{t.live}</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="ring ring-one"></div><div className="ring ring-two"></div>
            <div className="arena-shield"><Swords size={86} strokeWidth={1.2}/><span>M</span></div>
            <div className="float-card card-top"><Zap size={17}/><span>COMPETE</span></div>
            <div className="float-card card-bottom"><Trophy size={18}/><span>VICTORY IS EARNED</span></div>
          </div>
          <div className="hero-bottom-line"><span>01 / MADANI ARENA</span><span>EST. 2026</span></div>
        </section>

        <section className="section">
          <div className="section-heading"><div><span className="section-kicker">01 — COMPETE</span><h2>{t.upcoming}</h2><p>{t.featuresDesc}</p></div><button className="text-link" onClick={()=>go('tournaments')}>{t.all}<ChevronLeft size={16}/></button></div>
          <div className="tournament-grid">
            {tournaments.slice(0,3).map((item,i)=><article className="tournament-card" key={item.id}>
              <div className="card-banner"><div className="banner-pattern"></div><span className="game-label"><Swords size={14}/> FREE FIRE</span><span className="tournament-number">0{i+1}</span><Trophy className="banner-trophy" size={53}/></div>
              <div className="tournament-body"><div className="status-line"><span className={`status-dot ${item.status}`}></span>{t[statusKey[item.status]||'statusSoon']}</div><h3>{item.name}</h3><div className="card-meta"><span><CalendarDays size={15}/>{item.start_date||'TBA'}</span><span><Users size={15}/>{t.squads}</span></div><button className="card-link" onClick={()=>setNotice(t.needConfig)}>{t.explore}<ChevronLeft size={16}/></button></div>
            </article>)}
            {tournaments.length===0&&<div className="empty-state">{t.emptyT}</div>}
          </div>
        </section>

        <section className="feature-section">
          <div className="section-heading"><div><span className="section-kicker">02 — YOUR ADVANTAGE</span><h2>{t.features}</h2><p>{t.featuresDesc}</p></div></div>
          <div className="feature-grid">
            {[[Users,'f1','f1d'],[Trophy,'f2','f2d'],[ChartNoAxesColumnIncreasing,'f3','f3d'],[Settings,'f4','f4d']].map(([Icon,title,desc],i)=><div className="feature-card" key={title}><span className="feature-index">0{i+1}</span><div className="feature-icon"><Icon size={23}/></div><h3>{t[title]}</h3><p>{t[desc]}</p></div>)}
          </div>
        </section>
      </main>
    </>}

    {page==='tournaments' && <main className="page-wrap"><div className="page-heading"><span className="section-kicker">01 — COMPETE</span><h1>{t.navTournaments}</h1><p>{t.heroDesc}</p></div><div className="tournament-grid">{tournaments.map((item,i)=><article className="tournament-card" key={item.id}><div className="card-banner"><div className="banner-pattern"></div><span className="game-label"><Swords size={14}/> {item.game||'FREE FIRE'}</span><span className="tournament-number">0{i+1}</span><Trophy className="banner-trophy" size={53}/></div><div className="tournament-body"><div className="status-line"><span className={`status-dot ${item.status}`}></span>{t[statusKey[item.status]||'statusSoon']}</div><h3>{item.name}</h3><div className="card-meta"><span><CalendarDays size={15}/>{item.start_date||'TBA'}</span></div></div></article>)}{!tournaments.length&&<div className="empty-state">{t.emptyT}</div>}</div></main>}

    {page==='squads' && <main className="page-wrap"><div className="page-heading"><span className="section-kicker">02 — TEAMS</span><h1>{t.navSquads}</h1><p>{t.f1d}</p></div>{user&&<form className="inline-form" onSubmit={addSquad}><input required value={sName} onChange={e=>setSName(e.target.value)} placeholder={t.squadName}/><input required maxLength="6" value={sTag} onChange={e=>setSTag(e.target.value)} placeholder={t.tag}/><button className="btn btn-green" disabled={busy}>{t.createSquad}</button></form>}<div className="squad-grid">{squads.map(s=><article className="squad-card" key={s.id}><div className="squad-emblem"><Shield size={28}/></div><div className="squad-info"><h3>{s.name}</h3><p>{s.region||'MENA'} · {t.members}: {s.member_count??'—'}</p></div><span className="squad-tag">{s.tag}</span></article>)}{!squads.length&&<div className="empty-state">{t.emptyS}</div>}</div>{!user&&<p className="helper-line">{t.needConfig}</p>}</main>}

    {page==='ranking' && <main className="page-wrap"><div className="page-heading"><span className="section-kicker">03 — LEADERBOARD</span><h1>{t.navRanking}</h1><p>{t.emptyR}</p></div><div className="ranking-table"><div className="ranking-row ranking-head"><span>#</span><span>{t.squads}</span><span>{t.kills}</span><span>{t.points}</span></div>{results.map((r,i)=><div className="ranking-row" key={r.id}><span className="rank-number">{String(i+1).padStart(2,'0')}</span><span className="rank-team"><Shield size={19}/>{r.squads?.name||'Squad'} <small>{r.squads?.tag}</small></span><span>{r.kills}</span><b>{r.points}</b></div>)}{!results.length&&<div className="empty-state">{t.emptyR}</div>}</div></main>}

    {page==='admin' && <main className="page-wrap"><div className="page-heading"><span className="section-kicker">04 — CONTROL ROOM</span><h1>{t.admin}</h1><p>{t.adminHint}</p></div>{!user?<div className="empty-state">{t.needConfig}</div>:<div className="admin-grid"><form className="admin-card" onSubmit={addTournament}><h3><Trophy size={19}/>{t.addTournament}</h3><label>{t.tournamentName}<input required value={tName} onChange={e=>setTName(e.target.value)}/></label><label>{t.startDate}<input type="date" value={tDate} onChange={e=>setTDate(e.target.value)}/></label><label>{t.status}<select value={tStatus} onChange={e=>setTStatus(e.target.value)}><option value="soon">{t.statusSoon}</option><option value="open">{t.statusOpen}</option><option value="live">{t.statusLive}</option><option value="done">{t.statusDone}</option></select></label><button className="btn btn-green" disabled={busy}>{t.save}</button></form><form className="admin-card" onSubmit={addResult}><h3><Medal size={19}/>{t.addResult}</h3><label>{t.squads}<select required value={rSquad} onChange={e=>setRSquad(e.target.value)}><option value="">—</option>{squads.filter(s=>!s._demo).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>{t.points}<input type="number" min="0" value={rPoints} onChange={e=>setRPoints(e.target.value)}/></label><label>{t.kills}<input type="number" min="0" value={rKills} onChange={e=>setRKills(e.target.value)}/></label><label>{t.placement}<input type="number" min="1" value={rPlace} onChange={e=>setRPlace(e.target.value)}/></label><button className="btn btn-green" disabled={busy}>{t.save}</button></form></div>}</main>}

    <footer className="footer"><button className="brand footer-brand" onClick={()=>go('home')}><span className="brand-mark"><Swords size={22}/></span><span><b>MADANI</b><small>ARENA</small></span></button><span>{t.footer}</span><button className="text-link" onClick={()=>go('admin')}><Settings size={15}/>{t.dashboard}</button></footer>

    {authOpen&&<div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><div className="auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthOpen(false)}><X/></button><span className="brand-mark modal-mark"><Swords size={25}/></span><h2>{t.authTitle}</h2><p>{t.authHint}</p><form onSubmit={authenticate}>{authMode==='up'&&<label>{t.nickname}<input required value={nickname} onChange={e=>setNickname(e.target.value)}/></label>}<label>{t.email}<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t.password}<input type="password" required minLength="6" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn btn-green full-btn" disabled={busy}>{authMode==='up'?<UserPlus size={17}/>:<LogIn size={17}/>}{authMode==='up'?t.signUp:t.signIn}</button></form><button className="switch-auth" onClick={()=>setAuthMode(authMode==='in'?'up':'in')}>{authMode==='in'?t.signUp:t.signIn}</button><button className="cancel-link" onClick={()=>setAuthOpen(false)}>{t.cancel}</button></div></div>}
  </div>;
}