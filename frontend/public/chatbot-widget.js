(function () {
  'use strict';

  var cfg      = window.RCChatbotConfig || {};
  var API_KEY  = cfg.apiKey || '';
  var API_BASE = (cfg.apiBase || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net').replace(/\/$/, '');
  var PRIMARY  = cfg.primaryColor || '#0d9488';
  var ACCENT   = cfg.accentColor  || '#6366f1';
  var POSITION = cfg.position || 'right';

  if (!API_KEY) { console.warn('[ReplyCart] apiKey missing'); return; }

  var SESSION_KEY = 'rc_s_' + API_KEY;
  var sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'w_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  // ── State ───────────────────────────────────────────────────────────────────
  var allProducts = [];
  var clientName  = 'AI Assistant';
  var payCfg      = { codEnabled: true, onlineEnabled: false, razorpayKeyId: null };
  var focused     = null;   // currently focused product (single-product mode)

  // ── CSS ─────────────────────────────────────────────────────────────────────
  var S = PRIMARY, A = ACCENT;
  document.head.insertAdjacentHTML('beforeend', `<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    #rc-fab{position:fixed;bottom:24px;${POSITION==='left'?'left':'right'}:24px;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${S},${A});border:none;cursor:pointer;box-shadow:0 10px 30px ${S}55,0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;}
    #rc-fab:hover{transform:scale(1.08) rotate(4deg);box-shadow:0 14px 40px ${S}77;}
    #rc-fab:active{transform:scale(.96);}
    #rc-fab svg{width:30px;height:30px;fill:#fff;transition:transform .3s;}
    #rc-fab::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid ${S}55;animation:rc-ring 2.4s ease-out infinite;}
    @keyframes rc-ring{0%{transform:scale(1);opacity:.7;}100%{transform:scale(1.5);opacity:0;}}
    #rc-badge{position:absolute;top:-2px;right:-2px;min-width:22px;height:22px;background:#ef4444;border-radius:11px;border:2px solid #fff;display:none;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;font-family:Inter,sans-serif;padding:0 5px;z-index:1;}
    #rc-online{position:absolute;bottom:3px;${POSITION==='left'?'left':'right'}:3px;width:14px;height:14px;border-radius:50%;background:#4ade80;border:2.5px solid #fff;z-index:1;box-shadow:0 0 0 2px rgba(74,222,128,.35);animation:rc-pulse 2s infinite;}
    @keyframes rc-attn{0%,88%,100%{transform:scale(1) rotate(0);}90%{transform:scale(1.07) rotate(-8deg);}93%{transform:scale(1.07) rotate(8deg);}96%{transform:scale(1.07) rotate(-8deg);}98%{transform:scale(1.07) rotate(0);}}
    #rc-fab.rc-attn{animation:rc-attn 5s ease-in-out infinite;}

    /* Greeting teaser */
    #rc-teaser{position:fixed;bottom:104px;${POSITION==='left'?'left':'right'}:24px;width:262px;background:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.2);padding:14px 16px 14px 14px;display:none;align-items:flex-start;gap:11px;z-index:2147483645;font-family:Inter,sans-serif;cursor:pointer;}
    #rc-teaser.show{display:flex;animation:rc-tpop .45s cubic-bezier(.34,1.56,.64,1);}
    @keyframes rc-tpop{from{opacity:0;transform:translateY(18px) scale(.88);}to{opacity:1;transform:translateY(0) scale(1);}}
    #rc-teaser::after{content:'';position:absolute;bottom:-7px;${POSITION==='left'?'left':'right'}:30px;width:15px;height:15px;background:#fff;transform:rotate(45deg);}
    #rc-tav{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${S},${A});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;flex-shrink:0;overflow:hidden;box-shadow:0 4px 10px ${S}44;}
    #rc-tav img{width:100%;height:100%;object-fit:cover;}
    #rc-ttext{font-size:13px;color:#475569;line-height:1.5;font-weight:500;padding-right:6px;}
    #rc-ttext b{display:block;color:#1e293b;font-weight:700;margin-bottom:2px;font-size:13.5px;}
    #rc-tclose{position:absolute;top:7px;right:9px;border:none;background:none;color:#cbd5e1;font-size:15px;cursor:pointer;line-height:1;padding:2px;}
    #rc-tclose:hover{color:#64748b;}

    #rc-box{position:fixed;bottom:100px;${POSITION==='left'?'left':'right'}:16px;width:400px;max-width:calc(100vw - 20px);height:640px;max-height:calc(100vh - 120px);display:none;flex-direction:column;border-radius:26px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.28),0 4px 12px rgba(0,0,0,.12);z-index:2147483645;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;}
    #rc-box.open{display:flex;animation:rc-pop .32s cubic-bezier(.34,1.56,.64,1);}
    @keyframes rc-pop{from{opacity:0;transform:scale(.9) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}

    /* Header */
    #rc-head{background:linear-gradient(135deg,${S} 0%,${A} 100%);padding:18px 18px 16px;flex-shrink:0;position:relative;overflow:hidden;}
    #rc-head::before{content:'';position:absolute;top:-40%;right:-10%;width:180px;height:180px;background:radial-gradient(circle,rgba(255,255,255,.18),transparent 70%);border-radius:50%;}
    .rc-htop{display:flex;align-items:center;gap:12px;position:relative;}
    #rc-av{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden;border:2px solid rgba(255,255,255,.5);box-shadow:0 4px 12px rgba(0,0,0,.15);}
    #rc-av img{width:100%;height:100%;object-fit:cover;}
    .rc-hn{color:#fff;font-weight:700;font-size:17px;letter-spacing:-.2px;}
    .rc-hs{display:flex;align-items:center;gap:6px;margin-top:3px;}
    .rc-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.3);animation:rc-pulse 2s infinite;}
    @keyframes rc-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.85);}}
    .rc-st{color:rgba(255,255,255,.9);font-size:12px;font-weight:500;}
    #rc-x{background:rgba(255,255,255,.15);border:none;cursor:pointer;color:#fff;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background .2s,transform .2s;margin-left:auto;}
    #rc-x:hover{background:rgba(255,255,255,.28);transform:rotate(90deg);}

    /* Focused-product context bar */
    #rc-focus{display:none;align-items:center;gap:10px;margin-top:14px;background:rgba(255,255,255,.16);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:8px 10px;position:relative;animation:rc-slide .25s ease;}
    @keyframes rc-slide{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
    #rc-focus img{width:38px;height:38px;border-radius:10px;object-fit:cover;flex-shrink:0;}
    #rc-focus .rc-ft{flex:1;min-width:0;}
    #rc-focus .rc-ftitle{color:#fff;font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    #rc-focus .rc-fsub{color:rgba(255,255,255,.85);font-size:11px;font-weight:500;}
    #rc-browse{background:rgba(255,255,255,.9);border:none;color:${S};font-size:11px;font-weight:700;padding:6px 11px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:background .2s;}
    #rc-browse:hover{background:#fff;}

    /* Messages */
    #rc-msgs{flex:1;overflow-y:auto;padding:18px 14px;display:flex;flex-direction:column;gap:12px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);}
    #rc-msgs::-webkit-scrollbar{width:4px;}
    #rc-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}

    .rc-row{display:flex;align-items:flex-end;gap:8px;animation:rc-msg .3s ease;}
    @keyframes rc-msg{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .rc-row.user{flex-direction:row-reverse;}
    .rc-avsm{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,${S},${A});display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:800;color:#fff;box-shadow:0 2px 6px ${S}44;}
    .rc-wrap{display:flex;flex-direction:column;max-width:84%;}
    .rc-wrap.user{align-items:flex-end;margin-left:auto;}
    .rc-bub{padding:11px 15px;border-radius:20px;font-size:14px;line-height:1.55;word-break:break-word;}
    .rc-bub.bot{background:#fff;color:#1e293b;border-bottom-left-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.06);}
    .rc-bub.user{background:linear-gradient(135deg,${S},${A});color:#fff;border-bottom-right-radius:6px;box-shadow:0 3px 10px ${S}44;}
    .rc-bub.typing{background:#fff;padding:14px 18px;box-shadow:0 2px 10px rgba(0,0,0,.06);}
    .rc-ts{font-size:10px;color:#94a3b8;margin-top:4px;padding:0 4px;}

    .rc-dots{display:flex;gap:5px;align-items:center;}
    .rc-dots span{width:8px;height:8px;border-radius:50%;background:${S};opacity:.4;animation:rcb .9s infinite ease-in-out;}
    .rc-dots span:nth-child(2){animation-delay:.18s;}
    .rc-dots span:nth-child(3){animation-delay:.36s;}
    @keyframes rcb{0%,80%,100%{transform:translateY(0);opacity:.4;}40%{transform:translateY(-7px);opacity:1;}}

    /* Product card scroller */
    .rc-scroller{display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;padding:8px 2px 14px;width:100%;flex-shrink:0;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent;cursor:grab;}
    .rc-scroller.rc-drag{cursor:grabbing;scroll-behavior:auto;}
    .rc-scroller::-webkit-scrollbar{height:7px;}
    .rc-scroller::-webkit-scrollbar-track{background:transparent;}
    .rc-scroller::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
    .rc-scroller::-webkit-scrollbar-thumb:hover{background:#94a3b8;}

    /* Category chips */
    .rc-cats{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;}
    .rc-cat{padding:7px 14px;border:1.5px solid ${S}33;color:${S};border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s;background:#fff;}
    .rc-cat:hover{background:${S};color:#fff;border-color:${S};transform:translateY(-1px);box-shadow:0 4px 12px ${S}33;}

    /* Quick replies */
    .rc-quick{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px;}
    .rc-qr{padding:7px 13px;border:1.5px solid #e2e8f0;background:#fff;color:#475569;border-radius:18px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s;}
    .rc-qr:hover{border-color:${S};color:${S};}

    /* Footer */
    #rc-foot{background:#fff;padding:12px;border-top:1px solid #eef2f6;display:flex;gap:8px;align-items:center;flex-shrink:0;}
    #rc-inp{flex:1;border:1.5px solid #e2e8f0;border-radius:24px;padding:11px 18px;font-size:14px;outline:none;transition:all .2s;background:#f8fafc;font-family:inherit;}
    #rc-inp:focus{border-color:${S};background:#fff;box-shadow:0 0 0 4px ${S}1f;}
    #rc-snd{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,${S},${A});border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;box-shadow:0 4px 12px ${S}44;}
    #rc-snd:disabled{opacity:.35;cursor:not-allowed;box-shadow:none;}
    #rc-snd:not(:disabled):hover{transform:scale(1.06);}
    #rc-snd:not(:disabled):active{transform:scale(.92);}
    #rc-snd svg{width:18px;height:18px;fill:#fff;margin-left:2px;}
    #rc-pw{text-align:center;font-size:10px;color:#cbd5e1;padding:6px 0;background:#fff;flex-shrink:0;}
    #rc-pw a{color:${S};text-decoration:none;font-weight:600;}
  </style>`);

  // ── DOM ─────────────────────────────────────────────────────────────────────
  var el = document.createElement('div');
  el.innerHTML = `
    <div id="rc-box">
      <div id="rc-head">
        <div class="rc-htop">
          <div id="rc-av"><span id="rc-init">AI</span></div>
          <div>
            <div class="rc-hn" id="rc-name">AI Assistant</div>
            <div class="rc-hs"><div class="rc-dot"></div><span class="rc-st">Online &bull; Replies instantly</span></div>
          </div>
          <button id="rc-x">&#x2715;</button>
        </div>
        <div id="rc-focus">
          <img id="rc-focus-img" src="" alt=""/>
          <div class="rc-ft">
            <div class="rc-ftitle" id="rc-focus-title"></div>
            <div class="rc-fsub" id="rc-focus-sub">You're viewing this product</div>
          </div>
          <button id="rc-browse">Browse all</button>
        </div>
      </div>
      <div id="rc-msgs"></div>
      <div id="rc-detail" style="display:none;position:absolute;inset:0;background:#fff;z-index:10;flex-direction:column;overflow-y:auto;"></div>
      <div id="rc-foot">
        <input id="rc-inp" type="text" placeholder="Type a message..." autocomplete="off"/>
        <button id="rc-snd" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
      </div>
      <div id="rc-pw">Powered by <a href="https://replycart.app" target="_blank">ReplyCart</a></div>
    </div>
    <div id="rc-teaser">
      <button id="rc-tclose" aria-label="Dismiss">&#x2715;</button>
      <div id="rc-tav"><span id="rc-tinit">AI</span></div>
      <div id="rc-ttext"><b id="rc-tname">Need a hand?</b><span id="rc-tmsg">Hi! 👋 Looking for something special? I can help you find it.</span></div>
    </div>
    <button id="rc-fab" class="rc-attn" aria-label="Chat"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div id="rc-online"></div><div id="rc-badge"></div></button>`;
  document.body.appendChild(el);

  var box = document.getElementById('rc-box'),
      fab = document.getElementById('rc-fab'),
      xcl = document.getElementById('rc-x'),
      msgs = document.getElementById('rc-msgs'),
      detail = document.getElementById('rc-detail'),
      inp  = document.getElementById('rc-inp'),
      snd  = document.getElementById('rc-snd'),
      badge = document.getElementById('rc-badge'),
      nameEl = document.getElementById('rc-name'),
      initEl = document.getElementById('rc-init'),
      avEl   = document.getElementById('rc-av'),
      focusBar = document.getElementById('rc-focus'),
      focusImg = document.getElementById('rc-focus-img'),
      focusTitle = document.getElementById('rc-focus-title'),
      browseBtn = document.getElementById('rc-browse'),
      teaser = document.getElementById('rc-teaser'),
      tclose = document.getElementById('rc-tclose'),
      tav = document.getElementById('rc-tav'),
      tinit = document.getElementById('rc-tinit'),
      tname = document.getElementById('rc-tname');

  // ── Greeting teaser ──────────────────────────────────────────────────────────
  var TEASER_KEY = 'rc_teaser_' + API_KEY;
  function hideTeaser() { teaser.classList.remove('show'); }
  function showTeaser() {
    if (open || sessionStorage.getItem(TEASER_KEY) === '1') return;
    teaser.classList.add('show');
  }
  teaser.addEventListener('click', function() { hideTeaser(); doOpen(); });
  tclose.addEventListener('click', function(e) {
    e.stopPropagation(); hideTeaser(); sessionStorage.setItem(TEASER_KEY, '1');
  });

  var open = false, busy = false, greeted = false, unread = 0;

  // ── Focus mode ──────────────────────────────────────────────────────────────
  function setFocus(p) {
    focused = p;
    if (p) {
      focusImg.src = p.imageUrl || '';
      focusImg.style.display = p.imageUrl ? 'block' : 'none';
      focusTitle.textContent = p.title || '';
      focusBar.style.display = 'flex';
      inp.placeholder = 'Ask about this product...';
    } else {
      focusBar.style.display = 'none';
      inp.placeholder = 'Type a message...';
    }
  }
  browseBtn.addEventListener('click', function() {
    setFocus(null);
    addMsg('bot', 'Sure! What would you like to browse?');
    showCategories();
  });

  // ── Product detail panel ────────────────────────────────────────────────────
  function showDetail(p) {
    detail.innerHTML = '';
    detail.style.display = 'flex';

    var back = document.createElement('button');
    back.style.cssText = 'position:sticky;top:0;z-index:2;background:#fff;border:none;padding:14px 16px;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:' + S + ';cursor:pointer;border-bottom:1px solid #f1f5f9;width:100%;text-align:left;';
    back.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> Back';
    back.onclick = function() { detail.style.display = 'none'; detail.innerHTML = ''; };
    detail.appendChild(back);

    if (p.imageUrl) {
      var img = document.createElement('img');
      img.style.cssText = 'width:100%;height:240px;object-fit:cover;display:block;flex-shrink:0;';
      img.src = p.imageUrl; img.alt = p.title || '';
      detail.appendChild(img);
    }

    var content = document.createElement('div');
    content.style.cssText = 'padding:18px;flex:1;';

    if (p.category) {
      var cat = document.createElement('span');
      cat.style.cssText = 'font-size:11px;font-weight:700;color:' + S + ';background:' + S + '18;padding:4px 11px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;';
      cat.textContent = p.category;
      content.appendChild(cat);
    }

    var titleEl = document.createElement('h3');
    titleEl.style.cssText = 'font-size:19px;font-weight:800;color:#1e293b;margin:12px 0 8px;line-height:1.3;';
    titleEl.textContent = p.title || '';
    content.appendChild(titleEl);

    var priceRow = document.createElement('div');
    priceRow.style.cssText = 'display:flex;align-items:center;gap:9px;margin-bottom:14px;';
    var priceEl = document.createElement('span');
    priceEl.style.cssText = 'font-size:24px;font-weight:800;color:' + S + ';';
    priceEl.textContent = '₹' + (p.salePrice || p.price);
    priceRow.appendChild(priceEl);
    if (p.salePrice) {
      var origEl = document.createElement('span');
      origEl.style.cssText = 'font-size:15px;color:#94a3b8;text-decoration:line-through;';
      origEl.textContent = '₹' + p.price;
      priceRow.appendChild(origEl);
      var discEl = document.createElement('span');
      discEl.style.cssText = 'font-size:11px;font-weight:700;color:#16a34a;background:#f0fdf4;padding:3px 9px;border-radius:20px;';
      discEl.textContent = Math.round((1 - p.salePrice / p.price) * 100) + '% OFF';
      priceRow.appendChild(discEl);
    }
    content.appendChild(priceRow);

    if (p.description) {
      var desc = document.createElement('p');
      desc.style.cssText = 'font-size:13.5px;color:#475569;line-height:1.65;margin:0 0 14px;';
      desc.textContent = p.description;
      content.appendChild(desc);
    }

    if (p.variants) {
      var varLabel = document.createElement('p');
      varLabel.style.cssText = 'font-size:12px;font-weight:700;color:#64748b;margin:0 0 7px;text-transform:uppercase;letter-spacing:.5px;';
      varLabel.textContent = 'Available Options';
      content.appendChild(varLabel);
      var varRow = document.createElement('div');
      varRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;';
      p.variants.split(',').forEach(function(v) {
        var chip = document.createElement('span');
        chip.style.cssText = 'padding:6px 14px;border:1.5px solid #e2e8f0;border-radius:20px;font-size:12.5px;color:#475569;font-weight:600;';
        chip.textContent = v.trim();
        varRow.appendChild(chip);
      });
      content.appendChild(varRow);
    }
    detail.appendChild(content);

    var orderBtn = document.createElement('button');
    orderBtn.style.cssText = 'position:sticky;bottom:0;width:100%;padding:16px;background:linear-gradient(135deg,' + S + ',' + A + ');color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.3px;flex-shrink:0;';
    orderBtn.textContent = 'Order this product';
    orderBtn.onclick = function() {
      detail.style.display = 'none'; detail.innerHTML = '';
      setFocus(p);
      inp.value = 'I want to order ' + p.title; snd.disabled = false; doSend();
    };
    detail.appendChild(orderBtn);
  }

  // ── Open / close ─────────────────────────────────────────────────────────────
  function doOpen() {
    open = true; unread = 0; badge.style.display = 'none';
    hideTeaser(); fab.classList.remove('rc-attn');
    box.classList.add('open');
    fab.querySelector('svg').innerHTML = '<path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';
    inp.focus();
    if (!greeted) { greeted = true; init(); }
  }
  function doClose() {
    open = false; box.classList.remove('open');
    fab.querySelector('svg').innerHTML = '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>';
  }
  fab.addEventListener('click', function() { open ? doClose() : doOpen(); });
  xcl.addEventListener('click', doClose);

  // ── Config (prefetched on load so header + teaser show branding early) ───────
  var welcomeMsg = '', configPromise = null;
  function loadConfig() {
    return fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/config')
      .then(function(r) { return r.ok ? r.json() : {}; })
      .catch(function(e) { console.error('[RC] config error', e); return {}; })
      .then(function(c) {
        allProducts = Array.isArray(c.products) ? c.products : [];
        if (c.payment) payCfg = c.payment;
        welcomeMsg = c.welcomeMessage || ('Hi! Welcome to ' + (c.name || 'our store') + ' ✨ What are you looking for today?');
        if (c.name) {
          clientName = c.name;
          var ltr = c.name.charAt(0).toUpperCase();
          nameEl.textContent = c.name; initEl.textContent = ltr; tinit.textContent = ltr;
          tname.textContent = 'Chat with ' + c.name;
        }
        if (c.logoUrl) {
          var im = '<img src="' + c.logoUrl + '" alt="">';
          avEl.innerHTML = im; tav.innerHTML = im;
        }
        if (payCfg.onlineEnabled) loadRazorpay();   // preload Razorpay checkout
      });
  }
  function ensureConfig() { if (!configPromise) configPromise = loadConfig(); return configPromise; }

  // First-open greeting (config already loading/loaded by now)
  function init() {
    ensureConfig().then(function() {
      addMsg('bot', welcomeMsg);
      if (allProducts.length > 0) showCategories();
    });
  }

  // ── Category chips ───────────────────────────────────────────────────────────
  function showCategories() {
    var cats = [...new Set(allProducts.map(function(p){ return p.category; }).filter(Boolean))].slice(0, 8);
    if (!cats.length) return;
    var row = document.createElement('div');
    row.className = 'rc-cats';
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'rc-cat'; btn.textContent = cat;
      btn.addEventListener('click', function() { inp.value = cat; doSend(); });
      row.appendChild(btn);
    });
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Input ────────────────────────────────────────────────────────────────────
  inp.addEventListener('input', function() { snd.disabled = !inp.value.trim() || busy; });
  inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !snd.disabled) { e.preventDefault(); doSend(); } });
  snd.addEventListener('click', doSend);

  function doSend() {
    var text = inp.value.trim(); if (!text || busy) return;
    inp.value = ''; snd.disabled = true;
    addMsg('user', text);
    callApi(text);
  }

  function norm(s) { return s.toLowerCase().replace(/[-_\s]+/g, ''); }

  function showProductCards(query) {
    if (!allProducts.length || focused) return;
    var q = query.toLowerCase();
    var qNorm = norm(query);
    var words = q.split(/\s+/).filter(function(w){ return w.length >= 3; });
    var wordsNorm = qNorm.length >= 3 ? [qNorm] : [];

    var scored = allProducts.map(function(p) {
      var haystack = ((p.category || '') + ' ' + (p.title || '') + ' ' + (p.description || '')).toLowerCase();
      var haystackNorm = norm(haystack);
      var score = 0;
      words.forEach(function(w) { if (haystack.indexOf(w) >= 0) score++; });
      wordsNorm.forEach(function(w) { if (haystackNorm.indexOf(w) >= 0) score += 2; });
      return { p: p, score: score };
    });

    var matches = scored.filter(function(x){ return x.score > 0; })
                        .sort(function(a,b){ return b.score - a.score; })
                        .slice(0, 6).map(function(x){ return x.p; });

    if (!matches.length) {
      var seen = {};
      matches = allProducts.filter(function(p) {
        var c = p.category || 'other';
        if (seen[c]) return false; seen[c] = true; return true;
      }).slice(0, 6);
    }
    if (matches.length) renderCards(matches);
  }

  // ── API call ─────────────────────────────────────────────────────────────────
  function callApi(text) {
    busy = true;
    var typingEl = addTyping();
    var body = { sessionId: sessionId, message: text };
    if (focused) body.focusedProductId = focused.id;

    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(d) {
        msgs.removeChild(typingEl);
        addMsg('bot', d.reply || 'I didn\'t catch that, could you rephrase?');

        // Order confirmed → handle payment / show confirmation
        if (d.isOrderReady && d.orderData) {
          handleOrder(d.orderData);
          return;
        }

        var tl = text.toLowerCase();
        var isOrderFlow = tl.startsWith('i want to order') || tl.startsWith('order ')
          || /^(my name|name is|phone|address|cash|cod|online|upi|pay|confirm|yes|no\b)/.test(tl);
        if (!isOrderFlow) {
          if (focused) { /* single-product mode: never show other cards */ }
          else if (d.mentionedProducts && d.mentionedProducts.length > 0) renderCards(d.mentionedProducts);
          else if (allProducts.length > 0) showProductCards(text);
        }
      })
      .catch(function() { msgs.removeChild(typingEl); addMsg('bot', 'Something went wrong. Please try again.'); })
      .finally(function() { busy = false; snd.disabled = !inp.value.trim(); inp.focus(); if (!open) { unread++; showBadge(); } });
  }

  // ── Order handling ───────────────────────────────────────────────────────────
  function handleOrder(o) {
    setFocus(null); // order placed — leave single-product mode
    if (o.paymentMethod === 'online' && o.razorpay) {
      openRazorpay(o);
    } else {
      renderOrderCard(o, 'placed');
    }
  }

  function loadRazorpay() {
    if (window.Razorpay || document.getElementById('rc-rzp-js')) return;
    var s = document.createElement('script');
    s.id = 'rc-rzp-js'; s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true;
    document.head.appendChild(s);
  }

  function openRazorpay(o) {
    loadRazorpay();
    function go() {
      if (!window.Razorpay) { return setTimeout(go, 250); }
      var rzp = new window.Razorpay({
        key: o.razorpay.keyId,
        order_id: o.razorpay.orderId,
        amount: o.razorpay.amount,
        currency: o.razorpay.currency || 'INR',
        name: clientName,
        description: 'Order ' + o.orderNumber,
        prefill: { name: o.customerName || '', contact: o.customerPhone || '' },
        theme: { color: S },
        handler: function(resp) { verifyPayment(o, resp); },
        modal: { ondismiss: function() {
          addMsg('bot', 'No worries — your order ' + o.orderNumber + ' is saved. You can complete payment anytime or pay cash on delivery.');
          renderOrderCard(o, 'pending');
        } },
      });
      rzp.open();
    }
    go();
  }

  function verifyPayment(o, resp) {
    var t = addTyping();
    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/orders/' + o.id + '/verify-payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: resp.razorpay_order_id,
        razorpayPaymentId: resp.razorpay_payment_id,
        razorpaySignature: resp.razorpay_signature,
      }),
    })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function() { msgs.removeChild(t); addMsg('bot', 'Payment received! 🎉 Your order is confirmed.'); renderOrderCard(o, 'paid'); })
      .catch(function() { msgs.removeChild(t); addMsg('bot', 'We couldn\'t verify the payment. If money was deducted it will be refunded. Order ' + o.orderNumber + ' is saved.'); renderOrderCard(o, 'pending'); });
  }

  function renderOrderCard(o, state) {
    var paid = state === 'paid';
    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:18px;box-shadow:0 6px 20px rgba(0,0,0,.1);overflow:hidden;border:1px solid #eef2f6;animation:rc-pop .3s ease;';

    var head = document.createElement('div');
    head.style.cssText = 'background:linear-gradient(135deg,' + (paid ? '#16a34a,#22c55e' : S + ',' + A) + ');padding:16px;color:#fff;display:flex;align-items:center;gap:12px;';
    head.innerHTML =
      '<div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<div><div style="font-size:15px;font-weight:800;">' + (paid ? 'Payment successful!' : 'Order placed!') + '</div>' +
      '<div style="font-size:12px;opacity:.9;margin-top:2px;">Order ID: <span style="font-weight:700;">' + o.orderNumber + '</span></div></div>';
    card.appendChild(head);

    var bodyEl = document.createElement('div');
    bodyEl.style.cssText = 'padding:14px 16px;';
    var money = function(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); };
    var items = (o.items || []).map(function(it) {
      var thumb = it.imageUrl
        ? '<img src="' + it.imageUrl + '" alt="" style="width:38px;height:38px;border-radius:9px;object-fit:cover;flex-shrink:0;" onerror="this.style.display=\'none\'"/>'
        : '<div style="width:38px;height:38px;border-radius:9px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">🛍</div>';
      return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;">' +
        thumb +
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#1e293b;line-height:1.3;">' + it.title + '</div>' +
        '<div style="font-size:11px;color:#94a3b8;">' + (it.variant ? it.variant + ' · ' : '') + 'Qty ' + it.qty + '</div></div>' +
        '<span style="font-weight:700;color:#1e293b;font-size:13px;white-space:nowrap;">' + money(it.unitPrice * it.qty) + '</span></div>';
    }).join('');
    var payLabel = o.paymentMethod === 'online'
      ? (paid ? 'Paid online' : 'Online payment pending')
      : 'Cash on Delivery';
    bodyEl.innerHTML = items +
      '<div style="border-top:1px dashed #e2e8f0;margin-top:8px;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-size:12px;color:#64748b;font-weight:600;">' + payLabel + '</span>' +
        '<span style="font-size:17px;font-weight:800;color:' + S + ';">' + money(o.total) + '</span></div>';
    card.appendChild(bodyEl);

    // Pay-now action if online + still pending
    if (o.paymentMethod === 'online' && o.razorpay && !paid) {
      var payBtn = document.createElement('button');
      payBtn.style.cssText = 'width:100%;padding:13px;background:linear-gradient(135deg,' + S + ',' + A + ');color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;';
      payBtn.textContent = 'Pay ₹' + o.total + ' now';
      payBtn.onclick = function() { openRazorpay(o); };
      card.appendChild(payBtn);
    }

    var wrap = document.createElement('div');
    wrap.className = 'rc-row bot';
    var av = document.createElement('div'); av.className = 'rc-avsm'; av.textContent = initEl.textContent || 'AI';
    var holder = document.createElement('div'); holder.style.cssText = 'max-width:90%;width:100%;';
    holder.appendChild(card);
    wrap.appendChild(av); wrap.appendChild(holder);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Render helpers ───────────────────────────────────────────────────────────
  function now() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    return (h > 12 ? h - 12 : h || 12) + ':' + (m < 10 ? '0' + m : m) + (h >= 12 ? ' PM' : ' AM');
  }

  function md(text) {
    var s = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
    var lines = s.split('\n'), out = [], inL = false;
    lines.forEach(function(l) {
      l = l.trim();
      if (/^[-•]\s+/.test(l)) { if (!inL) { out.push('<ul style="margin:4px 0;padding-left:16px;">'); inL=true; } out.push('<li>' + l.replace(/^[-•]\s+/,'') + '</li>'); }
      else { if (inL) { out.push('</ul>'); inL=false; } out.push(l ? l + '<br>' : '<br>'); }
    });
    if (inL) out.push('</ul>');
    return out.join('').replace(/(<br>){3,}/g,'<br><br>');
  }

  function addMsg(type, text) {
    var row = document.createElement('div'); row.className = 'rc-row ' + type;
    if (type === 'bot') { var av = document.createElement('div'); av.className = 'rc-avsm'; av.textContent = initEl.textContent || 'AI'; row.appendChild(av); }
    var wrap2 = document.createElement('div'); wrap2.className = 'rc-wrap ' + type;
    var bub = document.createElement('div'); bub.className = 'rc-bub ' + type; bub.innerHTML = md(text);
    var ts = document.createElement('div'); ts.className = 'rc-ts'; ts.textContent = now();
    wrap2.appendChild(bub); wrap2.appendChild(ts); row.appendChild(wrap2);
    msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight; return row;
  }

  function addTyping() {
    var row = document.createElement('div'); row.className = 'rc-row bot';
    var av = document.createElement('div'); av.className = 'rc-avsm'; av.textContent = initEl.textContent || 'AI';
    var bub = document.createElement('div'); bub.className = 'rc-bub typing';
    bub.innerHTML = '<div class="rc-dots"><span></span><span></span><span></span></div>';
    row.appendChild(av); row.appendChild(bub); msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight; return row;
  }

  function renderCards(products) {
    var scroller = document.createElement('div');
    scroller.className = 'rc-scroller';
    products.forEach(function(p) {
      var card = document.createElement('div');
      card.style.cssText = 'flex-shrink:0;width:158px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;flex-direction:column;cursor:pointer;transition:transform .18s,box-shadow .18s;';
      card.onmouseenter = function(){ card.style.transform='translateY(-4px)'; card.style.boxShadow='0 12px 28px rgba(0,0,0,.16)'; };
      card.onmouseleave = function(){ card.style.transform=''; card.style.boxShadow='0 4px 16px rgba(0,0,0,.1)'; };
      card.onclick = function(e) { if (e.target.tagName !== 'BUTTON') showDetail(p); };

      if (p.imageUrl) {
        var img = document.createElement('img');
        img.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;';
        img.src = p.imageUrl; img.alt = p.title || '';
        img.onerror = function() { this.style.display='none'; };
        card.appendChild(img);
      } else {
        var ph2 = document.createElement('div');
        ph2.style.cssText = 'width:100%;height:140px;background:linear-gradient(135deg,#e2e8f0,#f1f5f9);display:flex;align-items:center;justify-content:center;font-size:28px;';
        ph2.textContent = '🛍'; card.appendChild(ph2);
      }

      var body = document.createElement('div');
      body.style.cssText = 'padding:10px 11px 5px;flex:1;';
      var titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:12.5px;font-weight:700;color:#1e293b;line-height:1.35;margin-bottom:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px;';
      titleEl.textContent = p.title || '';
      body.appendChild(titleEl);

      var priceEl = document.createElement('div');
      priceEl.style.cssText = 'font-size:14px;font-weight:800;color:' + S + ';';
      priceEl.textContent = p.salePrice ? ('₹' + p.salePrice) : ('₹' + p.price);
      if (p.salePrice) {
        var orig = document.createElement('span');
        orig.style.cssText = 'font-size:11px;color:#94a3b8;text-decoration:line-through;margin-left:4px;font-weight:400;';
        orig.textContent = '₹' + p.price; priceEl.appendChild(orig);
      }
      body.appendChild(priceEl);
      card.appendChild(body);

      var btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:9px;background:linear-gradient(135deg,' + S + ',' + A + ');color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;margin-top:6px;';
      btn.textContent = 'Order this';
      btn.onclick = function() { setFocus(p); inp.value = 'I want to order ' + p.title; snd.disabled = false; doSend(); };
      card.appendChild(btn);

      scroller.appendChild(card);
    });

    // Vertical wheel → horizontal scroll (desktop can't scroll a horizontal row otherwise)
    scroller.addEventListener('wheel', function(e) {
      if (e.deltaY === 0) return;
      var max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) return;
      var atStart = scroller.scrollLeft <= 0;
      var atEnd = scroller.scrollLeft >= max - 1;
      // Only hijack the wheel while there's room to scroll sideways
      if (!((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0))) {
        scroller.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // Click-and-drag to scroll
    var down = false, startX = 0, startScroll = 0, moved = 0;
    scroller.addEventListener('pointerdown', function(e) {
      down = true; moved = 0; startX = e.clientX; startScroll = scroller.scrollLeft;
      scroller.classList.add('rc-drag');
    });
    window.addEventListener('pointermove', function(e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      scroller.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function() {
      if (!down) return;
      down = false; scroller.classList.remove('rc-drag');
    });
    // Suppress the click that follows a drag so cards don't open mid-swipe
    scroller.addEventListener('click', function(e) {
      if (moved > 6) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    msgs.appendChild(scroller);
    setTimeout(function() { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  function showBadge() { badge.style.display = 'flex'; badge.textContent = unread > 9 ? '9+' : unread; }

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  ensureConfig();                       // prefetch branding + products immediately
  setTimeout(showTeaser, 3500);         // nudge the visitor after a few seconds

})();
