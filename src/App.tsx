import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home'
import JsonFormatter from './pages/JsonFormatter'
import JsonValidator from './pages/JsonValidator'
import JsonMinifier from './pages/JsonMinifier'
import JsonToCsv from './pages/JsonToCsv'
import JsonToJava from './pages/JsonToJava'
import JsonToTypeScript from './pages/JsonToTypeScript'
import JsonDiff from './pages/JsonDiff'
import JsonPath from './pages/JsonPath'
import JwtDecoder from './pages/JwtDecoder'
import JsonToYaml from './pages/JsonToYaml'
import JsonGenerator from './pages/JsonGenerator'
import JsonEscape from './pages/JsonEscape'
import JsonCodegen from './pages/JsonCodegen'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/json-validator" element={<JsonValidator />} />
          <Route path="/json-minifier" element={<JsonMinifier />} />
          <Route path="/json-to-csv" element={<JsonToCsv />} />
          <Route path="/json-to-java" element={<JsonToJava />} />
          <Route path="/json-to-typescript" element={<JsonToTypeScript />} />
          <Route path="/json-diff" element={<JsonDiff />} />
          <Route path="/json-path" element={<JsonPath />} />
          <Route path="/jwt-decoder" element={<JwtDecoder />} />
          <Route path="/json-to-yaml" element={<JsonToYaml />} />
          <Route path="/json-generator" element={<JsonGenerator />} />
          <Route path="/json-escape" element={<JsonEscape />} />
          <Route path="/json-codegen" element={<JsonCodegen />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
