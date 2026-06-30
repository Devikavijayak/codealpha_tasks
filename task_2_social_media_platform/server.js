const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'super-secret-aura-key-123'; // In a real app, use environment variables

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'social.db'), (err) => {
    if (err) console.error('Database opening error: ', err);
    else initDb();
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            bio TEXT,
            avatar TEXT
        )`);

        // Posts Table
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Comments Table
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            content TEXT NOT NULL,
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

        // Notifications Table
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, -- Receiver
            actor_id INTEGER, -- Who did it
            type TEXT, -- 'like', 'comment', 'follow'
            post_id INTEGER, -- Optional, if related to a post
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(actor_id) REFERENCES users(id)
        )`);

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
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
                    
                    db.run(`INSERT INTO messages (sender_id, receiver_id, content) VALUES
                        (1, 2, 'Hey Bob!'),
                        (2, 1, 'Hi Alice! How are you?')
                    `);
                    console.log('Seeded initial data.');
                }, 1000); // give users time to insert
            }
        });
    });
}

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
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
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            
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
    
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'Invalid username or password' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            token, 
            user: { id: user.id, username: user.username, bio: user.bio, avatar: user.avatar } 
        });
    });
});

// --- API ROUTES ---

// Get current user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
    db.get(`
        SELECT u.id, u.username, u.bio, u.avatar,
        (SELECT COUNT(*) FROM followers WHERE followee_id = u.id) as followersCount,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as followingCount
        FROM users u WHERE u.id = ?`, 
    [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    });
});

// Get all users (for suggestions)
app.get('/api/users', authenticateToken, (req, res) => {
    db.all(`SELECT id, username, avatar FROM users`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get feed
app.get('/api/feed', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.timestamp DESC
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Explore (Trending Posts)
app.get('/api/explore', authenticateToken, (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY likesCount DESC, p.timestamp DESC
        LIMIT 10
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
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
        res.json({ id: this.lastID, success: true });
    });
});

// Toggle Like
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    db.get("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Unlike
            db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: false });
            });
        } else {
            // Like
            db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // Add notification
                db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
                    if (post && post.user_id !== userId) {
                        db.run("INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, 'like', ?)", 
                        [post.user_id, userId, postId]);
                    }
                });
                
                res.json({ liked: true });
            });
        }
    });
});

// Add comment
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    db.run("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, userId, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Add notification
        db.get("SELECT user_id FROM posts WHERE id = ?", [postId], (err, post) => {
            if (post && post.user_id !== userId) {
                db.run("INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, 'comment', ?)", 
                [post.user_id, userId, postId]);
            }
        });

        res.json({ id: this.lastID, success: true });
    });
});

// Get comments for a post
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const query = `
        SELECT c.*, u.username, u.avatar 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? 
        ORDER BY c.timestamp ASC
    `;
    db.all(query, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Toggle follow
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
    const followeeId = req.params.id;
    const followerId = req.user.id;

    if (followeeId == followerId) return res.status(400).json({ error: 'Cannot follow yourself' });

    db.get("SELECT 1 FROM followers WHERE follower_id = ? AND followee_id = ?", [followerId, followeeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Unfollow
            db.run("DELETE FROM followers WHERE follower_id = ? AND followee_id = ?", [followerId, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: false });
            });
        } else {
            // Follow
            db.run("INSERT INTO followers (follower_id, followee_id) VALUES (?, ?)", [followerId, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // Add notification
                db.run("INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, 'follow')", [followeeId, followerId]);
                
                res.json({ following: true });
            });
        }
    });
});

// Get Notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
    const query = `
        SELECT n.*, u.username, u.avatar 
        FROM notifications n
        JOIN users u ON n.actor_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.timestamp DESC
        LIMIT 20
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Messages
app.get('/api/messages', authenticateToken, (req, res) => {
    const query = `
        SELECT m.*, u.username, u.avatar 
        FROM messages m
        JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id) AND u.id != ?
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.timestamp DESC
    `;
    db.all(query, [req.user.id, req.user.id, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Since we join, we might get duplicate rows if we send to self, but filter handles it.
        // Let's deduplicate or just group by user in frontend.
        res.json(rows);
    });
});

// Send Message
app.post('/api/messages', authenticateToken, (req, res) => {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'Missing fields' });

    db.run("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", 
    [req.user.id, receiver_id, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Serve frontend for any other route (SPA fallback)
app.get(/^.*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Database connected');
});
