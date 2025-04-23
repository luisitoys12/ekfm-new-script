"use strict";

/** All Public Station in Azuracast information */
const stationsData = [];

/** Fetch API data from Azuracast server */
function fetchData() {
  fetch(apiUrl + "/nowplaying")
    .then((response) => {
      if (!response.ok) {
        checkError("Failed to load API data", () => location.reload());
        return;
      }
      return response.json();
    })
    .then((data) => {
      stationsData.length = 0; // Clear previous data
      const uniqueStations = [];
      const seenStations = new Set();

      data.forEach((reslt) => {
        if (!seenStations.has(reslt.station.name)) {
          uniqueStations.push(reslt.station.name);
          seenStations.add(reslt.station.name);

          stationsData.push({
            imgBrand:
              reslt.now_playing.song.art || "./assets/images/default-art.jpg",
            bgimg:
              reslt.now_playing.song.art || "./assets/images/default-art.jpg",
            np: reslt.now_playing.song,
            name: reslt.station.name,
            streamUrl: reslt.station.listen_url,
            api: apiUrl + "/nowplaying/" + reslt.station.shortcode,
            played_at: reslt.now_playing.played_at,
            history: reslt.song_history,
          });
        }
      });

      processData();
    })
    .catch((err) => {
      console.error("Error fetching JSON:", err);
    });
}

/** Log error */
function checkError(message, callback) {
  console.error(message);
  if (callback) callback();
}

/** Process data */
function processData() {
  const playlist = document.querySelector("[data-music-list]");
  if (!playlist) {
    console.error("Playlist element not found");
    return;
  }

  playlist.innerHTML = ""; // Clear existing items

  for (let i = 0, len = stationsData.length; i < len; i++) {
    playlist.innerHTML += `
      <li>
        <p class="label-md" id="station">${stationsData[i].name}</p>
        <button class="music-item ${i === 0 ? "playing" : ""}" 
                data-playlist-toggler data-playlist-item="${i}">
          <img src="${stationsData[i].imgBrand}" width="800" height="800" 
               alt="${stationsData[i].name} Album Poster" class="img-cover">
          <div class="item-icon">
            <img src="./assets/images/equalizer.gif">
          </div>
        </button>
      </li>
    `;
  }

  initPlayerControls();
}

/** Initialize player controls */
function initPlayerControls() {
  const playlistItems = document.querySelectorAll("[data-playlist-item]");
  let currentMusic = 0;

  const audioSource = new Audio(stationsData[currentMusic]?.streamUrl || "");

  const changePlaylistItem = () => {
    document
      .querySelectorAll(".music-item.playing")
      .forEach((item) => item.classList.remove("playing"));
    playlistItems[currentMusic].classList.add("playing");
  };

  const changePlayerInfo = () => {
    const station = stationsData[currentMusic];
    if (!station) return;

    audioSource.src = station.streamUrl;
    document.getElementById("title").textContent = station.np.title || "N/A";
    document.getElementById("artist").textContent =
      station.np.artist || "Unknown Artist";
    document.getElementById("artwork").src = station.bgimg;
    playAudio();
  };

  const playAudio = () => {
    if (audioSource.paused) {
      audioSource.play();
      document.querySelector("[data-play-btn]").classList.add("active");
    }
  };

  const pauseAudio = () => {
    audioSource.pause();
    document.querySelector("[data-play-btn]").classList.remove("active");
  };

  document.querySelector("[data-play-btn]").addEventListener("click", () => {
    audioSource.paused ? playAudio() : pauseAudio();
  });

  document
    .querySelector("[data-skip-next]")
    .addEventListener("click", () => {
      currentMusic = (currentMusic + 1) % stationsData.length;
      changePlaylistItem();
      changePlayerInfo();
    });

  document
    .querySelector("[data-skip-prev]")
    .addEventListener("click", () => {
      currentMusic =
        (currentMusic - 1 + stationsData.length) % stationsData.length;
      changePlaylistItem();
      changePlayerInfo();
    });

  playlistItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      currentMusic = index;
      changePlaylistItem();
      changePlayerInfo();
    });
  });
}

/** Start fetching data */
fetchData();
