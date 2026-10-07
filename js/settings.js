/**
 * ⚙️ تنظیمات
 */

let settingsData = null;

// ═══════════════════════════════════════════════════════
// راه‌اندازی
// ═══════════════════════════════════════════════════════
async function initSettings() {
    await loadSettings();
    updateThemeButtons();
}

// ═══════════════════════════════════════════════════════
// بارگذاری اطلاعات
// ═══════════════════════════════════════════════════════
async function loadSettings() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            showToast('❌ کاربر لاگین نکرده', 'error');
            return;
        }

        // ─── gym info ───
        const { data: gym, error: gErr } = await supabaseClient
            .from('gyms')
            .select('id, name, username, phone, customer_code, owner_name, subscription_plan, subscription_end, is_blocked')
            .eq('owner_auth_id', user.id)
            .limit(1)
            .single();

        if (gErr) throw gErr;

        settingsData = {
            gym: gym,
            user: user
        };

        renderSettings();

    } catch (e) {
        console.error('خطا در بارگذاری تنظیمات:', e);
        showToast('❌ خطا: ' + e.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════
// رندر
// ═══════════════════════════════════════════════════════
function renderSettings() {
    const { gym, user } = settingsData;

    const el = (id) => document.getElementById(id);
    if (el('setFullName')) el('setFullName').textContent = user.user_metadata?.full_name || '—';
    if (el('setPhone')) el('setPhone').textContent = user.user_metadata?.phone || gym.phone || '—';
    if (el('setClubName')) el('setClubName').textContent = gym.name || '—';
    if (el('setCustomerCode')) el('setCustomerCode').textContent = gym.customer_code || '—';
    if (el('setUsername')) el('setUsername').textContent = gym.username || '—';
    if (el('setEmail')) el('setEmail').textContent = user.email || '—';
    if (el('setVersion')) el('setVersion').textContent = (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0');

    // ─── وضعیت اشتراک ───
    renderSubscriptionStatus(gym);
}

function renderSubscriptionStatus(gym) {
    const box = document.getElementById('subscriptionBox');
    if (!box) return;

    const now = new Date();
    const end = gym.subscription_end ? new Date(gym.subscription_end) : null;

    let statusClass = 'active';
    let statusText = '✅ فعال';
    let statusColor = '#2ecc71';
    let daysLeft = 0;

    if (gym.is_blocked) {
        statusClass = 'blocked';
        statusText = '🚫 مسدود';
        statusColor = '#e74c3c';
    } else if (!end) {
        statusClass = 'unknown';
        statusText = '❓ نامشخص';
        statusColor = '#95a5a6';
    } else {
        daysLeft = Math.floor((end - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
            statusClass = 'expired';
            statusText = '⏰ منقضی';
            statusColor = '#e74c3c';
        } else if (daysLeft <= 7) {
            statusClass = 'warning';
            statusText = `⚠️ ${daysLeft} روز`;
            statusColor = '#f39c12';
        } else {
            statusClass = 'active';
            statusText = `✅ فعال — ${daysLeft} روز`;
            statusColor = '#2ecc71';
        }
    }

    box.innerHTML = `
        <div class="sub-status" style="background: ${statusColor}20; border-color: ${statusColor};">
            <span style="color: ${statusColor}; font-weight: 700; font-size: 16px;">
                ${statusText}
            </span>
        </div>
        <div class="sub-info">
            <div class="sub-row">
                <span class="sub-label">📅 تاریخ انقضا:</span>
                <span class="sub-value">${end ? end.toLocaleDateString('fa-IR') : '—'}</span>
            </div>
            <div class="sub-row">
                <span class="sub-label">💎 پلن:</span>
                <span class="sub-value">${getPlanName(gym.subscription_plan)}</span>
            </div>
        </div>
        <button class="btn btn-gold btn-block" style="margin-top: 15px;" onclick="contactSupport()">
            💬 تمدید / خرید لایسنس
        </button>
    `;
}

function getPlanName(planId) {
    const plans = {
        'trial': '🎁 دوره‌ی رایگان',
        '1m': '📅 ۱ ماهه',
        '3m': '📅 ۳ ماهه',
        '6m': '📅 ۶ ماهه',
        '1y': '📅 ۱ ساله'
    };
    return plans[planId] || (planId || '—');
}

// ═══════════════════════════════════════════════════════
// تم
// ═══════════════════════════════════════════════════════
function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('pulse_theme', mode);
    updateThemeButtons();
    showToast(`✅ تم ${mode === 'dark' ? 'تاریک' : 'روشن'} فعال شد`, 'success');
}

function updateThemeButtons() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const darkBtn = document.getElementById('themeDarkBtn');
    const lightBtn = document.getElementById('themeLightBtn');

    if (darkBtn) {
        darkBtn.classList.toggle('active', current === 'dark');
    }
    if (lightBtn) {
        lightBtn.classList.toggle('active', current === 'light');
    }
}

// ═══════════════════════════════════════════════════════
// لینک‌ها
// ═══════════════════════════════════════════════════════
function downloadDesktop() {
    // TODO: لینک واقعی به فایل exe
    window.open('https://github.com/ilyasalehzade6-wq/pulse-management/releases/latest', '_blank');
}

function openPortal() {
    window.open('https://ilyasalehzade6-wq.github.io/python-manager/', '_blank');
}

function copyPortalLink() {
    const link = 'https://ilyasalehzade6-wq.github.io/python-manager/';
    navigator.clipboard.writeText(link).then(() => {
        showToast('✅ لینک پورتال کپی شد', 'success');
    }).catch(() => {
        showToast('❌ خطا در کپی', 'error');
    });
}

function contactSupport() {
    const msg = 'سلام 👋\nدرباره‌ی پالس مدیریت سوال دارم.';
    navigator.clipboard.writeText(msg).catch(() => {});

    // TODO: لینک روبیکا
    const rubikaUrl = 'https://web.rubika.ir/#c=u0I694z06ef3f234f2ae3275cf100ed3';
    window.open(rubikaUrl, '_blank');
}

function logout() {
    if (!confirm('از حساب خارج می‌شوید؟')) return;
    supabaseClient.auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
