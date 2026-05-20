export type ConfigFieldOption = {
  value: string;
  label: string;
};

export type ConfigField = {
  key: string;
  label: string;
  value: string;
  group?: "general" | "pagosQr" | "cuentaQr" | "iaGrok";
  type?: "text" | "email" | "number" | "password" | "select" | "toggle";
  helperText?: string;
  options?: ConfigFieldOption[];
};

export type ConfiguracionPort = {
  list: () => Promise<ConfigField[]>;
  save: (values: Record<string, string>) => Promise<ConfigField[]>;
};
