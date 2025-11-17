import { FormValidator } from "./validator.js";
import { getSharedElements, showErrMsg, hideErrMsg, preventSubmittion, allowSubmittion, showFormResultMessage } from "./forms.js";
import { apiFetch } from "./utils/api.js";
import { TokenManager } from "./utils/tokenManager.js";

document.addEventListener("DOMContentLoaded", async () => {
    const { currForm, currSubmitBtn, nameCheck, passwordCheck, nameInput, passwordInput, nameErr, passwordErr, allErrDivs, currFormMsgDiv } = getSharedElements();

    const validator = new FormValidator(currForm);
    preventSubmittion(currSubmitBtn);

    const editErrColor = 'red';

    nameInput.addEventListener("input", () => {
        const value = nameInput.value.trim();

        if (value.length === 0) {
            validator.clearError(nameInput, nameErr, nameCheck);
        } else {
            validator.validateWithRules(nameInput, nameErr, nameCheck, editErrColor);
        }
    });

    passwordInput.addEventListener("input", () => {
        const value = passwordInput.value.trim();

        if (value.length === 0) {
            validator.clearError(passwordInput, passwordErr, passwordCheck);
        } else {
            validator.validateWithRules(passwordInput, passwordErr, passwordCheck, editErrColor);
        }
    });

    const welcomeText = document.getElementById("welcome-text");
    const formErr = document.getElementById("form-err");
    const editBtn = document.getElementById("edit-btn");
    const editModal = document.getElementById("edit-modal");
    const cancelBtn = document.getElementById("cancel-btn");
    const logoutBtn = document.getElementById("logout-btn");

    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    // console.log("token: ", accessToken);
    // console.log("refresh token: ", refreshToken);

    await apiFetch("/profile", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(data => {
        console.log("res data: ", data);
        if (data.success) {
            const user = data.user;
            welcomeText.textContent = `Welcome, ${user.name}!`;
        } else {
            console.log("Error:", data.message);
            welcomeText.textContent = "Welcome!";
        }
    })
    .catch((err) => {
        console.log("Unexpected error occurred:", err);
        welcomeText.textContent = "Welcome!";
    });


    editBtn.addEventListener("click", () => {
        editModal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        editModal.classList.add("hidden");
        currForm.reset();
        allErrDivs.forEach(err => err.style.display = 'none'); // Clear (hide) all error messages
    });

    currForm.addEventListener("input", () => {
        const nameFilled = nameInput.value.trim().length > 0;
        const passwordFilled = passwordInput.value.trim().length > 0;

        const nameValid = !nameFilled || nameInput.validity.valid;
        const passwordValid = !passwordFilled || passwordInput.validity.valid;

        if ((nameFilled || passwordFilled) && nameValid && passwordValid) {
            allowSubmittion();
            hideErrMsg(formErr);
        } else {
            showErrMsg(formErr, "Please enter at least a new name or a new password!", editErrColor);
            preventSubmittion();
        }
    });

    currForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(currForm);
        const data = Object.fromEntries(formData.entries());
        console.log("form action: ", currForm.action);

        try {
            console.log("Sending data:", data);
            const response = await fetch(`${currForm.action}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: new URLSearchParams(data)
            });
            const result = await response.json();
            console.log("Result:", result);

            showFormResultMessage(currFormMsgDiv, result);

            if (result.success) {
                editModal.classList.add("hidden");
                setTimeout(() => {
                    currFormMsgDiv.innerText = 'Redirecting...';
                    window.location.reload();
                }, 3500);
            }
        } catch (err) {
            console.log("Unexpected error occurred:", err);
        }
    });

    logoutBtn.addEventListener("click", async () => {
        await apiFetch("/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken })
        })
            .then(data => {
                console.log("res data: ", data);
                currFormMsgDiv.className = 'form-message ' + (data.success ? 'success' : 'error');
                if (data.success) {
                    currFormMsgDiv.style.display = 'block';
                    currFormMsgDiv.innerText = 'Redirecting...';

                    setTimeout(() => {
                        TokenManager.clearTokens();
                        currFormMsgDiv.innerText = 'Redirecting...';
                        window.location.href = "/login.html";
                    }, 3500);

                } else {
                    console.log("Error:", data.message);
                }
            })
            .catch((err) => {
                console.log("Unexpected error occurred:", err);
            });
    });
});
