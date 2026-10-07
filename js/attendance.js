/**
 * ✅ حضور و غیاب — فقط مشاهده
 */

let attendanceMembers = [];
let attendanceRecords = [];
let currentAttDate = null;

// ═══════════════════════════════════════════════════════
// راه‌اندازی
// ═══════════════════════════════════════════════════════
async function initAttendance() {
    if (!currentAttDate) {
        currentAttDate = getTodayISO();
        const input = document.getElementById('attendanceDate');
        if (input) input.value = currentAttDate;
    }

    await loadAttendance();
}

// ═══════════════════════════════════════════════════════
// بارگذاری
// ═══════════════════════════════════════════════════════
async function loadAttendance() {
    showAttLoading(true);
    try {
        const gymId = await getGymId();
        if (!gymId) throw new Error('gym_id پیدا نشد');

        // ─── اعضا ───
        const { data: members, error: mErr } = await supabaseClient
            .from('members')
            .select('id, full_name, phone, member_code, class_name, is_active')
            .eq('gym_id', gymId)
            .eq('is_active', true)
            .order('full_name');

        if (mErr) throw mErr;
        attendanceMembers = members || [];

        // ─── حضور این تاریخ ───
        const { data: records, error: aErr } = await supabaseClient
            .from('attendances')
            .select('id, member_id, status, attendance_date, created_at')
            .eq('gym_id', gymId)
            .eq('attendance_date', currentAttDate);

        if (aErr) throw aErr;
        attendanceRecords = records || [];

        updateAttStats();
        renderAttendanceList();

    } catch (e) {
        console.error('خطا در بارگذاری حضور:', e);
        showToast('❌ خطا: ' + e.message, 'error');
    } finally {
        showAttLoading(false);
    }
}

// ═══════════════════════════════════════════════════════
// آمار
// ═══════════════════════════════════════════════════════
function updateAttStats() {
    const total = attendanceMembers.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = total - present;

    const el = (id) => document.getElementById(id);
    if (el('attPresentCount')) el('attPresentCount').textContent = present;
    if (el('attAbsentCount')) el('attAbsentCount').textContent = absent;
    if (el('attTotalCount')) el('attTotalCount').textContent = total;
    if (el('presentBadge')) el('presentBadge').textContent = present;
}

// ═══════════════════════════════════════════════════════
// لیست حاضران
// ═══════════════════════════════════════════════════════
function renderAttendanceList() {
    const listEl = document.getElementById('attendanceList');
    const emptyEl = document.getElementById('attendanceEmpty');
    if (!listEl) return;

    const presentRecords = attendanceRecords.filter(r => r.status === 'present');

    if (presentRecords.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = presentRecords.map(r => {
        const m = attendanceMembers.find(x => x.id === r.member_id);
        if (!m) return '';
        const time = r.created_at ? formatTime(r.created_at) : '—';
        return `
            <div class="attendance-card">
                <div class="attendance-avatar">${(m.full_name || '?').charAt(0)}</div>
                <div class="attendance-info">
                    <div class="attendance-name">${escapeHtml(m.full_name || '—')}</div>
                    <div class="attendance-time">⏰ ${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════
// تاریخ
// ═══════════════════════════════════════════════════════
function onDateChange() {
    const input = document.getElementById('attendanceDate');
    if (!input) return;
    currentAttDate = input.value;
    loadAttendance();
}

function setDateToday() {
    currentAttDate = getTodayISO();
    const input = document.getElementById('attendanceDate');
    if (input) input.value = currentAttDate;
    loadAttendance();
}

function setDateYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    currentAttDate = d.toISOString().slice(0, 10);
    const input = document.getElementById('attendanceDate');
    if (input) input.value = currentAttDate;
    loadAttendance();
}

function getTodayISO() {
    return new Date().toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════
function showAttLoading(show) {
    const el = document.getElementById('attendanceLoading');
    if (el) el.style.display = show ? 'block' : 'none';
}

function formatTime(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
