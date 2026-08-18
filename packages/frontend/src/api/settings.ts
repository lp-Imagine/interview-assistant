import api from "./index";

export interface SettingsResponse {
  settings: Record<string, string>;
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const { data } = await api.get<SettingsResponse>("/settings");
  return data.settings ?? {};
}

export async function saveSettings(
  patch: Record<string, string>,
): Promise<{ changed: string[]; message: string }> {
  const { data } = await api.put("/settings", patch);
  return data;
}
