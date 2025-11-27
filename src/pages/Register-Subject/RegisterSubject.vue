<template>
  <div class="register-subject-page">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-clipboard-list"></i>
        Đăng ký học phần
      </h1>
      <p class="page-subtitle">Chọn học kỳ và môn học để đăng ký lớp học phần</p>
    </div>

    <!-- 1. Chọn học kỳ -->
    <SemesterSelector
      :semesters="semestersList"
      :selectedSemester="selectedSemester"
      @select="handleSelectSemester"
    />

    <!-- 2. Chọn môn học -->
    <SubjectSelector
      v-if="selectedSemester"
      :semesterId="selectedSemester.id"
      :subjects="availableSubjects"
      :selectedSubject="selectedSubject"
      @select="handleSelectSubject"
    />

    <!-- 3. Danh sách lớp học phần -->
    <ClassList
      v-if="selectedSubject"
      :subjectId="selectedSubject.id"
      :classes="subjectClasses"
      :registeredSchedules="registeredSchedules"
      @register="handleRegisterClass"
      @view-details="handleViewClassDetails"
    />

    <!-- 4. Môn học đã đăng ký -->
    <RegisteredClasses
      :registeredClasses="registeredClasses"
      @cancel="handleCancelRegistration"
      @view-details="handleViewRegisteredDetails"
    />

    <!-- Modal xác nhận đăng ký -->
    <ConfirmModal
      :isOpen="confirmModal.isOpen"
      :type="confirmModal.type"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :details="confirmModal.details"
      :confirmText="confirmModal.confirmText"
      :cancelText="confirmModal.cancelText"
      :isLoading="confirmModal.isLoading"
      @confirm="handleConfirmAction"
      @close="closeConfirmModal"
    />

    <!-- Modal chi tiết lớp -->
    <ClassDetailsModal
      :isOpen="detailsModal.isOpen"
      :classData="detailsModal.classData"
      @close="closeDetailsModal"
      @register="handleRegisterFromDetails"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSemesters } from '@/hooks/useSemesters'
import SemesterSelector from '@/components/Register-Subject/SemesterSelector.vue';
import SubjectSelector from '@/components/Register-Subject/SubjectSelector.vue';
import ClassList from '@/components/Register-Subject/ClassList.vue';
import RegisteredClasses from '@/components/Register-Subject/RegisteredClasses.vue';
import ConfirmModal from '@/components/Register-Subject/ConfirmModal.vue';
import ClassDetailsModal from '@/components/Register-Subject/ClassDetailsModal.vue';

// State
const { semesters: semestersList, fetchSemesters } = useSemesters()
const selectedSemester = ref(null);
const availableSubjects = ref([]);
const selectedSubject = ref(null);
const subjectClasses = ref([]);
const registeredClasses = ref([]);

// Modal states
const confirmModal = ref({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  details: null,
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  isLoading: false,
  action: null,
  data: null
});

const detailsModal = ref({
  isOpen: false,
  classData: null
});

// Computed
const registeredSchedules = computed(() => {
  return registeredClasses.value.flatMap(item => 
    item.schedule.map(s => ({
      ...s,
      classId: item.id
    }))
  );
});

// Methods
const handleSelectSemester = (semester) => {
  selectedSemester.value = semester;
  selectedSubject.value = null;
  subjectClasses.value = [];
  
  // Load subjects for selected semester
  loadSubjects(semester.id);
};

const handleSelectSubject = (subject) => {
  selectedSubject.value = subject;
  
  // Load classes for selected subject
  loadClasses(subject.id);
};

const handleRegisterClass = (classItem) => {
  confirmModal.value = {
    isOpen: true,
    type: 'success',
    title: 'Xác nhận đăng ký lớp học phần',
    message: 'Bạn có chắc chắn muốn đăng ký lớp học phần này?',
    details: {
      'Môn học': `${classItem.subjectName} (${classItem.subjectCode})`,
      'Lớp': classItem.className,
      'Giảng viên': classItem.teacher,
      'Số tín chỉ': `${classItem.credits} TC`,
      'Lịch học': formatScheduleForDisplay(classItem.schedule)
    },
    confirmText: 'Đăng ký',
    cancelText: 'Hủy',
    isLoading: false,
    action: 'register',
    data: classItem
  };
};

const handleCancelRegistration = (item) => {
  confirmModal.value = {
    isOpen: true,
    type: 'danger',
    title: 'Xác nhận hủy đăng ký',
    message: 'Bạn có chắc chắn muốn hủy đăng ký môn học này?',
    details: {
      'Môn học': `${item.subjectName} (${item.subjectCode})`,
      'Lớp': item.className,
      'Số tín chỉ': `${item.credits} TC`
    },
    confirmText: 'Hủy đăng ký',
    cancelText: 'Không',
    isLoading: false,
    action: 'cancel',
    data: item
  };
};

const handleViewClassDetails = (classItem) => {
  detailsModal.value = {
    isOpen: true,
    classData: {
      ...classItem,
      subjectName: selectedSubject.value?.name || '',
      subjectCode: selectedSubject.value?.code || ''
    }
  };
};

const handleViewRegisteredDetails = (item) => {
  detailsModal.value = {
    isOpen: true,
    classData: {
      ...item,
      isRegistered: true
    }
  };
};

const handleRegisterFromDetails = (classData) => {
  closeDetailsModal();
  handleRegisterClass(classData);
};

const handleConfirmAction = async () => {
  const { action, data } = confirmModal.value;
  confirmModal.value.isLoading = true;

  try {
    if (action === 'register') {
      await registerClassAPI(data);
      // Add to registered classes
      registeredClasses.value.push({
        id: data.id,
        subjectName: selectedSubject.value.name,
        subjectCode: selectedSubject.value.code,
        className: data.className,
        classCode: data.classCode,
        teacher: data.teacher,
        schedule: data.schedule,
        room: data.room,
        credits: selectedSubject.value.credits,
        registeredAt: new Date().toISOString()
      });
      
      // Reload classes to update conflict status
      loadClasses(selectedSubject.value.id);
      
      showNotification('success', 'Đăng ký thành công!');
    } else if (action === 'cancel') {
      await cancelRegistrationAPI(data.id);
      // Remove from registered classes
      registeredClasses.value = registeredClasses.value.filter(
        item => item.id !== data.id
      );
      
      // Reload classes to update conflict status
      if (selectedSubject.value) {
        loadClasses(selectedSubject.value.id);
      }
      
      showNotification('success', 'Hủy đăng ký thành công!');
    }
    
    closeConfirmModal();
  } catch (error) {
    showNotification('error', error.message || 'Có lỗi xảy ra!');
    confirmModal.value.isLoading = false;
  }
};

const closeConfirmModal = () => {
  confirmModal.value = {
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: null,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    isLoading: false,
    action: null,
    data: null
  };
};

const closeDetailsModal = () => {
  detailsModal.value = {
    isOpen: false,
    classData: null
  };
};

const formatScheduleForDisplay = (schedule) => {
  if (!schedule || schedule.length === 0) return 'Chưa có lịch';
  
  return schedule.map(s => 
    `${s.dayOfWeek} (Tiết ${s.startPeriod}-${s.endPeriod})`
  ).join(', ');
};

const showNotification = (type, message) => {
  // Implement notification (toast, alert, etc.)
  alert(message);
};

// API calls (mock data for now)
// Load semester list from API via useSemesters
const setSemestersFromApi = () => {
  // The hook returns mapped semester objects; we may map if child component expects a different shape.
  // For now, we'll rely on semestersList directly in the template and keep this method for backward compatibility.
}

const loadSubjects = async (semesterId) => {
  // Simulate API call
  availableSubjects.value = [
    {
      id: 1,
      code: 'IT001',
      name: 'Nhập môn lập trình',
      credits: 4,
      availableClasses: 5
    },
    {
      id: 2,
      code: 'IT002',
      name: 'Cấu trúc dữ liệu và giải thuật',
      credits: 4,
      availableClasses: 4
    },
    {
      id: 3,
      code: 'IT003',
      name: 'Cơ sở dữ liệu',
      credits: 4,
      availableClasses: 3
    },
    {
      id: 4,
      code: 'IT004',
      name: 'Mạng máy tính',
      credits: 3,
      availableClasses: 2
    },
    {
      id: 5,
      code: 'IT005',
      name: 'Hệ điều hành',
      credits: 3,
      availableClasses: 3
    }
  ];
};

const loadClasses = async (subjectId) => {
  // Simulate API call
  const mockClasses = [
    {
      id: 101,
      className: 'Lớp 01',
      classCode: 'IT001.01',
      teacher: 'TS. Nguyễn Văn A',
      teacherEmail: 'nguyenvana@uit.edu.vn',
      room: 'D3-101',
      schedule: [
        { dayOfWeek: 'Thứ 2', startPeriod: 1, endPeriod: 3 },
        { dayOfWeek: 'Thứ 4', startPeriod: 1, endPeriod: 3 }
      ],
      currentStudents: 45,
      maxStudents: 50,
      credits: 4,
      hasConflict: false,
      isFull: false,
      description: 'Lớp học cơ bản về lập trình',
      note: 'Yêu cầu mang laptop'
    },
    {
      id: 102,
      className: 'Lớp 02',
      classCode: 'IT001.02',
      teacher: 'TS. Trần Thị B',
      teacherEmail: 'tranthib@uit.edu.vn',
      room: 'D3-102',
      schedule: [
        { dayOfWeek: 'Thứ 3', startPeriod: 4, endPeriod: 6 },
        { dayOfWeek: 'Thứ 5', startPeriod: 4, endPeriod: 6 }
      ],
      currentStudents: 48,
      maxStudents: 50,
      credits: 4,
      hasConflict: false,
      isFull: false
    },
    {
      id: 103,
      className: 'Lớp 03',
      classCode: 'IT001.03',
      teacher: 'ThS. Lê Văn C',
      teacherEmail: 'levanc@uit.edu.vn',
      room: 'D3-103',
      schedule: [
        { dayOfWeek: 'Thứ 2', startPeriod: 7, endPeriod: 9 }
      ],
      currentStudents: 50,
      maxStudents: 50,
      credits: 4,
      hasConflict: false,
      isFull: true
    }
  ];

  // Check for conflicts with registered schedules
  subjectClasses.value = mockClasses.map(classItem => {
    const hasConflict = checkScheduleConflict(classItem.schedule);
    return {
      ...classItem,
      hasConflict,
      remainingSlots: classItem.maxStudents - classItem.currentStudents
    };
  });
};

const checkScheduleConflict = (newSchedule) => {
  return registeredSchedules.value.some(registered => 
    newSchedule.some(newS => 
      newS.dayOfWeek === registered.dayOfWeek &&
      !(newS.endPeriod < registered.startPeriod || newS.startPeriod > registered.endPeriod)
    )
  );
};

const registerClassAPI = async (classData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

const cancelRegistrationAPI = async (registrationId) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

// Lifecycle
onMounted(async () => {
  try {
    await fetchSemesters({ page: 1, limit: 100 })
    setSemestersFromApi()
  } catch (e) {
    // fallback: still keep no semesters
  }
});
</script>

<style scoped>
.register-subject-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  margin-bottom: 32px;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title i {
  color: #3b82f6;
  font-size: 36px;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  padding-left: 52px;
}

@media (max-width: 768px) {
  .register-subject-page {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-title i {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
    padding-left: 44px;
  }
}
</style>
