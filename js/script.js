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
        play.src='pause-svgrepo-com.svg'
    }
    document.querySelector('.songinfo').innerHTML=decodeURI(track);
    document.querySelector('.songtime').innerHTML='00:00/00:00';
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response= await a.text();
    let div = document.createElement("div");
    div.innerHTML=response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer= document.querySelector('.cardContainer')
    let array = Array.from(anchors)
        for (let index=0; index < array.length; index++){     
            const e = array[index]   
            if (e.href.includes("%5Csongs%5C")){
                let folder=e.href.split('%5C')[2].split('/')[0];
                let a = await fetch(`/${folder}/info.json`);
                let response= await a.json();
                cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 512 512">
                                    <!-- Circle background -->
                                    <circle cx="256" cy="256" r="256" fill="#0be20b" />

                                    <!-- Play triangle -->
                                    <polygon points="200,150 200,362 362,256" fill="black" />
                                </svg>

                            </div>
                            <img src="/songs/${folder}/cover.jpeg" alt="image">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`
                
            }
    }
    Array.from(document.getElementsByClassName('card')).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]); 
            
        })
    })
    
}

async function main(){
    await getSongs('songs');
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
    
    previous.addEventListener('click',()=>{
    
        let index=songs.indexOf(currentSong.src.split('/').slice(-1) [0])
        // console.log(index);
        
        
        if ((index-1 ) >= 0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener('click',()=>{

        let index=songs.indexOf(currentSong.src.split('/').slice(-1) [0])
        let length = songs.length
        // console.log(index);
        

        if ((index+1 )<length){
            playMusic(songs[index+1])
            
        }
    })
    
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
