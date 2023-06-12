// SAVING original code to read from box if needed.
// needs to be cleaned up

//import { epibox } from 'https://danielruss.github.io/epibox/export.js'
//import { epibox } from 'http://localhost:5500/export.js'
//window.epibox = epibox
//window.xlsx = xlsx

import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs";
import localforage from 'https://cdn.skypack.dev/localforage';

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

/*    
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
*/