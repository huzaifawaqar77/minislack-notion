/**
 * Parses user agent string to extract device information
 * 
 * @param userAgent - The user agent string from the request
 * @returns Object containing device information
 */
export function parseUserAgent(userAgent: string) {
  // Basic parsing of user agent string
  const deviceInfo: any = {
    userAgent: userAgent,
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    device: detectDevice(userAgent),
    isMobile: isMobileDevice(userAgent),
    isTablet: isTabletDevice(userAgent),
    isDesktop: !isMobileDevice(userAgent) && !isTabletDevice(userAgent),
  };

  return deviceInfo;
}

/**
 * Detects the browser from user agent string
 */
function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('firefox')) {
    return 'Firefox';
  } else if (ua.includes('edg')) {
    return 'Edge';
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    return 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    return 'Internet Explorer';
  } else {
    return 'Unknown';
  }
}

/**
 * Detects the operating system from user agent string
 */
function detectOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) {
    return 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    return 'macOS';
  } else if (ua.includes('linux') && !ua.includes('android')) {
    return 'Linux';
  } else if (ua.includes('android')) {
    return 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'iOS';
  } else {
    return 'Unknown';
  }
}

/**
 * Detects the device type from user agent string
 */
function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('iphone')) {
    return 'iPhone';
  } else if (ua.includes('ipad')) {
    return 'iPad';
  } else if (ua.includes('android') && ua.includes('mobile')) {
    return 'Android Phone';
  } else if (ua.includes('android') && !ua.includes('mobile')) {
    return 'Android Tablet';
  } else if (ua.includes('windows') && (ua.includes('touch') || ua.includes('tablet'))) {
    return 'Windows Tablet';
  } else if (ua.includes('macintosh') || ua.includes('windows') || ua.includes('linux')) {
    return 'Desktop';
  } else {
    return 'Unknown';
  }
}

/**
 * Checks if the device is mobile
 */
function isMobileDevice(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return ua.includes('mobile') || ua.includes('iphone') || (ua.includes('android') && ua.includes('mobile'));
}

/**
 * Checks if the device is a tablet
 */
function isTabletDevice(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return ua.includes('ipad') || 
         (ua.includes('android') && !ua.includes('mobile')) || 
         (ua.includes('windows') && (ua.includes('touch') || ua.includes('tablet')));
}

/**
 * Gets client IP address from request
 * 
 * @param req - Express request object
 * @returns IP address string
 */
export function getClientIp(req: any): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list of IPs
    // The client's IP is the first one in the list
    const ips = forwardedFor.split(',').map((ip: string) => ip.trim());
    return ips[0];
  }
  
  // Try other common headers
  return req.headers['x-real-ip'] || 
         req.headers['x-client-ip'] || 
         req.headers['cf-connecting-ip'] || // Cloudflare
         req.connection.remoteAddress || 
         '0.0.0.0';
}
