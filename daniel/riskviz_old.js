import {read_excel_url} from './read_xl.js'
import 'https://cdn.plot.ly/plotly-2.25.2.min.js'

const isNumeric = (v)=> !!parseFloat(v)
const basePath = location.pathname.replace(/[^\/]+html/,"")
    .replace(/daniel\/?/,"")


async function load_single_scenario(scenario){
    console.log("... working on ",scenario.name)
    let tables = {
        "name":scenario.name,
        "label":scenario.label,
        "files":[]
    }
    for (const fileInfo of scenario.files){
        let filename = fileInfo.path;
        let fileURL=`${location.origin}${basePath}${encodeURI(filename)}`
        let dta=await read_excel_url(fileURL)
        let key = filename.replace(/\..+$/, '').replace(/^.*\//,'')
        dta.filename=filename
        dta.key=key
        dta.selectLabel=fileInfo.select
        tables.files.push(dta)
    }
    return tables
}

async function load_scenarios(){
    console.log("... in load_scenarios ...")
    let configURL = `${location.origin}${basePath}data/config.json`
    let config_data = await (await fetch(configURL)).json()
    scenarios = config_data.scenarios;
    cards = config_data.cards
    let tables =  []
    for (const scenario of scenarios) {
        let dta = await load_single_scenario(scenario)
        tables.push(dta)
    }
    return tables
}

let cards=[]
let scenarios=[]
let scenarioHandlers=[]

function makeTable(scenario,index){

    let thead = document.querySelector("#data-table thead")
    makeTableHeader(thead,scenario.files[index].headers)
    let tbody = document.querySelector("#data-table tbody")
    makeTableBody(tbody,scenario.files[index])

    makeCards(scenario.files[index])

    setDivText(scenario.files[index].filename)
}

function makeCards(file){

    let hide=file.key=='General Table for Risk Following Colposcpy'
    hideCards(hide)
    if (!hide){
        let z=["CIN2+"]
//        z.forEach( (card_name) => {
        cards.name.forEach( (card_name)=>{
            console.log(card_name)
            makeCard(file,card_name)
        })
    }
}
function weighted_mean(rows,col,weight_col){
    let res = rows.reduce( (acc,cv) => {
        acc.swx += cv['N']*cv[col]
        acc.sw += cv[weight_col]
        acc.wmean = acc.sw?acc.swx/acc.sw:0
        return acc;
    },{swx:0,sw:0,wmean:0} )
    return res.wmean
}

function hideCards(){
    cards.name.forEach((card)=> document.getElementById(card).style.display='none')
}

function makeCardTableRow(card,row,data,tbody){
    let cols = data.headers.filter((col)=>(new RegExp(`${card}.+${row.pattern}`)).test(col))
            .filter((col)=>/SE|risk/.test(col))
    let row_dta = cols.map( col => weighted_mean(data.rows,col,"N") ) 
    row_dta.push(row_dta[0]-1.96*row_dta[1],row_dta[0]+1.96*row_dta[1])

    let tr = tbody.insertRow()
    let th = document.createElement("th")
    th.innerText = row.name;
    tr.insertAdjacentElement("beforeend",th)
    row_dta.forEach( (value) => {
        let td=tr.insertCell();
        td.innerText=value.toFixed(2);
    } )

    console.log(row_dta)
}

function makeCard(file,card){
    if (file.key=="General Table for Risk Following Colposcpy"){
        return
    }
    
    let cardEl = document.getElementById(card)
    let tbody =  cardEl.querySelector("tbody")
    tbody.innerText=""

    cards.models.forEach( model => {
        console.log(model)
    })
    cards.models.forEach( model => makeCardTableRow(card,model,file,tbody))
    cardEl.style.display='revert'
}

function makeTableHeader(thead,header){
    thead.innerText=""
    let tr=thead.insertRow()
    header.forEach( (col) => {
        let th=document.createElement("th")
        th.innerText=col
        tr.insertAdjacentElement("beforeend",th)
    })
}

function makeTableBody(tbody,file){
    tbody.innerText=""
    file.rows.forEach( row=>{
        if (row[file.headers[0]].trim().length==0 ) return;
        let tr = tbody.insertRow();
        file.headers.forEach(col=>{
            let td = tr.insertCell();
            td.innerText= row[col]
        })
    })
}


function buildDataSelect(scenario){
    let fileSelect = document.getElementById("fileSelect");
    let labelElement=document.getElementById("fsLabel")
    return ()=>{
        console.log(scenario)
        let dataCallbacks = [];

        labelElement.innerText=scenario.label;

        //clear the old option elements...
        fileSelect.innerText="";

        //add a select for each file
        scenario.files.forEach( (ds,indx) => {
            let optElem = document.createElement("option")
            optElem.value = indx;
            optElem.innerText = ds.selectLabel;
            fileSelect.insertAdjacentElement("beforeend", optElem)
        });

        // use onchange to clear out other eventlisteners...
        fileSelect.onchange = (event)=>{
            makeTable(scenario,event.target.value)
        }
        makeTable(scenario,0)
    }
}
function buildSelect() {
    let scenarioSelect = document.getElementById("scenarioSelect");

    scenarios.forEach((scenario, indx) => {
        let optElem = document.createElement("option")
        optElem.value = indx;
        optElem.innerText = scenario.name;
        scenarioSelect.insertAdjacentElement("beforeend", optElem)
        
        scenarioHandlers.push(buildDataSelect(scenario))
    })
    scenarioSelect.addEventListener("change",(event)=>{
        scenarioHandlers[event.target.value]()
    })
    scenarioHandlers[0]()
}

function setDivText(text="") {
    if (Event.prototype.isPrototypeOf(text)) text=""

    let sz="(xxl)"
    if (innerWidth<576) {
        sz="(xs)"
    }else if (innerWidth<768){
        sz="(sm)"
    }else if (innerWidth<992){
        sz="(md)"
    }else if (innerWidth<1200){
        sz="(lg)"
    }else if (innerWidth<1400){
        sz="(xl)"
    }
    sizediv.innerText = `${innerHeight}x${innerWidth} ${sz} ${text}`
}

//function clearDivs() {
//    document.querySelectorAll("[data-div]").forEach(div => div.classList.add("d-none"))
//}


    


function scenarioChanged(event) {
    let scenarioSelect = document.getElementById("scenarioSelect");
    let selectedScenario = scenarioSelect.value || 0;
    //scenarioHandlers[selectedScenario]()
}

window.addEventListener("resize", setDivText);
console.log("...")
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("... dcl ...")
})

window.addEventListener("load", async (event) => {
    console.log("... load ...")
    setDivText()
    scenarios = await load_scenarios()
    buildSelect()
    //scenarioChanged();
    //document.getElementById("scenarioSelect").addEventListener("change", scenarioChanged)

    //load_files()
})