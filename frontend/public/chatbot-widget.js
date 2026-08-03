/**
 * Silarai / ReplyCart embeddable chat widget.
 *
 * Embed contract (unchanged — one script tag):
 *   <script>window.RCChatbotConfig = { apiKey: "...", apiBase: "..." };</script>
 *   <script src=".../chatbot-widget.js" async></script>
 *
 * Two structural properties worth knowing before editing:
 *
 *  1. EVERYTHING RENDERS INSIDE A SHADOW ROOT. The host page's CSS cannot reach in and
 *     ours cannot leak out, so no `!important` arms race with whatever the embedder is
 *     running. The cost is that document-level APIs do not work here: use `root.getElementById`,
 *     not `document.getElementById`, and remember `document.activeElement` reports the
 *     host element, not the focused node inside.
 *
 *  2. THE CART IS A READ-ONLY MIRROR OF THE SERVER CART. Every mutation round-trips to
 *     POST /chatbot/{apiKey}/cart and we re-render whatever comes back, so the widget can
 *     never disagree with what the AI sees or with what actually gets ordered. Never
 *     mutate `cart` locally to feel faster.
 *
 * Deploying a change here requires cache-busting the embed URL on third-party sites —
 * they load this file directly and there is no bundler hash. Keep the response handling
 * backward-compatible in both directions.
 */
(function () {
  'use strict';

  var cfg      = window.RCChatbotConfig || {};
  var API_KEY  = cfg.apiKey || '';
  var API_BASE = (cfg.apiBase || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net').replace(/\/$/, '');
  var PRIMARY  = cfg.primaryColor || '#0d9488';
  var ACCENT   = cfg.accentColor  || '#6366f1';
  var POSITION = cfg.position === 'left' ? 'left' : 'right';

  if (!API_KEY) { console.warn('[Silarai] apiKey missing — widget not mounted.'); return; }

  var SESSION_KEY = 'rc_s_' + API_KEY;
  var TEASER_KEY  = 'rc_teaser_' + API_KEY;

  var sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'w_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  // ── State ───────────────────────────────────────────────────────────────────
  var allProducts = [];
  var clientName  = 'Assistant';
  var payCfg      = { codEnabled: true, onlineEnabled: false, razorpayKeyId: null };
  var focused     = null;                    // single-product mode
  var cart        = { items: [], total: 0, count: 0, currency: 'INR' };
  var isOpen = false, busy = false, cartBusy = false, greeted = false, unread = 0;
  var welcomeMsg = '', configPromise = null;
  var lastSender = null;                     // message grouping

  // ── Styles ──────────────────────────────────────────────────────────────────
  // No external font: an embedded widget should not add a render-blocking third-party
  // request to someone else's page. The system stack renders natively everywhere.
  var CSS = `
  :host{
    --rc-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --rc-bg:#ffffff; --rc-canvas:#f7f8fa; --rc-line:#e8ebef;
    --rc-text:#16181d; --rc-muted:#6b7280; --rc-faint:#9ca3af;
    --rc-r-sm:10px; --rc-r-md:14px; --rc-r-lg:20px; --rc-r-xl:26px;
    --rc-shadow:0 1px 2px rgba(16,24,40,.04), 0 12px 32px rgba(16,24,40,.12);
    --rc-shadow-lg:0 24px 64px rgba(16,24,40,.22);
    all: initial;
    position: fixed; inset: 0; z-index: 2147483647;
    pointer-events: none;
    font-family: var(--rc-font);
  }
  *,*::before,*::after{ box-sizing:border-box; }
  button{ font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
  button:focus-visible, input:focus-visible, textarea:focus-visible{
    outline:2px solid var(--rc-primary); outline-offset:2px;
  }

  .anchor{
    position:absolute; bottom:20px; pointer-events:none;
    display:flex; flex-direction:column; align-items:flex-end; gap:12px;
  }
  :host([data-pos="right"]) .anchor{ right:20px; align-items:flex-end; }
  :host([data-pos="left"])  .anchor{ left:20px;  align-items:flex-start; }

  /* ── Launcher ──────────────────────────────────────────────────────────── */
  .fab{
    pointer-events:auto; position:relative;
    width:58px; height:58px; border-radius:50%;
    background:var(--rc-primary); color:#fff;
    box-shadow:0 6px 20px var(--rc-primary-a40), 0 2px 6px rgba(16,24,40,.16);
    display:flex; align-items:center; justify-content:center;
    transition:transform .22s cubic-bezier(.34,1.4,.64,1), box-shadow .22s;
  }
  .fab:hover{ transform:translateY(-2px); box-shadow:0 12px 28px var(--rc-primary-a55); }
  .fab:active{ transform:translateY(0) scale(.96); }
  .fab svg{ width:26px; height:26px; fill:currentColor; }
  .fab .badge{
    position:absolute; top:-3px; right:-3px; min-width:20px; height:20px; padding:0 5px;
    border-radius:10px; background:#ef4444; border:2px solid #fff; color:#fff;
    font-size:11px; font-weight:700; line-height:1;
    display:none; align-items:center; justify-content:center;
  }
  .fab .badge.on{ display:flex; }
  .fab .presence{
    position:absolute; bottom:2px; right:2px; width:13px; height:13px; border-radius:50%;
    background:#22c55e; border:2.5px solid #fff;
  }

  /* ── Teaser ────────────────────────────────────────────────────────────── */
  .teaser{
    pointer-events:auto; position:relative; display:none;
    width:264px; padding:14px 34px 14px 14px; gap:11px;
    background:var(--rc-bg); border-radius:var(--rc-r-lg);
    box-shadow:var(--rc-shadow); border:1px solid var(--rc-line);
    text-align:left;
  }
  .teaser.on{ display:flex; animation:rc-rise .34s cubic-bezier(.34,1.4,.64,1); }
  .teaser .av{
    width:38px; height:38px; border-radius:50%; flex-shrink:0; overflow:hidden;
    background:var(--rc-primary); color:#fff;
    display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px;
  }
  .teaser .av img{ width:100%; height:100%; object-fit:cover; }
  .teaser .t{ font-size:13px; color:var(--rc-muted); line-height:1.5; }
  .teaser .t b{ display:block; color:var(--rc-text); font-size:13.5px; margin-bottom:2px; }
  .teaser .x{
    position:absolute; top:8px; right:8px; width:22px; height:22px; border-radius:50%;
    color:var(--rc-faint); font-size:14px; line-height:1;
    display:flex; align-items:center; justify-content:center;
  }
  .teaser .x:hover{ background:var(--rc-canvas); color:var(--rc-muted); }

  /* ── Panel ─────────────────────────────────────────────────────────────── */
  .panel{
    pointer-events:auto; position:absolute; bottom:90px;
    width:396px; max-width:calc(100vw - 32px);
    height:min(636px, calc(100vh - 130px));
    background:var(--rc-bg); border-radius:var(--rc-r-xl);
    box-shadow:var(--rc-shadow-lg);
    display:none; flex-direction:column; overflow:hidden;
  }
  :host([data-pos="right"]) .panel{ right:20px; }
  :host([data-pos="left"])  .panel{ left:20px; }
  .panel.on{ display:flex; animation:rc-rise .28s cubic-bezier(.34,1.4,.64,1); }
  @keyframes rc-rise{ from{ opacity:0; transform:translateY(14px) scale(.97);} to{ opacity:1; transform:none; } }

  /* Header — one row. The cart moved up here so it stops competing with the composer. */
  .head{
    flex-shrink:0; display:flex; align-items:center; gap:11px;
    padding:14px 14px 13px 16px; background:var(--rc-bg);
    border-bottom:1px solid var(--rc-line);
  }
  .head .av{
    width:38px; height:38px; border-radius:50%; flex-shrink:0; overflow:hidden;
    background:var(--rc-primary); color:#fff;
    display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px;
  }
  .head .av img{ width:100%; height:100%; object-fit:cover; }
  .head .meta{ flex:1; min-width:0; }
  .head .nm{
    font-size:15px; font-weight:650; color:var(--rc-text); letter-spacing:-.01em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .head .st{ display:flex; align-items:center; gap:5px; margin-top:2px; font-size:12px; color:var(--rc-muted); }
  .head .st i{ width:6px; height:6px; border-radius:50%; background:#22c55e; flex-shrink:0; }
  .iconbtn{
    position:relative; width:34px; height:34px; border-radius:var(--rc-r-sm); flex-shrink:0;
    color:var(--rc-muted); display:flex; align-items:center; justify-content:center;
    transition:background .16s, color .16s;
  }
  .iconbtn:hover{ background:var(--rc-canvas); color:var(--rc-text); }
  .iconbtn svg{ width:19px; height:19px; fill:none; stroke:currentColor; stroke-width:2;
                stroke-linecap:round; stroke-linejoin:round; }
  .iconbtn .cnt{
    position:absolute; top:1px; right:1px; min-width:17px; height:17px; padding:0 4px;
    border-radius:9px; background:var(--rc-primary); color:#fff;
    font-size:10px; font-weight:700; line-height:1;
    display:none; align-items:center; justify-content:center;
  }
  .iconbtn .cnt.on{ display:flex; }

  /* Focused-product context strip */
  .focus{
    flex-shrink:0; display:none; align-items:center; gap:10px;
    padding:9px 14px; background:var(--rc-primary-a08);
    border-bottom:1px solid var(--rc-line);
  }
  .focus.on{ display:flex; animation:rc-drop .22s ease; }
  @keyframes rc-drop{ from{ opacity:0; transform:translateY(-5px);} to{ opacity:1; transform:none; } }
  .focus img{ width:34px; height:34px; border-radius:var(--rc-r-sm); object-fit:cover; flex-shrink:0; }
  .focus .ft{ flex:1; min-width:0; }
  .focus .ft b{ display:block; font-size:12.5px; font-weight:650; color:var(--rc-text);
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .focus .ft span{ font-size:11px; color:var(--rc-muted); }
  .focus button{
    flex-shrink:0; padding:6px 11px; border-radius:20px; background:var(--rc-bg);
    border:1px solid var(--rc-line); color:var(--rc-primary); font-size:11.5px; font-weight:650;
  }
  .focus button:hover{ border-color:var(--rc-primary); }

  /* ── Message list ──────────────────────────────────────────────────────── */
  .msgs{
    flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain;
    padding:16px 14px 8px; background:var(--rc-canvas);
    display:flex; flex-direction:column; gap:10px;
  }
  .msgs::-webkit-scrollbar{ width:6px; }
  .msgs::-webkit-scrollbar-thumb{ background:#d5d9e0; border-radius:3px; }
  .msgs::-webkit-scrollbar-thumb:hover{ background:#b9bfc9; }
  .msgs::-webkit-scrollbar-button{ display:none; width:0; height:0; }

  /* .msgs is a column flex container, so every child MUST opt out of shrinking.
     Scroll containers are the dangerous case: their automatic minimum size is 0, not
     min-content, so an un-pinned .rail collapses to nothing but its scrollbar. */
  .msgs > *{ flex:0 0 auto; }

  .row{ display:flex; align-items:flex-end; gap:8px; animation:rc-in .24s ease; }
  @keyframes rc-in{ from{ opacity:0; transform:translateY(6px);} to{ opacity:1; transform:none; } }
  .row.user{ flex-direction:row-reverse; }
  .row.tight{ margin-top:-6px; }
  .row .av{
    width:26px; height:26px; border-radius:50%; flex-shrink:0;
    background:var(--rc-primary); color:#fff;
    display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;
  }
  .row .av.ghost{ visibility:hidden; }
  .bub{
    max-width:82%; padding:10px 14px; font-size:14px; line-height:1.55;
    word-break:break-word; border-radius:var(--rc-r-lg);
  }
  .bub.bot{ background:var(--rc-bg); color:var(--rc-text);
            border-bottom-left-radius:6px; box-shadow:0 1px 2px rgba(16,24,40,.06); }
  .bub.user{ background:var(--rc-primary); color:#fff; border-bottom-right-radius:6px; }
  .bub p{ margin:0 0 6px; } .bub p:last-child{ margin-bottom:0; }
  .bub ul{ margin:4px 0; padding-left:18px; }

  .think{
    display:flex; align-items:center; gap:9px; padding:9px 14px;
    background:var(--rc-bg); border-radius:var(--rc-r-lg); border-bottom-left-radius:6px;
    box-shadow:0 1px 2px rgba(16,24,40,.06);
    font-size:13px; color:var(--rc-muted);
  }
  .think .txt{ animation:rc-fade .2s ease; }
  @keyframes rc-fade{ from{ opacity:.35; } to{ opacity:1; } }
  .dots{ display:flex; gap:4px; flex-shrink:0; }
  .dots i{ width:6px; height:6px; border-radius:50%; background:var(--rc-primary);
           opacity:.35; animation:rc-bounce .9s infinite ease-in-out; }
  .dots i:nth-child(2){ animation-delay:.16s; }
  .dots i:nth-child(3){ animation-delay:.32s; }
  @keyframes rc-bounce{ 0%,80%,100%{ transform:none; opacity:.35; } 40%{ transform:translateY(-5px); opacity:1; } }

  .chips{ display:flex; flex-wrap:wrap; gap:7px; padding:2px 0 4px 34px; }
  .chip{
    padding:7px 13px; border-radius:20px; background:var(--rc-bg);
    border:1px solid var(--rc-line); color:var(--rc-text);
    font-size:12.5px; font-weight:550; transition:all .16s;
  }
  .chip:hover{ border-color:var(--rc-primary); color:var(--rc-primary); transform:translateY(-1px); }

  /* ── Product carousel ──────────────────────────────────────────────────── */
  /* One primary action per card; the whole card opens the detail sheet. Two competing
     buttons on a 158px card was the main source of visual noise in the old design. */
  .railwrap{ position:relative; margin-left:34px; flex:0 0 auto; }
  .railwrap .nav{
    position:absolute; top:calc(50% - 7px); transform:translateY(-50%);
    width:28px; height:28px; border-radius:50%; z-index:2;
    background:var(--rc-bg); border:1px solid var(--rc-line);
    box-shadow:0 2px 8px rgba(16,24,40,.16); color:var(--rc-muted);
    display:none; align-items:center; justify-content:center;
    opacity:0; transition:opacity .16s, color .16s, border-color .16s;
  }
  .railwrap .nav.on{ display:flex; }
  .railwrap:hover .nav.on, .railwrap .nav.on:focus-visible{ opacity:1; }
  .railwrap .nav:hover{ color:var(--rc-text); border-color:var(--rc-primary-a40); }
  .railwrap .nav.prev{ left:-8px; }
  .railwrap .nav.next{ right:-8px; }
  .railwrap .nav svg{ width:14px; height:14px; fill:none; stroke:currentColor;
                      stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }

  .rail{
    display:flex; gap:10px; overflow-x:auto; overflow-y:hidden;
    padding:4px 0 10px; scroll-snap-type:x proximity;
    scrollbar-width:thin; cursor:grab;
    flex:0 0 auto;            /* see the .msgs > * note above — without this it collapses */
  }
  .rail.drag{ cursor:grabbing; scroll-behavior:auto; }
  .rail::-webkit-scrollbar{ height:6px; }
  .rail::-webkit-scrollbar-button{ display:none; width:0; height:0; }
  .rail::-webkit-scrollbar-thumb{ background:#d5d9e0; border-radius:3px; }
  .card{
    flex:0 0 auto; width:150px; scroll-snap-align:start;
    background:var(--rc-bg); border:1px solid var(--rc-line); border-radius:var(--rc-r-md);
    overflow:hidden; display:flex; flex-direction:column;
    transition:border-color .16s, box-shadow .16s, transform .16s;
  }
  .card:hover{ border-color:var(--rc-primary-a40); box-shadow:0 8px 22px rgba(16,24,40,.1); transform:translateY(-2px); }
  .card .ph{
    position:relative; width:100%; height:150px; aspect-ratio:1/1; background:var(--rc-canvas);
    flex:0 0 auto;   /* explicit height first: aspect-ratio alone leaves older WebViews at 0 */
    display:flex; align-items:center; justify-content:center; overflow:hidden;
  }
  .card .ph img{ width:100%; height:100%; object-fit:cover; display:block; }
  .card .ph .noimg{ font-size:24px; opacity:.35; }
  .card .off{
    position:absolute; top:7px; left:7px; padding:3px 7px; border-radius:6px;
    background:#16a34a; color:#fff; font-size:10px; font-weight:700; letter-spacing:.02em;
  }
  .card .body{ padding:9px 10px; flex:1; display:flex; flex-direction:column; gap:4px; }
  .card .ttl{
    font-size:12.5px; font-weight:600; color:var(--rc-text); line-height:1.35;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  }
  .card .pr{ display:flex; align-items:baseline; gap:5px; margin-top:auto; }
  .card .pr b{ font-size:14px; font-weight:700; color:var(--rc-text); }
  .card .pr s{ font-size:11px; color:var(--rc-faint); }
  .card .add{
    margin:0 8px 8px; padding:8px; border-radius:var(--rc-r-sm);
    background:var(--rc-primary-a08); color:var(--rc-primary);
    font-size:12px; font-weight:650; transition:background .16s, color .16s;
  }
  .card .add:hover{ background:var(--rc-primary); color:#fff; }
  .card .add:disabled{ opacity:.6; }

  /* ── Sheets (cart + product detail) ────────────────────────────────────── */
  /* Both slide over the message area but stop below the header, so the buyer never
     loses sight of who they are talking to. */
  .scrim{
    position:absolute; inset:0; background:rgba(16,24,40,.32);
    opacity:0; pointer-events:none; transition:opacity .22s; z-index:5;
  }
  .scrim.on{ opacity:1; pointer-events:auto; }
  .sheet{
    position:absolute; left:0; right:0; bottom:0; z-index:6;
    max-height:82%; background:var(--rc-bg);
    border-radius:var(--rc-r-xl) var(--rc-r-xl) 0 0;
    box-shadow:0 -8px 32px rgba(16,24,40,.16);
    display:flex; flex-direction:column;
    transform:translateY(101%); transition:transform .26s cubic-bezier(.32,.72,0,1);
  }
  .sheet.on{ transform:none; }
  .sheet .sh{
    flex-shrink:0; display:flex; align-items:center; gap:10px;
    padding:14px 16px 12px; border-bottom:1px solid var(--rc-line);
  }
  .sheet .sh h3{ margin:0; flex:1; font-size:15px; font-weight:650; color:var(--rc-text); }
  .sheet .sb{ flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
  .sheet .sf{ flex-shrink:0; padding:12px 16px 16px; border-top:1px solid var(--rc-line); background:var(--rc-bg); }
  .grip{
    width:36px; height:4px; border-radius:2px; background:var(--rc-line);
    margin:8px auto 0; flex-shrink:0;
  }

  .line{ display:flex; align-items:center; gap:11px; padding:11px 16px; }
  .line + .line{ border-top:1px solid var(--rc-line); }
  .line .th{
    width:44px; height:44px; border-radius:var(--rc-r-sm); flex-shrink:0; overflow:hidden;
    background:var(--rc-canvas); display:flex; align-items:center; justify-content:center; font-size:17px;
  }
  .line .th img{ width:100%; height:100%; object-fit:cover; }
  .line .info{ flex:1; min-width:0; }
  .line .info b{ display:block; font-size:13px; font-weight:600; color:var(--rc-text); line-height:1.35;
                 overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .line .info span{ font-size:11.5px; color:var(--rc-muted); }
  .stepper{ display:flex; align-items:center; gap:2px; flex-shrink:0;
            border:1px solid var(--rc-line); border-radius:var(--rc-r-sm); padding:2px; }
  .stepper button{ width:24px; height:24px; border-radius:6px; color:var(--rc-muted);
                   font-size:15px; line-height:1; display:flex; align-items:center; justify-content:center; }
  .stepper button:hover:not(:disabled){ background:var(--rc-canvas); color:var(--rc-text); }
  .stepper button:disabled{ opacity:.35; }
  .stepper span{ min-width:20px; text-align:center; font-size:12.5px; font-weight:650; color:var(--rc-text); }
  .line .lt{ font-size:13px; font-weight:650; color:var(--rc-text); white-space:nowrap; min-width:56px; text-align:right; }

  .total{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:11px; }
  .total span{ font-size:13px; color:var(--rc-muted); }
  .total b{ font-size:19px; font-weight:700; color:var(--rc-text); }
  .cta{
    width:100%; padding:13px; border-radius:var(--rc-r-md);
    background:var(--rc-primary); color:#fff; font-size:14px; font-weight:650;
    transition:filter .16s, transform .12s;
  }
  .cta:hover{ filter:brightness(1.07); }
  .cta:active{ transform:scale(.99); }
  .cta:disabled{ opacity:.5; }
  .cta.ghost{ background:var(--rc-primary-a08); color:var(--rc-primary); }
  .empty{ padding:40px 20px; text-align:center; color:var(--rc-muted); font-size:13.5px; }

  /* ── Product detail ────────────────────────────────────────────────────── */
  /* A full in-panel view rather than a sheet: this is the pre-redesign behaviour and
     it gives a product the whole panel, which a 4/3 hero and a variant grid need. */
  .detail{
    position:absolute; inset:0; z-index:7; background:var(--rc-bg);
    display:none; flex-direction:column; overflow:hidden;
  }
  .detail.on{ display:flex; animation:rc-slide-in .2s ease; }
  @keyframes rc-slide-in{ from{ opacity:0; transform:translateX(12px);} to{ opacity:1; transform:none; } }
  .detail .dbar{
    flex-shrink:0; display:flex; align-items:center; gap:8px;
    padding:11px 12px; border-bottom:1px solid var(--rc-line);
  }
  .detail .dbar b{ font-size:14px; font-weight:650; color:var(--rc-text); }
  .detail .dbody{ flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
  .detail .dbody::-webkit-scrollbar{ width:6px; }
  .detail .dbody::-webkit-scrollbar-thumb{ background:#d5d9e0; border-radius:3px; }
  .detail .dfoot{
    flex-shrink:0; display:flex; gap:9px;
    padding:12px 14px; border-top:1px solid var(--rc-line);
  }
  .detail .dfoot .cta{ flex:1; }

  .pd img.hero{ width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .pd .pdb{ padding:16px; }
  .pd .cat{
    display:inline-block; padding:4px 10px; border-radius:20px;
    background:var(--rc-primary-a08); color:var(--rc-primary);
    font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em;
  }
  .pd h4{ margin:10px 0 8px; font-size:18px; font-weight:700; color:var(--rc-text); line-height:1.3; }
  .pd .prow{ display:flex; align-items:baseline; gap:9px; flex-wrap:wrap; margin-bottom:12px; }
  .pd .prow b{ font-size:22px; font-weight:700; color:var(--rc-text); }
  .pd .prow s{ font-size:14px; color:var(--rc-faint); }
  .pd .prow em{ font-style:normal; font-size:11px; font-weight:700; color:#16a34a;
                background:#f0fdf4; padding:3px 8px; border-radius:20px; }
  .pd .desc{ margin:0 0 14px; font-size:13.5px; color:var(--rc-muted); line-height:1.65; }
  .pd .vlabel{ margin:0 0 7px; font-size:11px; font-weight:700; color:var(--rc-muted);
               text-transform:uppercase; letter-spacing:.05em; }
  .pd .vrow{ display:flex; flex-wrap:wrap; gap:7px; }
  .pd .vrow button{
    padding:7px 14px; border-radius:20px; border:1px solid var(--rc-line);
    font-size:12.5px; font-weight:600; color:var(--rc-muted); transition:all .16s;
  }
  .pd .vrow button:hover{ border-color:var(--rc-primary); color:var(--rc-primary); }
  .pd .vrow button.on{ border-color:var(--rc-primary); color:var(--rc-primary); background:var(--rc-primary-a08); }

  /* Order receipt */
  .receipt{
    width:100%; background:var(--rc-bg); border:1px solid var(--rc-line);
    border-radius:var(--rc-r-md); overflow:hidden;
  }
  .receipt .rh{ display:flex; align-items:center; gap:11px; padding:14px 15px; color:#fff; }
  .receipt .rh.ok{ background:#16a34a; } .receipt .rh.wait{ background:var(--rc-primary); }
  .receipt .rh .ic{
    width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.2); flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .receipt .rh .ic svg{ width:18px; height:18px; }
  .receipt .rh b{ display:block; font-size:14px; font-weight:650; }
  .receipt .rh span{ font-size:11.5px; opacity:.92; }
  .receipt .rb{ padding:12px 15px; }
  .receipt .ri{ display:flex; align-items:center; gap:10px; padding:5px 0; }
  .receipt .ri .th{ width:34px; height:34px; border-radius:8px; overflow:hidden; flex-shrink:0;
                    background:var(--rc-canvas); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .receipt .ri .th img{ width:100%; height:100%; object-fit:cover; }
  .receipt .ri .m{ flex:1; min-width:0; }
  .receipt .ri .m b{ display:block; font-size:12.5px; font-weight:600; color:var(--rc-text); }
  .receipt .ri .m span{ font-size:11px; color:var(--rc-faint); }
  .receipt .ri .amt{ font-size:12.5px; font-weight:650; color:var(--rc-text); white-space:nowrap; }
  .receipt .rt{
    display:flex; justify-content:space-between; align-items:center;
    border-top:1px dashed var(--rc-line); margin-top:8px; padding-top:10px;
  }
  .receipt .rt span{ font-size:12px; color:var(--rc-muted); font-weight:550; }
  .receipt .rt b{ font-size:16px; font-weight:700; color:var(--rc-text); }
  .receipt .pay{ width:100%; padding:12px; background:var(--rc-primary); color:#fff;
                 font-size:13.5px; font-weight:650; }

  /* ── Composer ──────────────────────────────────────────────────────────── */
  .foot{ flex-shrink:0; padding:10px 12px 8px; background:var(--rc-bg); border-top:1px solid var(--rc-line); }
  .composer{
    display:flex; align-items:flex-end; gap:8px; padding:5px 5px 5px 14px;
    background:var(--rc-canvas); border:1px solid var(--rc-line); border-radius:var(--rc-r-lg);
    transition:border-color .16s, box-shadow .16s;
  }
  .composer:focus-within{ border-color:var(--rc-primary); box-shadow:0 0 0 3px var(--rc-primary-a15); }
  .composer textarea{
    flex:1; min-width:0; display:block;
    border:none; outline:none; background:none; resize:none;
    font-family:inherit; font-size:14px; line-height:20px; color:var(--rc-text);
    padding:7px 0; height:34px; max-height:96px;
    /* hidden by default so the native scrollbar never appears; autoGrow() flips this
       to auto only once the content actually exceeds max-height */
    overflow-y:hidden;
  }
  .composer textarea::placeholder{ color:var(--rc-faint); }
  .composer textarea::-webkit-scrollbar{ width:0; height:0; }
  .send{
    width:34px; height:34px; border-radius:50%; flex-shrink:0; margin-bottom:1px;
    background:var(--rc-primary); color:#fff;
    display:flex; align-items:center; justify-content:center;
    transition:opacity .16s, transform .12s;
  }
  .send svg{ width:16px; height:16px; fill:currentColor; }
  .send:disabled{ opacity:.3; }
  .send:not(:disabled):active{ transform:scale(.92); }
  .brand{ text-align:center; font-size:10px; color:var(--rc-faint); padding:6px 0 2px; }
  .brand a{ color:var(--rc-muted); text-decoration:none; font-weight:600; }

  @media (max-width:480px){
    .panel{
      width:100vw; max-width:100vw; height:100vh; height:100dvh;
      bottom:0; right:0; left:0; border-radius:0;
    }
    :host([data-pos="left"]) .panel, :host([data-pos="right"]) .panel{ left:0; right:0; }
    .anchor{ bottom:16px; }
    :host([data-pos="right"]) .anchor{ right:16px; }
    :host([data-pos="left"])  .anchor{ left:16px; }
    /* The panel is full-screen here, so the launcher would just sit on top of it. */
    .panel.on ~ .anchor{ display:none; }
  }

  @media (prefers-reduced-motion: reduce){
    *{ animation-duration:.01ms !important; animation-iteration-count:1 !important;
       transition-duration:.01ms !important; }
  }
  `;

  // ── Mount (shadow root) ─────────────────────────────────────────────────────
  var host = document.createElement('div');
  host.setAttribute('data-pos', POSITION);
  var root = host.attachShadow({ mode: 'open' });

  // Brand colours as custom properties. The alpha variants are precomputed in JS rather
  // than via color-mix(), which older Android WebViews (a real slice of this audience)
  // do not support.
  function alpha(hex, pct) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var a = Math.round(Math.max(0, Math.min(100, pct)) * 2.55).toString(16);
    return '#' + h + (a.length === 1 ? '0' + a : a);
  }
  host.style.setProperty('--rc-primary', PRIMARY);
  host.style.setProperty('--rc-accent', ACCENT);
  host.style.setProperty('--rc-primary-a08', alpha(PRIMARY, 8));
  host.style.setProperty('--rc-primary-a15', alpha(PRIMARY, 15));
  host.style.setProperty('--rc-primary-a40', alpha(PRIMARY, 40));
  host.style.setProperty('--rc-primary-a55', alpha(PRIMARY, 55));

  var ICON = {
    chat:  '<svg viewBox="0 0 24 24"><path d="M12 3c5.52 0 10 3.73 10 8.33 0 4.6-4.48 8.34-10 8.34a11 11 0 0 1-2.4-.27L4.6 21.5a.6.6 0 0 1-.86-.66l.83-3.2C2.94 16.14 2 13.87 2 11.33 2 6.73 6.48 3 12 3Z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71l-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/></svg>',
    send:  '<svg viewBox="0 0 24 24"><path d="M3.4 20.4 21 12 3.4 3.6 3.39 10.1 15.6 12 3.39 13.9z"/></svg>',
    bag:   '<svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    x:     '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    back:  '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    prev:  '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    next:  '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  root.innerHTML =
    '<style>' + CSS + '</style>' +
    '<div class="panel" id="panel" role="dialog" aria-modal="false" aria-label="Chat">' +
      '<div class="head">' +
        '<div class="av" id="hav"><span id="hini">AI</span></div>' +
        '<div class="meta">' +
          '<div class="nm" id="hname">Assistant</div>' +
          '<div class="st"><i></i><span>Online</span></div>' +
        '</div>' +
        '<button class="iconbtn" id="cartBtn" aria-label="Cart">' + ICON.bag + '<span class="cnt" id="cartCnt">0</span></button>' +
        '<button class="iconbtn" id="closeBtn" aria-label="Close chat">' + ICON.x + '</button>' +
      '</div>' +
      '<div class="focus" id="focusBar">' +
        '<img id="focusImg" alt=""/>' +
        '<div class="ft"><b id="focusTitle"></b><span>You\'re viewing this</span></div>' +
        '<button id="browseBtn">Browse all</button>' +
      '</div>' +
      '<div class="msgs" id="msgs"></div>' +
      '<div class="foot">' +
        '<div class="composer">' +
          '<textarea id="inp" rows="1" placeholder="Type a message…" autocomplete="off"></textarea>' +
          '<button class="send" id="send" disabled aria-label="Send">' + ICON.send + '</button>' +
        '</div>' +
        '<div class="brand">Powered by <a href="https://silarai.com" target="_blank" rel="noopener">Silarai</a></div>' +
      '</div>' +
      '<div class="scrim" id="scrim"></div>' +
      '<div class="sheet" id="cartSheet" aria-label="Cart">' +
        '<div class="grip"></div>' +
        '<div class="sh"><h3>Your cart</h3><button class="iconbtn" id="cartClose" aria-label="Close">' + ICON.x + '</button></div>' +
        '<div class="sb" id="cartLines"></div>' +
        '<div class="sf" id="cartFoot"></div>' +
      '</div>' +
      '<div class="detail pd" id="detail" aria-label="Product details">' +
        '<div class="dbar"><button class="iconbtn" id="pdBack" aria-label="Back">' + ICON.back + '</button><b>Product details</b></div>' +
        '<div class="dbody" id="pdBody"></div>' +
        '<div class="dfoot" id="pdFoot"></div>' +
      '</div>' +
    '</div>' +
    '<div class="anchor">' +
      '<div class="teaser" id="teaser">' +
        '<button class="x" id="teaserX" aria-label="Dismiss">&#x2715;</button>' +
        '<div class="av" id="tav"><span id="tini">AI</span></div>' +
        '<div class="t"><b id="tname">Need a hand?</b><span id="tmsg">Looking for something? I can help you find it.</span></div>' +
      '</div>' +
      '<button class="fab" id="fab" aria-label="Open chat">' + ICON.chat +
        '<span class="presence"></span><span class="badge" id="fabBadge"></span>' +
      '</button>' +
    '</div>';

  document.body.appendChild(host);

  var $ = function (id) { return root.getElementById(id); };
  var panel = $('panel'), fab = $('fab'), fabBadge = $('fabBadge'), msgs = $('msgs'),
      inp = $('inp'), send = $('send'), scrim = $('scrim'),
      hav = $('hav'), hini = $('hini'), hname = $('hname'),
      cartBtn = $('cartBtn'), cartCnt = $('cartCnt'),
      cartSheet = $('cartSheet'), cartLines = $('cartLines'), cartFoot = $('cartFoot'),
      detailEl = $('detail'), pdBody = $('pdBody'), pdFoot = $('pdFoot'),
      focusBar = $('focusBar'), focusImg = $('focusImg'), focusTitle = $('focusTitle'),
      teaser = $('teaser'), tav = $('tav'), tini = $('tini'), tname = $('tname');

  // ── Small helpers ───────────────────────────────────────────────────────────
  function money(n, ccy) {
    var c = ccy || cart.currency || 'INR';
    var sym = c === 'INR' ? '₹' : c + ' ';
    return sym + Number(n || 0).toLocaleString('en-IN');
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  // The model is instructed never to emit markdown, but a stray ** should degrade to
  // text rather than render literally.
  function md(text) {
    var s = esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\W)\*(?!\s)(.+?)\*(?=\W|$)/g, '$1<em>$2</em>');
    var out = [], list = false;
    s.split('\n').forEach(function (raw) {
      var l = raw.trim();
      if (/^[-•]\s+/.test(l)) {
        if (!list) { out.push('<ul>'); list = true; }
        out.push('<li>' + l.replace(/^[-•]\s+/, '') + '</li>');
      } else {
        if (list) { out.push('</ul>'); list = false; }
        if (l) out.push('<p>' + l + '</p>');
      }
    });
    if (list) out.push('</ul>');
    return out.join('') || '<p></p>';
  }
  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }
  function avatarLetter() { return hini.textContent || 'AI'; }

  /**
   * Lower-cases the first letter of every key, recursively.
   *
   * This widget is loaded directly by third-party sites and has NO version coupling to
   * the backend: during any deploy a new widget can talk to an old server, and old
   * cached widgets talk to new servers indefinitely. One such skew shipped PascalCase
   * product fields (`Title`, `Price`, `ImageUrl`) to a widget reading camelCase, which
   * rendered a carousel of blank ₹0 cards — the data was all there, only the casing
   * differed. Normalising at the boundary turns that class of mismatch from
   * catastrophic into a no-op.
   *
   * It warns once rather than staying silent, because a PascalCase response still means
   * the server is older than it should be and somebody should redeploy it.
   */
  var warnedShape = false;
  function camelKeys(v) {
    if (Array.isArray(v)) return v.map(camelKeys);
    if (!v || typeof v !== 'object') return v;
    var out = {};
    for (var k in v) {
      if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
      if (!warnedShape && k.length && k[0] >= 'A' && k[0] <= 'Z') {
        warnedShape = true;
        console.warn('[Silarai] Server returned PascalCase fields — the backend is older than this widget. Redeploy the API.');
      }
      out[k.charAt(0).toLowerCase() + k.slice(1)] = camelKeys(v[k]);
    }
    return out;
  }

  // ── Overlays ────────────────────────────────────────────────────────────────
  // The cart is a bottom sheet (it is a short list and benefits from keeping the
  // conversation visible behind it). The product detail is a full in-panel view — a
  // hero image plus variants needs the whole panel, and that matches the pre-redesign
  // behaviour people are used to.
  function openSheet(el) {
    closeSheets();
    el.classList.add('on');
    scrim.classList.add('on');
  }
  function closeSheets() {
    cartSheet.classList.remove('on');
    scrim.classList.remove('on');
  }
  function openDetail() { closeSheets(); detailEl.classList.add('on'); }
  function closeDetail() { detailEl.classList.remove('on'); }
  function anyOverlayOpen() {
    return cartSheet.classList.contains('on') || detailEl.classList.contains('on');
  }

  scrim.addEventListener('click', closeSheets);
  $('cartClose').addEventListener('click', closeSheets);
  $('pdBack').addEventListener('click', closeDetail);
  cartBtn.addEventListener('click', function () {
    if (cartSheet.classList.contains('on')) return closeSheets();
    closeDetail(); renderCart(); openSheet(cartSheet);
  });

  // ── Cart ────────────────────────────────────────────────────────────────────
  function setCart(raw) {
    if (!raw) return;
    var c = camelKeys(raw);
    cart = {
      items: c.items || [], total: c.total || 0,
      count: c.count || 0, currency: c.currency || cart.currency,
    };
    renderCart();
  }

  function renderCart() {
    var n = cart.count || 0;
    cartCnt.textContent = n > 9 ? '9+' : n;
    cartCnt.classList.toggle('on', n > 0);

    if (!cart.items.length) {
      cartLines.innerHTML = '<div class="empty">Your cart is empty.<br>Ask me to find something for you.</div>';
      cartFoot.innerHTML = '';
      return;
    }

    cartLines.innerHTML = '';
    cart.items.forEach(function (it) {
      var row = document.createElement('div');
      row.className = 'line';
      row.innerHTML =
        '<div class="th">' + (it.imageUrl ? '<img src="' + esc(it.imageUrl) + '" alt=""/>' : '🛍') + '</div>' +
        '<div class="info"><b>' + esc(it.title) + '</b>' +
          (it.variant ? '<span>' + esc(it.variant) + '</span>' : '') + '</div>' +
        '<div class="stepper"><button data-a="-" aria-label="Decrease">−</button>' +
          '<span>' + it.qty + '</span>' +
          '<button data-a="+" aria-label="Increase">+</button></div>' +
        '<div class="lt">' + money(it.lineTotal) + '</div>';

      var btns = row.querySelectorAll('.stepper button');
      btns[0].disabled = cartBusy;
      btns[1].disabled = cartBusy;
      btns[0].onclick = function () { setQty(it, it.qty - 1); };
      btns[1].onclick = function () { setQty(it, it.qty + 1); };
      cartLines.appendChild(row);
    });

    cartFoot.innerHTML =
      '<div class="total"><span>Total</span><b>' + money(cart.total) + '</b></div>' +
      '<button class="cta" id="checkout">Checkout</button>';
    var co = cartFoot.querySelector('#checkout');
    co.disabled = cartBusy || busy;
    co.onclick = function () {
      closeSheets(); setFocus(null);
      submit('I\'d like to checkout');
    };
  }

  function sendCartOps(ops) {
    if (cartBusy) return Promise.resolve();
    cartBusy = true; renderCart();

    return fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/cart', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, ops: ops }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(setCart)
      .catch(function () { addMsg('bot', 'Couldn\'t update the cart just now — please try again.'); })
      .finally(function () { cartBusy = false; renderCart(); });
  }

  function addToCart(p, variant) {
    return sendCartOps([{ op: 'add', product_id: p.id, qty: 1, variant: variant || null }]);
  }
  function setQty(item, qty) {
    return qty <= 0
      ? sendCartOps([{ op: 'remove', product_id: item.productId, variant: item.variant || null }])
      : sendCartOps([{ op: 'set', product_id: item.productId, qty: qty, variant: item.variant || null }]);
  }
  function loadCart() {
    return fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/cart?sessionId=' + encodeURIComponent(sessionId))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(setCart)
      .catch(function () { /* the cart is a nicety — never block the chat on it */ });
  }

  // ── Focus mode ──────────────────────────────────────────────────────────────
  function setFocus(p) {
    focused = p;
    focusBar.classList.toggle('on', !!p);
    if (p) {
      focusImg.src = p.imageUrl || '';
      focusImg.style.display = p.imageUrl ? 'block' : 'none';
      focusTitle.textContent = p.title || '';
      inp.placeholder = 'Ask about this product…';
    } else {
      inp.placeholder = 'Type a message…';
    }
  }
  $('browseBtn').addEventListener('click', function () {
    setFocus(null);
    addMsg('bot', 'Sure — what would you like to browse?');
    showCategories();
  });

  // ── Product detail sheet ────────────────────────────────────────────────────
  function showDetail(p) {
    var chosen = null;
    var sale = p.salePrice != null && p.salePrice < p.price;
    var off  = sale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

    pdBody.innerHTML =
      (p.imageUrl ? '<img class="hero" src="' + esc(p.imageUrl) + '" alt="' + esc(p.title) + '"/>' : '') +
      '<div class="pdb">' +
        (p.category ? '<span class="cat">' + esc(p.category) + '</span>' : '') +
        '<h4>' + esc(p.title) + '</h4>' +
        '<div class="prow"><b>' + money(sale ? p.salePrice : p.price) + '</b>' +
          (sale ? '<s>' + money(p.price) + '</s><em>' + off + '% OFF</em>' : '') + '</div>' +
        (p.description ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
        (p.variants ? '<p class="vlabel">Options</p><div class="vrow" id="vrow"></div>' : '') +
      '</div>';

    if (p.variants) {
      var vrow = pdBody.querySelector('#vrow');
      p.variants.split(',').forEach(function (raw) {
        var v = raw.trim(); if (!v) return;
        var b = document.createElement('button');
        b.textContent = v;
        b.onclick = function () {
          chosen = chosen === v ? null : v;
          vrow.querySelectorAll('button').forEach(function (x) {
            x.classList.toggle('on', x.textContent === chosen);
          });
        };
        vrow.appendChild(b);
      });
    }

    pdFoot.innerHTML =
      '<button class="cta ghost" id="pdAdd">Add to cart</button>' +
      '<button class="cta" id="pdOrder">Order now</button>';

    var addBtn = pdFoot.querySelector('#pdAdd');
    addBtn.onclick = function () {
      addBtn.disabled = true; addBtn.textContent = 'Added ✓';
      addToCart(p, chosen).finally(function () {
        setTimeout(function () { addBtn.disabled = false; addBtn.textContent = 'Add to cart'; }, 1200);
      });
    };
    pdFoot.querySelector('#pdOrder').onclick = function () {
      closeDetail(); setFocus(p);
      submit('I want to order ' + p.title + (chosen ? ' in ' + chosen : ''));
    };

    pdBody.scrollTop = 0;
    openDetail();
  }

  // ── Messages ────────────────────────────────────────────────────────────────
  // Consecutive messages from the same sender are grouped: only the first shows an
  // avatar, the rest get a hidden spacer. Far less visual noise over a long chat.
  function addMsg(type, text) {
    var grouped = lastSender === type;
    lastSender = type;

    var row = document.createElement('div');
    row.className = 'row ' + type + (grouped ? ' tight' : '');

    if (type === 'bot') {
      var av = document.createElement('div');
      av.className = 'av' + (grouped ? ' ghost' : '');
      av.textContent = avatarLetter();
      row.appendChild(av);
    }

    var bub = document.createElement('div');
    bub.className = 'bub ' + type;
    bub.innerHTML = md(text);
    row.appendChild(bub);

    msgs.appendChild(row); scrollDown();
    return row;
  }

  function addTyping() {
    lastSender = null;
    var row = document.createElement('div');
    row.className = 'row bot';
    row.innerHTML =
      '<div class="av">' + esc(avatarLetter()) + '</div>' +
      '<div class="think"><span class="dots"><i></i><i></i><i></i></span><span class="txt"></span></div>';
    msgs.appendChild(row); scrollDown();
    return row;
  }

  // Swaps in the agent's current step, e.g. "Searching for gold earrings under INR 5,000…".
  // Reuses the same bubble so the row never jumps.
  function setThinking(row, text) {
    if (!row || !text) return;
    var t = row.querySelector('.txt');
    if (!t) return;
    t.textContent = text;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    scrollDown();
  }

  function showCategories() {
    var seen = {}, cats = [];
    allProducts.forEach(function (p) {
      if (p.category && !seen[p.category]) { seen[p.category] = 1; cats.push(p.category); }
    });
    if (!cats.length) return;

    var wrap = document.createElement('div');
    wrap.className = 'chips';
    cats.slice(0, 8).forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chip'; b.textContent = c;
      b.onclick = function () { submit(c); };
      wrap.appendChild(b);
    });
    msgs.appendChild(wrap); scrollDown();
  }

  // ── Product carousel ────────────────────────────────────────────────────────
  function renderCards(products) {
    var rail = document.createElement('div');
    rail.className = 'rail';

    products.forEach(function (p) {
      var sale = p.salePrice != null && p.salePrice < p.price;
      var off  = sale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<div class="ph">' +
          (p.imageUrl ? '<img src="' + esc(p.imageUrl) + '" alt="' + esc(p.title) + '"/>'
                      : '<span class="noimg">🛍</span>') +
          (off ? '<span class="off">' + off + '% OFF</span>' : '') +
        '</div>' +
        '<div class="body">' +
          '<div class="ttl">' + esc(p.title) + '</div>' +
          '<div class="pr"><b>' + money(sale ? p.salePrice : p.price) + '</b>' +
            (sale ? '<s>' + money(p.price) + '</s>' : '') + '</div>' +
        '</div>' +
        '<button class="add">Add</button>';

      var img = card.querySelector('img');
      if (img) img.onerror = function () { this.style.display = 'none'; };

      card.querySelector('.ph').onclick = function () { if (!dragged) showDetail(p); };
      card.querySelector('.body').onclick = function () { if (!dragged) showDetail(p); };

      var add = card.querySelector('.add');
      add.onclick = function (e) {
        e.stopPropagation();
        add.disabled = true; add.textContent = 'Added ✓';
        addToCart(p).finally(function () {
          setTimeout(function () { add.disabled = false; add.textContent = 'Add'; }, 1200);
        });
      };

      rail.appendChild(card);
    });

    // NOTE: there is deliberately no `wheel` handler here.
    //
    // The old widget mapped vertical wheel onto horizontal scroll and only released it
    // at the rail's extremes. That traps the page scroll: put the cursor over the
    // carousel and the conversation stops scrolling, which is what people actually hit.
    // Horizontal scrolling is covered without hijacking anything — Shift+wheel and
    // trackpad swipes are handled natively by the browser, touch is native, and mouse
    // users get drag-to-scroll plus the arrows below.

    // Drag to scroll. Pointer capture keeps the listeners on the rail itself — the old
    // version attached move/up handlers to window per carousel and never removed them.
    // Drag to scroll.
    //
    // Capture is deliberately NOT taken on pointerdown. While a pointer is captured the
    // browser retargets the subsequent `click` to the capturing element, so capturing up
    // front silently swallowed every click on a card — the Add button and the card body
    // both stopped responding. Capture is therefore only taken once the pointer has
    // actually moved past the drag threshold, which a plain click never does.
    var down = false, startX = 0, startLeft = 0, dragging = false, dragged = false, pid = null;

    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;          // native touch scrolling is better
      if (e.button !== 0) return;
      down = true; dragging = false; dragged = false; pid = e.pointerId;
      startX = e.clientX; startLeft = rail.scrollLeft;
    });

    rail.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== pid) return;
      var dx = e.clientX - startX;

      if (!dragging) {
        if (Math.abs(dx) <= 5) return;                // still a click, keep hands off
        dragging = dragged = true;
        rail.classList.add('drag');
        try { rail.setPointerCapture(pid); } catch (_) {}
      }
      rail.scrollLeft = startLeft - dx;
    });

    function endDrag(e) {
      if (!down || (e && e.pointerId !== pid)) return;
      down = false;
      if (dragging) {
        rail.classList.remove('drag');
        try { rail.releasePointerCapture(pid); } catch (_) {}
      }
      dragging = false; pid = null;
      // Cleared after the click that follows pointerup, so a drag never opens a card.
      setTimeout(function () { dragged = false; }, 0);
    }
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);

    // Arrow affordance for plain-mouse users, now that vertical wheel no longer pans
    // the rail. Hidden entirely when the cards already fit, and each arrow hides at its
    // own end so they never sit there doing nothing.
    var wrap = document.createElement('div');
    wrap.className = 'railwrap';

    var prev = document.createElement('button');
    prev.className = 'nav prev'; prev.innerHTML = ICON.prev;
    prev.setAttribute('aria-label', 'Scroll left');

    var next = document.createElement('button');
    next.className = 'nav next'; next.innerHTML = ICON.next;
    next.setAttribute('aria-label', 'Scroll right');

    function page(dir) {
      rail.scrollBy({ left: dir * Math.max(160, rail.clientWidth * 0.8), behavior: 'smooth' });
    }
    prev.onclick = function () { page(-1); };
    next.onclick = function () { page(1); };

    function updateNav() {
      var max = rail.scrollWidth - rail.clientWidth;
      if (max <= 4) { prev.classList.remove('on'); next.classList.remove('on'); return; }
      prev.classList.toggle('on', rail.scrollLeft > 2);
      next.classList.toggle('on', rail.scrollLeft < max - 2);
    }
    rail.addEventListener('scroll', updateNav);

    wrap.appendChild(rail); wrap.appendChild(prev); wrap.appendChild(next);
    msgs.appendChild(wrap);
    lastSender = null;

    updateNav();
    setTimeout(function () { updateNav(); scrollDown(); }, 40);
  }

  // ── Composer ────────────────────────────────────────────────────────────────
  var COMPOSER_MIN = 34, COMPOSER_MAX = 96;

  /**
   * Grows the composer to fit its content, up to a cap.
   *
   * Bails when scrollHeight is 0 — that means the panel is still display:none and there
   * is nothing to measure. Writing a height in that state pins the field at 0px and the
   * browser puts a native scrollbar on it, which is what the stacked arrows were.
   */
  function autoGrow() {
    inp.style.height = 'auto';
    var h = inp.scrollHeight;
    if (!h) { inp.style.height = ''; return; }
    inp.style.height = Math.max(COMPOSER_MIN, Math.min(h, COMPOSER_MAX)) + 'px';
    inp.style.overflowY = h > COMPOSER_MAX ? 'auto' : 'hidden';
  }
  inp.addEventListener('input', function () {
    autoGrow();
    send.disabled = !inp.value.trim() || busy;
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!send.disabled) doSend(); }
  });
  send.addEventListener('click', doSend);

  function doSend() {
    var text = inp.value.trim();
    if (!text || busy) return;
    inp.value = ''; autoGrow(); send.disabled = true;
    addMsg('user', text);
    callApi(text);
  }
  /** Sends `text` as if the buyer typed it. Used by chips, checkout and card actions. */
  function submit(text) {
    if (busy) return;
    addMsg('user', text);
    callApi(text);
  }

  // ── API ─────────────────────────────────────────────────────────────────────
  //
  // The server runs a tool-calling agent, so a turn can take a couple of seconds across
  // several steps. We ask for newline-delimited JSON so each step arrives as it happens
  // and can replace the typing indicator. Where ReadableStream/TextDecoder are missing,
  // the same endpoint returns a single JSON object and the non-streaming branch handles
  // it — this degrades, it does not break.
  function callApi(text) {
    busy = true;
    var typing = addTyping();
    var body = { sessionId: sessionId, message: text };
    if (focused) body.focusedProductId = focused.id;

    var canStream = typeof TextDecoder !== 'undefined' && typeof ReadableStream !== 'undefined';

    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': canStream ? 'application/x-ndjson' : 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        if (!r.ok) return Promise.reject();
        var streamed = canStream && r.body &&
          (r.headers.get('content-type') || '').indexOf('x-ndjson') !== -1;
        return streamed ? readStream(r, typing) : r.json();
      })
      .then(function (d) {
        remove(typing);
        if (d) applyTurn(d);
      })
      .catch(function () {
        remove(typing);
        addMsg('bot', 'Something went wrong. Please try again.');
      })
      .finally(function () {
        busy = false;
        send.disabled = !inp.value.trim();
        if (isOpen) inp.focus(); else { unread++; paintBadge(); }
      });
  }

  function readStream(response, typing) {
    var reader = response.body.getReader(), decoder = new TextDecoder();
    var buf = '', final = null;

    function line(s) {
      if (!s.trim()) return;
      var e; try { e = JSON.parse(s); } catch (_) { return; }
      if (e.type === 'thinking') setThinking(typing, e.text);
      else if (e.type === 'final') final = e.payload;
      else if (e.type === 'error') final = { reply: e.message };
    }

    return (function pump() {
      return reader.read().then(function (res) {
        if (res.done) { line(buf); return final; }
        buf += decoder.decode(res.value, { stream: true });
        var i;
        while ((i = buf.indexOf('\n')) !== -1) { line(buf.slice(0, i)); buf = buf.slice(i + 1); }
        return pump();
      });
    })();
  }

  /** Everything that happens once a turn's final payload is in hand. */
  function applyTurn(raw) {
    var d = camelKeys(raw);
    if (d.sessionId && d.sessionId !== sessionId) {
      sessionId = d.sessionId;
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    addMsg('bot', d.reply || 'I didn\'t catch that — could you rephrase?');
    if (d.cart) setCart(d.cart);

    if (d.isOrderReady && d.orderData) { handleOrder(d.orderData); return; }

    // Cards are whatever the agent actually looked up this turn, already capped and
    // suppressed server-side. There is deliberately NO client-side fallback — a second
    // guess here is what once made cards appear after literally every message.
    if (!focused && d.mentionedProducts && d.mentionedProducts.length) renderCards(d.mentionedProducts);
  }

  function remove(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

  // ── Orders ──────────────────────────────────────────────────────────────────
  function handleOrder(o) {
    setFocus(null); closeDetail(); closeSheets();
    setCart({ items: [], total: 0, count: 0, currency: o.currency || cart.currency });
    if (o.paymentMethod === 'online' && o.razorpay) openRazorpay(o);
    else renderReceipt(o, 'placed');
  }

  function loadRazorpay() {
    if (window.Razorpay || document.getElementById('rc-rzp-js')) return;
    var s = document.createElement('script');
    s.id = 'rc-rzp-js'; s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true;
    document.head.appendChild(s);
  }

  function openRazorpay(o) {
    loadRazorpay();
    (function go() {
      if (!window.Razorpay) return setTimeout(go, 250);
      new window.Razorpay({
        key: o.razorpay.keyId,
        order_id: o.razorpay.orderId,
        amount: o.razorpay.amount,
        currency: o.razorpay.currency || 'INR',
        name: clientName,
        description: 'Order ' + o.orderNumber,
        prefill: { name: o.customerName || '', contact: o.customerPhone || '' },
        theme: { color: PRIMARY },
        handler: function (resp) { verifyPayment(o, resp); },
        modal: { ondismiss: function () {
          addMsg('bot', 'No problem — order ' + o.orderNumber + ' is saved. You can pay anytime, or choose cash on delivery.');
          renderReceipt(o, 'pending');
        } },
      }).open();
    })();
  }

  function verifyPayment(o, resp) {
    var t = addTyping();
    setThinking(t, 'Confirming your payment…');
    fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/orders/' + o.id + '/verify-payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: resp.razorpay_order_id,
        razorpayPaymentId: resp.razorpay_payment_id,
        razorpaySignature: resp.razorpay_signature,
      }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function () {
        remove(t); addMsg('bot', 'Payment received — your order is confirmed.');
        renderReceipt(o, 'paid');
      })
      .catch(function () {
        remove(t);
        addMsg('bot', 'We couldn\'t verify that payment. If money was deducted it will be refunded. Order ' + o.orderNumber + ' is saved.');
        renderReceipt(o, 'pending');
      });
  }

  function renderReceipt(o, state) {
    var paid = state === 'paid';
    var items = (o.items || []).map(function (it) {
      return '<div class="ri">' +
        '<div class="th">' + (it.imageUrl ? '<img src="' + esc(it.imageUrl) + '" alt=""/>' : '🛍') + '</div>' +
        '<div class="m"><b>' + esc(it.title) + '</b><span>' +
          (it.variant ? esc(it.variant) + ' · ' : '') + 'Qty ' + it.qty + '</span></div>' +
        '<div class="amt">' + money(it.unitPrice * it.qty, o.currency) + '</div></div>';
    }).join('');

    var payLabel = o.paymentMethod === 'online'
      ? (paid ? 'Paid online' : 'Payment pending')
      : 'Cash on Delivery';

    var card = document.createElement('div');
    card.className = 'receipt';
    card.innerHTML =
      '<div class="rh ' + (paid ? 'ok' : 'wait') + '">' +
        '<div class="ic">' + ICON.check + '</div>' +
        '<div><b>' + (paid ? 'Payment successful' : 'Order placed') + '</b>' +
        '<span>Order ' + esc(o.orderNumber) + '</span></div></div>' +
      '<div class="rb">' + items +
        '<div class="rt"><span>' + payLabel + '</span><b>' + money(o.total, o.currency) + '</b></div>' +
      '</div>';

    if (o.paymentMethod === 'online' && o.razorpay && !paid) {
      var pay = document.createElement('button');
      pay.className = 'pay';
      pay.textContent = 'Pay ' + money(o.total, o.currency) + ' now';
      pay.onclick = function () { openRazorpay(o); };
      card.appendChild(pay);
    }

    var row = document.createElement('div');
    row.className = 'row bot';
    row.innerHTML = '<div class="av">' + esc(avatarLetter()) + '</div>';
    var hold = document.createElement('div');
    hold.style.cssText = 'flex:1;min-width:0;max-width:88%;';
    hold.appendChild(card);
    row.appendChild(hold);
    msgs.appendChild(row);
    lastSender = null;
    scrollDown();
  }

  // ── Open / close ────────────────────────────────────────────────────────────
  function paintBadge() {
    fabBadge.textContent = unread > 9 ? '9+' : unread;
    fabBadge.classList.toggle('on', unread > 0);
  }

  function doOpen() {
    isOpen = true; unread = 0; paintBadge();
    hideTeaser();
    panel.classList.add('on');
    fab.innerHTML = ICON.close + '<span class="presence"></span><span class="badge" id="fabBadge"></span>';
    fabBadge = root.getElementById('fabBadge');
    fab.setAttribute('aria-label', 'Close chat');
    autoGrow();                       // first measurable layout — see autoGrow()
    inp.focus();
    if (!greeted) { greeted = true; init(); }
  }
  function doClose() {
    isOpen = false;
    closeSheets(); closeDetail();
    panel.classList.remove('on');
    fab.innerHTML = ICON.chat + '<span class="presence"></span><span class="badge" id="fabBadge"></span>';
    fabBadge = root.getElementById('fabBadge');
    fab.setAttribute('aria-label', 'Open chat');
    paintBadge();
  }
  fab.addEventListener('click', function () { isOpen ? doClose() : doOpen(); });
  $('closeBtn').addEventListener('click', doClose);

  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen) return;
    if (anyOverlayOpen()) { closeSheets(); closeDetail(); }
    else doClose();
  });

  // ── Teaser ──────────────────────────────────────────────────────────────────
  function hideTeaser() { teaser.classList.remove('on'); }
  function showTeaser() {
    if (isOpen || sessionStorage.getItem(TEASER_KEY) === '1') return;
    teaser.classList.add('on');
  }
  teaser.addEventListener('click', function () { hideTeaser(); doOpen(); });
  $('teaserX').addEventListener('click', function (e) {
    e.stopPropagation(); hideTeaser(); sessionStorage.setItem(TEASER_KEY, '1');
  });

  // ── Config ──────────────────────────────────────────────────────────────────
  function loadConfig() {
    return fetch(API_BASE + '/api/v1/chatbot/' + API_KEY + '/config')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function (e) { console.error('[Silarai] config error', e); return {}; })
      .then(function (raw) {
        var c = camelKeys(raw);
        allProducts = Array.isArray(c.products) ? c.products : [];
        if (c.payment) payCfg = c.payment;
        if (c.currency) cart.currency = c.currency;
        welcomeMsg = c.welcomeMessage || ('Hi! Welcome to ' + (c.name || 'our store') + '. What are you looking for today?');

        if (c.name) {
          clientName = c.name;
          var ltr = c.name.charAt(0).toUpperCase();
          hname.textContent = c.name;
          hini.textContent = ltr; tini.textContent = ltr;
          tname.textContent = 'Chat with ' + c.name;
        }
        if (c.logoUrl) {
          var im = '<img src="' + esc(c.logoUrl) + '" alt=""/>';
          hav.innerHTML = im; tav.innerHTML = im;
        }
        if (payCfg.onlineEnabled) loadRazorpay();
      });
  }
  function ensureConfig() { if (!configPromise) configPromise = loadConfig(); return configPromise; }

  function init() {
    ensureConfig().then(function () {
      addMsg('bot', welcomeMsg);
      if (allProducts.length) showCategories();
    });
  }

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  renderCart();                  // paints the empty state + zeroes the header badge
  ensureConfig();                // prefetch branding + products
  loadCart();                    // rehydrate this session's server cart
  setTimeout(showTeaser, 3500);

})();
