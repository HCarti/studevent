// OrganizationsPage.js
import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Organizations.css';
import Modal from './Modal';
import Footer from '../Components/footer';

// Import images
import nuOrg1 from '../Images/Orgs/JPCS.png';
import nuOrg2 from '../Images/Orgs/HYDROID.jpeg';
import nuOrg3 from '../Images/Orgs/NUSG.jpg';
import nuOrg4 from '../Images/Orgs/ITSC.png';
import nuOrg5 from '../Images/Orgs/JMOA.png';
import nuOrg6 from '../Images/Orgs/MTSC.png';
import nuOrg7 from '../Images/Orgs/PHISMETS.png';
import nuOrg8 from '../Images/Orgs/CAMPUS MINISTRY.jpeg';
import nuOrg9 from '../Images/Orgs/COCO.png';
import nuOrg10 from '../Images/Orgs/ComEx Brigade logo.PNG';
import nuOrg11 from '../Images/Orgs/CSE.png';
import nuOrg12 from '../Images/Orgs/CWSJ.png';
import nuOrg13 from '../Images/Orgs/DANCE HIVE.png';
import nuOrg14 from '../Images/Orgs/DENTAL CLINCIAN CLUB.jpeg';
import nuOrg15 from '../Images/Orgs/DSC.png';
import nuOrg16 from '../Images/Orgs/FIRST IMPRESSION.jpg';
import nuOrg17 from '../Images/Orgs/JFINEX.jpg';
import nuOrg18 from '../Images/Orgs/JPIA.jpg';
import nuOrg19 from '../Images/Orgs/Love for Reading Club.png';
import nuOrg20 from '../Images/Orgs/NU MOA PEERS.png';
import nuOrg21 from '../Images/Orgs/NURSING.jpg';
import nuOrg22 from '../Images/Orgs/OPTOMETRY.png';
import nuOrg23 from '../Images/Orgs/PSYCHSOC.png';
import nuOrg24 from '../Images/Orgs/RED CROSS.PNG';
import nuOrg25 from '../Images/Orgs/SAM.png';
import nuOrg26 from '../Images/Orgs/tousoc.jpg';
import nuOrg27 from '../Images/Orgs/YUGEN.jpg';

const organizations = [
  { id: 1, name: 'JPCS', image: nuOrg1, description: 'The Junior Philippine Computer Society NU MOA Chapter is a recognized JPCS Chapter that will help students of National University - Mall of Asia to develop ICT skills and be industry-prepared.' },
  { id: 2, name: 'Hydroid Olympians', image: nuOrg2, description: 'NU Hydroid Olympians aims to develop friendly gaming communities that are based off of their members and love for Esports and respective games that go along with it.' },
  { id: 3, name: 'NUSG', image: nuOrg3, description: 'The Student Government Buddy of NU MOA ' },
  { id: 4, name: 'ITSC', image: nuOrg4, description: 'Founded in 2021, The Silicon Assembly is the student council for NU MOA\'s BS in Information Technology program, serving as the main liaison for student interests' },
  { id: 5, name: 'JMOA', image: nuOrg5, description: 'The Junior Marketistas of Asia is the official organization representing Marketing Management students of NU-MOA in all affairs.' },
  { id: 6, name: 'MTSC', image: nuOrg6, description: 'The National University MOA Medical Technology Student Council serves as the esteemed governing body representing the students of the Department of Medical Technology at the School of Allied Health.' },
  { id: 7, name: 'PHISMETS', image: nuOrg7, description: 'PHISMETS NU MOA is the local chapter of the National Organization Philippine Society of Medical Technology Students situated within National University MOA.' },
  { id: 8, name: 'CAMPUS MINISTRY', image: nuOrg8, description: 'The Campus Ministry enjoy using their skills to serve the Lord by serving as altar servers.' },
  { id: 9, name: 'COCO', image: nuOrg9, description: 'The NU MOA Couture Collective is NU\'s first fashion organization, fostering a creative and inclusive space for students to explore style, collaborate, and showcase talent.' },
  { id: 10, name: 'ComEx Brigade', image: nuOrg10, description: 'The National University Community Extension Brigade-Mall of Asia is a self-interest student organization that aims to uplift the spirit of volunteerism among students.' },
  { id: 11, name: 'CSE', image: nuOrg11, description: 'The Commission on Student Elections (CSE) is responsible for enforcing and overseeing all student election rules to ensure fair, orderly, and honest elections' },
  { id: 12, name: 'CWSJ', image: nuOrg12, description: 'The Coral Way Street Journal is a student-led publication under NU MOA\'s marketing office, aiming to deliver quality journalism and creative content that reflects the diverse voices of the school community.' },
  { id: 13, name: 'DANCE HIVE', image: nuOrg13, description: 'NU MOA Dance Hive is the official dance crew of NU MOA, offering students a platform to grow, perform, and engage through dance.' },
  { id: 14, name: 'DENTAL CLINICIANS CLUB', image: nuOrg14, description: 'The Dental Clinicians Club is an organization that provides a platform for dental clinicians to collaborate, share knowledge, and updates on the rules regulations inside the clinic premises.' },
  { id: 15, name: 'DSC', image: nuOrg15, description: 'NU Dentistry Student Council is a non-funded organization. A dedicated group of passionate and motivated individuals who have taken it upon themselves to enhance the student experience' },
  { id: 16, name: 'FIRST IMPRESSION', image: nuOrg16, description: 'The First Impression is the very first Performing Arts Group of NU MOAs College of Dentisty.' },
  { id: 17, name: 'JFINEX', image: nuOrg17, description: 'NU MOA Junior Financial Executives is the academic student organization dedicated to nurturing and empowering tomorrows financial leaders.' },
  { id: 18, name: 'JPIA', image: nuOrg18, description: 'NU MOA Junior Philippine Institute of Accountants is a recognized organization that supports BS Accountancy students in their academic and professional growth.' },
  { id: 19, name: 'Love for Reading Club', image: nuOrg19, description: 'The Love for Reading Club, the official group of NU MOA\'s Learning Resource Center, promotes reading, supports library services, and enhances students\' information literacy.' },
  { id: 20, name: 'NU MOA PEERS', image: nuOrg20, description: 'NU MOA PEERS is a recognized student council under the guidance services office' },
  { id: 21, name: 'NURSING', image: nuOrg21, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 22, name: 'OPTOMETRY', image: nuOrg22, description: 'The Optometry Student Council (OSC) at NU MOAs School of Optometry is a representative body and a support organization for optometry students.' },
  { id: 23, name: 'PSYCHSOC', image: nuOrg23, description: 'Psychology Society is a Recognized Student Organization that intends to create fun and informative events and programs to provide safe space for our fellow Psychology Students.' },
  { id: 24, name: 'RED CROSS', image: nuOrg24, description: 'THE NU MOA - College Red Cross Youth Council is a sociocivic, student-led organization committed to volunteerism and humanitarian service. ' },
  { id: 25, name: 'SAM', image: nuOrg25, description: 'The NU MOA College Red Cross Youth Council is a student-led socio-civic group dedicated to volunteerism and humanitarian service' },
  { id: 26, name: 'Tousoc', image: nuOrg26, description: 'The Tourism Society Organization is a vibrant and inclusive community that brings together students with a passion for the dynamic  world of tourism.' },
  { id: 27, name: 'YUGEN', image: nuOrg27, description: 'Aims to establish a creative and interactive community of Japanese culture hobbyists, focusing on Japanese media and culture.' }
];

const Organizations = () => {
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const openModal = (org) => {
    setSelectedOrganization(org);
  };

  const closeModal = () => {
    setSelectedOrganization(null);
  };

  const toggleViewAll = () => {
    setShowAll(!showAll);
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    cssEase: 'ease-in-out',
    dotsClass: 'slick-dots custom-dots',
    customPaging: function (i) {
      return <button className="custom-dot"></button>;
    },
    appendDots: (dots) => <ul style={{ display: 'flex', alignItems: 'center' }}>{dots.slice(0, 3)}</ul>,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <React.Fragment>
      <div className="organizations-page">
        <h1>ORGANIZATIONS</h1>
        {!showAll ? (
          <Slider {...settings}>
            {organizations.map((org) => (
              <div key={org.id} className="cards-slider">
                <div className="cards" onClick={() => openModal(org)}>
                  <img src={org.image} alt={org.name} className="cards-image" />
                  <div className="cards-info">
                    <h2>{org.name}</h2>
                    <p>{org.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="organizations-grid">
            {organizations.map((org) => (
              <div key={org.id} className="cards grid-view">
                <img src={org.image} alt={org.name} className="cards-image" />
                <div className="cards-info">
                  <h2>{org.name}</h2>
                  <p>{org.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="view-all-button" onClick={toggleViewAll}>
          {showAll ? 'View Carousel' : 'View All Organizations'}
        </button>

        <div className="mission-vision">
          <p>School organizations bring students together to pursue shared interests, build community, and develop leadership skills.
            <br />
            They play a key role in enhancing student life and fostering personal growth.
          </p>
        </div>

        {selectedOrganization && (
          <Modal 
            organization={selectedOrganization} 
            onClose={closeModal} 
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default Organizations;
