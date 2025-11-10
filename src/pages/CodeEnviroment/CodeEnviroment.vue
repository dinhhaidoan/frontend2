<template>
  <div class="code-environment-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fas fa-code"></i>
            Môi trường Code
          </h1>
          <p class="page-subtitle">Viết code và xem kết quả trực tiếp</p>
        </div>
        <div class="header-right">
          <!-- Font Size Control -->
          <div class="font-size-control">
            <button @click="decreaseEditorFontSize" class="btn-font-size" title="Giảm cỡ chữ">
              <i class="fas fa-minus"></i>
            </button>
            <span class="font-size-display">{{ editorFontSize }}px</span>
            <button @click="increaseEditorFontSize" class="btn-font-size" title="Tăng cỡ chữ">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          
          <!-- Upload File -->
          <label class="btn-upload" title="Tải file code lên">
            <i class="fas fa-upload"></i>
            <span>Tải lên</span>
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileUpload"
              accept=".html,.css,.js,.java,.py,.sql,.cs,.cpp,.txt"
              style="display: none;"
            >
          </label>
          
          <button @click="showSettings = true" class="btn-settings">
            <i class="fas fa-cog"></i>
            Cài đặt
          </button>
          <button @click="resetCode" class="btn-reset">
            <i class="fas fa-redo"></i>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="code-container">
      <!-- Sidebar - Language Selection -->
      <div class="language-sidebar">
        <div class="sidebar-header">
          <h3>Ngôn ngữ</h3>
        </div>
        <div class="language-list">
          <div 
            v-for="lang in languages" 
            :key="lang.id"
            :class="['language-item', { active: currentLanguage === lang.id }]"
            @click="switchLanguage(lang.id)"
          >
            <i :class="lang.icon"></i>
            <span>{{ lang.name }}</span>
          </div>
        </div>
        
        <div class="sidebar-footer">
          <button @click="showTemplates = true" class="btn-templates">
            <i class="fas fa-file-code"></i>
            Templates
          </button>
        </div>
      </div>

      <!-- Code Editor Area -->
      <div class="editor-section">
        <!-- Tab Bar -->
        <div class="tab-bar">
          <div 
            v-for="tab in currentTabs" 
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </div>
        </div>

        <!-- Editor Content -->
        <div class="editor-content">
          <CodeEditor
            v-show="activeTab === 'html' && currentLanguage === 'web'"
            v-model="code.html"
            language="html"
            :fontSize="editorFontSize"
            @update:modelValue="updatePreview"
          />
          <CodeEditor
            v-show="activeTab === 'css' && currentLanguage === 'web'"
            v-model="code.css"
            language="css"
            :fontSize="editorFontSize"
            @update:modelValue="updatePreview"
          />
          <CodeEditor
            v-show="activeTab === 'javascript' && currentLanguage === 'web'"
            v-model="code.js"
            language="javascript"
            :fontSize="editorFontSize"
            @update:modelValue="updatePreview"
          />
          <CodeEditor
            v-show="currentLanguage === 'java'"
            v-model="code.java"
            language="java"
            :fontSize="editorFontSize"
          />
          <CodeEditor
            v-show="currentLanguage === 'python'"
            v-model="code.python"
            language="python"
            :fontSize="editorFontSize"
          />
          <CodeEditor
            v-show="currentLanguage === 'sql'"
            v-model="code.sql"
            language="sql"
            :fontSize="editorFontSize"
          />
          <CodeEditor
            v-show="currentLanguage === 'csharp'"
            v-model="code.csharp"
            language="csharp"
            :fontSize="editorFontSize"
          />
          <CodeEditor
            v-show="currentLanguage === 'cpp'"
            v-model="code.cpp"
            language="cpp"
            :fontSize="editorFontSize"
          />
        </div>

        <!-- Action Buttons -->
        <div class="editor-actions">
          <button @click="downloadCode" class="btn-action">
            <i class="fas fa-download"></i>
            Tải xuống
          </button>
          <button @click="copyCode" class="btn-action">
            <i class="fas fa-copy"></i>
            Copy
          </button>
          <button v-if="currentLanguage === 'web'" @click="openPopupPreview" class="btn-action btn-primary">
            <i class="fas fa-external-link-alt"></i>
            Xem toàn màn hình
          </button>
        </div>
      </div>

      <!-- Preview Section (for web only) -->
      <div v-if="currentLanguage === 'web'" class="preview-section">
        <div class="preview-header">
          <h3>
            <i class="fas fa-eye"></i>
            Xem trước
          </h3>
          <button @click="updatePreview" class="btn-refresh">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        <div class="preview-content">
          <iframe 
            ref="previewFrame"
            class="preview-frame"
            sandbox="allow-scripts allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin"
          ></iframe>
        </div>
      </div>

      <!-- Console Output (for non-web languages) -->
      <div v-else class="console-section">
        <div class="console-header">
          <h3>
            <i class="fas fa-terminal"></i>
            Console Output
          </h3>
          <button @click="runCode" class="btn-run">
            <i class="fas fa-play"></i>
            Chạy
          </button>
        </div>
        <div class="console-content" v-html="consoleOutput"></div>
      </div>
    </div>

    <!-- Templates Modal -->
    <TemplatesModal
      v-if="showTemplates"
      :language="currentLanguage"
      @close="showTemplates = false"
      @select="loadTemplate"
    />

    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />

    <!-- NEW POPUP PREVIEW - COMPLETELY REDESIGNED -->
    <Teleport to="body">
      <div v-if="showPreviewPopup" class="fullscreen-preview-overlay">
        <!-- Preview Window -->
        <div class="fullscreen-preview-window">
          <!-- Top Control Bar -->
          <div class="preview-control-bar">
            <div class="control-left">
              <div class="window-controls">
                <button @click="showPreviewPopup = false" class="control-btn close-btn" title="Đóng (ESC)">
                  <i class="fas fa-times"></i>
                </button>
                <button class="control-btn minimize-btn">
                  <i class="fas fa-window-minimize"></i>
                </button>
                <button class="control-btn maximize-btn">
                  <i class="fas fa-window-maximize"></i>
                </button>
              </div>
              <span class="preview-title">
                <i class="fas fa-browser"></i>
                HTML Preview
              </span>
            </div>
            <div class="control-right">
              <button @click="refreshPopupPreview" class="control-action-btn">
                <i class="fas fa-redo"></i>
                <span>Refresh</span>
              </button>
              <button @click="showPreviewPopup = false" class="control-action-btn close-action-btn">
                <i class="fas fa-times-circle"></i>
                <span>Close</span>
              </button>
            </div>
          </div>

          <!-- Preview Content -->
          <div class="preview-iframe-container">
            <iframe 
              ref="popupPreviewFrame"
              class="fullscreen-preview-iframe"
              sandbox="allow-scripts allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin"
            ></iframe>
          </div>

          <!-- Bottom Status Bar -->
          <div class="preview-status-bar">
            <div class="status-left">
              <span class="status-indicator"></span>
              <span>Ready</span>
            </div>
            <div class="status-right">
              <span>Press ESC or click Close to exit</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import CodeEditor from '@/components/CodeEnviroment/CodeEditor.vue'
import TemplatesModal from '@/components/CodeEnviroment/TemplatesModal.vue'

// Language definitions
const languages = ref([
  { id: 'web', name: 'HTML/CSS/JS', icon: 'fab fa-html5' },
  { id: 'java', name: 'Java', icon: 'fab fa-java' },
  { id: 'python', name: 'Python', icon: 'fab fa-python' },
  { id: 'sql', name: 'SQL', icon: 'fas fa-database' },
  { id: 'csharp', name: 'C#', icon: 'fas fa-hashtag' },
  { id: 'cpp', name: 'C++', icon: 'fas fa-code' }
])

// State
const currentLanguage = ref('web')
const activeTab = ref('html')
const showTemplates = ref(false)
const showSettings = ref(false)
const showPreviewPopup = ref(false)
const editorFontSize = ref(14)

// Code storage
const code = ref({
  html: '<header>\n  <h1>Hello, World!</h1>\n</header>\n\n<main>\n  <section>\n    <h2>Welcome to Code Environment!</h2>\n    <p>Start writing your HTML5 code here...</p>\n  </section>\n</main>\n\n<footer>\n  <p>&copy; 2025 Code Environment</p>\n</footer>',
  css: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n  color: white;\n}\n\nheader, main, footer {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nh1 {\n  font-size: 3em;\n  margin: 0;\n  text-align: center;\n}',
  js: 'console.log("Hello from JavaScript!");\n\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Page loaded!");\n});',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  python: 'print("Hello, World!")\n\n# Your Python code here',
  sql: 'SELECT * FROM users WHERE active = 1;',
  csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, C#!");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}'
})

const consoleOutput = ref('')
const previewFrame = ref(null)
const popupPreviewFrame = ref(null)
const fileInput = ref(null)

// Computed
const currentTabs = computed(() => {
  if (currentLanguage.value === 'web') {
    return [
      { id: 'html', name: 'HTML', icon: 'fab fa-html5' },
      { id: 'css', name: 'CSS', icon: 'fab fa-css3-alt' },
      { id: 'javascript', name: 'JavaScript', icon: 'fab fa-js' }
    ]
  }
  return []
})

// Methods
const switchLanguage = (lang) => {
  currentLanguage.value = lang
  if (lang === 'web') {
    activeTab.value = 'html'
    updatePreview()
  } else {
    consoleOutput.value = ''
  }
}

const updatePreview = () => {
  if (currentLanguage.value !== 'web' || !previewFrame.value) return
  
  const iframe = previewFrame.value
  const doc = iframe.contentDocument || iframe.contentWindow.document
  
  // Check if HTML has DOCTYPE
  const hasDoctype = code.value.html.trim().toLowerCase().startsWith('<!doctype')
  
  let preview = ''
  if (hasDoctype) {
    // Inject CSS and JS into existing structure
    preview = code.value.html
      .replace('</head>', `<style>${code.value.css}</style>\n</head>`)
      .replace('</body>', `<script>${code.value.js}<\/script>\n</body>`)
  } else {
    // Wrap body content with full HTML5 structure
    preview = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${code.value.css}</style>
</head>
<body>
${code.value.html}
<script>${code.value.js}<\/script>
</body>
</html>`
  }
  
  doc.open()
  doc.write(preview)
  doc.close()
}

const updatePopupPreview = () => {
  if (!popupPreviewFrame.value) return
  
  const iframe = popupPreviewFrame.value
  const doc = iframe.contentDocument || iframe.contentWindow.document
  
  const hasDoctype = code.value.html.trim().toLowerCase().startsWith('<!doctype')
  
  let preview = ''
  if (hasDoctype) {
    preview = code.value.html
      .replace('</head>', `<style>${code.value.css}</style>\n</head>`)
      .replace('</body>', `<script>${code.value.js}<\/script>\n</body>`)
  } else {
    preview = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${code.value.css}</style>
</head>
<body>
${code.value.html}
<script>${code.value.js}<\/script>
</body>
</html>`
  }
  
  doc.open()
  doc.write(preview)
  doc.close()
}

const openPopupPreview = () => {
  showPreviewPopup.value = true
  setTimeout(() => {
    updatePopupPreview()
  }, 100)
}

const refreshPopupPreview = () => {
  updatePopupPreview()
}

const runCode = () => {
  // Simulated code execution
  consoleOutput.value = '<div class="output-info">Running code...</div>'
  
  setTimeout(() => {
    const lang = currentLanguage.value
    if (lang === 'java') {
      consoleOutput.value = '<div class="output-success">Hello, World!</div>'
    } else if (lang === 'python') {
      consoleOutput.value = '<div class="output-success">Hello, World!</div>'
    } else if (lang === 'csharp') {
      consoleOutput.value = '<div class="output-success">Hello, C#!</div>'
    } else if (lang === 'cpp') {
      consoleOutput.value = '<div class="output-success">Hello, C++!</div>'
    } else if (lang === 'sql') {
      consoleOutput.value = '<div class="output-info">Query executed successfully</div>'
    }
  }, 500)
}

const downloadCode = () => {
  const lang = currentLanguage.value
  let content = ''
  let filename = ''
  
  if (lang === 'web') {
    const hasDoctype = code.value.html.trim().toLowerCase().startsWith('<!doctype')
    if (hasDoctype) {
      content = code.value.html
        .replace('</head>', `<style>${code.value.css}</style>\n</head>`)
        .replace('</body>', `<script>${code.value.js}<\/script>\n</body>`)
    } else {
      content = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Code</title>
  <style>${code.value.css}</style>
</head>
<body>
${code.value.html}
<script>${code.value.js}<\/script>
</body>
</html>`
    }
    filename = 'index.html'
  } else {
    content = code.value[lang]
    const extensions = {
      java: '.java',
      python: '.py',
      sql: '.sql',
      csharp: '.cs',
      cpp: '.cpp'
    }
    filename = 'code' + extensions[lang]
  }
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const copyCode = () => {
  const lang = currentLanguage.value
  let content = ''
  
  if (lang === 'web') {
    const hasDoctype = code.value.html.trim().toLowerCase().startsWith('<!doctype')
    if (hasDoctype) {
      content = code.value.html
        .replace('</head>', `<style>${code.value.css}</style>\n</head>`)
        .replace('</body>', `<script>${code.value.js}<\/script>\n</body>`)
    } else {
      content = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Code</title>
  <style>${code.value.css}</style>
</head>
<body>
${code.value.html}
<script>${code.value.js}<\/script>
</body>
</html>`
    }
  } else {
    content = code.value[lang]
  }
  
  navigator.clipboard.writeText(content).then(() => {
    alert('Code copied to clipboard!')
  })
}

const resetCode = () => {
  if (confirm('Are you sure you want to reset all code?')) {
    code.value = {
      html: '<header>\n  <h1>Hello, World!</h1>\n</header>\n\n<main>\n  <section>\n    <h2>Welcome to Code Environment!</h2>\n    <p>Start writing your HTML5 code here...</p>\n  </section>\n</main>\n\n<footer>\n  <p>&copy; 2025 Code Environment</p>\n</footer>',
      css: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n  color: white;\n}\n\nheader, main, footer {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nh1 {\n  font-size: 3em;\n  margin: 0;\n  text-align: center;\n}',
      js: 'console.log("Hello from JavaScript!");\n\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Page loaded!");\n});',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      python: 'print("Hello, World!")\n\n# Your Python code here',
      sql: 'SELECT * FROM users WHERE active = 1;',
      csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, C#!");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}'
    }
    updatePreview()
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const extension = file.name.split('.').pop().toLowerCase()
    
    // Auto-detect language and load content
    if (extension === 'html') {
      currentLanguage.value = 'web'
      code.value.html = content
      activeTab.value = 'html'
      updatePreview()
      // Auto open popup for HTML files
      setTimeout(() => {
        openPopupPreview()
      }, 300)
    } else if (extension === 'css') {
      currentLanguage.value = 'web'
      code.value.css = content
      activeTab.value = 'css'
      updatePreview()
    } else if (extension === 'js') {
      currentLanguage.value = 'web'
      code.value.js = content
      activeTab.value = 'javascript'
      updatePreview()
    } else if (extension === 'java') {
      currentLanguage.value = 'java'
      code.value.java = content
    } else if (extension === 'py') {
      currentLanguage.value = 'python'
      code.value.python = content
    } else if (extension === 'sql') {
      currentLanguage.value = 'sql'
      code.value.sql = content
    } else if (extension === 'cs') {
      currentLanguage.value = 'csharp'
      code.value.csharp = content
    } else if (extension === 'cpp') {
      currentLanguage.value = 'cpp'
      code.value.cpp = content
    }
  }
  reader.readAsText(file)
  
  // Reset file input
  event.target.value = ''
}

const increaseEditorFontSize = () => {
  if (editorFontSize.value < 28) {
    editorFontSize.value++
  }
}

const decreaseEditorFontSize = () => {
  if (editorFontSize.value > 10) {
    editorFontSize.value--
  }
}

const loadTemplate = (template) => {
  if (template.language === 'web') {
    code.value.html = template.html || ''
    code.value.css = template.css || ''
    code.value.js = template.js || ''
    updatePreview()
  } else {
    code.value[template.language] = template.code || ''
  }
  showTemplates.value = false
}

// ESC key to close popup
const handleEscKey = (e) => {
  if (e.key === 'Escape' && showPreviewPopup.value) {
    showPreviewPopup.value = false
  }
}

// Lifecycle
onMounted(() => {
  updatePreview()
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})

// Watch for popup preview changes
watch(showPreviewPopup, (newVal) => {
  if (newVal) {
    updatePopupPreview()
  }
})
</script>

<style scoped>
/* ============================================
   LAYOUT & GENERAL STYLES
   ============================================ */

.code-environment-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

/* Page Header */
.page-header {
  background: white;
  border-bottom: 2px solid #e5e7eb;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 2000px;
  margin: 0 auto;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 4px;
  font-size: 28px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #667eea;
}

.page-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Font Size Control */
.font-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.btn-font-size {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-font-size:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.font-size-display {
  min-width: 45px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

/* Action Buttons */
.btn-upload,
.btn-settings,
.btn-reset {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-upload:hover,
.btn-settings:hover,
.btn-reset:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Main Code Container */
.code-container {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  max-width: 2000px;
  margin: 0 auto;
  width: 100%;
}

/* Language Sidebar */
.language-sidebar {
  width: 220px;
  background: white;
  border-right: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.language-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.language-item {
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  transition: all 0.2s;
}

.language-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.language-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.language-item i {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.btn-templates {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-templates:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

/* Editor Section */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 2px solid #e5e7eb;
  min-width: 0;
}

.tab-bar {
  display: flex;
  gap: 4px;
  padding: 12px 12px 0;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab.active {
  background: white;
  color: #667eea;
  border-color: #667eea;
  position: relative;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: white;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.editor-actions {
  padding: 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-action {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-action.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-action.btn-primary:hover {
  background: #5568d3;
}

/* Preview Section */
.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 400px;
}

.preview-header {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: rotate(180deg);
}

.preview-content {
  flex: 1;
  background: #f5f7fa;
  overflow: hidden;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* Console Section */
.console-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
  min-width: 400px;
}

.console-header {
  padding: 16px 20px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.console-header h3 {
  margin: 0;
  font-size: 16px;
  color: #d4d4d4;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-run {
  background: #16a34a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-run:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.console-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.console-content :deep(.output-success) {
  color: #4ade80;
}

.console-content :deep(.output-error) {
  color: #f87171;
}

.console-content :deep(.output-info) {
  color: #60a5fa;
}

/* ============================================
   FULLSCREEN PREVIEW POPUP - NEW DESIGN
   ============================================ */

.fullscreen-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(10px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-preview-window {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  animation: windowSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 100px rgba(102, 126, 234, 0.3);
}

@keyframes windowSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Top Control Bar */
.preview-control-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #5568d3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.window-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.control-btn.close-btn {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.control-btn.close-btn:hover {
  background: #ef4444;
  border-color: #dc2626;
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.control-right {
  display: flex;
  gap: 12px;
}

.control-action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.control-action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-action-btn.close-action-btn {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.control-action-btn.close-action-btn:hover {
  background: #ef4444;
  border-color: #dc2626;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

/* Preview Content Container */
.preview-iframe-container {
  flex: 1;
  background: #f5f7fa;
  overflow: hidden;
  position: relative;
}

.fullscreen-preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* Bottom Status Bar */
.preview-status-bar {
  background: #e9ecef;
  border-top: 2px solid #dee2e6;
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #495057;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: statusPulse 2s infinite;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .code-container {
    flex-direction: column;
  }
  
  .language-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .language-list {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .language-item {
    flex-shrink: 0;
  }
  
  .preview-section,
  .console-section {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .header-right {
    flex-direction: column;
    gap: 8px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .preview-title {
    font-size: 16px;
  }
  
  .control-action-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
