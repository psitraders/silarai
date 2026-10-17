import { useCallback, useEffect, useState, type FormEvent, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../../../core/storefront-context';

/** Open / closed state shared by a header layout's parts. */
export function useHeaderState() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  return { mobileOpen, setMobileOpen, searchOpen, setSearchOpen };
}
export type HeaderState = ReturnType<typeof useHeaderState>;

/** Search → all-products page with ?q= (same URL the catalogue section reads). */
export function useSearchSubmit(onDone?: () => void) {
  const { links } = useStorefront();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const submit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `${links.allProducts()}?q=${encodeURIComponent(q)}` : links.allProducts());
    onDone?.();
  }, [term, links, navigate, onDone]);
  return { term, setTerm, submit };
}

/** True once the page (or the editor preview frame) has scrolled past `offset`. */
export function useScrolled(ref: RefObject<HTMLElement | null>, offset = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const win = ref.current?.ownerDocument.defaultView;
    if (!win) return;
    const update = () => setScrolled(win.scrollY > offset);
    update();
    win.addEventListener('scroll', update, { passive: true });
    return () => win.removeEventListener('scroll', update);
  }, [ref, offset]);
  return scrolled;
}
