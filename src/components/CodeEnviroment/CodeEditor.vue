<template>
  <div class="code-editor">
    <textarea
      ref="textarea"
      v-model="localValue"
      @input="handleInput"
      @scroll="syncScroll"
      @keydown.tab.prevent="handleTab"
      class="code-input"
      :style="{ fontSize: fontSize + 'px' }"
      spellcheck="false"
    ></textarea>
    <pre
      ref="highlighted"
      class="code-highlight"
      :style="{ fontSize: fontSize + 'px' }"
    ><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'html'
  },
  fontSize: {
    type: Number,
    default: 14
  }
})

const emit = defineEmits(['update:modelValue'])

const textarea = ref(null)
const highlighted = ref(null)
const localValue = ref(props.modelValue)

const highlightedCode = computed(() => {
  let code = escapeHtml(localValue.value)
  
  if (props.language === 'html') {
    code = highlightHTML(code)
  } else if (props.language === 'css') {
    code = highlightCSS(code)
  } else if (props.language === 'javascript') {
    code = highlightJS(code)
  } else if (props.language === 'java') {
    code = highlightJava(code)
  } else if (props.language === 'python') {
    code = highlightPython(code)
  } else if (props.language === 'sql') {
    code = highlightSQL(code)
  } else if (props.language === 'csharp') {
    code = highlightCSharp(code)
  } else if (props.language === 'cpp') {
    code = highlightCpp(code)
  }
  
  return code
})

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

const syncScroll = () => {
  if (highlighted.value && textarea.value) {
    highlighted.value.scrollTop = textarea.value.scrollTop
    highlighted.value.scrollLeft = textarea.value.scrollLeft
  }
}

const handleTab = (e) => {
  const start = e.target.selectionStart
  const end = e.target.selectionEnd
  const value = localValue.value
  
  localValue.value = value.substring(0, start) + '  ' + value.substring(end)
  
  nextTick(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2
  })
}

const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const highlightHTML = (code) => {
  // Comments first
  code = code.replace(/(&lt;!--.*?--&gt;)/gs, '<span class="comment">$1</span>')
  
  // Tags with attributes
  code = code.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^&<>]*?)?)(\/?&gt;)/g, (match, openBracket, tagName, attributes, closeBracket) => {
    let result = openBracket + '<span class="tag">' + tagName + '</span>'
    
    if (attributes) {
      attributes = attributes.replace(/\s+([\w-]+)(?:=(&quot;|&#039;)(.*?)(\2))?/g, (attrMatch, attrName, quote1, attrValue, quote2) => {
        if (quote1) {
          return ' <span class="attr">' + attrName + '</span>=<span class="string">' + quote1 + attrValue + quote2 + '</span>'
        }
        return ' <span class="attr">' + attrName + '</span>'
      })
      result += attributes
    }
    
    result += closeBracket
    return result
  })
  
  return code
}

const highlightCSS = (code) => {
  // Comments
  code = code.replace(/(\/\*.*?\*\/)/gs, '<span class="comment">$1</span>')
  // Selectors
  code = code.replace(/^([.#]?[\w-]+)(?=\s*\{)/gm, '<span class="selector">$1</span>')
  // Properties
  code = code.replace(/\b([\w-]+):/g, '<span class="property">$1</span>:')
  // Values
  code = code.replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;')
  
  return code
}

const highlightJS = (code) => {
  // Keywords
  const keywords = ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'typeof', 'instanceof']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), '<span class="keyword">$1</span>')
  })
  
  // Strings
  code = code.replace(/(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g, '<span class="string">$1</span>')
  
  // Numbers
  code = code.replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
  
  // Comments
  code = code.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
  code = code.replace(/(\/\*.*?\*\/)/gs, '<span class="comment">$1</span>')
  
  return code
}

const highlightJava = (code) => {
  const keywords = ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'if', 'else', 'for', 'while', 'return', 'new', 'this', 'super', 'import', 'package']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), '<span class="keyword">$1</span>')
  })
  
  code = code.replace(/(&quot;.*?&quot;)/g, '<span class="string">$1</span>')
  code = code.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
  
  return code
}

const highlightPython = (code) => {
  const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'lambda', 'yield', 'pass', 'break', 'continue', 'True', 'False', 'None']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), '<span class="keyword">$1</span>')
  })
  
  code = code.replace(/(&quot;.*?&quot;|&#039;.*?&#039;)/g, '<span class="string">$1</span>')
  code = code.replace(/(#.*$)/gm, '<span class="comment">$1</span>')
  
  return code
}

const highlightSQL = (code) => {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'PRIMARY', 'KEY', 'FOREIGN', 'INDEX', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'gi'), '<span class="keyword">$1</span>')
  })
  
  code = code.replace(/(&quot;.*?&quot;|&#039;.*?&#039;)/g, '<span class="string">$1</span>')
  code = code.replace(/(--.*$)/gm, '<span class="comment">$1</span>')
  
  return code
}

const highlightCSharp = (code) => {
  const keywords = ['using', 'namespace', 'class', 'interface', 'public', 'private', 'protected', 'static', 'void', 'int', 'string', 'bool', 'double', 'float', 'if', 'else', 'for', 'while', 'foreach', 'return', 'new', 'this', 'base', 'var', 'const']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), '<span class="keyword">$1</span>')
  })
  
  code = code.replace(/(&quot;.*?&quot;)/g, '<span class="string">$1</span>')
  code = code.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
  
  return code
}

const highlightCpp = (code) => {
  const keywords = ['#include', 'using', 'namespace', 'class', 'struct', 'public', 'private', 'protected', 'static', 'void', 'int', 'string', 'bool', 'double', 'float', 'if', 'else', 'for', 'while', 'return', 'new', 'delete', 'this', 'const', 'auto']
  keywords.forEach(keyword => {
    code = code.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), '<span class="keyword">$1</span>')
  })
  
  code = code.replace(/(&quot;.*?&quot;)/g, '<span class="string">$1</span>')
  code = code.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
  
  return code
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue
  }
})

onMounted(() => {
  syncScroll()
})
</script>

<style scoped>
.code-editor {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.code-input,
.code-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;
  tab-size: 2;
}

.code-input {
  color: transparent;
  caret-color: #1f2937;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  z-index: 2;
  overflow: auto;
}

.code-highlight {
  color: #1f2937;
  background: #ffffff;
  pointer-events: none;
  z-index: 1;
  overflow: auto;
}

.code-highlight code {
  font-family: inherit;
  font-size: inherit;
}

/* Syntax highlighting colors */
.code-highlight :deep(.tag) {
  color: #0369a1;
  font-weight: 600;
}

.code-highlight :deep(.attr) {
  color: #7c3aed;
}

.code-highlight :deep(.string) {
  color: #15803d;
}

.code-highlight :deep(.comment) {
  color: #6b7280;
  font-style: italic;
}

.code-highlight :deep(.keyword) {
  color: #be123c;
  font-weight: 600;
}

.code-highlight :deep(.selector) {
  color: #0369a1;
  font-weight: 600;
}

.code-highlight :deep(.property) {
  color: #7c3aed;
}

.code-highlight :deep(.value) {
  color: #15803d;
}

.code-highlight :deep(.number) {
  color: #ea580c;
}
</style>
