import React from 'react';
import '../styles/Filters.css';

const Filters = ({ setFilter }) => {
  return (
    <div className="filters-container">
      <div className="filters">
        <span className="filter-brace">{'{'}</span>
        <span className="filter-item" onClick={() => setFilter('All')}>All</span>
        <span className="filter-item" onClick={() => setFilter('Cakes')}>Cakes</span>
        <span className="filter-item" onClick={() => setFilter('Cupcakes')}>Cupcakes</span>
        <span className="filter-brace">{'}'}</span>
      </div>
      <div className="filters-line"></div>
    </div>
  );
};

export default Filters;
