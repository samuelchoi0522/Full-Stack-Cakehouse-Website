import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import Filters from '../components/Filters';
import photosData from '../photosData';

// Function to shuffle an array using the Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  let shuffledArray = array.slice(); // Create a copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const Home = () => {
  const [filter, setFilter] = useState('All');
  const [shuffledPhotos, setShuffledPhotos] = useState([]);

  useEffect(() => {
    setShuffledPhotos(shuffleArray(photosData));
  }, [filter]);

  const filteredPhotos = shuffledPhotos.filter(photo =>
    filter === 'All' ? true : photo.tags.includes(filter)
  );

  const limitedPhotos = filter === 'All' ? filteredPhotos.slice(0, 12) : filteredPhotos;

  return (
    <div className="home-container">
      <h1 className="title">Home</h1>
      <Filters setFilter={setFilter} />
      <div className="gallery-container">
        <div className="photo-gallery">
          {limitedPhotos.map((photo, index) => (
            <img key={index} src={photo.src} alt={photo.alt} className="gallery-photo" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
