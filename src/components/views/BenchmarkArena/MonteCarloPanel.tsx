import React, { useState, useRef } from 'react';
import { Play, Square, Loader2, BarChart2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useAppStore } from '../../../store/useAppStore';
import { MonteCarloRunRecord, SolverDisplayMeta } from './types';

interface MonteCarloPanelProps {
  solvers: SolverDisplayMeta[];
}

export const MonteCarloPanel: React.FC<MonteCarloPanelProps> = ({
  solvers,
}) => {
  const [runCount, setRunCount] = useState<number>(5);
  const baseSeed = 42;
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [records, setRecords] = useState<MonteCarloRunRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCancelledRef = useRef<boolean>(false);
  const activeScenario = useAppStore((s) => s.activeScenario);
  const simulationState = useAppStore((s) => s.simulationState);

  const handleStartBatch = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setErrorMsg(null);
    isCancelledRef.current = false;
    setRecords([]);
    setCurrentProgress({ current: 0, total: runCount });

    const accumulatedRecords: MonteCarloRunRecord[] = [];

    for (let i = 0; i < runCount; i++) {
      if (isCancelledRef.current) {
        break;
      }

      setCurrentProgress({ current: i + 1, total: runCount });
      const startTime = performance.now();
      const currentSeed = baseSeed + i * 17;

      try {
        const response = await apiClient.compareSimulations({
          trajectory_type: simulationState.trajectoryType,
          num_points: 60,
          sampling_interval: 0.25,
          noise_std_dev: activeScenario.noiseStdDevMeters,
          dropout_rate: activeScenario.dropoutRate,
          nlos_bias_mean: activeScenario.multipathBiasMeanMeters,
          nlos_rate: simulationState.nlosRate,
          target_z: 1.1,
          enable_kalman: true,
          robust_loss: 'huber',
          robust_f_scale: 0.5,
          seed: currentSeed,
          room: {
            width: activeScenario.room.width,
            length: activeScenario.room.length,
            height: activeScenario.room.height,
          },
          anchors: activeScenario.anchors.map((a) => ({
            id: a.id,
            x: a.x,
            y: a.y,
            z: a.z ?? 2.8,
            is_active: a.isActive,
          })),
        });

        const elapsed = Math.round(performance.now() - startTime);

        // Extract solver RMSEs
        const rmseMap: Record<string, number> = {};
        let bestName = 'Robust NLS';
        let lowestRmse = Infinity;

        Object.entries(response.solvers).forEach(([key, s]) => {
          const rmse = s.metrics.rmse_m ?? 0.5;
          rmseMap[key] = rmse;
          if (rmse < lowestRmse) {
            lowestRmse = rmse;
            bestName = s.name;
          }
        });

        const record: MonteCarloRunRecord = {
          runIndex: i + 1,
          seed: currentSeed,
          durationMs: elapsed,
          status: 'success',
          rmseBySolver: rmseMap,
          bestSolverName: bestName,
          bestRmse: lowestRmse,
        };

        accumulatedRecords.push(record);
        setRecords([...accumulatedRecords]);
      } catch (err: unknown) {
        const elapsed = Math.round(performance.now() - startTime);
        accumulatedRecords.push({
          runIndex: i + 1,
          seed: currentSeed,
          durationMs: elapsed,
          status: 'failed',
          rmseBySolver: {},
          bestSolverName: 'None',
          bestRmse: 0,
        });
        setRecords([...accumulatedRecords]);
        setErrorMsg(`Run #${i + 1} failed: ${(err as Error)?.message || 'Engine timeout'}`);
        break;
      }
    }

    setIsRunning(false);
  };

  const handleCancelBatch = () => {
    isCancelledRef.current = true;
    setIsRunning(false);
  };

  // Compute aggregate statistics across completed runs
  const completedRuns = records.filter((r) => r.status === 'success');
  const hasResults = completedRuns.length > 0;

  const solverAggregates = solvers.map((s) => {
    const values = completedRuns
      .map((r) => r.rmseBySolver[s.id])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

    if (values.length === 0) {
      return { meta: s, mean: null, std: null, min: null, max: null };
    }

    const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
    const variance =
      values.length > 1
        ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1)
        : 0;
    const std = Math.sqrt(variance);

    return {
      meta: s,
      mean,
      std,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-6 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F3]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#171719] tracking-tight">
              Monte Carlo Batch Evaluation
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F2] text-[#159B71]">
              Controlled Execution
            </span>
          </div>
          <p className="text-xs text-[#74747B] mt-0.5">
            Executes repeated simulation runs with randomized pseudo-random seeds across identical anchor geometry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F4F4F6] p-1 rounded-xl border border-[#E5E5E9]">
            <span className="text-[11px] font-bold text-[#74747B] px-2">Runs:</span>
            {[3, 5, 10].map((count) => (
              <button
                key={count}
                type="button"
                disabled={isRunning}
                onClick={() => setRunCount(count)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  runCount === count
                    ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                    : 'text-[#74747B] hover:text-[#171719]'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {isRunning ? (
            <button
              type="button"
              onClick={handleCancelBatch}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-rose-700" />
              <span>Cancel Batch</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartBatch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D9F56F] hover:bg-[#cbf056] text-[#171719] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#171719]" />
              <span>Run Monte Carlo Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Notification */}
      {isRunning && (
        <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#E5E5E9] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#171719]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#159B71]" />
              <span>
                Running Batch Simulation {currentProgress.current} of {currentProgress.total}...
              </span>
            </div>
            <span className="font-mono text-[#159B71]">
              {Math.round((currentProgress.current / currentProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#E8E8EE] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#159B71] h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(currentProgress.current / currentProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Aggregate Statistics Cards */}
      {hasResults && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#74747B]">
            Statistical Reliability Across {completedRuns.length} Evaluated Runs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {solverAggregates.map(({ meta, mean, std, min, max }) => (
              <div
                key={meta.id}
                className="bg-[#F9F9FB] rounded-2xl border border-[#E5E5E9] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs font-bold text-[#171719]">{meta.name}</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#171719] font-mono">
                    {mean !== null ? `${mean.toFixed(2)}m` : '—'}
                  </div>
                  <div className="text-[11px] text-[#74747B] mt-0.5">
                    Mean RMSE &plusmn; {std !== null ? `${std.toFixed(3)}m` : '—'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#EBEBEF] flex items-center justify-between text-[10px] text-[#74747B] font-mono">
                  <span>Min: {min !== null ? `${min.toFixed(2)}m` : '—'}</span>
                  <span>Max: {max !== null ? `${max.toFixed(2)}m` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run Breakdown Table */}
      {records.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#74747B]">
            Run-by-Run Observations
          </h3>

          <div className="overflow-x-auto border border-[#E5E5E9] rounded-2xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F4F4F6] text-[#74747B] border-b border-[#E5E5E9]">
                <tr>
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Seed</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Robust NLS</th>
                  <th className="py-2.5 px-3 text-right">NLS + Kalman</th>
                  <th className="py-2.5 px-3 text-right">NLS (Std)</th>
                  <th className="py-2.5 px-3">Best Solver</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F3] text-[#171719]">
                {records.map((r) => (
                  <tr key={r.runIndex} className="hover:bg-[#F9F9FB]">
                    <td className="py-2.5 px-3 font-bold">#{r.runIndex}</td>
                    <td className="py-2.5 px-3 text-[#74747B]">{r.seed}</td>
                    <td className="py-2.5 px-3 text-[#74747B]">{r.durationMs}ms</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#159B71]">
                      {r.rmseBySolver['robust_nls'] ? `${r.rmseBySolver['robust_nls'].toFixed(2)}m` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#8B6CF6]">
                      {r.rmseBySolver['robust_nls_kalman']
                        ? `${r.rmseBySolver['robust_nls_kalman'].toFixed(2)}m`
                        : r.rmseBySolver['nls_kalman']
                        ? `${r.rmseBySolver['nls_kalman'].toFixed(2)}m`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#268BFF]">
                      {r.rmseBySolver['nls'] ? `${r.rmseBySolver['nls'].toFixed(2)}m` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#171719] truncate max-w-[140px]">
                      {r.bestSolverName}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'success'
                            ? 'bg-[#E8F8F2] text-[#159B71]'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasResults && !isRunning && (
        <div className="py-12 text-center text-xs text-[#74747B] bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E5E9]">
          <BarChart2 className="w-8 h-8 text-[#C0C0C8] mx-auto mb-2" />
          <p className="font-bold text-[#171719]">No Monte Carlo batches executed yet.</p>
          <p className="mt-1">
            Configure run count above and click &ldquo;Run Monte Carlo Batch&rdquo; to test parameter stability.
          </p>
        </div>
      )}
    </div>
  );
};
