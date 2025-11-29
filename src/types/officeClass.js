// Mapping functions for OfficeClass objects

export const mapOfficeClass = (raw = {}) => {
  const id = raw.office_class_id || raw.id || raw.officeClassId || raw.office_class?.office_class_id
  const code = raw.office_class_SKU || raw.code || raw.sku || raw.office_class?.office_class_SKU
  const name = raw.office_class_name || raw.name || raw.office_class?.office_class_name
  const maxStudents = raw.max_students || raw.maxStudents || raw.office_class?.max_students || 0

  const studentCount = raw.student_count || raw.studentCount || students.length || 0;
  const advisorId = raw.teacher_id || raw.advisorId || raw.office_class?.teacher_id || (raw.teacher && (raw.teacher.teacher_id || raw.teacher.user_id)) || null
  const advisorName = raw.advisor_name || raw.teacher_name || raw.teacher?.teacher_name || raw.teacher?.user_name || raw.advisor?.name || raw.office_class?.advisor_name
  const major = raw.major || raw.office_class?.major || raw.office_class?.major_id
  const major_id = raw.major_id || raw.office_class?.major_id || raw.Major?.major_id || raw.Major?.id || raw.major?.major_id || null
  const majorName = (raw.Major && (raw.Major.major_name || raw.Major.name)) || raw.major_name || raw.majorName || raw.office_class?.major_name || null
  const course = raw.course || raw.office_class?.course || raw.office_class?.academic_year_id
  const academic_year_id = raw.academic_year_id || raw.office_class?.academic_year_id || (raw.AcademicYear && (raw.AcademicYear.academic_year_id || raw.AcademicYear.id)) || null
  const AcademicYear = raw.AcademicYear || raw.academic_year || raw.office_class?.AcademicYear || null
  const academicYearName = (AcademicYear && (AcademicYear.academic_year_name || AcademicYear.name)) || raw.academic_year_name || raw.academicYearName || null
  const status = raw.status || raw.office_class?.status || 'active'
  const rawStudents = raw.Students || raw.students || [];
  const students = rawStudents.map(st => ({
    id: st.student_id || st.id,
    studentCode: st.student_code || st.user_code || 'N/A', // Ưu tiên mã sinh viên
    fullName: st.student_name || st.name || 'N/A',
    
    // Logic lấy Email & Avatar từ bảng User liên kết (quan trọng)
    email: st.User?.user_email || st.user_email || st.email || '', 
    avatar: st.User?.user_avatar || st.avatar || '', 
    
    // Các trường phụ
    gender: st.student_gender || 'Khác',
    birthDate: st.student_birthdate,
    status: st.student_active ? 'active' : 'inactive'
  }));

  return {
    id,
    code,
    name,
    maxStudents: Number(maxStudents || 0),
    studentCount: Number(studentCount || 0),
    students,
    advisorId,
    advisorName,
    major,
    major_id,
    majorName,
    Major: raw.Major || raw.office_class?.Major || null,
    course,
    academic_year_id,
    AcademicYear,
    academicYearName,
    status,
    raw
  }
}

export const mapOfficeClassList = (arr = []) => (Array.isArray(arr) ? arr.map(mapOfficeClass) : [])

// Convert frontend payload to API expected fields
export const toApiOfficeClass = (payload = {}) => {
  const out = {}
  if (payload.code !== undefined) out.office_class_SKU = payload.code
  if (payload.name !== undefined) out.office_class_name = payload.name
  if (payload.advisorId !== undefined) out.teacher_id = Number(payload.advisorId) || null
  if (payload.course !== undefined) out.academic_year_id = Number(payload.course) || payload.course
  if (payload.maxStudents !== undefined) out.max_students = Number(payload.maxStudents) || 0
  if (payload.status !== undefined) out.status = payload.status
  if (payload.notes !== undefined) out.note = payload.notes
  // If backend supports `major_id` explicitly, set that; fallback to `major` code if provided
  if (payload.major_id !== undefined) out.major_id = payload.major_id === null ? null : Number(payload.major_id)
  else if (payload.major !== undefined) out.major = payload.major
  // students list if needed
  if (payload.students !== undefined) out.students = payload.students
  return out
}
