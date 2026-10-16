import React, { useState } from 'react';
import { History } from 'lucide-react';
import { BenchmarkHistoryEntry } from './types';

interface RecentRunsPanelProps {
  historyEntries: BenchmarkHistoryEntry[];
  onClearHistory?: () => void;
}

export const RecentRunsPanel: React.FC<RecentRunsPanelProps> = ({
  historyEntries,
  onClearHistory,
}) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const renderStatusDot = (status: BenchmarkHistoryEntry['status']) => {
    switch (status) {
      case 'completed':
        return <div className="w-2.5 h-2.5 rounded-full bg-[#159B71] shrink-0 ring-4 ring-[#E8F8F2]" />;
      case 'started':
        return <div className="w-2.5 h-2.5 rounded-full bg-[#268BFF] shrink-0 ring-4 ring-[#E9F3FF]" />;
      case 'configured':
        return <div className="w-2.5 h-2.5 rounded-full bg-[#8B6CF6] shrink-0 ring-4 ring-[#F0ECFC]" />;
      case 'health':
        return <div className="w-2.5 h-2.5 rounded-full bg-[#159B71] shrink-0 ring-4 ring-[#E8F8F2]" />;
      case 'failed':
        return <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 ring-4 ring-rose-100" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-[#A0A0A8] shrink-0 ring-4 ring-neutral-100" />;
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E9F3FF] text-[#268BFF] flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171719] tracking-tight">Recent Benchmark Runs</h2>
            <p className="text-xs text-[#74747B]">History of numerical benchmark simulations.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllModal(true)}
          className="text-xs font-bold text-[#171719] hover:text-[#268BFF] px-2.5 py-1 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* History Timeline */}
      <div className="my-3 space-y-3.5">
        {historyEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#74747B]">
            No benchmark runs in this session. Click &ldquo;Run Benchmark&rdquo; to begin.
          </div>
        ) : (
          historyEntries.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-1">{renderStatusDot(entry.status)}</div>
                <div className="min-w-0">
                  <div className="font-bold text-[#171719] truncate">{entry.title}</div>
                  <div className="text-[11px] text-[#74747B] truncate">{entry.subtitle}</div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#888890] shrink-0 text-right">
                {entry.timestamp}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#F0F0F3] flex items-center justify-between text-[11px] text-[#74747B]">
        <span>Retains bounded session events</span>
        {onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[10px] font-semibold text-[#888890] hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {/* View All Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#E5E5E9] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F3]">
              <h3 className="text-sm font-bold text-[#171719]">All Benchmark Session Records</h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="text-xs font-bold text-[#74747B] hover:text-[#171719] px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-3 flex-1">
              {historyEntries.map((entry) => (
                <div key={entry.id} className="p-2.5 rounded-xl bg-[#F9F9FB] border border-[#EBEBEF] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#171719]">
                    <span>{entry.title}</span>
                    <span className="text-[10px] text-[#74747B] font-mono">{entry.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#74747B] mt-0.5">{entry.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
