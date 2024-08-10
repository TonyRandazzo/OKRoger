import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => (
  <div className="company-card">
    {company.photo ? (
      <img src={`${process.env.REACT_APP_BACKEND_URL}${company.photo}`} alt={company.name} />
    ) : (
      <div className="placeholder-image">No image available</div>
    )}
    <div className="company-card-content">
      <h3>{company.name}</h3>
      <p>{company.description.substring(0, 100)}...</p>
      <p>Rating: {company.averageRating} ({company.reviewCount} reviews)</p>
      <Link to={`/companies/${company.id}`}>View Details</Link>
    </div>
  </div>
);

export default CompanyCard;
