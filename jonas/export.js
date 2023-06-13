// experimenting with communicating risk visually

//import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"

let read = (await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs')).read

let dataObj={} // read and cache here

// default tables
const tbls = [
    "General Table for Post-Colpo_v5.xlsx",
    "General Table for Post-Treatment_v2.xlsx",
    "General Table for Risk Following Colposcpy.xlsx",
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
    // read data
    
}

async function readURL(url){
    if(dataObj[url]){
        return dataObj[url]
    }else{
        let dt=read(await (await fetch(url)).arrayBuffer())
        dataObj[url]=dt
        return dt
    }
}

export {
    tbls,
    UI,
    read,
    dataObj
}

// XLSX.read(await (await fetch('http://localhost:8000/riskviz/data/General%20Table%20for%20Post-Colpo_v5.xlsx')).arrayBuffer())