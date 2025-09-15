let songs;
let currFolder;

let currentSong= new Audio();

function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return '00:00'
    }
    const totalSeconds = Math.floor(seconds); // take floor instead of round
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // format with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`/${folder}/info.json`);
    let data = await res.json();
    songs = data.songs;

    let songUL = document.querySelector('.songlist ul');
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/musical-note-svgrepo-com.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div></div>
            </div>
            <div class="playnow">
                <img class="invert" src="img/play-svgrepo-com.svg" alt="">
                <span>Play Now</span>
            </div>              
        </li>`;
    }

    Array.from(songUL.getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', el => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        });
    });

    return songs;
}
    

const playMusic=(track,pause=false)=>{
    // let audio= new Audio('/songs/'+track)
    // audio.play()
    currentSong.src=`/${currFolder}/`+track;
    if (!pause){
        currentSong.play()
        play.src='img/pause-svgrepo-com.svg'
    }
    document.querySelector('.songinfo').innerHTML=decodeURI(track);
    document.querySelector('.songtime').innerHTML='00:00/00:00';
}

async function displayAlbums() {
    let res = await fetch("/songs/index.json");
    let data = await res.json();
    let playlists = data.playlists;

    let cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = "";

    for (let p of playlists) {
        let res = await fetch(`/songs/${p.folder}/info.json`);
        let info = await res.json();

        cardContainer.innerHTML += `
        <div data-folder="${p.folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 512 512">
                    <circle cx="256" cy="256" r="256" fill="#0be20b" />
                    <polygon points="200,150 200,362 362,256" fill="black" />
                </svg>
            </div>
            <img src="/songs/${p.folder}/cover.jpeg" alt="cover">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        </div>`;
    }

    // Add click listeners for each card
    Array.from(document.getElementsByClassName('card')).forEach(card => {
        card.addEventListener("click", async e => {
            let folder = e.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}


async function main(){
    await getSongs('songs/arijit_singh');
    playMusic(songs[0],true)

    displayAlbums()
      
    play.addEventListener('click',()=>{
        if (currentSong.paused){
            currentSong.play()
            play.src='pause-svgrepo-com.svg'
        }
        else{
            currentSong.pause()
            play.src='play-svgrepo-com.svg'
        }
    })
    currentSong.addEventListener('timeupdate',()=>{
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector('.songtime').innerHTML=`${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`
        document.querySelector('.circle').style.left=(currentSong.currentTime/currentSong.duration)*99.3+"%";
    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent= (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent+"%";
        currentSong.currentTime=((currentSong.duration)*percent)/100
    })

    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left='0'
    })

    document.querySelector('.close').addEventListener('click',()=>{
        document.querySelector('.left').style.left='-100%'
    })
    
    previous.addEventListener('click', () => {
    let current = decodeURI(currentSong.src.split('/').pop());
    let index = songs.indexOf(current);
    if (index > 0) {
        playMusic(songs[index - 1]);
        }
    });
    
    next.addEventListener('click', () => {
        let current = decodeURI(currentSong.src.split('/').pop());
        let index = songs.indexOf(current);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change',(e)=>{
        // console.log(e.target.value);
        currentSong.volume= e.target.value/100
        
    })
    document.querySelector('.volume > img').addEventListener('click',(e)=>{
        if (e.target.src.includes('volume.svg')){
            e.target.src = e.target.src.replace('volume.svg','mute.svg')
            currentSong.volume=0;
            document.querySelector('.range').getElementsByTagName('input')[0].value=0
        }
        else{
            e.target.src = e.target.src.replace('mute.svg','volume.svg')
            currentSong.volume=0.50
            document.querySelector('.range').getElementsByTagName('input')[0].value=50
        }
        
    })
    
}

main()
