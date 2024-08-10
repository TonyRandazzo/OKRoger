import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CompanyCard from '../components/CompanyCard';

const Home = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setCompanies(data);
        setFilteredCompanies(data); 
      })
      .catch(error => console.error('Error fetching companies:', error));
  }, [navigate]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredCompanies(
        companies.filter(company =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <div className="company-cards-container">
        {filteredCompanies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default Home;
