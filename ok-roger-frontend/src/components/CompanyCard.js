import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import starImage from '../immagini/Tire.png';
import halfStarImage from '../immagini/Half-Tire.png'; 

const CompanyCard = ({ company }) => {
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(null);

  useEffect(() => {
    async function fetchAverageRating() {
      try {
        const response = await fetch(`/api/companies/${company.id}/average-rating`);
        const data = await response.json();
        setAverageRating(data.averageRating);
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchReviewCount() {
      try {
        const response = await fetch(`/api/companies/${company.id}/reviews`);
        const data = await response.json();
        setReviewCount(data.length);
      } catch (error) {
        console.error(error);
      }
    }

    fetchAverageRating();
    fetchReviewCount();
  }, [company.id]);

  const ratingStars = [];
  for (let i = 0; i < Math.floor(averageRating); i++) {
    ratingStars.push(<img src={starImage} alt="star" key={i} style={{ width: 24, height: 24 }} />);
  }
  if (averageRating % 1 !== 0) {
    ratingStars.push(<img src={halfStarImage} alt="half-star" key={Math.floor(averageRating)} style={{ width: 12, height: 24 }}/>);
  }

  return (
    <div className="company-card">
      {company.photo ? (
        <img src={`${process.env.REACT_APP_BACKEND_URL}${company.photo}`} alt={company.name} />
      ) : (
        <div className="placeholder-image">No image available</div>
      )}
      <div className="company-card-content">
        <h3>{company.name}</h3>
        <p>{company.description.substring(0, 100)}...</p>
        <p>
          Rating: {ratingStars} ({reviewCount || 0} reviews)
        </p>
        <Link to={`/companies/${company.id}`}>View Details</Link>
      </div>
    </div>
  );
};

export default CompanyCard;