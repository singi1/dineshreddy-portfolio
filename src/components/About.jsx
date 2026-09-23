import { Code2, Network, Sparkles, Users } from "lucide-react";

const highlights = [
  {
    icon: <Users size={22} />,
    title: "Product Leadership",
    text: "Product ownership, backlog strategy, stakeholder alignment, agile delivery and team leadership.",
  },
  {
    icon: <Code2 size={22} />,
    title: "Software Engineering",
    text: "Hands-on experience across Java, JavaScript, APIs, enterprise applications and automation.",
  },
  {
    icon: <Network size={22} />,
    title: "Enterprise Integration",
    text: "Large-scale system integrations, migrations, secure data exchange and deployment environments.",
  },
  {
    icon: <Sparkles size={22} />,
    title: "AI & Innovation",
    text: "Azure AI Fundamentals, machine-learning research and a growing portfolio of practical GenAI applications.",
  },
];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <p className="sectionLabel">ABOUT ME</p>
        <h2 className="sectionTitle">
          Turning complex business problems into scalable technology solutions.
        </h2>

        <div className="aboutGrid">
          <div className="aboutCopy">
            <p className="leadText">
              I am a Senior Programming Analyst and Product Owner with more
              than 14 years of experience delivering enterprise software,
              integrations, modernization initiatives and agile products.
            </p>

            <p>
              My experience covers the full software development lifecycle —
              requirements, design, development, testing, deployment, support,
              CI/CD and product ownership. I have led cross-functional teams,
              coordinated enterprise migrations and integrations, and worked
              directly with business and technical stakeholders.
            </p>

            <p>
              I am especially interested in practical AI: building applications
              that combine software engineering, cloud platforms, enterprise
              data and generative AI to solve useful business problems.
            </p>
          </div>

          <div className="highlightGrid">
            {highlights.map((item) => (
              <article className="highlightCard" key={item.title}>
                <div className="iconBox">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
