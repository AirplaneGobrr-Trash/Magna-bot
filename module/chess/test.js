const axios = require('axios').default;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const baseAPI = "https://api.chess.com"
const baseURL = "https://chess.com"

async function getTournament(tournament) {
    // https://api.chess.com/pub/tournament/21-bullet-2657249 
    var url = `${baseAPI}/pub/tournament/${tournament}`
    console.log(url)
    axios.get(url)
        .then(res => {
            console.log(res.data)
        })
        .catch(e=>{
            console.log(e)
        })
}
async function getTournaments() {
    var url = `https://www.chess.com/tournaments`
    console.log(url)
    axios.get(url, {
        // cookies
        headers:{
            Cookie: `CHESSCOM_REMEMBERME=Q2hlc3NcV2ViQnVuZGxlXEVudGl0eVxVc2VyOmFYUnplVzlpYjNsbllXMWxlWFE9OjE3MTM0NjQyNjI6YTUwOWMxNmQ2ZGIwZWQ0OTUyMDU2MGYxMGE3ZmE2YjA4OGVmYTZmNWJkY2YzOGUxYjQ4YzE4Y2YyNzRiMjgwZQ==;`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
        } 
    }).then(res => {
        const dom = new JSDOM(res.data)
        // get all elements with the class tournaments-table-live-name
        const tournaments = dom.window.document.querySelectorAll('.tournaments-table-live-name')
        
        tournaments.forEach(tournament => {
            // get elements inside with the class tournaments-table-full-td-link
            const link = tournament.querySelector('.tournaments-table-full-td-link')
            if (link && link.href) {
                // console.log(, link.href)
                var name = tournament.textContent.trim()
                var nlink = link.href.split('/').pop()
                name = name.replace(/\s/g, '-').replace("|","")
                console.log(`${name}-${nlink}`)
            }
            // getTournament(tournament.textContent)
        })
    }).catch(e=>{ console.log(e) })
}
// 10-king-of-the-hill-3987944
// getTournament("3-2-blitz-arena-2657269")
async function getRaw(ewwInput) {
    
}

getTournaments()