
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
const API_URL =
  import.meta.env.VITE_DOCUMENT_AI_API || "http://localhost:8000";

export default function DocumentAI() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const inputRef = useRef(null);

  function handleFile(selectedFile) {
    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".").pop().toLowerCase();

    if (!["pdf", "docx", "txt"].includes(extension)) {
      setError("Only PDF, DOCX and TXT files are supported.");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("Maximum file size is 2 MB.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setAnswer("");
    setError("");
  }

  async function analyze() {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Document analysis failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!question.trim() || !result) return;

    setAsking(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: result.document_id,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer returned.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      padding: 24,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>AI Document Analyzer</h1>
      <p>Upload a document to generate summaries,
         key points and ask questions using AI.</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: "2px dashed #93b6e8",
          borderRadius: 12,
          padding: 45,
          textAlign: "center",
          cursor: "pointer",
          background: "#f7faff",
          color: "#223b60"
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <>
            <h3>Selected: {file.name}</h3>
            <p>{(file.size / 1024).toFixed(1)} KB</p>
            <p>Click to choose a different file</p>
          </>
        ) : (
          <>
            <h3>Drop a document here or click to browse</h3>
            <p>PDF, DOCX or TXT — maximum 2 MB</p>
          </>
        )}
      </div>

      <button
        onClick={analyze}
        disabled={loading || !file}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 16,
          background: "#3479ed",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>

      {error && (
        <p style={{ color: "red", overflowWrap: "anywhere" }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>Document Summary</h2>
          <div className="ai-markdown">
            <ReactMarkdown>{result.summary}</ReactMarkdown>
          </div>

          <h2>Ask Questions About Your Document</h2>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is this document about?"
            style={{
              padding: 12,
              width: "100%",
              boxSizing: "border-box"
            }}
          />

          <button
            onClick={askQuestion}
            disabled={asking || !question.trim()}
            style={{ marginTop: 12, padding: 12 }}
          >
            {asking ? "Thinking..." : "Ask AI"}
          </button>

          {answer && (
            <div style={{ marginTop: 20 }}>
              <h3>AI Answer</h3>
              <div className="ai-markdown">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
