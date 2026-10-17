import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { GallerySettings } from '../manifest';
import { useImages } from '../images';
import { Tile } from '../Tile';

const COLUMNS = { '2': '@3xl:columns-2', '3': '@3xl:columns-3', '4': '@3xl:columns-4' } as const;
// Varying ratios give the masonry rhythm even before real photos are uploaded.
const RATIOS = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-[2/3]'];

export default function Masonry({ settings, blocks, context }: LayoutProps<GallerySettings>) {
  const images = useImages(blocks);
  if (!images.length) return <EditorHint context={context} text="Add images to this gallery." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <ul className={`columns-2 gap-3 @3xl:gap-4 ${COLUMNS[settings.columns] ?? COLUMNS['3']}`}>
        {images.map(({ id, settings: img }, i) => (
          <li key={id} className="mb-3 break-inside-avoid @3xl:mb-4"><Tile img={img} className={RATIOS[i % RATIOS.length]} /></li>
        ))}
      </ul>
    </div>
  );
}
