import { useState, useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import JsonFormatter from './pages/tools/JsonFormatter'
import JsonValidator from './pages/tools/JsonValidator'
import JsonToCsv from './pages/tools/JsonToCsv'
import JsonToTypeScript from './pages/tools/JsonToTypeScript'
import JsonToJava from './pages/tools/JsonToJava'
import JsonPath from './pages/tools/JsonPath'
import JsonDiff from './pages/tools/JsonDiff'
import JsonCompressor from './pages/tools/JsonCompressor'
import JwtDecode from './pages/tools/JwtDecode'
import JsonToYaml from './pages/tools/JsonToYaml'
import JsonGenerator from './pages/tools/JsonGenerator'
import BlogIndex from './pages/blog/BlogIndex'
import BlogJsonGuide from './pages/blog/JsonGuide'
import BlogApiGuide from './pages/blog/ApiGuide'
import BlogSchemaGuide from './pages/blog/SchemaGuide'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import './App.css'

export default function App() {
  const { i18n } = useTranslation()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const isLight = theme === 'light'
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', isLight)
    localStorage.setItem('theme', theme)
  }, [theme, isLight])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), [])
  const switchLang = useCallback((code: string) => { i18n.changeLanguage(code); setLangOpen(false) }, [i18n])

  return (
    <div className="container">
      <Header isLight={isLight} toggleTheme={toggleTheme} langOpen={langOpen} setLangOpen={setLangOpen} switchLang={switchLang} langRef={langRef} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/json-formatter" element={<JsonFormatter />} />
        <Route path="/json-validator" element={<JsonValidator />} />
        <Route path="/json-to-csv" element={<JsonToCsv />} />
        <Route path="/json-to-typescript" element={<JsonToTypeScript />} />
        <Route path="/json-to-java" element={<JsonToJava />} />
        <Route path="/jsonpath" element={<JsonPath />} />
        <Route path="/json-diff" element={<JsonDiff />} />
        <Route path="/json-compressor" element={<JsonCompressor />} />
        <Route path="/jwt-decode" element={<JwtDecode />} />
        <Route path="/json-to-yaml" element={<JsonToYaml />} />
        <Route path="/json-generator" element={<JsonGenerator />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/json-guide" element={<BlogJsonGuide />} />
        <Route path="/blog/json-api-guide" element={<BlogApiGuide />} />
        <Route path="/blog/json-schema-guide" element={<BlogSchemaGuide />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </div>
  )
}
