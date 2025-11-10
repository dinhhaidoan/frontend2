<template>
  <div class="templates-modal-overlay" @click.self="$emit('close')">
    <div class="templates-modal">
      <div class="modal-header">
        <h2>
          <i class="fas fa-file-code"></i>
          Code Templates
        </h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Language Tabs -->
        <div class="language-tabs">
          <button
            v-for="lang in availableLanguages"
            :key="lang.id"
            :class="['lang-tab', { active: selectedLang === lang.id }]"
            @click="selectedLang = lang.id"
          >
            <i :class="lang.icon"></i>
            {{ lang.name }}
          </button>
        </div>

        <!-- Templates Grid -->
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
            @click="selectTemplate(template)"
          >
            <div class="template-icon" :style="{ background: template.color }">
              <i class="fas fa-code"></i>
            </div>
            <h3>{{ template.title }}</h3>
            <p>{{ template.description }}</p>
            <div class="template-preview">
              <code>{{ template.preview }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'web'
  }
})

const emit = defineEmits(['close', 'select'])

const selectedLang = ref(props.language)

const availableLanguages = [
  { id: 'web', name: 'Web', icon: 'fab fa-html5' },
  { id: 'java', name: 'Java', icon: 'fab fa-java' },
  { id: 'python', name: 'Python', icon: 'fab fa-python' },
  { id: 'sql', name: 'SQL', icon: 'fas fa-database' },
  { id: 'csharp', name: 'C#', icon: 'fas fa-hashtag' },
  { id: 'cpp', name: 'C++', icon: 'fas fa-code' }
]

const templates = [
  // Web Templates
  {
    id: 'web-basic',
    language: 'web',
    type: 'Basic',
    color: '#10b981',
    title: 'Basic HTML5',
    description: 'Trang HTML5 cơ bản với semantic elements',
    preview: '<header>...',
    html: '<header>\n  <h1>My Website</h1>\n  <nav>\n    <a href="#home">Home</a>\n    <a href="#about">About</a>\n    <a href="#contact">Contact</a>\n  </nav>\n</header>\n\n<main>\n  <article>\n    <h2>Welcome</h2>\n    <p>This is a basic HTML5 page using semantic elements.</p>\n  </article>\n</main>\n\n<footer>\n  <p>&copy; 2025 My Website</p>\n</footer>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n\nheader, main, footer {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nnav a {\n  color: white;\n  text-decoration: none;\n  margin-right: 20px;\n  font-weight: bold;\n}',
    js: 'console.log("Page loaded!");\n\ndocument.addEventListener("DOMContentLoaded", function() {\n  console.log("Ready!");\n});'
  },
  {
    id: 'web-landing',
    language: 'web',
    type: 'Landing Page',
    color: '#6366f1',
    title: 'Landing Page',
    description: 'Landing page đẹp mắt với gradient và animation',
    preview: '<section class="hero">...</section>',
    html: '<section class="hero">\n  <div class="container">\n    <h1 class="hero-title">Welcome to Our Product</h1>\n    <p class="hero-subtitle">Discover amazing features that will change your life</p>\n    <button class="cta-button">Get Started</button>\n  </div>\n</section>\n\n<section class="features">\n  <div class="container">\n    <div class="feature-card">\n      <i class="fas fa-rocket"></i>\n      <h3>Fast</h3>\n      <p>Lightning fast performance</p>\n    </div>\n    <div class="feature-card">\n      <i class="fas fa-shield-alt"></i>\n      <h3>Secure</h3>\n      <p>Bank-level security</p>\n    </div>\n    <div class="feature-card">\n      <i class="fas fa-star"></i>\n      <h3>Amazing</h3>\n      <p>Exceptional user experience</p>\n    </div>\n  </div>\n</section>',
    css: 'body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.hero {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  color: white;\n}\n\n.cta-button {\n  background: white;\n  color: #667eea;\n  border: none;\n  padding: 15px 40px;\n  font-size: 18px;\n  border-radius: 50px;\n  cursor: pointer;\n  transition: all 0.3s;\n}\n\n.cta-button:hover {\n  transform: scale(1.05);\n  box-shadow: 0 10px 30px rgba(0,0,0,0.2);\n}',
    js: 'document.querySelector(".cta-button").addEventListener("click", function() {\n  alert("Welcome!");\n});'
  },
  {
    id: 'web-form',
    language: 'web',
    type: 'Form',
    color: '#f59e0b',
    title: 'Contact Form',
    description: 'Form liên hệ với validation',
    preview: '<form class="contact-form">...</form>',
    html: '<div class="form-container">\n  <h2>Contact Us</h2>\n  <form id="contactForm" class="contact-form">\n    <div class="form-group">\n      <label for="name">Name *</label>\n      <input type="text" id="name" name="name" required>\n    </div>\n    \n    <div class="form-group">\n      <label for="email">Email *</label>\n      <input type="email" id="email" name="email" required>\n    </div>\n    \n    <div class="form-group">\n      <label for="message">Message *</label>\n      <textarea id="message" name="message" rows="5" required></textarea>\n    </div>\n    \n    <button type="submit" class="submit-btn">Send Message</button>\n  </form>\n</div>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  margin: 0;\n  padding: 20px;\n}\n\n.form-container {\n  background: white;\n  padding: 40px;\n  border-radius: 15px;\n  box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n  max-width: 500px;\n  width: 100%;\n}\n\n.form-group {\n  margin-bottom: 20px;\n}\n\n.form-group input,\n.form-group textarea {\n  width: 100%;\n  padding: 12px;\n  border: 2px solid #e0e0e0;\n  border-radius: 8px;\n  font-size: 14px;\n}\n\n.submit-btn {\n  width: 100%;\n  padding: 15px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border: none;\n  border-radius: 8px;\n  font-size: 16px;\n  font-weight: bold;\n  cursor: pointer;\n}',
    js: 'document.getElementById("contactForm").addEventListener("submit", function(e) {\n  e.preventDefault();\n  alert("Thank you for your message!");\n  this.reset();\n});'
  },
  
  // Java Templates
  {
    id: 'java-basic',
    language: 'java',
    type: 'Basic',
    color: '#10b981',
    title: 'Hello World',
    description: 'Chương trình Java cơ bản',
    preview: 'public class Main { ... }',
    code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
  },
  {
    id: 'java-oop',
    language: 'java',
    type: 'OOP',
    color: '#6366f1',
    title: 'OOP Example',
    description: 'Ví dụ về lập trình hướng đối tượng',
    preview: 'class Student { ... }',
    code: 'class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    public void displayInfo() {\n        System.out.println("Name: " + name);\n        System.out.println("Age: " + age);\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Student student = new Student("John Doe", 20);\n        student.displayInfo();\n    }\n}'
  },
  
  // Python Templates
  {
    id: 'python-basic',
    language: 'python',
    type: 'Basic',
    color: '#10b981',
    title: 'Hello World',
    description: 'Chương trình Python cơ bản',
    preview: 'print("Hello, World!")',
    code: 'print("Hello, World!")\n\n# Your Python code here'
  },
  {
    id: 'python-function',
    language: 'python',
    type: 'Function',
    color: '#6366f1',
    title: 'Functions Example',
    description: 'Ví dụ về hàm trong Python',
    preview: 'def greet(name): ...',
    code: 'def greet(name):\n    """Greet a person by name"""\n    return f"Hello, {name}!"\n\ndef calculate_sum(a, b):\n    """Calculate sum of two numbers"""\n    return a + b\n\n# Test the functions\nprint(greet("World"))\nprint(f"Sum: {calculate_sum(5, 3)}")'
  },
  
  // SQL Templates
  {
    id: 'sql-basic',
    language: 'sql',
    type: 'Query',
    color: '#10b981',
    title: 'Basic SELECT',
    description: 'Truy vấn SELECT cơ bản',
    preview: 'SELECT * FROM users...',
    code: 'SELECT * FROM users WHERE active = 1;'
  },
  {
    id: 'sql-create',
    language: 'sql',
    type: 'DDL',
    color: '#6366f1',
    title: 'Create Table',
    description: 'Tạo bảng với ràng buộc',
    preview: 'CREATE TABLE students...',
    code: 'CREATE TABLE students (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(100) UNIQUE,\n    age INT,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\n-- Insert sample data\nINSERT INTO students (name, email, age)\nVALUES \n    (\'John Doe\', \'john@example.com\', 20),\n    (\'Jane Smith\', \'jane@example.com\', 22);'
  },
  
  // C# Templates
  {
    id: 'csharp-basic',
    language: 'csharp',
    type: 'Basic',
    color: '#10b981',
    title: 'Hello World',
    description: 'Chương trình C# cơ bản',
    preview: 'class Program { ... }',
    code: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, C#!");\n    }\n}'
  },
  
  // C++ Templates
  {
    id: 'cpp-basic',
    language: 'cpp',
    type: 'Basic',
    color: '#10b981',
    title: 'Hello World',
    description: 'Chương trình C++ cơ bản',
    preview: '#include <iostream>...',
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}'
  }
]

const filteredTemplates = computed(() => {
  return templates.filter(t => t.language === selectedLang.value)
})

const selectTemplate = (template) => {
  emit('select', template)
}
</script>

<style scoped>
.templates-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.templates-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 28px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-close {
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #ef4444;
  color: white;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.language-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.lang-tab {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.lang-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.lang-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.template-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-bottom: 16px;
}

.template-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #1f2937;
}

.template-card p {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.template-preview {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.template-preview code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #4b5563;
}
</style>
