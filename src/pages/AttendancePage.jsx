import React, { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { attendanceService } from '../services/attendanceService';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  CalendarCheck2,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Users
} from 'lucide-react';

export const AttendancePage = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses();
        setCourses(data || []);
        if (data && data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    const loadRosterAndAttendance = async () => {
      try {
        setLoading(true);
        const [enrolled, existing] = await Promise.all([
          courseService.getEnrolledStudents(selectedCourseId),
          attendanceService.getAttendanceByCourse(selectedCourseId, date),
        ]);

        setStudents(enrolled || []);

        const initialStatus = {};
        const initialRemarks = {};

        // Default everyone to PRESENT if not recorded
        (enrolled || []).forEach((s) => {
          initialStatus[s.id] = 'PRESENT';
          initialRemarks[s.id] = '';
        });

        (existing || []).forEach((record) => {
          initialStatus[record.studentId] = record.status;
          initialRemarks[record.studentId] = record.remarks || '';
        });

        setAttendanceMap(initialStatus);
        setRemarksMap(initialRemarks);
      } catch {
        toast.error('Failed to load attendance sheet');
      } finally {
        setLoading(false);
      }
    };

    loadRosterAndAttendance();
  }, [selectedCourseId, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarksChange = (studentId, text) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: text }));
  };

  const setAllStatus = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourseId || students.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        date: date,
        attendances: students.map((s) => ({
          studentId: s.id,
          status: attendanceMap[s.id] || 'PRESENT',
          remarks: remarksMap[s.id] || '',
        })),
      };

      await attendanceService.markBulkAttendance(payload);
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Attendance Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record single-click attendance sessions for enrolled students
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {/* Control Filters */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Bulk Action Buttons & Counters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 mr-2 text-xs font-semibold">
            <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Present: {presentCount}
            </span>
            <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              Absent: {absentCount}
            </span>
            <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Late: {lateCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAllStatus('PRESENT')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => setAllStatus('ABSENT')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading student attendance roster..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              No students enrolled in this course
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {students.map((s) => {
                  const currentStatus = attendanceMap[s.id] || 'PRESENT';
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {s.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {s.department}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'PRESENT')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'ABSENT')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'LATE')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={remarksMap[s.id] || ''}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
