const API_URL = "http://localhost:5000/api";

// LOGIN
async function login() {
    const name = document.getElementById('name').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'dashboard.html';
    } else {
        alert(result.message);
    }
}

// SIGNUP
async function signup() {
    const name = document.getElementById('name').value;

    const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (result.success) {
        alert('Signup successful! Now logging in...');
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'dashboard.html';
    } else {
        alert(result.message);
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// DELETE USER
async function deleteUser() {
    const user = JSON.parse(localStorage.getItem('user'));

    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_URL}/user/${user.name}`, {
        method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
        alert("User deleted successfully!");
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    } else {
        alert(result.message);
    }
}

// SIMULATE DONATION
async function simulateDonation() {
    const user = JSON.parse(localStorage.getItem('user'));
    const amount = 500; // Fixed donation increment

    const response = await fetch(`${API_URL}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, amount })
    });

    const result = await response.json();

    if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        renderDashboard(result.user);
    } else {
        alert(result.message);
    }
}


// REFRESH USER DATA (IMPORTANT!)
async function refreshUserData() {
    const oldUser = JSON.parse(localStorage.getItem('user'));

    console.log("Refreshing data for:", oldUser.name);  // <-- ADD HERE

    const response = await fetch(`${API_URL}/user/${oldUser.name}`);
    const result = await response.json();

    if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        renderDashboard(result.user);
    } else {
        alert("Failed to refresh user data");
    }
}

// RENDER DASHBOARD
function renderDashboard(user) {
    document.getElementById('internName').innerText = user.name;
    document.getElementById('referralCode').innerText = user.referralCode;
    document.getElementById('donations').innerText = `₹${user.donations}`;
    renderRewards(user.rewards);
    renderBadgeProgress(user.donations);
}
function renderBadgeProgress(donations) {
    const progressContainer = document.getElementById('badgeProgress');
    progressContainer.innerHTML = ""; // Clear previous content

    const badgeMilestones = [
        { name: "Badge 1", target: 5000 },
        { name: "Badge 2", target: 10000 },
        { name: "Badge 3", target: 20000 }
    ];

    badgeMilestones.forEach(badge => {
        const remaining = badge.target - donations;
        const message =
            remaining > 0
                ? `Donate ₹${remaining} more to unlock ${badge.name}`
                : `${badge.name} unlocked! 🎉`;

        const div = document.createElement('div');
        div.classList.add('badge-progress');
        div.innerText = message;

        progressContainer.appendChild(div);
    });
}


// LOAD LEADERBOARD
async function loadLeaderboard() {
    const response = await fetch(`${API_URL}/leaderboard`);
    const result = await response.json();

    if (result.success) {
        const tableBody = document.getElementById('leaderboardTable');
        tableBody.innerHTML = "";

        result.users.forEach((user, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.referralCode}</td>
                <td>${user.donations}</td>
                <td>${user.rewards.length}</td>
            `;
            tableBody.appendChild(tr);
        });
    } else {
        alert("Failed to load leaderboard");
    }
}

// REWARDS
const rewardImages = {
  "Badge 1": "images/badge1.png",
  "Badge 2": "images/badge2.png",
  "Badge 3": "images/badge3.webp"
};
const lockedImage = "images/locked.webp";
const allRewards = ["Badge 1", "Badge 2", "Badge 3"];

function renderRewards(unlockedRewards) {
  const container = document.querySelector('.rewards-container');
  container.innerHTML = '';

  allRewards.forEach(reward => {
    const badge = document.createElement('div');
    badge.classList.add('reward-badge');

    const img = document.createElement('img');

    if (unlockedRewards.includes(reward)) {
      badge.classList.add('unlocked');
      img.src = rewardImages[reward];
    } else {
      img.src = lockedImage;
    }

    badge.appendChild(img);
    container.appendChild(badge);
  });
}

// CELEBRATE
function celebrateReward() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// INIT
window.onload = function () {
    if (window.location.pathname.includes('dashboard.html')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        renderDashboard(user);
    } else if (window.location.pathname.includes('leaderboard.html')) {
        loadLeaderboard();
    }
};
