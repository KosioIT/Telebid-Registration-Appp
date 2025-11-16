import { FormValidator } from "./validator.js";
import { getSharedElements } from "./forms.js";

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements shared between all forms
    const {
        emailCheck, passwordCheck,
        emailErr, passwordErr,
        emailInput, passwordInput,
        currForm
    } = getSharedElements();

    const validator = new FormValidator(currForm);

    emailInput.addEventListener("input", () => {
        validator.validateWithRules(emailInput, emailErr, emailCheck);
    });

    passwordInput.addEventListener("input", () => {
        validator.validateRequired(passwordInput, passwordErr, passwordCheck, "Password");
    });
});