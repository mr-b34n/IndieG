export function formatTimeAgo(
    timeAgo: string | undefined | null,
    t?: (key: string, options?: Record<string, unknown>) => string
): string {
    const translate = t || ((key: string, options?: Record<string, unknown>) => (options?.defaultValue as string) || key);

    if (!timeAgo) return translate('time.justNow', { defaultValue: translate('feed.justNow', { defaultValue: 'Just now' }) });

    // Try parsing as ISO date
    const date = new Date(timeAgo);
    if (!isNaN(date.getTime()) && timeAgo.includes('T') && timeAgo.includes('Z')) {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return translate('time.justNow', { defaultValue: translate('feed.justNow', { defaultValue: 'Just now' }) });
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return translate('time.minutesAgo', { count: minutes, defaultValue: `${minutes} minute${minutes > 1 ? 's' : ''} ago` });
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return translate('time.hoursAgo', { count: hours, defaultValue: `${hours} hour${hours > 1 ? 's' : ''} ago` });
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return translate('time.daysAgo', { count: days, defaultValue: `${days} day${days > 1 ? 's' : ''} ago` });
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return translate('time.monthsAgo', { count: months, defaultValue: `${months} month${months > 1 ? 's' : ''} ago` });
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return translate('time.yearsAgo', { count: years, defaultValue: `${years} year${years > 1 ? 's' : ''} ago` });
        }
    }

    const lower = timeAgo.toLowerCase().trim();

    if (lower === 'vừa xong' || lower === 'just now' || lower.includes('vừa xong') || lower.includes('just now')) {
        return translate('time.justNow', { defaultValue: translate('feed.justNow', { defaultValue: 'Just now' }) });
    }

    // Match numbers and units (minute, hour, day, month, year)
    const match = timeAgo.match(/(\d+)\s*(giờ|giờ|hours|hour|phút|phút|minutes|minute|mins|min|ngày|ngày|days|day|tháng|tháng|months|month|năm|years|year)\s*(trước|ago)?/i);
    if (match) {
        const num = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        if (unit.startsWith('giờ') || unit.startsWith('giờ') || unit.startsWith('hour')) {
            return translate('time.hoursAgo', { count: num, defaultValue: `${num} hours ago` });
        }
        if (unit.startsWith('phút') || unit.startsWith('phút') || unit.startsWith('min')) {
            return translate('time.minutesAgo', { count: num, defaultValue: `${num} mins ago` });
        }
        if (unit.startsWith('ngày') || unit.startsWith('ngày') || unit.startsWith('day')) {
            return translate('time.daysAgo', { count: num, defaultValue: `${num} days ago` });
        }
        if (unit.startsWith('tháng') || unit.startsWith('tháng') || unit.startsWith('month')) {
            return translate('time.monthsAgo', { count: num, defaultValue: `${num} months ago` });
        }
        if (unit.startsWith('năm') || unit.startsWith('year')) {
            return translate('time.yearsAgo', { count: num, defaultValue: `${num} years ago` });
        }
    }

    return timeAgo;
}
