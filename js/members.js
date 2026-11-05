/**
 * 👥 اعضا — فقط مشاهده
 */



let allMembers = [];
let memberFilter = '';

// ═══════════════════════════════════════════════════════
// بارگذاری
// ═══════════════════════════════════════════════════════
async function loadMembers() {
    showMembersLoading(true);
    try {
        const gymId = await getGymId();
        if (!gymId) {
            console.error('gym_id پیدا نشد');
            return;
        }

        const { data, error } = await supabaseClient
            .from('members')
            .select('*')
            .eq('gym_id', gymId)
            .order('full_name', { ascending: true });

        if (error) throw error;

        allMembers = data || [];
        updateMemberStats();
        renderMembers();
    } catch (e) {
        console.error('خطا در بارگذاری اعضا:', e);
        showToast('❌ خطا در بارگذاری: ' + e.message, 'error');
    } finally {
        showMembersLoading(false);
    }
}

// ═══════════════════════════════════════════════════════
// gym_id
// ═══════════════════════════════════════════════════════
async function getGymId() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabaseClient
            .from('gyms')
            .select('id')
            .eq('owner_auth_id', user.id)
            .limit(1)
            .single();

        if (error) return null;
        return data?.id;
    } catch (e) {
        console.error('getGymId error:', e);
        return null;
    }
}

// ═══════════════════════════════════════════════════════
// آمار
// ═══════════════════════════════════════════════════════
function updateMemberStats() {
    const total = allMembers.length;
    const active = allMembers.filter(m => m.is_active).length;
    const now = new Date();
    const thisMonth = allMembers.filter(m => {
        if (!m.join_date && !m.created_at) return false;
        const d = new Date(m.join_date || m.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const el = (id) => document.getElementById(id);
    if (el('mTotalCount')) el('mTotalCount').textContent = total;
    if (el('mActiveCount')) el('mActiveCount').textContent = active;
    if (el('mMonthCount')) el('mMonthCount').textContent = thisMonth;
}

// ═══════════════════════════════════════════════════════
// رندر
// ═══════════════════════════════════════════════════════


function renderMembers() {
    const listEl = document.getElementById('membersList');
    const emptyEl = document.getElementById('membersEmpty');
    if (!listEl) return;

    let filtered = allMembers;
    if (memberFilter) {
        const q = memberFilter.toLowerCase();
        filtered = filtered.filter(m =>
            (m.full_name || '').toLowerCase().includes(q) ||
            (m.phone || '').includes(q) ||
            (m.member_code || '').toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    // ساخت هدر جدول
    let html = `
        <div class="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-[#121215] text-xs font-bold text-zinc-400">
            <div class="col-span-4">نام و کد عضویت</div>
            <div class="col-span-3">شماره تماس</div>
            <div class="col-span-3">کلاس / باشگاه</div>
            <div class="col-span-2 text-left">وضعیت و عملیات</div>
        </div>
    `;

    // ساخت ردیف‌های اعضا
    html += filtered.map(m => {
        const initials = (m.full_name || '?').trim().charAt(0).toUpperCase();
        const code = m.member_code || '—';
        const phone = m.phone || '—';
        const className = m.class_name || '—';
        const isActive = m.is_active !== false;

        return `
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">
                <!-- Avatar + Name -->
                <div class="col-span-4 flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-[#09090b] border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-sm shrink-0">
                        ${initials}
                    </div>
                    <div class="min-w-0">
                        <div class="text-sm font-medium text-zinc-100 truncate">${escapeHtml(m.full_name || 'بی‌نام')}</div>
                        <div class="text-xs text-zinc-500 font-mono mt-0.5" dir="ltr">${escapeHtml(code)}</div>
                    </div>
                </div>
                
                <!-- Phone -->
                <div class="col-span-3 flex items-center gap-2 text-sm text-zinc-400 font-mono" dir="ltr">
                    <i data-lucide="phone" class="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]"></i>
                    ${escapeHtml(phone)}
                </div>
                
                <!-- Class -->
                <div class="col-span-3 flex items-center gap-2 text-sm text-zinc-400 truncate">
                    <i data-lucide="briefcase" class="w-3.5 h-3.5 text-zinc-500 stroke-[1.5] shrink-0"></i>
                    <span class="truncate">${escapeHtml(className)}</span>
                </div>
                
                <!-- Status & Actions -->
                <div class="col-span-2 flex items-center justify-end gap-3">
                    <span class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}">
                        <i data-lucide="${isActive ? 'check-circle-2' : 'circle'}" class="w-3.5 h-3.5 stroke-[1.5]"></i>
                        ${isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    <button onclick="viewMember('${m.id}')" class="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-700 transition-colors" title="مشاهده جزئیات">
                        <i data-lucide="eye" class="w-4 h-4 stroke-[1.5]"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    listEl.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}




function renderMemberCard(m) {
    const initials = (m.full_name || '?').trim().charAt(0).toUpperCase();
    const code = m.member_code || '—';
    const phone = m.phone || '—';
    const className = m.class_name || '—';
    const isActive = m.is_active !== false;

    return `
        <div class="flex items-center justify-between p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-[#09090b] border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold">
                    ${initials}
                </div>
                <div>
                    <div class="text-zinc-100 font-medium text-sm">${escapeHtml(m.full_name || 'بی‌نام')}</div>
                    <div class="flex items-center gap-4 text-xs text-zinc-400 mt-1.5">
                        <span dir="ltr" class="flex items-center gap-1.5"><i data-lucide="phone" class="w-3.5 h-3.5 stroke-[1.5]"></i> ${escapeHtml(phone)}</span>
                        <span class="flex items-center gap-1.5"><i data-lucide="id-card" class="w-3.5 h-3.5 stroke-[1.5]"></i> ${escapeHtml(code)}</span>
                        <span class="flex items-center gap-1.5"><i data-lucide="briefcase" class="w-3.5 h-3.5 stroke-[1.5]"></i> ${escapeHtml(className)}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${isActive ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}">
                    <i data-lucide="${isActive ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5 stroke-[1.5]"></i>
                    ${isActive ? 'فعال' : 'غیرفعال'}
                </span>
                <button onclick="viewMember('${m.id}')" class="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors">
                    <i data-lucide="eye" class="w-4 h-4 stroke-[1.5]"></i>
                </button>
            </div>
        </div>
    `;
}


// ═══════════════════════════════════════════════════════
// جستجو
// ═══════════════════════════════════════════════════════
function filterMembers() {
    const input = document.getElementById('memberSearch');
    memberFilter = input ? input.value.trim() : '';
    renderMembers();
}

// ═══════════════════════════════════════════════════════
// مشاهده‌ی جزئیات
// ═══════════════════════════════════════════════════════

function viewMember(memberId) {
    const m = allMembers.find(x => x.id === memberId);
    if (!m) return;

    const isActive = m.is_active !== false;
    const statusBadge = isActive 
        ? '<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-xs font-medium">فعال</span>' 
        : '<span class="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md text-xs font-medium">غیرفعال</span>';

    const modalHTML = `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="memberModal">
            <div class="bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl w-[400px] overflow-hidden flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between p-5 border-b border-zinc-800">
                    <h2 class="text-zinc-100 font-bold text-lg">جزئیات عضو</h2>
                    <button onclick="document.getElementById('memberModal').remove()" class="text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-zinc-800">
                        <i data-lucide="x" class="w-5 h-5 stroke-[1.5]"></i>
                    </button>
                </div>
                
                <!-- Content -->
                <div class="p-6 flex flex-col gap-5">
                    <div class="flex items-center gap-4 mb-2">
                        <div class="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl shrink-0">
                            ${(m.full_name || '?').charAt(0)}
                        </div>
                        <div>
                            <div class="text-zinc-100 font-bold text-lg">${escapeHtml(m.full_name || 'بی‌نام')}</div>
                            <div class="mt-1">${statusBadge}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center border-b border-zinc-800/50 pb-4">
                        <span class="text-zinc-400 text-sm flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4 stroke-[1.5]"></i> شماره موبایل</span>
                        <span class="text-zinc-100 font-mono text-sm" dir="ltr">${escapeHtml(m.phone || '—')}</span>
                    </div>
                    
                    <div class="flex justify-between items-center border-b border-zinc-800/50 pb-4">
                        <span class="text-zinc-400 text-sm flex items-center gap-2"><i data-lucide="credit-card" class="w-4 h-4 stroke-[1.5]"></i> کد عضویت</span>
                        <span class="text-zinc-100 font-mono text-sm">${escapeHtml(m.member_code || '—')}</span>
                    </div>

                    <div class="flex justify-between items-center border-b border-zinc-800/50 pb-4">
                        <span class="text-zinc-400 text-sm flex items-center gap-2"><i data-lucide="briefcase" class="w-4 h-4 stroke-[1.5]"></i> کلاس / باشگاه</span>
                        <span class="text-zinc-100 text-sm">${escapeHtml(m.class_name || '—')}</span>
                    </div>

                    <div class="flex justify-between items-center pb-2">
                        <span class="text-zinc-400 text-sm flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 stroke-[1.5]"></i> تاریخ عضویت</span>
                        <span class="text-zinc-100 text-sm">${formatDate(m.join_date || m.created_at)}</span>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="p-4 border-t border-zinc-800 flex justify-end bg-[#0f0f13]">
                    <button onclick="document.getElementById('memberModal').remove()" class="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors">
                        بستن
                    </button>
                </div>
            </div>
        </div>
    `;

    // حذف مودال‌های قبلی اگر وجود داشتند
    const existing = document.getElementById('memberModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.lucide) lucide.createIcons();
}


// ═══════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════
function showMembersLoading(show) {
    const el = document.getElementById('membersLoading');
    if (el) el.style.display = show ? 'block' : 'none';
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString("fa-IR");
    } catch { return '—'; }
}
