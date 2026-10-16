import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { QualityCheckItem } from './types';

interface DataQualityCardProps {
  checks: QualityCheckItem[];
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({ checks }) => {
  const renderStatusIcon = (status: QualityCheckItem['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#159B71] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />;
    }
  };

  const getMetricBadge = (check: QualityCheckItem) => {
    if (check.metricValue) {
      return (
        <span className="font-mono text-[11px] font-bold text-[#268BFF]">
          {check.metricValue}
        </span>
      );
    }
    if (check.status === 'passed') {
      return (
        <span className="font-mono text-[11px] font-bold text-[#159B71]">
          {check.issueCount === 0 ? '0 issues' : 'Passed'}
        </span>
      );
    }
    if (check.status === 'warning') {
      return (
        <span className="font-mono text-[11px] font-bold text-amber-600">
          {check.issueCount} warnings
        </span>
      );
    }
    return (
      <span className="font-mono text-[11px] font-bold text-rose-600">
        {check.issueCount} issues
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF6E9] text-[#F5AC35] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Data Quality Checks
              </h2>
              <p className="text-xs text-[#74747B]">
                Automated validation of trajectory and range data.
              </p>
            </div>
          </div>
        </div>

        {/* Checks List */}
        <div className="my-3 space-y-2.5">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between gap-2 text-xs"
              title={check.explanation}
            >
              <div className="flex items-center gap-2 min-w-0">
                {renderStatusIcon(check.status)}
                <span className="text-[#171719] font-medium truncate">{check.name}</span>
              </div>
              <div className="shrink-0">{getMetricBadge(check)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="mt-3 p-2.5 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-start gap-2 text-[10px] text-[#1E40AF] leading-tight">
        <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
        <span>
          All datasets are synthetically generated for research and evaluation purposes. They do not represent real sensor readings.
        </span>
      </div>
    </div>
  );
};
