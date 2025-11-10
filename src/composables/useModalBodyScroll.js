import { onMounted, onUnmounted, watch, ref } from 'vue'

/**
 * Composable để quản lý body scroll khi modal mở/đóng
 * @param {Ref|Boolean} isOpen - Reactive reference hoặc boolean để theo dõi trạng thái modal
 * @returns {Object} - Các hàm để quản lý body scroll
 */
export function useModalBodyScroll(isOpen = ref(true)) {
  const originalOverflow = ref('')
  const originalPaddingRight = ref('')

  const disableBodyScroll = () => {
    // Lưu trữ giá trị gốc
    originalOverflow.value = document.body.style.overflow
    originalPaddingRight.value = document.body.style.paddingRight

    // Tính toán scrollbar width để tránh layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    // Áp dụng styles để ngăn scroll
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  const enableBodyScroll = () => {
    // Khôi phục giá trị gốc
    document.body.style.overflow = originalOverflow.value
    document.body.style.paddingRight = originalPaddingRight.value
  }

  // Theo dõi thay đổi của isOpen prop
  if (typeof isOpen === 'object' && isOpen.value !== undefined) {
    // isOpen là reactive reference
    watch(isOpen, (newVal) => {
      if (newVal) {
        disableBodyScroll()
      } else {
        enableBodyScroll()
      }
    }, { immediate: true })
  } else {
    // isOpen là boolean hoặc không được truyền vào
    onMounted(() => {
      disableBodyScroll()
    })
  }

  // Cleanup khi component unmount
  onUnmounted(() => {
    enableBodyScroll()
  })

  return {
    disableBodyScroll,
    enableBodyScroll
  }
}