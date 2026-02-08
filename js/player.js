console.log("JS подключён.")

const HIDE_DELAY = 3000 // задержка скрытия менюшки для видео снизу
const SEEK_STEP = 5
const introStart = parseTime("0:0:0")
const introEnd = parseTime("0:0:15")
const outroStart = parseTime("0:1:40")
const outroEnd = parseTime("0:2:0")
const wosBtns = document.querySelector(".watchOrSkipBtns")
const skipBtn = document.getElementById("skipBtn")
const watchBtn = document.getElementById("watchBtn")

function parseTime(t) {
    const parts = String(t).trim().split(":").map(Number)
    if (parts.some(n => Number.isNaN(n))) return 0
    let res = 0, partsLen = parts.length - 1
    for (p of parts) {
        res += p * (60 ** partsLen)
        partsLen--
    }
    return res
}
function updateSkipButton(isIntro, time) {
    const t = Number.isFinite(time) ? time : video.currentTime
    let shoudShow = t >= introStart && t < introEnd || t >= outroStart && t < outroEnd
    wosBtns.classList.toggle("hidden", !shoudShow) 
}

skipBtn.addEventListener("click", () => {
    let target
    if (video.currentTime <= introEnd)
        target = Math.min(introEnd, Number.isFinite(video.duration) ? video.duration : introEnd)
    else
        target = Math.min(outroEnd, Number.isFinite(video.duration) ? video.duration : outroEnd)
    video.currentTime = target
    updateSkipButton()
})
const video = document.getElementById("video")
const playBtn = document.getElementById("playBtn")

function syncPlayIcon() {
    playBtn.textContent = video.paused ? "▶" : "❚❚"
}
function playOrPauseVideo(){
    if (video.paused) video.play()
    else video.pause()
    syncPlayIcon()
}

watchBtn.addEventListener("click", () => {wosBtns.classList.add("hidden")})
playBtn.addEventListener("click", () => {playOrPauseVideo()})
video.addEventListener("play", syncPlayIcon)
video.addEventListener("pause", syncPlayIcon)

function fmt(sec, showHours = false) {
    if (!Number.isFinite(sec)) sec = 0
    sec = Math.max(0, Math.floor(sec))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0 || showHours) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    else {
        return `${m}:${String(s).padStart(2, "0")}`
    }
}

const seek = document.getElementById("seek")
const timeEl = document.getElementById("time")
let showHours = false
let isSeeking = false

function loadedMetaData() {
    seek.max = video.duration
    showHours = video.duration >= 3600
    timeEl.textContent = `${fmt(0, showHours)} / ${fmt(video.duration, showHours)}`
}

video.addEventListener("loadedmetadata", () => {
    loadedMetaData()
    updateSkipButton(true)
})
video.addEventListener("timeupdate", () => {
    if (!isSeeking) seek.value = video.currentTime;
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
    updateSkipButton(true)
})
seek.addEventListener("input", () => {
    isSeeking = true
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
    updateSkipButton(true)
})
seek.addEventListener("change", () => {
    video.currentTime = seek.value
    isSeeking = false
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
    updateSkipButton(true, Number(seek.value))
})
seek.addEventListener("focus", () => {
    updateSkipButton(true, Number(seek.value))
})
const player = document.getElementById('player')
const fsBtn = document.getElementById('fsBtn')

function isFullScreen() {
    return document.fullscreenElement === player
}
async function toggleFullScreen() {
    try {
        if (!isFullScreen())
            await player.requestFullscreen()
        else
            await document.exitFullscreen()
    }
    catch (e) {
        console.error("Ошибка полного экрана. ", e)
    }
}

fsBtn.addEventListener("click", toggleFullScreen)
window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f" || e.repeat) return
    toggleFullScreen()
})
window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "k" || e.repeat) return
    playOrPauseVideo()
})
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault()
        showControls()
        if (e.repeat) return
        playOrPauseVideo()
        return
    }
    if (e.code === "ArrowRight") {
        e.preventDefault()
        showControls()
        const duration = Number.isFinite(video.duration) ? video.duration : Infinity
        video.currentTime = Math.min(video.currentTime + SEEK_STEP, duration)
        return
    }
    if (e.code === "ArrowLeft") {
        e.preventDefault()
        showControls()
        video.currentTime = Math.max(video.currentTime - SEEK_STEP, 0)
        return
    }
})
const controls = document.querySelector(".controls")
let hideTimer = null

function hideControlNow() {
    if (!video.paused) {
        controls.classList.add("hidden")
        // wosBtns.classList.add("hidden")
    }
}
function showControls() {
    controls.classList.remove("hidden")
    // wosBtns.classList.remove("hidden")
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {hideControlNow()}, HIDE_DELAY)
}

window.addEventListener("mousemove", showControls)
player.addEventListener("mouseleave", hideControlNow)

syncPlayIcon()
loadedMetaData()
showControls()