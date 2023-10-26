import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs";
import localforage from 'https://cdn.skypack.dev/localforage';

export async function read_excel_url(url) {

    // load the data from the url
    const buffer = await (await fetch(url)).arrayBuffer()
    let dta = xlsx.read(buffer)

    // get the first sheet...  
    //   we can add function parameters to avoid hard coding...
    let sheet = dta.Sheets[dta.SheetNames[0]]
    let array = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" })
    let headers = array.shift()

    return {
        'headers': headers,
        'rows': array.map((row) => row.reduce(
            (pv, cv, indx) => {
                pv[headers[indx]] = cv;
                return pv
            }, {})),
    }
}