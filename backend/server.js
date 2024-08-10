const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ok_roger'
});

const secretKey = 'your_secret_key'; 

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Database connected!');
  createTables();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

function createTables() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      companyWorkedAt VARCHAR(255)
    )
  `;

  const createCompaniesTable = `
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      photo VARCHAR(255),
      description TEXT NOT NULL,
      location VARCHAR(255) NOT NULL
    )
  `;

  const createReviewsTable = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      companyId INT NOT NULL,
      text TEXT NOT NULL,
      anonymous BOOLEAN DEFAULT false,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      FOREIGN KEY (companyId) REFERENCES companies(id)
    )
  `;

  db.query(createUsersTable, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    console.log('Users table created or already exists.');
  });

  db.query(createCompaniesTable, (err, result) => {
    if (err) {
      console.error('Error creating companies table:', err);
      return;
    }
    console.log('Companies table created or already exists.');
  });

  db.query(createReviewsTable, (err, result) => {
    if (err) {
      console.error('Error creating reviews table:', err);
      return;
    }
    console.log('Reviews table created or already exists.');
  });
}

function generateToken(user) {
  return jwt.sign(user, secretKey, { expiresIn: '1h' });
}

app.post('/api/register', upload.single('photo'), (req, res) => {
  const { userType, ...userData } = req.body;

  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  if (userType === 'company') {
    const { name, password, description, location } = userData;
    const query = 'INSERT INTO companies (name, password, photo, description, location) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, password, photoPath, description, location], (err, result) => {
      if (err) {
        console.error('Error inserting company:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const token = generateToken({ userType, name });
      res.json({ success: true, token });
    });
  } else if (userType === 'employee') {
    const { firstName, lastName, password, companyWorkedAt } = userData;
    const query = 'INSERT INTO users (firstName, lastName, password, companyWorkedAt) VALUES (?, ?, ?, ?)';
    db.query(query, [firstName, lastName, password, companyWorkedAt], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const token = generateToken({ userType, firstName, lastName });
      res.json({ success: true, token });
    });
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/api/login', (req, res) => {
  const { userType, ...userData } = req.body;

  if (userType === 'employee') {
    const { firstName, lastName, password } = userData;
    const query = 'SELECT firstName, lastName, companyWorkedAt, password FROM users WHERE firstName = ? AND lastName = ? AND password = ?';
    db.query(query, [firstName, lastName, password], (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const user = results[0];
      const token = generateToken({ userType, firstName, lastName });
      res.json({
        success: true,
        token,
        firstName: user.firstName,
        lastName: user.lastName,
        companyWorkedAt: user.companyWorkedAt,
        password: user.password,
      });
    });
  } else if (userType === 'company') {
    const { name, password } = req.body;
    const query = 'SELECT * FROM companies WHERE name = ? AND password = ?';
    db.query(query, [name, password], (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const company = results[0];
      const token = generateToken({ userType, name });
      res.json({
        success: true,
        token,
        name: company.name,
        photo: company.photo,
        description: company.description,
        location: company.location,
        password: company.password,
      });
    });
  } else {
    res.status(400).json({ error: 'Invalid user type' });
  }
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, password, companyWorkedAt } = req.body;
  const query = 'UPDATE users SET firstName = ?, lastName = ?, password = ?, companyWorkedAt = ? WHERE id = ?';

  db.query(query, [firstName, lastName, password, companyWorkedAt, id], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'User updated successfully' });
  });
});

app.put('/api/companies/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { name, password, description, location } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : req.body.photo; 
  const query = 'UPDATE companies SET name = ?, password = ?, description = ?, location = ?, photo = ? WHERE id = ?';

  db.query(query, [name, password, description, location, photoPath, id], (err, result) => {
    if (err) {
      console.error('Error updating company:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true, message: 'Company updated successfully' });
  });
});

app.get('/api/users/:firstName/:lastName', (req, res) => {
  const { firstName, lastName } = req.params;
  const query = 'SELECT * FROM users WHERE firstName = ? AND lastName = ?';
  db.query(query, [firstName, lastName], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.get('/api/companies', (req, res) => {
  const query = 'SELECT * FROM companies';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching companies:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

app.get('/api/companies/:id', (req, res) => {
  const companyId = req.params.id;
  db.query(`SELECT * FROM companies WHERE id = ?`, [companyId], (err, companyResults) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const company = companyResults[0];
      db.query(`SELECT * FROM reviews WHERE companyId = ?`, [companyId], (err, reviewResults) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json({
            id: company.id,
            name: company.name,
            photo: company.photo,
            description: company.description,
            location: company.location,
            reviews: reviewResults.map((review) => ({
              id: review.id,
              text: review.text,
              rating: review.rating,
              anonymous: review.anonymous,
              upvotes: review.upvotes,
              downvotes: review.downvotes,
            })),
          });
        }
      });
    }
  });
});
app.post('/api/reviews/:id/upvote', (req, res) => {
  const reviewId = req.params.id;
  db.query(`UPDATE reviews SET upvotes = upvotes + 1 WHERE id = ?`, [reviewId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});

app.post('/api/reviews/:id/downvote', (req, res) => {
  const reviewId = req.params.id;
  db.query(`UPDATE reviews SET downvotes = downvotes + 1 WHERE id = ?`, [reviewId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});


app.post('/api/companies/:id/reviews', (req, res) => {
  const { text, anonymous, rating, companyId } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const query = 'INSERT INTO reviews (companyId, text, anonymous, rating) VALUES (?, ?, ?, ?)';
  db.query(query, [companyId, text, anonymous, rating], (err, result) => {
    if (err) {
      console.error(`Error adding review for company with id ${companyId}:`, err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ success: true });
  });
});


app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
