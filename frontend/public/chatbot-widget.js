(function () {
  'use strict';

  var cfg      = window.RCChatbotConfig || {};
  var API_KEY  = cfg.apiKey || '';
  var API_BASE = (cfg.apiBase || 'https://replycartapi-h7h2gdctg4h9g6cp.centralindia-01.azurewebsites.net').replace(/\/$/, '');
  var PRIMARY  = cfg.primaryColor || '#0d9488';
  var POSITION = cfg.position || 'right';

  if (!API_KEY) { console.warn('[ReplyCart] apiKey missing'); return; }

  var SESSION_KEY = 'rc_s_' + API_KEY;
  var sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'w_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  var allProducts = []; // loaded on init

  // ── CSS ────────────────────────────────────────────────────────────────────
  var S = PRIMARY;
  document.head.insertAdjacentHTML('beforeend', `<style>
    #rc-fab{position:fixed;bottom:24px;${POSITION==='left'?'left':'right'}:24px;width:60px;height:60px;border-radius:50%;background:${S};border:none;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .2s,box-shadow .2s;}
    #rc-fab:hover{transform:scale(1.1);box-shadow:0 10px 32px rgba(0,0,0,.35);}
    #rc-fab svg{width:28px;height:28px;fill:#fff;}
    #rc-badge{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;background:#ef4444;border-radius:10px;border:2px solid #fff;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;font-family:sans-serif;padding:0 4px;}

    #rc-box{position:fixed;bottom:96px;${POSITION==='left'?'left':'right'}:16px;width:390px;max-width:calc(100vw - 20px);height:600px;max-height:calc(100vh - 112px);display:none;flex-direction:column;border-radius:24px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.22),0 2px 8px rgba(0,0,0,.1);z-index:2147483645;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;animation:rc-pop .25s cubic-bezier(.34,1.56,.64,1);}
    #rc-box.open{display:flex;}
    @keyframes rc-pop{from{opacity:0;transform:scale(.92) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}

    #rc-head{background:linear-gradient(135deg,${S} 0%,${S}dd 100%);padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
    #rc-av{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden;border:2px solid rgba(255,255,255,.4);}
    #rc-av img{width:100%;height:100%;object-fit:cover;}
    .rc-hn{color:#fff;font-weight:700;font-size:16px;}
    .rc-hs{display:flex;align-items:center;gap:5px;margin-top:3px;}
    .rc-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 2px rgba(74,222,128,.3);animation:rc-pulse 2s infinite;}
    @keyframes rc-pulse{0%,100%{opacity:1;}50%{opacity:.6;}}
    .rc-st{color:rgba(255,255,255,.85);font-size:11px;font-weight:500;}

    #rc-x{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.7);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;transition:background .2s,color .2s;margin-left:auto;}
    #rc-x:hover{background:rgba(255,255,255,.15);color:#fff;}

    #rc-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:#f1f5f9;}
    #rc-msgs::-webkit-scrollbar{width:3px;}
    #rc-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px;}

    .rc-row{display:flex;align-items:flex-end;gap:8px;}
    .rc-row.user{flex-direction:row-reverse;}
    .rc-avsm{width:30px;height:30px;border-radius:50%;background:${S};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#fff;}
    .rc-wrap{display:flex;flex-direction:column;}
    .rc-wrap.user{align-items:flex-end;}
    .rc-bub{max-width:82%;padding:11px 15px;border-radius:20px;font-size:14px;line-height:1.6;word-break:break-word;}
    .rc-bub.bot{background:#fff;color:#1e293b;border-bottom-left-radius:5px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
    .rc-bub.user{background:${S};color:#fff;border-bottom-right-radius:5px;}
    .rc-bub.typing{background:#fff;padding:13px 18px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
    .rc-ts{font-size:10px;color:#94a3b8;margin-top:4px;}

    .rc-dots{display:flex;gap:5px;align-items:center;}
    .rc-dots span{width:8px;height:8px;border-radius:50%;background:#cbd5e1;animation:rcb .8s infinite ease-in-out;}
    .rc-dots span:nth-child(2){animation-delay:.15s;}
    .rc-dots span:nth-child(3){animation-delay:.3s;}
    @keyframes rcb{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-7px);}}

    .rc-cards{width:100%;overflow-x:auto;padding:6px 0 10px;display:flex;gap:12px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
    .rc-cards::-webkit-scrollbar{display:none;}

    .rc-card{flex-shrink:0;width:155px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column;}
    .rc-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.18);}
    .rc-cimg{width:100%;height:140px;object-fit:cover;background:#f8fafc;display:block;}
    .rc-cph{width:100%;height:140px;background:linear-gradient(135deg,#e2e8f0,#f1f5f9);display:flex;align-items:center;justify-content:center;}
    .rc-cbody{padding:10px 10px 0;}
    .rc-ctitle{font-size:12px;font-weight:700;color:#1e293b;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-height:34px;}
    .rc-cprice{display:flex;align-items:center;gap:5px;margin-top:5px;}
    .rc-csale{font-size:14px;font-weight:800;color:${S};}
    .rc-corig{font-size:11px;color:#94a3b8;text-decoration:line-through;}
    .rc-cvars{font-size:10px;color:#64748b;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-bottom:8px;}
    .rc-cbtn{display:block;width:100%;padding:9px;background:${S};color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.3px;transition:filter .2s;margin-top:auto;}
    .rc-cbtn:hover{filter:brightness(1.1);}

    .rc-cats{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;}
    .rc-cat{padding:5px 12px;border:1.5px solid ${S};color:${S};border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:background .2s,color .2s;background:#fff;}
    .rc-cat:hover{background:${S};color:#fff;}

    #rc-foot{background:#fff;padding:10px 12px 10px;border-top:1px solid #e2e8f0;display:flex;gap:8px;align-items:center;flex-shrink:0;}
    #rc-inp{flex:1;border:1.5px solid #e2e8f0;border-radius:24px;padding:10px 18px;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;background:#f8fafc;}
    #rc-inp:focus{border-color:${S};background:#fff;box-shadow:0 0 0 3px ${S}22;}
    #rc-snd{width:42px;height:42px;border-radius:50%;background:${S};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:filter .2s,transform .1s;}
    #rc-snd:disabled{opacity:.35;cursor:not-allowed;}
    #rc-snd:not(:disabled):hover{filter:brightness(1.1);}
    #rc-snd:not(:disabled):active{transform:scale(.92);}
    #rc-snd svg{width:18px;height:18px;fill:#fff;margin-left:2px;}
    #rc-pw{text-align:center;font-size:10px;color:#cbd5e1;padding:5px 0 6px;background:#fff;flex-shrink:0;}
    #rc-pw a{color:${S};text-decoration:none;font-weight:600;}
  </style>`);

  // ── DOM ────────────────────────────────────────────────────────────────────
  var el = document.createElement('div');
  el.innerHTML = `
    <div id="rc-box">
      <div id="rc-head">
        <div id="rc-av"><span id="rc-init">AI</span></div>
        <div>
          <div class="rc-hn" id="rc-name">AI Assistant</div>
          <div class="rc-hs"><div class="rc-dot"></div><span class="rc-st">Online &bull; Replies instantly</span></div>
        </div>
        <button id="rc-x">&#x2715;</button>
      </div>
      <div id="rc-msgs"></div>
      <!-- Product detail panel (hidden by default) -->
      <div id="rc-detail" style="display:none;position:absolute;inset:0;background:#fff;z-index:10;flex-direction:column;overflow-y:auto;"></div>
      <div id="rc-foot">
        <input id="rc-inp" type="text" placeholder="Type a message..." autocomplete="off"/>
        <button id="rc-snd" disabled><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
      </div>
      <div id="rc-pw">Powered by <a href="https://replycart.app" target="_blank">ReplyCart</a></div>
    </div>
    <button id="rc-fab" aria-label="Chat"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div id="rc-badge"></div></button>`;
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
      avEl   = document.getElementById('rc-av');

  var open = false, busy = false, greeted = false, unread = 0;

  // ── Product detail panel ────────────────────────────────────────────────────
  function showDetail(p) {
    detail.innerHTML = '';
    detail.style.display = 'flex';

    // Back button
    var back = document.createElement('button');
    back.style.cssText = 'position:sticky;top:0;z-index:2;background:#fff;border:none;padding:14px 16px;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:' + S + ';cursor:pointer;border-bottom:1px solid #f1f5f9;width:100%;text-align:left;';
    back.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> Back';
    back.onclick = function() { detail.style.display = 'none'; detail.innerHTML = ''; };
    detail.appendChild(back);

    // Image
    if (p.imageUrl) {
      var img = document.createElement('img');
      img.style.cssText = 'width:100%;height:220px;object-fit:cover;display:block;flex-shrink:0;';
      img.src = p.imageUrl; img.alt = p.title || '';
      detail.appendChild(img);
    }

    // Content
    var content = document.createElement('div');
    content.style.cssText = 'padding:16px;flex:1;';

    // Category badge
    if (p.category) {
      var cat = document.createElement('span');
      cat.style.cssText = 'font-size:11px;font-weight:600;color:' + S + ';background:' + S + '18;padding:3px 10px;border-radius:20px;';
      cat.textContent = p.category;
      content.appendChild(cat);
    }

    // Title
    var titleEl = document.createElement('h3');
    titleEl.style.cssText = 'font-size:17px;font-weight:800;color:#1e293b;margin:10px 0 8px;line-height:1.3;font-family:inherit;';
    titleEl.textContent = p.title || '';
    content.appendChild(titleEl);

    // Price
    var priceRow = document.createElement('div');
    priceRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';
    var priceEl = document.createElement('span');
    priceEl.style.cssText = 'font-size:22px;font-weight:800;color:' + S + ';';
    priceEl.textContent = '₹' + (p.salePrice || p.price);
    priceRow.appendChild(priceEl);
    if (p.salePrice) {
      var origEl = document.createElement('span');
      origEl.style.cssText = 'font-size:14px;color:#94a3b8;text-decoration:line-through;';
      origEl.textContent = '₹' + p.price;
      priceRow.appendChild(origEl);
      var discEl = document.createElement('span');
      discEl.style.cssText = 'font-size:11px;font-weight:700;color:#16a34a;background:#f0fdf4;padding:2px 8px;border-radius:20px;';
      var disc = Math.round((1 - p.salePrice / p.price) * 100);
      discEl.textContent = disc + '% OFF';
      priceRow.appendChild(discEl);
    }
    content.appendChild(priceRow);

    // Description
    if (p.description) {
      var desc = document.createElement('p');
      desc.style.cssText = 'font-size:13px;color:#475569;line-height:1.6;margin:0 0 12px;';
      desc.textContent = p.description;
      content.appendChild(desc);
    }

    // Variants
    if (p.variants) {
      var varLabel = document.createElement('p');
      varLabel.style.cssText = 'font-size:12px;font-weight:700;color:#64748b;margin:0 0 6px;text-transform:uppercase;letter-spacing:.5px;';
      varLabel.textContent = 'Available Sizes / Variants';
      content.appendChild(varLabel);
      var varRow = document.createElement('div');
      varRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;';
      p.variants.split(',').forEach(function(v) {
        var chip = document.createElement('span');
        chip.style.cssText = 'padding:4px 12px;border:1.5px solid #e2e8f0;border-radius:20px;font-size:12px;color:#475569;font-weight:500;';
        chip.textContent = v.trim();
        varRow.appendChild(chip);
      });
      content.appendChild(varRow);
    }

    detail.appendChild(content);

    // Order button (sticky bottom)
    var orderBtn = document.createElement('button');
    orderBtn.style.cssText = 'position:sticky;bottom:0;width:100%;padding:16px;background:' + S + ';color:#fff;border:none;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.3px;flex-shrink:0;';
    orderBtn.textContent = 'Order this product';
    orderBtn.onclick = function() {
      detail.style.display = 'none'; detail.innerHTML = '';
      inp.value = 'I want to order ' + p.title; snd.disabled = false; doSend();
    };
    detail.appendChild(orderBtn);
  }

  // ── Open / close ───────────────────────────────────────────────────────────
  function doOpen() {
    open = true; unread = 0; badge.style.display = 'none';
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

  // ── Init: load config + products ───────────────────────────────────────────
  function init() {
    // Load config + products in one single request (products embedded in config response)
    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/config')
      .then(function(r) { return r.ok ? r.json() : {}; })
      .catch(function(e) { console.error('[RC] init error', e); return {}; })
      .then(function(cfg2) {
        // Products are now included in the config response
        allProducts = Array.isArray(cfg2.products) ? cfg2.products : [];
        console.log('[ReplyCart] Loaded:', cfg2.name, '| products:', allProducts.length);
        if (cfg2.name) { nameEl.textContent = cfg2.name; initEl.textContent = cfg2.name.charAt(0).toUpperCase(); }
        if (cfg2.logoUrl) { avEl.innerHTML = '<img src="' + cfg2.logoUrl + '" alt="">'; }
        addMsg('bot', cfg2.welcomeMessage || ('Hi! Welcome to ' + (cfg2.name || 'our store') + '. What are you looking for today?'));
        if (allProducts.length > 0) {
          showCategories();
        } else {
          console.warn('[RC] No products in config response. Deploy latest backend.');
        }
      });
  }

  // ── Category chips ─────────────────────────────────────────────────────────
  function showCategories() {
    var cats = [...new Set(allProducts.map(function(p){ return p.category; }).filter(Boolean))].slice(0, 8);
    if (!cats.length) return;
    var row = document.createElement('div');
    row.className = 'rc-cats';
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'rc-cat'; btn.textContent = cat;
      btn.addEventListener('click', function() {
        inp.value = cat; doSend();
      });
      row.appendChild(btn);
    });
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Input ──────────────────────────────────────────────────────────────────
  inp.addEventListener('input', function() { snd.disabled = !inp.value.trim() || busy; });
  inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !snd.disabled) { e.preventDefault(); doSend(); } });
  snd.addEventListener('click', doSend);

  function doSend() {
    var text = inp.value.trim(); if (!text || busy) return;
    inp.value = ''; snd.disabled = true;
    addMsg('user', text);
    callApi(text); // cards appear AFTER bot reply so they stay visible
  }

  // ── Client-side product filtering (instant, no backend dependency) ─────────
  // Strip hyphens, spaces, special chars for fuzzy matching
  // "Tshirts" matches "T-Shirts", "tshirt" matches "T-Shirt" etc.
  function norm(s) { return s.toLowerCase().replace(/[-_\s]+/g, ''); }

  function showProductCards(query) {
    if (!allProducts.length) return;
    var q = query.toLowerCase();
    var qNorm = norm(query);
    var words = q.split(/\s+/).filter(function(w){ return w.length >= 3; });
    var wordsNorm = qNorm.length >= 3 ? [qNorm] : [];

    var scored = allProducts.map(function(p) {
      var haystack = ((p.category || '') + ' ' + (p.title || '') + ' ' + (p.description || '')).toLowerCase();
      var haystackNorm = norm(haystack);
      var score = 0;
      // Regular word match
      words.forEach(function(w) { if (haystack.indexOf(w) >= 0) score++; });
      // Normalized match (handles "tshirts" → "t-shirts", "saree" → "saree" etc.)
      wordsNorm.forEach(function(w) { if (haystackNorm.indexOf(w) >= 0) score += 2; });
      return { p: p, score: score };
    });

    var matches = scored.filter(function(x){ return x.score > 0; })
                        .sort(function(a,b){ return b.score - a.score; })
                        .slice(0, 6)
                        .map(function(x){ return x.p; });

    // Fallback: show 1 per category
    if (!matches.length) {
      var seen = {};
      matches = allProducts.filter(function(p) {
        var c = p.category || 'other';
        if (seen[c]) return false;
        seen[c] = true; return true;
      }).slice(0, 6);
    }

    if (matches.length) renderCards(matches);
  }

  // ── API call ───────────────────────────────────────────────────────────────
  function callApi(text) {
    busy = true;
    var typingEl = addTyping();
    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, message: text }),
    })
      .then(function(r){ return r.ok ? r.json() : Promise.reject(); })
      .then(function(d) {
        msgs.removeChild(typingEl);
        addMsg('bot', d.reply || 'I didn\'t catch that, could you rephrase?');
        // Don't show product cards when user is placing an order or providing details
        var tl = text.toLowerCase();
        var isOrderFlow = tl.startsWith('i want to order') || tl.startsWith('order ')
          || /^(my name|name is|phone|address|cash|cod|online|upi|pay|confirm|yes|no\b)/.test(tl);
        if (!isOrderFlow) {
          if (d.mentionedProducts && d.mentionedProducts.length > 0) {
            renderCards(d.mentionedProducts);
          } else if (allProducts.length > 0) {
            showProductCards(text);
          }
        }
      })
      .catch(function() { msgs.removeChild(typingEl); addMsg('bot', 'Something went wrong. Please try again.'); })
      .finally(function() { busy = false; snd.disabled = !inp.value.trim(); inp.focus(); if (!open) { unread++; showBadge(); } });
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
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
    console.log('[RC] renderCards called with', products.length, 'items, first:', products[0]);
    var scroller = document.createElement('div');
    // Use fully inline styles — bypass any CSS class issues
    scroller.style.cssText = 'display:flex;gap:12px;overflow-x:auto;padding:8px 0 12px;width:100%;flex-shrink:0;';
    products.forEach(function(p) {
      var card = document.createElement('div');
      card.style.cssText = 'flex-shrink:0;width:150px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.12);display:flex;flex-direction:column;font-family:sans-serif;cursor:pointer;transition:transform .15s;';
      card.title = 'View ' + (p.title || '');
      // Click anywhere on card (except button) → open detail
      card.onclick = function(e) { if (e.target.tagName !== 'BUTTON') showDetail(p); };

      // Image
      if (p.imageUrl) {
        var img = document.createElement('img');
        img.style.cssText = 'width:100%;height:130px;object-fit:cover;display:block;';
        img.src = p.imageUrl; img.alt = p.title || '';
        img.onerror = function() { this.style.display='none'; };
        card.appendChild(img);
      } else {
        var ph2 = document.createElement('div');
        ph2.style.cssText = 'width:100%;height:130px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;';
        ph2.textContent = '🛍';
        card.appendChild(ph2);
      }

      // Body
      var body = document.createElement('div');
      body.style.cssText = 'padding:8px 8px 4px;flex:1;';

      var titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:12px;font-weight:700;color:#1e293b;line-height:1.35;margin-bottom:5px;';
      titleEl.textContent = p.title || '';
      body.appendChild(titleEl);

      var priceEl = document.createElement('div');
      priceEl.style.cssText = 'font-size:13px;font-weight:800;color:' + S + ';';
      priceEl.textContent = p.salePrice ? ('₹' + p.salePrice) : ('₹' + p.price);
      if (p.salePrice) {
        var orig = document.createElement('span');
        orig.style.cssText = 'font-size:11px;color:#94a3b8;text-decoration:line-through;margin-left:4px;font-weight:400;';
        orig.textContent = '₹' + p.price;
        priceEl.appendChild(orig);
      }
      body.appendChild(priceEl);
      card.appendChild(body);

      // Button
      var btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:8px;background:' + S + ';color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;';
      btn.textContent = 'Order this';
      btn.onclick = function() { inp.value = 'I want to order ' + p.title; snd.disabled = false; doSend(); };
      card.appendChild(btn);

      scroller.appendChild(card);
    });

    msgs.appendChild(scroller);
    setTimeout(function() {
      msgs.scrollTop = msgs.scrollHeight;
      console.log('[RC] scroller added — height:', scroller.offsetHeight, 'cards:', scroller.children.length);
    }, 50);
  }

  function ph() {
    var d = document.createElement('div'); d.className = 'rc-cph';
    d.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    return d;
  }

  function showBadge() { badge.style.display = 'flex'; badge.textContent = unread > 9 ? '9+' : unread; }

})();
