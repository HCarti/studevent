// OrganizationsPage.js
import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Organizations.css';
import Modal from './Modal'; // Import the Modal component
 
 
// Import images
import nuOrg1 from '../Images/Orgs/JPCS.png';
import nuOrg2 from '../Images/Orgs/Hydroid.png';
import nuOrg3 from '../Images/Orgs/FNL.png';
import nuOrg4 from '../Images/Orgs/ITSC.png';
import nuOrg5 from '../Images/Orgs/JMOA.png';
import nuOrg6 from '../Images/Orgs/MTSC.png';
import nuOrg7 from '../Images/Orgs/PHISMETS.png';
 
const organizations = [
  { id: 1, name: 'JPCS',
    image: nuOrg1,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
 
  { id: 2,
    name: 'Hydroid Olympians',
    image: nuOrg2,
    description: 'Suspendisse potenti. Integer quis tempor ligula.' },
 
  { id: 3,
    name: 'FNL',
    image: nuOrg3,
    description: 'Donec vitae ligula at sem ultricies posuere.' },
 
  { id: 4,
    name: 'ITSC',
    image: nuOrg4,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
 
  { id: 5,
    name: 'JMOA',
    image: nuOrg5,
    description: 'Suspendisse potenti. Integer quis tempor ligula.' },
 
  { id: 6,
    name: 'MTSC',
    image: nuOrg6,
    description: 'Donec vitae ligula at sem ultricies posuere.' },
 
  { id: 7,
    name: 'PHISMETS',
    image: nuOrg7,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];
 
const Organizations = () => {
  const [selectedOrg, setSelectedOrg] = useState(null); // Track the selected organization
  const [isModalOpen, setModalOpen] = useState(false);  // Track modal state
 
  const handleCardClick = (org) => {
    setSelectedOrg(org);
    setModalOpen(true);
  };
 
  const closeModal = () => {
    setModalOpen(false);
  };
 
  const settings = {
    dots: true,
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
    <div className="organizations-page">
      <h1>ORGANIZATIONS</h1>
      <Slider {...settings}>
        {organizations.map((org) => (
          <div key={org.id} className="cards-slider">
            <div className="cards" onClick={() => handleCardClick(org)}>
              <img src={org.image} alt={org.name} className="cards-image" />
              <div className="cards-info">
                <h2>{org.name}</h2>
                <p>{org.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
 
      {isModalOpen && selectedOrg && (
        <Modal organization={selectedOrg} closeModal={closeModal} />
      )}
       {/* Add mission and vision below the slider */}
  <div className="mission-vision">
    <p>School organizations bring students together to pursue shared interests, build community, and develop leadership skills.
      <br></br>
    They play a key role in enhancing student life and fostering personal growth.
    </p>
  </div>
</div>
  );
};
 
export default Organizations;