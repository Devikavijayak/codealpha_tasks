const API_URL = 'http://localhost:3000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initApp();

    document.getElementById('btn-post').addEventListener('click', createPost);
});

async function initApp() {
    try {
        // Fetch current user (Hardcoded to ID 1 in backend)
        const res = await fetch(`\${API_URL}/users/1`);
        currentUser = await res.json();
        
        updateNavbar();
        updateProfileSidebar();
        loadFeed();
        loadSuggestions();
    } catch (err) {
        console.error('Failed to initialize app', err);
    }
}

function updateNavbar() {
    const userInfo = document.getElementById('current-user-info');
    userInfo.innerHTML = `
        <span class="username">\${currentUser.username}</span>
        <img src="\${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
    `;
    document.getElementById('create-post-avatar').src = currentUser.avatar;
    document.getElementById('create-post-avatar').style.display = 'block';
}

function updateProfileSidebar() {
    const sidebar = document.getElementById('sidebar-profile');
    sidebar.innerHTML = `
        <div class="card">
            <div class="profile-header">
                <img src="\${currentUser.avatar}" class="avatar avatar-lg" alt="avatar">
                <h3>\${currentUser.username}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">\${currentUser.bio || 'No bio yet'}</p>
            </div>
            <div class="profile-stats">
                <div class="stat-box">
                    <div class="stat-value">\${currentUser.followersCount || 0}</div>
                    <div class="stat-label">Followers</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">\${currentUser.followingCount || 0}</div>
                    <div class="stat-label">Following</div>
                </div>
            </div>
        </div>
    `;
}

async function loadFeed() {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<div class="skeleton-card" style="height: 200px;"></div>';

    try {
        const res = await fetch(`\${API_URL}/feed`);
        const posts = await res.json();
        
        container.innerHTML = '';
        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-secondary); margin-top:2rem;">No posts to show. Follow some people!</p>';
            return;
        }

        posts.forEach(post => {
            container.appendChild(createPostElement(post));
        });
    } catch (err) {
        console.error('Error loading feed', err);
        container.innerHTML = '<p style="color:red">Failed to load feed.</p>';
    }
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    const timeString = new Date(post.timestamp).toLocaleString();
    
    div.innerHTML = `
        <div class="post-header">
            <div class="post-user-info">
                <img src="\${post.avatar}" class="avatar" alt="avatar">
                <div class="post-user-meta">
                    <span class="name">\${post.username}</span>
                    <span class="time">\${timeString}</span>
                </div>
            </div>
        </div>
        <div class="post-content">\${post.content}</div>
        <div class="post-actions">
            <button class="action-btn \${post.isLikedByMe ? 'liked' : ''}" onclick="toggleLike(\${post.id}, this)">
                <i class="\${post.isLikedByMe ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                <span class="like-count">\${post.likesCount}</span>
            </button>
            <button class="action-btn" onclick="toggleComments(\${post.id})">
                <i class="fa-regular fa-comment"></i> 
                <span>\${post.commentsCount}</span>
            </button>
        </div>
        <div class="comments-section" id="comments-\${post.id}">
            <div class="comments-list" id="comments-list-\${post.id}">
                <!-- Comments injected here -->
            </div>
            <div class="create-comment">
                <img src="\${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
                <input type="text" id="comment-input-\${post.id}" placeholder="Write a comment..." onkeypress="handleCommentSubmit(event, \${post.id})">
            </div>
        </div>
    `;
    return div;
}

async function createPost() {
    const input = document.getElementById('post-content');
    const content = input.value.trim();
    if (!content) return;

    const btn = document.getElementById('btn-post');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`\${API_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        
        if (res.ok) {
            input.value = '';
            loadFeed(); // Reload feed to show new post
        }
    } catch (err) {
        console.error('Failed to post', err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Post';
    }
}

async function toggleLike(postId, btnEl) {
    try {
        const res = await fetch(`\${API_URL}/posts/\${postId}/like`, { method: 'POST' });
        const data = await res.json();
        
        const icon = btnEl.querySelector('i');
        const countSpan = btnEl.querySelector('.like-count');
        let count = parseInt(countSpan.textContent);

        if (data.liked) {
            btnEl.classList.add('liked');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            count++;
        } else {
            btnEl.classList.remove('liked');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            count--;
        }
        countSpan.textContent = count;
    } catch (err) {
        console.error('Error toggling like', err);
    }
}

async function toggleComments(postId) {
    const section = document.getElementById(`comments-\${postId}`);
    if (section.classList.contains('active')) {
        section.classList.remove('active');
        return;
    }
    
    section.classList.add('active');
    loadComments(postId);
}

async function loadComments(postId) {
    const list = document.getElementById(`comments-list-\${postId}`);
    list.innerHTML = '<p style="font-size:0.8rem; color:var(--text-secondary);">Loading comments...</p>';
    
    try {
        const res = await fetch(`\${API_URL}/posts/\${postId}/comments`);
        const comments = await res.json();
        
        list.innerHTML = '';
        comments.forEach(c => {
            list.innerHTML += `
                <div class="comment">
                    <img src="\${c.avatar}" class="avatar avatar-sm" alt="avatar">
                    <div class="comment-content">
                        <div class="comment-author">\${c.username}</div>
                        <div class="comment-text">\${c.content}</div>
                    </div>
                </div>
            `;
        });
        if (comments.length === 0) {
            list.innerHTML = '<p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem;">No comments yet.</p>';
        }
    } catch (err) {
        list.innerHTML = '<p style="color:red; font-size:0.8rem;">Error loading comments.</p>';
    }
}

async function handleCommentSubmit(event, postId) {
    if (event.key === 'Enter') {
        const input = event.target;
        const content = input.value.trim();
        if (!content) return;

        input.disabled = true;
        try {
            await fetch(`\${API_URL}/posts/\${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            input.value = '';
            loadComments(postId); // reload
            // Also ideally increment comment count in UI, but skipped for brevity
        } catch (err) {
            console.error('Error posting comment', err);
        } finally {
            input.disabled = false;
            input.focus();
        }
    }
}

async function loadSuggestions() {
    const container = document.getElementById('suggestions-container');
    try {
        const res = await fetch(`\${API_URL}/users`);
        const users = await res.json();
        
        container.innerHTML = '';
        // Filter out current user and take first few
        const suggestions = users.filter(u => u.id !== currentUser.id).slice(0, 3);
        
        suggestions.forEach(user => {
            // Need to check if following, for simplicity we assume not following in suggestions
            container.innerHTML += `
                <div class="suggestion-item">
                    <div class="suggestion-info">
                        <img src="\${user.avatar}" class="avatar avatar-sm" alt="avatar">
                        <span class="suggestion-name">\${user.username}</span>
                    </div>
                    <button class="btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="toggleFollow(\${user.id}, this)">Follow</button>
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading suggestions', err);
    }
}

async function toggleFollow(userId, btnEl) {
    try {
        const res = await fetch(`\${API_URL}/users/\${userId}/follow`, { method: 'POST' });
        const data = await res.json();
        
        if (data.following) {
            btnEl.textContent = 'Unfollow';
            btnEl.classList.remove('btn-secondary');
            btnEl.style.border = '1px solid var(--text-secondary)';
        } else {
            btnEl.textContent = 'Follow';
            btnEl.classList.add('btn-secondary');
            btnEl.style.border = '';
        }
        
        // Reload feed to include new person's posts
        loadFeed();
        // Reload profile stats
        initApp(); // simple way to refresh stats
    } catch (err) {
        console.error('Error following', err);
    }
}
