import { PageHeader } from "@/components/dashboard/ui";
import { BusinessSettingsForm, PasswordForm } from "@/components/dashboard/settings-forms";
import { getSettings } from "@/lib/data";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const [settings, session] = await Promise.all([getSettings(), getSession()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Business profile used across the website, quotations and WhatsApp messages."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        <BusinessSettingsForm
          initial={{
            businessName: settings.businessName,
            tagline: settings.tagline,
            phone: settings.phone,
            whatsapp: settings.whatsapp,
            email: settings.email,
            address: settings.address,
            city: settings.city,
            hours: settings.hours,
            gstin: settings.gstin,
            mapEmbed: settings.mapEmbed,
            quoteTerms: settings.quoteTerms,
          }}
        />

        <div className="space-y-6">
          <PasswordForm />
          <div className="card p-5">
            <h2 className="font-bold">Signed-in operator</h2>
            <p className="mt-2 text-sm text-ink-500">
              {session?.name}
              <br />
              <span className="text-ink-400">{session?.email}</span>
            </p>
            <p className="mt-3 text-xs text-ink-400">
              Sessions are signed with HS256, stored in an HTTP-only cookie and expire automatically after 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
