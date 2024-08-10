import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Review = () => {
  const { id } = useParams();
  const companyId = id;
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [rating, setRating] = useState(1);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies/${companyId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ companyId, text, anonymous, rating }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigate(`/companies/${companyId}`);
        }
      })
      .catch(error => console.error('Error submitting review:', error));
  };

  return (
    <div className="review-container">
      <form className="review-form" onSubmit={handleSubmit}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your review" required></textarea>
        <label>
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} />
          Post as anonymous
        </label>
        <label>
          Rating:
          <select value={rating} onChange={(e) => setRating(parseFloat(e.target.value))}>
            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
              <option key={star} value={star}>{star}</option>
            ))}
          </select>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Review;