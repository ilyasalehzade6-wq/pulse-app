const fs = require('fs');
const path = require('path');

console.log('🔌 در حال اتصال طراحی جدید به دیتابیس و کدهای اصلی...\n');

const newIndexHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>پالس مدیریت — داشبورد</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        bgBase: '#fafafa', bgCard: '#ffffff', bgSidebar: '#ffffff',
                        borderBase: '#e4e4e7', textMain: '#18181b', textMuted: '#71717a',
                        accentGold: '#d97706', darkBase: '#09090b', darkCard: '#121215',
                        darkSidebar: '#121215', darkBorder: '#27272a', darkTextMain: '#ffffff',
                        darkTextMuted: '#a1a1aa', darkAccent: '#f59e0b',
                    }
                }
            }
        }
    </script>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { font-family: 'Vazirmatn', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #a1a1aa; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #27272a; }
        .banner-pattern { background-image: radial-gradient(currentColor 1px, transparent 1px); background-size: 24px 24px; opacity: 0.04; }
    </style>
</head>
<body class="bg-bgBase dark:bg-darkBase text-textMain dark:text-darkTextMain h-screen flex overflow-hidden antialiased transition-colors duration-300">

    <!-- Loading Overlay -->
    <div id="loading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bgBase dark:bg-darkBase transition-colors duration-300">
        <div class="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p class="text-textMuted dark:text-darkTextMuted text-sm font-medium">در حال بارگذاری اطلاعات...</p>
    </div>

    <!-- Sidebar (RTL) -->
    <aside class="w-64 bg-bgSidebar dark:bg-darkSidebar border-l border-borderBase dark:border-darkBorder flex flex-col p-4 z-20 shrink-0 hidden md:flex h-full transition-colors duration-300">
        <div class="flex items-center gap-3 px-2 mb-8 mt-2">
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                <i data-lucide="activity" class="w-5 h-5 text-amber-600 dark:text-amber-500 stroke-[1.5]"></i>
            </div>
            <span class="font-bold text-lg tracking-tight">پالس مدیریت</span>
        </div>
        
        <nav class="flex-1 space-y-1.5">
            <button onclick="switchPage('dashboard')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold border-r-2 border-amber-600 dark:border-r-0 transition-colors nav-item" data-page="dashboard">
                <i data-lucide="layout-dashboard" class="w-5 h-5 stroke-[2]"></i>
                داشبورد
            </button>
            <button onclick="switchPage('members')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="members">
                <i data-lucide="users" class="w-5 h-5 stroke-[1.5]"></i>
                اعضا
            </button>
            <button onclick="switchPage('finance')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="finance">
                <i data-lucide="wallet" class="w-5 h-5 stroke-[1.5]"></i>
                امور مالی
            </button>
            <button onclick="switchPage('chat')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="chat">
                <i data-lucide="message-square" class="w-5 h-5 stroke-[1.5]"></i>
                پیام‌رسان
            </button>
            <button onclick="switchPage('attendance')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="attendance">
                <i data-lucide="check-square" class="w-5 h-5 stroke-[1.5]"></i>
                حضور و غیاب
            </button>
            <button onclick="switchPage('reports')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="reports">
                <i data-lucide="file-text" class="w-5 h-5 stroke-[1.5]"></i>
                گزارش‌ها
            </button>
            <button onclick="switchPage('settings')" class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-textMuted dark:text-darkTextMuted hover:text-textMain dark:hover:text-darkTextMain hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium transition-colors nav-item" data-page="settings">
                <i data-lucide="settings" class="w-5 h-5 stroke-[1.5]"></i>
                تنظیمات
            </button>
        </nav>
        
        <div class="mt-auto pt-4 border-t border-borderBase dark:border-darkBorder">
            <div class="flex items-center gap-3 px-2 cursor-pointer group" onclick="logout()">
                <div id="userAvatar" class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-textMain dark:text-darkTextMain border border-borderBase dark:border-darkBorder group-hover:border-zinc-300 dark:group-hover:border-zinc-600 transition-colors">
                    ?
                </div>
                <div class="flex flex-col">
                    <span id="userName" class="text-sm font-medium group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">...</span>
                    <span class="text-xs text-textMuted dark:text-darkTextMuted">مدیر باشگاه (خروج)</span>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Layout -->
    <div class="flex-1 flex flex-col min-w-0 h-full relative">
        
        <!-- Top Bar -->
        <header class="bg-bgCard dark:bg-[#111111] border-b border-borderBase dark:border-darkBorder h-[72px] flex items-center justify-between px-6 md:px-8 z-10 shrink-0 transition-colors duration-300">
            <div>
                <h1 id="greeting" class="text-xl font-bold tracking-tight">...</h1>
                <p class="text-textMuted dark:text-darkTextMuted text-xs mt-0.5" id="clubInfo">...</p>
            </div>
            <div class="flex items-center gap-3">
                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" class="p-2 rounded-lg bg-bgBase dark:bg-darkBase border border-borderBase dark:border-darkBorder text-textMuted dark:text-darkTextMuted hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                    <i data-lucide="sun" class="w-5 h-5 hidden dark:block stroke-[1.5]"></i>
                    <i data-lucide="moon" class="w-5 h-5 block dark:hidden stroke-[1.5]"></i>
                </button>
                <!-- Primary CTA -->
                <button onclick="switchPage('attendance')" class="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                    <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                    ثبت حضور
                </button>
            </div>
        </header>

        <!-- Scrollable Content -->
        <main class="flex-1 overflow-y-auto p-6 md:p-8 transition-colors duration-300">
            
            <!-- Dashboard Content Wrapper -->
            <div id="dashboardContent">
                <!-- Hero Banner -->
                <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#121215] border border-amber-200 dark:border-darkBorder p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-md dark:shadow-lg dark:shadow-black/40 transition-colors duration-300">
                    <div class="absolute inset-0 bg-gradient-to-l from-amber-50/60 to-white dark:from-transparent dark:to-transparent pointer-events-none"></div>
                    <div class="absolute inset-0 banner-pattern text-amber-500 pointer-events-none dark:opacity-[0.03]"></div>
                    
                    <div class="relative z-10 flex-1 w-full text-right">
                        <div class="flex items-center gap-2 mb-3 justify-start">
                            <span id="subscriptionBadge" class="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">دوره رایگان</span>
                            <span class="text-textMuted dark:text-darkTextMuted text-sm font-medium">اشتراک پالس</span>
                        </div>
                        <h2 class="text-2xl font-semibold tracking-tight leading-relaxed text-zinc-800 dark:text-zinc-200 mb-6">
                            شما <span id="daysLeftPercent" class="text-4xl font-bold text-amber-600 dark:text-amber-500 mx-1">۰</span> روز <span class="text-amber-600 dark:text-amber-500">طلایی</span> در پیش دارید
                        </h2>
                        
                        <div class="w-full max-w-xl ml-auto">
                            <div class="flex justify-between text-xs text-textMuted dark:text-darkTextMuted mb-2 font-mono">
                                <span>مصرف شده</span>
                                <span id="daysLeftText">...</span>
                            </div>
                            <div class="h-3 w-full bg-zinc-200 dark:bg-[#09090b] rounded-full overflow-hidden border border-transparent dark:border-darkBorder">
                                <div id="progressFill" class="h-full bg-amber-500 rounded-full w-[0%] relative transition-all duration-1000">
                                    <div class="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                                </div>
                            </div>
                            <div class="text-left mt-2 text-xs text-textMuted dark:text-darkTextMuted font-mono" id="subscriptionEndText">...</div>
                        </div>
                    </div>
                    
                    <div class="relative z-10 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        <button onclick="contactSupport()" class="w-full md:w-auto justify-center bg-white dark:bg-[#09090b] hover:bg-amber-50 dark:hover:bg-[#18181b] text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/30 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
                            <i data-lucide="crown" class="w-4 h-4"></i>
                            تمدید اشتراک
                        </button>
                    </div>
                </div>

                <!-- Stat Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                            <i data-lucide="users" class="w-6 h-6 text-amber-600 dark:text-amber-500 stroke-[1.5]"></i>
                        </div>
                        <div>
                            <p class="text-sm text-textMuted dark:text-darkTextMuted font-medium mb-1">کل اعضا</p>
                            <h3 id="totalMembers" class="text-2xl font-bold tracking-tight font-mono">۰</h3>
                        </div>
                    </div>
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                            <i data-lucide="user-plus" class="w-6 h-6 text-amber-600 dark:text-amber-500 stroke-[1.5]"></i>
                        </div>
                        <div>
                            <p class="text-sm text-textMuted dark:text-darkTextMuted font-medium mb-1">اعضای این ماه</p>
                            <h3 id="newMembers" class="text-2xl font-bold tracking-tight font-mono">۰</h3>
                        </div>
                    </div>
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                            <i data-lucide="wallet" class="w-6 h-6 text-amber-600 dark:text-amber-500 stroke-[1.5]"></i>
                        </div>
                        <div>
                            <p class="text-sm text-textMuted dark:text-darkTextMuted font-medium mb-1">درآمد این ماه</p>
                            <h3 id="monthIncome" class="text-2xl font-bold tracking-tight font-mono">۰</h3>
                        </div>
                    </div>
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                            <i data-lucide="clock" class="w-6 h-6 text-amber-600 dark:text-amber-500 stroke-[1.5]"></i>
                        </div>
                        <div>
                            <p class="text-sm text-textMuted dark:text-darkTextMuted font-medium mb-1">اقساط معلق</p>
                            <h3 id="unpaidInstallments" class="text-2xl font-bold tracking-tight font-mono">۰</h3>
                        </div>
                    </div>
                </div>

                <!-- Bottom Actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-xl p-5 flex items-center justify-between group shadow-sm hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer" onclick="downloadDesktop()">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-bgBase dark:bg-[#09090b] border border-borderBase dark:border-darkBorder flex items-center justify-center text-textMuted dark:text-darkTextMuted group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                <i data-lucide="download" class="w-5 h-5 stroke-[1.5]"></i>
                            </div>
                            <div>
                                <span class="font-bold text-sm block">نسخه دسکتاپ</span>
                                <span class="text-xs text-textMuted dark:text-darkTextMuted block mt-0.5">نرم‌افزار مدیریت</span>
                            </div>
                        </div>
                        <button class="text-xs border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 px-4 py-2 rounded-lg transition-all font-bold">دریافت</button>
                    </div>
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-xl p-5 flex items-center justify-between group shadow-sm hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer" onclick="copyPortalLink()">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-bgBase dark:bg-[#09090b] border border-borderBase dark:border-darkBorder flex items-center justify-center text-textMuted dark:text-darkTextMuted group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                <i data-lucide="link" class="w-5 h-5 stroke-[1.5]"></i>
                            </div>
                            <div>
                                <span class="font-bold text-sm block">پورتال اعضا</span>
                                <span class="text-xs text-textMuted dark:text-darkTextMuted block mt-0.5">اشتراک‌گذاری لینک</span>
                            </div>
                        </div>
                        <button class="text-xs border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 px-4 py-2 rounded-lg transition-all font-bold">کپی</button>
                    </div>
                    <div class="bg-bgCard dark:bg-darkCard border border-borderBase dark:border-darkBorder rounded-xl p-5 flex items-center justify-between group shadow-sm hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer" onclick="contactSupport()">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-bgBase dark:bg-[#09090b] border border-borderBase dark:border-darkBorder flex items-center justify-center text-textMuted dark:text-darkTextMuted group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                <i data-lucide="headphones" class="w-5 h-5 stroke-[1.5]"></i>
                            </div>
                            <div>
                                <span class="font-bold text-sm block">پشتیبانی</span>
                                <span class="text-xs text-textMuted dark:text-darkTextMuted block mt-0.5">ارتباط با ما</span>
                            </div>
                        </div>
                        <button class="text-xs border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 px-4 py-2 rounded-lg transition-all font-bold">چت</button>
                    </div>
                </div>
            </div>

            <!-- Placeholders for other pages (to prevent switchPage errors) -->
            <div id="membersContent" style="display: none;"></div>
            <div id="attendanceContent" style="display: none;"></div>
            <div id="financeContent" style="display: none;"></div>
            <div id="reportsContent" style="display: none;"></div>
            <div id="settingsContent" style="display: none;"></div>
            <div id="chatContent" style="display: none;"></div>

        </main>
    </div>

    <!-- Scripts -->
    <script>
        // Theme Toggle Logic
        function toggleTheme() {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('pulse_theme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('pulse_theme', 'dark');
            }
        }
        // Apply saved theme on load
        if (localStorage.getItem('pulse_theme') === 'light') {
            document.documentElement.classList.remove('dark');
        }
    </script>
    <script src="js/license-utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/config.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/members.js"></script>
    <script src="js/attendance.js"></script>
    <script src="js/finance.js"></script>
    <script src="js/reports.js"></script>
    <script src="js/settings.js"></script>
    
    <script>
        // Initialize Lucide Icons
        lucide.createIcons();
    </script>
</body>
</html>`;

try {
    const indexPath = path.join(__dirname, 'index.html');
    fs.writeFileSync(indexPath, newIndexHtml, 'utf8');
    console.log('✅ فایل index.html با موفقیت به روز شد و به کدهای اصلی متصل شد.');
} catch (err) {
    console.error('❌ خطا در بازنویسی index.html:', err.message);
}