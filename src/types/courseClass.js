// Mapping helpers for CourseClass (BE) to Subject (FE)
export const mapCourseClass = (raw = {}) => {
  const id = raw.course_class_id || raw.id || raw.courseClassId || raw.course_class?.course_class_id
  const sku = raw.course_class_SKU || raw.courseClassSKU || raw.sku || raw.code || (raw.Course && (raw.Course.course_SKU || raw.Course.sku)) || ''
  const courseId = raw.course_id || raw.Course?.course_id || raw.Course?.id || raw.course?.course_id
  const courseName = raw.course_name_vn || raw.course_name || raw.Course?.course_name_vn || raw.Course?.name_vn || raw.Course?.name || raw.name
  const credits = raw.credits || raw.Course?.credits || raw.course?.credits || 0
  const semesterId = raw.semester_id || raw.Course?.semester_id || raw.semesterId || raw.semester
  const teacherId = raw.teacher_id || raw.teacherId || raw.instructor_id
  const teacherName = raw.teacher_name || raw.teacherName || (raw.Teacher && (raw.Teacher.name || raw.Teacher.full_name))
  const roomId = raw.room_id || raw.roomId
  const roomName = raw.room_name || raw.roomName || (raw.Room && (raw.Room.room_name || raw.Room.name))
  const capacity = raw.capacity || raw.maxStudents || raw.course_capacity || raw.room_capacity || 0
  const status = raw.status || raw.class_status || raw.classStatus || 'open'
  const description = raw.description || raw.Course?.description || ''
  const suffix = raw.course_class_suffix || raw.suffix || (sku && sku.includes('-') ? sku.split('-').slice(-1)[0] : '')
  const registeredCount = raw.registeredCount || raw.enrollmentCount || raw.enrollment_count || raw.enrollments || 0

  return {
    id,
    sku,
    code: sku,
    courseId,
    name: courseName,
    credits: Number(credits || 0),
    semesterId,
    teacherId,
    teacherName,
    roomId,
    roomName,
    capacity: Number(capacity || 0),
    maxStudents: Number(capacity || 0),
    status,
    description,
    suffix,
    registeredCount: Number(registeredCount || 0),
    registrationOpen: status === 'open',
    raw
  }
}

export const mapCourseClassList = (arr = []) => (Array.isArray(arr) ? arr.map(mapCourseClass) : [])
