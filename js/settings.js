
/**
 * ⚙️ تنظیمات
 */

let settingsData = null;

async function initSettings() {
    await loadSettings();
    updateThemeButtons(); // این تابع حالا در پایین فایل تعریف شده است
}

async function loadSettings() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: gym, error: gErr } = await supabaseClient
            .from('gyms')
            .select('id, name, username, phone, customer_code, owner_name, subscription_plan, subscription_end, is_blocked')
            .eq('owner_auth_id', user.id)
            .limit(1)
            .single();

        if (gErr) throw gErr;

        settingsData = { gym, user };
        renderSettings();

    } catch (e) {
        console.error('خطا در بارگذاری تنظیمات:', e);
    }
}

function renderSettings() {
    if (!settingsData) return;
    const { gym, user } = settingsData;

    const el = (id) => document.getElementById(id);
    if (el('setFullName')) el('setFullName').textContent = user.user_metadata?.full_name || '—';
    if (el('setPhone')) el('setPhone').textContent = user.user_metadata?.phone || gym.phone || '—';
    if (el('setClubName')) el('setClubName').textContent = gym.name || '—';
    if (el('setCustomerCode')) el('setCustomerCode').textContent = gym.customer_code || '—';
    if (el('setUsername')) el('setUsername').textContent = gym.username || '—';
    if (el('setEmail')) el('setEmail').textContent = user.email || '—';

    renderSubscriptionStatus(gym);
}

function renderSubscriptionStatus(gym) {
    const box = document.getElementById('subscriptionBox');
    if (!box) return;

    const end = gym.subscription_end ? new Date(gym.subscription_end) : null;
    let statusText = 'فعال';
    let colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    let daysLeft = 0;
    let icon = 'check-circle-2';

    if (gym.is_blocked) {
        statusText = 'مسدود'; colorClass = 'text-red-500 bg-red-500/10 border-red-500/20'; icon = 'x-circle';
    } else if (!end) {
        statusText = 'نامشخص'; colorClass = 'text-zinc-400 bg-zinc-800 border-zinc-700'; icon = 'help-circle';
    } else {
        daysLeft = getRemainingDays(end);
        if (daysLeft < 0) {
            statusText = 'منقضی شده'; colorClass = 'text-red-500 bg-red-500/10 border-red-500/20'; icon = 'x-circle';
        } else if (daysLeft <= 7) {
            statusText = `${daysLeft} روز مانده`; colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'; icon = 'alert-triangle';
        } else {
            statusText = `فعال — ${daysLeft} روز`; colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'; icon = 'check-circle-2';
        }
    }

    box.innerHTML = `
        <div class="flex items-center gap-2 mb-4 p-3 rounded-lg border ${colorClass}">
            <i data-lucide="${icon}" class="w-5 h-5 stroke-[1.5]"></i>
            <span class="font-bold text-sm">${statusText}</span>
        </div>
        <div class="flex flex-col divide-y divide-zinc-800 text-sm mb-6">
            <div class="flex justify-between items-center py-3">
                <span class="text-zinc-400 flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 stroke-[1.5]"></i> تاریخ انقضا</span>
                <span class="text-zinc-100 font-mono">${end ? end.toLocaleDateString('fa-IR') : '—'}</span>
            </div>
            <div class="flex justify-between items-center py-3">
                <span class="text-zinc-400 flex items-center gap-2"><i data-lucide="diamond" class="w-4 h-4 stroke-[1.5]"></i> پلن فعلی</span>
                <span class="text-zinc-100 font-medium">${getPlanName(gym.subscription_plan)}</span>
            </div>
        </div>
        <button class="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm" onclick="contactSupport()">
            <i data-lucide="crown" class="w-4 h-4 stroke-[2]"></i> تمدید / خرید اشتراک
        </button>
    `;
    
    if (window.lucide) lucide.createIcons();
}

function getPlanName(planId) {
    const plans = { 'trial': 'دوره‌ی رایگان', '1m': '۱ ماهه', '3m': '۳ ماهه', '6m': '۶ ماهه', '1y': '۱ ساله' };
    return plans[planId] || (planId || '—');
}


function setTheme(mode) {
    if (mode === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pulse_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pulse_theme', 'light');
    }
    if (typeof updateThemeButtons === 'function') updateThemeButtons();
}


function updateThemeButtons() {
    const isDark = document.documentElement.classList.contains('dark');
    const darkBtn = document.getElementById('themeDarkBtn');
    const lightBtn = document.getElementById('themeLightBtn');
    
    if (darkBtn && lightBtn) {
        const activeClass = 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700';
        const inactiveClass = 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200';
        
        darkBtn.className = `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isDark ? activeClass : inactiveClass}`;
        lightBtn.className = `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${!isDark ? activeClass : inactiveClass}`;
    }
}

function downloadDesktop() {
    window.open("https://github.com/ilyasalehzade6-wq/pulse-app/releases/download/v3.3.0/PulseManager-Setup-v3.3.0.exe", '_blank');
}

function openPortal() {
    window.open("https://ilyasalehzade6-wq.github.io/python-manager/", '_blank');
}

function copyPortalLink() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText("https://ilyasalehzade6-wq.github.io/python-manager/").then(() => {
            showToast('لینک پورتال کپی شد', 'success');
        }).catch(() => {
            showToast('خطا در کپی', 'error');
        });
    }
}

function contactSupport() {
    window.open("https://web.rubika.ir/#c=u0I694z06ef3f234f2ae3275cf100ed3", '_blank');
}

function logout() {
    if (!confirm('از حساب خارج می‌شوید؟')) return;
    supabaseClient.auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
