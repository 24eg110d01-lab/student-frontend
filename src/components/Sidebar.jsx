import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Award,
  UserCheck,
  School,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, isTeacher, isStudent } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: GraduationCap },
    { name: 'Teachers', path: '/teachers', icon: Users },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Enrollments', path: '/enrollments', icon: UserCheck },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck2 },
    { name: 'Grades & GPA', path: '/grades', icon: Award },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Students', path: '/students', icon: GraduationCap },
    { name: 'Enrollments', path: '/enrollments', icon: UserCheck },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck2 },
    { name: 'Grades & GPA', path: '/grades', icon: Award },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile & Summary', path: '/portal', icon: GraduationCap },
    { name: 'My Courses', path: '/portal/courses', icon: BookOpen },
    { name: 'My Attendance', path: '/portal/attendance', icon: CalendarCheck2 },
    { name: 'My Grades & Report', path: '/portal/grades', icon: Award },
  ];

  let links = studentLinks;
  if (isAdmin) {
    links = adminLinks;
  } else if (isTeacher) {
    links = teacherLinks;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                EduManager
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                School Suite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/dashboard' || link.path === '/portal'}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Student Management System v1.0
          </p>
        </div>
      </aside>
    </>
  );
};
