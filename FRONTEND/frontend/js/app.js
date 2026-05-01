const API_BASE_URL = "http://localhost:5050/api";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const signupMessage = document.getElementById("signupMessage");
const loginMessage = document.getElementById("loginMessage");
const userMessage = document.getElementById("userMessage");
const logoutBtn = document.getElementById("logoutBtn");
const itemForm = document.getElementById("itemForm");
const itemMessage = document.getElementById("itemMessage");
const filterForm = document.getElementById("filterForm");
const itemsList = document.getElementById("itemsList");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const appNavLink = document.getElementById("appNavLink");
const heroActions = document.getElementById("heroActions");
const myPostsSection = document.getElementById("myPostsSection");
const myItemsList = document.getElementById("myItemsList");
const refreshMyPostsBtn = document.getElementById("refreshMyPostsBtn");

const formatDate = (dateValue) => {
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const escapeHTML = (value) => {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
};

const showMessage = (element, message, type) => {
  element.textContent = message;
  element.className = `form-message ${type}`;
};

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const setMaxItemDate = () => {
  const itemDateInput = document.getElementById("itemDate");
  itemDateInput.max = getTodayDateString();
};

const isFutureDate = (dateValue) => {
  return dateValue > getTodayDateString();
};

const saveLogin = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  updateUserPanel();
  loadMyItems();
};

const updateUserPanel = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    userMessage.textContent = `Logged in as ${user.name} (${user.email})`;
    logoutBtn.classList.remove("hidden");
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    appNavLink.classList.remove("hidden");
    heroActions.classList.remove("hidden");
    myPostsSection.classList.remove("hidden");
    loadItems();
    loadMyItems();
  } else {
    userMessage.textContent = "You are not logged in.";
    logoutBtn.classList.add("hidden");
    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    appNavLink.classList.add("hidden");
    heroActions.classList.add("hidden");
    myPostsSection.classList.add("hidden");
  }
};

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userData = {
    name: document.getElementById("signupName").value,
    email: document.getElementById("signupEmail").value,
    phone: document.getElementById("signupPhone").value,
    password: document.getElementById("signupPassword").value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(signupMessage, data.message || "Signup failed", "error");
      return;
    }

    saveLogin(data);
    signupForm.reset();
    showMessage(signupMessage, "Signup successful", "success");
  } catch (error) {
    showMessage(signupMessage, "Cannot connect to server", "error");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginData = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(loginMessage, data.message || "Login failed", "error");
      return;
    }

    saveLogin(data);
    loginForm.reset();
    showMessage(loginMessage, "Login successful", "success");
  } catch (error) {
    showMessage(loginMessage, "Cannot connect to server", "error");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateUserPanel();
  myItemsList.innerHTML = "";
  itemsList.innerHTML = "";
});

itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    showMessage(itemMessage, "Please login before posting an item", "error");
    return;
  }

  const itemData = {
    title: document.getElementById("itemTitle").value,
    description: document.getElementById("itemDescription").value,
    category: document.getElementById("itemCategory").value,
    location: document.getElementById("itemLocation").value,
    status: document.getElementById("itemStatus").value,
    date: document.getElementById("itemDate").value
  };

  if (isFutureDate(itemData.date)) {
    showMessage(itemMessage, "Date cannot be in the future", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(itemMessage, data.message || "Could not post item", "error");
      return;
    }

    itemForm.reset();
    showMessage(itemMessage, "Item posted successfully", "success");
    loadItems();
    loadMyItems();
  } catch (error) {
    showMessage(itemMessage, "Cannot connect to server", "error");
  }
});

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadItems();
});

refreshMyPostsBtn.addEventListener("click", () => {
  loadMyItems();
});
const loadItems = async () => {
    const search = document.getElementById("searchInput").value;
    const status = document.getElementById("statusFilter").value;
    const resolved = document.getElementById("resolvedFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const params = new URLSearchParams();
  
    if (search) {
      params.append("search", search);
    }
  
    if (status) {
      params.append("status", status);
    }
  
    if (resolved) {
      params.append("resolved", resolved);
    }
  
    if (category) {
      params.append("category", category);
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/items?${params.toString()}`);
      const items = await response.json();
  
      if (!response.ok) {
        itemsList.innerHTML = `<p class="empty-text">${items.message || "Could not load items"}</p>`;
        return;
      }
  
      renderItems(items);
    } catch (error) {
      itemsList.innerHTML = '<p class="empty-text">Cannot connect to server</p>';
    }
  };
  
  const loadMyItems = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/items/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const items = await response.json();
  
      if (!response.ok) {
        myItemsList.innerHTML = `<p class="empty-text">${items.message || "Could not load your posts"}</p>`;
        return;
      }
  
      renderItems(items, myItemsList, true);
    } catch (error) {
      myItemsList.innerHTML = '<p class="empty-text">Cannot connect to server</p>';
    }
  };
  
  const deleteMyItem = async (itemId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Could not delete item");
        return;
      }
  
      loadItems();
      loadMyItems();
    } catch (error) {
      alert("Cannot connect to server");
    }
  };
  
  const toggleResolved = async (itemId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/resolve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Could not update item");
        return;
      }
  
      loadItems();
      loadMyItems();
    } catch (error) {
      alert("Cannot connect to server");
    }
  };
  
  const renderItems = (items, targetElement = itemsList, showDelete = false) => {
    if (items.length === 0) {
      targetElement.innerHTML = '<p class="empty-text">No items found.</p>';
      return;
    }
  
    targetElement.innerHTML = items
      .map((item) => {
        const postedBy = item.postedBy || {};
        const status = escapeHTML(item.status);
        const progressText = item.isResolved ? "resolved" : "active";
        const toggleText = item.isResolved ? "Mark Active" : "Mark Resolved";
        const deleteButton = showDelete
          ? `
            <button class="success-btn resolve-item-btn" data-id="${escapeHTML(item._id)}" type="button">${toggleText}</button>
            <button class="danger-btn delete-item-btn" data-id="${escapeHTML(item._id)}" type="button">Delete Post</button>
          `
          : "";
  
        return `
          <article class="item-card">
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.description)}</p>
  
            <div class="item-meta">
              <span class="badge ${status}">${status}</span>
              <span class="badge">${escapeHTML(item.category)}</span>
              <span class="badge">${escapeHTML(item.location)}</span>
              <span class="badge">${formatDate(item.date)}</span>
              <span class="badge ${progressText}">${progressText}</span>
            </div>
  
            <div class="contact-box">
              <strong>Contact:</strong> ${escapeHTML(postedBy.name || "Unknown")}<br>
              Email: ${escapeHTML(postedBy.email || "Not available")}<br>
              Phone: ${escapeHTML(postedBy.phone || "Not available")}
            </div>
  
            ${deleteButton}
          </article>
        `;
      })
      .join("");
  
    if (showDelete) {
      targetElement.querySelectorAll(".resolve-item-btn").forEach((button) => {
        button.addEventListener("click", () => {
          toggleResolved(button.dataset.id);
        });
      });
  
      targetElement.querySelectorAll(".delete-item-btn").forEach((button) => {
        button.addEventListener("click", () => {
          deleteMyItem(button.dataset.id);
        });
      });
    }
  };
  
  setMaxItemDate();
  updateUserPanel();
  