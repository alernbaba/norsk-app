import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings – Norsk" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm />
    </div>
  );
}
