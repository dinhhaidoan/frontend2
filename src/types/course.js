// Mapping functions for Course objects

export const mapCourse = (raw = {}) => {
  const id = raw.course_id || raw.id || raw.courseId || raw.course?.course_id
  const sku = raw.course_SKU || raw.sku || raw.course?.course_SKU
  const nameVn = raw.course_name_vn || raw.name_vn || raw.nameVn || raw.course?.course_name_vn
  const nameEn = raw.course_name_en || raw.name_en || raw.nameEn || raw.course?.course_name_en
  const credits = raw.credits || raw.course?.credits || 0
  const courseType = raw.course_type || raw.type || raw.course?.course_type || 'required'
  const semesterId = raw.semester_id || raw.semesterId || raw.course?.semester_id || null
  const description = raw.description || raw.course?.description || ''
  const Semester = raw.Semester || raw.semester || raw.course?.Semester || null
  const Majors = raw.Majors || raw.majors || raw.course?.Majors || []
  const Prerequisites = raw.Prerequisites || raw.prerequisites || raw.course?.Prerequisites || []

  return {
    id,
    sku,
    code: sku,
    name: nameVn || nameEn || '',
    nameVn,
    nameEn,
    credits: Number(credits || 0),
    courseType,
    semesterId,
    description,
    Semester,
    Majors,
    Prerequisites,
    raw
  }
}

export const mapCourseList = (arr = []) => (Array.isArray(arr) ? arr.map(mapCourse) : [])

// Convert frontend payload to API expected fields
export const toApiCourse = (payload = {}) => {
  const out = {}
  if (payload.sku !== undefined) out.course_SKU = payload.sku
  if (payload.nameVn !== undefined) out.course_name_vn = payload.nameVn
  if (payload.nameEn !== undefined) out.course_name_en = payload.nameEn
  if (payload.credits !== undefined) out.credits = Number(payload.credits) || 0
  if (payload.courseType !== undefined) out.course_type = payload.courseType
  if (payload.semesterId !== undefined) out.semester_id = Number(payload.semesterId) || null
  if (payload.majorIds !== undefined) out.major_ids = Array.isArray(payload.majorIds) ? payload.majorIds.map(Number).filter(n => Number.isFinite(n)) : []
  if (payload.prerequisiteIds !== undefined) out.prerequisite_ids = Array.isArray(payload.prerequisiteIds) ? payload.prerequisiteIds.map(Number).filter(n => Number.isFinite(n)) : []
  if (payload.description !== undefined) out.description = payload.description
  return out
}