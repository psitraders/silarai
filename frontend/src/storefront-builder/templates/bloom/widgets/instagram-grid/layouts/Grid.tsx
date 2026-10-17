import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { blocksOf } from '../../../../../core/blocks';
import { useResolvedProducts } from '../../../../../core/data/hooks';
import { readImage } from '../../../../../core/smart';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps, RenderContext } from '../../../../../core/types';
import { InstagramIcon } from '../../../../../ui/brand-icons';
import { EditorHint } from '../../../../../ui/EditorHint';
import { Overlay } from '../../../../../ui/Overlay';
import { ProductCard } from '../../../../../ui/ProductCard';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { POST_DEFAULTS, type InstagramGridSettings, type PostBlock } from '../manifest';

/** Square posts; tapping one opens it with the product it shows. */
export default function Grid({ settings, blocks, context }: LayoutProps<InstagramGridSettings>) {
  const { store } = useStorefront();
  const posts = blocksOf(blocks, 'post', POST_DEFAULTS).filter(p => readImage(p.settings.image));
  const [open, setOpen] = useState<number | null>(null);
  if (!posts.length) return <EditorHint context={context} text="Upload posts and link each one to the product in it." />;
  const handle = store.instagramHandle?.replace(/^@/, '').trim();
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading
        eyebrow={settings.eyebrow}
        title={settings.heading}
        action={settings.showHandle && handle ? (
          <a href={`https://instagram.com/${encodeURIComponent(handle)}`} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-secondary sf-btn-sm">
            <InstagramIcon className="h-4 w-4" /> Follow @{handle}
          </a>
        ) : undefined}
      />
      <ul className="grid grid-cols-3 gap-1 @3xl:gap-2">
        {posts.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => setOpen(i)} className="relative block w-full" aria-label={p.settings.caption ? `Open post: ${p.settings.caption}` : `Open post ${i + 1}`}>
              <SmartImage value={p.settings.image} alt="" rounded={false} className="aspect-square" sizes="(min-width: 1024px) 30vw, 33vw" maxWidth={800} />
              {(p.settings.product?.$products?.productIds?.length ?? 0) > 0 && (
                <span aria-hidden className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full shadow" style={{ background: 'var(--sf-surface)', color: 'var(--sf-text)' }}>
                  <ShoppingBag className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <PostDialog post={posts[open].settings} onClose={() => setOpen(null)} context={context} />}
    </div>
  );
}

function PostDialog({ post, onClose, context }: { post: PostBlock; onClose: () => void; context: RenderContext }) {
  const { items } = useResolvedProducts((post.product?.$products?.productIds?.length ?? 0) > 0 ? post.product : undefined);
  return (
    <Overlay onClose={onClose} label={post.caption || 'Post'} size="lg">
      <div className="grid gap-4 p-4 pt-12 sm:grid-cols-2 sm:p-6 sm:pt-12">
        <SmartImage value={post.image} alt={post.caption} eager className="aspect-square" sizes="(min-width: 640px) 40vw, 90vw" />
        <div className="flex flex-col gap-3">
          {post.caption && <p className="text-sm leading-relaxed">{post.caption}</p>}
          {items[0] && <div className="max-w-xs"><ProductCard product={items[0]} index={-1} context={context} /></div>}
        </div>
      </div>
    </Overlay>
  );
}
