/**
 * 📊 منطق داشبورد
 */

let supabaseClient = null;
let currentUser = null;
let currentGym = null;
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
    const { data: statsData, error: statsError } = await supabaseClient.rpc('get_dashboard_stats');

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
    const daysLeft = currentGym.days_left || 0;

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
        const endStr = endDate.toLocaleDateString('fa-IR');
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
    const days = currentGym?.days_left || 0;
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
