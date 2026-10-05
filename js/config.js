/**
 * 🔧 تنظیمات پالس اپ
 */

const SUPABASE_URL = "https://lxicakedhhocpdphgzrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ldxkcUuBekMeitRc57ZAsw_fFbva3Zi";

const BRAND_NAME = "پالس مدیریت";
const APP_NAME = "پالس اپ";
const APP_VERSION = "1.0.0";

const SUPPORT_PHONE = "09133984340";
const RUBIKA_URL = "https://web.rubika.ir/#c=u0I694z06ef3f234f2ae3275cf100ed3";

const CLUB_TYPES = [
    "باشگاه ورزشی",
    "باشگاه رزمی",
    "باشگاه بدنسازی",
    "آموزشگاه زبان",
    "آموزشگاه کنکور",
    "آموزشگاه هنری",
    "آموزشگاه موسیقی",
    "آموزشگاه رقص",
    "آموزشگاه کامپیوتر",
    "مدرسه",
    "مهدکودک",
    "مرکز آموزشی دیگر",
];

function phoneToEmail(phone) {
    const clean = phone.replace(/[^0-9]/g, '');
    return `${clean}@pulse.local`;
}

function toEnglishDigits(str) {
    const persian = '۰۱۲۳۴۵۶۷۸۹';
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return str
        .replace(/[۰-۹]/g, d => persian.indexOf(d))
        .replace(/[٠-٩]/g, d => arabic.indexOf(d));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.className = 'toast';
    if (type === 'error') toast.classList.add('error');
    if (type === 'success') toast.classList.add('success');

    const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
