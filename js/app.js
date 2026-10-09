// [漢字, 読み, 地方, 県庁所在地, 所在地の読み]
const PREFS = [
 ["北海道","ほっかいどう","北海道","札幌市","さっぽろし"],["青森県","あおもりけん","東北","青森市","あおもりし"],
 ["岩手県","いわてけん","東北","盛岡市","もりおかし"],["宮城県","みやぎけん","東北","仙台市","せんだいし"],
 ["秋田県","あきたけん","東北","秋田市","あきたし"],["山形県","やまがたけん","東北","山形市","やまがたし"],
 ["福島県","ふくしまけん","東北","福島市","ふくしまし"],["茨城県","いばらきけん","関東","水戸市","みとし"],
 ["栃木県","とちぎけん","関東","宇都宮市","うつのみやし"],["群馬県","ぐんまけん","関東","前橋市","まえばしし"],
 ["埼玉県","さいたまけん","関東","さいたま市","さいたまし"],["千葉県","ちばけん","関東","千葉市","ちばし"],
 ["東京都","とうきょうと","関東","東京（新宿区）","とうきょう（しんじゅくく）"],["神奈川県","かながわけん","関東","横浜市","よこはまし"],
 ["新潟県","にいがたけん","中部","新潟市","にいがたし"],["富山県","とやまけん","中部","富山市","とやまし"],
 ["石川県","いしかわけん","中部","金沢市","かなざわし"],["福井県","ふくいけん","中部","福井市","ふくいし"],
 ["山梨県","やまなしけん","中部","甲府市","こうふし"],["長野県","ながのけん","中部","長野市","ながのし"],
 ["岐阜県","ぎふけん","中部","岐阜市","ぎふし"],["静岡県","しずおかけん","中部","静岡市","しずおかし"],
 ["愛知県","あいちけん","中部","名古屋市","なごやし"],["三重県","みえけん","近畿","津市","つし"],
 ["滋賀県","しがけん","近畿","大津市","おおつし"],["京都府","きょうとふ","近畿","京都市","きょうとし"],
 ["大阪府","おおさかふ","近畿","大阪市","おおさかし"],["兵庫県","ひょうごけん","近畿","神戸市","こうべし"],
 ["奈良県","ならけん","近畿","奈良市","ならし"],["和歌山県","わかやまけん","近畿","和歌山市","わかやまし"],
 ["鳥取県","とっとりけん","中国","鳥取市","とっとりし"],["島根県","しまねけん","中国","松江市","まつえし"],
 ["岡山県","おかやまけん","中国","岡山市","おかやまし"],["広島県","ひろしまけん","中国","広島市","ひろしまし"],
 ["山口県","やまぐちけん","中国","山口市","やまぐちし"],["徳島県","とくしまけん","四国","徳島市","とくしまし"],
 ["香川県","かがわけん","四国","高松市","たかまつし"],["愛媛県","えひめけん","四国","松山市","まつやまし"],
 ["高知県","こうちけん","四国","高知市","こうちし"],["福岡県","ふくおかけん","九州","福岡市","ふくおかし"],
 ["佐賀県","さがけん","九州","佐賀市","さがし"],["長崎県","ながさきけん","九州","長崎市","ながさきし"],
 ["熊本県","くまもとけん","九州","熊本市","くまもとし"],["大分県","おおいたけん","九州","大分市","おおいたし"],
 ["宮崎県","みやざきけん","九州","宮崎市","みやざきし"],["鹿児島県","かごしまけん","九州","鹿児島市","かごしまし"],
 ["沖縄県","おきなわけん","九州・沖縄","那覇市","なはし"]
].map(([k,r,reg,cap,capR],i)=>({id:i,code:String(i+1).padStart(2,"0"),k,r,reg,cap,capR}));


const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const screens = {menu:$("menu"),play:$("play"),result:$("result")};
function show(name){ for(const n in screens) screens[n].hidden = n!==name; window.scrollTo(0,0); }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function toHira(s){ return s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)); }
function norm(s){ return toHira(s.normalize("NFKC").replace(/[\s・()（）]/g,"")); }
const KANA = /^[ぁ-ゖー]+$/;
const KANA_KANJI = /^[ぁ-ゖー㐀-鿿々〆]+$/;

// 都道府県名として受け付ける表記（漢字・読み、「都府県」省略可）
function prefForms(p, withKanji){
  const set = new Set([p.r]);
  if(p.k!=="北海道") set.add(p.r.replace(/(けん|と|ふ)$/,""));
  if(withKanji){ set.add(p.k); if(p.k!=="北海道") set.add(p.k.replace(/[都府県]$/,"")); }
  return set;
}
// 県庁所在地として受け付ける表記（漢字・読み、「市」省略可）
function capForms(p){
  if(p.k==="東京都") return new Set(["東京","東京都","新宿","新宿区","とうきょう","とうきょうと","しんじゅく","しんじゅくく"]);
  return new Set([p.cap, p.cap.replace(/市$/,""), p.capR, p.capR.replace(/し$/,"")].map(norm));
}

const MODES = {
  yomi:{
    glyph:"読", title:"漢字から読みを答える",
    desc:"都道府県名の読みを、ひらがなかカタカナで入力します。",
    label:"読みを入力（ひらがな・カタカナどちらでも可）", placeholder:"例：とうきょうと",
    hint:"「都・府・県」の読みは省略しても正解です。<kbd>Enter</kbd> で解答・次の問題へ。",
    valid:KANA, invalidMsg:"ひらがなかカタカナで入力してください。",
    accepts:p=>prefForms(p,false),
    render(p){
      $("boardMain").innerHTML=`<span class="code">JIS ${p.code}</span><div class="kanji" lang="ja">${p.k}</div><div class="reading" id="reveal">？</div>`;
      $("footL").textContent = p.reg==="北海道"?"北海道地方":p.reg+"地方"; $("footR").textContent="都道府県名";
    },
    reveal(p){ const r=$("reveal"); r.textContent=p.r; r.classList.add("show"); },
    answerText:p=>p.r, listMain:p=>p.k, listSub:p=>p.r
  },
  map:{
    glyph:"地", title:"地図から名前を答える",
    desc:"地図で色がついた都道府県の名前を、漢字か読みで入力します。",
    label:"都道府県名を入力（漢字・ひらがな・カタカナ可）", placeholder:"例：香川県　または　かがわ",
    hint:"「都・府・県」は省略しても正解です。沖縄県は右下の枠内にあります。<kbd>Enter</kbd> で解答・次の問題へ。",
    valid:KANA_KANJI, invalidMsg:"漢字・ひらがな・カタカナで入力してください。",
    accepts:p=>prefForms(p,true),
    render(p){
      if(!$("jmap")){ $("boardMain").innerHTML = `<div class="mapwrap">${mapSVG()}</div><div class="mapans" id="reveal">？</div>`; focusArea(); }
      document.querySelectorAll(".pf.target").forEach(e=>e.classList.remove("target"));
      const el=document.querySelector(`.pf[data-id="${p.id}"]`); el.classList.add("target");
      el.parentNode.appendChild(el); // 前面へ
      const m=MAP[p.id+1], ring=$("ring");
      const k=S.k||1;
      if(m.r<40*k){ ring.setAttribute("cx",m.c[0]); ring.setAttribute("cy",m.c[1]); ring.setAttribute("r",Math.max(9*k,m.r*.7)); ring.style.display=""; }
      else ring.style.display="none";
      ring.parentNode.appendChild(ring);
      const r=$("reveal"); r.innerHTML="？";
      $("footL").textContent="色がついた都道府県は？"; $("footR").textContent=S.area?areaOf(S.area).name+"地方":"全国";
    },
    reveal(p,ok){
      $("reveal").innerHTML=`${p.k}<small>${p.r}</small>`;
      document.querySelector(`.pf[data-id="${p.id}"]`).classList.add(ok?"ok":"ng");
      $("ring").style.display="none";
    },
    answerText:p=>`${p.k}（${p.r}）`, listMain:p=>p.k, listSub:p=>p.r
  },
  cap:{
    glyph:"庁", title:"県庁所在地を答える",
    desc:"都道府県名から、都道府県庁所在地を漢字か読みで入力します。",
    label:"県庁所在地を入力（漢字・ひらがな・カタカナ可）", placeholder:"例：仙台市　または　せんだい",
    hint:"「市」は省略しても正解です。東京都は「東京」「新宿区」どちらも正解。<kbd>Enter</kbd> で解答・次の問題へ。",
    valid:KANA_KANJI, invalidMsg:"漢字・ひらがな・カタカナで入力してください。",
    accepts:capForms,
    render(p){
      const office = p.k==="北海道"?"道庁":p.k.endsWith("都")?"都庁":p.k.endsWith("府")?"府庁":"県庁";
      $("boardMain").innerHTML=`<span class="code">JIS ${p.code}</span><div class="kanji" lang="ja">${p.k}</div><div class="sub">${p.r}</div><div class="ask">${office}所在地は？</div><div class="reading" id="reveal">？</div>`;
      $("footL").textContent = p.reg==="北海道"?"北海道地方":p.reg+"地方"; $("footR").textContent="県庁所在地";
    },
    reveal(p){ const r=$("reveal"); r.innerHTML=`<span class="cap">${p.cap}</span><span class="capr">${p.capR}</span>`; r.classList.add("show"); },
    answerText:p=>`${p.cap}（${p.capR}）`, listMain:p=>p.k, listSub:p=>`${p.cap}（${p.capR}）`
  }
};

const AREAS=[
  {key:"hoktoh",name:"北海道・東北",regs:["北海道","東北"]},
  {key:"kan",name:"関東",regs:["関東"]},
  {key:"chu",name:"中部",regs:["中部"]},
  {key:"kin",name:"近畿",regs:["近畿"]},
  {key:"chg",name:"中国",regs:["中国"]},
  {key:"shi",name:"四国",regs:["四国"]},
  {key:"kyu",name:"九州・沖縄",regs:["九州","九州・沖縄"]}
];
const areaOf=key=>AREAS.find(a=>a.key===key);
const areaIds=key=>key?PREFS.filter(p=>areaOf(key).regs.includes(p.reg)).map(p=>p.id):PREFS.map(p=>p.id);
const bestKey=()=>S.area?`${S.mode}:${S.area}`:S.mode;

// 地方モードでは地図をその地方に拡大し、ほかの都道府県を薄く表示
function focusArea(){
  const svg=$("jmap");
  if(!S.area){ svg.setAttribute("viewBox","155 0 515 562"); S.k=1; return; }
  const ids=new Set(areaIds(S.area));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const add=(x,y,w,h)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+w);y1=Math.max(y1,y+h);};
  // 九州・沖縄では沖縄の枠を九州の近くへ寄せる
  // 枠(424,437,240×122)を縮小して(275,420)へ
  const SC=.6, OX=275, OY=420;
  if(S.area==="kyu") $("okiG").setAttribute("transform",`translate(${OX-424*SC} ${OY-437*SC}) scale(${SC})`);
  svg.querySelectorAll(".pf").forEach(el=>{
    const id=+el.dataset.id, inA=ids.has(id); el.classList.toggle("out",!inA);
    if(!inA || id===12 || id===46) return; // 東京の島しょ部と沖縄は範囲計算から除外
    const b=el.getBBox(); add(b.x,b.y,b.width,b.height);
  });
  if(S.area==="kyu") add(OX,OY,240*SC,122*SC);
  const pad=Math.max(x1-x0,y1-y0)*.08;
  const w=x1-x0+pad*2, h=y1-y0+pad*2;
  svg.setAttribute("viewBox",`${x0-pad} ${y0-pad} ${w} ${h}`);
  S.k=Math.max(w/515,h/562);
}

function mapSVG(){
  let s=`<svg id="jmap" viewBox="155 0 515 562" role="img" aria-label="日本地図">`;
  s+=`<g id="okiG"><rect class="inset" x="424" y="437" width="240" height="122" rx="3"/><text class="inset-label" x="430" y="452">沖縄県</text><path class="pf" data-id="46" d="${MAP[47].d}"/></g>`;
  for(let i=1;i<=46;i++) s+=`<path class="pf" data-id="${i-1}" d="${MAP[i].d}"/>`;
  s+=`<circle class="ring" id="ring" cx="0" cy="0" r="10"/></svg>`;
  return s;
}

const BEST_KEY="todofuken-best";
function loadBest(){ try{ return JSON.parse(localStorage.getItem(BEST_KEY))||{}; }catch(e){ return {}; } }
function saveBest(mode,score){ try{ const b=loadBest(); if(!(b[mode]>=score)){ b[mode]=score; localStorage.setItem(BEST_KEY,JSON.stringify(b)); } }catch(e){} }

function renderMenu(){
  const best=loadBest();
  $("modes").innerHTML = Object.entries(MODES).map(([key,m])=>{
    const btn=`<button class="mode" type="button" data-mode="${key}">
      <span class="glyph">${m.glyph}</span>
      <span><b>${m.title}</b><small>${m.desc}</small>${best[key]!=null?`<span class="best">自己ベスト ${best[key]} / 47</span>`:""}</span>
      <span class="go">${key==="map"?"全国 →":"はじめる →"}</span>
    </button>`;
    if(key!=="map") return btn;
    const chips=AREAS.map(a=>{
      const n=areaIds(a.key).length, b=best[`map:${a.key}`];
      return `<button class="area" type="button" data-mode="map" data-area="${a.key}">${a.name}<span class="n">${b!=null?b+"/":""}${n}問</span></button>`;
    }).join("");
    return `<div class="mode-group">${btn}<div class="areas"><span class="areas-label">地方別</span>${chips}</div></div>`;
  }).join("");
}
$("modes").addEventListener("click",e=>{ const b=e.target.closest("[data-mode]"); if(!b) return; const a=b.dataset.area||null; startGame(b.dataset.mode, areaIds(a), a); });

let S=null; // {mode, order, idx, correct, misses, answered, start, full}

function startGame(mode, ids, area=null){
  const M=MODES[mode];
  S={mode, area, order:shuffle(ids), idx:0, correct:0, misses:[], answered:false, start:Date.now(), full:ids.length===areaIds(area).length, k:1};
  $("boardMain").innerHTML=""; $("resultMap").innerHTML=""; $("resultMap").hidden=true;
  $("answerLabel").textContent=M.label; $("answer").placeholder=M.placeholder; $("hintline").innerHTML=M.hint;
  show("play"); renderQ();
}
function renderQ(){
  const M=MODES[S.mode], p=PREFS[S.order[S.idx]];
  $("qnum").textContent=S.idx+1; $("qtotal").textContent=S.order.length;
  $("correct").textContent=S.correct;
  $("prog").style.width=(S.idx/S.order.length*100)+"%";
  M.render(p);
  $("feedback").hidden=true; $("feedback").className="feedback";
  $("answer").value=""; $("answer").disabled=false;
  $("submit").textContent="答える"; $("skip").hidden=false;
  S.answered=false;
  const b=$("board"); b.classList.remove("flip"); void b.offsetWidth; b.classList.add("flip");
  $("answer").focus({preventScroll:true});
}
function fb(cls,mark,html){
  const f=$("feedback"); f.className="feedback "+cls; f.hidden=false;
  f.innerHTML=(mark?`<span class="mark">${mark}</span>`:"")+`<span>${html}</span>`;
}
function judge(skipped){
  const M=MODES[S.mode], p=PREFS[S.order[S.idx]];
  const raw=$("answer").value, given=norm(raw);
  if(!skipped){
    if(!given){ fb("warn","","答えを入力してください。"); return; }
    if(!M.valid.test(given)){ fb("warn","",M.invalidMsg); return; }
  }
  S.answered=true;
  const ok = !skipped && M.accepts(p).has(given);
  M.reveal(p,ok);
  $("answer").disabled=true; $("skip").hidden=true;
  if(ok){
    S.correct++; $("correct").textContent=S.correct;
    fb("ok","○","正解！ "+esc(M.answerText(p)));
  }else{
    S.misses.push({id:p.id, given:skipped?"":raw.trim()});
    fb("ng","×",(skipped?"正解は ":"不正解。正解は ")+"<strong>"+esc(M.answerText(p))+"</strong> です。");
  }
  $("submit").textContent=S.idx+1<S.order.length?"次の問題へ":"結果を見る";
  $("submit").focus({preventScroll:true});
}
function next(){ S.idx++; if(S.idx>=S.order.length) finish(); else renderQ(); }
function rankText(c,t){
  const r=c/t;
  if(r===1) return "全問正解！ 都道府県マスターです。";
  if(r>=.9) return "お見事！ あと少しで全問正解です。";
  if(r>=.7) return "よくできました。";
  if(r>=.4) return "まずまずです。苦手な都道府県を復習しましょう。";
  return "これから覚えていきましょう。";
}
function finish(){
  const M=MODES[S.mode];
  $("prog").style.width="100%";
  const t=S.order.length, sec=Math.round((Date.now()-S.start)/1000);
  if(S.full) saveBest(bestKey(),S.correct);
  // 地図モード：ゲームの地図（正解=緑・不正解=赤）を結果画面へ移す
  const mw=document.querySelector("#boardMain .mapwrap");
  if(S.mode==="map" && mw){
    mw.querySelectorAll(".pf.target").forEach(e=>e.classList.remove("target"));
    $("ring").style.display="none";
    $("resultMap").appendChild(mw); $("resultMap").hidden=false;
  }
  $("resultMode").textContent="結果 ─ "+M.title+(S.area?`（${areaOf(S.area).name}）`:"");
  $("again").textContent=`もう一度（${areaIds(S.area).length}問）`;
  $("final").textContent=S.correct; $("finalTotal").textContent=t;
  $("rank").textContent=rankText(S.correct,t);
  $("time").textContent=`所要時間 ${Math.floor(sec/60)}分${String(sec%60).padStart(2,"0")}秒`;
  const m=$("misses");
  if(!S.misses.length){ m.innerHTML='<p class="perfect">間違えた問題はありません。</p>'; $("retryMiss").hidden=true; }
  else{
    m.innerHTML=`<h2>間違えた問題（${S.misses.length}）</h2><ul>`+S.misses.map(x=>{
      const p=PREFS[x.id];
      return `<li><span class="k">${M.listMain(p)}</span><span class="r">${M.listSub(p)}</span><span class="y">${x.given?"あなたの答え："+esc(x.given):"わからない"}</span></li>`;
    }).join("")+"</ul>";
    $("retryMiss").hidden=false;
  }
  show("result");
}

const act=()=>{ if(S) (S.answered?next():judge(false)); };
$("form").addEventListener("submit",e=>e.preventDefault());
$("submit").addEventListener("click",act);
$("answer").addEventListener("keydown",e=>{
  if(e.key!=="Enter") return;
  if(e.isComposing||e.keyCode===229) return; // IME変換確定のEnterは無視
  e.preventDefault(); act();
});
$("skip").addEventListener("click",()=>{ if(S&&!S.answered) judge(true); });
$("quit").addEventListener("click",()=>{ S=null; renderMenu(); show("menu"); });
$("again").addEventListener("click",()=>startGame(S.mode,areaIds(S.area),S.area));
$("retryMiss").addEventListener("click",()=>startGame(S.mode,S.misses.map(x=>x.id),S.area));
$("toMenu").addEventListener("click",()=>{ renderMenu(); show("menu"); });
renderMenu();
// ── 学習用地図 ──
const REGIONS=[["北海道","hok"],["東北","toh"],["関東","kan"],["中部","chu"],["近畿","kin"],["中国","chg"],["四国","shi"],["九州・沖縄","kyu"]];
const RCLS=Object.fromEntries(REGIONS.map(([n,c])=>[n,c])); RCLS["九州"]="kyu";
const shortName=p=>p.k==="北海道"?p.k:p.k.replace(/[都府県]$/,"");
function studySVG(){
  let s=`<svg viewBox="155 0 515 562" role="img" aria-label="都道府県名つき日本地図">`;
  s+=`<rect class="inset" x="424" y="437" width="240" height="122" rx="3"/><text class="inset-label" x="430" y="452">沖縄県</text>`;
  for(const p of PREFS) s+=`<path class="sp r-${RCLS[p.reg]}" data-id="${p.id}" d="${MAP[p.id+1].d}"><title>${p.k}</title></path>`;
  let lines="", labels="";
  for(const p of PREFS){
    const L=LBL[p.id+1], c=MAP[p.id+1].c;
    if(L.length>2){
      lines+=`<line class="lead-line" x1="${c[0]}" y1="${c[1]}" x2="${L[0]+(L[2]==="start"?-2:L[2]==="end"?2:0)}" y2="${L[1]+(L[2]==="middle"?(L[1]>c[1]?-5:5):0)}"/><circle class="lead-dot" cx="${c[0]}" cy="${c[1]}" r="1"/>`;
    }
    const big=p.id===0?" big":"";
    labels+=`<text class="lbl${big}" data-id="${p.id}" x="${L[0]}" y="${L[1]}" style="text-anchor:${L[2]||"middle"}">${shortName(p)}</text><text class="blank" data-b="${p.id}" x="${L[0]}" y="${L[1]}" style="text-anchor:${L[2]||"middle"}">?</text>`;
  }
  return s+lines+labels+`</svg>`;
}
function initStudy(){
  $("smapScroll").innerHTML=studySVG();
  $("legend").innerHTML=REGIONS.map(([n,c])=>`<span><i style="background:var(--rg-${c})"></i>${n}</span>`).join("");
  const svg=$("smapScroll").querySelector("svg");
  svg.addEventListener("click",e=>{
    const t=e.target.closest("[data-id]"); if(!t) return;
    const p=PREFS[+t.dataset.id];
    svg.querySelectorAll(".sp.sel").forEach(x=>x.classList.remove("sel"));
    const path=svg.querySelector(`.sp[data-id="${p.id}"]`); path.classList.add("sel");
    svg.querySelector(`.lbl[data-id="${p.id}"]`).classList.add("shown"); svg.querySelector(`.blank[data-b="${p.id}"]`).classList.remove("on");
    const office=p.k==="北海道"?"道庁":p.k.endsWith("都")?"都庁":p.k.endsWith("府")?"府庁":"県庁";
    const i=$("info"); i.classList.remove("empty");
    i.innerHTML=`<span class="ik">${p.k}</span><span class="ir">${p.r}</span><span class="im">${p.reg==="北海道"?"北海道":p.reg}地方 ・ ${office}所在地 <b>${p.cap}</b>（${p.capR}）</span>`;
  });
  const toggle=(btn,cls,after)=>btn.addEventListener("click",()=>{
    const on=!$("study").classList.contains(cls); $("study").classList.toggle(cls,on); btn.setAttribute("aria-pressed",on); after&&after(on);
  });
  toggle($("tHide"),"hide",on=>{ svg.querySelectorAll(".lbl.shown").forEach(x=>x.classList.remove("shown")); svg.querySelectorAll(".blank").forEach(b=>b.classList.toggle("on",on)); });
  toggle($("tZoom"),"zoom",on=>{ if(on) requestAnimationFrame(()=>{ const sc=$("smapScroll"), W=sc.scrollWidth, H=sc.scrollHeight; sc.scrollLeft=(400-155)/515*W-sc.clientWidth/2; sc.scrollTop=300/562*H-sc.clientHeight/2; }); });
  if($("smapScroll").clientWidth<520) $("tZoom").click(); // スマホでは最初から拡大表示
}
initStudy();
