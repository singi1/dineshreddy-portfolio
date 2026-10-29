import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Certifications from "./components/Certifications";
import DocumentAI from "./pages/DocumentAI";
import PortfolioAI from "./pages/PortfolioAI";

// Existing portfolio homepage
function HomePage() {
  return (
    <>
      <Header />
      <main>
        <About />
        <Skills />
        <Certifications />
        <Projects />
        <Contact />
      </main>
    </>
  );
}

// Application routing
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/document-ai" element={<DocumentAI />} />
        <Route path="/ask-portfolio" element={<PortfolioAI />} />
      </Routes>
    </BrowserRouter>
  );
}
