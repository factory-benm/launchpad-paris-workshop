import {
  ArrowUpRight,
  Box,
  FileText,
  Layers,
  Radio,
  SquareTerminal,
} from "lucide-react";
import type { Service, Snapshot } from "./domain/catalog";
import { presentStatus } from "./domain/status";

export function ServiceIcon({ type }: { type: Service["type"] }) {
  const icons = {
    api: Radio,
    worker: SquareTerminal,
    library: Layers,
    website: FileText,
  };
  const Icon = icons[type] ?? Box;
  return <Icon size={19} strokeWidth={1.5} aria-hidden="true" />;
}

export function CiBadge({ snapshot }: { snapshot: Snapshot }) {
  const presentation = presentStatus(snapshot.state);
  return (
    <span className={`badge ${presentation.tone}`}>
      <span className="status-dot" />
      {presentation.label}
    </span>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function ServiceLink({ service }: { service: Service }) {
  return (
    <a className="service-link" href={`#/services/${service.id}`}>
      <span className="service-icon">
        <ServiceIcon type={service.type} />
      </span>
      <span>
        <span className="service-name">{service.name}</span>
        <span className="service-slug">{service.id}</span>
      </span>
      <ArrowUpRight size={15} aria-hidden="true" className="row-arrow" />
    </a>
  );
}
