import React from "react";
import './footer.css';
import fb from '../Images/facebook.png';
import twitter from '../Images/twitter.png';
import insta from '../Images/instagram.png';
import linkedin from '../Images/linkedin.png';

const Footer = () => {
    return (
        <div className="footer">
            <div className="sb__footer section__padding">
                <div className="sb__footer-links">
                    <div className="sb__footer-links_div">
                        <h4>For Business</h4>
                        <p>Employer</p>
                        <p>Health Plan</p>
                        <p>Individual</p>
                    </div>
                    <div className="sb__footer-links_div">
                        <h4>Resources</h4>
                        <p>Resource Center</p>
                        <p>Testimonials</p>
                        <p>STV</p>
                    </div>
                    <div className="sb__footer-links_div">
                        <h4>Partners</h4> 
                        <p>Swing Tech</p>
                    </div>
                    <div className="sb__footer-links_div">
                        <h4>Company</h4>
                        <p>About</p>
                        <p>Press</p>
                        <p>Career</p>
                        <p>Contact</p>
                    </div>
                    <div className="sb__footer-links_div">
                        <h4>Coming Soon</h4>
                        <div className="socialmedia">
                            <a href="https://facebook.com"><img src={fb} alt="Facebook" /></a>
                            <a href="https://twitter.com"><img src={twitter} alt="Twitter" /></a>
                            <a href="https://linkedin.com"><img src={linkedin} alt="LinkedIn" /></a>
                            <a href="https://instagram.com"><img src={insta} alt="Instagram" /></a>
                        </div>
                    </div>
                </div>
                <hr className="divider" />
                <div className="sb__footer-below">
                    <p className="sb__footer-copyright">
                        © {new Date().getFullYear()} StudEvent. All rights reserved.
                    </p>
                    <div className="sb__footer-below-links">
                        <a href="/terms"><p>Terms & Conditions</p></a>
                        <a href="/privacy"><p>Privacy</p></a>
                        <a href="/security"><p>Security</p></a>
                        <a href="/cookie"><p>Cookie Declaration</p></a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
