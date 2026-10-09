import { useEffect } from "react";

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
  {
    title: "Certifications",
    skills: [
      "SAFe 6 POPM",
      "SAFe 6 Scrum Master",
      "SAFe 6 DevOps Practitioner",
      "Certified SAFe® 5 DevOps Practitioner",
      "PMP",
      "Microsoft Azure AI Fundamentals",
      "EMCPA Associate",
    ],
  },
];

export default function Skills() {
  useEffect(() => {
    const scriptUrl = "https://cdn.credly.com/assets/utilities/embed.js";
    if (document.querySelector(`script[src="${scriptUrl}"]`)) return;

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
              {group.title === "Certifications" && (
                <div className="credlyBadgeWrap">
                  <div
                    data-iframe-width="150"
                    data-iframe-height="270"
                    data-share-badge-id="946bb71f-f2e5-4968-acf2-ac7e66cae660"
                    data-share-badge-host="https://www.credly.com"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
