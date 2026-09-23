import { FileText, Sparkles, Upload } from "lucide-react";

export default function DocumentAI() {
  return (
    <main className="demoPage">
      <section className="demoPanel">
        <div className="demoIcon">
          <Sparkles size={28} />
        </div>

        <p className="sectionLabel">AI PROJECT</p>
        <h1>AI Document Analyzer</h1>
        <p>
          Upload a PDF, DOCX or TXT document and use Generative AI to create
          summaries, key points and document Q&A.
        </p>

        <label className="uploadBox">
          <Upload size={30} />
          <strong>Drop a document here</strong>
          <span>PDF, DOCX or TXT</span>
          <input type="file" accept=".pdf,.docx,.txt" />
        </label>

        <button className="primaryButton demoButton" type="button">
          <FileText size={18} />
          Analyze with AI
        </button>

        <small>
          Front-end shell included. Gemini/LLM API integration will be added in
          the next development step.
        </small>
      </section>
    </main>
  );
}
