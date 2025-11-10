<template>
  <div class="sidebar-logo">
    <router-link to="/" class="logo-link group">
      <div class="logo-icon-wrapper">
        <div class="logo-icon">
          <i class="fas fa-graduation-cap"></i>
          <div class="icon-glow"></div>
        </div>
      </div>
      <div class="logo-text">
        <h1 class="brand-name">
          <span class="brand-study">Study</span><span class="brand-hub">Hub</span>
        </h1>
      </div>
    </router-link>
  </div>
</template>

<script setup>
// No props needed for this component
</script>

<style scoped>
.sidebar-logo {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logo-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.logo-link:hover::before {
  left: 100%;
}

.logo-link:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
}

/* Logo Icon */
.logo-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 3px 12px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  border-radius: 12px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-link:hover .logo-icon::before {
  opacity: 1;
  animation: rotate 2s linear infinite;
}

.logo-link:hover .logo-icon {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.logo-icon i {
  font-size: 18px;
  color: white;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-link:hover .logo-icon i {
  transform: scale(1.1);
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

/* Icon Glow Effect */
.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
}

.logo-link:hover .icon-glow {
  transform: translate(-50%, -50%) scale(1.8);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Logo Text */
.logo-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  line-height: 1;
}

.brand-study {
  background: linear-gradient(135deg, #1f2937, #4b5563);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.brand-hub {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.logo-link:hover .brand-study {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateY(-1px);
}

.logo-link:hover .brand-hub {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateY(-1px);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .brand-study {
    background: linear-gradient(135deg, #f9fafb, #d1d5db);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .logo-link:hover .brand-study {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

/* Loading shimmer effect */
.logo-link::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.logo-link:hover::after {
  left: 100%;
}
</style>