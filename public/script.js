const API_URL = 'http://localhost:3000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    document.getElementById('btn-post').addEventListener('click', createPost);
});

async function initApp() {
    try {
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
    if (userInfo) {
        userInfo.innerHTML = `
            <img src="\${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
            <div class="current-user-info-text">
                <span class="name">\${currentUser.username}</span>
                <span class="handle">@\${currentUser.username.toLowerCase()}</span>
            </div>
            <i class="fa-solid fa-ellipsis" style="margin-left: auto; color: var(--text-muted)"></i>
        `;
    }
    const createAvatar = document.getElementById('create-post-avatar');
    if (createAvatar) {
        createAvatar.src = currentUser.avatar;
        createAvatar.style.display = 'block';
    }
}

function updateProfileSidebar() {
    const sidebar = document.getElementById('sidebar-profile');
    if (sidebar) {
        sidebar.innerHTML = `
            <img src="\${currentUser.avatar}" class="avatar avatar-lg" alt="avatar">
            <h3>\${currentUser.username}</h3>
            <p>\${currentUser.bio || 'Living my best life ✨'}</p>
            <div class="stats-row">
                <div class="stat-col">
                    <div class="num">\${currentUser.followingCount || 0}</div>
                    <div class="lbl">Following</div>
                </div>
                <div class="stat-col">
                    <div class="num">\${currentUser.followersCount || 0}</div>
                    <div class="lbl">Followers</div>
                </div>
            </div>
        `;
    }
}

async function loadFeed() {
    const container = document.getElementById('posts-container');
    container.innerHTML = `
        <div class="post-skeleton" style="padding: 24px;">
            <div style="display:flex; gap:16px;">
                <div class="skeleton-avatar"></div>
                <div style="flex:1">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-box"></div>
                </div>
            </div>
        </div>
    `;

    try {
        const res = await fetch(`\${API_URL}/feed`);
        const posts = await res.json();
        
        container.innerHTML = '';
        if (posts.length === 0) {
            container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted);">No posts to show. Start following people!</div>';
            return;
        }

        posts.forEach(post => {
            container.appendChild(createPostElement(post));
        });
    } catch (err) {
        console.error('Error loading feed', err);
        container.innerHTML = '<div style="padding:20px; color:var(--danger);">Failed to load feed.</div>';
    }
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    const timeString = new Date(post.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    div.innerHTML = `
        <div class="post-layout">
            <img src="\${post.avatar}" class="avatar avatar-md" alt="avatar">
            <div class="post-content-area">
                <div class="post-meta">
                    <span class="name">\${post.username}</span>
                    <span class="username">@\${post.username.toLowerCase()}</span>
                    <span class="time">· \${timeString}</span>
                </div>
                <div class="post-text">\${post.content}</div>
                <div class="post-interaction">
                    <button class="interact-btn comment" onclick="toggleComments(\${post.id})">
                        <i class="fa-regular fa-comment"></i> 
                        <span>\${post.commentsCount > 0 ? post.commentsCount : ''}</span>
                    </button>
                    <button class="interact-btn like \${post.isLikedByMe ? 'active' : ''}" onclick="toggleLike(\${post.id}, this)">
                        <i class="\${post.isLikedByMe ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                        <span class="like-count">\${post.likesCount > 0 ? post.likesCount : ''}</span>
                    </button>
                    <button class="interact-btn share">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                </div>
                
                <div class="comments-container" id="comments-\${post.id}">
                    <div id="comments-list-\${post.id}"></div>
                    <div class="add-comment">
                        <img src="\${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
                        <input type="text" id="comment-input-\${post.id}" placeholder="Post your reply" onkeypress="handleCommentSubmit(event, \${post.id})">
                    </div>
                </div>
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
            loadFeed();
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
        let count = parseInt(countSpan.textContent) || 0;

        if (data.liked) {
            btnEl.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            count++;
        } else {
            btnEl.classList.remove('active');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            count--;
        }
        countSpan.textContent = count > 0 ? count : '';
    } catch (err) {
        console.error('Error toggling like', err);
    }
}

async function toggleComments(postId) {
    const section = document.getElementById(`comments-\${postId}`);
    if (section.classList.contains('show')) {
        section.classList.remove('show');
        return;
    }
    
    section.classList.add('show');
    loadComments(postId);
}

async function loadComments(postId) {
    const list = document.getElementById(`comments-list-\${postId}`);
    list.innerHTML = '<div class="skeleton-line short" style="margin-bottom:16px;"></div>';
    
    try {
        const res = await fetch(`\${API_URL}/posts/\${postId}/comments`);
        const comments = await res.json();
        
        list.innerHTML = '';
        comments.forEach(c => {
            list.innerHTML += `
                <div class="comment-item">
                    <img src="\${c.avatar}" class="avatar avatar-sm" alt="avatar">
                    <div class="comment-bubble">
                        <div class="author">\${c.username}</div>
                        <div class="text">\${c.content}</div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        list.innerHTML = '<p style="color:var(--danger); font-size:12px;">Error loading comments.</p>';
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
            loadComments(postId);
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
    if (!container) return;
    
    try {
        const res = await fetch(`\${API_URL}/users`);
        const users = await res.json();
        
        container.innerHTML = '';
        const suggestions = users.filter(u => u.id !== currentUser.id).slice(0, 3);
        
        suggestions.forEach(user => {
            container.innerHTML += `
                <div class="suggestion-item">
                    <div class="suggestion-info">
                        <img src="\${user.avatar}" class="avatar avatar-md" alt="avatar">
                        <div>
                            <span class="s-name">\${user.username}</span>
                            <span class="s-handle">@\${user.username.toLowerCase()}</span>
                        </div>
                    </div>
                    <button class="btn-follow" onclick="toggleFollow(\${user.id}, this)">Follow</button>
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
            btnEl.textContent = 'Following';
            btnEl.classList.add('following');
        } else {
            btnEl.textContent = 'Follow';
            btnEl.classList.remove('following');
        }
        
        loadFeed();
        initApp(); 
    } catch (err) {
        console.error('Error following', err);
    }
}
