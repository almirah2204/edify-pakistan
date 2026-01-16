import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'PakSchool ERP',
    'app.tagline': 'Empowering Pakistani Education',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.logout': 'Logout',
    'common.profile': 'Profile',
    'common.settings': 'Settings',
    'common.notifications': 'Notifications',
    'common.welcome': 'Welcome',
    'common.dashboard': 'Dashboard',
    'common.all': 'All',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.pending': 'Pending',
    'common.approved': 'Approved',
    'common.rejected': 'Rejected',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.selectRole': 'Select Your Role',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Login successful!',
    'auth.signupSuccess': 'Account created! Waiting for admin approval.',
    'auth.pendingApproval': 'Your account is pending admin approval.',

    // Roles
    'role.admin': 'Admin',
    'role.teacher': 'Teacher',
    'role.student': 'Student',
    'role.parent': 'Parent',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.students': 'Students',
    'nav.teachers': 'Teachers',
    'nav.parents': 'Parents',
    'nav.classes': 'Classes',
    'nav.attendance': 'Attendance',
    'nav.homework': 'Homework',
    'nav.exams': 'Exams',
    'nav.results': 'Results',
    'nav.fees': 'Fees',
    'nav.salaries': 'Salaries',
    'nav.notices': 'Notices',
    'nav.timetable': 'Timetable',
    'nav.reports': 'Reports',
    'nav.users': 'User Management',
    'nav.analytics': 'Analytics',
    'nav.leaves': 'Leave Requests',
    'nav.children': 'My Children',

    // Dashboard
    'dashboard.totalStudents': 'Total Students',
    'dashboard.totalTeachers': 'Total Teachers',
    'dashboard.totalClasses': 'Total Classes',
    'dashboard.feeCollection': 'Fee Collection',
    'dashboard.attendance': 'Today\'s Attendance',
    'dashboard.pendingFees': 'Pending Fees',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.upcomingEvents': 'Upcoming Events',
    'dashboard.notifications': 'Notifications',
    'dashboard.overview': 'Overview',

    // Students
    'student.admissionNo': 'Admission No',
    'student.rollNo': 'Roll No',
    'student.class': 'Class',
    'student.section': 'Section',
    'student.guardian': 'Guardian',
    'student.dob': 'Date of Birth',
    'student.gender': 'Gender',
    'student.bloodGroup': 'Blood Group',
    'student.cnic': 'CNIC/B-Form',
    'student.addNew': 'Add New Student',
    'student.profile': 'Student Profile',

    // Teachers
    'teacher.employeeId': 'Employee ID',
    'teacher.department': 'Department',
    'teacher.qualification': 'Qualification',
    'teacher.subjects': 'Subjects',
    'teacher.assignedClasses': 'Assigned Classes',
    'teacher.joiningDate': 'Joining Date',
    'teacher.addNew': 'Add New Teacher',
    'teacher.profile': 'Teacher Profile',

    // Fees
    'fee.structure': 'Fee Structure',
    'fee.type': 'Fee Type',
    'fee.amount': 'Amount',
    'fee.dueDate': 'Due Date',
    'fee.paid': 'Paid',
    'fee.unpaid': 'Unpaid',
    'fee.partial': 'Partial',
    'fee.receipt': 'Receipt',
    'fee.generateSlip': 'Generate Fee Slip',
    'fee.collection': 'Fee Collection',
    'fee.tuition': 'Tuition Fee',
    'fee.admission': 'Admission Fee',
    'fee.exam': 'Exam Fee',
    'fee.transport': 'Transport Fee',
    'fee.library': 'Library Fee',
    'fee.sports': 'Sports Fee',
    'fee.lab': 'Lab Fee',
    'fee.misc': 'Miscellaneous',

    // Attendance
    'attendance.markAttendance': 'Mark Attendance',
    'attendance.present': 'Present',
    'attendance.absent': 'Absent',
    'attendance.late': 'Late',
    'attendance.leave': 'Leave',
    'attendance.monthly': 'Monthly Report',
    'attendance.daily': 'Daily Report',
    'attendance.percentage': 'Attendance %',

    // Exams
    'exam.createExam': 'Create Exam',
    'exam.examName': 'Exam Name',
    'exam.startDate': 'Start Date',
    'exam.endDate': 'End Date',
    'exam.totalMarks': 'Total Marks',
    'exam.passingMarks': 'Passing Marks',
    'exam.enterMarks': 'Enter Marks',
    'exam.marksheet': 'Marksheet',
    'exam.result': 'Result',
    'exam.grade': 'Grade',
    'exam.rank': 'Rank',
    'exam.percentage': 'Percentage',

    // Notices
    'notice.title': 'Title',
    'notice.content': 'Content',
    'notice.audience': 'Target Audience',
    'notice.sendPush': 'Send Push Notification',
    'notice.createNotice': 'Create Notice',
    'notice.urgent': 'Urgent',
    'notice.general': 'General',
    'notice.feeReminder': 'Fee Reminder',
    'notice.examAlert': 'Exam Alert',
  },
  ur: {
    // Common
    'app.name': 'پاک اسکول ای آر پی',
    'app.tagline': 'پاکستانی تعلیم کو بااختیار بنانا',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ',
    'common.delete': 'حذف کریں',
    'common.edit': 'ترمیم',
    'common.view': 'دیکھیں',
    'common.search': 'تلاش کریں...',
    'common.filter': 'فلٹر',
    'common.export': 'ایکسپورٹ',
    'common.download': 'ڈاؤن لوڈ',
    'common.upload': 'اپ لوڈ',
    'common.submit': 'جمع کرائیں',
    'common.back': 'واپس',
    'common.next': 'اگلا',
    'common.previous': 'پچھلا',
    'common.yes': 'ہاں',
    'common.no': 'نہیں',
    'common.actions': 'ایکشنز',
    'common.status': 'حیثیت',
    'common.date': 'تاریخ',
    'common.name': 'نام',
    'common.email': 'ای میل',
    'common.phone': 'فون',
    'common.address': 'پتہ',
    'common.logout': 'لاگ آؤٹ',
    'common.profile': 'پروفائل',
    'common.settings': 'ترتیبات',
    'common.notifications': 'اطلاعات',
    'common.welcome': 'خوش آمدید',
    'common.dashboard': 'ڈیش بورڈ',
    'common.all': 'سب',
    'common.active': 'فعال',
    'common.inactive': 'غیر فعال',
    'common.pending': 'زیر التواء',
    'common.approved': 'منظور شدہ',
    'common.rejected': 'مسترد',

    // Auth
    'auth.login': 'لاگ ان',
    'auth.signup': 'سائن اپ',
    'auth.email': 'ای میل ایڈریس',
    'auth.password': 'پاس ورڈ',
    'auth.confirmPassword': 'پاس ورڈ کی تصدیق',
    'auth.forgotPassword': 'پاس ورڈ بھول گئے؟',
    'auth.resetPassword': 'پاس ورڈ ری سیٹ کریں',
    'auth.selectRole': 'اپنا کردار منتخب کریں',
    'auth.noAccount': 'اکاؤنٹ نہیں ہے؟',
    'auth.hasAccount': 'پہلے سے اکاؤنٹ ہے؟',
    'auth.loginSuccess': 'لاگ ان کامیاب!',
    'auth.signupSuccess': 'اکاؤنٹ بن گیا! ایڈمن کی منظوری کا انتظار ہے۔',
    'auth.pendingApproval': 'آپ کا اکاؤنٹ ایڈمن کی منظوری کا منتظر ہے۔',

    // Roles
    'role.admin': 'ایڈمن',
    'role.teacher': 'استاد',
    'role.student': 'طالب علم',
    'role.parent': 'والدین',

    // Navigation
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.students': 'طلباء',
    'nav.teachers': 'اساتذہ',
    'nav.parents': 'والدین',
    'nav.classes': 'کلاسیں',
    'nav.attendance': 'حاضری',
    'nav.homework': 'ہوم ورک',
    'nav.exams': 'امتحانات',
    'nav.results': 'نتائج',
    'nav.fees': 'فیس',
    'nav.salaries': 'تنخواہیں',
    'nav.notices': 'نوٹس',
    'nav.timetable': 'ٹائم ٹیبل',
    'nav.reports': 'رپورٹس',
    'nav.users': 'صارف کا انتظام',
    'nav.analytics': 'تجزیات',
    'nav.leaves': 'چھٹی کی درخواستیں',
    'nav.children': 'میرے بچے',

    // Dashboard
    'dashboard.totalStudents': 'کل طلباء',
    'dashboard.totalTeachers': 'کل اساتذہ',
    'dashboard.totalClasses': 'کل کلاسیں',
    'dashboard.feeCollection': 'فیس کی وصولی',
    'dashboard.attendance': 'آج کی حاضری',
    'dashboard.pendingFees': 'واجب الادا فیس',
    'dashboard.recentActivity': 'حالیہ سرگرمی',
    'dashboard.quickActions': 'فوری اقدامات',
    'dashboard.upcomingEvents': 'آنے والے واقعات',
    'dashboard.notifications': 'اطلاعات',
    'dashboard.overview': 'جائزہ',

    // Students
    'student.admissionNo': 'داخلہ نمبر',
    'student.rollNo': 'رول نمبر',
    'student.class': 'کلاس',
    'student.section': 'سیکشن',
    'student.guardian': 'سرپرست',
    'student.dob': 'تاریخ پیدائش',
    'student.gender': 'جنس',
    'student.bloodGroup': 'بلڈ گروپ',
    'student.cnic': 'شناختی کارڈ/بی فارم',
    'student.addNew': 'نیا طالب علم شامل کریں',
    'student.profile': 'طالب علم کا پروفائل',

    // Teachers
    'teacher.employeeId': 'ملازم آئی ڈی',
    'teacher.department': 'شعبہ',
    'teacher.qualification': 'تعلیمی قابلیت',
    'teacher.subjects': 'مضامین',
    'teacher.assignedClasses': 'تفویض کردہ کلاسیں',
    'teacher.joiningDate': 'شمولیت کی تاریخ',
    'teacher.addNew': 'نیا استاد شامل کریں',
    'teacher.profile': 'استاد کا پروفائل',

    // Fees
    'fee.structure': 'فیس کا ڈھانچہ',
    'fee.type': 'فیس کی قسم',
    'fee.amount': 'رقم',
    'fee.dueDate': 'آخری تاریخ',
    'fee.paid': 'ادا شدہ',
    'fee.unpaid': 'غیر ادا شدہ',
    'fee.partial': 'جزوی',
    'fee.receipt': 'رسید',
    'fee.generateSlip': 'فیس سلپ بنائیں',
    'fee.collection': 'فیس کی وصولی',
    'fee.tuition': 'ٹیوشن فیس',
    'fee.admission': 'داخلہ فیس',
    'fee.exam': 'امتحان کی فیس',
    'fee.transport': 'ٹرانسپورٹ فیس',
    'fee.library': 'لائبریری فیس',
    'fee.sports': 'کھیلوں کی فیس',
    'fee.lab': 'لیب فیس',
    'fee.misc': 'متفرق',

    // Attendance
    'attendance.markAttendance': 'حاضری لگائیں',
    'attendance.present': 'حاضر',
    'attendance.absent': 'غیر حاضر',
    'attendance.late': 'تاخیر سے',
    'attendance.leave': 'چھٹی',
    'attendance.monthly': 'ماہانہ رپورٹ',
    'attendance.daily': 'روزانہ رپورٹ',
    'attendance.percentage': 'حاضری %',

    // Exams
    'exam.createExam': 'امتحان بنائیں',
    'exam.examName': 'امتحان کا نام',
    'exam.startDate': 'شروع کی تاریخ',
    'exam.endDate': 'اختتامی تاریخ',
    'exam.totalMarks': 'کل نمبر',
    'exam.passingMarks': 'کامیابی کے نمبر',
    'exam.enterMarks': 'نمبر درج کریں',
    'exam.marksheet': 'مارک شیٹ',
    'exam.result': 'نتیجہ',
    'exam.grade': 'گریڈ',
    'exam.rank': 'رینک',
    'exam.percentage': 'فیصد',

    // Notices
    'notice.title': 'عنوان',
    'notice.content': 'مواد',
    'notice.audience': 'ہدف',
    'notice.sendPush': 'پش نوٹیفکیشن بھیجیں',
    'notice.createNotice': 'نوٹس بنائیں',
    'notice.urgent': 'فوری',
    'notice.general': 'عام',
    'notice.feeReminder': 'فیس یاد دہانی',
    'notice.examAlert': 'امتحان کی اطلاع',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pakschool-language');
    return (saved as Language) || 'en';
  });

  const isRTL = language === 'ur';

  useEffect(() => {
    localStorage.setItem('pakschool-language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
