import { useProductCtl } from '../../../../core/commerce/useProductController';
import type { BlockInstance, RenderContext } from '../../../../core/types';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { isContentBlock } from '../../../../ui/product/blockTypes';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps, ProductMainSettings } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';

/**
 * Magazine-style: a hero image with the product name, the buying details, then
 * a story that alternates the remaining photos with the description's paragraphs.
 */
export default function EditorialStory({ settings, blocks, context }: ProductMainProps) {
  return (
    <ProductMainFrame settings={settings} context={context} contained={false}>
      <Story settings={settings} blocks={blocks} context={context} />
    </ProductMainFrame>
  );
}

function Story({ settings, blocks, context }: { settings: ProductMainSettings; blocks: BlockInstance[]; context: RenderContext }) {
  const ctl = useProductCtl();
  const [hero, ...rest] = ctl.images;
  const paragraphs = (ctl.product.description ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const storyUsesDescription = rest.length > 0 && paragraphs.length > 0;
  const buying = blocks.filter(b => !isContentBlock(b) && b.type !== 'title');
  const content = blocks.filter(b => isContentBlock(b) && !(storyUsesDescription && b.type === 'description'));
  const rows = rest.slice(0, 6).map((src, i) => ({ src, text: paragraphs[i] }));

  return (
    <>
      <div className="relative min-h-[420px] overflow-hidden @3xl:min-h-[560px]">
        {hero ? (
          <img src={optimizeImage(hero, 1800)} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        ) : (
          <div className="sf-placeholder absolute inset-0" aria-hidden />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 60%)' }} aria-hidden />
        <div className="sf-container relative flex min-h-[420px] items-end pb-10 @3xl:min-h-[560px]">
          <div className="text-white">
            {ctl.product.categoryName && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] opacity-85">{ctl.product.categoryName}</p>}
            <h1 className="sf-h1 max-w-3xl">{ctl.product.title}</h1>
          </div>
        </div>
      </div>

      <div className="sf-container sf-section-pad">
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1fr] @3xl:gap-16">
          <div className="hidden @3xl:block"><ProductGallery mode="grid-2x2" ratio={settings.imageRatio} zoom={settings.zoom} badge={false} /></div>
          <ProductInfo blocks={buying} context={context} />
        </div>

        {rows.length > 0 && (
          <div className="mt-16 space-y-14 @3xl:mt-24 @3xl:space-y-24">
            {rows.map((row, i) => (
              <div key={row.src + i} className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-16">
                <div className={`sf-img aspect-[4/5] overflow-hidden ${i % 2 ? '@3xl:order-2' : ''}`}>
                  <img src={optimizeImage(row.src, 1200)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
                {row.text ? <p className="whitespace-pre-line text-lg leading-relaxed @3xl:text-xl">{row.text}</p> : <span aria-hidden />}
              </div>
            ))}
          </div>
        )}

        {content.length > 0 && <ProductInfo blocks={content} context={context} mode={settings.infoStyle} className="mx-auto mt-16 max-w-3xl" />}
      </div>
    </>
  );
}
