/**
 * 🔐 منطق ثبت‌نام و ورود
 */

let supabaseClient = null;

// ============================================================
// راه‌اندازی
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // شروع Supabase
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // تشخیص صفحه
    if (document.getElementById('signupForm')) {
        initSignupPage();
    } else if (document.getElementById('loginForm')) {
        initLoginPage();
    }
});

// ============================================================
// صفحه‌ی ثبت‌نام
// ============================================================
function initSignupPage() {
    // پر کردن Dropdown نوع مجموعه
    const clubTypeSelect = document.getElementById('clubType');
    if (clubTypeSelect) {
        CLUB_TYPES.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            clubTypeSelect.appendChild(option);
        });
    }

    // تنظیم فرم
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', handleSignup);

    // Input Validation
    setupPhoneInput('phone');
    setupPasswordToggle('password');
}

async function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = toEnglishDigits(document.getElementById('phone').value.trim());
    const password = document.getElementById('password').value;
    const clubName = document.getElementById('clubName').value.trim();
    const clubType = document.getElementById('clubType').value;

    const btn = document.getElementById('signupBtn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');

    // اعتبارسنجی
    if (firstName.length < 2) {
        return showError('نام باید حداقل ۲ حرف باشد');
    }
    if (lastName.length < 2) {
        return showError('نام خانوادگی باید حداقل ۲ حرف باشد');
    }
    if (!/^09[0-9]{9}$/.test(phone)) {
        return showError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
    }
    if (password.length < 6) {
        return showError('رمز عبور باید حداقل ۶ کاراکتر باشد');
    }
    if (clubName.length < 2) {
        return showError('نام مجموعه باید حداقل ۲ حرف باشد');
    }
    if (!clubType) {
        return showError('نوع مجموعه را انتخاب کنید');
    }

    // Loading
    btn.disabled = true;
    btnText.textContent = 'در حال ساخت حساب...';
    spinner.style.display = 'inline-block';

    try {
        // تبدیل شماره به ایمیل داخلی
        const email = phoneToEmail(phone);

        // ۱. ساخت کاربر در Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: `${firstName} ${lastName}`,
                    phone: phone,
                }
            }
        });

        if (authError) {
            // اگه کاربر قبلاً هست
            if (authError.message.includes('already registered')) {
                return showError('این شماره قبلاً ثبت شده است');
            }
            return showError('خطا در ساخت حساب: ' + authError.message);
        }

        // ۲. چک وجود Session (اگه Confirm email خاموشه، مستقیم لاگین می‌شه)
        if (!authData.session) {
            // اگه session نداره، یعنی ایمیل تایید لازم داره
            return showError('لطفاً ایمیل تأیید را چک کنید (مشکل در تنظیمات)');
        }

        // ۳. ساخت Gym در دیتابیس
        const { data: gymData, error: gymError } = await supabaseClient.rpc(
            'register_gym_owner',
            {
                p_phone: phone,
                p_full_name: `${firstName} ${lastName}`,
                p_club_name: clubName,
                p_club_type: clubType,
            }
        );

        if (gymError) {
            console.error('Gym creation error:', gymError);
            return showError('خطا در ساخت مجموعه: ' + gymError.message);
        }

        if (!gymData.success) {
            return showError(gymData.error || 'خطا در ساخت مجموعه');
        }

        // ۴. موفقیت
        showToast('✅ حساب شما ساخته شد!', 'success');
        btnText.textContent = '✅ خوش آمدید!';

        // ۵. هدایت به داشبورد
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);

    } catch (error) {
        console.error('Signup error:', error);
        showError('خطای غیرمنتظره: ' + error.message);
        btn.disabled = false;
        btnText.textContent = '🚀 ساخت حساب کاربری';
        spinner.style.display = 'none';
    }
}

// ============================================================
// صفحه‌ی ورود
// ============================================================
function initLoginPage() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);

    setupPhoneInput('phone');
}

async function handleLogin(event) {
    event.preventDefault();

    const phone = toEnglishDigits(document.getElementById('phone').value.trim());
    const password = document.getElementById('password').value;

    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');

    if (!/^09[0-9]{9}$/.test(phone)) {
        return showError('شماره موبایل نامعتبر است');
    }
    if (password.length < 6) {
        return showError('رمز عبور باید حداقل ۶ کاراکتر باشد');
    }

    // Loading
    btn.disabled = true;
    btnText.textContent = 'در حال ورود...';
    spinner.style.display = 'inline-block';

    try {
        const email = phoneToEmail(phone);

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            if (error.message.includes('Invalid login')) {
                return showError('شماره موبایل یا رمز عبور اشتباه است');
            }
            return showError('خطا در ورود: ' + error.message);
        }

        showToast('✅ خوش آمدید!', 'success');
        btnText.textContent = '✅ در حال انتقال...';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);

    } catch (error) {
        console.error('Login error:', error);
        showError('خطای غیرمنتظره: ' + error.message);
        btn.disabled = false;
        btnText.textContent = '🔑 ورود';
        spinner.style.display = 'none';
    }
}

// ============================================================
// Helper: نمایش خطا
// ============================================================
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    if (!errorMsg) return;

    errorMsg.textContent = '⚠️ ' + message;
    errorMsg.classList.add('show');

    const card = document.querySelector('.auth-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
}

// ============================================================
// Helper: Input شماره موبایل
// ============================================================
function setupPhoneInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', function () {
        // تبدیل اعداد فارسی
        let value = toEnglishDigits(this.value);
        // فقط اعداد
        value = value.replace(/[^0-9]/g, '');
        // حداکثر ۱۱ رقم
        if (value.length > 11) value = value.slice(0, 11);
        this.value = value;
    });
}

// ============================================================
// Helper: نمایش/مخفی رمز
// ============================================================
function setupPasswordToggle(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    // فعلاً غیرفعال
}
