import { getStoreSettings } from "@/app/actions/settings";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const initialSettings = await getStoreSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}
