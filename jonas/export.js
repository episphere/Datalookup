// experimenting with communicating risk visually

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
    div.innerHTML='select data table <select id="selTable"></select>'
    let selTable = div.querySelector('#selTable')
    tbls.forEach(x=>{
        console.log(x)
        let opt = document.createElement('option')
        opt.textContent=opt.value=x
        selTable.appendChild(opt)
    })
    let tabDiv=document.createElement('div') // tabulation div
    div.appendChild(tabDiv)
    tabDiv.id='tabDiv' // in case one needs to fish it later
    selTable.onchange=function(div=tabDiv){
        tabulate(tabDiv,selTable.value)
    }
    tabulate(tabDiv,selTable.value) // initial default tabulation
}

async function tabulate(div,tb){
    div.innerHTML=tb
    let dt = await fetch(`../data/${encodeURIComponent(tb)}`)
    console.log(dt)
}


export {
    tbls,
    UI
}