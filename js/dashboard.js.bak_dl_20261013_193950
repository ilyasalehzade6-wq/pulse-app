// 📌 version 20261011223512
/**
 * 📊 منطق داشبورد
 */



let supabaseClient = null;
let currentUser = null;
let currentGym = null;

// ═══════════════════════════════════════════════════════
//  🔤 تبدیل میلادی به شمسی (برای ارسال به RPC)
// ═══════════════════════════════════════════════════════
function toShamsiDate(date) {
    if (!date) date = new Date();
    const gy = date.getFullYear(), gm = date.getMonth() + 1, gd = date.getDate();
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    let gy2 = gy - ((gy <= 1600) ? 621 : 1600);
    const gy2b = (gm > 2) ? (gy2 + 1) : gy2;
    let days = (365 * gy2) + Math.floor((gy2b + 3) / 4) - Math.floor((gy2b + 99) / 100) + Math.floor((gy2b + 399) / 400) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    let jm, jd;
    if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + (days % 31); }
    else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + ((days - 186) % 30); }
    return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
}

let stats = null;

const PORTAL_URL = "https://ilyasalehzade6-wq.github.io/python-manager/";
const DESKTOP_DOWNLOAD_URL = "#"; // بعداً می‌ذاریم

// ============================================================
// راه‌اندازی
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // شروع Supabase
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // تم
    initTheme();

    try {
        // چک لاگین
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            // لاگین نیست → برو به login
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;

        // بارگذاری اطلاعات
        await loadDashboard();

        // نمایش محتوا
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';

    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('خطا در بارگذاری داشبورد', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
});

// ============================================================
// بارگذاری داده‌ها
// ============================================================
async function loadDashboard() {
    // ۱. اطلاعات باشگاه
    const { data: gymData, error: gymError } = await supabaseClient.rpc('get_my_gym');

    if (gymError) {
        console.error('Gym error:', gymError);
        throw gymError;
    }

    if (!gymData || !gymData.id) {
        // کاربر لاگین هست ولی باشگاه نداره
        showToast('شما باشگاهی ثبت نکرده‌اید', 'error');
        setTimeout(() => window.location.href = 'signup.html', 2000);
        return;
    }

    currentGym = gymData;
    renderGymInfo();

    // ۲. آمار
    // 🔤 محاسبه ماه شمسی
    const _now = new Date();
    const _gy = _now.getFullYear();
    const _gm = _now.getMonth() + 1;
    const _gd = _now.getDate();
    const _g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let _jy = (_gy <= 1600) ? 0 : 979;
    let _gy2 = (_gy <= 1600) ? _gy - 621 : _gy - 1600;
    const _gy2b = (_gm > 2) ? (_gy2 + 1) : _gy2;
    let _days = (365 * _gy2) + Math.floor((_gy2b + 3) / 4) - Math.floor((_gy2b + 99) / 100) + Math.floor((_gy2b + 399) / 400) - 80 + _gd + _g_d_m[_gm - 1];
    _jy += 33 * Math.floor(_days / 12053);
    _days %= 12053;
    _jy += 4 * Math.floor(_days / 1461);
    _days %= 1461;
    if (_days > 365) { _jy += Math.floor((_days - 1) / 365); _days = (_days - 1) % 365; }
    let _jm;
    if (_days < 186) { _jm = 1 + Math.floor(_days / 31); }
    else { _jm = 7 + Math.floor((_days - 186) / 30); }
    const _shamsiMonth = _jy + '-' + String(_jm).padStart(2, '0');
    console.log('🔤 ماه شمسی:', _shamsiMonth);

    const { data: statsData, error: statsError } = await supabaseClient.rpc('get_dashboard_stats', {
        p_month: _shamsiMonth
    });

    console.log('📊 stats response:', statsData);
    if (!statsError && statsData) {
        stats = statsData;
        renderStats();
    }
}

// ============================================================
// نمایش اطلاعات باشگاه
// ============================================================
function renderGymInfo() {
    const ownerName = currentGym.owner_name || 'کاربر';
    const clubName = currentGym.name || 'مجموعه';
    const daysLeft = getRemainingDays(currentGym.subscription_end);

    // نام کاربر
    document.getElementById('userName').textContent = ownerName;
    document.getElementById('userAvatar').textContent = ownerName[0] || '?';

    // Greeting
    const hour = new Date().getHours();
    let greeting = 'سلام';
    if (hour < 12) greeting = '☀️ صبح بخیر';
    else if (hour < 17) greeting = '🌤️ ظهر بخیر';
    else greeting = '🌙 عصر بخیر';

    document.getElementById('greeting').textContent = `${greeting}، ${ownerName}`;

    // اطلاعات مجموعه
    const clubType = currentGym.club_type || 'مجموعه';
    document.getElementById('clubInfo').textContent = `${clubName} • ${clubType}`;

    // Badge اشتراک
    const badgeContainer = document.getElementById('subscriptionBadge');
    const plan = currentGym.subscription_plan || 'trial';

    if (plan === 'trial' && daysLeft > 0) {
        badgeContainer.innerHTML = `<div class="subscription-badge trial">🎁 دوره‌ی رایگان — ${daysLeft} روز باقی‌مونده</div>`;
    } else if (daysLeft > 0) {
        badgeContainer.innerHTML = `<div class="subscription-badge active">✅ لایسنس فعال — ${daysLeft} روز باقی‌مونده</div>`;
    } else {
        badgeContainer.innerHTML = `<div class="subscription-badge expired">⏰ اشتراک منقضی شده</div>`;
    }

    // Progress
    const totalDays = plan === 'trial' ? 30 : 365;
    const usedDays = totalDays - daysLeft;
    const percent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));

    document.getElementById('daysLeftPercent').textContent = `${daysLeft} روز`;
    document.getElementById('progressFill').style.width = `${percent}%`;

    if (currentGym.subscription_end) {
        const endDate = new Date(currentGym.subscription_end);
        const endStr = endDate.toLocaleDateString("fa-IR");
        document.getElementById('subscriptionEndText').textContent = `پایان: ${endStr}`;
    }
    
    document.getElementById('daysLeftText').textContent = `از ${totalDays} روز`;
}

// ============================================================
// نمایش آمار
// ============================================================
function renderStats() {
    document.getElementById('totalMembers').textContent = formatNumber(stats.total_members || 0);
    document.getElementById('newMembers').textContent = formatNumber(stats.new_members_month || 0);
    document.getElementById('monthIncome').textContent = formatNumber(stats.total_income_month || 0);
    document.getElementById('unpaidInstallments').textContent = formatNumber(stats.unpaid_installments || 0);
}

// ============================================================
// Helper: قالب‌بندی عدد
// ============================================================
function formatNumber(num) {
    return Number(num).toLocaleString('fa-IR');
}

// ============================================================
// Theme
// ============================================================
function initTheme() {
    const saved = localStorage.getItem('pulse_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pulse_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============================================================
// Sidebar
// ============================================================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// Actions
// ============================================================
function downloadDesktop() {
    showToast('📥 به‌زودی لینک دانلود اضافه می‌شود', 'info');
    // بعداً: window.open(DESKTOP_DOWNLOAD_URL, '_blank');
}

function showLicense() {
    const plan = currentGym?.subscription_plan || 'trial';
    const days = getRemainingDays(currentGym?.subscription_end);
    showToast(`🎫 پلن فعلی: ${plan} — ${days} روز باقی‌مونده`, 'info');
}

function copyPortalLink() {
    const url = PORTAL_URL;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('✅ لینک پورتال کپی شد', 'success');
        }).catch(() => {
            showToast('خطا در کپی کردن', 'error');
        });
    }
}

function openPortal() {
    window.open(PORTAL_URL, '_blank');
}

function contactSupport() {
    const msg = `سلام 👋\nمن ${currentGym?.owner_name || 'کاربر'} از ${currentGym?.name || 'مجموعه'} هستم.\n\nدرخواست پشتیبانی دارم.`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).catch(() => {});
    }
    
    window.open(RUBIKA_URL, '_blank');
}

function comingSoon(section) {
    showToast(`🚧 بخش «${section}» به‌زودی اضافه می‌شود`, 'info');
}

// ============================================================
// Logout
// ============================================================
async function logout() {
    if (!confirm('آیا از خروج مطمئن هستید؟')) return;

    try {
        await supabaseClient.auth.signOut();
        showToast('✅ خارج شدید', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// ============================================================
// Toast (کپی شده از config برای اطمینان)
// ============================================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.className = 'toast';
    if (type === 'error') toast.classList.add('error');
    if (type === 'success') toast.classList.add('success');
    if (type === 'info') toast.classList.add('info');

    const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}


// ═══════════════════════════════════════════════════════
// 🔄 تغییر صفحه
// ═══════════════════════════════════════════════════════
function switchPage(pageName) {
    // ─── پنهان کردن همه ───
    document.getElementById('dashboardContent').style.display = 'none';
    const membersContent = document.getElementById('membersContent');
    if (membersContent) membersContent.style.display = 'none';
    const attendanceContent = document.getElementById('attendanceContent');
    if (attendanceContent) attendanceContent.style.display = 'none';
    const financeContent = document.getElementById('financeContent');
    if (financeContent) financeContent.style.display = 'none';
    const reportsContent = document.getElementById('reportsContent');
    if (reportsContent) reportsContent.style.display = 'none';
    const settingsContent = document.getElementById('settingsContent');
    if (settingsContent) settingsContent.style.display = 'none';
    const announcementsContent = document.getElementById('announcementsContent');
    if (announcementsContent) announcementsContent.style.display = 'none';
    const chatContent = document.getElementById('chatContent');
    if (chatContent) {
        chatContent.style.display = 'none';
        chatContent.classList.remove('active');
    }

    // ─── نav buttons ───
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });

    // ─── نمایش صفحه ───
    if (pageName === 'dashboard') {
        document.getElementById('dashboardContent').style.display = 'block';
    } else if (pageName === 'members') {
        if (membersContent) membersContent.style.display = 'block';
        loadMembers();
    } else if (pageName === 'attendance') {
        if (attendanceContent) attendanceContent.style.display = 'block';
        initAttendance();
    } else if (pageName === 'finance') {
        if (financeContent) financeContent.style.display = 'block';
        initFinance();
    } else if (pageName === 'reports') {
        if (reportsContent) reportsContent.style.display = 'block';
        initReports();
    } else if (pageName === 'settings') {
        if (settingsContent) settingsContent.style.display = 'block';
        initSettings();
    } else if (pageName === 'chat') {
        const cc = document.getElementById('chatContent');
        if (cc) { cc.style.display = 'flex'; cc.classList.add('active'); }
        loadChatRooms();
    } else {
        // صفحات دیگه
        comingSoon(pageName);
        // برگردون به داشبورد
        document.getElementById('dashboardContent').style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === 'dashboard') btn.classList.add('active');
        });
    }

    // ─── بستن sidebar در موبایل ───
    if (window.innerWidth < 768) {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('open');
    }
}


// ═══════════════════════════════════════════════════════
//  📢 پیام‌های گروهی
// ═══════════════════════════════════════════════════════
let announcementsCache = [];

const PRIORITY_META = {
    normal:    { label: 'عادی',  icon: '⚪', css: 'normal' },
    important: { label: 'مهم',   icon: '🟡', css: 'important' },
    urgent:    { label: 'فوری',  icon: '🔴', css: 'urgent' },
};


async function loadAnnouncements() {
    const list = document.getElementById('announcementsList');
    if (!list) return;

    try {
        list.innerHTML = '<div class="loading">در حال بارگذاری...</div>';

        const { data, error } = await supabaseClient.rpc('owner_list_announcements');

        if (error) {
            console.error('ann list error:', error);
            list.innerHTML = '<div class="error">خطا در بارگذاری پیام‌ها</div>';
            return;
        }

        if (!data?.success) {
            list.innerHTML = '<div class="error">' + (data?.error || 'خطا') + '</div>';
            return;
        }

        announcementsCache = data.announcements || [];
        renderAnnouncements();
    } catch (err) {
        console.error('loadAnnouncements:', err);
        list.innerHTML = '<div class="error">خطای غیرمنتظره</div>';
    }
}


function renderAnnouncements() {
    const list = document.getElementById('announcementsList');
    if (!list) return;

    if (announcementsCache.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📢</div>
                <div class="empty-text">هیچ پیامی وجود ندارد</div>
                <button class="btn-primary" style="margin-top:15px;" onclick="openAnnouncementForm()">
                    ➕ اولین پیام را بسازید
                </button>
            </div>
        `;
        return;
    }

    list.innerHTML = announcementsCache.map(a => {
        const meta = PRIORITY_META[a.priority] || PRIORITY_META.normal;
        const pinned = !!a.is_pinned;
        const contentPreview = (a.content || '').length > 250
            ? a.content.substring(0, 250) + '...'
            : a.content;

        return `
            <div class="announcement-card ${pinned ? 'pinned' : ''} ${meta.css}">
                <div class="ann-header">
                    <h3 class="ann-title ${pinned ? 'pinned-title' : ''}">
                        ${pinned ? '📌 ' : ''}${escapeHtml(a.title)}
                    </h3>
                    <span class="ann-badge ${meta.css}">${meta.icon} ${meta.label}</span>
                </div>

                <div class="ann-content">${escapeHtml(contentPreview)}</div>

                <div class="ann-meta">
                    <span>🕐 ${a.created_date || '—'}</span>
                    <span>💬 ${a.comments_count || 0} نظر</span>
                </div>

                <div class="ann-actions">
                    <button onclick="showComments('${a.id}', '${escapeHtml(a.title)}')">
                        💬 مشاهده نظرها
                    </button>
                    <button class="primary" onclick="toggleAnnPin('${a.id}')">
                        ${pinned ? '📍 برداشتن سنجاق' : '📌 سنجاق'}
                    </button>
                    <button onclick="editAnnouncement('${a.id}')">
                        ✏️ ویرایش
                    </button>
                    <button class="danger" onclick="deleteAnnouncement('${a.id}')">
                        🗑️ حذف
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}


// ─── Modal: فرم پیام ───
function openAnnouncementForm(editData = null) {
    const modal = document.getElementById('announcementModal');
    if (!modal) return;

    document.getElementById('annModalTitle').textContent = editData ? '✏️ ویرایش پیام' : '📢 پیام جدید';
    document.getElementById('annSubmitBtn').textContent = editData ? '💾 ذخیره' : '📤 ارسال';

    document.getElementById('annTitle').value = editData?.title || '';
    document.getElementById('annContent').value = editData?.content || '';
    document.getElementById('annPriority').value = editData?.priority || 'normal';
    document.getElementById('annPinned').checked = !!editData?.is_pinned;
    document.getElementById('annEditId').value = editData?.id || '';

    modal.style.display = 'flex';
}


function closeAnnouncementForm() {
    const modal = document.getElementById('announcementModal');
    if (modal) modal.style.display = 'none';
}


async function submitAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const priority = document.getElementById('annPriority').value;
    const isPinned = document.getElementById('annPinned').checked;
    const editId = document.getElementById('annEditId').value;

    if (!title || !content) {
        showToast('عنوان و متن پیام الزامی است', 'error');
        return;
    }

    const btn = document.getElementById('annSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'در حال ارسال...';

    try {
        let result;
        if (editId) {
            result = await supabaseClient.rpc('owner_update_announcement', {
                p_id: editId,
                p_title: title,
                p_content: content,
                p_priority: priority,
                p_is_pinned: isPinned,
            });
        } else {
            result = await supabaseClient.rpc('owner_create_announcement', {
                p_title: title,
                p_content: content,
                p_priority: priority,
                p_is_pinned: isPinned,
            });
        }

        if (result.error || !result.data?.success) {
            showToast('خطا: ' + (result.error?.message || result.data?.error || 'نامشخص'), 'error');
            return;
        }

        showToast(editId ? '✅ پیام ویرایش شد' : '✅ پیام ارسال شد', 'success');
        closeAnnouncementForm();
        await loadAnnouncements();
    } catch (err) {
        console.error('submitAnn:', err);
        showToast('خطای غیرمنتظره', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = editId ? '💾 ذخیره' : '📤 ارسال';
    }
}


async function editAnnouncement(id) {
    const a = announcementsCache.find(x => x.id === id);
    if (!a) return;
    openAnnouncementForm(a);
}


async function toggleAnnPin(id) {
    try {
        const { data, error } = await supabaseClient.rpc('owner_toggle_pin', { p_id: id });
        if (error) {
            showToast('خطا: ' + error.message, 'error');
            return;
        }
        showToast(data?.is_pinned ? '📌 سنجاق شد' : '📍 برداشته شد', 'success');
        await loadAnnouncements();
    } catch (err) {
        console.error('togglePin:', err);
    }
}


async function deleteAnnouncement(id) {
    if (!confirm('آیا از حذف این پیام مطمئن هستید؟')) return;

    try {
        const { data, error } = await supabaseClient.rpc('owner_delete_announcement', { p_id: id });
        if (error) {
            showToast('خطا: ' + error.message, 'error');
            return;
        }
        showToast('🗑️ پیام حذف شد', 'success');
        await loadAnnouncements();
    } catch (err) {
        console.error('deleteAnn:', err);
    }
}


// ─── Modal: نظرها ───
async function showComments(annId, title) {
    const modal = document.getElementById('commentsModal');
    const list = document.getElementById('commentsList');
    if (!modal || !list) return;

    document.getElementById('commentsModalTitle').textContent = `💬 نظرها — ${title}`;
    list.innerHTML = '<div class="loading">در حال بارگذاری...</div>';
    modal.style.display = 'flex';

    try {
        const { data, error } = await supabaseClient.rpc('owner_get_comments', { p_id: annId });

        if (error || !data?.success) {
            list.innerHTML = '<div class="error">خطا در بارگذاری نظرها</div>';
            return;
        }

        const comments = data.comments || [];

        if (comments.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <div class="empty-text">هنوز نظری ثبت نشده</div>
                </div>
            `;
            return;
        }

        list.innerHTML = comments.map(c => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-name">👤 ${escapeHtml(c.member_name)}</span>
                    <div>
                        <span class="comment-date">${c.created_date || ''}</span>
                        <button class="comment-delete" onclick="deleteComment('${c.id}', '${annId}', '${escapeHtml(title)}')">🗑️</button>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(c.content)}</div>
            </div>
        `).join('');

    } catch (err) {
        console.error('showComments:', err);
        list.innerHTML = '<div class="error">خطای غیرمنتظره</div>';
    }
}


function closeCommentsModal() {
    const modal = document.getElementById('commentsModal');
    if (modal) modal.style.display = 'none';
}


async function deleteComment(commentId, annId, title) {
    if (!confirm('حذف این نظر؟')) return;

    try {
        const { data, error } = await supabaseClient.rpc('owner_delete_comment', { p_comment_id: commentId });
        if (error) {
            showToast('خطا: ' + error.message, 'error');
            return;
        }
        showToast('🗑️ نظر حذف شد', 'success');
        showComments(annId, title);
    } catch (err) {
        console.error('deleteComment:', err);
    }
}


// ═══════════════════════════════════════════════════════
//  💬 پیام‌رسان (pulse-app)
// ═══════════════════════════════════════════════════════
let chatRoomsCache = [];
let currentChatRoom = null;
let chatRefreshTimer = null;
let lastMessageId = null;


async function loadChatRooms() {
    const list = document.getElementById('chatRoomsList');
    if (!list) return;

    try {
        list.innerHTML = '<div class="loading">در حال بارگذاری...</div>';

        const { data, error } = await supabaseClient.rpc('owner_list_chat_rooms');

        if (error || !data?.success) {
            console.error('chat rooms error:', error || data);
            list.innerHTML = '<div class="error">خطا در بارگذاری اتاق‌ها</div>';
            return;
        }

        chatRoomsCache = data.rooms || [];
        renderChatRooms();
    } catch (err) {
        console.error('loadChatRooms:', err);
        list.innerHTML = '<div class="error">خطای غیرمنتظره</div>';
    }
}


function renderChatRooms() {
    const list = document.getElementById('chatRoomsList');
    if (!list) return;

    if (chatRoomsCache.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <div class="empty-text">هیچ گفت‌وگویی وجود ندارد</div>
            </div>
        `;
        return;
    }

    // مرتب‌سازی: عمومی اول، بعد اون‌هایی که پیام جدید دارن
    const sorted = [...chatRoomsCache].sort((a, b) => {
        if (a.room_type === 'public' && b.room_type !== 'public') return -1;
        if (a.room_type !== 'public' && b.room_type === 'public') return 1;
        return (b.unread || 0) - (a.unread || 0);
    });

    list.innerHTML = sorted.map(r => {
        const isPublic = r.room_type === 'public';
        const icon = isPublic ? '🌐' : '👤';
        const name = isPublic ? 'عمومی (همه)' : (r.room_name || 'بدون نام');
        const lastMsg = (r.last_message || '').substring(0, 60) || '—';
        const hasUnread = (r.unread || 0) > 0;

        return `
            <div class="chat-room-item ${isPublic ? 'public' : ''} ${hasUnread ? 'unread' : ''}"
                 onclick="openChatRoom('${r.room_id}', '${escapeHtml(name)}', '${r.room_type}')">
                <div class="chat-room-icon">${icon}</div>
                <div class="chat-room-info">
                    <div class="chat-room-name">${escapeHtml(name)}</div>
                    <div class="chat-room-last">${escapeHtml(lastMsg)}</div>
                </div>
                ${hasUnread ? `<div class="chat-room-badge">${r.unread}</div>` : ''}
            </div>
        `;
    }).join('');
}


async function openChatRoom(roomId, roomName, roomType) {
    currentChatRoom = { id: roomId, name: roomName, type: roomType };
    lastMessageId = null;

    document.getElementById('chatRoomList').style.display = 'none';
    document.getElementById('chatConversation').style.display = 'flex';
    document.getElementById('chatConvTitle').textContent = roomName;

    // علامت خوانده‌شده
    try {
        await supabaseClient.rpc('owner_mark_chat_read', { p_room_id: roomId });
    } catch (e) { console.warn(e); }

    await loadChatMessages();
    startChatRefresh();
}


function backToRoomList() {
    stopChatRefresh();
    currentChatRoom = null;
    lastMessageId = null;

    document.getElementById('chatRoomList').style.display = 'block';
    document.getElementById('chatConversation').style.display = 'none';

    // بارگذاری مجدد لیست
    loadChatRooms();
}


async function loadChatMessages() {
    if (!currentChatRoom) return;

    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    try {
        const { data, error } = await supabaseClient.rpc('owner_get_chat_messages', {
            p_room_id: currentChatRoom.id,
            p_limit: 100,
        });

        if (error || !data?.success) {
            console.error('messages error:', error || data);
            list.innerHTML = '<div class="error">خطا در بارگذاری پیام‌ها</div>';
            return;
        }

        const messages = (data.messages || []).reverse(); // از قدیم به جدید
        renderChatMessages(messages);

        if (messages.length > 0) {
            lastMessageId = messages[messages.length - 1].id;
        }
    } catch (err) {
        console.error('loadChatMessages:', err);
    }
}


function renderChatMessages(messages) {
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    if (!messages || messages.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding:40px 10px;">
                <div class="empty-icon">💬</div>
                <div class="empty-text">هنوز پیامی نیست</div>
            </div>
        `;
        return;
    }

    list.innerHTML = messages.map(m => {
        const isAdmin = m.sender_type === 'admin';
        const sender = isAdmin ? '👤 مدیر' : ('👤 ' + (m.sender_name || 'عضو'));
        return `
            <div class="chat-msg ${isAdmin ? 'admin' : 'member'}">
                <span class="msg-sender">${escapeHtml(sender)}</span>
                ${escapeHtml(m.content)}
                <span class="msg-meta">${m.time || ''}</span>
            </div>
        `;
    }).join('');

    // اسکرول به پایین
    setTimeout(() => { list.scrollTop = list.scrollHeight; }, 50);
}


async function sendChatMessage() {
    if (!currentChatRoom) return;

    const input = document.getElementById('chatMessageInput');
    const btn = document.getElementById('chatSendBtn');

    const content = input.value.trim();
    if (!content) return;

    btn.disabled = true;

    try {
        const { data, error } = await supabaseClient.rpc('owner_send_chat_message', {
            p_room_id: currentChatRoom.id,
            p_content: content,
        });

        if (error || !data?.success) {
            showToast('خطا: ' + (error?.message || data?.error || 'نامشخص'), 'error');
            return;
        }

        input.value = '';
        // اضافه‌ی پیام به لیست بدون refresh کامل
        const list = document.getElementById('chatMessagesList');
        const empty = list.querySelector('.empty-state');
        if (empty) empty.remove();

        const html = `
            <div class="chat-msg admin">
                <span class="msg-sender">👤 مدیر</span>
                ${escapeHtml(content)}
                <span class="msg-meta">${new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', html);
        setTimeout(() => { list.scrollTop = list.scrollHeight; }, 30);

    } catch (err) {
        console.error('sendChatMessage:', err);
        showToast('خطای غیرمنتظره', 'error');
    } finally {
        btn.disabled = false;
    }
}


function startChatRefresh() {
    stopChatRefresh();
    chatRefreshTimer = setInterval(async () => {
        if (!currentChatRoom) return;
        await loadChatMessages();
    }, 2000);  // ⚡ هر ۲ ثانیه
}


function stopChatRefresh() {
    if (chatRefreshTimer) {
        clearInterval(chatRefreshTimer);
        chatRefreshTimer = null;
    }
}


// Enter برای ارسال
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('chatMessageInput');
    if (inp) {
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});


