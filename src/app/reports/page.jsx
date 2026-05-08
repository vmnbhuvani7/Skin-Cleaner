'use client';

import React, { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { GET_TREATMENTS } from '@/graphql/queries/treatment';
import { GET_APPOINTMENT_STATS } from '@/graphql/queries/appointment';
import { GET_PATIENTS } from '@/graphql/queries/patient';
import {
  BarChart, Wallet, TrendingUp, Users, Activity,
  Calendar, CreditCard, PieChart, ShieldCheck,
  AlertCircle, IndianRupee, Zap, ChevronRight,
  Download, Printer, Search, Filter, ArrowUpRight,
  User, Clipboard, Clock
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import ViewToggle from '@/components/ui/ViewToggle';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { format, isToday, isSameMonth, isSameYear, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

export default function ReportsPage() {
  const [view, setView] = useState('grid');
  const [timeRange, setTimeRange] = useState('all'); // all, today, week, month, year
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: treatmentsData, loading: treatmentsLoading } = useQuery(GET_TREATMENTS, {
    variables: { filter: timeRange }
  });
  const { data: appointmentStats, loading: appointmentsLoading } = useQuery(GET_APPOINTMENT_STATS);
  const { data: patientsData, loading: patientsLoading } = useQuery(GET_PATIENTS, {
    variables: { page: 1, limit: 1 } // Just to get totalCount
  });

  const loading = treatmentsLoading || appointmentsLoading || patientsLoading;

  // Process data for analytics
  const analytics = useMemo(() => {
    if (!treatmentsData?.getTreatments) return {
      financials: { totalRevenue: 0, collected: 0, outstanding: 0, totalDiscounts: 0, completedTreatments: 0, activeTreatments: 0 },
      servicePerformance: [],
      doctorPerformance: [],
      filteredTreatments: []
    };

    let filtered = treatmentsData.getTreatments;
    const now = new Date();

    // Time Range Filtering
    if (timeRange !== 'all') {
      filtered = filtered.filter(t => {
        const date = t.createdAt ? new Date(t.createdAt) : null;
        if (!date) return false;

        if (timeRange === 'today') return isToday(date);

        if (timeRange === 'week') {
          return isWithinInterval(date, {
            start: startOfWeek(now, { weekStartsOn: 1 }), // Start from Monday
            end: endOfWeek(now, { weekStartsOn: 1 })
          });
        }

        if (timeRange === 'month') return isSameMonth(date, now);

        if (timeRange === 'year') return isSameYear(date, now);

        return true;
      });
    }

    // Search Filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.patient?.name?.toLowerCase().includes(query) ||
        t.service?.title?.toLowerCase().includes(query) ||
        t.doctor?.name?.toLowerCase().includes(query)
      );
    }

    const stats = {
      totalRevenue: 0,
      collected: 0,
      totalDiscounts: 0,
      completedTreatments: 0,
      activeTreatments: 0
    };

    const serviceMap = {};
    const doctorMap = {};

    filtered.forEach(t => {
      stats.totalRevenue += (t.finalAmount || 0);
      stats.totalDiscounts += (t.discount || 0);

      let tCollected = 0;
      if (t.sessions && t.sessions.length > 0) {
        tCollected = t.sessions.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
      }
      stats.collected += tCollected;

      if (t.status === 'COMPLETED') stats.completedTreatments++;
      else stats.activeTreatments++;

      // Service Performance
      const sTitle = t.service?.title || 'Unknown';
      if (!serviceMap[sTitle]) serviceMap[sTitle] = { title: sTitle, revenue: 0, count: 0 };
      serviceMap[sTitle].revenue += (t.finalAmount || 0);
      serviceMap[sTitle].count += 1;

      // Doctor Performance
      const dName = t.doctor?.name || 'Unknown';
      if (!doctorMap[dName]) doctorMap[dName] = { name: dName, revenue: 0, count: 0 };
      doctorMap[dName].revenue += (t.finalAmount || 0);
      doctorMap[dName].count += 1;
    });

    return {
      financials: {
        ...stats,
        outstanding: stats.totalRevenue - stats.collected
      },
      servicePerformance: Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      doctorPerformance: Object.values(doctorMap).sort((a, b) => b.revenue - a.revenue),
      filteredTreatments: filtered
    };
  }, [treatmentsData, timeRange, searchQuery]);

  const { financials, servicePerformance, doctorPerformance, filteredTreatments } = analytics;
  const stats = appointmentStats?.getAppointmentStats || {};
  const totalPatients = patientsData?.getPatients?.totalCount || 0;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const collectionRate = financials.totalRevenue > 0
    ? Math.round((financials.collected / financials.totalRevenue) * 100)
    : 0;

  const paginatedTreatments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTreatments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTreatments, currentPage]);

  const totalPages = Math.ceil(filteredTreatments.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 lg:pt-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-600/5 blur-[120px] rounded-full -z-0 pointer-events-none"></div>

        <div className="max-w-[1600px] mx-auto relative z-10 space-y-8 pb-20">

          {/* Enhanced Header with Filters */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest mb-3">
                  <BarChart size={12} /> BI Dashboard
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight leading-none">
                  Intelligence Reports
                </h1>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-[2rem] shadow-xl backdrop-blur-md">
              <div className="flex flex-1 w-full lg:w-auto items-center gap-3">
                <div className="relative flex-1 max-w-md group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-teal-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by patient, service or doctor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[var(--foreground)] placeholder:text-[var(--text-muted)] placeholder:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-2 bg-[var(--surface-hover)] p-1 rounded-2xl border border-[var(--border)] overflow-x-auto whitespace-nowrap scrollbar-none">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: 'year', label: 'This Year' }
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id)}
                      className={twMerge(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        timeRange === range.id
                          ? "bg-teal-600 text-white shadow-lg"
                          : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <div className="h-8 w-px bg-[var(--border)] hidden lg:block"></div>
                <ViewToggle mode={view} setMode={setView} />
              </div>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="space-y-8">
              {/* Financial Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-[2.5rem] p-8 shadow-2xl shadow-teal-500/20 relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Wallet size={200} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-teal-100 text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Target Revenue ({timeRange})</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white tracking-tighter">₹{formatAmount(financials.totalRevenue)}</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-teal-100 text-xs font-bold bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md w-fit border border-white/10">
                      <TrendingUp size={16} /> Projected Financial Inflow
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Liquidated Assets</p>
                      <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">₹{formatAmount(financials.collected)}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <CreditCard size={24} />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Efficiency Rate</p>
                      <p className="text-sm font-black text-emerald-500">{collectionRate}%</p>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[var(--surface-hover)] overflow-hidden p-0.5">
                      <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${collectionRate}%` }}></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Market Risk (Outstanding)</p>
                      <h3 className="text-4xl font-black text-rose-500 tracking-tighter">₹{formatAmount(financials.outstanding)}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-[1.25rem] bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Total Discounts</p>
                      <p className="text-lg font-black text-[var(--foreground)]">₹{formatAmount(financials.totalDiscounts)}</p>
                    </div>
                    <div className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-2">
                      <ShieldCheck size={12} /> Asset Protection
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Performance Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Performance Chart */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-[var(--foreground)] flex items-center gap-3">
                        <Zap className="text-amber-500" size={20} /> Top Services
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60 mt-1">By Revenue Generation</p>
                    </div>
                    <ArrowUpRight className="text-[var(--text-muted)] opacity-30" />
                  </div>

                  <div className="space-y-6">
                    {servicePerformance.length > 0 ? servicePerformance?.map((s, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold text-[var(--foreground)]">{s.title}</span>
                          <span className="text-xs font-black text-teal-500">₹{formatAmount(s.revenue)}</span>
                        </div>
                        <div className="w-full h-3 bg-[var(--surface-hover)] rounded-full overflow-hidden relative group">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000"
                            style={{ width: `${(s.revenue / (servicePerformance[0]?.revenue || 1)) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                              {s.count} treatments
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                        <Activity size={48} className="mb-4" />
                        <p className="text-sm font-bold">No data for this period</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Performance Analytics */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-[var(--foreground)] flex items-center gap-3">
                        <Users className="text-teal-500" size={20} /> Specialist Matrix
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60 mt-1">Individual Contribution</p>
                    </div>
                    <PieChart className="text-[var(--text-muted)] opacity-30" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctorPerformance.length > 0 ? doctorPerformance?.map((d, idx) => (
                      <div key={idx} className="bg-[var(--surface-hover)] border border-[var(--border)] p-5 rounded-3xl group hover:border-teal-500/30 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[var(--foreground)]">{d.name}</p>
                            <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{d.count} Cases</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 border-t border-[var(--border)]">
                           <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">Generated</p>
                           <p className="text-xl font-black text-[var(--foreground)]">₹{formatAmount(d.revenue)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 h-64 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                        <Users size={48} className="mb-4" />
                        <p className="text-sm font-bold">No specialist data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-xl font-black text-[var(--foreground)] flex items-center gap-3">
                      <Activity className="text-emerald-500" /> Operational Efficiency
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Active ({financials.activeTreatments})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Completed ({financials.completedTreatments})</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[250px] flex items-end justify-around gap-4">
                    {/* Dynamic Visual Indicator */}
                    <div className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full max-w-[200px] bg-gradient-to-t from-teal-600 to-teal-400 rounded-2xl relative transition-all duration-1000 group-hover:opacity-90"
                        style={{ height: `${(financials.activeTreatments / (financials.activeTreatments + financials.completedTreatments || 1)) * 100}%`, minHeight: '10%' }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-lg text-[10px] font-black text-teal-500 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          ACTIVE
                        </div>
                      </div>
                      <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Live Cases</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full max-w-[200px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-2xl relative transition-all duration-1000 group-hover:opacity-90"
                        style={{ height: `${(financials.completedTreatments / (financials.activeTreatments + financials.completedTreatments || 1)) * 100}%`, minHeight: '10%' }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-lg text-[10px] font-black text-emerald-500 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          SUCCESS
                        </div>
                      </div>
                      <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Settled Cases</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                    <Users size={120} className="absolute -right-4 -bottom-4 text-emerald-500 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                      <Users size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60 mb-2">Total Patient Ecosystem</p>
                    <h3 className="text-5xl font-black text-[var(--foreground)] tracking-tighter">{totalPatients}</h3>
                    <div className="mt-6 flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Verified Records
                    </div>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                    <Calendar size={120} className="absolute -right-4 -bottom-4 text-teal-500 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-6 border border-teal-500/20">
                      <Calendar size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60 mb-2">Daily Engagement</p>
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-5xl font-black text-[var(--foreground)] tracking-tighter">{stats.todayAppointments || 0}</h3>
                      <span className="text-[10px] font-black text-teal-500 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20 uppercase tracking-widest">
                        {stats.todayPending || 0} Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-xl">
              <DataTable
                columns={[
                  {
                    header: 'Patient', accessor: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                          {row.patient?.image ? <img src={row.patient.image} className="w-full h-full rounded-full object-cover" /> : <User size={16} className="text-teal-500" />}
                        </div>
                        <span className="font-bold text-sm">{row.patient?.name}</span>
                      </div>
                    )
                  },
                  {
                    header: 'Service', accessor: (row) => (
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--foreground)]">{row.service?.title}</span>
                      </div>
                    )
                  },
                  {
                    header: 'Doctor', accessor: (row) => (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[var(--text-muted)]" />
                        <span className="text-sm font-medium">{row.doctor?.name}</span>
                      </div>
                    )
                  },
                  {
                    header: 'Total Value', accessor: (row) => (
                      <span className="font-black text-sm">₹{formatAmount(row.finalAmount)}</span>
                    )
                  },
                  {
                    header: 'Paid', accessor: (row) => {
                      const paid = row.sessions?.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
                      return <span className="font-black text-sm text-emerald-500">₹{formatAmount(paid)}</span>
                    }
                  },
                  {
                    header: 'Status', accessor: (row) => (
                      <span className={twMerge(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        row.status === 'COMPLETED'
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-teal-500/10 text-teal-500 border-teal-500/20"
                      )}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    header: 'Date', accessor: (row) => (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{format(new Date(row.createdAt), 'dd MMM yyyy')}</span>
                        <span className="text-[10px] text-[var(--text-muted)] opacity-60">{format(new Date(row.createdAt), 'hh:mm a')}</span>
                      </div>
                    )
                  }
                ]}
                data={paginatedTreatments}
                loading={loading}
              />
              {totalPages > 1 && (
                <div className="p-6 border-t border-[var(--border)]">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
