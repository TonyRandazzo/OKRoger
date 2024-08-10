import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [userType, setUserType] = useState('employee');
  const [locationFetchTimeout, setLocationFetchTimeout] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    companyWorkedAt: '',
    name: '',
    photo: null,
    description: '',
    location: ''
  });
  const [passwordError, setPasswordError] = useState(''); 
  const [searchCountry, setSearchCountry] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const apiKey = 'tony_randazzo';
  const apiUrl = `http://api.geonames.org/searchJSON?username=${apiKey}&featureClass=P&maxRows=50`; 
  const suggestionsRef = useRef(null);
  const seenCities = useRef(new Set()); 

  const navigate = useNavigate();

  useEffect(() => {
    const hasChecked = localStorage.getItem('hasCheckedRedirect');
    if (!hasChecked) {
      const userType = localStorage.getItem('userType');
      const password = localStorage.getItem('password');
      if (userType && password) {
        localStorage.setItem('hasCheckedRedirect', 'true');
        navigate('/home');
      } else {
        localStorage.setItem('hasCheckedRedirect', 'true');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log(localStorage);
    }
  }, [navigate]);

  const fetchLocations = (query, pageNum, inputText) => {
    setLoading(true);
    fetch(`${apiUrl}&name_startsWith=${query}&page=${pageNum}&lang=it`)
      .then((response) => response.json())
      .then((data) => {
        if (data.geonames) {
          const newSuggestions = data.geonames
            .filter(
              (city) =>
                !seenCities.current.has(`${city.name}, ${city.countryName}`) &&
                (city.name.toLowerCase().includes(inputText.toLowerCase()) ||
                  city.countryName.toLowerCase().includes(inputText.toLowerCase()))
            )
            .map((city) => {
              seenCities.current.add(`${city.name}, ${city.countryName}`);
              return {
                name: city.name,
                country: city.countryName,
                isItaly: city.countryCode === 'IT'
              };
            });
  
          setLocationSuggestions((prevSuggestions) => [
            ...prevSuggestions,
            ...newSuggestions
          ]);
  
          setPage(pageNum + 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };



  const handleLocationChange = (e) => {
    const inputValue = e.target.value;
    setSearchCountry(inputValue);
    clearTimeout(locationFetchTimeout);
    if (inputValue === '') {
      setLocationSuggestions([]);
      seenCities.current.clear();
      setPage(1);
    } else {
      const filteredSuggestions = locationSuggestions.filter((suggestion) =>
        suggestion.name.toLowerCase().includes(inputValue.toLowerCase())
      );
  
      const sortedSuggestions = filteredSuggestions.sort((a, b) => {
        if (a.isItaly && !b.isItaly) {
          return -1;
        } else if (!a.isItaly && b.isItaly) {
          return 1;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  
      setLocationSuggestions(sortedSuggestions);
      setLocationFetchTimeout(
        setTimeout(() => {
          if (searchCountry && locationSuggestions.length === 0) {
            fetchLocations(searchCountry, 1, searchCountry);
          }
        }, 500)
      );
    }
  };

  const handleLocationClick = () => {
    setShowLocationSuggestions(true);
    if (searchCountry && locationSuggestions.length === 0) {
      fetchLocations(searchCountry, 1, searchCountry);
    }
  };

  const handleLocationSelect = (suggestion) => {
    setFormData({ ...formData, location: `${suggestion.name}, ${suggestion.country}` });
    setSearchCountry(`${suggestion.name}, ${suggestion.country}`);
    setShowLocationSuggestions(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        suggestionsRef.current &&
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight
      ) {
        return;
      }
      if (searchCountry && !loading) {
        fetchLocations(searchCountry, page);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [searchCountry, page, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userType') {
      console.log('User type changed:', value); 
      setUserType(value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });

      if (name === 'password') {
        if (value.length < 8) {
          setPasswordError('La password deve essere di almeno 8 caratteri.');
        } else if (/\s/.test(value)) {
          setPasswordError('La password non deve contenere spazi.');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User type:', userType); 
    if (formData.password.length < 8 || /\s/.test(formData.password)) {
      alert('La password deve essere di almeno 8 caratteri e non deve contenere spazi.');
      return;
    }
  
    const endpoint = isRegister ? `${process.env.REACT_APP_BACKEND_URL}/api/register` : `${process.env.REACT_APP_BACKEND_URL}/api/login`;
  
    const data = {
      userType,
      ...formData
    };
  
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userType', userType);
          if (userType === 'employee') {
            localStorage.setItem('firstName', data.firstName);
            localStorage.setItem('lastName', data.lastName);
            localStorage.setItem('companyWorkedAt', data.companyWorkedAt);
            localStorage.setItem('password', data.password);
          } else if (userType === 'company') {
            localStorage.setItem('name', data.name);
            localStorage.setItem('photo', data.photo);
            localStorage.setItem('description', data.description);
            localStorage.setItem('location', data.location);
            localStorage.setItem('password', data.password);
          }
          alert("Operazione riuscita!");
          navigate('/home');
        } else {
          alert("C'è stato un errore");
          console.error('Error:', data.error);
        }
      })      
  };

  return (
    <div className="login-register-container">
      <h1>{isRegister ? 'REGISTER' : 'LOGIN'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="employee"
              checked={userType === 'employee'}
              onChange={() => setUserType('employee')}
            />
            Employee
          </label>
          <label>
            <input
              type="radio"
              value="company"
              checked={userType === 'company'}
              onChange={() => setUserType('company')}
            />
            Company
          </label>
        </div>
        {isRegister && userType === 'employee' && (
          <>
            <h2>Employee</h2>
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
            <input type="text" name="companyWorkedAt" placeholder="Company Worked At" onChange={handleChange} required />
          </>
        )}
        {isRegister && userType === 'company' && (
          <>
            <h2>Company</h2>
            <input type="text" name="name" placeholder="Company Name" onChange={handleChange} required />
            <input type="file" name="photo" onChange={handleChange} required />
            <textarea name="description" placeholder="Company Description" onChange={handleChange} required></textarea>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={searchCountry}
              onChange={handleLocationChange}
              onClick={handleLocationClick}
              required
            />
            {showLocationSuggestions && (
              <ul className="location-suggestions" ref={suggestionsRef}>
                {locationSuggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleLocationSelect(suggestion)}>
                    {suggestion.name}, {suggestion.country}
                  </li>
                ))}
                {loading && <li>Loading...</li>}
              </ul>
            )}
          </>
        )}
        {!isRegister && (
          <>
            <input
              type="text"
              name={userType === 'employee' ? "firstName" : "name"}
              placeholder={userType === 'employee' ? "First Name" : "Company Name"}
              onChange={handleChange}
              required
            />
            {userType === 'employee' && (
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
                required
              />
            )}
          </>
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button className="toggle-form" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'New user? Register'}
      </button>
    </div>
  );
};

export default LoginRegister;
