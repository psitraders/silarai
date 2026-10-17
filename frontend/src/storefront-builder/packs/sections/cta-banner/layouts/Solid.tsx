import type { LayoutProps } from '../../../../core/types';
import { Content } from '../Content';
import type { CtaBannerSettings } from '../manifest';

export default function Solid({ settings, context }: LayoutProps<CtaBannerSettings>) {
  return (
    <div className="sf-textured">
      <div className="sf-container sf-section-pad"><Content settings={settings} context={context} /></div>
    </div>
  );
}
