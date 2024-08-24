console.log('this is script file');


let songs;
let currFolder;
let currentSong = new Audio();

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// // Example usage:
// console.log(formatTime(12));  // Output: "00:12"
// console.log(formatTime(75));  // Output: "01:15"
// console.log(formatTime(360)); // Output: "06:00"


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text()

    // get all the songs
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (i = 0; i < as.length; i++) {
        const element = as[i]
        if (element.href.endsWith("mp4")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // display all the song
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="image/Music.svg" alt="" srcset="">
             <div class="info">
               <div> ${song}</div>
               <div>Owais Ali</div>
             </div>
             <div class="playNow">
               <span>Play now</span>
               <img width="25px" class="invert" src="image/play.svg" alt="" srcset="">
             </div></li>`;

    }

    // kisi gany pr click krny s us ka namm get krny k luye
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track

    if (!pause) {

        currentSong.play()
        play.src = "image/pause.svg"
    }

    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "00:00";
}



async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text()

    // get all the songs
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            // get the metaData of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json()

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">

            
            <div  class="play">

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
                preserveAspectRatio="xMidYMid meet">
                <!-- Background Circle -->
                <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                <!-- Play Button Icon Path -->
                <path d="M9 8.5L15 12L9 15.5V8.5Z" fill="black" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" srcset="">
            <h2>${response.title}</h2>
            <p>${response.discription}</p>
          </div>`

        }
    }
    // load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}

async function main() {

    await getSongs("songs/ncs")
    playMusic(songs[0], true)
    // console.log(songs);


    //Display all the album on the page

    displayAlbums()



    // for play and pause button music
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "image/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "image/play.svg"
        }
    })

    // listen for timeUpdate  event

    currentSong.addEventListener("timeupdate", () => {
        let curr = Math.floor(currentSong.currentTime)
        let dur = Math.floor(currentSong.duration)
        document.querySelector(".songTime").innerHTML = `${formatTime(curr)}/
    ${formatTime(dur)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // add an event to seek bar
    document.querySelector(".seekBar").addEventListener("click", (e) => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100


    })

    // add an event listner for hamburger
    document.querySelector(".hamburgerContainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    // add an event listner for cross button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // add an event listner for previus  button


    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }


    })

    // add an event listner for  next button

    document.getElementById("next").addEventListener("click", () => {


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // add an event listner for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })


    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click" , e=>{
       
        if(e.target.src.includes( "volume.svg")){
            e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
        
    })




}

main()


