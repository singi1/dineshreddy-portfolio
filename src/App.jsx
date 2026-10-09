import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Certifications from "./components/Certifications";
export default function App() {
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
