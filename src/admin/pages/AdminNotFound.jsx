import { Compass } from "lucide-react";
import { AdminButton, AdminPageHeader, Panel } from "../components/ui";

/** AdminNotFound — CMS-styled 404 for unknown /admin/* paths. */
export default function AdminNotFound() {
  return (
    <div>
      <AdminPageHeader title="Page not found" />
      <Panel>
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-cream-deep text-ink-muted">
            <Compass className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-ink-soft">
            That admin page does not exist. Use the sidebar to find your way back.
          </p>
          <AdminButton variant="secondary" size="sm" onClick={() => window.history.back()}>
            Go back
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
}
