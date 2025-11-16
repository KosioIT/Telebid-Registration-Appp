import { FormValidator } from "./validator.js";
import { getSharedElements } from "./forms.js";

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements shared between all forms
    const {
        nameCheck, emailCheck, passwordCheck,
        nameErr, emailErr, passwordErr, captchaErr,
        nameInput, passwordInput, emailInput,
        currForm
    } = getSharedElements();

    const validator = new FormValidator(currForm);

    nameInput.addEventListener("input", () => {
        if (!validator.validateRequired(nameInput, nameErr, nameCheck, "Name")) return;
        validator.validateWithRules(nameInput, nameErr, nameCheck);
    });

    emailInput.addEventListener("input", () => {
        validator.validateWithRules(emailInput, emailErr, emailCheck);
    });

    // Listener за парола
    passwordInput.addEventListener("input", () => {
        validator.validateWithRules(passwordInput, passwordErr, passwordCheck);
    });

    // Listener за captcha
    const captchaInput = document.querySelector('input[name="captcha"]');
    captchaInput.addEventListener("input", () => {
        validator.validateWithRules(captchaInput, captchaErr, null);
    });

    const refreshCaptchaBtn = document.getElementById("refresh-btn");
    refreshCaptchaBtn.addEventListener('click', () => {
        const captchaImg = document.getElementById("captcha-img");
        captchaImg.src = "/captcha.svg?" + Date.now(); // Append timestamp to avoid caching
    });
});
