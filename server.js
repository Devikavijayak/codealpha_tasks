const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
        db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO users (username, bio, avatar) VALUES 
                    ('Alice', 'Tech enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'),
                    ('Bob', 'Just here for memes', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'),
                    ('Charlie', 'Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie')
                `);
                
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

// Current user mock (Hardcoded as Alice - id:1)
const CURRENT_USER_ID = 1;

// API Routes

// Get all users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get user profile by id
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Get follower/following counts
        db.get("SELECT COUNT(*) as followersCount FROM followers WHERE followee_id = ?", [userId], (err, followers) => {
            db.get("SELECT COUNT(*) as followingCount FROM followers WHERE follower_id = ?", [userId], (err, following) => {
                user.followersCount = followers ? followers.followersCount : 0;
                user.followingCount = following ? following.followingCount : 0;
                
                // Check if current user is following this user
                db.get("SELECT * FROM followers WHERE follower_id = ? AND followee_id = ?", [CURRENT_USER_ID, userId], (err, followStatus) => {
                    user.isFollowing = !!followStatus;
                    res.json(user);
                });
            });
        });
    });
});

// Get all posts (Feed)
app.get('/api/posts', (req, res) => {
    const query = `
        SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likesCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as commentsCount,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as isLikedByMe
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.timestamp DESC
    `;
    db.all(query, [CURRENT_USER_ID], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});

// Create a post
app.post('/api/posts', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    db.run("INSERT INTO posts (user_id, content) VALUES (?, ?)", [CURRENT_USER_ID, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, user_id: CURRENT_USER_ID, content });
    });
});

// Get comments for a post
app.get('/api/posts/:postId/comments', (req, res) => {
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
app.post('/api/posts/:postId/comments', (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    db.run("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, CURRENT_USER_ID, content], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, post_id: postId, user_id: CURRENT_USER_ID, content });
    });
});

// Toggle Like
app.post('/api/posts/:postId/like', (req, res) => {
    const postId = req.params.postId;
    
    // Check if liked
    db.get("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [CURRENT_USER_ID, postId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            // Unlike
            db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [CURRENT_USER_ID, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: false });
            });
        } else {
            // Like
            db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [CURRENT_USER_ID, postId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ liked: true });
            });
        }
    });
});

// Toggle Follow
app.post('/api/users/:id/follow', (req, res) => {
    const followeeId = req.params.id;
    if (followeeId == CURRENT_USER_ID) return res.status(400).json({ error: 'Cannot follow yourself' });
    
    db.get("SELECT * FROM followers WHERE follower_id = ? AND followee_id = ?", [CURRENT_USER_ID, followeeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            // Unfollow
            db.run("DELETE FROM followers WHERE follower_id = ? AND followee_id = ?", [CURRENT_USER_ID, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: false });
            });
        } else {
            // Follow
            db.run("INSERT INTO followers (follower_id, followee_id) VALUES (?, ?)", [CURRENT_USER_ID, followeeId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ following: true });
            });
        }
    });
});

// Get user's feed (Posts by user and people they follow)
app.get('/api/feed', (req, res) => {
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
    db.all(query, [CURRENT_USER_ID, CURRENT_USER_ID, CURRENT_USER_ID], (err, posts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(posts);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:\${PORT}`);
});
