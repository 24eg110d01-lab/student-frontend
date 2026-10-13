import React, { useEffect, useState } from 'react';
import { studentPortalService } from '../services/studentPortalService';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  TrendingUp
} from 'lucide-react';

export const StudentPortalPage = () => {
  const toast = useToast();
  const location = useLocation();

  // Determine active tab from URL path
  const getInitialTab = () => {
    if (location.pathname.includes('/courses')) return 'courses';
    if (location.pathname.includes('/attendance')) return 'attendance';
    if (location.pathname.includes('/grades')) return 'grades';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [report, setReport] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const [summaryData, coursesData, attendanceData] = await Promise.all([
          studentPortalService.getSummary(),
          studentPortalService.getCourses(),
          studentPortalService.getAttendance(),
        ]);
        setReport(summaryData);
        setCourses(coursesData || []);
        setAttendance(attendanceData);
      } catch (err) {
        toast.error('Failed to load student portal details');
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading student portal..." />;
  }

  const student = report?.student;
  const grades = report?.grades || [];
  const gpa = report?.gpa || 0.0;
  const attendanceRate = attendance?.attendancePercentage || report?.attendancePercentage || 0.0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl sm:text-3xl font-extrabold shadow-inner">
              {student?.firstName?.[0]}{student?.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {student?.firstName} {student?.lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {student?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="mt-1 text-sm text-indigo-200">
                Roll No: <span className="font-semibold text-white">{student?.rollNumber}</span> • {student?.department} (Year {student?.year})
              </p>
            </div>
          </div>

          {/* GPA Metric Banner */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 self-start sm:self-auto">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          Overview & Profile
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          My Attendance ({attendanceRate}%)
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'grades'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          My Grades & GPA
        </button>
      </div>

      {/* Tab 1: Overview & Profile */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Personal Profile
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{student?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{student?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{student?.department}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{student?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Academic Standing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Credits</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {report?.totalCredits || 0} Credits
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {attendanceRate}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">Enrolled Courses</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {courses.length} Courses
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Overall Progress
              </h4>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (gpa / 4.0) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 text-right">
                GPA Standing: {((gpa / 4.0) * 100).toFixed(0)}% of Max 4.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {courses.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm"
            >
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                {c.code}
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                {c.name}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {c.department} • {c.semester}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Instructor: <strong className="text-slate-900 dark:text-white">{c.teacherName || 'Assigned'}</strong></span>
                <span>Credits: <strong className="text-indigo-600">{c.credits}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Attendance */}
      {activeTab === 'attendance' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Attendance Log
              </h3>
              <p className="text-xs text-slate-500">
                Total Sessions: {attendance?.totalSessions || 0} • Present: {attendance?.presentCount || 0} • Absent: {attendance?.absentCount || 0} • Late: {attendance?.lateCount || 0}
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
              {attendanceRate}% Attendance Rate
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(attendance?.records || []).map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {r.date}
                    </td>
                    <td className="py-3 px-4">
                      {r.courseCode} - {r.courseName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : r.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {r.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Grades & GPA */}
      {activeTab === 'grades' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Academic Transcript & Assessment Results
            </h3>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold">
              Cumulative GPA: {gpa.toFixed(2)} / 4.0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">GPA Points</th>
                  <th className="py-3 px-4">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {g.courseCode} - {g.courseName}
                    </td>
                    <td className="py-3 px-4">{g.examType}</td>
                    <td className="py-3 px-4">{g.marksObtained} / {g.maxMarks}</td>
                    <td className="py-3 px-4">{g.percentage}%</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {g.gpaPoints?.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{g.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
