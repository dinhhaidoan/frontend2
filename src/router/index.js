import { createRouter, createWebHistory } from 'vue-router'

// Simple fallback component for pages without dedicated components
const Fallback = {
  template: `<div style="padding:24px; max-width:1100px; margin:0 auto">
    <h2 style="margin:0 0 8px">{{ $route.name || $route.path.replace('/', '') }}</h2>
    <p style="margin:0 0 16px;color:#6b7280">Nội dung demo cho trang <strong>{{ $route.name || $route.path.replace('/', '') }}</strong>.</p>
    <div style="padding:16px;background:rgba(255,255,255,0.9);border-radius:12px;border:1px solid rgba(0,0,0,0.04)">Thêm component cụ thể vào <code>src/components</code> hoặc <code>src/pages</code> rồi cập nhật router.</div>
  </div>`
}

// All routes use the Default layout as wrapper, with page content as dynamic component
const routes = [
  { 
    path: '/', 
    component: () => import('../views/Deafault.vue'),
    children: [
      { 
        path: '', 
        redirect: (to) => {
          return '/dashboard'
        }
      },
      { path: 'dashboard', name: 'dashboard', component: () => import('../components/Dashboard-AD/Overview.vue').catch(() => Fallback) },
      { path: 'settings', name: 'settings', component: () => import('../views/share/Setting.vue').catch(() => Fallback) },
      
      // Admin routes
      // Admin routes (menu: admin-dashboard, account-management, admin-notes, messages)
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

      // Messages (shared) - include admin menu meta for messages badge
      { 
        path: 'messages', 
        name: 'messages', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tin nhắn', 
          subtitle: 'Trò chuyện và giao tiếp với bạn bè, nhóm học tập',
          menu: { id: 'messages', label: 'Tin nhắn nội bộ', icon: 'fas fa-comment', badge: 2 }
        } 
      },
      // Messages - View specific chat
      { 
        path: 'messages/:chatId', 
        name: 'messages-chat', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tin nhắn', 
          subtitle: 'Trò chuyện và giao tiếp với bạn bè, nhóm học tập'
        } 
      },

      // Staff routes
      { path: 'staff-dashboard', name: 'staff-dashboard', component: () => import('../pages/Dashboard-Staff/StaffDashboard.vue').catch(() => Fallback), meta: { title: 'Bảng điều khiển Giáo vụ', subtitle: 'Quản lý công việc giáo vụ khoa CNTT' } },
      { path: 'staff-notes', name: 'staff-notes', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { title: 'Quản lý ghi chú', subtitle: 'Tạo và quản lý ghi chú công việc giáo vụ' } },
      { path: 'staff-notes/create', name: 'staff-notes-create', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'create', title: 'Tạo ghi chú mới' } },
      { path: 'staff-notes/:id', name: 'staff-notes-view', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'view', title: 'Xem ghi chú' } },
      { path: 'staff-notes/:id/edit', name: 'staff-notes-edit', component: () => import('../pages/Note/Note.vue').catch(() => Fallback), meta: { action: 'edit', title: 'Chỉnh sửa ghi chú' } },
      { path: 'staff-messages', name: 'staff-messages', component: () => import('../pages/Message/Message.vue').catch(() => Fallback), meta: { title: 'Tin nhắn công việc', subtitle: 'Giao tiếp nội bộ giáo vụ khoa' } },
      { path: 'staff-messages/:chatId', name: 'staff-messages-chat', component: () => import('../pages/Message/Message.vue').catch(() => Fallback), meta: { title: 'Tin nhắn công việc', subtitle: 'Giao tiếp nội bộ giáo vụ khoa' } },
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
      { path: 'login', name: 'login', component: () => import('../views/Login.vue').catch(() => Fallback), meta: { title: 'Đăng nhập hệ thống', subtitle: 'Đăng nhập để truy cập StudyHub' } },
      { path: 'schedule-students', name: 'schedule-students', component: () => import('../pages/Schedule-Students/Schedule.vue').catch(() => Fallback), meta: { title: 'Lịch học & lịch thi', subtitle: 'Xem lịch học và lịch thi cá nhân' } },


      // Messages routes
      { 
        path: 'messages', 
        name: 'messages', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tin nhắn', 
          subtitle: 'Trò chuyện và giao tiếp với bạn bè, nhóm học tập' 
        }
      },
      // Messages - View specific chat
      { 
        path: 'messages/:chatId', 
        name: 'messages-chat', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tin nhắn', 
          subtitle: 'Trò chuyện và giao tiếp với bạn bè, nhóm học tập' 
        }
      },
      // Messages - New personal chat
      { 
        path: 'messages/new/personal', 
        name: 'messages-new-personal', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tạo tin nhắn mới', 
          subtitle: 'Bắt đầu cuộc trò chuyện mới với bạn bè',
          action: 'create-personal'
        }
      },
      // Messages - New group chat
      { 
        path: 'messages/new/group', 
        name: 'messages-new-group', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tạo nhóm chat mới', 
          subtitle: 'Tạo nhóm trò chuyện với nhiều thành viên',
          action: 'create-group'
        }
      },
      // Messages - New AI chat
      { 
        path: 'messages/new/ai', 
        name: 'messages-new-ai', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Chat với AI', 
          subtitle: 'Trò chuyện với trợ lý AI thông minh',
          action: 'create-ai'
        }
      },
      // Messages - Group settings
      { 
        path: 'messages/group/:groupId/settings', 
        name: 'messages-group-settings', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Cài đặt nhóm', 
          subtitle: 'Quản lý thông tin và thành viên nhóm',
          action: 'group-settings'
        }
      },
      // Messages - Search in chat
      { 
        path: 'messages/:chatId/search', 
        name: 'messages-search', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tìm kiếm tin nhắn', 
          subtitle: 'Tìm kiếm nội dung trong cuộc trò chuyện',
          action: 'search'
        }
      },
      // Messages - Shared files
      { 
        path: 'messages/:chatId/files', 
        name: 'messages-files', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'File đã chia sẻ', 
          subtitle: 'Xem tất cả file đã chia sẻ trong cuộc trò chuyện',
          action: 'view-files'
        }
      },
      // Messages - Pinned messages
      { 
        path: 'messages/:chatId/pinned', 
        name: 'messages-pinned', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Tin nhắn đã ghim', 
          subtitle: 'Xem tất cả tin nhắn quan trọng đã ghim',
          action: 'view-pinned'
        }
      },
      // Messages - Add members to group
      { 
        path: 'messages/group/:groupId/add-members', 
        name: 'messages-add-members', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thêm thành viên', 
          subtitle: 'Mời thêm người vào nhóm trò chuyện',
          action: 'add-members'
        }
      },
      // Messages - View member profile
      { 
        path: 'messages/profile/:userId', 
        name: 'messages-profile', 
        component: () => import('../pages/Message/Message.vue').catch(() => Fallback), 
        meta: { 
          title: 'Thông tin thành viên', 
          subtitle: 'Xem thông tin chi tiết và lịch sử trò chuyện',
          action: 'view-profile'
        }
      },
    ]
  }
]

// Code Environment route
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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
routes[0].children.push({ 
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

// Map internal-messages and admin-messages to the main messages route
routes[0].children.push({ 
  path: 'internal-messages', 
  redirect: '/messages'
})

routes[0].children.push({ 
  path: 'admin-messages', 
  redirect: '/messages'
})

// Add these as children of the Default layout
ids.forEach(id => {
  routes[0].children.push({ path: id, name: id, component: Fallback })
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
