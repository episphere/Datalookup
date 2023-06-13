import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs";
import localforage from 'https://cdn.skypack.dev/localforage';


// Setup LF and Load the data...
let dataDB = localforage.createInstance({
    name        : 'riskviz',
    storeName   : 'data'
})
// data is stored in these two files...  maybe make this a function
// so we can let the user set it...  if so, you but url encode the 
let files=['General Table for Screening v5.xlsx','General Table for Post-Colpo_v5.xlsx']
let baseURL = `${location.href.substring(0,location.href.indexOf("/daniel"))}/data/`
//let baseURL='https://episphere.github.io/riskviz/data/'
//let baseURL='/data/'

async function cache_data(file,dta){    
    // get first sheet...
    console.log(dta)
    let sheet = dta.Sheets[ dta.SheetNames[0] ]
    let array = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" })
    let headers = array.shift()

    let data={
        'headers':headers,
        'rows':array.map( (row)=> row.reduce( 
            (pv,cv,indx)=>{
                pv[headers[indx]]=cv;
                return pv
            },{} )),
        'unique_values':{}
        }
    
    // add unique values of all columns up-to column "N"
    for ( let [indx,colname] of headers.entries()){
        if (colname == "N") break;
        let s = new Set(array.map((row)=>row[indx]))
        data.unique_values[colname] = Array.from(s.values())
    }
    console.log(data)

    dataDB.setItem(file, data)
}
async function loadFiles(){
    let dbKeys = await dataDB.keys()

    await Promise.all ( 
        files.map( async (file) => {
            // if the data is already cached... don't waste your time
            if (!dbKeys.includes(file)){
                let dta=await url_read_excel(`${baseURL+encodeURIComponent(file)}`)
                console.log(dta)
                cache_data(file,dta)
            }else{
                console.log(`file ${file} already cached..`)
            }
        })
    )
}


function displayResults(){
    build_filtered_table()
}

function build_select_element(title,options){
    let selectElement = document.createElement("select")
    selectElement.classList.add("form-select","form-select-sm","mb-2")
    selectElement.dataset.colname=title
    selectElement.addEventListener("change",displayResults)

    // give a "no-selected value"
    let opt=document.createElement("option")
    opt.innerText = "<ANY>"
    opt.value = -1
    selectElement.insertAdjacentElement("beforeend",opt)
    options.forEach( (option,indx) => {
        opt=document.createElement("option")
        opt.innerText=option
        opt.value=indx
        selectElement.insertAdjacentElement("beforeend",opt)
    })

    console.log(selectElement)
    return selectElement
}
function build_card(title,options){
    // build the card and the card body...
    let card = document.createElement('div')
    card.classList.add("card")

    let cardBody = document.createElement('div')
    cardBody.classList.add("card-body")
    card.insertAdjacentElement("beforeend",cardBody)

    let cardTitle = document.createElement('div')
    cardTitle.classList.add("card-title","h6")
    cardTitle.insertAdjacentText("afterbegin",title)
    cardBody.insertAdjacentElement("beforeend",cardTitle)

    let cardText = document.createElement('div')
    cardText.classList.add("card-text")
    cardText.insertAdjacentElement("beforeend", build_select_element(title,options))
    cardBody.insertAdjacentElement("beforeend",cardText)
    
    return card
}
function build_input_cards(unique_values){
    let cards=document.getElementById("cardGroup")
    Array.from(cards.children).forEach( (card,indx) => {
        if (indx > 0) cards.removeChild(card)
    } )

    for (let value in unique_values){
        cards.insertAdjacentElement('beforeend',build_card(value,unique_values[value])) 
    }
}

async function fillFileElement(){
    // fill the input with the filename...
    let selected = document.getElementById("colpoEl").value
    document.getElementById("fileReadEl").innerText=`data: ${files[selected]}`

    // get the column names...
    let fileData = await dataDB.getItem(files[selected])
    build_input_cards(fileData.unique_values)
}

let lfcache = "";

async function url_read_excel(url){
    const data = await (await fetch(url)).arrayBuffer()
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

async function build_filtered_table(){    

    /// Filter the Data...
    let selected = document.getElementById("colpoEl").value
    let all_data = await dataDB.getItem(files[selected])
    
    let cardGroup = document.getElementById("cardGroup")
    console.log( cardGroup.querySelectorAll("select[data-colname]")) 
    //build complex filter...
    let filter_object = Array.from(cardGroup.querySelectorAll("select[data-colname]")).reduce( (prev,curr)=>{
        console.log(curr.dataset)
        prev[curr.dataset.colname] = all_data.unique_values[curr.dataset.colname][curr.value] ?? "*"
        return prev
    }, {});
    console.log(filter_object)

    let filtered_data = all_data.rows.filter( (row) => {
        for (const [key,value] of Object.entries(filter_object) ){
            try {
                if (filter_object[key] != '*' && row[key] != filter_object[key]) {
                    return false
                }
            } catch (e) {
                console.log(e)
            }
        }
        return true
    } );
    console.log("fd:",filtered_data)

    // build the table...
    let resTable = document.getElementById("resTable")
    resTable.innerText=""
    let thead = resTable.createTHead()
    let th_row = thead.insertRow()
    let tbody = resTable.createTBody()

    // build the header row...
    all_data.headers.forEach(header => {
        let th_cell = th_row.insertCell()
        th_cell.outerHTML=`<th>${header}</th>`
    })

    // for each filtered data row build a table row.
    filtered_data.forEach( (row) => {
        let tb_row = tbody.insertRow()
        all_data.headers.forEach(header => {
            let tb_cell = tb_row.insertCell()
            tb_cell.innerText = row[header]
        })
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




await loadFiles()
document.getElementById("colpoEl").addEventListener("change", async () => {
    await fillFileElement()
    build_filtered_table()
})
await fillFileElement()
build_filtered_table() 



