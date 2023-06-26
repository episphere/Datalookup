// experimenting with communicating risk visually

//import * as xlsx from "https://cdn.sheetjs.com/xlsx-0.19.2/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"
//import { read, writeFileXLSX } from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs"

let read = (await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs')).read
let sheet_to_json = (await import('https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs')).utils.sheet_to_json
//let df = [] // the current sheet dataframe (for debugging)
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
    div.innerHTML='Data table <select id="selTable"></select> <span id="source">...</span>'
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
    let df={
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
    dataObj[url].df=df
    let h = '<h2> User attributes</h2>'
    df.conds.forEach(k=>{
        h += `<p>${k}:<select class="userAttributesSelect" id="${k}">; `
        df.vals[k].forEach(v=>{
            h += `<option>${v}</option>`
        })
        h += `</select> <input type="checkbox" checked="true" class="userAttributesInput" id="${k}"></p>`
        // h += `<div id="${k}"><h3>${k}:<h3></div>`
    })
    h += `<h2>Population values</h2>`
    df.cols.slice(df.conds.length).forEach(k=>{
        h+=`<br>`
        h+=`<span>`
        h+=`<span style="color:maroon">${k}</span> <input type="checkbox" class="popValuesInput">`
        h+=`<div hidden="true" class="popValuesDiv" id="${k}"></div>`
        h+=`</span>`
    })
    dataObj[url].tabDiv=tabDiv
    tabDiv.innerHTML=h
    //debugger
    setTimeout(activate,200)
}

function activate(){ // activates all input check boxes and selects with an event listener to calculate population values
    // collect activators
    let activators = [...document.querySelectorAll('input')].concat(
    [...document.querySelectorAll('.userAttributesSelect')])
    // activate calculation in response to each of them
    activators.forEach(el=>{
        //el.onchange=()=>{console.log(el)}
        el.onchange=function(){calculate(activators,this)} // not sure you need this element 
    })
}

function calculate(activators,el,tabDiv){
    // picking data frame from shared dataObj 
    let url=`${location.origin+location.pathname.replace(/[^\/]+\/$/,'')}data/${encodeURIComponent(document.body.querySelector('#selTable').value)}`
    //tabDiv = tabDiv ? dataObj[url].tabDiv
    if(!tabDiv){
        tabDiv=dataObj[url].tabDiv
    }
    let dfi=dataObj[url].df
    // calculate
    let els = activators // all elements involved in the displaying
    // console.log(els,el,dfi,dataObj)
    console.log('trigger:',el,el.type=='checkbox'?el.checked:el.value)
    // segment reccords by valid user attributes
    // console.log(dfi.conds) // available user attributes
    let userAttr=dfi.conds.filter(x=>{
        return ([...tabDiv.querySelectorAll(`#${CSS.escape(x)}`)].filter(e=>(e.type=='checkbox'))[0]).checked
    })
    console.log('----------------\n active user filters:')
    console.log(userAttr)
    // create rows array
    let rows = dfi.rows[dfi.cols[0]].map((r,i)=>{
        let obj={}
        dfi.cols.forEach(k=>{
            obj[k]=dfi.rows[k][i]
        })
        return obj
    })
    let filteredRows=rows.filter((r,i)=>{
        // filter for active user attributes
        let res = true
        userAttr.forEach(k=>{
            let val = tabDiv.querySelector(`#${CSS.escape(k)}`).value
            if(r[k]!=val){
                res = false
                console.log(i, k,r[k],val,res)
            }else{
                console.log(i, k,r[k],val,true)
            }
        })
        return res
    })
    let debug_filtered_finished
    // Screen population values with user attributes
    dfi.cols.slice(dfi.conds.length).forEach((k,i)=>{
        // check this is an active condition
        //tabDiv.querySelector(`#${CSS.escape(k)}`).value
        let divk = tabDiv.querySelector(`#${CSS.escape(k)}`)
        if(divk.parentNode.querySelector('input').checked){
            divk.hidden=false
            let popValues = rows.map(x=>x[k])
            let userValues = filteredRows.map(x=>x[k])
            divk.innerHTML=`${Date()}`
            // guess data type
            switch (dataType(k,popValues)){
                case 'count':
                    funCount(divk,popValues,userValues);
                    break;
                default:
                    funNotSupported(divk,popValues,userValues)
                    break
            }
            let debug_checked_active_conditions
        }else{
            divk.hidden=true
        }
            
    })
}

function dataType(k,vals){
    let tps=[...new Set(vals.map(x=>typeof(x)))] // value types
    if((tps.length==1)&tps[0]=='number'){
        if((vals.reduce((a,b)=>Math.max(a,b))>1)&(vals.reduce((a,b)=>Math.min(a,b))>=0)){
            return 'count' // all values are positive and maximjm value is bigger than 1
        }
    }
    //let guess_data_type
}

function funCount(divk,popValues,userValues){
    let popValuesN=popValues.reduce((a,b)=>a+b)
    let userValuesN=userValues.reduce((a,b)=>a+b)
    divk.innerHTML=`N = ${Math.round(userValuesN)} / ${Math.round(popValuesN)} (${100*Math.round(10000*userValuesN/popValuesN)/10000}%)`
    let debug_funCount
}

function funNotSupported(divk,popValues,userValues){
    divk.innerHTML='type no supported yet'
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
    //df, // for debugging
    dataObj
}

// XLSX.read(await (await fetch('http://localhost:8000/riskviz/data/General%20Table%20for%20Post-Colpo_v5.xlsx')).arrayBuffer())