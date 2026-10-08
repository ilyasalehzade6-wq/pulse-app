/**
 * 🎫 License Utils — منبع واحد حقیقت
 * همه‌ی محاسبات روز از subscription_end (ISO UTC) محاسبه میشه
 */

function toDate(input) {
    if (!input) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * ✅ تنها تابع مجاز برای روز باقی‌مونده
 * از Math.floor استفاده می‌کنیم چون می‌خوایم با محاسبه‌ی SQL
 * (subscription_end::date - CURRENT_DATE) هماهنگ باشه
 */
function getRemainingDays(subscriptionEnd) {
    const end = toDate(subscriptionEnd);
    if (!end) return 0;
    const now = new Date();
    // ─── نرمال‌سازی به UTC midnight برای هماهنگی با SQL ───
    const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const diffDays = Math.round((endUTC - nowUTC) / 86400000);
    return Math.max(0, diffDays);
}

function getElapsedDays(subscriptionStart) {
    const start = toDate(subscriptionStart);
    if (!start) return 0;
    const now = new Date();
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.max(0, Math.round((nowUTC - startUTC) / 86400000));
}

function getTotalPlanDays(start, end) {
    const s = toDate(start), e = toDate(end);
    if (!s || !e) return 30;
    const sUTC = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
    const eUTC = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
    return Math.max(1, Math.round((eUTC - sUTC) / 86400000));
}

function getLicenseStatus(subscriptionEnd, subscriptionStart) {
    const days = getRemainingDays(subscriptionEnd);
    const total = getTotalPlanDays(subscriptionStart, subscriptionEnd);
    const elapsed = Math.max(0, total - days);
    const percent = Math.max(0, Math.min(100, Math.round((days / total) * 100)));

    if (days <= 0) {
        return { status: 'expired', days: 0, total, elapsed, percent,
                 color: '#e74c3c', icon: '❌', label: 'منقضی شده' };
    }
    if (days <= 7) {
        return { status: 'warning', days, total, elapsed, percent,
                 color: '#f39c12', icon: '⚠️', label: `${days} روز مانده` };
    }
    return { status: 'active', days, total, elapsed, percent,
             color: '#2ecc71', icon: '✅', label: `فعال — ${days} روز مانده` };
}

function formatISODate(isoStr) {
    const d = toDate(isoStr);
    if (!d) return '—';
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
}


// ═══════════════════════════════════════════════════════
//  🔤 تبدیل تاریخ میلادی/شمسی به شمسی برای نمایش
// ═══════════════════════════════════════════════════════
function toShamsiDisplay(dateInput) {
    if (!dateInput) return '—';

    // ─── اگه از قبل شمسی هست (مثل "1405-07-17") ───
    if (typeof dateInput === 'string') {
        const m = dateInput.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
        if (m) {
            const year = parseInt(m[1]);
            if (year >= 1300 && year <= 1500) {
                return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`;
            }
        }
    }

    // ─── اگه Date یا ISO میلادی بود → تبدیل کن ───
    let d;
    if (dateInput instanceof Date) d = dateInput;
    else d = new Date(dateInput);

    if (isNaN(d.getTime())) return String(dateInput);

    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();

    // الگوریتم تبدیل میلادی به شمسی
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    let gy2 = (gy <= 1600) ? gy - 621 : gy - 1600;
    const gy2b = (gm > 2) ? (gy2 + 1) : gy2;

    let days = (365 * gy2) + Math.floor((gy2b + 3) / 4) -
               Math.floor((gy2b + 99) / 100) + Math.floor((gy2b + 399) / 400) -
               80 + gd + g_d_m[gm - 1];

    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }

    let jm, jd;
    if (days < 186) {
        jm = 1 + Math.floor(days / 31);
        jd = 1 + (days % 31);
    } else {
        jm = 7 + Math.floor((days - 186) / 30);
        jd = 1 + ((days - 186) % 30);
    }

    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

// alias ساده‌تر
const toShamsiDate = toShamsiDisplay;
