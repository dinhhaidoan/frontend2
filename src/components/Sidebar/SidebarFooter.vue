<template>
  <div class="sidebar-footer">
    <div class="footer-content">
      <div class="version-info">
        <div class="version-badge">
          <i class="fas fa-code-branch"></i>
          <span class="version-text">StudyHub v1.0</span>
        </div>
      </div>
      <div class="copyright">
        <p class="copyright-text">© 2025 All rights reserved</p>
      </div>
    </div>
    <div class="footer-glow"></div>
  </div>
</template>

<script setup>
// No props or logic needed for this component
</script>

<style scoped>
.sidebar-footer {
  position: relative;
  padding: 20px 24px;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  background: linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.footer-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.version-info {
  display: flex;
  justify-content: center;
}

.version-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.version-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.version-badge:hover::before {
  left: 100%;
}

.version-badge:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.version-badge i {
  font-size: 12px;
  color: #3b82f6;
  transition: all 0.3s ease;
}

.version-badge:hover i {
  color: #1d4ed8;
  transform: scale(1.1);
}

.version-text {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.version-badge:hover .version-text {
  color: #1d4ed8;
}

.copyright {
  display: flex;
  justify-content: center;
}

.copyright-text {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  text-align: center;
  line-height: 1.4;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.sidebar-footer:hover .copyright-text {
  color: #6b7280;
}

/* Footer Glow Effect */
.footer-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center top,
    rgba(59, 130, 246, 0.05),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.sidebar-footer:hover .footer-glow {
  opacity: 1;
}

/* Animated gradient border */
.sidebar-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.3),
    rgba(147, 51, 234, 0.3),
    transparent
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.sidebar-footer:hover::before {
  opacity: 1;
}

/* Pulse animation for version badge */
.version-badge {
  animation: gentle-pulse 4s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { 
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
  50% { 
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .sidebar-footer {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.8));
    border-top-color: rgba(75, 85, 99, 0.3);
  }
  
  .version-text {
    color: #60a5fa;
  }
  
  .version-badge:hover .version-text {
    color: #93c5fd;
  }
  
  .version-badge i {
    color: #60a5fa;
  }
  
  .version-badge:hover i {
    color: #93c5fd;
  }
  
  .copyright-text {
    color: #6b7280;
  }
  
  .sidebar-footer:hover .copyright-text {
    color: #9ca3af;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar-footer {
    padding: 16px 20px;
  }
  
  .footer-content {
    gap: 10px;
  }
  
  .version-badge {
    padding: 6px 10px;
  }
  
  .version-text {
    font-size: 11px;
  }
  
  .copyright-text {
    font-size: 10px;
  }
}

/* Accessibility improvements */
.version-badge:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .version-badge,
  .footer-glow,
  .sidebar-footer::before,
  .copyright-text {
    transition: none;
    animation: none;
  }
}

/* Print styles */
@media print {
  .sidebar-footer {
    background: white;
    border-top: 1px solid #000;
  }
  
  .footer-glow,
  .sidebar-footer::before {
    display: none;
  }
  
  .version-text,
  .copyright-text {
    color: #000;
  }
}
</style>