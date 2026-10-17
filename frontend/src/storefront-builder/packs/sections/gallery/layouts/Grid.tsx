import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { GallerySettings } from '../manifest';
import { COLS, useImages } from '../images';
import { Tile } from '../Tile';

export default function Grid({ settings, blocks, context }: LayoutProps<GallerySettings>) {
  const images = useImages(blocks);
  if (!images.length) return <EditorHint context={context} text="Add images to this gallery." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <ul className={`sf-gap grid grid-cols-2 ${COLS[settings.columns] ?? COLS['3']}`}>
        {images.map(({ id, settings: img }) => <li key={id}><Tile img={img} className="aspect-square" /></li>)}
      </ul>
    </div>
  );
}
