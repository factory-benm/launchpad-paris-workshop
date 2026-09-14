import type { Dataset, Service, Snapshot } from "./catalog";
import { getSnapshot } from "./catalog";

export type ReasonCode =
  | "ci_failed"
  | "ci_not_configured"
  | "owner_missing"
  | "runbook_missing";
export type Reason = {
  code: ReasonCode;
  severity: "high" | "medium";
  title: string;
  detail: string;
};
export type Finding = {
  serviceId: string;
  serviceName: string;
  owner: string | null;
  reasons: Reason[];
};
export type AttentionReport = {
  schemaVersion: 1;
  datasetAsOf: string;
  serviceCount: number;
  attentionServiceCount: number;
  reasonCount: number;
  findings: Finding[];
};
type Rule = Reason & {
  matches: (service: Service, snapshot: Snapshot) => boolean;
};

const rules: Rule[] = [
  {
    code: "ci_failed",
    severity: "high",
    title: "CI failed",
    detail: "Investigate the failure recorded in the sample CI snapshot.",
    matches: (_, snapshot) => snapshot.state === "failed",
  },
  {
    code: "ci_not_configured",
    severity: "medium",
    title: "CI not configured",
    detail: "Define a validation workflow. No run is not a passing run.",
    matches: (_, snapshot) => snapshot.state === "never",
  },
  {
    code: "owner_missing",
    severity: "medium",
    title: "Owner missing",
    detail: "Assign a team that has accepted ownership of this service.",
    matches: (service) => service.owner === null,
  },
  {
    code: "runbook_missing",
    severity: "medium",
    title: "Runbook missing",
    detail: "Add a Markdown runbook and register its filename in the catalog.",
    matches: (service) => service.runbook === null,
  },
];

function priority(finding: Finding) {
  return rules.findIndex((rule) => rule.code === finding.reasons[0]?.code);
}

export function evaluateAttention(dataset: Dataset): AttentionReport {
  const findings = dataset.catalog.services.flatMap((service) => {
    const snapshot = getSnapshot(dataset, service.id);
    const reasons = rules
      .filter((rule) => rule.matches(service, snapshot))
      .map(({ code, severity, title, detail }) => ({
        code,
        severity,
        title,
        detail,
      }));
    return reasons.length
      ? [
          {
            serviceId: service.id,
            serviceName: service.name,
            owner: service.owner,
            reasons,
          },
        ]
      : [];
  });
  findings.sort(
    (left, right) =>
      priority(left) - priority(right) ||
      (left.serviceId < right.serviceId
        ? -1
        : left.serviceId > right.serviceId
          ? 1
          : 0),
  );
  return {
    schemaVersion: 1,
    datasetAsOf: dataset.ci.asOf,
    serviceCount: dataset.catalog.services.length,
    attentionServiceCount: findings.length,
    reasonCount: findings.reduce(
      (total, finding) => total + finding.reasons.length,
      0,
    ),
    findings,
  };
}

function escapeCell(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/[\r\n]+/g, " ");
}

export function reportMarkdown(report: AttentionReport): string {
  return [
    "# Launchpad catalog report",
    "",
    "Repository snapshot · sample data. Not live CI or production uptime.",
    "",
    `Dataset as of: ${report.datasetAsOf}`,
    `Services: ${report.serviceCount}`,
    `Services needing attention: ${report.attentionServiceCount}`,
    `Reasons: ${report.reasonCount}`,
    "",
    "| Service | Owner | Reasons |",
    "| --- | --- | --- |",
    ...report.findings.map(
      (finding) =>
        `| ${escapeCell(finding.serviceName)} (${finding.serviceId}) | ${escapeCell(finding.owner ?? "Unassigned")} | ${finding.reasons.map((reason) => `${reason.code} (${reason.severity})`).join(", ")} |`,
    ),
    ...(report.findings.length
      ? []
      : ["", "No attention findings in this snapshot."]),
    "",
    "Rules v1: ci_failed, ci_not_configured, owner_missing, runbook_missing.",
    "Findings are successful report output, not a process failure.",
    "",
  ].join("\n");
}
