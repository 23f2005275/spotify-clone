console.log('song info');

let songs;
let currFolder;
let currentSong = new Audio();

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00'
    }
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Load songs for a given folder using info.json
async function getSongs(folder) {
    currFolder = folder;

    let response = await fetch(`/${folder}/info.json`);
    let albumInfo = await response.json();
    songs = albumInfo.songs; // songs should be array of filenames

    let songUL = document.querySelector('.songlist ul');
    songUL.innerHTML = '';

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="musical-note-svgrepo-com.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div></div>
            </div>
            <div class="playnow">
                <img class="invert" src="play-svgrepo-com.svg" alt="">
                <span>Play Now</span>
            </div>              
        </li>`;
    }

    Array.from(songUL.getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            let track = e.querySelector('.info').firstElementChild.innerHTML;
            playMusic(track);
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = 'pause-svgrepo-com.svg';
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00/00:00';
}

// Display albums using each album's info.json
async function displayAlbums() {
    // albums.json will list all album folders
    let res = await fetch(`/songs/albums.json`);
    let albums = await res.json();

    let cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = '';

    for (let folder of albums) {
        let info = await fetch(`/songs/${folder}/info.json`);
        let album = await info.json();

        cardContainer.innerHTML += `
            <div data-folder="songs/${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 512 512">
                        <circle cx="256" cy="256" r="256" fill="green" />
                        <polygon points="200,150 200,362 362,256" fill="black" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="image">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(item.currentTarget.dataset.folder);
        });
    });
}

async function main() {
    // Load default album (adjust name to your actual folder)
    await getSongs('songs/');
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = 'pause-svgrepo-com.svg';
        } else {
            currentSong.pause();
            play.src = 'play-svgrepo-com.svg';
        }
    });

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML =
            `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
        document.querySelector('.circle').style.left =
            (currentSong.currentTime / currentSong.duration) * 99.3 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-100%';
    });

    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector('.range input').addEventListener('change', e => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector('.volume > img').addEventListener('click', e => {
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currentSong.volume = 0;
            document.querySelector('.range input').value = 0;
        } else {
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
            currentSong.volume = 0.50;
            document.querySelector('.range input').value = 50;
        }
    });
}

main();
