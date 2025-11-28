// courseSchedule.js
// Maps API payload to UI-friendly schedule objects and converts UI object to API payload

const apiWeekdayToUi = (weekdayId) => {
  if (!weekdayId && weekdayId !== 0) return null
  // Backend weekday: 1..7 (Mon=1), UI in this project often uses 1..7 too, but some components use 2..8 mapping (Mon=2.. Sun=8)
  // Keep consistent with project: we will keep weekdayId as number 1..7
  return Number(weekdayId)
}

const toApiWeekday = (weekdayId) => {
  if (weekdayId === undefined || weekdayId === null) return null
  const v = Number(weekdayId)
  // UI may use 2..8 (Mon..Sun mapping) or 1..7, or 0 for Sunday in some components
  if (Number.isNaN(v)) return null
  if (v === 0) return 7 // sunday (0 used by calendars) -> 7
  if (v >= 2 && v <= 8) {
    // convert 2..8 -> 1..7
    return v === 8 ? 7 : v - 1
  }
  if (v >= 1 && v <= 7) return v
  return v
}

export const mapCourseSchedule = (raw = {}) => {
  const CourseScheduleDays = raw.CourseScheduleDays || []
  const scheduleDays = CourseScheduleDays.map(d => {
    const slots = (d.CourseScheduleSlots || []).map(s => Number(s.slot_number))
    const timeSlots = slots.map(s => String(s))
    return {
      id: d.day_id || null,
      weekdayId: d.weekday_id,
      dayOfWeek: d.weekday_id, // keep both
      weekdayName: d.Weekday?.weekday_name || null,
      slots,
      timeSlots,
      slotsText: (slots || []).join(', ')
    }
  })

  // derive useful fields for UI based on schema used elsewhere
  const schedule = {
    id: raw.schedule_id || raw.id || null,
    courseClassId: raw.course_class_id || null,
    subjectId: raw.course_class_id || null,
    scheduleType: raw.schedule_type || raw.type || 'study',
    groupName: raw.group_name || null,
    startDate: raw.start_date || null,
    endDate: raw.end_date || null,
    repeatType: raw.repeat_type || 'none',
    repeatWeeks: raw.repeat_weeks || null,
    scheduleDays,
    raw: raw
  }

  // Try to fill presentation-ready fields if available in the raw ledger
  if (raw.CourseClass) {
    schedule.subjectName = raw.CourseClass.subject_name || raw.CourseClass.name || ''
    schedule.subjectCode = raw.CourseClass.subject_code || ''
  } else if (raw.subject_name || raw.subjectName) {
    schedule.subjectName = raw.subject_name || raw.subjectName
    schedule.subjectCode = raw.subject_code || raw.subjectCode
  }

  if (raw.CourseClass) {
    schedule.courseClassSKU = raw.CourseClass.sku || ''
    schedule.courseClassName = raw.CourseClass.name || ''
  }

  schedule.CourseScheduleDays = CourseScheduleDays

  return schedule
}

export const mapCourseScheduleList = (rows = []) => Array.isArray(rows) ? rows.map(mapCourseSchedule) : []

export const toApiCourseSchedule = (payload = {}) => {
  const out = {}
  if (payload.courseClassId !== undefined) out.course_class_id = Number(payload.courseClassId)
  else if (payload.subjectId !== undefined) out.course_class_id = Number(payload.subjectId)
  if (payload.scheduleType !== undefined) out.schedule_type = payload.scheduleType
  else if (payload.schedule_type !== undefined) out.schedule_type = payload.schedule_type === 'class' ? 'study' : payload.schedule_type
  else if (payload.type !== undefined) out.schedule_type = payload.type === 'class' ? 'study' : payload.type
  if (payload.groupName !== undefined) out.group_name = payload.groupName || null
  if (payload.startDate !== undefined) out.start_date = payload.startDate || null
  if (payload.endDate !== undefined) out.end_date = payload.endDate || null
  if (payload.repeatType !== undefined) {
    let rt = payload.repeatType
    if (rt === 'custom') rt = 'custom_weeks'
    out.repeat_type = rt
  }
  else if (payload.repeat_type !== undefined) {
    let rt = payload.repeat_type
    if (rt === 'custom') rt = 'custom_weeks'
    out.repeat_type = rt
  }
  // Support both `repeatWeeks` (array/number) or `repeatInterval` as a numeric value
  if (payload.repeatWeeks !== undefined) out.repeat_weeks = payload.repeatWeeks
  else if (payload.repeat_weeks !== undefined) out.repeat_weeks = payload.repeat_weeks
  else if (payload.repeatInterval !== undefined) out.repeat_weeks = payload.repeatInterval

  if (Array.isArray(payload.scheduleDays)) {
    out.days = payload.scheduleDays.map(d => {
      // support different keys for UI components ('weekdayId' or 'day')
      const weekdayId = d.weekdayId !== undefined ? toApiWeekday(d.weekdayId) : (d.day !== undefined ? toApiWeekday(d.day) : null)
      const slots = (d.slots || []).map(s => Number(s))
      return { weekday_id: weekdayId, slots }
    })
  }

  return out
}

export default {
  mapCourseSchedule,
  mapCourseScheduleList,
  toApiCourseSchedule
}
