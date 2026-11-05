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

    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 z-[2000] flex items-center gap-2 font-bold text-sm translate-y-20 opacity-0 bg-[#121215] border';
    if (type === 'error') toast.className += ' border-red-500/30 text-red-500 shadow-red-500/10';
    else if (type === 'success') toast.className += ' border-emerald-500/30 text-emerald-500 shadow-emerald-500/10';
    else toast.className += ' border-amber-500/30 text-amber-500 shadow-amber-500/10';

    const icons = { success: '', error: '', info: '' };
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3500);
}
