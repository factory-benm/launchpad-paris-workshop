import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  FileJson,
  FolderGit2,
  Search,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { RunbookMarkdown } from "./RunbookMarkdown";
import type { Dataset, Service } from "./domain/catalog";
import { filterServices, getSnapshot } from "./domain/catalog";
import { CiBadge, EmptyState, ServiceIcon, ServiceLink } from "./components";
import { useRoute } from "./route";
import { AttentionPage } from "./AttentionPage";
import { evaluateAttention } from "./domain/attention";

export function App({ dataset }: { dataset: Dataset }) {
  const route = useRoute();
  const [sourceTab, setSourceTab] = useState<"catalog" | "ci">("catalog");
  const service = dataset.catalog.services.find(
    (item) => route === `/services/${item.id}`,
  );
  const title = service
    ? service.name
    : route === "/runbooks"
      ? "Runbooks"
      : route === "/source"
        ? "Repository data"
        : route === "/attention"
          ? "Attention"
          : "Service catalog";
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar" aria-label="Main navigation">
        <a href="#/" className="brand">
          <span className="brand-mark">
            <Terminal size={20} strokeWidth={1.7} />
          </span>
          <span>
            Launchpad<span className="brand-sub">DEVELOPER PORTAL</span>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">L</span>
          <div>
            Workshop workspace<span>Local repository</span>
          </div>
          <span className="local-light" />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          <a
            className={route === "/" || service ? "active" : ""}
            href="#/"
            aria-current={route === "/" ? "page" : undefined}
          >
            <FolderGit2 size={17} />
            Service catalog
            <span className="nav-count">{dataset.catalog.services.length}</span>
          </a>
          <a
            className={route === "/attention" ? "active" : ""}
            href="#/attention"
            aria-current={route === "/attention" ? "page" : undefined}
          >
            <TriangleAlert size={17} />
            Attention
            <span className="nav-count">
              {evaluateAttention(dataset).attentionServiceCount}
            </span>
          </a>
          <a
            className={route === "/runbooks" ? "active" : ""}
            href="#/runbooks"
            aria-current={route === "/runbooks" ? "page" : undefined}
          >
            <BookOpen size={17} />
            Runbooks
          </a>
          <a
            className={route === "/source" ? "active" : ""}
            href="#/source"
            aria-current={route === "/source" ? "page" : undefined}
          >
            <FileJson size={17} />
            Repository data
          </a>
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">BUILT FOR THE BUILD-ALONG</span>
          <p>
            Your services.
            <br />
            One place to start.
          </p>
          <div className="sidebar-rule" />
          <span className="small-muted">
            No accounts. No live integrations.
            <br />
            Just the files in your repository.
          </span>
          <div className="factory-wordmark">
            FACTORY <span>/ PARIS</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="muted">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            {title}
          </div>
          <span className="local-chip">
            <span className="local-light" />
            Local-first
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          {route === "/" ? (
            <CatalogPage dataset={dataset} />
          ) : route === "/attention" ? (
            <AttentionPage dataset={dataset} />
          ) : service ? (
            <ServicePage service={service} dataset={dataset} />
          ) : route === "/runbooks" ? (
            <RunbooksPage dataset={dataset} />
          ) : route === "/source" ? (
            <section>
              <PageHeading
                eyebrow="VERSIONED, NOT LIVE"
                title="Repository data"
                description="The same files power every local copy. Commit changes to share them; pull changes to receive them."
              />
              <div className="tabs" role="group" aria-label="Data file">
                <button
                  aria-pressed={sourceTab === "catalog"}
                  onClick={() => setSourceTab("catalog")}
                >
                  catalog.json
                </button>
                <button
                  aria-pressed={sourceTab === "ci"}
                  onClick={() => setSourceTab("ci")}
                >
                  ci-snapshots.json
                </button>
              </div>
              <p className="source-path">
                data/
                {sourceTab === "catalog" ? "catalog.json" : "ci-snapshots.json"}
              </p>
              <pre className="code-view">
                <code>
                  {JSON.stringify(
                    sourceTab === "catalog" ? dataset.catalog : dataset.ci,
                    null,
                    2,
                  )}
                </code>
              </pre>
            </section>
          ) : (
            <EmptyState title="That page isn't in the catalog.">
              <a className="text-link" href="#/">
                Back to service catalog <ArrowRight size={15} />
              </a>
            </EmptyState>
          )}
        </main>
        <footer>
          <span>Repository snapshot · sample data</span>
          <span>
            Snapshot: {dataset.ci.asOf.replace("T", " ").replace("Z", " UTC")} ·
            Not live CI
          </span>
        </footer>
      </div>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function CatalogPage({ dataset }: { dataset: Dataset }) {
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [type, setType] = useState("all");
  const services = dataset.catalog.services;
  const owners = [
    ...new Set(
      services.flatMap((service) => (service.owner ? [service.owner] : [])),
    ),
  ].sort();
  const filtered = filterServices(services, { query, owner, type });
  const reset = () => {
    setQuery("");
    setOwner("all");
    setType("all");
  };
  return (
    <section>
      <PageHeading
        eyebrow="ENGINEERING, IN ONE PLACE"
        title="Service catalog"
        description="Find a service. Know who owns it. Get back to building."
      />
      <div className="metrics">
        <div>
          <span className="metric-label">REGISTERED SERVICES</span>
          <strong>{services.length.toString().padStart(2, "0")}</strong>
          <span className="metric-note">One shared source of truth</span>
        </div>
        <div>
          <span className="metric-label">OWNING TEAMS</span>
          <strong>{owners.length.toString().padStart(2, "0")}</strong>
          <span className="metric-note">Across your sample platform</span>
        </div>
        <div>
          <span className="metric-label">RUNBOOK COVERAGE</span>
          <strong>
            {services.filter((item) => item.runbook).length}
            <span className="metric-denominator"> / {services.length}</span>
          </strong>
          <span className="metric-note">Readable, versioned Markdown</span>
        </div>
      </div>
      <div className="section-heading">
        <h2>
          All services <span>{services.length}</span>
        </h2>
        <a className="text-link" href="#/source">
          Inspect the source <Code2 size={15} />
        </a>
      </div>
      <div className="filters">
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search services"
            placeholder="Search services, tags, or teams..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              ×
            </button>
          ) : (
            <span className="input-hint">SEARCH</span>
          )}
        </label>
        <label className="select-label">
          <span className="sr-only">Filter by owner</span>
          <select
            aria-label="Filter by owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          >
            <option value="all">All owners</option>
            {owners.map((item) => (
              <option key={item}>{item}</option>
            ))}
            <option value="unassigned">Unassigned</option>
          </select>
        </label>
        <label className="select-label">
          <span className="sr-only">Filter by type</span>
          <select
            aria-label="Filter by type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="api">API</option>
            <option value="worker">Worker</option>
            <option value="library">Library</option>
            <option value="website">Website</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="table-scroll">
          <table className="catalog-table">
            <thead>
              <tr>
                <th scope="col">SERVICE</th>
                <th scope="col">OWNER</th>
                <th scope="col">TYPE</th>
                <th scope="col">CI SNAPSHOT</th>
                <th scope="col">RUNBOOK</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr key={service.id}>
                  <td>
                    <ServiceLink service={service} />
                  </td>
                  <td>
                    {service.owner ? (
                      <span className="owner">
                        <span className="owner-avatar">
                          {service.owner
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        {service.owner}
                      </span>
                    ) : (
                      <span className="missing-label">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="type-label">{service.type}</span>
                  </td>
                  <td>
                    <CiBadge snapshot={getSnapshot(dataset, service.id)} />
                  </td>
                  <td>
                    {service.runbook ? (
                      <a
                        className="runbook-link"
                        href={`#/services/${service.id}`}
                        aria-label={`Read ${service.name} runbook`}
                      >
                        <BookOpen size={16} />
                        <span>Read</span>
                      </a>
                    ) : (
                      <span className="missing-label">Missing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No services match these filters.">
          <button className="button" onClick={reset}>
            Clear filters
          </button>
        </EmptyState>
      )}
      <div className="table-caption">
        <span aria-live="polite">
          Showing {filtered.length} of {services.length} services
        </span>
        <span>
          Changes start in <code>data/catalog.json</code>
        </span>
      </div>
    </section>
  );
}

function ServicePage({
  service,
  dataset,
}: {
  service: Service;
  dataset: Dataset;
}) {
  const snapshot = getSnapshot(dataset, service.id);
  const runbook = service.runbook
    ? dataset.runbooks[service.runbook]
    : undefined;
  return (
    <section>
      <a className="back-link" href="#/">
        <ArrowLeft size={15} />
        All services
      </a>
      <div className="service-detail-title">
        <span className="service-icon large">
          <ServiceIcon type={service.type} />
        </span>
        <div>
          <span className="eyebrow">
            {service.type.toUpperCase()} / {service.id}
          </span>
          <h1>{service.name}</h1>
        </div>
      </div>
      <p className="service-description">{service.description}</p>
      <div className="detail-metadata">
        <div>
          <span className="metric-label">OWNER</span>
          <span>{service.owner ?? "Unassigned"}</span>
        </div>
        <div>
          <span className="metric-label">CI SNAPSHOT</span>
          <CiBadge snapshot={snapshot} />
        </div>
        <div>
          <span className="metric-label">TAGS</span>
          <span className="tag-list">
            {service.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </span>
        </div>
      </div>
      <div className="detail-columns">
        <article className="runbook">
          <div className="section-heading">
            <h2>
              <BookOpen size={18} />
              Runbook
            </h2>
            <span className="source-path">
              {service.runbook
                ? `data/runbooks/${service.runbook}`
                : "No file registered"}
            </span>
          </div>
          {runbook ? (
            <RunbookMarkdown content={runbook} />
          ) : (
            <div className="missing-runbook">
              <h3>This service needs a runbook.</h3>
              <p>
                Add a Markdown file in <code>data/runbooks/</code>, then set
                this service's <code>runbook</code> field in the catalog.
              </p>
            </div>
          )}
        </article>
        <aside className="detail-aside" aria-label="Service evidence">
          <h2>Snapshot evidence</h2>
          <p>{snapshot.summary}</p>
          <dl>
            <dt>Raw state</dt>
            <dd>
              <code>{snapshot.state}</code>
            </dd>
            <dt>Workflow</dt>
            <dd>{snapshot.workflow ?? "Not configured"}</dd>
            <dt>Sample reference</dt>
            <dd>{snapshot.ref ?? "No run"}</dd>
          </dl>
          <a className="text-link" href="#/source">
            Inspect JSON <ArrowRight size={15} />
          </a>
          <div className="aside-note">
            These are committed example records, not live service health or
            GitHub Actions results.
          </div>
        </aside>
      </div>
    </section>
  );
}

function RunbooksPage({ dataset }: { dataset: Dataset }) {
  const services = dataset.catalog.services;
  return (
    <section>
      <PageHeading
        eyebrow="CONTEXT THAT SHIPS WITH THE CODE"
        title="Runbooks"
        description="Practical notes, stored as Markdown. Read them here or open the files in your editor."
      />
      <div className="runbook-list">
        {services.map((service) => (
          <a key={service.id} href={`#/services/${service.id}`}>
            <BookOpen size={20} />
            <div>
              <h2>{service.name}</h2>
              <span>
                {service.runbook
                  ? `data/runbooks/${service.runbook}`
                  : "Missing runbook · an opportunity to document the basics"}
              </span>
            </div>
            <ArrowRight size={17} />
          </a>
        ))}
      </div>
    </section>
  );
}
