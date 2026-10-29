import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUpRight, Bot, CheckCircle2, LoaderCircle, Send, Sparkles } from "lucide-react";

const API_URL = (import.meta.env.VITE_PORTFOLIO_AI_API || "http://localhost:8001").replace(/\/$/, "");
const questions = [
  "Which of Dinesh’s projects involve Java?",
  "What certifications does Dinesh hold?",
  "Tell me about his AI and machine learning experience.",
  "What experience does he have as a Product Owner?",
];
const toolLabels = {
  get_profile: "Professional background",
  get_skills: "Technical skills",
  get_projects: "Projects & research",
  get_certifications: "Certifications",
};

export default function PortfolioAI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef(null);
  const end = useRef(null);
  const input = useRef(null);
  const inFlight = useRef(false);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);

  async function ask(text) {
    const value = text.trim();
    if (!value || value.length > 1000 || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setQuestion(value);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 55000);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value }),
        signal: controller.current.signal,
      });
      let data;
      try { data = await response.json(); } catch { throw new Error("The assistant returned an unexpected response. Please try again."); }
      if (!response.ok) throw new Error(data.error || "The assistant could not answer. Please try again.");
      if (typeof data.answer !== "string" || !Array.isArray(data.activity)) throw new Error("The assistant returned an incomplete answer. Please try again.");
      setMessages((previous) => [...previous, { question: value, answer: data.answer, activity: data.activity }]);
      setQuestion("");
    } catch (err) {
      setError(err.name === "AbortError"
        ? "The assistant took too long to respond. Please try again."
        : err instanceof TypeError
          ? import.meta.env.DEV
            ? "Cannot reach the portfolio assistant. Start it with npm run dev:assistant in the project folder, then retry."
            : "The assistant is currently unavailable. Please try again later."
          : err.message);
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setBusy(false);
      input.current?.focus();
    }
  }

  return (
    <div className="portfolioAI">
      <header className="portfolioAIHero">
        <div className="container">
          <nav className="portfolioAINav" aria-label="Portfolio navigation">
            <Link className="brand" to="/">Dineshreddy<span></span></Link>
            <Link className="portfolioAIBack" to="/"><ArrowLeft size={16} /> Back to portfolio</Link>
          </nav>
          <div className="portfolioAIIntro">
            <p className="eyebrow">EXPLORE MY EXPERIENCE</p>
            <h1>Ask about my <span>portfolio.</span></h1>
            <p>Curious about my skills, projects, or certifications? Ask a question and get an answer grounded in my published work.</p>
            {/* <span className="portfolioAIBadge"><Sparkles size={15} /> Powered by MCP · Model Context Protocol</span> */}
          </div>
        </div>
      </header>

      <main className="container portfolioAILayout">
        <section className="portfolioAIChat" aria-labelledby="chat-title">
          <div className="portfolioAIChatHeader">
            <div className="iconBox"><Bot size={23} /></div>
            <div><h2 id="chat-title">Meet my portfolio guide</h2><p>Ask about my professional experience.</p></div>
          </div>
          <div className="portfolioAIMessages" role="log" aria-label="Questions and answers" aria-live="polite" aria-relevant="additions">
            {messages.map((message, index) => (
              <article className="portfolioAIExchange" key={index}>
                <div className="portfolioAIQuestion"><span>You asked</span><p>{message.question}</p></div>
                <div className="portfolioAIAnswer"><span className="portfolioAISpeaker"><Bot size={16} /> Portfolio guide</span>
                  <div className="ai-markdown"><ReactMarkdown>{message.answer}</ReactMarkdown></div>
                  <details className="portfolioAIActivity">
                    <summary><CheckCircle2 size={15} /> Used {message.activity.length} MCP {message.activity.length === 1 ? "tool" : "tools"} · View retrieved information</summary>
                    {message.activity.map((activity, step) => (
                      <div className="portfolioAITool" key={step}>
                        <strong>{toolLabels[activity.tool] || activity.tool}</strong>
                        <code>{activity.tool}()</code>
                        <pre>{JSON.stringify(activity.result, null, 2)}</pre>
                      </div>
                    ))}
                  </details>
                </div>
              </article>
            ))}
            {busy && <p className="portfolioAILoading" role="status"><LoaderCircle size={18} /> Looking up portfolio information…</p>}
            <div ref={end} />
          </div>
          <form className="portfolioAIForm" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
            <label htmlFor="portfolio-question">Your question</label>
            <div className="portfolioAIInputRow">
              <input ref={input} id="portfolio-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="Ask about a skill, project, or certification…" disabled={busy} required />
              <button className="primaryButton" type="submit" disabled={busy || !question.trim()}><Send size={17} /><span>Ask</span></button>
            </div>
            {error && <p className="portfolioAIError" role="alert">{error} Your question is saved above so you can retry.</p>}
            {/*<p className="portfolioAIHint">Each question stands on its own. Answers use public portfolio information and may contain mistakes.</p> */}
          </form>
        </section>

        <aside className="portfolioAIAside" aria-labelledby="suggested-questions-title">
          <h2 id="suggested-questions-title" className="sectionLabel">A FEW PLACES TO START</h2>
          <div className="portfolioAIQuestions">
            {questions.map((text) => <button type="button" key={text} onClick={() => ask(text)} disabled={busy}>{text}<ArrowUpRight size={17} /></button>)}
          </div>
          <a href="/Dinesh-Reddy-Resume.pdf" target="_blank" rel="noreferrer" className="portfolioAIResume">Prefer the full picture? View my resume <ArrowUpRight size={16} /></a>
        </aside>
      </main>
      <footer className="container portfolioAIFooter">© {new Date().getFullYear()} Dinesh Reddy · <Link to="/">Explore the portfolio</Link></footer>
    </div>
  );
}
