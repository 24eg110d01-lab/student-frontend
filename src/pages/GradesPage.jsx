import React, { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { gradeService } from '../services/gradeService';
import { studentService } from '../services/studentService';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Award,
  Plus,
  Download,
  Trash2,
  Edit2,
  BookOpen,
  Calculator,
  Search
} from 'lucide-react';

export const GradesPage = () => {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    studentId: '',
    courseId: '',
    examType: 'MIDTERM',
    marksObtained: '',
    maxMarks: '100',
    semester: 'Fall 2026',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
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
    init();
  }, []);

  const fetchGradesAndRoster = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const [gradesData, roster] = await Promise.all([
        gradeService.getGradesByCourse(selectedCourseId),
        courseService.getEnrolledStudents(selectedCourseId),
      ]);
      setGrades(gradesData || []);
      setEnrolledStudents(roster || []);
    } catch {
      toast.error('Failed to load grade sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradesAndRoster();
  }, [selectedCourseId]);

  // Live grade calculations
  const marksObtainedNum = parseFloat(formData.marksObtained) || 0;
  const maxMarksNum = parseFloat(formData.maxMarks) || 100;
  const livePercentage = maxMarksNum > 0 ? Math.round((marksObtainedNum / maxMarksNum) * 1000) / 10 : 0;

  const calculateLetter = (pct) => {
    if (pct >= 90) return { letter: 'A+', gpa: 4.0 };
    if (pct >= 80) return { letter: 'A', gpa: 3.7 };
    if (pct >= 75) return { letter: 'B+', gpa: 3.3 };
    if (pct >= 70) return { letter: 'B', gpa: 3.0 };
    if (pct >= 65) return { letter: 'C+', gpa: 2.7 };
    if (pct >= 60) return { letter: 'C', gpa: 2.3 };
    if (pct >= 55) return { letter: 'D+', gpa: 1.7 };
    if (pct >= 50) return { letter: 'D', gpa: 1.0 };
    return { letter: 'F', gpa: 0.0 };
  };

  const liveResult = calculateLetter(livePercentage);

  const handleOpenAdd = () => {
    setFormData({
      id: null,
      studentId: enrolledStudents[0]?.id || '',
      courseId: selectedCourseId,
      examType: 'MIDTERM',
      marksObtained: '85',
      maxMarks: '100',
      semester: 'Fall 2026',
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grade) => {
    setFormData({
      id: grade.id,
      studentId: grade.studentId,
      courseId: grade.courseId,
      examType: grade.examType,
      marksObtained: grade.marksObtained.toString(),
      maxMarks: grade.maxMarks.toString(),
      semester: grade.semester || 'Fall 2026',
      remarks: grade.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    setSubmitting(true);
    try {
      await gradeService.saveGrade({
        ...formData,
        courseId: selectedCourseId,
        marksObtained: parseFloat(formData.marksObtained),
        maxMarks: parseFloat(formData.maxMarks),
      });
      toast.success('Grade recorded successfully');
      setIsModalOpen(false);
      fetchGradesAndRoster();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade record?')) return;
    try {
      await gradeService.deleteGrade(id);
      toast.success('Grade entry removed');
      fetchGradesAndRoster();
    } catch {
      toast.error('Failed to delete grade');
    }
  };

  const handleExportCsv = async () => {
    try {
      await gradeService.exportCsv();
      toast.success('Grades exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Grading & GPA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record assessment marks with automated percentage, letter grades, and GPA calculations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Grades CSV
          </button>
          <button
            onClick={handleOpenAdd}
            disabled={enrolledStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Enter Marks
          </button>
        </div>
      </div>

      {/* Course Selector Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
            Select Course:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            Recorded Marks: {grades.length} Entries
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
            Enrolled Students: {enrolledStudents.length} Students
          </span>
        </div>
      </div>

      {/* Grades Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching grade records..." />
        ) : grades.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              No grades recorded for this course yet
            </p>
            <p className="text-xs mt-1">Click "Enter Marks" to add exam or assignment scores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Exam Type</th>
                  <th className="py-3.5 px-4">Marks</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Letter Grade</th>
                  <th className="py-3.5 px-4">GPA Points</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {g.studentRollNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {g.studentName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {g.examType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {g.marksObtained} / {g.maxMarks}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {g.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          g.grade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : g.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : g.grade.startsWith('C')
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {g.gpaPoints?.toFixed(1)} / 4.0
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enter / Edit Marks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Student Grade' : 'Enter Assessment Marks'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Select Enrolled Student *
            </label>
            <select
              required
              disabled={!!formData.id}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
            >
              <option value="">-- Choose Student --</option>
              {enrolledStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Exam Type *
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="MIDTERM">MIDTERM</option>
                <option value="FINAL">FINAL</option>
                <option value="QUIZ">QUIZ</option>
                <option value="ASSIGNMENT">ASSIGNMENT</option>
                <option value="PROJECT">PROJECT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Max Marks *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Live Auto-Grade Result Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Computed Percentage</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">{livePercentage}%</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Letter Grade</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">{liveResult.letter}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">GPA Points</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{liveResult.gpa.toFixed(1)} / 4.0</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Excellent problem solving"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
