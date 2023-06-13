// experimenting with communicating risk visually

//import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"

let read = (await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs')).read
let sheet_to_json = (await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs')).utils.sheet_to_json
let df = [] // the current sheet dataframe (for debugging)
let dataObj={} // read and cache here

// default tables
const tbls = [
    //"General Table for Post-Colpo_v5.xlsx",
    //"General Table for Post-Treatment_v2.xlsx",
    //"General Table for Risk Following Colposcpy.xlsx",
    "General Table for Screening v5.xlsx",
    "General Table for Surveillance_v6.xlsx"
]

function UI(div=document.getElementById('vizDiv')){
    if(!div){ // create div if it doesn't exist
        div=document.createElement('div')
        document.body.appendChild(div) // and add it to the DOM
    }
    if(typeof(div)=='string'){ // you can also call it by the id
        div=document.getElementById(div)
    }
    div.innerHTML='select data table <select id="selTable"></select> <span id="source">...</span>'
    let selTable = div.querySelector('#selTable')
    tbls.forEach(x=>{
        //console.log(x)
        let opt = document.createElement('option')
        opt.textContent=opt.value=x
        selTable.appendChild(opt)
    })
    let tabDiv=document.createElement('div') // tabulation div
    div.appendChild(tabDiv)
    tabDiv.id='tabDiv' // in case one needs to fish it later
    let srcSpan = div.querySelector('#source')
    selTable.onchange=function(evt){
        srcSpan.innerHTML='...'
        tabulate(tabDiv,selTable.value)
    }
    tabulate(tabDiv,selTable.value) // initial default tabulation
}

async function tabulate(tabDiv,tb){
    let url=`${location.origin+location.pathname.replace(/[^\/]+\/$/,'')}data/${encodeURIComponent(tb)}`
    //let dt = await fetch(`../data/${encodeURIComponent(tb)}`)
    let dt = await readURL(url)
    console.log('--------------')
    console.log(tb)
    console.log(dt)
    let srcSpan = tabDiv.parentElement.querySelector('#source')
    setTimeout(function(){
        srcSpan.innerHTML=`<a href="${url}" target="_blank">source</a>`
    },500)
    // organize a data frame
    //let df={  // exported
    df={
        cols:Object.keys(dt.sheet[0]), // column name in order, left to right
        rows:{} // rows in order, top to bottom
    }
    
    df.cols.forEach(k=>{
        df.rows[k]=[]
        dt.sheet.forEach(r=>{
            df.rows[k].push(r[k]) // push value picked from one row at a time
        })
    })
    // separating conditions from values
    df.conds=df.cols.slice(0,df.cols.indexOf('N')) // condition variables
    df.vals=[]
    df.conds.forEach(k=>{
        df.vals[k]=[]
        df.vals[k]=[...new Set(df.rows[k])]
    })
    let h = '<h2> User attributes</h2>'
    df.conds.forEach(k=>{
        h += `<p>${k}:<select>; `
        df.vals[k].forEach(v=>{
            h += `<option>${v}</option>`
        })
        h += `</select></p> `
        // h += `<div id="${k}"><h3>${k}:<h3></div>`
    })
    h += `<h2>Population values</h2>`
    df.cols.slice(df.conds.length,10).forEach(k=>{
        h+=`<p>`
        h+=`${k} <input type="checkbox">`
        h+=`</p>`
    })
    tabDiv.innerHTML=h
    //debugger
}

async function readURL(url){
    let dt
    if(!dataObj[url]){
        dt=read(await (await fetch(url)).arrayBuffer())
        dt.sheet=sheet_to_json(dt.Sheets[dt.SheetNames[0]])
        dataObj[url]=dt
    };
    //sheet=dt.sheet
    return dataObj[url]
}

export {
    tbls,
    UI,
    read,
    df, // for debugging
    dataObj
}

// XLSX.read(await (await fetch('http://localhost:8000/riskviz/data/General%20Table%20for%20Post-Colpo_v5.xlsx')).arrayBuffer())