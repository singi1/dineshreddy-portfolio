import { ArrowUpRight, Bot, GitBranch, Network, Workflow } from "lucide-react";

const projects = [
  {
    icon: <Bot size={25} />,
    title: "AI Document Analyzer",
    status: "Portfolio AI Project",
    featured: true,
    description:
      "A practical Generative AI application designed to accept PDF/DOCX/TXT files, generate summaries, identify key points and support conversational document Q&A.",
    tags: ["Generative AI", "Document Processing", "React", "Cloud"],
    action: "Live demo coming next",
  },
  {
  icon: <Bot size={25} />,
  title: "Comparative Text Summarization",
  status: "2010 • Graduate AI/ML Research",
  description:
    "Completed graduate research at Kansas State University on comparative text summarization of product reviews using sentiment analysis, opinion mining, feature extraction, and statistical machine learning years before the current generative AI wave.",
  tags: [
    "NLP",
    "Machine Learning",
    "Sentiment Analysis",
    "Opinion Mining",
    "Text Summarization",
  ],
  universityLink:
    "https://krex.k-state.edu/items/105ee1ef-fb61-43ef-a4b4-1bd036bd907f",
  downloadLink:
    "https://krex.k-state.edu/bitstreams/03345614-1cdd-45c8-8529-39d55e816af9/download",
},
  {
    icon: <Network size={25} />,
    title: "Enterprise Collections Integration",
    status: "Enterprise Delivery",
    description:
      "Led system integration between enterprise collections applications and banking core systems, establishing end-to-end connectivity across services and teams.",
    tags: ["System Integration", "Product Ownership", "Enterprise"],
    action: "Professional experience",
  },
  {
    icon: <Workflow size={25} />,
    title: "Batch Automation Platform",
    status: "Automation",
    description:
      "Built a batch automation tool with a user interface and developed supporting scripts, configuration guidance and deployment documentation.",
    tags: ["Java", "Automation", "Oracle", "WebSphere"],
    action: "Professional experience",
  },
  {
    icon: <GitBranch size={25} />,
    title: "CI/CD & Deployment Automation",
    status: "DevOps",
    description:
      "Designed and maintained TFS pipelines covering build management, CI/CD and deployment automation to improve release consistency and delivery efficiency.",
    tags: ["TFS", "CI/CD", "DevOps", "Automation"],
    action: "Professional experience",
  },
  {
    icon: <Network size={25} />,
    title: "Secure Healthcare Data Integration",
    status: "Integration",
    description:
      "Developed Java and Perl automation for secure data transfer while supporting SQL Server, SFTP, scheduling and multi-state platform migrations.",
    tags: ["Java", "Perl", "SQL Server", "SFTP"],
    action: "Professional experience",
  },
];

export default function Projects() {
  return (
    <section className="section sectionAlt" id="projects">
      <div className="container">
        <p className="sectionLabel">PROJECTS</p>
        <h2 className="sectionTitle">
          Selected engineering work and AI projects.
        </h2>
        <p className="sectionIntro">
          This portfolio combines hands-on enterprise delivery with new AI
          applications that demonstrate how I approach real-world technology problems.
        </p>

        <div className="projectsGrid">
          {projects.map((project) => (
            <article
              className={`projectCard ${project.featured ? "featuredProject" : ""}`}
              key={project.title}
            >
              <div className="projectHeader">
                <div className="projectIcon">{project.icon}</div>
                <span className="projectStatus">{project.status}</span>
              </div>

              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <div className="tagList projectTags">
                {project.tags.map((tag) => (
                  <span className="skillTag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            {project.universityLink ? (
              <div className="projectLinks">
                <a
                  href={project.universityLink}
                  target="_blank"
                  rel="noreferrer"
                  className="projectAction"
                >
                  View at K-State <ArrowUpRight size={16} />
                </a>

                <a
                  href={project.downloadLink}
                  target="_blank"
                  rel="noreferrer"
                  className="projectDownload"
                >
                  Download Thesis
                </a>
              </div>
            ) : (
              <div className="projectAction">
                {project.action} <ArrowUpRight size={16} />
              </div>
            )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
