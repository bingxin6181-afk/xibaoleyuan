/**
 * 戏胞乐园 - 前台展示逻辑
 * 所有展示页面共用此文件
 */

// 渲染成员列表
function renderMembers(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const members = DataManager.get('members');
    if (members.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无成员信息</p>';
        return;
    }

    const html = members.map((m, index) => `
        <div class="member-card" data-id="${m.id}">
            <div class="member-avatar">
                ${m.avatar ? `<img src="${m.avatar}" alt="${m.name}">` : 
                  `<div class="avatar-placeholder">${m.name[0] || '?'}</div>`}
            </div>
            <h3 class="member-name">${m.name}</h3>
            <span class="member-role">${m.role}</span>
            <p class="member-intro">${m.intro || ''}</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 渲染剧目列表
function renderPlays(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const plays = DataManager.get('plays');
    if (plays.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无剧目信息</p>';
        return;
    }

    const html = plays.map(p => `
        <div class="play-card">
            <div class="play-cover">
                ${p.cover ? `<img src="${p.cover}" alt="${p.name}">` : 
                  `<div class="cover-placeholder">${p.name}</div>`}
            </div>
            <div class="play-info">
                <h3>${p.name}</h3>
                <span class="play-date">${p.date}</span>
                <div class="play-content">${p.content || ''}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 渲染照片墙（带点击放大）
function renderGallery(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const photos = DataManager.get('gallery');
    if (photos.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无照片</p>';
        return;
    }

    const html = photos.map((p, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${p.src}" alt="${p.title || ''}" loading="lazy">
            ${p.title ? `<span class="gallery-title">${p.title}</span>` : ''}
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 渲染活动安排
function renderSchedule(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const schedule = DataManager.get('schedule');
    
    const html = `
        <table class="schedule-table">
            <thead>
                <tr>
                    <th>星期</th>
                    <th>时间</th>
                    <th>活动内容</th>
                    <th>地点</th>
                </tr>
            </thead>
            <tbody>
                ${schedule.map(s => `
                    <tr>
                        <td>${s.day}</td>
                        <td>${s.time}</td>
                        <td>${s.activity}</td>
                        <td>${s.location}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// 渲染合作院校
function renderPartners(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const partners = DataManager.get('partners');
    if (partners.length === 0) {
        container.innerHTML = '<p class="empty-tip">暂无合作院校信息</p>';
        return;
    }

    const html = partners.map(p => `
        <div class="partner-item">
            ${p.logo ? `<img src="${p.logo}" alt="${p.name}">` : ''}
            <span>${p.name}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Lightbox（照片墙点击放大）
let currentPhotoIndex = 0;
let galleryPhotos = [];

function openLightbox(index) {
    galleryPhotos = DataManager.get('gallery');
    currentPhotoIndex = index;
    showCurrentPhoto();
    
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showCurrentPhoto() {
    const photo = galleryPhotos[currentPhotoIndex];
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const counter = document.getElementById('lightbox-counter');
    
    if (img) img.src = photo.src;
    if (title) title.textContent = photo.title || '';
    if (desc) desc.textContent = photo.desc || '';
    if (counter) counter.textContent = `${currentPhotoIndex + 1} / ${galleryPhotos.length}`;
}

function prevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    showCurrentPhoto();
}

function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % galleryPhotos.length;
    showCurrentPhoto();
}

// 键盘导航
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || lightbox.style.display === 'none') return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
});
