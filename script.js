/*
 * Gestore Password
 * Copyright © 2025 Mario Scioli
 * Tutti i diritti riservati.
 */

document.addEventListener("DOMContentLoaded", async () => {
    const nameInput = document.getElementById("name");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const addButton = document.getElementById("add");
    const listContainer = document.getElementById("list");
    const changeMasterPasswordButton = document.getElementById("changeMasterPassword");

    // Funzioni per salvare e caricare i dati dal localStorage
    function saveToLocalStorage(data) {
        localStorage.setItem("passwords", JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        return JSON.parse(localStorage.getItem("passwords")) || [];
    }

    function renderList() {
        listContainer.innerHTML = "";
        const savedEntries = loadFromLocalStorage();
        savedEntries.forEach(entry => addEntryToDOM(entry.name, entry.username, entry.password));
    }

    function addEntryToDOM(name, username, password) {
        const entry = document.createElement("div");
        entry.classList.add("password-entry");
        entry.innerHTML = `
            <strong>${name}</strong>
            <span class="hidden username-span">${username}</span>
            <input type="text" class="edit-username hidden" placeholder="Username">
            <button class="show-username">Mostra Username</button>
            <span class="hidden password-span">${password}</span>
            <input type="password" class="edit-password hidden" placeholder="Password">
            <button class="show-password">Mostra Password</button>
            <button class="edit">Modifica</button>
            <button class="delete">Elimina</button>
        `;

        const usernameSpan = entry.querySelector(".username-span");
        const passwordSpan = entry.querySelector(".password-span");
        const usernameEditInput = entry.querySelector(".edit-username");
        const passwordEditInput = entry.querySelector(".edit-password");
        const showUsernameButton = entry.querySelector(".show-username");
        const showPasswordButton = entry.querySelector(".show-password");
        const editButton = entry.querySelector(".edit");
        const deleteButton = entry.querySelector(".delete");

        // Mostra/Nascondi username
        showUsernameButton.addEventListener("click", () => {
            usernameSpan.classList.toggle("hidden");
            usernameEditInput.classList.toggle("hidden");
            usernameEditInput.value = usernameSpan.textContent; // Aggiorna l'input con il valore corrente
        });

        // Mostra/Nascondi password
        showPasswordButton.addEventListener("click", () => {
            passwordSpan.classList.toggle("hidden");
            passwordEditInput.classList.toggle("hidden");
            passwordEditInput.value = passwordSpan.textContent; // Aggiorna l'input con il valore corrente
        });

        // Modifica username e password
        editButton.addEventListener("click", () => {
            // Apri i campi di modifica
            usernameSpan.classList.add("hidden");
            passwordSpan.classList.add("hidden");
            usernameEditInput.classList.remove("hidden");
            passwordEditInput.classList.remove("hidden");

            // Aggiorna i valori solo se l'utente inserisce nuovi dati
            const newUsername = usernameEditInput.value.trim();
            const newPassword = passwordEditInput.value.trim();

            const updatedEntries = loadFromLocalStorage().map(e => {
                if (e.name === name) {
                    return { 
                        name, 
                        username: newUsername || e.username, // Mantieni il valore esistente se non viene modificato
                        password: newPassword || e.password  // Mantieni il valore esistente se non viene modificato
                    };
                }
                return e;
            });

            saveToLocalStorage(updatedEntries);
            renderList();
        });

        // Elimina la voce
        deleteButton.addEventListener("click", () => {
            const updatedEntries = loadFromLocalStorage().filter(e => e.name !== name);
            saveToLocalStorage(updatedEntries);
            renderList();
        });

        listContainer.appendChild(entry);
    }

    let masterPassword = localStorage.getItem("masterPassword");

    // Funzione per gestire l'autenticazione con la password principale
    const authenticate = () => {
        return new Promise((resolve, reject) => {
            if (!masterPassword) {
                masterPassword = prompt("Imposta una password principale per accedere alle credenziali:");
                if (masterPassword) {
                    localStorage.setItem("masterPassword", masterPassword);
                    resolve();
                } else {
                    reject("Password principale non impostata.");
                }
            } else {
                const inputPassword = prompt("Inserisci la password principale:");
                if (inputPassword === masterPassword) {
                    resolve();
                } else {
                    alert("Password errata! Ricarica la pagina e riprova.");
                    window.location.reload();
                    reject("Password errata! Ricarica la pagina e riprova.");
                }
            }
        });
    };

    // Aggiungi event listener al bottone "Aggiungi"
    addButton.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (name && username && password) {
            const savedEntries = loadFromLocalStorage();
            savedEntries.push({ name, username, password });
            saveToLocalStorage(savedEntries);
            renderList();
            nameInput.value = "";
            usernameInput.value = "";
            passwordInput.value = "";
        } else {
            alert("Tutti i campi devono essere compilati!");
        }
    });

    // Funzionalità per cambiare la password principale
    changeMasterPasswordButton.addEventListener("click", () => {
        const oldMasterPassword = prompt("Inserisci la vecchia password principale:");
        if (oldMasterPassword === masterPassword) {
            const newMasterPassword = prompt("Inserisci la nuova password principale:");
            if (newMasterPassword) {
                localStorage.setItem("masterPassword", newMasterPassword);
                masterPassword = newMasterPassword;
                alert("Password principale cambiata con successo!");
            } else {
                alert("La nuova password principale non può essere vuota.");
            }
        } else {
            alert("Vecchia password principale errata!");
        }
    });

    authenticate()
        .then(() => {
            renderList();
        })
        .catch(error => {
            alert(error);
        });
});