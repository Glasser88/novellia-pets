import { Pagination } from "@/components/pagination";
import { RecordFilters } from "@/components/records/record-filters";
import { RecordTable } from "@/components/records/record-table";
import { SectionCard } from "@/components/section-card";
import { todayIso } from "@/lib/format";
import { getCurrentUserId } from "@/server/currentUser";
import { listAllRecords, RECORDS_PAGE_SIZE } from "@/server/records/service";
import { DUE_WINDOW_LABELS, isDueWindow } from "@/shared/care";
import { isRecordTypeKey } from "@/shared/recordTypes";

const RecordsPage = async ({ searchParams }: PageProps<"/records">) => {
  const { status, type, q, page: pageParam } = await searchParams;
  const ownerId = await getCurrentUserId();
  const today = todayIso();

  // Only honour filter values the app knows; anything else means "all".
  const dueWindow = isDueWindow(status) ? status : undefined;
  const typeFilter = typeof type === "string" && isRecordTypeKey(type) ? type : undefined;
  const query = typeof q === "string" ? q.trim() : "";
  const requestedPage = Number(pageParam) || 1;

  const { rows, total, page, pageCount } = await listAllRecords(ownerId, today, {
    dueWindow,
    type: typeFilter,
    query,
    page: requestedPage,
  });
  const filtered = Boolean(dueWindow || typeFilter || query);

  // Page links keep the current filters.
  const hrefForPage = (target: number) => {
    const params = new URLSearchParams();
    if (dueWindow) params.set("status", dueWindow);
    if (typeFilter) params.set("type", typeFilter);
    if (query) params.set("q", query);
    if (target > 1) params.set("page", String(target));
    const queryString = params.toString();
    return queryString ? `/records?${queryString}` : "/records";
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Records</h1>

      <RecordFilters
        action="/records"
        dueWindow={dueWindow}
        type={typeFilter}
        query={query}
        showDueWindow
      />

      <SectionCard
        title={dueWindow ? DUE_WINDOW_LABELS[dueWindow] : "All records"}
        hint={
          dueWindow
            ? "Soonest due first, across all of your pets."
            : "Every record across all of your pets, newest first."
        }
        count={total}
        isEmpty={rows.length === 0}
        emptyMessage={
          filtered
            ? "No records match this filter."
            : "No records yet. Open a pet to add their first vaccination, medication or visit."
        }
      >
        <RecordTable rows={rows} today={today} showPet />
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={RECORDS_PAGE_SIZE}
          total={total}
          hrefFor={hrefForPage}
        />
      </SectionCard>
    </div>
  );
};

export default RecordsPage;
