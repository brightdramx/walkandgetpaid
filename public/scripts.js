// Real distance tracking with Geolocation
let previousPosition = null;
let totalDistance = 0;
const rewardPer100m = 50;
let balance = 0;

function login() {
  const name = document.getElementById("username").value;
  if (name.trim() !== "") {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");
    startTracking();
  }
}

function showLeaderboard() {
  alert("Leaderboard coming soon!");
}

function showReferral() {
  alert("Referral system coming soon!");
}

function startTracking() {
  const stepCount = document.getElementById("stepCount");
  const status = document.querySelector(".status");
  
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (previousPosition) {
        const dist = calculateDistance(
          previousPosition.latitude,
          previousPosition.longitude,
          latitude,
          longitude
        );

        totalDistance += dist;

        if (totalDistance >= 100) {
          const rewards = Math.floor(totalDistance / 100);
          balance += rewards * rewardPer100m;
          totalDistance = totalDistance % 100; // keep leftover
        }

        stepCount.textContent = `${balance.toLocaleString()} TZS`;
        status.textContent = `Distance walked: ${totalDistance.toFixed(1)}m`;
      }

      previousPosition = { latitude, longitude };
    },
    (err) => {
      alert("Error getting location: " + err.message);
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
  );
}

// Haversine Formula to calculate distance between 2 geo coords
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
}
