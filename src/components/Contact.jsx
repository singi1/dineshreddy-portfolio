import { Download, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section className="section contactSection" id="contact">
      <div className="container contactGrid">
        <div>
          <p className="sectionLabel lightLabel">CONTACT</p>
          <h2 className="sectionTitle">Let’s build something useful.</h2>
          <p className="contactLead">
            I am interested in opportunities and conversations around product
            leadership, enterprise software, cloud, automation and AI-powered applications.
          </p>

          <div className="contactButtons">
            <a className="primaryButton" href="mailto:singireddy.d@gmail.com">
              <Mail size={18} /> Email Me
            </a>
            <a
              className="darkSecondaryButton"
              href="/Dinesh-Reddy-Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} /> Resume
            </a>
          </div>
        </div>

        <div className="contactCard">
          <div className="contactRow">
            <Mail size={20} />
            <div>
              <span>Email</span>
              <a href="mailto:singireddy.d@gmail.com">
                singireddy.d@gmail.com
              </a>
            </div>
          </div>

          <div className="contactRow">
            <Phone size={20} />
            <div>
              <span>Phone</span>
              <a href="tel:+17858172767">785-817-2767</a>
            </div>
          </div>

          <div className="contactRow">
            <MapPin size={20} />
            <div>
              <span>Location</span>
              <strong>Tampa, Florida</strong>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer container">
        <span>© {new Date().getFullYear()} Dinesh Reddy</span>
        <span>dineshreddy.info</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </section>
  );
}
