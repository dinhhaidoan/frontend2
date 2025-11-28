import { ref } from 'vue'
import scheduleService from '@/services/scheduleService'
import { mapCourseSchedule, mapCourseScheduleList, toApiCourseSchedule } from '@/types/courseSchedule'

export const useCourseSchedules = () => {
  const loading = ref(false)
  const schedules = ref([])
  const rawSchedules = ref([])
  const pagination = ref({ page: 1, limit: 20, total: 0 })

  const fetchCourseSchedules = async (params = {}) => {
    loading.value = true
    try {
      const res = await scheduleService.listCourseSchedules(params)
      // API should return { count, rows }
      if (res) {
        const rows = res.rows || res.data || res.items || []
        rawSchedules.value = mapCourseScheduleList(rows)
        // flatten occurrences for calendars and table usage
        schedules.value = flattenSchedules(rawSchedules.value)
        pagination.value = { page: params.page || 1, limit: params.limit || 20, total: res.count || res.total || (rows.length || 0) }
        // Debug log for fetched rows and whether parent rows have days defined
        try {
          const parentsMissingDays = rows.filter(r => !(r.CourseScheduleDays && r.CourseScheduleDays.length > 0))
          console.debug('useCourseSchedules.fetchCourseSchedules:', { params, rowsCount: rows.length, flattenedCount: schedules.value.length, parentsMissingDaysCount: parentsMissingDays.length, sampleParentsMissingDays: parentsMissingDays.slice(0,3).map(r => ({ id: r.schedule_id || r.id || null, CourseScheduleDays: r.CourseScheduleDays?.length || 0 })) })
        } catch (e) { /* swallow */ }
      }
      return schedules.value
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper: slot mapping used to derive time strings
  const SLOT_TIMES = {
    1: { label: 'Tiết 1', time: '07:00-07:45', start: '07:00', end: '07:45' },
    2: { label: 'Tiết 2', time: '07:50-08:35', start: '07:50', end: '08:35' },
    3: { label: 'Tiết 3', time: '08:40-09:25', start: '08:40', end: '09:25' },
    4: { label: 'Tiết 4', time: '09:35-10:20', start: '09:35', end: '10:20' },
    5: { label: 'Tiết 5', time: '10:25-11:10', start: '10:25', end: '11:10' },
    6: { label: 'Tiết 6', time: '13:00-13:45', start: '13:00', end: '13:45' },
    7: { label: 'Tiết 7', time: '13:50-14:35', start: '13:50', end: '14:35' },
    8: { label: 'Tiết 8', time: '14:40-15:25', start: '14:40', end: '15:25' },
    9: { label: 'Tiết 9', time: '15:35-16:20', start: '15:35', end: '16:20' },
    10: { label: 'Tiết 10', time: '16:25-17:10', start: '16:25', end: '17:10' },
    11: { label: 'Tiết 11', time: '18:00-18:45', start: '18:00', end: '18:45' },
    12: { label: 'Tiết 12', time: '18:50-19:35', start: '18:50', end: '19:35' },
    13: { label: 'Tiết 13', time: '19:40-20:25', start: '19:40', end: '20:25' }
  }

  const flattenSchedules = (parents = []) => {
    const flat = []
    parents.forEach(parent => {
      const scheduleId = parent.id || parent.schedule_id
      const base = {
        id: scheduleId,
        parentId: scheduleId,
        scheduleType: parent.scheduleType || parent.schedule_type || 'study',
        courseClassId: parent.courseClassId || parent.course_class_id,
        subjectName: parent.subjectName || parent.subject_name || (parent.CourseClass && (parent.CourseClass.subject_name || parent.CourseClass.name)),
        subjectCode: parent.subjectCode || parent.subject_code || (parent.CourseClass && parent.CourseClass.subject_code),
        teacherName: parent.teacherName || parent.teacher_name || parent.Teacher?.name || (parent.CourseClass && parent.CourseClass.teacher_name) || null,
        roomName: parent.roomName || parent.room_name || parent.Room?.name || (parent.CourseClass && parent.CourseClass.room_name) || null,
        groupName: parent.groupName || parent.group_name,
        startDate: parent.startDate || parent.start_date,
        endDate: parent.endDate || parent.end_date,
        raw: parent.raw || parent
      }
        // add helpful ids for filtering and joining
        base.semesterId = parent.semesterId || parent.semester_id || (parent.CourseClass && (parent.CourseClass.semester || parent.CourseClass.semester_id)) || null
        base.teacherId = parent.teacherId || parent.teacher_id || parent.Teacher?.id || (parent.CourseClass && (parent.CourseClass.teacherId || parent.CourseClass.teacher_id)) || null
        base.roomId = parent.roomId || parent.room_id || parent.Room?.id || (parent.CourseClass && (parent.CourseClass.room_id || parent.CourseClass.roomId)) || null
        base.subjectId = parent.subjectId || parent.subject_id || parent.courseClassId || parent.course_class_id || (parent.CourseClass && (parent.CourseClass.id || parent.CourseClass.course_class_id)) || null

      const days = parent.scheduleDays || parent.CourseScheduleDays || []
      days.forEach(d => {
        const rawWeekday = d.weekdayId || d.weekday_id || d.day || d.dayOfWeek || null
        const normalizeWeekday = (w) => {
          if (w === undefined || w === null) return null
          const v = Number(w)
          if (Number.isNaN(v)) return null
          // backend 2..8 -> 1..7 mapping, convert
          if (v >= 2 && v <= 8) {
            const m = (v === 8 ? 7 : v - 1)
            return m === 7 ? 0 : m
          }
          // backend 1..7 mapping
          if (v >= 1 && v <= 7) {
            return v === 7 ? 0 : v
          }
          // other cases (0 for sunday)
          if (v === 0) return 0
          return v
        }
        const weekday = normalizeWeekday(rawWeekday)
        const slots = (d.slots || d.CourseScheduleSlots || []).map(s => typeof s === 'object' ? (s.slot_number || s.slotNumber) : s)
        slots.forEach(slotNum => {
          const slot = SLOT_TIMES[Number(slotNum)]
          const uiDayOfWeek = weekday
          flat.push({
            ...base,
            id: `${scheduleId}-${weekday}-${slotNum}`,
            occurrenceId: `${scheduleId}-${weekday}-${slotNum}`,
            scheduleId: scheduleId,
            dayOfWeek: uiDayOfWeek,
            slotNumber: Number(slotNum),
            startTime: slot ? slot.start : null,
            endTime: slot ? slot.end : null,
            timeSlot: slot ? slot.time : `${slotNum}`,
            date: parent.startDate || parent.start_date || null
          })
        })
      })
    })
    // debug: show sample flattened items with dayOfWeek and slotNumber
    try { console.debug('flattenSchedules sample', flat.slice(0, 5).map(i => ({ id: i.id, dayOfWeek: i.dayOfWeek, slot: i.slotNumber, time: i.timeSlot, date: i.date }))) } catch (e) {}
    return flat
  }

  const fetchCourseSchedule = async (id) => {
    loading.value = true
    try {
      const res = await scheduleService.getCourseSchedule(id)
      if (res) {
        // res might be {data: object} or raw object
        return mapCourseSchedule(res.data || res)
      }
      return null
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCourseSchedule = async (payload) => {
    loading.value = true
    try {
      const api = toApiCourseSchedule(payload)
      const res = await scheduleService.createCourseSchedule(api)
      return res
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCourseSchedule = async (id, payload) => {
    loading.value = true
    try {
      const api = toApiCourseSchedule(payload)
      const res = await scheduleService.updateCourseSchedule(id, api)
      return res
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCourseSchedule = async (id) => {
    loading.value = true
    try {
      const res = await scheduleService.deleteCourseSchedule(id)
      return res
    } catch (err) {
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    schedules,
    rawSchedules,
    pagination,
    fetchCourseSchedules,
    fetchCourseSchedule,
    createCourseSchedule,
    updateCourseSchedule,
    deleteCourseSchedule
  }
}

export default useCourseSchedules
