import { TokenManager } from "./utils/tokenManager.js";

// -- Shared elements --
function getSharedElements() {
    const action = window.location.pathname.split('/').pop().replace('.html', '');

    const forms = document.querySelectorAll("form");
    const currForm = Array.from(forms)[0];
    const allFormInputs = currForm.querySelectorAll("input");
    const formInputsArr = Array.from(allFormInputs);

    return {
        nameCheck: document.getElementById('name-check'),
        emailCheck: document.getElementById('email-check'),
        passwordCheck: document.getElementById('password-check'),
        allCheckmarks: document.querySelectorAll(".checkmark"),
        submitButtons: document.querySelectorAll(".submit-btn"),
        currSubmitBtn: Array.from(document.querySelectorAll(".submit-btn"))[0],
        forms,
        currForm,
        allFormInputs,
        nameInput: formInputsArr.find(input => input.name === "name"),
        emailInput: formInputsArr.find(input => input.name === "email"),
        passwordInput: formInputsArr.find(input => input.name === "password"),
        nameErr: document.getElementById('name-err'),
        emailErr: document.getElementById('email-err'),
        captchaErr: document.getElementById('captcha-err'),
        passwordErr: document.getElementById('password-err'),
        allErrDivs: document.querySelectorAll('.err'),
        formMsgDivs: document.querySelectorAll(".form-message"),
        currFormMsgDiv: Array.from(document.querySelectorAll(".form-message"))
            .find(div => div.classList.contains(action)),
        toggleButtons: document.querySelectorAll(".toggle-psw-btn")
    };
}

//Error message default color
const errDefaultColor = 'yellow';

// -- Event listeners -- 
// DOMContentLoaded event (only HTML content is loaded, i.e. without the resources)
document.addEventListener("DOMContentLoaded", () => {
    const {
        allCheckmarks, currForm, allFormInputs, allErrDivs, currFormMsgDiv, currSubmitBtn
    } = getSharedElements();

    preventSubmittion(currSubmitBtn); // Disable the submit button initially (on page load)

    for (let input of allFormInputs) {
        input.value = ''; // Clear all input fields initially
        input.addEventListener("blur", () => { // Blur (mouseout) event
            if (input.value.trim() === '') {
                preventSubmittion(currSubmitBtn);
            }
        });
    }

    for (let err of allErrDivs) {
        err.style.display = 'none'; // Hide all error divs (messages) initially
        err.style.color = errDefaultColor; // Set error messages color to default (yellow)
    }

    for (let check of allCheckmarks) {
        hideMark(check); // Hide all checkmarks initially
    }

    currFormMsgDiv.textContent = ''; // Clear the form message initially
    currFormMsgDiv.style.display = 'none'; // Hide form message

    if (!currForm.action.includes("profile")) { // We have a custom profile form
        // Form submit event
        currForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const formData = new FormData(currForm);
            const data = Object.fromEntries(formData.entries());
            console.log("form action: ", currForm.action);

            try {
                console.log("Sending data:", data);
                const response = await fetch(`${currForm.action}`, {
                    method: currForm.method,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(data)
                });
                const result = await response.json();
                console.log("Result:", result);

                showFormResultMessage(currFormMsgDiv, result);

                if (result.success && result.accessToken && result.refreshToken) {
                    TokenManager.setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
                    console.log("Access token:", TokenManager.getAccessToken());
                    console.log("Refresh token:", TokenManager.getRefreshToken());
                }

                if (result.redirectUrl) {
                    setTimeout(() => {
                        currFormMsgDiv.innerText = 'Redirecting...';
                        window.location.href = result.redirectUrl; // Redirect after 3.5 seconds (allow user to read the message)
                    }, 3500);
                }

            } catch (error) {
                console.error(error);
                currFormMsgDiv.innerText = 'Unexpected error occurred! Please try again!';
                currFormMsgDiv.className = 'form-message error';
            }
        });
    }
});

// Page load event (after all resources are loaded)
window.addEventListener("load", () => {
    // Setting toggle button background images (icons)
    const showIconUrl = "url('./assets/show-psw-icon.png')";
    const hideIconUrl = "url('./assets/hide-psw-icon.png')";

    const { toggleButtons } = getSharedElements();

    toggleButtons.forEach(btn => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);

        if (!input) return; // skip if target input not found

        btn.style.display = "none";
        btn.style.backgroundImage = showIconUrl;
        btn.title = "Show password";

        // Button click event
        btn.addEventListener("click", () => {
            if (input.type === "password") {
                input.type = "text";
                btn.style.backgroundImage = hideIconUrl;
                btn.title = "Hide password";
            } else {
                input.type = "password";
                btn.style.backgroundImage = showIconUrl;
                btn.title = "Show password";
            }
        });

        // Show/hide button based on input content
        input.addEventListener("input", () => {
            btn.style.display = input.value.length > 0 ? "inline-block" : "none";
        });
    });
});

// Local helper function
function getSubmitBtn() {
    const { currSubmitBtn } = getSharedElements();
    return currSubmitBtn;
}

// -- Shared helper functions --
function allowSubmittion() {
    getSubmitBtn().disabled = false;
    getSubmitBtn().style.cursor = 'pointer';
}

function preventSubmittion() {
    getSubmitBtn().disabled = true;
    getSubmitBtn().style.cursor = 'not-allowed';
}

function showErrMsg(element, message, color = errDefaultColor) {
    if (element.innerHTML.length > 0) {
        element.innerHTML = ''; // Clear previous error message
    };
    element.setAttribute("style", "display: block; color: " + color + ";");
    element.innerHTML = message;
}

function hideErrMsg(element) {
    element.style.display = 'none';
}

function showMark(checkElement) {
    checkElement.style.display = 'block';
}

function hideMark(checkElement) {
    checkElement.style.display = 'none';
}

function showOkMark(checkElement) {
    showMark(checkElement);
    checkElement.title = "Valid field";
    checkElement.innerHTML = '✔';
}

function showInvalidMark(checkElement) {
    showMark(checkElement);
    checkElement.title = "Invalid field";
    checkElement.innerHTML = '❌';
}

function showFormResultMessage(currFormMsgDiv, result) {
    currFormMsgDiv.style.display = 'block';
    currFormMsgDiv.innerText = (result.success ? '✅ ' : '❌ ') + result.message;
    currFormMsgDiv.className = 'form-message ' + (result.success ? 'success' : 'error');
}

export { getSharedElements, showErrMsg, hideErrMsg, showOkMark, showInvalidMark, allowSubmittion, preventSubmittion, showFormResultMessage };