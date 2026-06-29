const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let isLoginMode = true;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuthStatus();
    document.getElementById('btn-post')?.addEventListener('click', createPost);
});

// --- NAVIGATION LOGIC ---

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show selected tab
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) {
        tabEl.style.display = 'block';
    }

    // Update active state in nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Find all links that trigger this tab and make them active
    document.querySelectorAll(`.nav-item[onclick="switchTab('${tabId}')"]`).forEach(el => {
        el.classList.add('active');
    });

    // Update Header Title
    const title = document.getElementById('tab-title');
    if (title) {
        title.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    }

    // Load tab specific data
    if (tabId === 'home') loadFeed();
    if (tabId === 'profile') renderProfileTab();
    if (tabId === 'explore') loadExplore();
    if (tabId === 'notifications') loadNotifications();
    if (tabId === 'messages') loadMessages();
}

function renderProfileTab() {
    const header = document.getElementById('profile-tab-header');
    if (!currentUser) return;
    
    header.innerHTML = `
        <div style="text-align: center;">
            <img src="${currentUser.avatar}" class="avatar" style="width: 80px; height: 80px;" alt="avatar">
            <h3>${currentUser.username}</h3>
            <p>${currentUser.bio || 'Living my best life ✨'}</p>
        </div>
    `;

    loadProfilePosts();
}

async function loadProfilePosts() {
    const container = document.getElementById('profile-posts-container');
    container.innerHTML = '<div class="skeleton-line"></div>';

    try {
        const res = await fetchWithAuth(`${API_URL}/users/me/posts`);
        const posts = await res.json();
        
        container.innerHTML = '';
        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">You have not posted anything yet.</p>';
            return;
        }

        posts.forEach(post => {
            container.appendChild(createPostElement(post));
        });
    } catch (err) {
        container.innerHTML = '<p style="color:var(--danger);">Error loading posts.</p>';
    }
}

// Search functionality
document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const posts = document.querySelectorAll('#posts-container .post');
    posts.forEach(post => {
        const text = post.querySelector('.post-text').textContent.toLowerCase();
        const username = post.querySelector('.username').textContent.toLowerCase();
        if (text.includes(query) || username.includes(query)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
});

// Explore
async function loadExplore() {
    const container = document.getElementById('tab-explore');
    container.innerHTML = '<div class="skeleton-line"></div>';
    
    try {
        const res = await fetchWithAuth(`${API_URL}/explore`);
        const posts = await res.json();
        
        container.innerHTML = '<h3 style="margin-bottom:16px;">Trending Posts</h3>';
        if (posts.length === 0) {
            container.innerHTML += '<p style="color:var(--text-muted);">No trending posts found.</p>';
            return;
        }
        
        posts.forEach(post => {
            container.appendChild(createPostElement(post));
        });
    } catch (err) {
        container.innerHTML = '<p style="color:var(--danger);">Failed to load explore feed.</p>';
    }
}

// Notifications
async function loadNotifications() {
    const container = document.getElementById('tab-notifications');
    container.innerHTML = '<div class="skeleton-line"></div>';
    
    try {
        const res = await fetchWithAuth(`${API_URL}/notifications`);
        const notifs = await res.json();
        
        container.innerHTML = '<h3 style="margin-bottom:16px;">Notifications</h3>';
        if (notifs.length === 0) {
            container.innerHTML += '<p style="color:var(--text-muted);">No new notifications.</p>';
            return;
        }
        
        notifs.forEach(n => {
            let actionText = '';
            let icon = '';
            if (n.type === 'like') { actionText = 'liked your post'; icon = 'fa-heart'; }
            if (n.type === 'comment') { actionText = 'commented on your post'; icon = 'fa-comment'; }
            if (n.type === 'follow') { actionText = 'started following you'; icon = 'fa-user-plus'; }
            
            const timeString = new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

            container.innerHTML += `
                <div class="comment-item" style="align-items:center;">
                    <img src="${n.avatar}" class="avatar avatar-md" alt="avatar">
                    <div class="comment-bubble" style="flex:1;">
                        <i class="fa-solid ${icon}" style="color:var(--accent-primary); margin-right:8px;"></i>
                        <strong>${n.username}</strong> ${actionText}.
                        <br><small style="color:var(--text-muted)">${timeString}</small>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = '<p style="color:var(--danger);">Failed to load notifications.</p>';
    }
}

// Messages
let availableUsersForMessage = [];
async function loadMessages() {
    const container = document.getElementById('tab-messages');
    container.innerHTML = '<div class="skeleton-line"></div>';
    
    try {
        // Fetch all users to populate the "Send to" dropdown
        const usersRes = await fetchWithAuth(`${API_URL}/users`);
        availableUsersForMessage = await usersRes.json();
        
        const res = await fetchWithAuth(`${API_URL}/messages`);
        const messages = await res.json();
        
        let html = '<h3 style="margin-bottom:16px;">Messages</h3>';
        
        // Message Compose UI
        html += `
            <div style="background:var(--card-bg); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:20px;">
                <h4 style="margin-bottom:8px;">New Message</h4>
                <select id="msg-receiver" style="width:100%; padding:8px; margin-bottom:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <option value="">Select a user...</option>
                    ${availableUsersForMessage.filter(u => u.id !== currentUser.id).map(u => `<option value="${u.id}">${u.username}</option>`).join('')}
                </select>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="msg-content" placeholder="Write a message..." style="flex:1; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <button class="btn-primary" onclick="sendMessage()" style="padding:8px 16px;">Send</button>
                </div>
            </div>
        `;
        
        if (messages.length === 0) {
            html += '<p style="color:var(--text-muted);">Your inbox is empty.</p>';
        } else {
            messages.forEach(m => {
                const isSentByMe = m.sender_id === currentUser.id;
                const displayUser = isSentByMe ? m.receiver_id : m.sender_id;
                // find display user name
                const u = availableUsersForMessage.find(x => x.id === displayUser) || { username: 'Unknown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown' };
                
                const label = isSentByMe ? `You to ${u.username}` : `${u.username} to You`;
                const timeString = new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' });
                
                html += `
                    <div class="comment-item" style="${isSentByMe ? 'flex-direction:row-reverse;' : ''}">
                        <img src="${u.avatar}" class="avatar avatar-md" alt="avatar">
                        <div class="comment-bubble" style="${isSentByMe ? 'background:var(--accent-primary); color:white;' : ''}">
                            <div style="font-size:12px; margin-bottom:4px; opacity:0.8;">${label} • ${timeString}</div>
                            <div>${m.content}</div>
                        </div>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p style="color:var(--danger);">Failed to load messages.</p>';
    }
}

async function sendMessage() {
    const receiverId = document.getElementById('msg-receiver').value;
    const content = document.getElementById('msg-content').value.trim();
    
    if (!receiverId || !content) return alert('Please select a user and write a message');
    
    try {
        await fetchWithAuth(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: receiverId, content })
        });
        loadMessages(); // reload to show new msg
    } catch (err) {
        alert('Failed to send message');
    }
}


// --- AUTHENTICATION LOGIC ---

async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthScreen();
        return;
    }

    try {
        const res = await fetchWithAuth(`${API_URL}/users/me`);
        if (!res.ok) throw new Error('Token invalid');
        
        currentUser = await res.json();
        showAppScreen();
        initApp();
    } catch (err) {
        console.error('Auth failed', err);
        localStorage.removeItem('token');
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-layout').style.display = 'none';
}

function showAppScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-layout').style.display = 'grid'; // Grid layout on desktop
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.querySelector('.auth-brand h2');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.getElementById('auth-switch-link');
    
    if (isLoginMode) {
        title.textContent = 'Welcome back';
        subtitle.textContent = 'Sign in to connect with your world.';
        submitBtn.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchLink.textContent = 'Create one';
    } else {
        title.textContent = 'Join Aura';
        subtitle.textContent = 'Create an account to get started.';
        submitBtn.textContent = 'Sign Up';
        switchText.textContent = "Already have an account?";
        switchLink.textContent = 'Sign In';
    }
    document.getElementById('auth-error').textContent = '';
}

async function handleAuth(event) {
    event.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username || !password) return;
    
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.error || 'Authentication failed';
            return;
        }
        
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        
        document.getElementById('auth-password').value = '';
        errorEl.textContent = '';
        
        showAppScreen();
        initApp();
        
    } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showAuthScreen();
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        logout();
        throw new Error('No token found');
    }
    
    const headers = options.headers || {};
    headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error('Unauthorized');
    }
    return res;
}

// --- MAIN APP LOGIC ---

async function initApp() {
    updateNavbar();
    updateProfileSidebar();
    loadFeed();
    loadSuggestions();
}

function updateNavbar() {
    const userInfo = document.getElementById('current-user-info');
    if (userInfo) {
        userInfo.innerHTML = `
            <img src="${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
            <div class="current-user-info-text">
                <span class="name">${currentUser.username}</span>
                <span class="handle">@${currentUser.username.toLowerCase()}</span>
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
            <img src="${currentUser.avatar}" class="avatar avatar-lg" alt="avatar">
            <h3>${currentUser.username}</h3>
            <p>${currentUser.bio || 'Living my best life ✨'}</p>
            <div class="stats-row">
                <div class="stat-col">
                    <div class="num">${currentUser.followingCount || 0}</div>
                    <div class="lbl">Following</div>
                </div>
                <div class="stat-col">
                    <div class="num">${currentUser.followersCount || 0}</div>
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
        const res = await fetchWithAuth(`${API_URL}/feed`);
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
            <img src="${post.avatar}" class="avatar avatar-md" alt="avatar">
            <div class="post-content-area">
                <div class="post-meta">
                    <span class="name">${post.username}</span>
                    <span class="username">@${post.username.toLowerCase()}</span>
                    <span class="time">· ${timeString}</span>
                </div>
                <div class="post-text">${post.content}</div>
                <div class="post-interaction">
                    <button class="interact-btn comment" onclick="toggleComments(${post.id})">
                        <i class="fa-regular fa-comment"></i> 
                        <span>${post.commentsCount > 0 ? post.commentsCount : ''}</span>
                    </button>
                    <button class="interact-btn like ${post.isLikedByMe ? 'active' : ''}" onclick="toggleLike(${post.id}, this)">
                        <i class="${post.isLikedByMe ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                        <span class="like-count">${post.likesCount > 0 ? post.likesCount : ''}</span>
                    </button>
                    <button class="interact-btn share">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                </div>
                
                <div class="comments-container" id="comments-${post.id}">
                    <div id="comments-list-${post.id}"></div>
                    <div class="add-comment">
                        <img src="${currentUser.avatar}" class="avatar avatar-sm" alt="avatar">
                        <input type="text" id="comment-input-${post.id}" placeholder="Post your reply" onkeypress="handleCommentSubmit(event, ${post.id})">
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
        const res = await fetchWithAuth(`${API_URL}/posts`, {
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
        const res = await fetchWithAuth(`${API_URL}/posts/${postId}/like`, { method: 'POST' });
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
    const section = document.getElementById(`comments-${postId}`);
    if (section.classList.contains('show')) {
        section.classList.remove('show');
        return;
    }
    
    section.classList.add('show');
    loadComments(postId);
}

async function loadComments(postId) {
    const list = document.getElementById(`comments-list-${postId}`);
    list.innerHTML = '<div class="skeleton-line short" style="margin-bottom:16px;"></div>';
    
    try {
        const res = await fetchWithAuth(`${API_URL}/posts/${postId}/comments`);
        const comments = await res.json();
        
        list.innerHTML = '';
        comments.forEach(c => {
            list.innerHTML += `
                <div class="comment-item">
                    <img src="${c.avatar}" class="avatar avatar-sm" alt="avatar">
                    <div class="comment-bubble">
                        <div class="author">${c.username}</div>
                        <div class="text">${c.content}</div>
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
            await fetchWithAuth(`${API_URL}/posts/${postId}/comments`, {
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
        const res = await fetchWithAuth(`${API_URL}/users`);
        const users = await res.json();
        
        container.innerHTML = '';
        const suggestions = users.filter(u => u.id !== currentUser.id).slice(0, 3);
        
        suggestions.forEach(user => {
            container.innerHTML += `
                <div class="suggestion-item">
                    <div class="suggestion-info">
                        <img src="${user.avatar}" class="avatar avatar-md" alt="avatar">
                        <div>
                            <span class="s-name">${user.username}</span>
                            <span class="s-handle">@${user.username.toLowerCase()}</span>
                        </div>
                    </div>
                    <button class="btn-follow" onclick="toggleFollow(${user.id}, this)">Follow</button>
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading suggestions', err);
    }
}

async function toggleFollow(userId, btnEl) {
    try {
        const res = await fetchWithAuth(`${API_URL}/users/${userId}/follow`, { method: 'POST' });
        const data = await res.json();
        
        if (data.following) {
            btnEl.textContent = 'Following';
            btnEl.classList.add('following');
        } else {
            btnEl.textContent = 'Follow';
            btnEl.classList.remove('following');
        }
        
        loadFeed();
        // Since we don't have me endpoint updating followers instantly, we just refresh me
        const meRes = await fetchWithAuth(`${API_URL}/users/me`);
        currentUser = await meRes.json();
        updateProfileSidebar(); 
    } catch (err) {
        console.error('Error following', err);
    }
}
