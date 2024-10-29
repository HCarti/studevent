// ViewAllOrganizations.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './ViewAllOrganizations.css'; // A new CSS file for this page
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
  { id: 27, name: 'YUGEN', image: nuOrg27, description: 'Donec vitae ligula at sem ultricies posuere.' },
];

const ViewAllOrganizations = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  return (
  <React.Fragment>
    <div className="view-all-organizations-page">
      <h1>All Organizations</h1>
      <div className="organizations-list">
        {organizations.map((org) => (
          <div key={org.id} className="organization-card">
            <img src={org.image} alt={org.name} className="organization-image" />
            <h2>{org.name}</h2>
            <p>{org.description}</p>
          </div>
        ))}
      </div>
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
   <Footer></Footer>
  </React.Fragment>
  
  );
};

export default ViewAllOrganizations;
