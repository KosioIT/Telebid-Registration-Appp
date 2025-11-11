export function generateCaptchaText(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // without confusing chars
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

export function generateCaptchaSVG(text) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="50">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-size="24" font-family="Arial" fill="#333">${text}</text>
    </svg>
  `;
}
