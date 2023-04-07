import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs";
import { epibox } from 'https://danielruss.github.io/epibox/export.js'
//import { epibox } from 'http://localhost:5500/export.js'
import localforage from 'https://cdn.skypack.dev/localforage';


window.epibox = epibox
window.xlsx = xlsx
let lfcache = "";

document.querySelectorAll("#epibox input[type=button]").forEach(btn => {
    console.log(btn.value)
    switch (btn.value) {
        case 'login':
            btn.addEventListener('click', () => epibox.checkToken())
            break;
        case 'user':
            btn.addEventListener('click', async () => {
                let usr = await epibox.getUser()
                epibox.msg(JSON.stringify(epibox.oauth.user, null, 3))
            })
            break;
        case 'refresh':
            btn.addEventListener('click', () => epibox.refreshToken())
            break;
        case 'logout':
            btn.addEventListener('click', () => epibox.logout())
            break;
    }
})

async function box_read_excel(file_id) {
    let token = (await epibox.checkToken()).access_token;
    let opts = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    let url = `https://api.box.com/2.0/files/${file_id}/content`
    const data = await (await fetch(url, opts)).arrayBuffer()
    return xlsx.read(data)
}

function getHeader(sheet) {
    let header = []
    let range = xlsx.utils.decode_range(sheet["!ref"])
    for (let c = 0; c <= range.e.c - range.s.c; c++) {
        header[c] = (sheet[`${xlsx.utils.encode_col(c + range.s.c)}1`]?.v) ? sheet[`${xlsx.utils.encode_col(c + range.s.c)}1`].v : "";
    }
    return header
}

const sheetDiv = document.getElementById("sheetDiv");
function fillSheetDiv(tableElement,data,active_sheet){
    sheetDiv.innerText=""
    if (data.sheets.length<2) return
    console.log(active_sheet)
    data.sheets.forEach( (sheet,index) => {
        let aElement = document.createElement("input")
        console.log(sheet,active_sheet,sheet==active_sheet)
        if (sheet==active_sheet) aElement.checked=true
        aElement.id=`Sheet_${index}`
        aElement.classList.add("btn-check")
        aElement.type="radio"
        aElement.value=sheet
        aElement.innerText=sheet
        aElement.name="sheet"
        aElement.setAttribute("autocomplete","off")
        aElement.addEventListener("change",()=>{
            build_table(tableElement,data,sheet)
        })
        sheetDiv.insertAdjacentElement("beforeend",aElement)
        sheetDiv.insertAdjacentHTML("beforeend",`<label for=${aElement.id} class="mx-2 mb-2 btn btn-outline-dark">${aElement.value}`)
    })
}
function build_table(tableElement, data, sheet="") {

    console.log(`calling build_table ${sheet}`)
    function isFloat(x) {
        return !isNaN(parseFloat(x)) && !Number.isInteger(parseFloat(x))
    }
    function rnd4(x) {
        return (Math.round(x * 10000) / 10000).toFixed(4)
    }

    console.log(data)
    if (sheet=="") {
        sheet=data.sheets[0]
    }
    fillSheetDiv(tableElement,data,sheet)
    data=data[sheet]

    tableElement.innerText = ""
    // build the table header
    let tHead = tableElement.createTHead()
    let tr = tableElement.insertRow()

    data.header.forEach(col => {
        let th = tr.insertCell()
        th.outerHTML = `<th>${col}</th>`
    })

    // build the table body...
    let tBody = tableElement.createTBody();
    console.log(data.data)
    data.data.forEach((row, index) => {
        tr = tableElement.insertRow()
        row.forEach((col, indx) => {
            let td = tr.insertCell();
            td.setAttribute("nowrap", "true")
            td.innerText = (isFloat(col)) ? rnd4(col) : col;
        })
    })
    console.log(data.data)
}


async function box_load(bid) {
    if (! await lfcache.getItem(bid)) {
        console.log(`loading ${bid}`)
        let data = {sheets:[]}
        box_read_excel(bid)
            .then((dta) => {
                dta.SheetNames.map((sheetName) => {
                    let sheet = dta.Sheets[sheetName]
                    let array = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" })
                    data[sheetName] = {
                        header: array.shift(),
                        data: array
                    }
                    data.sheets.push(sheetName);
                    console.log(data)
                })
                lfcache.setItem(bid, data)
            })

    }
}

epibox.ini()
    .then(() =>
        localforage.createInstance({
            name: 'boxData',
            storeName: 'cache',
        }))
    .then((ds) => {
        console.log(lfcache)
        lfcache = ds;
        console.log(lfcache)
        let boxids = ['1129786990737', '1129793580583', '1129790568327', '1129790088254', '1129788291181']
        boxids.forEach(id => box_load(id))
    }).catch(error => console.error("Trouble caching the box files!!!"))


document.getElementById("boxfiles").addEventListener("change", async (event) => {
    let value = event.target.value;
    if (value == -1) return

    //    let xl_data = await box_read_excel(event.target.value)
    //    window.xl_data = xl_data
    //    let sheet = xl_data.Sheets[xl_data.SheetNames[0]]
    //    let array = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" })
    //    let data = {
    //        header: array.shift(),
    //        data: array
    //    }
    let data = await lfcache.getItem(event.target.value)
    build_table(document.getElementById("tbl1"), data)
})

window.box_read_excel = box_read_excel;