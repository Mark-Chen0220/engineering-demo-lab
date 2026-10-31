'use strict';
(() => {
  const $=id=>document.getElementById(id),labs=window.LAB_CATALOG;
  const repo='https://github.com/Mark-Chen0220/engineering-demo-lab';
  let filter='all',query='',activeLab=null,previousScroll=0,toastTimer,loadingTimer;
  const svgIcon=id=>`<svg class="icon" aria-hidden="true"><use href="#icon-${id}"/></svg>`;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const line=(d,color='#839e70',width=1.3,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const text=(x,y,s,size=8,color='#8e9e80',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="Consolas,monospace" ${extra}>${s}</text>`;
  const poly=points=>points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(2)).join(' ')).join(' ');
  const grid=(dark=false)=>{let s='';for(let x=30;x<=330;x+=25)s+=line(`M${x} 28V172`,dark?'#789675':'#bccab0',.5,'opacity=".25"');for(let y=35;y<=170;y+=25)s+=line(`M30 ${y}H330`,dark?'#789675':'#bccab0',.5,'opacity=".25"');return s;};
  function adcArt(hero=false){
    const chips=[{x:65,y:102,c:'#648e79',label:'IN'},{x:147,y:88,c:'#c8754a',label:'ΣΔ'},{x:229,y:74,c:'#8d9f6b',label:'FIR'}];
    return `<g transform="translate(${hero?0:10} ${hero?-8:-9})">`+line('M32 151 282 187 341 112 91 76Z','#bbc8a6',.8,'opacity=".6"')+`<path d="M32 151 282 187 341 112 91 76 32 151V159L282 195 341 120V112L282 187" fill="#d6dfc8" stroke="#b9c8a7" stroke-width=".8"/>`+line('M69 129 126 138 172 119 239 126','#8da67c',1.4)+line('M187 119V160L127 151V141','#9fae80',1.3)+line('M69 129 126 138 172 119 239 126','#f4f7ec',2.5,hero?'class="signal-pulse"':'stroke-dasharray="3 13"')+chips.map((c,i)=>`<g><path d="M${c.x} ${c.y}l53 8 24-23-53-8Z" fill="${c.c}"/><path d="M${c.x} ${c.y}v26l53 8V${c.y+8}Z" fill="${i===1?'#b6603c':'#55785c'}"/><path d="M${c.x+53} ${c.y+8}v26l24-23v-26Z" fill="${i===1?'#d78a50':'#7f986c'}"/>${text(c.x+34,c.y-3,c.label,10,i===1?'#ffe7bd':'#e3efce','text-anchor="middle"')}${[0,1,2,3].map(j=>line(`M${c.x+7+j*10} ${c.y+25+j*1.45}v5`,'#c5bc86',2)).join('')}</g>`).join('')+text(95,181,'ANALOG',7,'#8b9d79')+text(251,172,'DIGITAL',7,'#8b9d79')+`<circle cx="187" cy="85" r="2" fill="#f4d08a" ${hero?'class="chip-led"':''}/></g>`;
  }
  function art(type,hero=false){let s='';
    if(type==='adc')s=adcArt(hero);
    if(type==='euler'){
      const positions=[[71,66],[137,66],[203,66],[269,66],[71,132],[137,132],[203,132],[269,132]];
      s=grid()+line('M45 46H305M45 154H305','#91a77b',1)+text(45,37,'VDD',7)+text(45,168,'GND',7);
      [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[0,4],[2,6]].forEach(([a,b])=>{const A=positions[a],B=positions[b];s+=line(`M${A[0]} ${A[1]}L${B[0]} ${B[1]}`,'#668a68',2);});
      positions.forEach(([x,y],i)=>{s+=`<circle cx="${x}" cy="${y}" r="8" fill="${i===1||i===6?'#c38152':'#a5b78c'}" stroke="#f0f4e6" stroke-width="2"/>`+text(x,y+3,String.fromCharCode(65+i%4),7,'#f8fbef','text-anchor="middle"');});
      s+=line('M71 66 137 66 203 66 203 132 137 132 71 132','#d9a576',2.8,'stroke-dasharray="3 5"')+text(230,179,'EULER TRAIL',7);
    }
    if(type==='latchup'){
      s=`<path d="M42 81 263 81 319 109 98 109Z" fill="#cbd8b8"/><path d="M42 81v59l56 29v-60Z" fill="#8eac8c"/><path d="M98 109h221v60H98Z" fill="#b7c79e"/><path d="M154 109h105v37H154Z" fill="#8da887"/><path d="M109 109h28v13h-28zM191 109h28v13h-28zM271 109h28v13h-28z" fill="#c28056"/><path d="M143 109h34v13h-34zM233 109h25v13h-25z" fill="#e4cf9e"/>`+text(71,68,'CMOS CROSS-SECTION',7)+text(159,137,'N-WELL',7,'#eaf1dc')+text(144,160,'P-SUBSTRATE',7,'#6d8861')+line('M121 108V64H209V109','#849b6e',1.5)+line('M210 137H283V110','#c18053',1.8,'stroke-dasharray="4 4"')+line('M283 110V53H124V95','#c18053',1.8,'stroke-dasharray="4 4"')+text(235,45,'FEEDBACK',7,'#bd8157');
    }
    if(type==='noise'){
      s=grid();let a=[],b=[];for(let i=0;i<160;i++){const x=32+i*1.85,y=103-26*Math.sin(i/20);a.push([x,y+(Math.sin(i*4.7)*.5+Math.sin(i*8.31)*.5)*32]);b.push([x,y+Math.sin(i*1.3)*2.7]);}
      s+=line(poly(a),'#bec8ad',1)+line(poly(b),'#6c926c',2)+text(41,40,'INPUT + NOISE',7,'#a5b394')+text(228,167,'AVERAGED',7,'#668865');
    }
    if(type==='motion'){
      s=grid();const c=(r,op)=>`<circle cx="180" cy="99" r="${r}" fill="none" stroke="#9eb38d" stroke-width=".8" opacity="${op}"/>`;s+=c(64,.7)+c(48,.35)+c(28,.25);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=180+Math.cos(a)*64,y=99+Math.sin(a)*64;s+=`<circle cx="${x}" cy="${y}" r="2" fill="#8ca77a"/>`;}
      for(let i=0;i<3;i++){const a=i*120+15;s+=`<path d="M176 99C149 84 136 51 153 39c20-12 27 42 31 60Z" fill="#bfcfac" opacity=".6" transform="rotate(${a} 180 99)"/>`;}
      for(let i=0;i<3;i++)s+=`<path d="M176 99C149 84 136 51 153 39c20-12 27 42 31 60Z" fill="#789772" transform="rotate(${i*120-18} 180 99)"/>`;
      s+=`<circle cx="180" cy="99" r="8" fill="#d2b37e" stroke="#f3f5e9" stroke-width="2"/>`+text(37,175,'SAMPLE',7)+line('M85 172H131M143 172H189M201 172H247M259 172H305','#b3c1a0',1)+text(252,40,'fₛ ↔ f',10);
    }
    if(type==='response'){
      s=grid()+line('M36 158V38M36 158H323','#a7b697',1)+line('M36 93H322','#b6c4a5',.8,'stroke-dasharray="4 5"');let pts=[];for(let i=0;i<=200;i++){let t=i/200*8,z=.25,wd=Math.sqrt(1-z*z),y=1-Math.exp(-z*t)*(Math.cos(wd*t)+z/wd*Math.sin(wd*t));pts.push([36+i/200*285,158-y*65]);}s+=line(poly(pts),'#b58353',2)+text(43,42,'STEP RESPONSE',7)+text(306,174,'t',9)+text(25,96,'1',7);
    }
    if(type==='bode'){
      s=grid()+line('M38 36V158H325','#a7b697',1);let mag=[],phase=[];for(let i=0;i<=150;i++){const f=10**(-2+i/150*4);mag.push([39+i/150*283,48+10*Math.log10(1+f*f)*1.8]);phase.push([39+i/150*283,106+Math.atan(f)/Math.PI*62]);}s+=line(poly(mag),'#6d9265',2)+line(poly(phase),'#c08a57',1.6)+text(47,38,'MAGNITUDE',7,'#6d9265')+text(47,126,'PHASE',7,'#bc8957')+text(273,176,'log f',8);
    }
    if(type==='nyquist'){
      s=grid()+line('M38 102H321M147 31V174','#a5b595',1)+text(300,96,'Re',8)+text(153,40,'Im',8);let pos=[],neg=[];for(let i=0;i<=220;i++){const w=10**(-2.8+i/220*5.6),den=(1+w*w)**2,re=(1-w*w)/den,im=-2*w/den;pos.push([147+re*133,102-im*79]);neg.push([147+re*133,102+im*79]);}s+=line(poly(pos),'#73986b',2)+line(poly(neg),'#a3b88d',1.6,'stroke-dasharray="4 4"')+line('M76 99l6 6m0-6-6 6','#c28e5b',1.4)+text(70,120,'−1',8,'#b48152')+`<circle cx="279" cy="102" r="3" fill="#cfaa6e"/>`;
    }
    return `<svg viewBox="0 0 360 205" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }
  $('feature-art').innerHTML=art('adc',true);
  function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
  function render(){
    const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const visible=labs.filter(lab=>(filter==='all'||lab.category===filter)&&terms.every(term=>(lab.title+' '+lab.description+' '+lab.tags.join(' ')+' '+lab.keywords).toLocaleLowerCase().includes(term)));
    $('lab-grid').innerHTML=visible.map(lab=>`<article class="lab-card"><a class="card-visual" href="?lab=${lab.id}" data-launch="${lab.id}" aria-label="Open ${escape(lab.title)}"><span class="visual-number">${String(labs.indexOf(lab)+1).padStart(2,'0')} / LAB</span>${art(lab.art)}<span class="card-format">${escape(lab.format)}</span></a><div class="card-body"><p class="card-category">${lab.label}</p><h3><a href="?lab=${lab.id}" data-launch="${lab.id}">${escape(lab.title)}</a></h3><p>${escape(lab.description)}</p><div class="card-tags">${lab.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div><div class="card-bottom"><a href="?lab=${lab.id}" data-launch="${lab.id}" class="card-launch">Open experiment ${svgIcon('arrow')}</a><a href="${lab.path}" class="card-direct" target="_blank" rel="noopener" title="Open ${escape(lab.title)} in a new tab" aria-label="Open ${escape(lab.title)} directly">${svgIcon('external')}</a></div></div></article>`).join('');
    $('empty-search').hidden=visible.length>0;$('result-info').textContent=visible.length+' experiment'+(visible.length===1?'':'s')+(query?' matching “'+query+'”':filter==='all'?' · all run in your browser':' in '+({vlsi:'VLSI',signals:'Signals',control:'Control'}[filter]));
    document.querySelectorAll('[data-filter]').forEach(el=>{const yes=el.dataset.filter===filter;el.classList.toggle('active',yes);el.setAttribute('aria-pressed',String(yes));});
  }
  function showLab(id,push=true){
    const lab=labs.find(l=>l.id===id);if(!lab){showGallery(false);toast('That experiment was not found. Pick one from the collection.');return;}
    if(!activeLab)previousScroll=scrollY;
    activeLab=lab;$('gallery-page').hidden=true;$('lab-shell').hidden=false;document.body.classList.add('lab-mode');$('viewer-category').textContent=lab.label;$('lab-select').value=id;$('direct-button').href=lab.path;$('source-button').href=repo+'/tree/main/'+lab.source;$('frame-loading').hidden=false;$('lab-frame').title=lab.title+' · Interactive engineering experiment';$('lab-frame').src=lab.path;document.title=lab.title+' · Open Lab';
    clearTimeout(loadingTimer);loadingTimer=setTimeout(()=>$('frame-loading').hidden=true,7000);
    if(push){const url=new URL(location.href);url.search='';url.searchParams.set('lab',id);url.hash='';history.pushState({lab:id},'',url);}
    $('lab-select').focus({preventScroll:true});
  }
  function showGallery(push=true){
    activeLab=null;$('gallery-page').hidden=false;$('lab-shell').hidden=true;document.body.classList.remove('lab-mode');$('lab-frame').removeAttribute('src');clearTimeout(loadingTimer);document.title="Open Lab · Mark's Engineering Notebook";
    if(push){const url=new URL(location.href);url.search='';url.hash='experiments';history.pushState({},'',url);}
    requestAnimationFrame(()=>scrollTo({top:previousScroll,behavior:'instant'}));
  }
  $('lab-select').innerHTML=labs.map(l=>`<option value="${l.id}">${escape(l.title)}</option>`).join('');
  $('lab-select').addEventListener('change',e=>showLab(e.target.value));
  $('lab-frame').addEventListener('load',()=>{$('frame-loading').hidden=true;clearTimeout(loadingTimer);});
  $('back-to-labs').addEventListener('click',()=>{showGallery();$('experiments-title').setAttribute('tabindex','-1');$('experiments-title').focus({preventScroll:true});});
  document.addEventListener('click',e=>{const a=e.target.closest('a[data-launch]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();showLab(a.dataset.launch);});
  document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>{filter=el.dataset.filter;render();}));
  $('search').addEventListener('input',e=>{query=e.target.value;render();});
  $('clear-search').addEventListener('click',()=>{query='';filter='all';$('search').value='';render();$('search').focus();});
  $('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Experiment link copied.');}catch{toast('Copy the experiment link from your browser’s address bar.');}});
  const guide=$('guide');let guideFocus=null;
  for(const id of ['guide-open','guide-bottom'])$(id).addEventListener('click',()=>{guideFocus=document.activeElement;guide.showModal();});
  const closeGuide=()=>{guide.close();guideFocus?.focus();};$('guide-close').addEventListener('click',closeGuide);$('guide-done').addEventListener('click',closeGuide);guide.addEventListener('click',e=>{if(e.target!==guide)return;const r=guide.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeGuide();});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!activeLab&&!guide.open&&!e.target.matches('input,textarea,select')){e.preventDefault();$('search').focus();}if(e.key==='Escape'&&!activeLab&&document.activeElement===$('search')&&query){query='';$('search').value='';render();}});
  addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('lab');id?showLab(id,false):showGallery(false);});
  render();const initial=new URL(location.href).searchParams.get('lab');if(initial)showLab(initial,false);
})();
