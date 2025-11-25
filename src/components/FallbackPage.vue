<template>
  <div style="padding:24px; max-width:1100px; margin:0 auto">
    <h2 style="margin:0 0 8px">{{ routeName }}</h2>
    <p style="margin:0 0 16px;color:#6b7280">
      Nội dung demo cho trang <strong>{{ routeName }}</strong>.
    </p>
    <div style="padding:16px;background:rgba(255,255,255,0.9);border-radius:12px;border:1px solid rgba(0,0,0,0.04)">
      Thêm component cụ thể vào <code>src/components</code> hoặc <code>src/pages</code> rồi cập nhật router.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routeName = computed(() => route.name || route.path.replace('/', ''))
</script>