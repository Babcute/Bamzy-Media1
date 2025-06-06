document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in and is admin
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!token || !user || user.role !== "admin") {
    window.location.href = "/index.html"
    return
  }

  // Handle logout
  const logoutBtn = document.getElementById("logout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/index.html"
    })
  }

  // Handle mobile sidebar toggle
  const hamburgerMenu = document.querySelector(".hamburger-menu")
  const sidebar = document.querySelector(".sidebar")

  if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }

  // Handle navigation
  const adminDashboard = document.getElementById("adminDashboard")
  const manageAccounts = document.getElementById("manageAccounts")
  const transactionsSection = document.getElementById("transactionsSection")
  const usersSection = document.getElementById("usersSection")

  const showAccountsBtn = document.getElementById("showAccounts")
  const showTransactionsBtn = document.getElementById("showTransactions")
  const showUsersBtn = document.getElementById("showUsers")

  // Function to close sidebar on mobile after selection
  function closeSidebarOnMobile() {
    if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active")
    }
  }

  if (showAccountsBtn && manageAccounts) {
    showAccountsBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Hide other sections
      adminDashboard.style.display = "none"
      transactionsSection.style.display = "none"
      usersSection.style.display = "none"

      // Show accounts section
      manageAccounts.style.display = "block"

      // Load accounts
      loadAccounts()

      // Close sidebar on mobile
      closeSidebarOnMobile()
    })
  }

  if (showTransactionsBtn && transactionsSection) {
    showTransactionsBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Hide other sections
      adminDashboard.style.display = "none"
      manageAccounts.style.display = "none"
      usersSection.style.display = "none"

      // Show transactions section
      transactionsSection.style.display = "block"

      // Load transactions
      loadTransactions()

      // Close sidebar on mobile
      closeSidebarOnMobile()
    })
  }

  if (showUsersBtn && usersSection) {
    showUsersBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Hide other sections
      adminDashboard.style.display = "none"
      manageAccounts.style.display = "none"
      transactionsSection.style.display = "none"

      // Show users section
      usersSection.style.display = "block"

      // Load users
      loadUsers()

      // Close sidebar on mobile
      closeSidebarOnMobile()
    })
  }

  // Handle add account button
  const addAccountBtn = document.getElementById("addAccountBtn")
  const addAccountModal = document.getElementById("addAccountModal")

  if (addAccountBtn && addAccountModal) {
    addAccountBtn.addEventListener("click", () => {
      addAccountModal.style.display = "block"
    })
  }

  // Handle close modal buttons
  const closeModalBtns = document.querySelectorAll(".close")
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal")
      if (modal) {
        modal.style.display = "none"
      }
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none"
    }
  })

  // Handle image preview for add account
  const accountImage = document.getElementById("accountImage")
  const imagePreview = document.getElementById("imagePreview")

  if (accountImage && imagePreview) {
    accountImage.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Handle image preview for edit account
  const editAccountImage = document.getElementById("editAccountImage")
  const editImagePreview = document.getElementById("editImagePreview")

  if (editAccountImage && editImagePreview) {
    editAccountImage.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          editImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Handle add account form submission
  const addAccountForm = document.getElementById("addAccountForm")
  if (addAccountForm) {
    addAccountForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const platform = document.getElementById("platform").value
      const accountYear = document.getElementById("accountYear").value
      const followers = document.getElementById("followers").value
      const price = document.getElementById("price").value
      const loginDetails = document.getElementById("loginDetails").value
      const description = document.getElementById("description").value
      const accountImageFile = document.getElementById("accountImage").files[0]

      if (!platform || !accountYear || !followers || !price || !loginDetails || !description || !accountImageFile) {
        alert("Please fill in all fields")
        return
      }

      // For demo purposes, we'll simulate uploading the image
      // In a real application, you would upload the image to a server

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result

        // Create account object
        const account = {
          platform,
          year: Number.parseInt(accountYear),
          followers: Number.parseInt(followers),
          price: Number.parseFloat(price),
          loginDetails,
          description,
          image: imageUrl,
          status: "available",
        }

        // Send account to server
        fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(account),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert("Account added successfully")
              addAccountModal.style.display = "none"
              addAccountForm.reset()
              imagePreview.innerHTML = ""

              // Reload accounts if on accounts page
              if (manageAccounts.style.display === "block") {
                loadAccounts()
              }

              // Reload dashboard stats
              loadDashboardStats()
            } else {
              alert(data.message || "Failed to add account")
            }
          })
          .catch((error) => {
            console.error("Error:", error)
            alert("An error occurred. Please try again.")
          })
      }
      reader.readAsDataURL(accountImageFile)
    })
  }

  // Handle edit account form submission
  const editAccountForm = document.getElementById("editAccountForm")
  if (editAccountForm) {
    editAccountForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const accountId = document.getElementById("editAccountId").value
      const platform = document.getElementById("editPlatform").value
      const accountYear = document.getElementById("editAccountYear").value
      const followers = document.getElementById("editFollowers").value
      const price = document.getElementById("editPrice").value
      const loginDetails = document.getElementById("editLoginDetails").value
      const description = document.getElementById("editDescription").value
      const status = document.getElementById("editStatus").value
      const accountImageFile = document.getElementById("editAccountImage").files[0]

      if (!platform || !accountYear || !followers || !price || !loginDetails || !description || !status) {
        alert("Please fill in all fields")
        return
      }

      // Create account object
      const account = {
        id: accountId,
        platform,
        year: Number.parseInt(accountYear),
        followers: Number.parseInt(followers),
        price: Number.parseFloat(price),
        loginDetails,
        description,
        status,
      }

      // If image is changed, update it
      if (accountImageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          account.image = e.target.result
          updateAccount(account)
        }
        reader.readAsDataURL(accountImageFile)
      } else {
        updateAccount(account)
      }
    })
  }

  // Function to update account
  function updateAccount(account) {
    // Send account to server
    fetch(`/api/accounts/${account.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(account),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Account updated successfully")
          const editAccountModal = document.getElementById("editAccountModal")
          if (editAccountModal) {
            editAccountModal.style.display = "none"
          }

          // Reload accounts if on accounts page
          if (manageAccounts.style.display === "block") {
            loadAccounts()
          }

          // Reload dashboard stats
          loadDashboardStats()
        } else {
          alert(data.message || "Failed to update account")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
      })
  }

  // Load dashboard stats
  loadDashboardStats()
  loadRecentActivity()
  checkUnreadMessages()

  // Function to load dashboard stats
  function loadDashboardStats() {
    // Fetch stats from server
    fetch("/api/admin/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.stats) {
          const stats = data.stats

          // Update stats
          document.getElementById("totalAccounts").textContent = stats.totalAccounts
          document.getElementById("accountsSold").textContent = stats.accountsSold
          document.getElementById("totalRevenue").textContent = `${stats.totalRevenue.toFixed(2)}`
          document.getElementById("totalUsers").textContent = stats.totalUsers

          // Update unread message count
          updateUnreadMessageCount(stats.unreadMessages)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
  }

  // Function to update unread message count
  function updateUnreadMessageCount(count) {
    const unreadCountElements = document.querySelectorAll("#unreadCount, #headerUnreadCount")

    unreadCountElements.forEach((element) => {
      if (count > 0) {
        element.textContent = count
        element.style.display = "inline-flex"
      } else {
        element.style.display = "none"
      }
    })
  }

  // Function to check for unread messages
  function checkUnreadMessages() {
    fetch("/api/messages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const totalUnread = data.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
          updateUnreadMessageCount(totalUnread)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
      })
  }

  // Function to load recent activity
  function loadRecentActivity() {
    const recentActivity = document.getElementById("recentActivity")
    if (!recentActivity) return

    // Fetch recent activity from server
    fetch("/api/admin/activity", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.activity) {
          const activity = data.activity

          if (activity.length === 0) {
            recentActivity.innerHTML = "<p>No recent activity.</p>"
            return
          }

          recentActivity.innerHTML = ""

          activity.forEach((item) => {
            const activityItem = document.createElement("div")
            activityItem.className = "activity-item"

            let iconClass = ""
            let iconHtml = ""

            switch (item.type) {
              case "sale":
                iconClass = "icon-sale"
                iconHtml = '<i class="fas fa-shopping-cart"></i>'
                break
              case "user":
                iconClass = "icon-user"
                iconHtml = '<i class="fas fa-user"></i>'
                break
              case "account":
                iconClass = "icon-account"
                iconHtml = '<i class="fas fa-user-shield"></i>'
                break
              case "message":
                iconClass = "icon-message"
                iconHtml = '<i class="fas fa-envelope"></i>'
                break
              default:
                iconClass = "icon-sale"
                iconHtml = '<i class="fas fa-shopping-cart"></i>'
            }

            activityItem.innerHTML = `
                        <div class="activity-icon ${iconClass}">
                            ${iconHtml}
                        </div>
                        <div class="activity-details">
                            <p class="activity-title">${item.title}</p>
                            <p class="activity-time">${item.time}</p>
                        </div>
                        ${item.amount ? `<div class="activity-amount">₦${item.amount.toFixed(2)}</div>` : ""}
                    `

            if (item.type === "message" && !item.read) {
              activityItem.classList.add("unread-activity")
            }

            recentActivity.appendChild(activityItem)
          })
        } else {
          recentActivity.innerHTML = "<p>Failed to load recent activity.</p>"
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        recentActivity.innerHTML = "<p>An error occurred. Please try again.</p>"
      })
  }

  // Function to load accounts
  function loadAccounts() {
    const accountsTableBody = document.getElementById("accountsTableBody")
    if (!accountsTableBody) return

    // Fetch accounts from server
    fetch("/api/accounts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.accounts) {
          const accounts = data.accounts

          if (accounts.length === 0) {
            accountsTableBody.innerHTML = '<tr><td colspan="7">No accounts found.</td></tr>'
            return
          }

          accountsTableBody.innerHTML = ""

          accounts.forEach((account) => {
            const row = document.createElement("tr")

            row.innerHTML = `
                        <td>${account.id}</td>
                        <td>
                            <div class="account-platform">
                                <i class="fab fa-${account.platform}"></i>
                                <span>${account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</span>
                            </div>
                        </td>
                        <td><img src="${account.image}" alt="${account.platform}" class="table-image"></td>
                        <td>${account.followers.toLocaleString()}</td>
                        <td>₦${account.price.toFixed(2)}</td>
                        <td>
                            <span class="table-status ${account.status === "available" ? "status-completed" : "status-failed"}">
                                ${account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="edit-btn" data-id="${account.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-btn" data-id="${account.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `

            accountsTableBody.appendChild(row)
          })

          // Add event listeners to buttons
          const editButtons = accountsTableBody.querySelectorAll(".edit-btn")
          editButtons.forEach((button) => {
            button.addEventListener("click", function () {
              const accountId = this.dataset.id
              editAccount(accountId)
            })
          })

          const deleteButtons = accountsTableBody.querySelectorAll(".delete-btn")
          deleteButtons.forEach((button) => {
            button.addEventListener("click", function () {
              const accountId = this.dataset.id
              deleteAccount(accountId)
            })
          })
        } else {
          accountsTableBody.innerHTML = '<tr><td colspan="7">Failed to load accounts.</td></tr>'
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        accountsTableBody.innerHTML = '<tr><td colspan="7">An error occurred. Please try again.</td></tr>'
      })
  }

  // Function to load transactions
  function loadTransactions() {
    const transactionsTableBody = document.getElementById("transactionsTableBody")
    if (!transactionsTableBody) return

    // Fetch transactions from server
    fetch("/api/admin/transactions", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.transactions) {
          const transactions = data.transactions

          if (transactions.length === 0) {
            transactionsTableBody.innerHTML = '<tr><td colspan="6">No transactions found.</td></tr>'
            return
          }

          transactionsTableBody.innerHTML = ""

          transactions.forEach((transaction) => {
            const row = document.createElement("tr")

            row.innerHTML = `
                        <td>${transaction.id}</td>
                        <td>${transaction.user}</td>
                        <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                        <td>₦${transaction.amount.toFixed(2)}</td>
                        <td>${transaction.date}</td>
                        <td>
                            <span class="table-status ${transaction.status === "completed" ? "status-completed" : transaction.status === "pending" ? "status-pending" : "status-failed"}">
                                ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                        </td>
                    `

            transactionsTableBody.appendChild(row)
          })
        } else {
          transactionsTableBody.innerHTML = '<tr><td colspan="6">Failed to load transactions.</td></tr>'
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        transactionsTableBody.innerHTML = '<tr><td colspan="6">An error occurred. Please try again.</td></tr>'
      })
  }

  // Function to load users
  function loadUsers() {
    const usersTableBody = document.getElementById("usersTableBody")
    if (!usersTableBody) return

    // Fetch users from server
    fetch("/api/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.users) {
          const users = data.users

          if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>'
            return
          }

          usersTableBody.innerHTML = ""

          users.forEach((user) => {
            const row = document.createElement("tr")

            row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.balance === Number.POSITIVE_INFINITY ? "∞" : `₦${user.balance.toFixed(2)}`}</td>
                        <td>${user.joined}</td>
                        <td>
                            <div class="table-actions">
                                <button class="edit-user-btn" data-id="${user.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-user-btn" data-id="${user.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="message-user-btn" data-id="${user.id}" data-name="${user.name}">
                                    <i class="fas fa-envelope"></i>
                                </button>
                            </div>
                        </td>
                    `

            usersTableBody.appendChild(row)
          })

          // Add event listeners to buttons
          const editButtons = usersTableBody.querySelectorAll(".edit-user-btn")
          editButtons.forEach((button) => {
            button.addEventListener("click", function () {
              const userId = this.dataset.id
              editUser(userId)
            })
          })

          const deleteButtons = usersTableBody.querySelectorAll(".delete-user-btn")
          deleteButtons.forEach((button) => {
            button.addEventListener("click", function () {
              const userId = this.dataset.id
              deleteUser(userId)
            })
          })

          const messageButtons = usersTableBody.querySelectorAll(".message-user-btn")
          messageButtons.forEach((button) => {
            button.addEventListener("click", function () {
              const userId = this.dataset.id
              const userName = this.dataset.name
              window.location.href = `/messages.html?userId=${userId}&userName=${encodeURIComponent(userName)}`
            })
          })
        } else {
          usersTableBody.innerHTML = '<tr><td colspan="6">Failed to load users.</td></tr>'
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        usersTableBody.innerHTML = '<tr><td colspan="6">An error occurred. Please try again.</td></tr>'
      })
  }

  // Function to edit account
  function editAccount(accountId) {
    // Fetch account details from server
    fetch(`/api/accounts/${accountId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.account) {
          const account = data.account
          const editAccountModal = document.getElementById("editAccountModal")

          if (editAccountModal) {
            // Fill form with account details
            document.getElementById("editAccountId").value = account.id
            document.getElementById("editPlatform").value = account.platform
            document.getElementById("editAccountYear").value = account.year
            document.getElementById("editFollowers").value = account.followers
            document.getElementById("editPrice").value = account.price
            document.getElementById("editLoginDetails").value = account.loginDetails
            document.getElementById("editDescription").value = account.description
            document.getElementById("editStatus").value = account.status

            // Show image preview
            const editImagePreview = document.getElementById("editImagePreview")
            if (editImagePreview) {
              editImagePreview.innerHTML = `<img src="${account.image}" alt="Preview">`
            }

            // Show modal
            editAccountModal.style.display = "block"
          }
        } else {
          alert("Failed to load account details.")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
      })
  }

  // Function to delete account
  function deleteAccount(accountId) {
    if (confirm("Are you sure you want to delete this account?")) {
      // Send delete request to server
      fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Account deleted successfully")

            // Reload accounts if on accounts page
            if (manageAccounts.style.display === "block") {
              loadAccounts()
            }

            // Reload dashboard stats
            loadDashboardStats()
          } else {
            alert(data.message || "Failed to delete account")
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        })
    }
  }

  // Function to edit user (placeholder)
  function editUser(userId) {
    alert(`Edit user with ID: ${userId} (Not implemented in this demo)`)
  }

  // Function to delete user (placeholder)
  function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      alert(`Delete user with ID: ${userId} (Not implemented in this demo)`)
    }
  }

  // Check for unread messages periodically
  setInterval(checkUnreadMessages, 30000) // Check every 30 seconds
})
