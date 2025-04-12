// OrganizationsPage.js
import React, { useRef, useState } from 'react'; // Import useState
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Organizations.css';
import Modal from './Modal'; // Import Link from react-router-dom
import { Link } from 'react-router-dom'; // Ensure Link is imported
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
  { id: 1, name: 'JPCS', image: nuOrg1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 2, name: 'Hydroid Olympians', image: nuOrg2, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 3, name: 'NUSG', image: nuOrg3, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 4, name: 'ITSC', image: nuOrg4, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 5, name: 'JMOA', image: nuOrg5, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 6, name: 'MTSC', image: nuOrg6, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 7, name: 'PHISMETS', image: nuOrg7, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 8, name: 'CAMPUS MINISTRY', image: nuOrg8, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 9, name: 'COCO', image: nuOrg9, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 10, name: 'ComEx Brigade', image: nuOrg10, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 11, name: 'CSE', image: nuOrg11, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 12, name: 'CWSJ', image: nuOrg12, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 13, name: 'DANCE HIVE', image: nuOrg13, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 14, name: 'DENTAL CLINICIANS CLUB', image: nuOrg14, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 15, name: 'DSC', image: nuOrg15, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 16, name: 'FIRST IMPRESSION', image: nuOrg16, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 17, name: 'JFINEX', image: nuOrg17, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 18, name: 'JPIA', image: nuOrg18, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 19, name: 'Love for Reading Club', image: nuOrg19, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 20, name: 'NU MOA PEERS', image: nuOrg20, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 21, name: 'NURSING', image: nuOrg21, description: 'Suspendisse potenti. Integer quis tempor ligula.' },
  { id: 22, name: 'OPTOMETRY', image: nuOrg22, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 23, name: 'PSYCHSOC', image: nuOrg23, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 24, name: 'RED CROSS', image: nuOrg24, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 25, name: 'SAM', image: nuOrg25, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 26, name: 'Tousoc', image: nuOrg26, description: 'Donec vitae ligula at sem ultricies posuere.' },
  { id: 27, name: 'YUGEN', image: nuOrg27, description: 'Donec vitae ligula at sem ultricies posuere.' }
];

const Organizations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const missionVisionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const openModal = (org) => {
    setSelectedOrganization(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
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
      <Slider {...settings}>
        {organizations.map((org) => (
          <div key={org.id} className="cards-slider">
            <div className="cards" onClick={() => openModal(org)}> {/* Open modal on click */}
              <img src={org.image} alt={org.name} className="cards-image" />
              <div className="cards-info">
                <h2>{org.name}</h2>
                <p>{org.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* View All Organizations Button */}
      <div className="view-all-container">
        <Link to="/view-all-organizations" className="view-all-btn">
          View All Organizations
        </Link>
      </div>

      {/* Render the Modal if it's open */}
      {isModalOpen && (
        <Modal 
          organization={selectedOrganization} 
          closeModal={closeModal} 
        />
      )}
  
      {/* Add mission and vision below the slider */}
      <div className="mission-vision">
        <p>School organizations bring students together to pursue shared interests, build community, and develop leadership skills.
          <br />
          They play a key role in enhancing student life and fostering personal growth.
        </p>
      </div>
    </div>
  </React.Fragment>
  );
};

export default Organizations;
