import { ref, computed } from 'vue'
import shareService from '@/services/shareService'
import { useToast } from '@/composables/useToast'

export function useRooms() {
  const toast = useToast()
  const bases = ref([])
  const basesLoading = ref(false)
  const basesError = ref(null)

  const floorsByBase = ref({}) // { base_code: [floors] }
  const floorsLoadingByBase = ref({})
  const floorsErrorByBase = ref({})

  const roomsByFloor = ref({}) // { floor_id: [rooms] }
  const roomsLoadingByFloor = ref({})
  const roomsErrorByFloor = ref({})

  const fetchBases = async () => {
    if (bases.value.length) return bases.value
    basesLoading.value = true
    basesError.value = null
    try {
      const res = await shareService.listBases()
      // API returns { bases: [...] }
      const rows = res.bases || res || []
      bases.value = Array.isArray(rows) ? rows : []
      return bases.value
    } catch (err) {
      basesError.value = err
      toast.error(err.message || 'Không thể tải danh sách cơ sở')
      throw err
    } finally {
      basesLoading.value = false
    }
  }

  const fetchFloorsByBaseCode = async (baseCode) => {
    if (!baseCode) return []
    if (floorsByBase.value[baseCode]) return floorsByBase.value[baseCode]
    floorsLoadingByBase.value[baseCode] = true
    floorsErrorByBase.value[baseCode] = null
    try {
      const res = await shareService.listFloorsByBaseCode(baseCode)
      const rows = res.floors || res || []
      floorsByBase.value = { ...floorsByBase.value, [baseCode]: rows }
      return rows
    } catch (err) {
      floorsErrorByBase.value[baseCode] = err
      toast.error(err.message || `Không thể tải danh sách tầng của cơ sở ${baseCode}`)
      throw err
    } finally {
      floorsLoadingByBase.value[baseCode] = false
    }
  }

  const fetchRoomsByFloorId = async (floorId) => {
    if (!floorId) return []
    if (roomsByFloor.value[floorId]) return roomsByFloor.value[floorId]
    roomsLoadingByFloor.value[floorId] = true
    roomsErrorByFloor.value[floorId] = null
    try {
      const res = await shareService.listRoomsByFloorId(floorId)
      const rows = res.rooms || res || []
      roomsByFloor.value = { ...roomsByFloor.value, [floorId]: rows }
      return rows
    } catch (err) {
      roomsErrorByFloor.value[floorId] = err
      toast.error(err.message || 'Không thể tải danh sách phòng')
      throw err
    } finally {
      roomsLoadingByFloor.value[floorId] = false
    }
  }

  const fetchRoomsByBaseAndFloor = async (baseCode, floorNumber) => {
    if (!baseCode || floorNumber === undefined || floorNumber === null) return []
    // Use a key combined to cache
    const key = `${baseCode}_${floorNumber}`
    // Try to find by floor objects mapping
    const floorList = floorsByBase.value[baseCode] || []
    const floor = floorList.find(f => Number(f.floor_number) === Number(floorNumber))
    if (floor && roomsByFloor.value[floor.floor_id]) return roomsByFloor.value[floor.floor_id]

    let rooms = []
    try {
      const res = await shareService.listRoomsByBaseAndFloor(baseCode, floorNumber)
      rooms = res.rooms || res || []
      // store in roomsByFloor under floor_id if available
      if (floor && floor.floor_id) {
        roomsByFloor.value = { ...roomsByFloor.value, [floor.floor_id]: rooms }
      }
      return rooms
    } catch (err) {
      toast.error(err.message || `Không thể tải phòng của cơ sở ${baseCode} tầng ${floorNumber}`)
      throw err
    }
  }

  const parseRoomCode = (roomCode) => {
    // common formats: 'L.302', 'A101', 'L302', 'L-302'
    if (!roomCode || typeof roomCode !== 'string') return null
    const cleaned = roomCode.trim()
    // find base letter/s (prefix non-digit characters until first digit or dot)
    const match = cleaned.match(/^([A-Za-z]+)[.\-]?(\d+)$/)
    if (!match) return { room_code: cleaned }
    const [, base_code, numberStr] = match
    const num = parseInt(numberStr, 10)
    // floor number is conventionally the first digit of the room number (e.g., 302 -> 3)
    const floor_number = Math.floor(num / Math.pow(10, numberStr.length - 1))
    return { base_code: base_code.toUpperCase(), floor_number, room_number: num, room_code: cleaned }
  }

  const findRoomByCode = async (roomCode) => {
    // Attempt to parse room code and fetch corresponding room(s)
    const parsed = parseRoomCode(roomCode)
    if (!parsed) return null
    if (!parsed.base_code || !parsed.floor_number) {
      // Fallback: try searching endpoints by room code via listRooms
      try {
        const res = await shareService.listRooms({ room_code: roomCode })
        const rows = res.rooms || res || []
        return rows[0] || null
      } catch (err) {
        return null
      }
    }
    // Try to fetch rooms by base+floor and find the one with matching code
    try {
      const rooms = await fetchRoomsByBaseAndFloor(parsed.base_code, parsed.floor_number)
      if (!Array.isArray(rooms)) return null
      return rooms.find(r => (r.room_code || '').toString() === parsed.room_code) || null
    } catch (err) {
      return null
    }
  }

  return {
    bases: computed(() => bases.value),
    basesLoading,
    basesError,
    floorsByBase: computed(() => floorsByBase.value),
    floorsLoadingByBase,
    floorsErrorByBase,
    roomsByFloor: computed(() => roomsByFloor.value),
    roomsLoadingByFloor,
    roomsErrorByFloor,
    fetchBases,
    fetchFloorsByBaseCode,
    fetchRoomsByFloorId,
    fetchRoomsByBaseAndFloor,
    parseRoomCode,
    findRoomByCode
  }
}
