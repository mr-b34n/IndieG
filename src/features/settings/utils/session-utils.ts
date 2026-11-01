import {
    faGlobe,
    faGamepad,
    faLaptopCode,
    faMobileScreen,
} from '@fortawesome/free-solid-svg-icons';
import {
    faChrome,
    faFirefoxBrowser,
    faSafari,
    faEdge,
    faOpera,
    faApple,
    faWindows,
    faLinux,
    faAndroid,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { UserSessionDto } from '@/shared/api/types';

export function parseSessionDeviceInfo(
    sessionOrUa?: Partial<UserSessionDto> | string | null,
    legacyDevice?: string
): {
    name: string;
    browser: string;
    os: string;
    device: string;
    isMobile: boolean;
    browserIcon: IconDefinition;
    osIcon: IconDefinition;
    icon: IconDefinition;
} {
    let uaString = '';
    let rawDevice = '';
    let rawBrowser = '';
    let rawOs = '';

    if (typeof sessionOrUa === 'string') {
        uaString = sessionOrUa;
        rawDevice = legacyDevice || '';
    } else if (sessionOrUa && typeof sessionOrUa === 'object') {
        uaString = sessionOrUa.userAgent || '';
        rawDevice = sessionOrUa.device || legacyDevice || '';
        rawBrowser = sessionOrUa.browser || '';
        rawOs = sessionOrUa.os || '';
    } else if (legacyDevice) {
        rawDevice = legacyDevice;
    }

    const ua = (uaString || '').toLowerCase();

    // 1. Detect or use OS
    let os = rawOs.trim();
    let isMobile = false;

    if (!os) {
        if (ua.includes('ipad')) {
            os = 'iPadOS';
            isMobile = true;
        } else if (ua.includes('iphone')) {
            os = 'iOS';
            isMobile = true;
        } else if (ua.includes('android')) {
            os = 'Android';
            isMobile = true;
        } else if (ua.includes('windows nt 10.0') || ua.includes('windows nt 11.0') || ua.includes('windows')) {
            os = 'Windows';
        } else if (ua.includes('macintosh') || ua.includes('mac os')) {
            os = 'macOS';
        } else if (ua.includes('steamos') || ua.includes('steam deck')) {
            os = 'SteamOS';
        } else if (ua.includes('ubuntu')) {
            os = 'Ubuntu';
        } else if (ua.includes('linux')) {
            os = 'Linux';
        } else if (rawDevice && !['desktop', 'mobile'].includes(rawDevice.toLowerCase())) {
            os = rawDevice;
        }
    }

    const osLower = os.toLowerCase();
    const devLower = (rawDevice || '').toLowerCase();
    if (
        osLower.includes('ios') ||
        osLower.includes('iphone') ||
        osLower.includes('ipad') ||
        osLower.includes('android') ||
        devLower.includes('mobile') ||
        devLower.includes('iphone') ||
        devLower.includes('android') ||
        ua.includes('mobile') ||
        ua.includes('phone')
    ) {
        isMobile = true;
    }

    // 2. Detect or use Browser with major version
    let browser = rawBrowser.trim();
    if (!browser) {
        const edgeMatch = uaString.match(/Edg\/(\d+)/i);
        const operaMatch = uaString.match(/(?:OPR|Opera)\/(\d+)/i);
        const chromeMatch = uaString.match(/Chrome\/(\d+)/i);
        const firefoxMatch = uaString.match(/Firefox\/(\d+)/i);
        const safariMatch = uaString.match(/Version\/(\d+).*Safari/i);

        if (edgeMatch) {
            browser = `Edge ${edgeMatch[1]}`;
        } else if (operaMatch) {
            browser = `Opera ${operaMatch[1]}`;
        } else if (chromeMatch && !ua.includes('chromium')) {
            browser = `Chrome ${chromeMatch[1]}`;
        } else if (firefoxMatch) {
            browser = `Firefox ${firefoxMatch[1]}`;
        } else if (safariMatch) {
            browser = `Safari ${safariMatch[1]}`;
        } else if (ua.includes('ludon mobile') || ua.includes('ludon app') || ua.includes('indieg mobile') || ua.includes('indieg app')) {
            browser = 'Ludon App';
            isMobile = true;
        } else if (ua.includes('chrome')) {
            browser = 'Chrome';
        } else if (ua.includes('safari')) {
            browser = 'Safari';
        } else if (ua.includes('firefox')) {
            browser = 'Firefox';
        }
    }

    // 3. Device string
    let device = rawDevice.trim();
    if (!device) {
        if (ua.includes('iphone')) {
            device = 'iPhone';
        } else if (ua.includes('ipad')) {
            device = 'iPad';
        } else if (ua.includes('android')) {
            device = 'Android Device';
        } else {
            device = isMobile ? 'Mobile' : 'Desktop';
        }
    }

    // 4. Construct clean combined device label (e.g., "Chrome 153 · Linux" or "Safari · iPhone")
    let name: string;
    if (browser && os) {
        if ((os === 'iOS' || os.toLowerCase().includes('iphone')) && device === 'iPhone') {
            name = `${browser} · iPhone`;
        } else {
            name = `${browser} · ${os}`;
        }
    } else if (browser) {
        name = browser;
    } else if (os) {
        name = os;
    } else if (rawDevice && !['desktop', 'mobile'].includes(rawDevice.toLowerCase())) {
        name = rawDevice;
    } else {
        name = 'Unknown device';
    }

    // 5. Select icons
    let browserIcon: IconDefinition = faGlobe;
    const bLower = browser.toLowerCase();
    if (bLower.includes('chrome')) browserIcon = faChrome;
    else if (bLower.includes('firefox')) browserIcon = faFirefoxBrowser;
    else if (bLower.includes('safari')) browserIcon = faSafari;
    else if (bLower.includes('edge') || bLower.includes('edg')) browserIcon = faEdge;
    else if (bLower.includes('opera') || bLower.includes('opr')) browserIcon = faOpera;

    let osIcon: IconDefinition = isMobile ? faMobileScreen : faLaptopCode;
    if (osLower.includes('windows')) osIcon = faWindows;
    else if (osLower.includes('mac') || osLower.includes('ios') || osLower.includes('iphone') || osLower.includes('ipad') || osLower.includes('apple')) osIcon = faApple;
    else if (osLower.includes('linux') || osLower.includes('ubuntu')) osIcon = faLinux;
    else if (osLower.includes('android')) osIcon = faAndroid;
    else if (osLower.includes('steam')) osIcon = faGamepad;

    // Primary compact device/browser icon
    const icon: IconDefinition = isMobile ? faMobileScreen : browserIcon !== faGlobe ? browserIcon : osIcon;

    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'browser' = 'desktop';
    if (isMobile) {
        deviceType = (ua.includes('ipad') || osLower.includes('ipad') || (rawDevice && rawDevice.toLowerCase().includes('tablet'))) ? 'tablet' : 'mobile';
    } else if (browser && !os) {
        deviceType = 'browser';
    }

    return {
        name,
        browser,
        os,
        device,
        isMobile,
        deviceType,
        browserIcon,
        osIcon,
        icon,
    };
}

export function formatSessionDateTime(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

export function formatSessionDateOnly(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

export function getCurrentSessionTokenId(): string | null {
    if (typeof window === 'undefined') return null;
    const token =
        localStorage.getItem('indieg_refresh_token') ||
        localStorage.getItem('refresh_token') ||
        localStorage.getItem('indieg_access_token') ||
        localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.tokenId || payload.sessionId || payload.sid || payload.id || null;
    } catch {
        return null;
    }
}
