import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const userType = localStorage.getItem('userType');
    if (userType === 'employee') {
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      const companyWorkedAt = localStorage.getItem('companyWorkedAt');
      const password = localStorage.getItem('password');

      if (firstName && lastName && companyWorkedAt && password) {
        setUser({ userType, firstName, lastName, companyWorkedAt, password });
        setFormData({ firstName, lastName, companyWorkedAt, password });
      } else {
        alert("No data, please try logging in again");
      }
    } else if (userType === 'company') {
      const name = localStorage.getItem('name');
      const photo = localStorage.getItem('photo');
      const description = localStorage.getItem('description');
      const location = localStorage.getItem('location');
      const password = localStorage.getItem('password');

      if (name && photo && description && location && password) {
        setUser({ userType, name, photo, description, location, password });
        setFormData({ name, description, location, password, photo });
      } else {
        alert("No data, please try logging in again");
      }
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.userType === 'employee') {
        await axios.put(`/api/users/${user.id}`, formData);
      } else if (user.userType === 'company') {
        const formDataWithFile = new FormData();
        Object.keys(formData).forEach((key) => {
          formDataWithFile.append(key, formData[key]);
        });
        await axios.put(`/api/companies/${user.id}`, formDataWithFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      alert('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="user-profile">
      <h1>{user.userType === 'employee' ? 'User Profile' : 'Company Profile'}</h1>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {user.userType === 'employee' ? (
            <>
              <label>
                First Name:
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Last Name:
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Company Worked At:
                <input
                  type="text"
                  name="companyWorkedAt"
                  value={formData.companyWorkedAt}
                  onChange={handleInputChange}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Company Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Photo:
                <input
                  type="file"
                  name="photo"
                  onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                />
              </label>
            </>
          )}
          <label>
            Password:
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {passwordVisible ? 'Hide' : 'Show'}
            </button>
          </label>
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <>
          {user.userType === 'employee' ? (
            <>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Company Worked At:</strong> {user.companyWorkedAt}</p>
            </>
          ) : (
            <>
              <p><strong>Company Name:</strong> {user.name}</p>
              <img src={user.photo} alt="Company Logo" style={{ width: '150px', height: '150px' }} />
              <p><strong>Description:</strong> {user.description}</p>
              <p><strong>Location:</strong> {user.location}</p>
            </>
          )}
          <p>
            <strong>Password:</strong>
            <span>{passwordVisible ? user.password : '********'}</span>
            <button onClick={togglePasswordVisibility}>
              {passwordVisible ? 'Hide' : 'Show'}
            </button>
          </p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default UserProfile;
