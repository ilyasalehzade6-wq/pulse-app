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
    listEl.innerHTML = filtered.map(m => renderMemberCard(m)).join('');
}

function renderMemberCard(m) {
    const initials = (m.full_name || '?').trim().charAt(0).toUpperCase();
    const code = m.member_code || '—';
    const phone = m.phone || '—';
    const className = m.class_name || '—';
    const isActive = m.is_active !== false;

    return `
        <div class="member-card" onclick="viewMember('${m.id}')">
            <div class="member-avatar">${initials}</div>
            <div class="member-info">
                <div class="member-name">${escapeHtml(m.full_name || 'بی‌نام')}</div>
                <div class="member-meta">
                    <span dir="ltr">📱 ${escapeHtml(phone)}</span>
                    <span>🎫 ${escapeHtml(code)}</span>
                </div>
                <div class="member-class">📚 ${escapeHtml(className)}</div>
            </div>
            <div class="member-status">
                <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? '✅' : '⭕'}
                </span>
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

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👤 ${escapeHtml(m.full_name || 'بی‌نام')}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="detail-row">
                    <strong>📱 شماره:</strong>
                    <span dir="ltr">${escapeHtml(m.phone || '—')}</span>
                </div>
                <div class="detail-row">
                    <strong>🎫 کد عضویت:</strong>
                    <span>${escapeHtml(m.member_code || '—')}</span>
                </div>
                <div class="detail-row">
                    <strong>📚 کلاس:</strong>
                    <span>${escapeHtml(m.class_name || '—')}</span>
                </div>
                <div class="detail-row">
                    <strong>📅 تاریخ عضویت:</strong>
                    <span>${formatDate(m.join_date)}</span>
                </div>
                <div class="detail-row">
                    <strong>✅ وضعیت:</strong>
                    <span>${m.is_active ? 'فعال' : 'غیرفعال'}</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">بستن</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
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
        return new Date(iso).toLocaleDateString('fa-IR');
    } catch { return '—'; }
}
