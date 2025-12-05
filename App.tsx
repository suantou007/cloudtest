
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tab, TierFilter, OSFilter, ModeFilter, DeviceMetric, DetailedMetricValues } from './types';
import { ChevronLeft, ChevronRight, SortIcon, XIcon } from './components/Icons';

// --- Components ---

const FilterButton = <T extends string>({
  options,
  active,
  onChange,
  label
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (val: T) => void;
  label: string;
}) => {
  return (
    <div className="flex items-center mb-4">
      <span className="text-gray-700 font-medium mr-4 min-w-[70px] text-sm">{label}</span>
      <div className="flex space-x-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1 rounded-sm text-sm border transition-colors ${
              active === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Theme configuration
type ThemeType = 'blue' | 'emerald' | 'violet' | 'amber';

const THEMES: Record<ThemeType, { 
  slideBg: string; 
  activeTabBg: string;
  activeTabBorder: string;
  activeTabText: string;
  bar: string; 
  titleText: string;
}> = {
  blue: { 
    slideBg: 'bg-blue-50', 
    activeTabBg: 'bg-blue-50',
    activeTabBorder: 'border-blue-600',
    activeTabText: 'text-blue-900',
    bar: 'bg-blue-500', 
    titleText: 'text-blue-900',
  },
  emerald: { 
    slideBg: 'bg-emerald-50', 
    activeTabBg: 'bg-emerald-50',
    activeTabBorder: 'border-emerald-600',
    activeTabText: 'text-emerald-900',
    bar: 'bg-emerald-500', 
    titleText: 'text-emerald-900',
  },
  violet: { 
    slideBg: 'bg-violet-50', 
    activeTabBg: 'bg-violet-50',
    activeTabBorder: 'border-violet-600',
    activeTabText: 'text-violet-900',
    bar: 'bg-violet-500', 
    titleText: 'text-violet-900',
  },
  amber: { 
    slideBg: 'bg-amber-50', 
    activeTabBg: 'bg-amber-50',
    activeTabBorder: 'border-amber-600',
    activeTabText: 'text-amber-900',
    bar: 'bg-amber-500', 
    titleText: 'text-amber-900',
  },
};

interface ScoreCardProps {
  label: string;
  score: number;
  isActive: boolean;
  theme: ThemeType;
  onClick: () => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  score,
  isActive,
  theme,
  onClick,
}) => {
  const themeStyles = THEMES[theme];
  
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 flex-1 transition-all duration-300 border-b-4 focus:outline-none ${
        isActive 
          ? `${themeStyles.activeTabBg} ${themeStyles.activeTabBorder}` 
          : 'bg-white border-transparent hover:bg-gray-50'
      }`}
    >
      <div className="text-gray-500 text-sm mb-2">{label}</div>
      <div className={`text-4xl font-bold ${isActive ? themeStyles.activeTabText : 'text-gray-800'}`}>{score}</div>
    </button>
  );
};

interface MetricDetailCardProps {
  title: string;
  value: number;
  unit: string;
  max: number;
  avg?: number;
  isCritical?: boolean;
  theme: ThemeType;
}

const MetricDetailCard: React.FC<MetricDetailCardProps> = ({
  title,
  value,
  unit,
  max,
  avg,
  isCritical = false,
  theme,
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const themeStyles = THEMES[theme];
  
  return (
    <div className="bg-white p-5 flex flex-col justify-between h-40 w-64 rounded-lg shadow-sm border border-gray-100">
      <div className={`${themeStyles.titleText} font-medium text-xs mb-1 opacity-80 uppercase tracking-wide`}>{title}</div>
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-gray-800 mr-1">{value}</span>
        <span className="text-gray-400 text-sm font-medium">{unit}</span>
      </div>
      
      {/* Visual Bar Simulation */}
      <div className="relative w-full h-10 mt-auto">
         {/* Background track marks */}
        <div className="absolute bottom-2 left-0 right-0 h-2 bg-gray-100 rounded-full overflow-hidden">
             <div 
                className={`h-full rounded-full ${isCritical ? 'bg-red-500' : themeStyles.bar}`} 
                style={{ width: `${percentage}%` }}
             ></div>
        </div>
        {/* Markers simulation */}
        <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
            <span>{avg ? `AVG: ${avg}` : ''}</span>
            <span>{max ? `MAX: ${max}` : ''}</span>
        </div>
        {/* Little ticks on bar */}
        {avg && (
             <div className="absolute bottom-1 h-4 w-0.5 bg-gray-800/20 z-10" style={{ left: '40%' }}></div>
        )}
      </div>
    </div>
  );
};

const TableRow: React.FC<{ row: DeviceMetric; onCompare: (row: DeviceMetric) => void }> = ({ row, onCompare }) => (
  <tr className="hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
    <td className="py-4 px-4 text-gray-600 text-sm font-mono">{row.id}</td>
    <td className="py-4 px-4 text-gray-600 text-sm">{row.os}</td>
    <td className="py-4 px-4 text-gray-600 text-sm">{row.model}</td>
    <td className="py-4 px-4">
      <span
        className={`px-2 py-0.5 text-xs rounded ${
          row.tier === 'Mid'
            ? 'bg-orange-100 text-orange-600'
            : row.tier === 'High'
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {row.tier === 'High' ? '高档' : row.tier === 'Mid' ? '中档' : '低档'}
      </span>
    </td>
    <td className={`py-4 px-4 text-sm ${row.isSlow ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
      {row.startupTime}
    </td>
    <td className="py-4 px-4 text-gray-600 text-sm">{row.renderTime}</td>
    <td className="py-4 px-4 text-gray-600 text-sm">{row.interactiveTime}</td>
    <td className="py-4 px-4 text-sm">
      <div className="flex space-x-3">
        <button className="text-blue-600 hover:text-blue-800 font-medium">查看详情</button>
        <button 
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => onCompare(row)}
        >
          对比指标
        </button>
        <button className="text-blue-600 hover:text-blue-800 font-medium">日志</button>
      </div>
    </td>
  </tr>
);

// --- Helper Functions ---

const generateDeviceData = (count: number): DeviceMetric[] => {
  const models = [
    { name: 'iPhone 13 Pro', os: 'IOS-15.0', type: 'High' },
    { name: 'iPhone 12', os: 'IOS-14.7', type: 'High' },
    { name: 'iPhone X', os: 'IOS-13.6', type: 'Mid' },
    { name: 'Galaxy S21', os: 'Android-12', type: 'High' },
    { name: 'Pixel 5', os: 'Android-11', type: 'Mid' },
    { name: 'Oppo Find X3', os: 'Android-11', type: 'High' },
    { name: 'Vivo X60', os: 'Android-11', type: 'Mid' },
    { name: 'Huawei P40', os: 'Android-10', type: 'Mid' },
    { name: 'Xiaomi 11', os: 'Android-11', type: 'High' },
    { name: 'Redmi Note 9', os: 'Android-10', type: 'Low' },
    { name: 'Galaxy A52', os: 'Android-11', type: 'Low' },
    { name: 'iPhone 8', os: 'IOS-12.4', type: 'Low' },
  ];

  return Array.from({ length: count }).map((_, i) => {
    const modelInfo = models[i % models.length];
    const isSlow = modelInfo.type === 'Low' || (modelInfo.type === 'Mid' && Math.random() > 0.7);
    
    // Generate scores based on tier
    const baseScore = modelInfo.type === 'High' ? 85 : modelInfo.type === 'Mid' ? 70 : 50;
    const scores = {
      startup: Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15 - 5))),
      runtime: Math.min(100, Math.max(0, baseScore + 5 + Math.floor(Math.random() * 10 - 5))),
      network: Math.min(100, Math.max(0, 60 + Math.floor(Math.random() * 40))), // Network varies more
      compatibility: Math.random() > 0.9 ? 80 : 100, // Mostly 100 unless issue
    };

    const details: DetailedMetricValues = {
      startup: {
        total: modelInfo.type === 'High' ? 2000 + Math.random() * 1000 : 4000 + Math.random() * 3000,
        download: 300 + Math.floor(Math.random() * 200),
        injection: modelInfo.type === 'High' ? 800 + Math.random() * 400 : 1500 + Math.random() * 1000,
        render: modelInfo.type === 'High' ? 1000 + Math.random() * 500 : 2500 + Math.random() * 2000,
      },
      runtime: {
        fps: modelInfo.type === 'High' ? 58 + Math.random() * 2 : 40 + Math.random() * 15,
        jank: modelInfo.type === 'High' ? Math.random() : Math.random() * 5,
        cpu: 20 + Math.floor(Math.random() * 40),
        memory: 200 + Math.floor(Math.random() * 600),
      },
      network: {
        rtt: 20 + Math.floor(Math.random() * 80),
        throughput: parseFloat((1 + Math.random() * 4).toFixed(1)),
        loss: parseFloat((Math.random() * 0.5).toFixed(2)),
      },
      compatibility: {
        jsError: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        crash: Math.random() > 0.95 ? 1 : 0,
      }
    };

    return {
      id: `7f${Math.floor(Math.random() * 10000000)}`,
      os: modelInfo.os,
      model: modelInfo.name,
      tier: modelInfo.type as 'High' | 'Mid' | 'Low',
      startupTime: `${Math.floor(details.startup.total / 20)}ms`, // Mock logic
      renderTime: `${Math.floor(details.startup.render)}ms`,
      interactiveTime: `${Math.floor(Math.random() * 200)}`,
      isSlow,
      scores,
      details,
    };
  });
};

const AVERAGE_METRICS: DetailedMetricValues = {
  startup: { total: 4871, download: 492, injection: 1825, render: 3161 },
  runtime: { fps: 58, jank: 2.1, cpu: 32, memory: 450 },
  network: { rtt: 45, throughput: 1.2, loss: 0.1 },
  compatibility: { jsError: 0, crash: 0 }
};

// --- Main App ---

const App = () => {
  // State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Details);
  const [tierFilter, setTierFilter] = useState<TierFilter>(TierFilter.All);
  const [osFilter, setOsFilter] = useState<OSFilter>(OSFilter.All);
  const [modeFilter, setModeFilter] = useState<ModeFilter>(ModeFilter.HighPerformance);
  
  // Selection State
  const [selectedDevice, setSelectedDevice] = useState<DeviceMetric | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Scroll Sync State
  const [activeCategory, setActiveCategory] = useState<string>('startup');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Data
  const rawData: DeviceMetric[] = useMemo(() => generateDeviceData(25), []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      // Tier Filter
      if (tierFilter !== TierFilter.All && item.tier.toLowerCase() !== tierFilter) return false;
      
      // OS Filter
      if (osFilter !== OSFilter.All) {
         if (osFilter === OSFilter.iOS && !item.os.toLowerCase().includes('ios')) return false;
         if (osFilter === OSFilter.Android && !item.os.toLowerCase().includes('android')) return false;
      }
      
      // Mode Filter (Mocking this as there is no mode in data, assume all match for now or just skip)
      return true;
    });
  }, [rawData, tierFilter, osFilter, modeFilter]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tierFilter, osFilter, modeFilter]);


  // Determine which metrics to show (Average vs Selected)
  const currentMetrics = selectedDevice ? selectedDevice.details : AVERAGE_METRICS;
  const currentScores = selectedDevice ? selectedDevice.scores : {
      startup: 78, runtime: 90, network: 63, compatibility: 77
  };

  // Detailed Metrics Data Configuration
  const categoryConfig = [
    { 
      id: 'startup', 
      label: '启动性能分', 
      score: currentScores.startup,
      theme: 'blue' as ThemeType,
      metrics: [
        { title: "总启动耗时", value: Math.round(currentMetrics.startup.total), unit: "ms", max: 8860, avg: 3320, isCritical: false },
        { title: "代码包下载耗时", value: Math.round(currentMetrics.startup.download), unit: "ms", max: 900, avg: 500, isCritical: false },
        { title: "游戏代码注入耗时", value: Math.round(currentMetrics.startup.injection), unit: "ms", max: 3700, avg: 1400, isCritical: true },
        { title: "首屏渲染耗时", value: Math.round(currentMetrics.startup.render), unit: "ms", max: 8200, avg: 4250, isCritical: false },
      ]
    },
    { 
      id: 'runtime', 
      label: '运行性能', 
      score: currentScores.runtime,
      theme: 'emerald' as ThemeType,
      metrics: [
        { title: "平均帧率", value: Math.round(currentMetrics.runtime.fps), unit: "FPS", max: 60, avg: 55, isCritical: false },
        { title: "Jank卡顿率", value: currentMetrics.runtime.jank.toFixed(1), unit: "%", max: 10, avg: 1.5, isCritical: false },
        { title: "CPU占用均值", value: Math.round(currentMetrics.runtime.cpu), unit: "%", max: 100, avg: 28, isCritical: false },
        { title: "内存占用峰值", value: Math.round(currentMetrics.runtime.memory), unit: "MB", max: 1024, avg: 380, isCritical: true },
      ]
    },
    { 
      id: 'network', 
      label: '网络性能', 
      score: currentScores.network,
      theme: 'violet' as ThemeType,
      metrics: [
        { title: "平均RTT延迟", value: Math.round(currentMetrics.network.rtt), unit: "ms", max: 200, avg: 30, isCritical: false },
        { title: "下行吞吐量", value: currentMetrics.network.throughput.toFixed(1), unit: "MB/s", max: 5, avg: 2.5, isCritical: true },
        { title: "丢包率", value: currentMetrics.network.loss.toFixed(2), unit: "%", max: 5, avg: 0.05, isCritical: false },
      ]
    },
    { 
      id: 'compatibility', 
      label: '兼容性', 
      score: currentScores.compatibility,
      theme: 'amber' as ThemeType,
      metrics: [
        { title: "JS异常次数", value: currentMetrics.compatibility.jsError, unit: "次", max: 10, avg: 0.2, isCritical: false },
        { title: "Crash次数", value: currentMetrics.compatibility.crash, unit: "次", max: 1, avg: 0, isCritical: false },
      ]
    },
  ];

  // Handle scrolling to update active category
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;
    
    // Calculate current page index
    const index = Math.round(scrollLeft / width);
    
    if (index >= 0 && index < categoryConfig.length) {
        const newActiveId = categoryConfig[index].id;
        if (newActiveId !== activeCategory) {
            setActiveCategory(newActiveId);
        }
    }
  };

  const scrollToGroup = (index: number, id: string) => {
      if (scrollContainerRef.current) {
          const width = scrollContainerRef.current.offsetWidth;
          scrollContainerRef.current.scrollTo({
              left: width * index,
              behavior: 'smooth'
          });
      }
      setActiveCategory(id);
  };

  const handleCompare = (row: DeviceMetric) => {
    setSelectedDevice(row);
    // Smooth scroll to top to see metrics
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSelection = () => {
    setSelectedDevice(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans pb-10">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center bg-white sticky top-0 z-30">
        <button className="mr-4 text-gray-500 hover:text-gray-800">
          <ChevronLeft />
        </button>
        <h1 className="text-base font-medium text-gray-700">云测试服务</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab(Tab.Overview)}
            className={`pb-3 text-sm font-medium ${
              activeTab === Tab.Overview
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab(Tab.Details)}
            className={`pb-3 text-sm font-medium ${
              activeTab === Tab.Details
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            设备详情
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <FilterButton
                label="设备档位"
                active={tierFilter}
                onChange={setTierFilter}
                options={[
                  { value: TierFilter.All, label: '全部' },
                  { value: TierFilter.High, label: '高档' },
                  { value: TierFilter.Mid, label: '中档' },
                  { value: TierFilter.Low, label: '低档' },
                ]}
              />
              <FilterButton
                label="操作系统"
                active={osFilter}
                onChange={setOsFilter}
                options={[
                  { value: OSFilter.All, label: '全部' },
                  { value: OSFilter.Android, label: 'Android' },
                  { value: OSFilter.iOS, label: 'IOS' },
                ]}
              />
              <FilterButton
                label="运行模式"
                active={modeFilter}
                onChange={setModeFilter}
                options={[
                  { value: ModeFilter.Normal, label: '普通模式' },
                  { value: ModeFilter.HighPerformance, label: '高性能/高性能+' },
                ]}
              />
            </div>
            {/* Visual element placeholder */}
            <div className="w-32 hidden lg:block"></div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-white border border-gray-200 rounded-t-lg p-2 flex items-center justify-between">
           <div className="flex items-center">
             {selectedDevice ? (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-sm text-xs flex items-center mr-3 font-medium transition-all">
                  {selectedDevice.model} {selectedDevice.os}
                  <button onClick={clearSelection} className="ml-2 text-blue-400 hover:text-blue-600">
                      <XIcon className="w-3 h-3"/>
                  </button>
                </span>
             ) : (
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-sm text-xs flex items-center mr-3 font-medium">
                  平均值
                </span>
             )}
             
             <span className="text-gray-400 text-xs">不同档位机型和系统的参考指标数值不同，当前展示分数为{selectedDevice ? '该设备实测值' : '平均值'}</span>
           </div>
        </div>

        {/* Score Overview (Navigation) */}
        <div className="flex border border-t-0 border-gray-200 bg-white sticky top-[65px] z-20 shadow-sm">
          {categoryConfig.map((cat, index) => (
             <ScoreCard 
                key={cat.id}
                label={cat.label} 
                score={cat.score} 
                theme={cat.theme}
                isActive={activeCategory === cat.id}
                onClick={() => scrollToGroup(index, cat.id)}
             />
          ))}
        </div>

        {/* Detailed Metrics Carousel */}
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-gray-200 border-t-0 mb-8"
            style={{ scrollBehavior: 'smooth' }}
        >
          {categoryConfig.map((cat) => (
             <div 
                key={cat.id} 
                id={`group-${cat.id}`} 
                className={`w-full flex-shrink-0 snap-center flex justify-center items-center gap-4 py-10 transition-colors duration-500 ${THEMES[cat.theme].slideBg}`}
            >
                {cat.metrics.map((metric: any, idx: number) => (
                  <MetricDetailCard
                    key={`${cat.id}-${idx}`}
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    max={metric.max}
                    avg={metric.avg}
                    isCritical={metric.isCritical}
                    theme={cat.theme}
                  />
                ))}
             </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">设备ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作系统</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备型号</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                    <div className="flex items-center">
                      档位 <SortIcon className="ml-1 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                    <div className="flex items-center">
                      总启动耗时 <SortIcon className="ml-1 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                    <div className="flex items-center">
                      首屏渲染耗时 <SortIcon className="ml-1 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                    <div className="flex items-center">
                      可交互耗时 <SortIcon className="ml-1 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <TableRow key={`${row.id}-${index}`} row={row} onCompare={handleCompare} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500">
                      没有找到符合条件的设备
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  显示第 <span className="font-medium">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> 条 - 第 <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> 条，共 <span className="font-medium">{totalItems}</span> 条
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
