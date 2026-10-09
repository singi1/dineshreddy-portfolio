import { ExternalLink } from "lucide-react";

const certifications = [
  {
    title: "Certified SAFe® 6 Scrum Master",
    issuer: "SAFe by Scaled Agile, Inc.",
    badge: "/badges/certified-safe-6-scrum-master.png",
    verify: "https://www.credly.com/badges/1b0d1fe6-73ee-4eac-b098-bd643ffa4eab/public_url",
  },
  {
    title: "Certified SAFe® 6 Product Owner / Product Manager",
    issuer: "SAFe by Scaled Agile, Inc.",
    badge: "/badges/certified-safe-6-POPM.png",
    verify: "https://www.credly.com/badges/cb1b6304-4cf6-4d8a-8202-aa861138db8f/public_url",
  },
  {
    title: "Certified SAFe® 6 DevOps Practitioner",
    issuer: "SAFe by Scaled Agile, Inc.",
    badge: "/badges/certified-safe-6-devops-practitioner.png",
    verify: "https://www.credly.com/badges/f84ce20a-5f27-4b6a-bbb6-718a690d03fa/public_url",
  },
  {
    title: "Project Management Professional (PMP)®",
    issuer: "Project Management Institute",
    badge: "/badges/pmp.png",
    verify: "https://www.credly.com/badges/fef9ff61-2c9d-43e0-a54c-2fbb51176310/public_url",
  },
];

export default function Certifications() {
  return (
    <section className="section certificationsSection" id="certifications">
      <div className="container">
        <p className="sectionLabel">CERTIFICATIONS</p>

        <h2 className="sectionTitle">
          Professional certifications & credentials.
        </h2>

        <div className="certGrid">
          {certifications.map((cert) => (
            <article className="certCard" key={cert.title}>
              <div className="certBadgeArea">
                <img
                  src={cert.badge}
                  alt={`${cert.title} badge`}
                  className="certBadge"
                />
              </div>

              <div className="certInfo">
                <h3>{cert.title}</h3>

                <p>{cert.issuer}</p>

                <a
                  href={cert.verify}
                  target="_blank"
                  rel="noreferrer"
                  className="certVerify"
                >
                  Verify Credential
                  <ExternalLink size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}