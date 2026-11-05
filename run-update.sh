#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🚀 در حال اجرای اسکریپت آپدیت لوکال...${NC}"
echo -e "${CYAN}========================================${NC}\n"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js نصب نیست! لطفا ابتدا آن را نصب کنید.${NC}"
    exit 1
fi

node auto-update.js

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ تغییرات با موفقیت روی فایل‌های لوکال اعمال شد.${NC}"
    echo -e "${YELLOW}👀 برای مشاهده تغییرات، فایل را در مرورگر رفرش کنید.${NC}"
else
    echo -e "\n${YELLOW}❌ خطایی در اجرای اسکریپت رخ داد.${NC}"
fi

echo -e "\n${CYAN}========================================${NC}"
