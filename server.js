const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_internship_key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./social.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            bio TEXT,
            avatar TEXT
        )`);

        // Posts Table
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Comments Table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(post_id) REFERENCES posts(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Likes Table
        db.run(`CREATE TABLE IF NOT EXISTS likes (
            user_id INTEGER,
            post_id INTEGER,
            PRIMARY KEY (user_id, post_id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(post_id) REFERENCES posts(id)
        )`);

        // Followers Table
        db.run(`CREATE TABLE IF NOT EXISTS followers (
            follower_id INTEGER,
            followee_id INTEGER,
            PRIMARY KEY (follower_id, followee_id),
            FOREIGN KEY(follower_id) REFERENCES users(id),
            FOREIGN KEY(followee_id) REFERENCES users(id)
        )`);

        // Seed some data if empty
        db.get("SELECT COUNT(*) AS count FROM users", async (err, row) => {
            if (row && row.count === 0) {
                const defaultPasswordHash = await bcrypt.hash('password123', 10);
                
                const stmt = db.prepare(`INSERT INTO users (username, password, bio, avatar) VALUES (?, ?, ?, ?)`);
                stmt.run('Alice', defaultPasswordHash, 'Tech enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice');
                stmt.run('Bob', defaultPasswordHash, 'Just here for memes', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob');
                stmt.run('Charlie', defaultPasswordHash, 'Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie');
                stmt.finalize();

                setTimeout(() => {
                    db.run(`INSERT INTO posts (user_id, content) VALUES 
                        (1, 'Hello world! My first post on this platform.'),
                        (2, 'Does anyone know a good pizza place?')
                    `);
                    db.run(`INSERT INTO comments (post_id, user_id, content) VALUES 
                        (2, 1, 'Yes, try Luigis in downtown!')
                    `);
                    db.run(`INSERT INTO likes (user_id, post_id) VALUES (2, 1)`);
                    db.run(`INSERT INTO followers (follower_id, followee_id) VALUES (2, 1), (3, 1)`);
                }, 500);
            }
        });
    });
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalid or expired' });
        req.user = user; // { id: userId, username: username }
        next();
    });
}

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        
        db.run("INSERT INTO users (username, password, bio, avatar) VALUES (?, ?, ?, ?)", 
        [username, hashedPassword, 'Hello! I am new here.', avatar], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username already taken' });
                }
                return res.status(500).json({ error: err.message });
            }
            
            // Generate token immediately for login after register
            const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: this.lastID, username, avatar } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            token, 
            user: { id: user.id, username: user.username, bio: user.bio, avatar: user.avatar } 
        });
    });
});

// --- PROTECTED API ROUTES ---

// Get all users
app.get('/api/users', authenticateToken, (req, res) => {
    db.all("SELECT id, username, bio, avatar FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get user profile by id (including current user profile)
app.get('/api/users/:id', authenticateToken, (req, res) => {
    // If client asks for 'me', return the logged-in user profile
    const userId = req.params.id === 'me' ? req.user.id : req.params.id;
    
    db.get("SELECT id, username, bio, avatar FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        db.get("SELECT COUNT(*) as followersCount FROM followers WHERE followee_id = ?", [userId], (err, followers) => {
            db.get("SELECT COUNT(*) as followingCount FROM followers WHERE follower_id = ?", [userId], (err, following) => {
                user.followersCount = followers ? followers.followersCount : 0;
                user.followingCount = following ? following.followingCount : 0;
                
                db.get("SELECT * FROM followers WHERE follower_id = ? AND followee_id = ?", [req.user.id, userId], (err, followStatus) => {
                    user.isFollowing = !!followStatus;
                    res.json(user);
                });
            });
        });
    });
});

// Get all posts (Feed)
app.get('/api/posts', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.timestamp DESC
    `;
    db.all(query, [req.user.id], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});

// Get User Posts
app.get('/api/users/:id/posts', authenticateToken, (req, res) => {
    const targetUserId = req.params.id === 'me' ? req.user.id : req.params.id;
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.timestamp DESC
    `;
    db.all(query, [req.user.id, targetUserId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a post
app.post('/api/posts', authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    db.run("INSERT INTO posts (user_id, content) VALUES (?, ?)", [req.user.id, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, user_id: req.user.id, content });
    });
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    const query = `
        SELECT c.*, u.username, u.avatar 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.timestamp ASC
    `;
    db.all(query, [postId], (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comments);
    });
});

// Add a comment
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    db.run("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, req.user.id, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, post_id: postId, user_id: req.user.id, content });
    });
});

// Toggle Like
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    
    db.get("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [req.user.id, postId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            // Unlike
            db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [req.user.id, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: false });
            });
        } else {
            // Like
            db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [req.user.id, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: true });
            });
        }
    });
});

// Toggle Follow
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
    const followeeId = req.params.id;
    if (followeeId == req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
    
    db.get("SELECT * FROM followers WHERE follower_id = ? AND followee_id = ?", [req.user.id, followeeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            db.run("DELETE FROM followers WHERE follower_id = ? AND followee_id = ?", [req.user.id, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: false });
            });
        } else {
            db.run("INSERT INTO followers (follower_id, followee_id) VALUES (?, ?)", [req.user.id, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: true });
            });
        }
    });
});

// Get user's feed (Posts by user and people they follow)
app.get('/api/feed', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ? OR p.user_id IN (SELECT followee_id FROM followers WHERE follower_id = ?)
        ORDER BY p.timestamp DESC
    `;
    db.all(query, [req.user.id, req.user.id, req.user.id], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
