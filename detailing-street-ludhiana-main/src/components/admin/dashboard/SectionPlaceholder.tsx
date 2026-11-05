import type { IconName } from './Icon';
import { Icon } from './Icon';

export function SectionPlaceholder({
  title,
  icon,
  description,
}: {
  title: string;
  icon: IconName;
  description: string;
}) {
  return (
    <section aria-labelledby="section-placeholder-title" className="section-placeholder">
      <span className="section-placeholder-icon">
        <Icon name={icon} />
      </span>
      <span className="section-placeholder-eyebrow">WORKSPACE</span>
      <h1 id="section-placeholder-title">{title}</h1>
      <p>{description}</p>
      <span className="section-placeholder-status">This section is not configured yet.</span>
    </section>
  );
}
