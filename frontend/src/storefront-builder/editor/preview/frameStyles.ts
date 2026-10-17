/** Editor chrome inside the preview frame: hover / selection outlines and the section toolbar. */
export const FRAME_CSS = `
html { scroll-padding-top: 80px; }
body { margin: 0; }
[data-sb-editable] { position: relative; }
[data-sb-editable] > .sb-outline {
  position: absolute; inset: 0; pointer-events: none; z-index: 35;
  outline: calc(2px * var(--sb-inv, 1)) solid transparent; outline-offset: calc(-2px * var(--sb-inv, 1)); transition: outline-color 120ms ease-out;
}
[data-sb-editable]:hover > .sb-outline { outline-color: color-mix(in srgb, var(--rc-primary, #0d9488) 55%, transparent); }
[data-sb-editable][data-sb-selected] > .sb-outline { outline-color: var(--rc-primary, #0d9488); }
[data-sb-editable] > .sb-label {
  position: absolute; left: 8px; top: 8px; z-index: 36; pointer-events: none; opacity: 0;
  font: 600 11px/1 Inter, system-ui, sans-serif; letter-spacing: .02em;
  background: var(--rc-primary, #0d9488); color: #fff; padding: 5px 8px; border-radius: 6px;
  transition: opacity 120ms ease-out;
  transform: scale(var(--sb-inv, 1)); transform-origin: top left;
}
[data-sb-editable]:hover > .sb-label, [data-sb-editable][data-sb-selected] > .sb-label { opacity: 1; }
[data-sb-editable][data-sb-hidden] > :not(.sb-outline):not(.sb-label):not(.sb-toolbar) { opacity: .35; filter: grayscale(.6); }
.sb-toolbar {
  position: absolute; right: 8px; top: 8px; z-index: 37; display: flex; gap: 2px; padding: 3px;
  background: #fff; color: #0f172a; border-radius: 10px; box-shadow: 0 6px 20px rgb(15 23 42 / .18), 0 0 0 1px rgb(15 23 42 / .06);
  font: 500 12px/1 Inter, system-ui, sans-serif;
  transform: scale(var(--sb-inv, 1)); transform-origin: top right;
}
.sb-toolbar button {
  display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 0; border-radius: 7px;
  background: transparent; color: inherit; cursor: pointer;
}
.sb-toolbar button:hover { background: #f1f5f9; }
.sb-toolbar button:disabled { opacity: .35; cursor: default; background: transparent; }
.sb-toolbar button.sb-danger:hover { background: #fef2f2; color: #dc2626; }
.sb-toolbar button:focus-visible { outline: 2px solid var(--rc-primary, #0d9488); outline-offset: 1px; }
.sb-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 96px 16px; text-align: center; font-family: Inter, system-ui, sans-serif; color: #475569; }
.sb-empty button { font: 600 14px/1 Inter, system-ui, sans-serif; color: #fff; background: var(--rc-primary, #0d9488); border: 0; border-radius: 12px; padding: 12px 18px; cursor: pointer; }
`;
