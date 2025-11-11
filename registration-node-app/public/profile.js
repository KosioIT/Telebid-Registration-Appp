document.addEventListener("DOMContentLoaded", async () => {
    const welcomeText = document.getElementById("welcome-text");
    const editBtn = document.getElementById("edit-btn");
    const editModal = document.getElementById("edit-modal");
    const cancelBtn = document.getElementById("cancel-btn");
    const editForm = document.getElementById("edit-form");
    const formMessage = document.getElementById("form-message");
    const logoutBtn = document.getElementById("logout-btn");

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.log("response: ", response);
            const data = await response.json();
            console.log("response data: ", data);
            const text = await response.text();
            console.error("Error:", text);
            welcomeText.textContent = "Welcome!";
            return;
        }
        const user = await response.json();
        welcomeText.textContent = `Welcome, ${user.name}!`;
    } catch (err) {
        console.error(err);
        welcomeText.textContent = "Welcome!";
    }

    editBtn.addEventListener("click", () => {
        editModal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        editModal.classList.add("hidden");
    });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(editForm.action, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            formMessage.textContent = result.message;
            formMessage.className = "form-message " + (result.success ? "success" : "error");

            if (result.success) {
                if (data.newName) {
                    welcomeText.textContent = `Welcome, ${data.newName}!`;
                }
                editModal.classList.add("hidden");
                setTimeout(() => {
                    window.location.href = "/profile.html";
                }, 1500);
            }
        } catch (err) {
            formMessage.textContent = "Unexpected error!";
            formMessage.className = "form-message error";
        }
    });

    logoutBtn.addEventListener("click", async () => {
        localStorage.removeItem("token");

        try {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.location.href = "/login.html";
            } else {
                console.error("Logout failed:", response.status);
            }
        } catch (err) {
            console.error("Logout error:", err);
        }
    });
});
