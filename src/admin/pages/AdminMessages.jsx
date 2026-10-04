import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Mail,
  MailCheck,
  MoreVertical,
  SearchX,
  Trash2,
} from "lucide-react";
import { messagesApi } from "../../lib/api";
import { useResource } from "../../hooks/useResource";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../context/ToastContext";
import {
  AdminButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminSearchInput,
  Panel,
  StatusBadge,
} from "../components/ui";
import DataTable from "../components/DataTable";
import Dropdown from "../components/Dropdown";
import Modal, { ConfirmDialog } from "../components/Modal";
import { formatDateTime } from "../../utils/format";
import { cn } from "../../utils/cn";

/**
 * AdminMessages — the inbox for contact-form submissions. Search,
 * status tabs, detail modal (auto-marks read), archive/unarchive
 * and confirmed deletes.
 */

const TABS = [
  { value: "", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

export default function AdminMessages() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = { q: debouncedSearch, status, page, limit: 12 };
  const { data, loading, error, retry } = useResource(
    (signal) => messagesApi.list(queryParams, signal),
    [debouncedSearch, status, page],
  );

  const [detail, setDetail] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);

  const items = data?.items ?? [];

  const openDetail = async (message) => {
    setDetail(message);
    if (message.status === "unread") {
      try {
        await messagesApi.setStatus(message._id, "read");
        setDetail({ ...message, status: "read" });
        retry();
      } catch {
        /* non-fatal — the row just stays unread */
      }
    }
  };

  const changeStatus = async (message, nextStatus, successMessage) => {
    setRowBusy(message._id);
    try {
      await messagesApi.setStatus(message._id, nextStatus);
      toast.success(successMessage);
      if (detail?._id === message._id) {
        setDetail({ ...detail, status: nextStatus });
      }
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setRowBusy(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await messagesApi.remove(pendingDelete._id);
      toast.success("Message deleted.");
      if (detail?._id === pendingDelete._id) setDetail(null);
      setPendingDelete(null);
      retry();
    } catch (cause) {
      toast.error(cause.message);
    } finally {
      setDeleting(false);
    }
  };

  const unreadCount = data?.unreadCount ?? 0;
  const hasFilters = Boolean(search || status);

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description={
          unreadCount > 0
            ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"} from the contact form.`
            : "Enquiries submitted through the public contact form."
        }
      />

      {/* Tabs + search */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter messages by status"
          className="inline-flex w-fit rounded-lg border border-line bg-white p-0.5"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                status === tab.value
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <AdminSearchInput
          id="admin-message-search"
          value={search}
          onChange={setSearch}
          placeholder="Search name, email, subject…"
          className="sm:max-w-xs"
        />
      </div>

      {error ? (
        <Panel>
          <AdminEmptyState
            title="Messages could not load"
            description={error.message}
            action={
              <AdminButton size="sm" variant="secondary" onClick={retry}>
                Retry
              </AdminButton>
            }
          />
        </Panel>
      ) : (
        <DataTable
          columns={[
            {
              key: "subject",
              header: "Message",
              render: (item) => (
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      item.status === "unread" ? "bg-bronze-500" : "bg-transparent",
                    )}
                  />
                  <div className="min-w-0">
                    <p className={cn("truncate text-sm", item.status === "unread" ? "font-semibold text-ink" : "font-medium text-ink-soft")}>
                      {item.subject}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {item.name} · {item.email}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (item) => (
                <StatusBadge tone={item.status}>
                  {item.status === "unread" ? "New" : item.status}
                </StatusBadge>
              ),
            },
            {
              key: "createdAt",
              header: "Received",
              className: "hidden sm:table-cell",
              render: (item) => (
                <span className="text-xs text-ink-muted">{formatDateTime(item.createdAt)}</span>
              ),
            },
          ]}
          items={items}
          loading={loading}
          rowKey={(item) => item._id}
          onRowClick={openDetail}
          pagination={
            data
              ? { page: data.page, totalPages: data.totalPages, total: data.total, limit: data.limit }
              : undefined
          }
          onPageChange={setPage}
          emptyState={
            hasFilters ? (
              <AdminEmptyState
                icon={SearchX}
                title="No messages match"
                description="Adjust the search or the status tab."
                action={
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatus("");
                    }}
                  >
                    Clear filters
                  </AdminButton>
                }
              />
            ) : (
              <AdminEmptyState
                icon={Mail}
                title="The inbox is empty"
                description="Messages from the public contact form will appear here."
              />
            )
          }
          rowActions={(item) => (
            <Dropdown
              align="right"
              label={`Actions for message from ${item.name}`}
              trigger={
                <span className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
                  {rowBusy === item._id ? (
                    <span className="size-4 animate-pulse rounded-full bg-ink/10" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="size-4" aria-hidden="true" />
                  )}
                </span>
              }
              items={[
                {
                  label: item.status === "unread" ? "Mark as read" : "Mark as unread",
                  icon: item.status === "unread" ? MailCheck : Check,
                  onSelect: () =>
                    changeStatus(
                      item,
                      item.status === "unread" ? "read" : "unread",
                      item.status === "unread" ? "Marked as read." : "Marked as unread.",
                    ),
                },
                {
                  label: item.status === "archived" ? "Unarchive" : "Archive",
                  icon: item.status === "archived" ? ArchiveRestore : Archive,
                  onSelect: () =>
                    changeStatus(
                      item,
                      item.status === "archived" ? "read" : "archived",
                      item.status === "archived" ? "Message restored." : "Message archived.",
                    ),
                },
                { divider: true },
                { label: "Delete", icon: Trash2, danger: true, onSelect: () => setPendingDelete(item) },
              ]}
            />
          )}
        />
      )}

      {/* Detail modal */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.subject}
        description={detail ? `${detail.name} · ${detail.email} · ${formatDateTime(detail.createdAt)}` : undefined}
      >
        {detail ? (
          <div>
            <StatusBadge tone={detail.status} className="mb-4">
              {detail.status === "unread" ? "New" : detail.status}
            </StatusBadge>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
              {detail.message}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <a
                href={`mailto:${detail.email}?subject=${encodeURIComponent(`Re: ${detail.subject}`)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-bronze-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-bronze-700"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                Reply by email
              </a>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  changeStatus(
                    detail,
                    detail.status === "archived" ? "read" : "archived",
                    detail.status === "archived" ? "Message restored." : "Message archived.",
                  )
                }
              >
                {detail.status === "archived" ? "Unarchive" : "Archive"}
              </AdminButton>
              <AdminButton
                variant="danger-quiet"
                size="sm"
                className="ml-auto"
                onClick={() => setPendingDelete(detail)}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this message?"
        message={`The message from "${pendingDelete?.name}" (${pendingDelete?.email}) will be permanently removed.`}
      />
    </div>
  );
}
