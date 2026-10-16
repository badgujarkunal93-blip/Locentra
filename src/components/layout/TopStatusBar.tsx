import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Search,
  Bell,
  Box,
  Maximize2,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Check,
  Sliders
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { LocentraLogo } from '../ui/LocentraLogo';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

const ROOM_PRESETS = [
  {
    name: 'Research Hall B (Default)',
    width: 12.0,
    length: 8.0,
    height: 3.5,
    description: 'Benchmark standard testbed with 6 perimeter UWB anchors'
  },
  {
    name: 'High-Bay Aerospace Hangar',
    width: 24.0,
    length: 16.0,
    height: 6.0,
    description: 'Large-scale industrial facility with high ceiling clearances'
  },
  {
    name: 'Robotics Navigation Lab',
    width: 8.0,
    length: 6.0,
    height: 3.0,
    description: 'Compact autonomous ground vehicle tracking space'
  },
  {
    name: 'Micro Prototyping Cell',
    width: 6.0,
    length: 4.0,
    height: 2.8,
    description: 'High-density rapid prototyping sensor test cell'
  }
];

export const TopStatusBar: React.FC = () => {
  const activeSection = useAppStore((s) => s.activeSection);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);
  const activeScenario = useAppStore((s) => s.activeScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Custom room size input state
  const [customW, setCustomW] = useState(String(activeScenario.room.width));
  const [customL, setCustomL] = useState(String(activeScenario.room.length));
  const [customH, setCustomH] = useState(String(activeScenario.room.height));

  // Notification items state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'FastAPI Engine Online',
      message: 'Numerical solver connected at 127.0.0.1:8000 with sub-second response latency.',
      timestamp: 'Just now',
      type: 'success',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Anchor A6 Multipath Warning',
      message: 'Degraded NLOS signal detected (42% occlusion). Huber robust estimation recommended.',
      timestamp: '3m ago',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Robust NLS Convergence Verified',
      message: 'Optimisation reached 99.8% convergence rate across 80 estimated points.',
      timestamp: '12m ago',
      type: 'info',
      read: false
    },
    {
      id: 'notif-4',
      title: 'Telemetry Cycle Active',
      message: 'Simulated positioning feed streaming at 4-second intervals.',
      timestamp: '25m ago',
      type: 'info',
      read: true
    }
  ]);

  const roomMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roomMenuRef.current && !roomMenuRef.current.contains(e.target as Node)) {
        setIsRoomMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const applyRoomDimensions = (w: number, l: number, h: number) => {
    const validW = Math.max(4.0, Math.min(60.0, w));
    const validL = Math.max(4.0, Math.min(60.0, l));
    const validH = Math.max(2.4, Math.min(15.0, h));

    // Update scenario with newly configured room size and reposition perimeter anchors
    updateScenario({
      room: {
        width: validW,
        length: validL,
        height: validH,
        gridResolution: 1.0,
      },
      anchors: [
        { id: 'A1', name: 'Anchor #1 (NW)', x: 0.5, y: 0.5, z: Math.min(2.8, validH - 0.2), isActive: true, status: 'healthy', nlosProb: 0.05 },
        { id: 'A2', name: 'Anchor #2 (NE)', x: Number((validW - 0.5).toFixed(1)), y: 0.5, z: Math.min(2.8, validH - 0.2), isActive: true, status: 'healthy', nlosProb: 0.08 },
        { id: 'A3', name: 'Anchor #3 (SE)', x: Number((validW - 0.5).toFixed(1)), y: Number((validL - 0.5).toFixed(1)), z: Math.min(2.8, validH - 0.2), isActive: true, status: 'healthy', nlosProb: 0.15 },
        { id: 'A4', name: 'Anchor #4 (SW)', x: 0.5, y: Number((validL - 0.5).toFixed(1)), z: Math.min(2.8, validH - 0.2), isActive: true, status: 'healthy', nlosProb: 0.05 },
        { id: 'A5', name: 'Anchor #5 (Mid-N)', x: Number((validW / 2).toFixed(1)), y: 0.5, z: Math.min(3.2, validH - 0.1), isActive: true, status: 'healthy', nlosProb: 0.20 },
        { id: 'A6', name: 'Anchor #6 (Mid-S)', x: Number((validW / 2).toFixed(1)), y: Number((validL - 0.5).toFixed(1)), z: Math.min(3.2, validH - 0.1), isActive: true, status: 'degraded', nlosProb: 0.42 },
      ]
    });

    setCustomW(String(validW));
    setCustomL(String(validL));
    setCustomH(String(validH));
    setIsRoomMenuOpen(false);
  };

  const sectionTitles: Record<string, string> = {
    'command-center': 'Command Center',
    'spatial-lab': 'Spatial Lab',
    'scenario-studio': 'Scenario Studio',
    'benchmark-arena': 'Benchmark Arena',
    'dataset-explorer': 'Dataset Explorer',
  };

  return (
    <header className="h-16 lg:h-20 bg-transparent px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-40 max-w-full">
      {/* Left: Brand / Module Breadcrumb - Clickable to Landing Page */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => useAppStore.getState().setViewMode('landing')}
            className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 shrink-0 transition-opacity cursor-pointer group focus:outline-none p-1 -m-1 rounded-lg text-[#171717] hover:text-black hover:bg-black/5"
            title="Return to Landing Page"
            aria-label="Return to Locentra Landing Page"
          >
            <LocentraLogo size={16} variant="icon" className="text-[#171717] group-hover:scale-110 transition-transform" />
            <span>LOCENTRA</span>
          </button>
          <span className="text-[#A0A0A0] font-mono text-xs">/</span>
          <span className="text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[180px] md:max-w-none text-[#171717]">
            {sectionTitles[activeSection] || 'Platform'}
          </span>
        </div>

        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DDD6F8] text-[#4C3B9E] shrink-0">
          v0.1.0-alpha
        </span>
      </div>

      {/* Middle: Rounded Pill Search Input with Ctrl+K - Flexibly sized */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-3 min-w-0">
        <div className="w-full relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search telemetry, anchors, solvers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-18 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-xs font-medium text-[#171717] placeholder-[#888888] focus:outline-none focus:border-[#D9F56F] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#888888] bg-[#F1F3F5] border border-[#E2E8F0]">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Actions & Utilities */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Environment Pill - Ultra-wide screens only */}
        <div className="hidden min-[1680px]:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#475569] shadow-2xs">
          <Box className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Environment</span>
          <span className="font-bold text-[#0F172A]">Research Hall B</span>
        </div>

        {/* Room Size Dropdown Button & Popover */}
        <div className="relative" ref={roomMenuRef}>
          <button
            onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#475569] shadow-2xs transition-all cursor-pointer select-none active:scale-98"
            title="Configure testbed room dimensions"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            <span className="hidden sm:inline">Room</span>
            <span className="font-bold text-[#0F172A] whitespace-nowrap">
              {activeScenario.room.width}×{activeScenario.room.length}m
            </span>
            <ChevronDown className={`w-3 h-3 text-[#94A3B8] transition-transform ${isRoomMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Interactive Room Size Popover */}
          {isRoomMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Room Dimensions</h4>
                    <p className="text-[10px] text-[#64748B]">Configure testbed spatial boundary</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRoomMenuOpen(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Room Presets */}
              <div className="py-2.5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold block mb-1">
                  Preset Test Environments
                </span>
                {ROOM_PRESETS.map((preset) => {
                  const isCurrent =
                    activeScenario.room.width === preset.width &&
                    activeScenario.room.length === preset.length &&
                    activeScenario.room.height === preset.height;

                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyRoomDimensions(preset.width, preset.length, preset.height)}
                      className={`w-full text-left p-2 rounded-xl border text-xs transition-all flex items-start justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#166534]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{preset.name}</span>
                          {isCurrent && <Check className="w-3 h-3 text-[#16A34A]" />}
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5">{preset.description}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold shrink-0 bg-white px-2 py-0.5 rounded border border-[#E2E8F0] ml-2">
                        {preset.width}×{preset.length}m
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Dimensions Form */}
              <div className="pt-2.5 border-t border-[#F1F5F9]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold block mb-2">
                  Custom Bounds (Meters)
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-[#64748B] block mb-0.5">Width (X)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="4"
                      max="60"
                      value={customW}
                      onChange={(e) => setCustomW(e.target.value)}
                      className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center font-bold focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B] block mb-0.5">Length (Y)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="4"
                      max="60"
                      value={customL}
                      onChange={(e) => setCustomL(e.target.value)}
                      className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center font-bold focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B] block mb-0.5">Height (Z)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="2.4"
                      max="15"
                      value={customH}
                      onChange={(e) => setCustomH(e.target.value)}
                      className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center font-bold focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    applyRoomDimensions(
                      parseFloat(customW) || 12.0,
                      parseFloat(customL) || 8.0,
                      parseFloat(customH) || 3.5
                    )
                  }
                  className="w-full mt-3 py-1.5 rounded-xl bg-[#D9F56F] hover:bg-[#cbe85f] text-[#171717] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Apply Room Dimensions</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Anchors Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#475569] shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Anchors</span>
          <span className="font-bold text-[#0F172A]">6 Active</span>
        </div>

        {/* Notification Bell Button & Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white text-[#555555] hover:text-[#171717] hover:bg-[#F9F9F9] flex items-center justify-center transition-colors relative shadow-2xs cursor-pointer active:scale-95"
            title="System & Telemetry Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700 font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-[#64748B]">Operational alerts and engine status</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline px-2 py-1"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="py-2 divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#94A3B8] font-mono">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-2.5 px-2 rounded-xl transition-colors flex items-start gap-2.5 group relative ${
                        !notif.read ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Info className="w-4 h-4 text-[#3B82F6]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs ${!notif.read ? 'font-bold text-[#0F172A]' : 'font-medium text-[#475569]'}`}>
                            {notif.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[9px] font-mono text-[#94A3B8] mt-1 block">
                          {notif.timestamp}
                        </span>
                      </div>

                      <button
                        onClick={() => dismissNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#94A3B8] hover:text-rose-600 transition-opacity absolute top-2 right-2"
                        title="Dismiss notification"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>Engine: 20.0 Hz active link</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[#94A3B8] hover:text-[#0F172A]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Diagnostic Action Button */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          onClick={() => setQuickRunModalOpen(true)}
          className="shrink-0 whitespace-nowrap shadow-xs cursor-pointer active:scale-98"
        >
          Run Diagnostic
        </Button>
      </div>
    </header>
  );
};
