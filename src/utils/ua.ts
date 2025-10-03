function parseUserAgent(ua: string) {
  // Detecta navegador y versión
  const browserMatch = ua.match(/(Edg|Chrome|Firefox|Safari)\/([\d.]+)/g);
  let browser = 'Desconocido';
  let version = '0.0.0.0';

  if (browserMatch) {
    const edge = browserMatch.find(b => b.startsWith('Edg/'));
    const chrome = browserMatch.find(b => b.startsWith('Chrome/'));
    const firefox = browserMatch.find(b => b.startsWith('Firefox/'));
    const safari = browserMatch.find(b => b.startsWith('Safari/'));

    if (edge) {
      browser = 'Edge';
      version = edge.split('/')[1];
    } else if (chrome) {
      browser = 'Chrome';
      version = chrome.split('/')[1];
    } else if (firefox) {
      browser = 'Firefox';
      version = firefox.split('/')[1];
    } else if (safari) {
      browser = 'Safari';
      version = safari.split('/')[1];
    }
  }

  // Detecta sistema operativo
  const osMatch = ua.match(/\(([^)]+)\)/);
  const osRaw = osMatch?.[1] || '';
  const os = osRaw.includes('Windows') ? 'Windows' :
             osRaw.includes('Mac OS X') ? 'macOS' :
             osRaw.includes('Android') ? 'Android' :
             osRaw.includes('Linux') ? 'Linux' :
             osRaw.includes('iPhone') || osRaw.includes('iPad') ? 'iOS' :
             'Desconocido';

  return { browser, version, os };
}

export {
  parseUserAgent
}