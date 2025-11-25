import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import FallbackPage from '@/components/FallbackPage.vue'

// Simple fallback component for pages without dedicated components
const Fallback = FallbackPage

// All routes use the Default layout as wrapper, with page content as dynamic component
const routes = [
  // Login route (STANDALONE - NO LAYOUT)
  { 
    path: '/login', 
    name: 'login', 
    component: () => import('../views/Login.vue'),
    meta: { 
      title: 'Đăng nhập hệ thống', 
      subtitle: 'Đăng nhập để truy cập StudyHub',
      requiresGuest: true
    }
  },
  { 
    path: '/', 
    component: () => import('../views/Deafault.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        name: 'home',
        redirect: to => {
          // Will be handled by router guard
          return '/dashboard'
        },
        meta: { requiresAuth: true }
      },
      { path: 'dashboard', name: 'dashboard', component: () => import('../components/Dashboard-AD/Overview.vue').catch(() => Fallback) },
      { path: 'settings', name: 'settings', component: () => import('../views/share/Setting.vue').catch(() => Fallback) },
      
      // Admin routes
      // Admin routes (menu: admin-dashboard, account-management, admin-notes)
      { 
        path: 'admin-dashboard', 
        name: 'admin-dashboard', 
        component: () => import('../components/Dashboard-AD/AdminOverview.vue').catch(() => Fallback), 
        meta: { 
          title: 'Bảng điều khiển Admin', 
          subtitle: 'Quản lý hệ thống StudyHub - Tài khoản, Ghi chú & Tin nhắn',
          menu: { id: 'admin-dashboard', label: 'Dashboard hệ thống', icon: 'fas fa-tachometer-alt', highlighted: true }
        } 
      },
      { 
        path: 'account-management', 
        name: 'account-management', 
        component: () => import('../pages/Account/Account.vue').catch(() => Fallback), 
        meta: { 
          title: 'Quản lý tài khoản', 
          subtitle: 'Quản lý người dùng, phân quyền và trạng thái tài khoản',
          menu: { id: 'account-management', label: 'Quản lý tài khoản', icon: 'fas fa-users' }
        } 
      },
      { 
        path: 'admin-notes', 
        name: 'admin-notes', 
        component: () => import('../pages/Note/Note.vue').catch(() => Fallback), 
        meta: { 
          title: 'Ghi chú (Admin)', 
          subtitle: 'Ghi chú hệ thống & quản lý nội dung',
          menu: { id: 'admin-notes', label: 'Ghi chú', icon: 'fas fa-sticky-note' }
        } 
      },
      // Notifications routes for all roles
      { 
        path: 'notifications', 
        name: 'notifications', 
        component: () => import('../pages/Notifications/NotificationPage.vue').catch(() => Fallback), 
        meta: { 
          title: 'Quản lý Thông báo', 
          subtitle: 'Tạo, gửi và quản lý thông báo cho người dùng',
          menu: { id: 'notifications', label: 'Thông báo', icon: 'fas fa-bell' }
        } 
      },
      { 
        path: 'admin-notifications', 
        name: 'admin-notifications', 
        component: () => import('../pages/Notifications/NotificationPage.vue').catch(() => Fallback), 
        meta: { 
          title: 'Quản lý Thông báo Hệ thống', 
          subtitle: 'Quản lý thông báo toàn hệ thống và cấu hình nâng cao',
          menu: { id: 'admin-notifications', label: 'Thông báo hệ thống', icon: 'fas fa-bullhorn' }
        } 
      },
      { 
        path: 'staff-notifications', 
        name: 'staff-notifications', 
        component: () => import('../pages/Notifications/NotificationPage.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thông báo Khoa', 
          subtitle: 'Quản lý thông báo khoa và hoạt động giáo vụ',
          menu: { id: 'staff-notifications', label: 'Thông báo khoa', icon: 'fas fa-building' }
        } 
      },
      {
        path: 'staff-management',
        name: 'staff-management',
        component: () => import('../pages/Staff-Manager/StaffManager.vue').catch(() => Fallback),
        meta: {
          title: 'Quản lý giáo vụ khoa',
          subtitle: 'Quản lý giáo vụ khoa - CRUD cơ bản',
          menu: { id: 'staff-management', label: 'Quản lý giáo vụ khoa', icon: 'fas fa-user-tie' }
        }
      },
      { 
        path: 'teacher-notifications', 
        name: 'teacher-notifications', 
        component: () => import('../pages/Notifications/NotificationPage.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thông báo Lớp học', 
          subtitle: 'Gửi thông báo đến sinh viên và quản lý lớp học',
          menu: { id: 'teacher-notifications', label: 'Thông báo lớp', icon: 'fas fa-chalkboard-teacher' }
        } 
      },
      { 
        path: 'student-notifications', 
        name: 'student-notifications', 
        component: () => import('../pages/Notifications-Student/NotificationPage.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thông báo của tôi', 
          subtitle: 'Xem thông báo từ nhà trường, khoa và giảng viên',
          menu: { id: 'student-notifications', label: 'Thông báo', icon: 'fas fa-bell' }
        } 
      },

      // Student Dashboard
      { 
        path: 'student-dashboard', 
        name: 'student-dashboard', 
        component: () => import('../pages/Dashboard-Students/DashboardStudents.vue').catch(() => Fallback), 
        meta: { 
          title: 'Dashboard Sinh viên', 
          subtitle: 'Tổng quan hoạt động học tập và lịch trình của bạn',
          menu: { id: 'student-dashboard', label: 'Dashboard', icon: 'fas fa-home' }
        } 
      },

      // Staff routes
      { path: 'staff-dashboard', name: 'staff-dashboard', component: () => import('../pages/Dashboard-Staff/StaffDashboard.vue').catch(() => Fallback), meta: { title: 'Bảng điều khiển Giáo vụ', subtitle: 'Quản lý công việc giáo vụ khoa CNTT' } },
      { path: 'staff-notes', name: 'staff-notes', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { title: 'Quản lý ghi chú', subtitle: 'Tạo và quản lý ghi chú công việc giáo vụ' } },
      { path: 'staff-notes/create', name: 'staff-notes-create', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'create', title: 'Tạo ghi chú mới' } },
      { path: 'staff-notes/:id', name: 'staff-notes-view', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'view', title: 'Xem ghi chú' } },
      { path: 'staff-notes/:id/edit', name: 'staff-notes-edit', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'edit', title: 'Chỉnh sửa ghi chú' } },
      { path: 'staff-accounts', name: 'staff-accounts', component: () => import('../pages/Account/Account.vue').catch(() => Fallback), meta: { title: 'Quản lý tài khoản khoa', subtitle: 'Quản lý tài khoản sinh viên và giảng viên khoa CNTT' } },
      { path: 'staff-frameworksubject', name: 'staff-frameworksubject', component: () => import('../pages/FrameworkSubject-Staff/FrameworkSubject.vue').catch(() => Fallback), meta: { title: 'Chương trình khung', subtitle: 'Quản lý chương trình khung môn học' } },
      { path: 'student-frameworksubject', name: 'student-frameworksubject', component: () => import('../pages/FrameworkSubject-Student/FrameworkSubjectPage.vue').catch(() => Fallback), meta: { title: 'Chương trình khung', subtitle: 'Xem chương trình khung môn học theo từng học kỳ' } },
      { path: 'register-subject', name: 'register-subject', component: () => import('../pages/Register-Subject/RegisterSubject.vue').catch(() => Fallback), meta: { title: 'Đăng ký học phần', subtitle: 'Đăng ký môn học cho học kỳ hiện tại' } },
      { path: 'staff-subjects', name: 'staff-subjects', component: () => import('../pages/Subjects-Staff/Subjects.vue').catch(() => Fallback), meta: { title: 'Quản lý môn học', subtitle: 'Quản lý môn học từ chương trình đào tạo, gán giáo viên và phòng học' } },
      { path: 'staff-schedule', name: 'staff-schedule', component: () => import('../pages/Schedule-Staff/Schedule.vue').catch(() => Fallback), meta: { title: 'Xếp lịch học & thi', subtitle: 'Quản lý thời khóa biểu, xếp lịch học và lịch thi cho các môn học' } },
      { path: 'staff-students', name: 'staff-students', component: () => import('../pages/Students-Manager/StudentsManager.vue').catch(() => Fallback), meta: { title: 'Quản lý sinh viên', subtitle: 'Quản lý thông tin, học vụ và tiến độ học tập của sinh viên' } },
      { path: 'staff-official-class', name: 'staff-official-class', component: () => import('../pages/Students-Manager/Classes.vue').catch(() => Fallback), meta: { title: 'Quản lý lớp hành chính', subtitle: 'Quản lý danh sách lớp, cố vấn học tập và sinh viên' } },
      { path: 'staff-teachers', name: 'staff-teachers', component: () => import('../pages/Teachers-Manager/Teachers.vue').catch(() => Fallback), meta: { title: 'Quản lý giảng viên', subtitle: 'Quản lý danh sách giảng viên, thông tin cá nhân và phân công giảng dạy' } },
      { 
        path: 'staff-reports', 
        name: 'staff-reports', 
        component: () => import('../pages/Reports-Staff/Reports.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thống kê & Báo cáo', 
          subtitle: 'Tổng quan hoạt động giáo vụ khoa với các báo cáo chi tiết và trực quan',
          menu: { id: 'staff-reports', label: 'Thống kê & Báo cáo', icon: 'fas fa-chart-bar' }
        } 
      },
    
      // Notes routes (for all roles)
      { path: 'notes', name: 'notes', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { title: 'Ghi chú & Quản lý tài liệu', subtitle: 'Tạo, quản lý và tổ chức ghi chú cá nhân một cách hiệu quả' } },
      { path: 'notes/create', name: 'notes-create', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'create', title: 'Tạo ghi chú mới' } },
      { path: 'notes/:id', name: 'notes-view', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'view', title: 'Xem ghi chú' } },
      { path: 'notes/:id/edit', name: 'notes-edit', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'edit', title: 'Chỉnh sửa ghi chú' } },
      { path: 'schedule-students', name: 'schedule-students', component: () => import('../pages/Schedule-Students/Schedule.vue').catch(() => Fallback), meta: { title: 'Lịch học & lịch thi', subtitle: 'Xem lịch học và lịch thi cá nhân' } },
    ]
  }
]

// Find the main route (the one with children)
const mainRoute = routes.find(route => route.children)

// Code Environment route
mainRoute.children.push({ 
  path: 'code-environment', 
  name: 'code-environment', 
  component: () => import('../pages/CodeEnviroment/CodeEnviroment.vue').catch(() => Fallback),
  meta: { 
    title: 'Môi trường Code', 
    subtitle: 'Viết và xem kết quả code trực tiếp (HTML/CSS/JS, Java, Python, SQL, C#, C++)',
    menu: { id: 'coding-env', label: 'Code Environment', icon: 'fas fa-code' }
  }
})

// Teacher Schedule route (for giảng viên - xem lịch giảng dạy/coi thi)
mainRoute.children.push({ 
  path: 'teacher-schedule', 
  name: 'teacher-schedule', 
  component: () => import('../pages/Schedule-Teacher/Schedule.vue').catch(() => Fallback),
  meta: { 
    title: 'Lịch giảng dạy', 
    subtitle: 'Quản lý lịch giảng dạy, coi thi và các hoạt động giảng viên',
    menu: { id: 'teacher-schedule', label: 'Lịch giảng dạy', icon: 'fas fa-chalkboard-teacher' }
  }
})

// Teacher Dashboard (giảng viên)
mainRoute.children.push({
  path: 'teacher-dashboard',
  name: 'teacher-dashboard',
  component: () => import('../pages/Dashboard-Teacher/Dashboard.vue').catch(() => Fallback),
  meta: {
    title: 'Dashboard Giảng viên',
    subtitle: 'Tổng quan công việc giảng dạy và lớp học',
    menu: { id: 'teacher-dashboard', label: 'Dashboard giảng viên', icon: 'fas fa-chalkboard-teacher' }
  }
})

// MyClass route (for giảng viên - quản lý lớp học phụ trách)
mainRoute.children.push({ 
  path: 'my-classes', 
  name: 'my-classes', 
  component: () => import('../pages/MyClass/MyClass.vue').catch(() => Fallback),
  meta: { 
    title: 'Lớp học phụ trách', 
    subtitle: 'Quản lý lớp học, sinh viên và hoạt động giảng dạy',
    menu: { id: 'my-classes', label: 'Lớp học phụ trách', icon: 'fas fa-chalkboard' }
  }
})

// MyClass route for students (sinh viên - xem lớp học đang tham gia)
mainRoute.children.push({ 
  path: 'student-classes', 
  name: 'student-classes', 
  component: () => import('../pages/MyClass-Students/MyClassStudents.vue').catch(() => Fallback),
  meta: { 
    title: 'Lớp học của tôi', 
    subtitle: 'Xem các lớp học đang tham gia và theo dõi tiến độ học tập',
    menu: { id: 'student-classes', label: 'Lớp học của tôi', icon: 'fas fa-graduation-cap' }
  }
})

// Lessons route (for giảng viên - quản lý bài học, video, tài liệu)
mainRoute.children.push({ 
  path: 'lesson', 
  name: 'lesson', 
  component: () => import('../pages/Lessions/Lessons.vue').catch(() => Fallback),
  meta: { 
    title: 'Quản lý bài học', 
    subtitle: 'Quản lý nội dung bài học, video bài giảng và tài liệu học tập',
    menu: { id: 'lessons', label: 'Quản lý bài học', icon: 'fas fa-book-open' }
  }
})

// Student Lessons route (for sinh viên - xem bài học, video, tài liệu)
mainRoute.children.push({ 
  path: 'student-lessons', 
  name: 'student-lessons', 
  component: () => import('../pages/Lessions-Students/LessonsStudents.vue').catch(() => Fallback),
  meta: { 
    title: 'Bài học của tôi', 
    subtitle: 'Xem bài học, video bài giảng và tài liệu học tập',
    menu: { id: 'student-lessons', label: 'Bài học', icon: 'fas fa-book-reader' }
  }
})

// Student Assignments route (for sinh viên - làm bài tập, kiểm tra)
mainRoute.children.push({ 
  path: 'student-assignments', 
  name: 'student-assignments', 
  component: () => import('../pages/LessonDetails-Students/LessonDetailsStudents.vue').catch(() => Fallback),
  meta: { 
    title: 'Bài tập & Kiểm tra', 
    subtitle: 'Làm bài tập, kiểm tra và xem kết quả',
    menu: { id: 'student-assignments', label: 'Bài tập & Kiểm tra', icon: 'fas fa-file-alt' }
  }
})

// AI Students route (for sinh viên - AI học tập với chat, gợi ý, phân tích)
mainRoute.children.push({ 
  path: 'ai-students', 
  name: 'ai-students', 
  component: () => import('../pages/AI-Students/AIStudents.vue').catch(() => Fallback),
  meta: { 
    title: 'AI Học tập', 
    subtitle: 'Trợ lý AI thông minh giúp bạn học tập hiệu quả hơn',
    menu: { id: 'ai-students', label: 'AI Học tập', icon: 'fas fa-robot' }
  }
})

// LessonDetails route (for giảng viên - quản lý bài tập, chấm điểm)
mainRoute.children.push({ 
  path: 'lesson-details', 
  name: 'lesson-details', 
  component: () => import('../pages/LessionDetails/LessonDetails.vue').catch(() => Fallback),
  meta: { 
    title: 'Quản lý bài tập', 
    subtitle: 'Quản lý bài tập tự luận, trắc nghiệm và chấm điểm sinh viên',
    menu: { id: 'lesson-details', label: 'Quản lý bài tập', icon: 'fas fa-tasks' }
  }
})

// Add a large set of generic routes used by the sidebar (all map to Fallback unless a real component exists)
const ids = [
  'curriculum','today-lessons','assignments','materials','forum','ai-tutor','notifications',
  'lesson-management','assignment-management','grading','materials-management','coding-demo','ai-assistant','class-notifications',
  'student-management','teacher-management','course-management','schedule-management','curriculum-management','reports','department-forum','ai-management','department-notifications',
  'system-dashboard','permissions','data-management','system-config','security-logs','system-analytics','admin-forum','ai-admin'
]

// Add these as children of the Default layout
ids.forEach(id => {
  mainRoute.children.push({ path: id, name: id, component: Fallback })
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const savedUser = localStorage.getItem('auth_user')
  const isAuthenticated = !!savedUser
  
  // Redirect authenticated users away from login page
  if (to.path === '/login') {
    if (isAuthenticated) {
      try {
        const user = JSON.parse(savedUser)
        const store = useAuthStore()
        return next(store.getDashboardRoute())
      } catch (e) {
        localStorage.removeItem('auth_user')
        // After clearing invalid data, allow login
        return next()
      }
    }
    return next()
  }
  
  // Redirect root path based on auth status
  if (to.path === '/' || to.path === '') {
    if (isAuthenticated) {
      try {
        const user = JSON.parse(savedUser)
        const store = useAuthStore()
        return next(store.getDashboardRoute())
      } catch (e) {
        localStorage.removeItem('auth_user')
        return next('/login')
      }
    }
    return next('/login')
  }
  
  // Protect all other routes
  if (!isAuthenticated) {
    return next('/login')
  }
  
  next()
})

export default router
