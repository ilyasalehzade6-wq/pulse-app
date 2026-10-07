/**
 * 💰 امور مالی — فقط مشاهده
 */

let financePayments = [];
let financeInstallments = [];
let financeMembers = [];
let financeMonth = null;

// ═══════════════════════════════════════════════════════
// راه‌اندازی
// ═══════════════════════════════════════════════════════
async function initFinance() {
    if (!financeMonth) {
        financeMonth = getCurrentMonthISO();
        const input = document.getElementById('financeMonth');
        if (input) input.value = financeMonth;
    }

    await loadFinance();
}

// ═══════════════════════════════════════════════════════
// بارگذاری
// ═══════════════════════════════════════════════════════
async function loadFinance() {
    showFinLoading(true);
    try {
        const gymId = await getGymId();
        if (!gymId) throw new Error('gym_id پیدا نشد');

        // ─── اعضا (برای نمایش نام) ───
        const { data: members } = await supabaseClient
            .from('members')
            .select('id, full_name, phone, member_code')
            .eq('gym_id', gymId);

        financeMembers = members || [];

        // ─── پرداخت‌های این ماه ───
        const monthStart = financeMonth + '-01';
        const monthEnd = getMonthEnd(financeMonth);

        const { data: payments, error: pErr } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('gym_id', gymId)
            .gte('payment_date', monthStart)
            .lte('payment_date', monthEnd)
            .order('payment_date', { ascending: false });

        if (pErr) throw pErr;
        financePayments = payments || [];

        // ─── اقساط معلق ───
        const { data: installments, error: iErr } = await supabaseClient
            .from('installments')
            .select('*')
            .eq('gym_id', gymId)
            .eq('is_paid', false)
            .order('due_date', { ascending: true })
            .limit(20);

        if (iErr) throw iErr;
        financeInstallments = installments || [];

        updateFinanceStats();
        renderPaymentsList();
        renderInstallmentsList();

    } catch (e) {
        console.error('خطا در بارگذاری مالی:', e);
        showToast('❌ خطا: ' + e.message, 'error');
    } finally {
        showFinLoading(false);
    }
}

// ═══════════════════════════════════════════════════════
// آمار
// ═══════════════════════════════════════════════════════
function updateFinanceStats() {
    const income = financePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const count = financePayments.length;
    const avg = count > 0 ? Math.round(income / count) : 0;
    const pending = financeInstallments.length;

    const el = (id) => document.getElementById(id);
    if (el('finIncome')) el('finIncome').textContent = formatMoney(income);
    if (el('finCount')) el('finCount').textContent = count;
    if (el('finAvg')) el('finAvg').textContent = formatMoney(avg);
    if (el('finPending')) el('finPending').textContent = pending;
    if (el('paymentsBadge')) el('paymentsBadge').textContent = count;
    if (el('installmentsBadge')) el('installmentsBadge').textContent = pending;
}

// ═══════════════════════════════════════════════════════
// لیست پرداخت‌ها
// ═══════════════════════════════════════════════════════
function renderPaymentsList() {
    const listEl = document.getElementById('paymentsList');
    const emptyEl = document.getElementById('paymentsEmpty');
    if (!listEl) return;

    if (financePayments.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = financePayments.map(p => {
        const m = financeMembers.find(x => x.id === p.member_id);
        const memberName = m ? m.full_name : 'نامشخص';
        const memberCode = m ? m.member_code : '—';
        const payType = p.payment_type || 'پرداخت';
        const desc = p.description || '';

        return `
            <div class="payment-card">
                <div class="payment-avatar">${(memberName || '?').charAt(0)}</div>
                <div class="payment-info">
                    <div class="payment-name">${escapeHtml(memberName)}</div>
                    <div class="payment-meta">
                        <span>🎫 ${escapeHtml(memberCode)}</span>
                        <span>📅 ${formatDate(p.payment_date)}</span>
                    </div>
                    ${desc ? `<div class="payment-desc">💬 ${escapeHtml(desc)}</div>` : ''}
                </div>
                <div class="payment-amount">
                    ${formatMoney(p.amount)}
                    <div class="payment-type">${escapeHtml(payType)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════
// لیست اقساط معلق
// ═══════════════════════════════════════════════════════
function renderInstallmentsList() {
    const listEl = document.getElementById('installmentsList');
    const emptyEl = document.getElementById('installmentsEmpty');
    if (!listEl) return;

    if (financeInstallments.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = financeInstallments.map(inst => {
        const m = financeMembers.find(x => x.id === inst.member_id);
        const memberName = m ? m.full_name : 'نامشخص';
        const dueDate = inst.due_date || '—';
        const isOverdue = isDatePast(dueDate);

        return `
            <div class="installment-card ${isOverdue ? 'overdue' : ''}">
                <div class="installment-avatar">${(memberName || '?').charAt(0)}</div>
                <div class="installment-info">
                    <div class="installment-name">${escapeHtml(memberName)}</div>
                    <div class="installment-due ${isOverdue ? 'overdue-text' : ''}">
                        ${isOverdue ? '🔴 معوق' : '⏰'} سررسید: ${formatDate(dueDate)}
                    </div>
                </div>
                <div class="installment-amount">
                    ${formatMoney(inst.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════
// تاریخ و ماه
// ═══════════════════════════════════════════════════════
function onFinanceMonthChange() {
    const input = document.getElementById('financeMonth');
    if (!input) return;
    financeMonth = input.value;
    loadFinance();
}

function setFinanceMonthCurrent() {
    financeMonth = getCurrentMonthISO();
    const input = document.getElementById('financeMonth');
    if (input) input.value = financeMonth;
    loadFinance();
}

function getCurrentMonthISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthEnd(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
}

function isDatePast(dateStr) {
    if (!dateStr) return false;
    try {
        return new Date(dateStr) < new Date();
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════
function showFinLoading(show) {
    const el = document.getElementById('financeLoading');
    if (el) el.style.display = show ? 'block' : 'none';
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('fa-IR');
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('fa-IR');
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
