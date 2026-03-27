export type ReportContent = Record<string, any>;

export type Report = {
  id: string;
  type: "AUDIT" | "DM";
  reportDate: string;
  content: ReportContent;
  client: {
    id: string;
    username: string;
  };
};

export type GroupedReports = Record<
  string,
  {
    AUDIT?: ReportContent;
    DM?: ReportContent;
  }
>;

export type MainTab = "audit" | "dm";

export type SelectOption = {
  label: string;
  value: string;
};

export type DmField = {
  name: string;
  label: string;
  help?: string;
};

export type DmSection = {
  key: string;
  label: string;
  description: string;
  fields: DmField[];
};

export type AuditSectionField = {
  key: string;
  label: string;
};

export type AuditSection = {
  title: string;
  fields: AuditSectionField[];
};
