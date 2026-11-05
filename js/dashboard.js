
/**
 * 📊 منطق داشبورد (نسخه نهایی و بدون خطا)
 */

let supabaseClient = null;
let currentUser = null;
let currentGym = null;
let stats = null;

document.addEventListener('DOMContentLoaded', async () => {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // فعال کردن آیکون‌ها
    if (window.lucide) lucide.createIcons();
    
    // اعمال تم ذخیره شده
    if (localStorage.getItem('pulse_theme') === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    try {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;
        await loadDashboard();

        // مخفی کردن لودینگ
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';

    } catch (error) {
        console.error('Dashboard error:', error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }
});

async function loadDashboard() {
    const { data: gymData, error: gymError } = await supabaseClient.rpc('get_my_gym');

    if (gymError) throw gymError;
    if (!gymData || !gymData.id) return;

    currentGym = gymData;
    renderGymInfo();

    // محاسبه ماه شمسی
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

    const { data: statsData, error: statsError } = await supabaseClient.rpc('get_dashboard_stats', {
        p_month: _shamsiMonth
    });

    if (!statsError && statsData) {
        stats = statsData;
        renderStats();
    }
}

function renderGymInfo() {
    if (!currentGym) return;
    
    const ownerName = currentGym.owner_name || 'کاربر';
    const clubName = currentGym.name || 'مجموعه';
    const daysLeft = typeof getRemainingDays === 'function' ? getRemainingDays(currentGym.subscription_end) : 0;

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = ownerName;
    
    const userAvatarEl = document.getElementById('userAvatar');
    if (userAvatarEl) userAvatarEl.textContent = ownerName[0] || '?';

    const hour = new Date().getHours();
    let greeting = 'سلام';
    if (hour < 12) greeting = 'صبح بخیر';
    else if (hour < 17) greeting = 'ظهر بخیر';
    else greeting = 'عصر بخیر';

    const greetingEl = document.getElementById('greeting');
    if (greetingEl) greetingEl.textContent = `${greeting}، ${ownerName}`;

    const clubInfoEl = document.getElementById('clubInfo');
    if (clubInfoEl) clubInfoEl.textContent = `${clubName} • ${currentGym.club_type || 'مجموعه'}`;

    const plan = currentGym.subscription_plan || 'trial';
    
    const daysLeftPercentEl = document.getElementById('daysLeftPercent');
    if (daysLeftPercentEl) daysLeftPercentEl.textContent = daysLeft;

    const totalDays = plan === 'trial' ? 30 : 365;
    const usedDays = totalDays - daysLeft;
    const percent = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));

    const progressFillEl = document.getElementById('progressFill');
    if (progressFillEl) progressFillEl.style.width = `${percent}%`;

    const daysLeftTextEl = document.getElementById('daysLeftText');
    if (daysLeftTextEl) daysLeftTextEl.textContent = `از ${totalDays} روز`;

    if (currentGym.subscription_end) {
        const endDate = new Date(currentGym.subscription_end);
        const endStr = endDate.toLocaleDateString("fa-IR");
        const subEndTextEl = document.getElementById('subscriptionEndText');
        if (subEndTextEl) subEndTextEl.textContent = `پایان: ${endStr}`;
    }
}

function renderStats() {
    if (!stats) return;
    
    const totalMembersEl = document.getElementById('totalMembers');
    if (totalMembersEl) totalMembersEl.textContent = formatNumber(stats.total_members || 0);
    
    const newMembersEl = document.getElementById('newMembers');
    if (newMembersEl) newMembersEl.textContent = formatNumber(stats.new_members_month || 0);
    
    const monthIncomeEl = document.getElementById('monthIncome');
    if (monthIncomeEl) monthIncomeEl.textContent = formatNumber(stats.total_income_month || 0);
    
    const unpaidInstallmentsEl = document.getElementById('unpaidInstallments');
    if (unpaidInstallmentsEl) unpaidInstallmentsEl.textContent = formatNumber(stats.unpaid_installments || 0);
}

function formatNumber(num) {
    return Number(num).toLocaleString('fa-IR');
}


function switchPage(pageName) {
    const pages = ['dashboardContent', 'membersContent', 'attendanceContent', 'financeContent', 'reportsContent', 'settingsContent', 'chatContent'];
    
    // ۱. مخفی کردن تمام صفحات با حذف کلاس active
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active'); 
        }
    });

    // ۲. مدیریت دکمه‌های سایدبار
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-amber-500/10', 'text-amber-500', 'border-r-2', 'border-amber-500', 'font-bold');
        btn.classList.add('text-zinc-500', 'hover:text-zinc-100', 'hover:bg-zinc-800/50', 'font-medium');
        
        if (btn.dataset.page === pageName) {
            btn.classList.remove('text-zinc-500', 'hover:text-zinc-100', 'hover:bg-zinc-800/50', 'font-medium');
            btn.classList.add('bg-amber-500/10', 'text-amber-500', 'border-r-2', 'border-amber-500', 'font-bold');
        }
    });

    // ۳. نمایش صفحه درخواستی با اضافه کردن کلاس active
    const targetId = pageName === 'dashboard' ? 'dashboardContent' : pageName + 'Content';
    const target = document.getElementById(targetId);
    
    if (target) {
        target.classList.add('active'); // این کلاس در CSS ما تعریف شده است
    }

    // ۴. بارگذاری داده‌ها
    if (pageName === 'members' && typeof loadMembers === 'function') loadMembers();
    if (pageName === 'attendance' && typeof initAttendance === 'function') initAttendance();
    if (pageName === 'finance' && typeof initFinance === 'function') initFinance();
    if (pageName === 'reports' && typeof initReports === 'function') initReports();
    if (pageName === 'settings' && typeof initSettings === 'function') initSettings();
    if (pageName === 'chat' && typeof loadChatRooms === 'function') loadChatRooms();

    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && !sidebar.classList.contains('translate-x-full')) {
            sidebar.classList.add('translate-x-full');
            if (overlay) overlay.classList.add('hidden');
        }
    }
    if (window.lucide) lucide.createIcons();
}



function toggleTheme() {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.classList.contains('dark');
    
    if (isDark) {
        htmlEl.classList.remove('dark');
        localStorage.setItem('pulse_theme', 'light');
    } else {
        htmlEl.classList.add('dark');
        localStorage.setItem('pulse_theme', 'dark');
    }
    
    if (typeof updateThemeButtons === 'function') updateThemeButtons();
}


// ═══════════════════════════════════════════════════════
// 💬 منطق پیام‌رسان (Chat)
// ═══════════════════════════════════════════════════════
let chatRoomsCache = [];
let currentChatRoom = null;
let chatRefreshTimer = null;

async function loadChatRooms() {
    const list = document.getElementById('chatRoomsList');
    if (!list) return;

    try {
        list.innerHTML = '<div class="text-center py-6 text-zinc-500 text-sm">در حال بارگذاری...</div>';
        const { data, error } = await supabaseClient.rpc('owner_list_chat_rooms');

        if (error || !data?.success) {
            list.innerHTML = '<div class="text-center py-6 text-zinc-500 text-sm">خطا در بارگذاری</div>';
            return;
        }

        chatRoomsCache = data.rooms || [];
        renderChatRooms();
    } catch (err) {
        console.error('loadChatRooms:', err);
        list.innerHTML = '<div class="text-center py-6 text-zinc-500 text-sm">خطای غیرمنتظره</div>';
    }
}

function renderChatRooms() {
    const list = document.getElementById('chatRoomsList');
    if (!list) return;

    if (chatRoomsCache.length === 0) {
        list.innerHTML = '<div class="text-center py-6 text-zinc-500 text-sm">هیچ گفت‌وگویی وجود ندارد</div>';
        return;
    }

    const sorted = [...chatRoomsCache].sort((a, b) => (b.unread || 0) - (a.unread || 0));

    list.innerHTML = sorted.map(r => {
        const isPublic = r.room_type === 'public';
        const icon = isPublic ? 'globe' : 'user';
        const name = isPublic ? 'عمومی (همه)' : (r.room_name || 'بدون نام');
        const lastMsg = (r.last_message || '').substring(0, 40) || '—';
        const hasUnread = (r.unread || 0) > 0;
        const isActive = currentChatRoom?.id === r.room_id;

        return `
            <div class="flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-amber-500/10' : 'hover:bg-zinc-800/50'}" onclick="openChatRoom('${r.room_id}', '${name}', '${r.room_type}')">
                <div class="w-10 h-10 rounded-full bg-[#09090b] border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <i data-lucide="${icon}" class="w-4 h-4 stroke-[1.5]"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <div class="text-sm font-medium ${isActive ? 'text-amber-500' : 'text-zinc-200'} truncate">${name}</div>
                        ${hasUnread ? '<span class="w-2 h-2 rounded-full bg-amber-500"></span>' : ''}
                    </div>
                    <div class="text-xs ${isActive ? 'text-amber-500/70' : 'text-zinc-500'} truncate">${lastMsg}</div>
                </div>
            </div>
        `;
    }).join('');
    if (window.lucide) lucide.createIcons();
}

async function openChatRoom(roomId, roomName, roomType) {
    currentChatRoom = { id: roomId, name: roomName, type: roomType };
    const emptyState = document.getElementById('chatEmptyState');
    const conv = document.getElementById('chatConversation');
    const title = document.getElementById('chatConvTitle');

    if (emptyState) emptyState.style.display = 'none';
    if (conv) conv.style.display = 'flex';
    if (title) title.textContent = roomName;

    renderChatRooms();
    try { await supabaseClient.rpc('owner_mark_chat_read', { p_room_id: roomId }); } catch (e) {}
    await loadChatMessages();
    startChatRefresh();
}

function backToRoomList() {
    stopChatRefresh();
    currentChatRoom = null;
    document.getElementById('chatEmptyState').style.display = 'flex';
    document.getElementById('chatConversation').style.display = 'none';
    renderChatRooms();
}

async function loadChatMessages() {
    if (!currentChatRoom) return;
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    try {
        const { data, error } = await supabaseClient.rpc('owner_get_chat_messages', { p_room_id: currentChatRoom.id, p_limit: 100 });
        if (error || !data?.success) return;
        
        const messages = (data.messages || []).reverse();
        renderChatMessages(messages);
    } catch (err) { console.error(err); }
}

function renderChatMessages(messages) {
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    if (!messages || messages.length === 0) {
        list.innerHTML = '<div class="text-center py-10 text-zinc-500 text-sm">هنوز پیامی وجود ندارد.</div>';
        return;
    }

    list.innerHTML = messages.map(m => {
        const isAdmin = m.sender_type === 'admin';
        if (m.content === '[پیام حذف شد]') return '<div class="text-xs text-zinc-500 italic text-center w-full my-2">[پیام حذف شد]</div>';
        
        return `
            <div class="flex flex-col max-w-[80%] ${isAdmin ? 'self-end items-start' : 'self-start items-end'}">
                ${!isAdmin ? `<span class="text-[11px] text-zinc-500 mb-1 mx-1">${m.sender_name || 'عضو'}</span>` : ''}
                <div class="px-4 py-2 text-sm leading-relaxed ${isAdmin ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl rounded-tl-sm' : 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-tr-sm'}">
                    ${m.content}
                </div>
                <span class="text-[10px] text-zinc-600 mt-1 mx-1 font-mono">${m.time || ''}</span>
            </div>
        `;
    }).join('');
    setTimeout(() => { list.scrollTop = list.scrollHeight; }, 50);
}

async function sendChatMessage() {
    if (!currentChatRoom) return;
    const input = document.getElementById('chatMessageInput');
    const content = input.value.trim();
    if (!content) return;

    input.value = '';
    try {
        await supabaseClient.rpc('owner_send_chat_message', { p_room_id: currentChatRoom.id, p_content: content });
        await loadChatMessages();
    } catch (err) { console.error(err); }
}

function startChatRefresh() {
    stopChatRefresh();
    chatRefreshTimer = setInterval(loadChatMessages, 3000);
}

function stopChatRefresh() {
    if (chatRefreshTimer) { clearInterval(chatRefreshTimer); chatRefreshTimer = null; }
}

// ═══════════════════════════════════════════════════════
// توابع عمومی
// ═══════════════════════════════════════════════════════
function copyPortalLink() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText("https://ilyasalehzade6-wq.github.io/python-manager/").then(() => {
            showToast('لینک پورتال کپی شد', 'success');
        }).catch(() => {
            showToast('خطا در کپی کردن', 'error');
        });
    }
}

function contactSupport() {
    window.open("https://web.rubika.ir/#c=u0I694z06ef3f234f2ae3275cf100ed3", '_blank');
}

function downloadDesktop() {
    showToast('در حال دانلود نسخه دسکتاپ...', 'info');
}

function logout() {
    if (!confirm('آیا از خروج مطمئن هستید؟')) return;
    supabaseClient.auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}
