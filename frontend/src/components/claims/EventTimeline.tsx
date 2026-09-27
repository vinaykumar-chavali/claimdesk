import { ClaimEvent } from "../../types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

export function EventTimeline({ events }: { events: ClaimEvent[] }) {
  if (!events.length) return <p className="text-sm text-gray-500">No events yet.</p>;

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    <div className="h-2.5 w-2.5 rounded-full bg-navy-600" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Status changed to <StatusBadge status={event.new_status} /> by{" "}
                      <span className="font-medium text-gray-900">{event.actor?.full_name || 'System'}</span>
                    </p>
                    {event.reason && (
                      <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
                        {event.reason}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.created_at}>{formatDate(event.created_at)}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
