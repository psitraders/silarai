import { blocksOf } from '../../../../core/blocks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { SmartImage } from '../../../../ui/SmartImage';
import { MEMBER_DEFAULTS, type TeamSettings } from '../manifest';

/** Photo cards with name, role and a short bio. */
export default function Cards({ settings, blocks, context }: LayoutProps<TeamSettings>) {
  const people = blocksOf(blocks, 'member', MEMBER_DEFAULTS);
  if (!people.length) return <EditorHint context={context} text="Add team members to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <ul className="sf-gap grid grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
        {people.map(({ id, settings: p }) => (
          <li key={id} className="text-center">
            <SmartImage value={p.photo} alt={p.name} className="mx-auto mb-4 aspect-square w-full max-w-60" sizes="(min-width: 768px) 25vw, 50vw" maxWidth={800} />
            <h3 className="font-bold">{p.name}</h3>
            {p.role && <p className="sf-eyebrow mt-1 text-[11px]">{p.role}</p>}
            {p.bio && <p className="mt-2 text-sm sf-muted">{p.bio}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
