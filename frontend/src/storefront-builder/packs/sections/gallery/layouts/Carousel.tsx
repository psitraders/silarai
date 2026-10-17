import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Scroller } from '../../../../ui/Scroller';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { GallerySettings } from '../manifest';
import { useImages } from '../images';
import { Tile } from '../Tile';

export default function Carousel({ settings, blocks, context }: LayoutProps<GallerySettings>) {
  const images = useImages(blocks);
  if (!images.length) return <EditorHint context={context} text="Add images to this gallery." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <Scroller label={settings.heading || 'Gallery'} itemClassName="w-[75%] @2xl:w-[40%] @5xl:w-[30%]" items={images.map(({ settings: img }) => <Tile img={img} className="aspect-[4/5]" />)} />
    </div>
  );
}
