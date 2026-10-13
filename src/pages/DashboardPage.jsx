import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { studentPortalService } from '../services/studentPortalService';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Award,
  ArrowRight,
  RefreshCw,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const { isStudent, user } = useAuth();
  const toast = useToast();

  // Admin / Teacher state
  const [adminStats, setAdminStats] = useState(null);

  // Student state
  const [studentReport, setStudentReport] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (isStudent) {
        const [summary, courses, attendance] = await Promise.all([
          studentPortalService.getSummary().catch(() => null),
          studentPortalService.getCourses().catch(() => []),
          studentPortalService.getAttendance().catch(() => null),
        ]);
        setStudentReport(summary);
        setStudentCourses(courses || []);
        setStudentAttendance(attendance);
      } else {
        const data = await dashboardService.getStats();
        setAdminStats(data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isStudent]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." />;
  }

  // ==========================================
  // STUDENT DASHBOARD VIEW
  // ==========================================
  if (isStudent) {
    const student = studentReport?.student;
    const gpa = studentReport?.gpa || 0.0;
    const attendancePct = studentAttendance?.attendancePercentage || studentReport?.attendancePercentage || 0.0;
    const totalCredits = studentReport?.totalCredits || 0;
    const grades = studentReport?.grades || [];

    // Chart data for student attendance donut
    const studentAttendanceChart = [
      { name: 'Present', value: studentAttendance?.presentCount || 0, color: '#10b981' },
      { name: 'Late', value: studentAttendance?.lateCount || 0, color: '#f59e0b' },
      { name: 'Absent', value: studentAttendance?.absentCount || 0, color: '#f43f5e' },
    ].filter((item) => item.value > 0);

    // Chart data for student course grades
    const gradesChartData = grades.map((g) => ({
      course: g.courseCode || 'Course',
      marks: g.marksObtained || 0,
      percentage: g.percentage || 0,
      grade: g.grade || '',
    }));

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl sm:text-3xl font-black shadow-inner">
                {user?.name?.[0] || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Welcome back, {user?.name || 'Student'}!
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {student?.status || 'Active Student'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-indigo-200">
                  Roll No: <span className="font-semibold text-white">{student?.rollNumber || 'N/A'}</span> • {student?.department || 'Computer Science'} (Year {student?.year || 1})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 self-start md:self-auto">
              <div>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Cumulative GPA</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {gpa.toFixed(2)} <span className="text-sm font-normal text-indigo-200">/ 4.0</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/30 text-indigo-200">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Student KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Cumulative GPA"
            value={`${gpa.toFixed(2)} / 4.0`}
            icon={Award}
            color="indigo"
            subtitle={`${((gpa / 4.0) * 100).toFixed(0)}% Academic Performance`}
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendancePct}%`}
            icon={CalendarCheck2}
            color="emerald"
            subtitle={`${studentAttendance?.presentCount || 0} Present • ${studentAttendance?.lateCount || 0} Late • ${studentAttendance?.absentCount || 0} Absent`}
          />
          <StatCard
            title="Enrolled Courses"
            value={studentCourses.length}
            icon={BookOpen}
            color="blue"
            subtitle="Current semester syllabus"
          />
          <StatCard
            title="Earned Credits"
            value={`${totalCredits} Credits`}
            icon={GraduationCap}
            color="amber"
            subtitle="Degree requirement progress"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Grades Chart */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Assessment Scores & Performance
                </h3>
              </div>
              <span className="text-xs text-slate-400">Percentages</span>
            </div>

            <div className="h-64 w-full">
              {gradesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradesChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="course" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                      }}
                      formatter={(val, name, item) => [`${val}% (Grade: ${item.payload.grade})`, 'Score']}
                    />
                    <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} name="Score %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No graded assessments recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Attendance Breakdown Donut */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Attendance Session Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {studentAttendance?.totalSessions || 0} Total Sessions
              </span>
            </div>

            <div className="h-64 w-full">
              {studentAttendanceChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentAttendanceChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentAttendanceChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No attendance sessions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enrolled Courses & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                My Enrolled Courses ({studentCourses.length})
              </h3>
              <Link
                to="/portal/courses"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {studentCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500/50 transition-colors"
                >
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {c.code}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">
                    {c.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Instructor: {c.teacherName || 'Assigned Instructor'}
                  </p>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                    {c.credits} Credits • {c.semester}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Quick Shortcuts
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/portal"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span>My Profile & Summary</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/portal/attendance"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span>Full Attendance Records</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/portal/grades"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span>Official Grade Transcript</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ADMIN / TEACHER DASHBOARD VIEW
  // ==========================================
  const gradeData = adminStats?.gradeDistribution
    ? Object.entries(adminStats.gradeDistribution).map(([grade, count]) => ({
        grade,
        students: count,
      }))
    : [];

  const departmentData = adminStats?.departmentStudentCounts
    ? Object.entries(adminStats.departmentStudentCounts).map(([department, count]) => ({
        name: department,
        value: count,
      }))
    : [];

  const attendanceData = adminStats?.recentAttendanceTrends || [];
  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time enrollment, attendance statistics, and academic performance overview
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={adminStats?.totalStudents || 0}
          icon={GraduationCap}
          color="indigo"
          subtitle="Enrolled across all departments"
        />
        <StatCard
          title="Total Faculty"
          value={adminStats?.totalTeachers || 0}
          icon={Users}
          color="blue"
          subtitle="Active academic instructors"
        />
        <StatCard
          title="Active Courses"
          value={adminStats?.totalCourses || 0}
          icon={BookOpen}
          color="amber"
          subtitle="Current semester catalog"
        />
        <StatCard
          title="Avg Attendance"
          value={`${adminStats?.averageAttendance || 0}%`}
          icon={CalendarCheck2}
          color="emerald"
          subtitle="Weighted across all sessions"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Recent Attendance Trends
              </h3>
            </div>
            <span className="text-xs text-slate-400">Past Recorded Days</span>
          </div>

          <div className="h-72 w-full">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#presentGrad)" name="Present" />
                  <Area type="monotone" dataKey="absent" stroke="#f43f5e" fillOpacity={1} fill="url(#absentGrad)" name="Absent" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No attendance trend data recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Grade Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Letter Marks Breakdown</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Students by Department
            </h3>
          </div>

          <div className="h-64 w-full">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No department records available.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions & Workflow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/students"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Manage Students
                  </h4>
                  <p className="text-xs text-slate-500">Add, filter, or export student directory</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
            </Link>

            <Link
              to="/attendance"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Mark Attendance
                  </h4>
                  <p className="text-xs text-slate-500">Record single-click bulk attendance</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
            </Link>

            <Link
              to="/grades"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Record Grades & GPA
                  </h4>
                  <p className="text-xs text-slate-500">Auto letter grades & score calculations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
            </Link>

            <Link
              to="/courses"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Course Catalog
                  </h4>
                  <p className="text-xs text-slate-500">Manage syllabus, credits & instructors</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
