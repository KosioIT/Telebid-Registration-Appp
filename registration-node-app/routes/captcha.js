import { generateCaptchaText, generateCaptchaSVG } from '../utils/captcha.js';

export function handleCaptcha(req, res) {
  const captcha = generateCaptchaText();
  req.session.captcha = captcha;

  // Debug: see session id and value
  console.log('Captcha SID:', req.sessionID);
  console.log('Set captcha:', req.session.captcha);

  const svg = generateCaptchaSVG(captcha);
  res.set('Cache-Control', 'no-store');  // avoid caching old images
  res.type('svg').send(svg);
}
