import { showErrMsg, hideErrMsg, showInvalidMark, showOkMark, allowSubmittion, preventSubmittion, errDefaultColor } from "./forms.js";

export class FormValidator {
    constructor(form) {
        this.form = form;
    }

    // Universal empty input validator
    validateRequired(input, errDiv, checkDiv, fieldName = "Field") {
        const value = input.value.trim();
        if (value.length === 0) {
            this.showError(input, errDiv, `${fieldName} cannot be empty!`, checkDiv);
            return false;
        }
        this.clearError(input, errDiv, checkDiv);
        return true;
    }

    isCyrillic(text) {
        return /^[А-Яа-яЁё\s\-]+$/.test(text);
    }

    isLatin(text) {
        return /^[A-Za-z\s\-]+$/.test(text);
    }

    getValidationRules(input) {
        const v = input.value.trim();
        const inputName = input.getAttribute("name");
        let rules = [];

        if (inputName === "name") {
            const parts = v.split(/\s+/); // Split by whitespace
            const alphabet = this.isCyrillic(v) ? "cyrillic" : this.isLatin(v) ? "latin" : null;
            const regex = alphabet === "cyrillic"
                ? /^[А-Я][а-я]{2,19}$/
                : /^[A-Z][a-z]{2,19}$/;

            rules = [
                { test: parts.length >= 2, msg: "Please enter both first and last names!" },
                { test: alphabet !== null, msg: "Please use only Cyrillic or Latin letters, not both!" },
                {
                    test: parts.every(part => {
                        return part.split("-").every(sub =>
                            sub.length >= 3 &&
                            sub.length <= 20 &&
                            regex.test(sub)
                        );
                    }),
                    msg: `Each name part must be 3–20 characters, start uppercase, followed by lowercase (${alphabet}).`
                }
            ];
        }
        else if (inputName === "email") {
            const basicEmailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

            // Specific email rules
            const hasAtSign = v.includes("@");
            const [local = "", domain = ""] = v.split("@");
            const localValid = /^[A-Za-z0-9._%+-]+$/.test(local);
            const domainValid = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain);
            const localHasCyrillic = /[\u0400-\u04FF]/.test(local);
            const domainHasCyrillic = /[\u0400-\u04FF]/.test(domain);
            const hasSpaces = /\s/.test(v);
            const hasConsecutiveDots = /\.\./.test(v);
            const startsOrEndsWithDot = v.startsWith(".") || v.endsWith(".");
            const localStartsOrEndsWithDot = local.startsWith(".") || local.endsWith(".");
            const domainStartsOrEndsWithDot = domain.startsWith(".") || domain.endsWith(".");
            const hasSingleAt = (v.match(/@/g) || []).length === 1;
            const domainHasDot = domain.includes(".");
            const tld = domain.split(".").pop() || "";
            const tldValidLength = tld.length >= 2;

            rules = [
                { test: v.length > 0, msg: "Email address cannot be empty!" },
                { test: !localHasCyrillic && !domainHasCyrillic, msg: "Email address cannot contain Cyrillic characters!" },
                { test: hasSingleAt, msg: "Email address must contain exactly one '@' symbol!" },
                { test: hasAtSign && local.length > 0 && domain.length > 0, msg: "Email must have local part and domain (e.g., user@example.com)!" },
                { test: localValid, msg: "Local part contains invalid characters!" },
                { test: !hasSpaces, msg: "Email address cannot contain spaces!" },
                { test: !hasConsecutiveDots, msg: "Email address cannot contain consecutive dots ('..')!" },
                { test: !startsOrEndsWithDot, msg: "Email address cannot start or end with a dot ('.')!" },
                { test: !localStartsOrEndsWithDot, msg: "Local part cannot start or end with a dot ('.')!" },
                { test: !domainStartsOrEndsWithDot, msg: "Domain cannot start or end with a dot ('.')!" },
                { test: domainHasDot, msg: "Domain must contain a dot (e.g., example.com)!" },
                { test: !/_/.test(domain), msg: "Domain cannot contain underscores ('_')!" },
                { test: domainValid, msg: "Domain part contains invalid characters!" },
                { test: tldValidLength, msg: "Top-level domain must be at least 2 characters (e.g., .com, .bg)!" },
                { test: v.length <= 200, msg: "Email address is too long (max 200 characters)!" },
                { test: basicEmailRegex.test(v), msg: "Please enter a valid email address!" }
            ];

        }
        else if (inputName === "password") {
            rules = [
                { test: v.length >= 8, msg: "Password must be at least 8 characters long!" },
                { test: /[A-Z]/.test(v), msg: "Password must contain at least one uppercase letter!" },
                { test: /[a-z]/.test(v), msg: "Password must contain at least one lowercase letter!" },
                { test: /[0-9]/.test(v), msg: "Password must contain at least one digit!" },
                { test: /[!@#$%^&*(),.?\":{}|<>]/.test(v), msg: "Password must contain at least one special character!" },
                { test: v.length <= 50, msg: "Password cannot be longer than 50 characters!" }
            ];
        }
        else if (inputName === "captcha") {
            rules = [
                { test: v.length === 6, msg: "Captcha code must be 6 characters long!" },
                { test: /^[A-Za-z0-9]+$/.test(v), msg: "Captcha code must contain only letters and digits!" }
            ];
        }

        return rules;
    }

    validateWithRules(input, errDiv, checkDiv, color = errDefaultColor) {
        const rules = this.getValidationRules(input);
        for (const rule of rules) {
            if (!rule.test) {
                this.showError(input, errDiv, rule.msg, checkDiv, color);
                return false;
            }
        }
        this.clearError(input, errDiv, checkDiv);
        return true;
    }
    // Helper functions for error messages
    showError(input, errDiv, message, checkDiv, color = errDefaultColor) {
        showErrMsg(errDiv, message, color);
        preventSubmittion();
        if (input) input.setCustomValidity(message);
        if (checkDiv) showInvalidMark(checkDiv);
    }
    clearError(input, errDiv, checkDiv) {
        hideErrMsg(errDiv);
        allowSubmittion();
        if (input) input.setCustomValidity(""); // Reset custom validity
        if (checkDiv) showOkMark(checkDiv);
    }
}