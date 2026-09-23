import { ArrowDown, Download, Mail } from "lucide-react";
import profilePhoto from "../assets/dinesh-profile.jpg";

export default function Header() {
  return (
    <header className="hero" id="home">
      <nav className="navbar container">
        <a className="brand" href="#home" aria-label="Dinesh Reddy home">
          DR<span>.</span>
        </a>

        <div className="navLinks">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <div className="heroInner container">
        <div className="heroCopy">
          <p className="eyebrow">PRODUCT • SOFTWARE • AI • CLOUD</p>

          <h1>
            Hi, I’m <span>Dinesh Reddy.</span>
          </h1>

          <p className="heroTitle">
            Senior Programming Analyst & Product Owner
          </p>

          <p className="heroText">
            I build and lead enterprise software solutions across product,
            application development, system integration, automation, DevOps,
            data, and emerging AI technologies.
          </p>

          <div className="heroActions">
            <a className="primaryButton" href="#projects">
              View Projects <ArrowDown size={18} />
            </a>

            <a
              className="secondaryButton"
              href="/Dinesh-Reddy-Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Resume <Download size={18} />
            </a>

            <a className="textButton" href="mailto:reachdineshreddy@gmail.com">
              <Mail size={18} /> Contact
            </a>
          </div>

          <div className="heroMeta">
            <span>14+ Years Experience</span>
            <span>Tampa, Florida</span>
            <span>SAFe • PMP • Azure AI Fundamentals</span>
          </div>
        </div>

        <div className="profileWrap" aria-label="Portrait of Dinesh Reddy">
          <div className="profileGlow" />
          <img src={profilePhoto} alt="Dinesh Reddy" className="profilePhoto" />
          <div className="profileBadge">
            <strong>Enterprise Technology</strong>
            <span>Product • Engineering • AI</span>
          </div>
        </div>
      </div>
    </header>
  );
}
