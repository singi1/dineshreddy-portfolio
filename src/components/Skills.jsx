const skillGroups = [
  {
    title: "AI & Data",
    skills: [
      "Azure AI Fundamentals",
      "Machine Learning",
      "Text Summarization",
      "SQL",
      "Oracle",
      "SQL Server",
      "JasperReports",
      "SAP Business Objects",
    ],
  },
  {
    title: "Application Development",
    skills: [
      "Java",
      "JavaScript",
      "JSP",
      "JSF",
      "PrimeFaces",
      "jQuery",
      "AJAX",
      "Spring MVC",
      "Struts",
      "JPA",
      "VB.NET",
    ],
  },
  {
    title: "APIs & Integration",
    skills: [
      "REST",
      "SOAP",
      "Web Services",
      "JAXB",
      "LDAP",
      "SFTP",
      "Enterprise Integration",
      "Secure Data Transfer",
    ],
  },
  {
    title: "Cloud, Platforms & DevOps",
    skills: [
      "OpenShift",
      "WebSphere",
      "JBoss",
      "Apache",
      "TFS",
      "CI/CD",
      "Build Automation",
      "GoAnywhere",
      "Apache Ant",
    ],
  },
  {
    title: "Product & Agile",
    skills: [
      "Product Ownership",
      "Product Management",
      "Scrum",
      "SAFe",
      "Backlog Management",
      "Sprint Planning",
      "Stakeholder Management",
      "Team Leadership",
      "Mentoring",
      "JIRA",
      "Rally",
    ],
  },
];

export default function Skills() {
  return (
    <section className="section sectionAlt" id="skills">
      <div className="container">
        <p className="sectionLabel">SKILLS</p>
        <h2 className="sectionTitle">
          Enterprise engineering experience with a growing AI focus.
        </h2>

        <div className="skillsGrid">
          {skillGroups.map((group) => (
            <article className="skillCard" key={group.title}>
              <h3>{group.title}</h3>
              <div className="tagList">
                {group.skills.map((skill) => (
                  <span className="skillTag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
