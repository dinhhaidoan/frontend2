// Mapping functions for academic year objects

export const mapAcademicYear = (raw = {}) => {
	// Support multiple shapes returned by API; normalize to frontend friendly format
	const id = raw.academic_year_id || raw.id || raw.academicYearId || raw.academic_year?.academic_year_id
	const name = raw.academic_year_name || raw.name || raw.title || raw.academic_year?.academic_year_name
	const start = raw.academic_year_start || raw.start || raw.academic_year?.academic_year_start
	const end = raw.academic_year_end || raw.end || raw.academic_year?.academic_year_end

	return {
		id,
		name,
		start: start !== undefined ? Number(start) : null,
		end: end !== undefined ? Number(end) : null,
		raw
	}
}

export const mapAcademicYearsList = (arr = []) => (Array.isArray(arr) ? arr.map(mapAcademicYear) : [])
