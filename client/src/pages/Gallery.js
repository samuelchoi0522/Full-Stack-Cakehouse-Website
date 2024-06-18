import React, { useState, useEffect } from 'react';
import '../styles/Gallery.css';
import Filters from '../components/Filters';
import galleryPhotosData from '../galleryPhotosData';

// Function to shuffle an array using the Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  let shuffledArray = array.slice(); // Create a copy of the array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  const [shuffledPhotos, setShuffledPhotos] = useState([]);

  useEffect(() => {
    setShuffledPhotos(shuffleArray(galleryPhotosData));
  }, [filter]);

  const filteredPhotos = shuffledPhotos.filter(photo =>
    filter === 'All' ? true : photo.tags.includes(filter)
  );

  return (
    <div className="gallery-container">
      <h1 className="title">Gallery</h1>
      <Filters setFilter={setFilter} />
      <div className="photo-gallery">
        {filteredPhotos.map((photo, index) => (
          <img key={index} src={photo.src} alt={photo.alt} className="gallery-photo" />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
