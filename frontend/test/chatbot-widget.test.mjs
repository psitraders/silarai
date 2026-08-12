/**
 * Smoke test for public/chatbot-widget.js.
 *
 * The widget is plain vanilla JS loaded directly by third-party sites, so it is not
 * covered by the app's build or type-checking. This renders it in jsdom against a mocked
 * API and asserts the things that actually broke in production: shadow-root isolation,
 * NDJSON streaming, and product cards showing real values rather than `undefined`.
 *
 *   npm install --no-save jsdom && node test/chatbot-widget.test.mjs
 */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(here, '..', 'public', 'chatbot-widget.js'), 'utf8');

const PRODUCTS = [
  { id: 'a1', title: 'Gold Jhumka Earrings', description: 'Temple jhumkas', price: 899, salePrice: 749, variants: 'S, M', imageUrl: 'https://cdn/1.jpg', category: 'Earrings' },
  { id: 'b2', title: 'Pearl Drop Earrings',  description: 'Freshwater pearls', price: 1299, salePrice: null, variants: null, imageUrl: null, category: 'Earrings' },
];

function ndjson(lines) {
  const enc = new TextEncoder();
  let i = 0;
  // Real latency between events, so the mid-stream state is observable.
  return { getReader: () => ({ read: async () => {
    await new Promise(r => setTimeout(r, 40));
    return i < lines.length
      ? { done: false, value: enc.encode(JSON.stringify(lines[i++]) + '\n') }
      : { done: true };
  } }) };
}

const calls = [];
async function fakeFetch(url, opts = {}) {
  let body = null;
  if (typeof opts.body === 'string') { try { body = JSON.parse(opts.body); } catch (_) { /* not JSON */ } }
  calls.push({ url, accept: (opts.headers || {}).Accept, body });
  const ok = (body) => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => body });

  if (url.includes('/config')) return ok({ name: 'Test Jewels', currency: 'INR', welcomeMessage: 'Welcome!', products: PRODUCTS, payment: { codEnabled: true, onlineEnabled: false } });
  if (url.includes('/cart?')) return ok({ items: [], total: 0, count: 0, currency: 'INR' });
  if (url.includes('/cart'))  return ok({ items: [{ productId: 'a1', title: 'Gold Jhumka Earrings', qty: 1, unitPrice: 749, lineTotal: 749, variant: 'M', imageUrl: 'https://cdn/1.jpg' }], total: 749, count: 1, currency: 'INR' });

  if (url.includes('/message')) return {
    ok: true,
    headers: { get: () => 'application/x-ndjson' },
    body: ndjson([
      { type: 'thinking', text: 'Searching for gold earrings under INR 5,000…' },
      { type: 'final', payload: { sessionId: 's_x', reply: 'I found two options for you.', mentionedProducts: PRODUCTS, cart: { items: [], total: 0, count: 0, currency: 'INR' } } },
    ]),
  };
  return ok({});
}

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://shop.example.com/' });
const w = dom.window;
w.RCChatbotConfig = { apiKey: 'k1', apiBase: 'https://api.test' };
w.fetch = fakeFetch;
w.TextDecoder = TextDecoder;
w.ReadableStream = ReadableStream;
w.Element.prototype.setPointerCapture = function () {};
w.Element.prototype.releasePointerCapture = function () {};
w.HTMLElement.prototype.scrollTo = function () {};

try { w.eval(code); } catch (e) { console.log('WIDGET THREW:', e.name, e.message); console.log(e.stack); process.exit(1); }

const tick = (n = 30) => new Promise(r => setTimeout(r, n));
const host = w.document.body.querySelector('div');
const root = host.shadowRoot;
const $ = (s) => root.querySelector(s);
const T = (s) => { const e = $(s); return e ? e.textContent.trim() : '(missing)'; };

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra && !cond ? ' -> ' + extra : ''}`);
};

check('shadow root attached (host page CSS cannot reach in)', !!root);
check('nothing leaked into document', w.document.body.children.length === 1 && w.document.head.querySelectorAll('style').length === 0);

await tick(60);
check('config applied to header', T('#hname') === 'Test Jewels', T('#hname'));

$('#fab').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await tick(60);
check('panel opens', $('#panel').classList.contains('on'));
check('welcome message rendered', root.querySelector('.bub.bot')?.textContent.includes('Welcome!'));
check('category chips rendered', root.querySelectorAll('.chip').length === 1, root.querySelectorAll('.chip').length + ' chips');

const inp = $('#inp');
inp.value = 'do you have gold earrings';
inp.dispatchEvent(new w.Event('input', { bubbles: true }));
check('send enabled on input', !$('#send').disabled);

$('#send').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await tick(60);
check('NDJSON requested', calls.some(c => c.url.includes('/message') && c.accept === 'application/x-ndjson'));
check('thinking line streamed', T('.think .txt').startsWith('Searching for gold earrings'), T('.think .txt'));

await tick(200);
check('typing indicator removed', !$('.think'));
const bubs = [...root.querySelectorAll('.bub.bot')].map(b => b.textContent.trim());
check('reply rendered', bubs.some(b => b.includes('I found two options')), JSON.stringify(bubs));

const cards = [...root.querySelectorAll('.card')];
check('carousel rendered', cards.length === 2, cards.length + ' cards');
check('card title not undefined', cards[0]?.querySelector('.ttl')?.textContent === 'Gold Jhumka Earrings', cards[0]?.querySelector('.ttl')?.textContent);
check('card price uses sale price', cards[0]?.querySelector('.pr b')?.textContent === '₹749', cards[0]?.querySelector('.pr b')?.textContent);
check('card strikethrough shows original', cards[0]?.querySelector('.pr s')?.textContent === '₹899', cards[0]?.querySelector('.pr s')?.textContent);
check('discount badge computed', cards[0]?.querySelector('.off')?.textContent === '17% OFF', cards[0]?.querySelector('.off')?.textContent);
check('no-sale card has no strikethrough', !cards[1]?.querySelector('.pr s'));
check('no-image card shows placeholder', !!cards[1]?.querySelector('.noimg'));
check('no "undefined" anywhere in rendered DOM', !root.innerHTML.includes('undefined'), 'found "undefined"');
check('no "null" leaked into text', !cards.some(c => c.textContent.includes('null')));

// ── Layout regressions ──────────────────────────────────────────────────────
// jsdom has no layout engine, so these assert the CSS *rules* rather than geometry.
// Both guard bugs that shipped: the rail collapsing to its scrollbar, and the composer
// being pinned to 0px height (which surfaced as a native scrollbar on the textarea).
const css = root.querySelector('style').textContent;
check('rail opts out of flex shrinking', /\.rail\{[^}]*flex:0 0 auto/s.test(css) || /\.msgs > \*\{[^}]*flex:0 0 auto/s.test(css),
  'a scroll container in a column flex parent has an automatic minimum size of 0');
check('every .msgs child opts out of shrinking', /\.msgs > \*\s*\{\s*flex:0 0 auto/.test(css));
check('card image well has an explicit height', /\.card \.ph\{[^}]*height:150px/s.test(css),
  'aspect-ratio alone leaves older WebViews at zero height');
check('composer hides its native scrollbar by default', /\.composer textarea\{[^}]*overflow-y:hidden/s.test(css));
check('composer not pinned to 0px when unmeasurable', inp.style.height === '',
  'got height=' + JSON.stringify(inp.style.height));

// The Add button on a card must reach the server for a product with no variants.
// This regressed once: the carousel took pointer capture on pointerdown, which
// retargets the following click to the rail, so no card button ever fired.
{
  const before = calls.length;
  check('variant-less card Add button reads "Add"', cards[1].querySelector('.add').textContent === 'Add');
  cards[1].querySelector('.add').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(60);
  const posted = calls.slice(before).find(c => c.url.includes('/cart') && !c.url.includes('?'));
  check('Add on a variant-less card posts to the cart endpoint', !!posted);
  check('Add on a variant-less card updates the badge', T('#cartCnt') === '1', T('#cartCnt'));
}

// A card with variants (size/color/etc.) must never add on a single tap — the server
// has no way to ask which one was meant, so the tap opens the detail sheet instead,
// where Add to cart stays disabled until a variant is chosen.
{
  const before = calls.length;
  check('variant card Add button reads "Select"', cards[0].querySelector('.add').textContent === 'Select', cards[0].querySelector('.add').textContent);

  cards[0].querySelector('.add').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
  const postedOnTap = calls.slice(before).find(c => c.url.includes('/cart') && !c.url.includes('?'));
  check('Add on a variant card does not add directly', !postedOnTap);
  check('Add on a variant card opens the detail sheet instead', $('#detail').classList.contains('on'));
  check('pdAdd starts disabled until a variant is chosen', $('#pdAdd').disabled);

  $('#pdAdd').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
  const postedWhileDisabled = calls.slice(before).find(c => c.url.includes('/cart') && !c.url.includes('?'));
  check('clicking Add to cart with no variant chosen does not add', !postedWhileDisabled);

  root.querySelectorAll('#vrow button')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  check('choosing a variant enables Add to cart', !$('#pdAdd').disabled);

  $('#pdBack').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  check('detail closes so later tests start clean', !$('#detail').classList.contains('on'));
}

// Order now was previously exempt from the variant gate — it doesn't write the cart
// directly, it just sends a chat message ("I want to order X"), so a customer could
// reach checkout without ever specifying which variant. Even after gating it, the
// message alone left the model free to narrate an add ("I've added X to your cart —
// proceed to checkout?") without ever calling update_cart, so the real cart stayed
// empty. Order now must both be gated identically to Add to cart AND write the cart
// itself before handing off to chat, so there is nothing left for the model to get
// wrong.
{
  const before = calls.length;
  cards[0].querySelector('.body').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
  check('pdOrder also starts disabled until a variant is chosen', $('#pdOrder').disabled);

  $('#pdOrder').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
  const sentWhileDisabled = calls.slice(before).find(c => c.url.includes('/cart') && !c.url.includes('?'));
  check('clicking Order now with no variant chosen writes no cart line', !sentWhileDisabled);
  check('detail stays open when Order now is blocked', $('#detail').classList.contains('on'));

  root.querySelectorAll('#vrow button')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  check('choosing a variant enables Order now too', !$('#pdOrder').disabled);

  $('#pdOrder').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(60);
  const cartPost = calls.slice(before).find(c => c.url.includes('/cart') && !c.url.includes('?'));
  const msgPost  = calls.slice(before).find(c => c.url.includes('/message'));
  check('Order now writes the cart directly, like Add to cart does', !!cartPost);
  check('the cart write carries the chosen variant', cartPost?.body?.ops?.[0]?.variant === 'S',
    JSON.stringify(cartPost?.body));
  check('Order now hands off to chat with a generic checkout message, not a product-named one',
    msgPost?.body?.message === 'I\'d like to checkout', msgPost?.body?.message);
  check('the cart write happens before the chat turn, not after',
    calls.indexOf(cartPost) < calls.indexOf(msgPost));
  check('cart badge reflects the direct write before the chat turn started',
    T('#cartCnt') === '1', T('#cartCnt'));
  check('detail closes on Order now', !$('#detail').classList.contains('on'));

  // Order now enters focused (single-product) mode via setFocus(p). Reset it the same
  // way the widget itself does (Browse all products), so a later block that expects a
  // rendered carousel is not silently starved of cards by leftover focus state.
  $('#browseBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
}

// Vertical wheel over the carousel must fall through to the message list. The old
// widget mapped it onto horizontal scroll, which froze the conversation whenever the
// cursor happened to sit over a card.
{
  const rail = root.querySelector('.rail');
  // jsdom gives every element zero geometry, so fake a genuinely overflowing rail —
  // otherwise the old hijack would bail early and the assertion would pass vacuously.
  Object.defineProperty(rail, 'scrollWidth', { value: 900, configurable: true });
  Object.defineProperty(rail, 'clientWidth', { value: 300, configurable: true });
  rail.scrollLeft = 120;

  const ev = new w.WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true });
  rail.dispatchEvent(ev);
  check('vertical wheel over an overflowing rail is not hijacked', !ev.defaultPrevented);
  check('vertical wheel does not pan the rail', rail.scrollLeft === 120, 'scrollLeft=' + rail.scrollLeft);

  check('carousel is wrapped for arrow affordances', !!root.querySelector('.railwrap'));
  check('both scroll arrows exist', root.querySelectorAll('.railwrap .nav').length === 2);

  rail.dispatchEvent(new w.Event('scroll'));
  check('arrows appear once the rail overflows', root.querySelectorAll('.railwrap .nav.on').length === 2);
  rail.scrollLeft = 0; rail.dispatchEvent(new w.Event('scroll'));
  check('left arrow hides at the start', !root.querySelector('.railwrap .nav.prev').classList.contains('on'));
  rail.scrollLeft = 600; rail.dispatchEvent(new w.Event('scroll'));
  check('right arrow hides at the end', !root.querySelector('.railwrap .nav.next').classList.contains('on'));
  rail.scrollLeft = 0;
}

// A real drag must NOT open the detail view; a plain click must.
{
  const rail = root.querySelector('.rail');
  rail.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, clientX: 200, button: 0, pointerId: 1, pointerType: 'mouse' }));
  rail.dispatchEvent(new w.PointerEvent('pointermove', { bubbles: true, clientX: 120, pointerId: 1 }));
  rail.dispatchEvent(new w.PointerEvent('pointerup',   { bubbles: true, clientX: 120, pointerId: 1 }));
  cards[0].querySelector('.body').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  check('a drag does not open the detail view', !$('#detail').classList.contains('on'));
  await tick(20);
}

cards[0].querySelector('.body').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await tick(30);
check('detail opens in-panel on card tap', $('#detail').classList.contains('on'));
check('detail is a full panel, not a sheet', !!$('#detail') && !root.querySelector('#pdSheet'));
check('detail shows title', $('#detail h4')?.textContent === 'Gold Jhumka Earrings', $('#detail h4')?.textContent);
check('detail shows variant chips', root.querySelectorAll('#vrow button').length === 2);

// Add to cart is gated on a variant being chosen — pick one before this can add.
root.querySelectorAll('#vrow button')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
$('#pdAdd').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await tick(60);
check('cart badge updates after add', T('#cartCnt') === '1' && $('#cartCnt').classList.contains('on'), T('#cartCnt'));
check('back button closes the detail view', (() => { $('#pdBack').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return !$('#detail').classList.contains('on'); })());

$('#cartBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await tick(30);
check('cart sheet opens', $('#cartSheet').classList.contains('on'));
check('cart line renders title', root.querySelector('.line .info b')?.textContent === 'Gold Jhumka Earrings');
check('cart total renders', root.querySelector('.total b')?.textContent === '₹749', root.querySelector('.total b')?.textContent);

root.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await tick(20);
check('Escape closes overlay first', !$('#cartSheet').classList.contains('on') && $('#panel').classList.contains('on'));
root.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await tick(20);
check('Escape then closes panel', !$('#panel').classList.contains('on'));

// ── Version-skew guard ──────────────────────────────────────────────────────
// A new widget talking to an older API that still serialises PascalCase. The data is
// all there; only the casing differs. This must render normally, not as blank ₹0 cards.
{
  const pascal = {
    SessionId: 's_p', Reply: 'Legacy shape.',
    MentionedProducts: [{ Id: 'p1', Title: 'Antique Leaf Anklets', Price: 1219, SalePrice: null, ImageUrl: 'https://cdn/9.jpg', Category: 'Anklets', Variants: null }],
    Cart: { Items: [{ ProductId: 'p1', Title: 'Antique Leaf Anklets', Qty: 2, UnitPrice: 1219, LineTotal: 2438, Variant: null, ImageUrl: null }], Total: 2438, Count: 2, Currency: 'INR' },
  };
  const before = root.querySelectorAll('.card').length;
  const warns = [];
  const realWarn = console.warn; console.warn = (...a) => warns.push(a.join(' '));
  w.eval('void 0');
  // reach applyTurn the same way the network path does
  $('#fab').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(20);
  calls.length = 0;
  const origFetch = w.fetch;
  w.fetch = async (url) => url.includes('/message')
    ? { ok: true, headers: { get: () => 'application/json' }, json: async () => pascal }
    : origFetch(url);
  inp.value = 'anklets'; inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  $('#send').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await tick(120);
  console.warn = realWarn;
  w.fetch = origFetch;

  const cs = [...root.querySelectorAll('.card')];
  const last = cs[cs.length - 1];
  check('PascalCase payload still renders a card', cs.length > before);
  check('PascalCase title recovered', last?.querySelector('.ttl')?.textContent === 'Antique Leaf Anklets', last?.querySelector('.ttl')?.textContent);
  check('PascalCase price recovered (not ₹0)', last?.querySelector('.pr b')?.textContent === '₹1,219', last?.querySelector('.pr b')?.textContent);
  check('PascalCase cart count recovered', T('#cartCnt') === '2', T('#cartCnt'));
  check('warns once about the stale backend', warns.some(x => x.includes('older than this widget')));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
