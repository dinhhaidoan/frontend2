// Mapping functions for semester objects

export const mapSemester = (raw = {}) => {
  const id = raw.semester_id || raw.id || raw.semesterId || raw.semester?.semester_id
  const name = raw.semester_name || raw.name || raw.title || raw.semester?.semester_name
  const startIso = raw.semester_start || raw.startDate || raw.semester?.semester_start || raw.start
  const endIso = raw.semester_end || raw.endDate || raw.semester?.semester_end || raw.end
  const maxCredits = raw.max_credits || raw.maxCredits || (raw.semester && raw.semester.max_credits) || 0
  const status = raw.status || (raw.semester && raw.semester.status) || 'upcoming'
  const subjectCount = raw.subject_count || raw.subjectCount || raw.subjects?.length || 0

  return {
    id,
    name,
    startDate: startIso || null, // keep ISO string YYYY-MM-DD for inputs
    endDate: endIso || null,
    maxCredits: Number(maxCredits || 0),
    status,
    subjectCount: Number(subjectCount || 0),
    raw
  }
}

export const mapSemestersList = (arr = []) => (Array.isArray(arr) ? arr.map(mapSemester) : [])
