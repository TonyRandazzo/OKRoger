import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import starImage from '../immagini/Tire.png';
import halfStarImage from '../immagini/Half-Tire.png'; 

const CompanyDetail = () => {
  const { id } = useParams();
  const [filterBy, setFilterBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('asc');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    setLoading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCompany(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!company) return <div>No company data found.</div>;

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const handleUpvote = (reviewId) => {
    const token = localStorage.getItem('token');

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews/${reviewId}/upvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCompany((prevCompany) => ({
          ...prevCompany,
          reviews: prevCompany.reviews.map((review) => {
            if (review.id === reviewId) {
              return { ...review, upvotes: data.upvotes };
            }
            return review;
          }),
        }));
      })
      .catch((error) => console.error(error));
  };

  const handleDownvote = (reviewId) => {
    const token = localStorage.getItem('token');

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews/${reviewId}/downvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCompany((prevCompany) => ({
          ...prevCompany,
          reviews: prevCompany.reviews.map((review) => {
            if (review.id === reviewId) {
              return { ...review, downvotes: data.downvotes };
            }
            return review;
          }),
        }));
      })
      .catch((error) => console.error(error));
  };

  const handleFilterChange = (event) => {
    const filterBy = event.target.value;
    const sortedReviews = company.reviews.slice();

    switch (filterBy) {
      case 'rating':
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'upvotes':
        sortedReviews.sort((a, b) => a.upvotes - b.upvotes);
        break;
      case 'anonymous':
        sortedReviews.sort((a, b) => a.anonymous - b.anonymous);
        break;
      default:
        break;
    }

    setCompany((prevCompany) => ({ ...prevCompany, reviews: sortedReviews }));
  };

  const handleSortChange = (event) => {
    const sortOrder = event.target.value;
    const sortedReviews = company.reviews.slice();

    if (sortOrder === 'asc') {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    } else {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    }

    setCompany((prevCompany) => ({ ...prevCompany, reviews: sortedReviews }));
  };

  return (
    <div className="company-detail">
      <h1 className="company-name">{company.name}</h1>
      <div className="company-image-container">
        {company.photo ? (
          <img
            className="company-image"
            src={`${process.env.REACT_APP_BACKEND_URL}${company.photo}`}
            alt={company.name}
          />
        ) : (
          <p>No image available</p>
        )}
      </div>
      <p className="company-description"><strong>Description:</strong> <br></br>{company.description}</p>
      <p className="company-location"><strong>Location:</strong> {company.location}</p>
      {/* <select value={filterBy} onChange={handleFilterChange}>
  <option value="rating">Rating</option>
  <option value="upvotes">Upvotes</option>
  <option value="anonymous">Anonymity</option>
</select>
<select value={sortOrder} onChange={handleSortChange}>
  <option value="asc">Ascending</option>
  <option value="desc">Descending</option>
</select> */}
      <div className="reviews-section">
        <h2>Reviews</h2>
        {company.reviews && company.reviews.length > 0 ? (
          company.reviews.map(review => (
            <div className="review" key={review.id}>
              <p className="review-text">{review.text}</p>
              <small className="review-author">
                {review.anonymous ? 'Anonymous' : `${firstName} ${lastName}`}
              </small>
              <div className="review-rating">
                Rating:
                {Array(review.rating).fill(0).map((_, index) => (
                  <img src={starImage} alt="star" key={index} style={{ width: 20, height: 20 }} />
                ))}
              </div>
              {/* <div className="review-votes">
                <button onClick={() => handleUpvote(review.id)}>Upvote {review.upvotes}</button>
                <button onClick={() => handleDownvote(review.id)}>Downvote {review.downvotes}</button>
              </div> */}
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
        <Link to={`/companies/${id}/review`} state={{ companyId: id }}>
          Add a Review
        </Link>
      </div>

    </div>
  );
};

export default CompanyDetail;
