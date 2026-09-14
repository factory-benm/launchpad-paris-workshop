import { ArrowRight, CheckCheck, FileJson, TriangleAlert } from "lucide-react";
import type { Dataset } from "./domain/catalog";
import { evaluateAttention } from "./domain/attention";
import { EmptyState } from "./components";

export function AttentionPage({ dataset }: { dataset: Dataset }) {
  const report = evaluateAttention(dataset);
  const high = report.findings.filter((finding) =>
    finding.reasons.some((reason) => reason.severity === "high"),
  ).length;
  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">SMALL GAPS, EXPLICIT NEXT STEPS</span>
        <h1>Attention</h1>
        <p>
          What needs a closer look in this snapshot. One service, every reason,
          no guesswork.
        </p>
      </div>
      <div className="metrics">
        <div>
          <span className="metric-label">SERVICES NEEDING ATTENTION</span>
          <strong data-testid="attention-count">
            {report.attentionServiceCount.toString().padStart(2, "0")}
          </strong>
          <span className="metric-note">
            Of {report.serviceCount} registered services
          </span>
        </div>
        <div>
          <span className="metric-label">DISTINCT REASONS</span>
          <strong data-testid="reason-count">
            {report.reasonCount.toString().padStart(2, "0")}
          </strong>
          <span className="metric-note">A service can have more than one</span>
        </div>
        <div>
          <span className="metric-label">HIGH PRIORITY</span>
          <strong>{high.toString().padStart(2, "0")}</strong>
          <span className="metric-note">
            Services with failing CI snapshots
          </span>
        </div>
      </div>
      <div className="section-heading">
        <h2>
          <TriangleAlert size={17} />
          Review queue
        </h2>
        <span className="source-path">RULES v1 / DETERMINISTIC</span>
      </div>
      {report.findings.length ? (
        <div className="attention-list">
          {report.findings.map((finding, index) => (
            <article
              className="attention-row"
              key={finding.serviceId}
              data-testid="attention-finding"
              data-service-id={finding.serviceId}
            >
              <span className="finding-number">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <div className="finding-body">
                <div className="finding-heading">
                  <a href={`#/services/${finding.serviceId}`}>
                    <h2>{finding.serviceName}</h2>
                    <ArrowRight size={15} />
                  </a>
                  <span className="finding-owner">
                    {finding.owner ?? "Unassigned"}
                  </span>
                </div>
                <div className="finding-reasons">
                  {finding.reasons.map((reason) => (
                    <div key={reason.code} data-reason-code={reason.code}>
                      <span
                        className={`badge ${reason.severity === "high" ? "danger" : "pending"}`}
                      >
                        <span className="status-dot" />
                        {reason.title}
                      </span>
                      <p>{reason.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No attention findings in this snapshot.">
          <CheckCheck size={25} />
          <p>Every service meets the four explicit catalog rules.</p>
        </EmptyState>
      )}
      <div className="report-note">
        <FileJson size={19} />
        <div>
          <h2>The same rules, outside the browser.</h2>
          <p>
            Run <code>npm run catalog:report</code> to inspect this report as
            JSON. A scheduler can run the same command without changing the
            rules.
          </p>
        </div>
        <a className="text-link" href="#/source">
          View inputs <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
