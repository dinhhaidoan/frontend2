// Helper to map backend user+Teacher nested to frontend friendly teacher object
export function mapTeacherUser(u) {
  if (!u) return null
  return {
    id: u.user_id || u.id || null,
    userId: u.user_code || null,
    name: u.Teacher?.teacher_name || u.user_fullname || u.user_code || '',
    email: u.user_email || '',
    phone: u.user_phone || '',
    avatar: u.user_avatar || null,
    avatar_public_id: u.user_avatar_public_id || null,
    role: u.Role?.role_name || null,
    is_active: u.is_active || u.user_active || false,
    teacher: u.Teacher || null,
    raw: u
  }
}

export default { mapTeacherUser }
