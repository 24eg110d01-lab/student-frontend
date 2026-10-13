import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { studentService } from '../services/studentService';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  UserCheck,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap,
  Users,
  Search,
  CheckCircle2
} from 'lucide-react';

export const EnrollmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Enroll modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Drop modal
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [studentToDrop, setStudentToDrop] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [courseList, studentList] = await Promise.all([
          courseService.getCourses(),
          studentService.getStudents({ size: 100 }),
        ]);
        setCourses(courseList || []);
        setAllStudents(studentList.content || []);

        const initialCourse = searchParams.get('courseId') || courseList[0]?.id || '';
        setSelectedCourseId(initialCourse);
      } catch {
        toast.error('Failed to load courses or students');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchEnrolled = async () => {
      try {
        setLoadingStudents(true);
        const data = await courseService.getEnrolledStudents(selectedCourseId);
        setEnrolledStudents(data || []);
      } catch {
        toast.error('Failed to load enrolled students');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchEnrolled();
  }, [selectedCourseId]);

  const handleCourseChange = (id) => {
    setSelectedCourseId(id);
    setSearchParams({ courseId: id });
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentToEnroll) {
      toast.error('Please select a student to enroll');
      return;
    }
    setSubmitting(true);
    try {
      await courseService.enrollStudents(selectedCourseId, [selectedStudentToEnroll]);
      toast.success('Student enrolled successfully');
      setIsEnrollModalOpen(false);
      setSelectedStudentToEnroll('');
      const updated = await courseService.getEnrolledStudents(selectedCourseId);
      setEnrolledStudents(updated || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDropConfirm = async () => {
    if (!studentToDrop) return;
    setSubmitting(true);
    try {
      await courseService.dropStudent(selectedCourseId, studentToDrop.id);
      toast.success('Student dropped from course');
      setIsDropModalOpen(false);
      setStudentToDrop(null);
      const updated = await courseService.getEnrolledStudents(selectedCourseId);
      setEnrolledStudents(updated || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to drop student');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s.id));

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading enrollment system..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Course Enrollment Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assign students to courses, manage class rosters, and drop registrations
          </p>
        </div>

        {selectedCourseId && (
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Enroll Student
          </button>
        )}
      </div>

      {/* Course Selector Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
            Select Course:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name} ({c.department})
              </option>
            ))}
          </select>
        </div>

        {currentCourse && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
              <span className="text-slate-400 block text-[10px] uppercase">Instructor</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                {currentCourse.teacherName || 'Unassigned'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900">
              <span className="text-slate-400 block text-[10px] uppercase">Enrolled Students</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {enrolledStudents.length} Students
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900">
              <span className="text-slate-400 block text-[10px] uppercase">Credits</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                {currentCourse.credits} Credits
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Students Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Class Roster ({enrolledStudents.length} students)
          </h3>
        </div>

        {loadingStudents ? (
          <LoadingSpinner text="Fetching enrolled roster..." />
        ) : enrolledStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              No students enrolled in this course yet
            </p>
            <p className="text-xs mt-1">Click "Enroll Student" above to add students to this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {enrolledStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {s.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {s.department}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      Year {s.year}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setStudentToDrop(s);
                          setIsDropModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Drop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title={`Enroll Student into ${currentCourse?.code}`}
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Student to Enroll:
            </label>
            {availableStudents.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                All available students are already enrolled in this course.
              </p>
            ) : (
              <select
                required
                value={selectedStudentToEnroll}
                onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Student --</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber} - {s.firstName} {s.lastName} ({s.department})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || availableStudents.length === 0}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Drop Student Confirmation Modal */}
      <Modal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
        title="Confirm Drop Student"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to drop student{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {studentToDrop?.firstName} {studentToDrop?.lastName}
            </span>{' '}
            from <span className="font-bold">{currentCourse?.code}</span>?
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setIsDropModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDropConfirm}
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
            >
              {submitting ? 'Dropping...' : 'Confirm Drop'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
