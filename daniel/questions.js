import {read_excel_url} from './read_xl.js'
import plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist@2.30.1/+esm'

let questions={
    question1:{
        name: "question1",
        text:"Is there any prior screening or abnormality for cervical cancer?",
        responses: [
            {
                text: "No prior screening or not known.",
                next: "question2"
            },
            {
                text: "Recently received a biopsy result",
                table: "General Table for Risk Following Colposcpy.xlsx"
            },
            {
                text: "Yes, had screening within last 5 years",
                next: "question3"
            }
        ]
    },
    question2: {
        name: "question2",
        text: "HPV genotyping known?",
        responses : [
            {
                text:"Yes",
                table: "General Table for Screening/No history cotest with genotyping.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["HPV16+","HPV16-, HPV18+","HPV16/18-, Other+"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },
            {
                text:"No",
                table: "General Table for Screening/No history cotest.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            }
        ]
    },
    question3: {
        name: "question3",
        text:"Is there any prior treatment for cervical cancer or any biopsy taken?",
        responses:[
            {
                text:"No prior biopsy or treatment",
                next: "question4"
            },
            {
                text:"Prior biopsy but no treatment",
                next: "question8"
            },
            {
                text:"Previous treatment for cervical precancer",
                next: "question10"
            }
        ]
    },
    question4: {
        name: "question4",
        text:"What was the last screening test result within 5 years?",
        responses:[
            {
                text:"Cotest negative",
                next: "question5"
            },
            {
                text:"HPV negative",
                next: "question6"
            },
            {
                text:"HPV-negative ASC-US",
                table: "General Table for Surveillance/Past_HPVnegative_ASCUS.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },
            {
                text:"HPV-negative LSIL",
                table: "General Table for Surveillance/Past_HPVnegative_LSIL.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },            {
                text:"HPV-Positive NILM",
                next: "question7"
            },
        ]
    },
    question5: {
        name: "question5",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Screening/Past_cotestnegative_cotest with genotyping.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["HPV16+","HPV16-, HPV18+","HPV16/18-, Other+"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","High Grade"]
                }]
            },
            {
                text:"No",
                table: "General Table for Screening/Past_cotestnegative_cotest.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },
        ]
    },
    question6: {
        name: "question6",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Screening/Past_HPVnegative_cotest with genotyping.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["HPV16+","HPV16-, HPV18+","HPV16/18-, Other+"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","High Grade"]
                }]
            },
            {
                text:"No",
                table: "General Table for Screening/Past_HPVnegative_cotest.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },
        ]
    },
    question7: {
        name: "question7",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Surveillance/Past_HPVpositive_NILM with genotyping.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["HPV16+","HPV16-, HPV18+","HPV16/18-, Other+"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","High Grade"]
                }]
            },
            {
                text:"No",
                table: "General Table for Surveillance/Past_HPVpositive_NILM.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US","LSIL","ASC-H","AGC","HSIL+"]
                }]
            },
        ]
    },
    question8: {
        name: "question8",
        text:"Any screening prior to today after the last biopsy?",
        responses:[
            {
                text:"Yes",
                next: "question9"
            },
            {
                text:"No",
                table: "General Table for Post-Colpo/Post-Colpo.xlsx",
                cols: [{
                    name:"Pre-Colpo Test Result",
                    allowedValues:["Low Grade","High Grade"]
                },{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US/LSIL","High Grade"]
                }]
            }, 
        ]
    },
    question9: {
        name: "question9",
        text: "What was the last screening result(s) after the biopsy?",
        responses: [
            {
                text: "Cotest-negative",
                table: "General Table for Post-Colpo/Post-Colpo_Past_Cotestnegative.xlsx",
                cols: [{
                    name:"Pre-Colpo Test Result",
                    allowedValues:["Low Grade","High Grade"]
                },{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US/LSIL","High Grade"]
                }]
            },
            {
                text: "Cotest-negative x2",
                table: "General Table for Post-Colpo/Post-Colpo_Past_Cotestnegative_x2.xlsx",
                cols: [{
                    name:"Pre-Colpo Test Result",
                    allowedValues:["Low Grade","High Grade"]
                }]
            },
            {
                text: "HPV-negative",
                table: "General Table for Post-Colpo/Post-Colpo_Past_HPVnegative.xlsx",
                cols: [{
                    name:"Pre-Colpo Test Result",
                    allowedValues:["Low Grade","High Grade"]
                }]
            },
            {
                text: "HPV-negative x2",
                table: "General Table for Post-Colpo/Post-Colpo_Past_HPVnegative_x2.xlsx",
                cols: [{
                    name:"Pre-Colpo Test Result",
                    allowedValues:["Low Grade","High Grade"]
                }]
            },
            {
                text: "HPV-negative ASC-US/LSIL",
                table: "General Table for Post-Colpo/Post-Colpo_LowGrade_Past_HPVnegative_ASCUSorLSIL.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US/LSIL","High Grade"]
                }]
            },
        ]
    },
    question10: {
        name: "question10",
        text:"Any screening prior to today after the last treatment?",
        responses:[
            {
                text:"Yes",
                next: "question11"
            },
            {
                text:"No",
                table: "General Table for Post-Treatment/Post-Treatment_no past.xlsx",
                cols: [{
                    name:"Current HPV Result",
                    allowedValues:["None","HPV-negative","HPV-positive"]
                },{
                    name:"Current PAP Result",
                    allowedValues:["None","NILM","ASC-US/LSIL","High Grade"]
                }]
            }, 
        ]
    },
    question11: {
        name: "question11",
        text:"What was the last screening result(s) after the treatment?",
        responses:[
            {
                text: "Cotest-negative",
                table: "General Table for Post-Treatment/Post-Treatment_past_cotestnegative.xlsx"
            },
            {
                text: "Cotest-negative x2",
                table: "General Table for Post-Treatment/Post-Treatment_past_cotestnegativex2.xlsx"
            },
            {
                text: "HPV-negative",
                table: "General Table for Post-Treatment/Post-Treatment_past_HPVnegative.xlsx"
            },
            {
                text: "HPV-negative x2",
                table: "General Table for Post-Treatment/Post-Treatment_past_HPVnegativex2.xlsx"
            }
        ]
    }
}

let cards = [
    {
        name:"CIN2"

    }
]

let config ={}

function weighted_mean(rows,col,weight_col){
    let res = rows.reduce( (acc,cv) => {
        acc.swx += cv['N']*cv[col]
        acc.sw += cv[weight_col]
        acc.wmean = acc.sw?acc.swx/acc.sw:0
        return acc;
    },{swx:0,sw:0,wmean:0} )
    return res.wmean
}

function clearNextQuestions(selectElement){
    let nextQuestion = document.getElementById(`${selectElement.id}_nq`)
    if (nextQuestion){
        nextQuestion.innerText=""
    }
    document.querySelector("#data-table thead").innerText=""
    document.querySelector("#data-table tbody").innerText=""
    document.querySelector("#cardsDiv").innerText=""
    document.querySelector("#plotDiv").innerText=""
}

async function read_xl(path){
    console.log(path)
    let p=path.split("/").map(c=>encodeURIComponent(c))
    let uri=`../data/${p.join("/")}`
    return await read_excel_url(uri)
}

function makeTable(data){

    let thead = document.querySelector("#data-table thead")
    makeTableHeader(thead,data)
    let tbody = document.querySelector("#data-table tbody")
    makeTableBody(tbody,data)
    document.querySelector("#tableDiv").style.display="initial"
}

function makeTableHeader(headElement,data){
    headElement.innerText=""
    let headerRow = headElement.insertRow()
    headerRow.insertCell()
    data.headers.forEach( (column) => {
        let cell = headerRow.insertCell()
        cell.innerText = column
    })
}
function makeTableBody(bodyElement,data){
    bodyElement.innerText=""
    data.rows.forEach( row=>{
        if (row[data.headers[0]]?.length>0){
            let bodyRow = bodyElement.insertRow()
            bodyRow.insertCell()
            data.headers.forEach( col => {
                let cell = bodyRow.insertCell();
                let txt = row[col] || " " 
                let intValue = parseInt( txt)
                if ( !isNaN(intValue) ){
                    let floatValue = parseFloat( row[col] || " " )
                    txt = (floatValue == intValue)?intValue:floatValue.toFixed(2)
                }  
                cell.innerText = txt;
            });
        }
    })
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
}

HTMLTableRowElement.prototype.insertHead = function(html){
    let cell = document.createElement("th")
    cell.innerHTML=html
    this.insertAdjacentElement("beforeend",cell)
    return cell
}

function makeCardTable(data,card,tableElement){
    let tableHeader=tableElement.createTHead()
    let headerRow = tableElement.insertRow()
    headerRow.insertCell();
    ["Risk (%)","SE","LL-95","UL-95"].forEach( (column) =>{
        headerRow.insertHead(column)
    })
    let tableBody=tableElement.createTBody()    
    config.cards.models.forEach( (row) => {
        makeCardTableRow(card,row,data,tableBody)
    })
}

function makeCard(data,card,rootElement){
    // create wrapper div
    let parentDiv = document.createElement("div")
    parentDiv.classList.add("col-12","col-lg-6","col-xxl-4")

    // create the card div
    let cardDiv = document.createElement("div")
    cardDiv.id=card
    cardDiv.classList.add("card")
    parentDiv.insertAdjacentElement("beforeend",cardDiv)

    // create the card body
    let cardBody = document.createElement("div")
    cardBody.classList.add("card-body")
    cardDiv.insertAdjacentElement("beforeend",cardBody)
    // add the card title..
    let cardTitle = document.createElement("h5")
    cardTitle.innerText=card
    cardTitle.classList.add("card-title","border-bottom")
    cardBody.insertAdjacentElement("beforeend",cardTitle)

    let tableElement = document.createElement("table")
    tableElement.classList.add("table","table-striped")
    cardBody.insertAdjacentElement("beforeend",tableElement)
    makeCardTable(data,card,tableElement)
    rootElement.insertAdjacentElement("beforeend",parentDiv)
}

function makeCards(data){
    let rootElement = document.getElementById("cardsDiv")
    rootElement.innerText=""

    config.cards.name.forEach( card => {
        if (data.headers.includes(`${card} ${config.cards.SE[0]}`)){
            makeCard(data,card,rootElement)
        }
    })
}

function makePlots(data){
    function makePlotCard(rootElement){
        let plotRoot = document.createElement("div")
        rootElement.insertAdjacentElement("beforeend",plotRoot)
        plotRoot.classList.add("col-12","col-lg-6","col-xxl-4")

        let cardRoot = document.createElement("div")
        cardRoot.classList.add("card")
        plotRoot.insertAdjacentElement("beforeend",cardRoot)
        let plotDiv = document.createElement("div")
        cardRoot.insertAdjacentElement("beforeend",plotDiv)
        return plotDiv
    }

    function makePlot1(data,rootElement){        
        let plotDiv = makePlotCard(rootElement)
        let y_val = data.headers.filter( (col)=>/^CIN3+.*risk/.test(col)).map( 
            (col)=> weighted_mean(data.rows,col,"N") )

        let y_max = Math.ceil(Math.max(y_val))
        let plot1_data = [{
            x:["Immediate","1-year","2-year","3-year","4-year","5-year"],
            y:y_val,
            name: "HPV-positive ASC-US"
        }]
        let plot1_layout = {
            xaxis: {
                type: 'category',
                title: 'Time'
            },
            yaxis: {
                range:[0,y_max],
                title: "CIN3+ Risk (%)"
            },
            margin: {
                t: 50,
            },
            title: "Plot 1",
        };
        plotly.newPlot( plotDiv, plot1_data, plot1_layout,{responsive:true})
    }
    function makePlot2(data,rootElement){
        let plotDiv = makePlotCard(rootElement)
        let y1_val = data.headers.filter( (col)=>/^CIN2+.*risk/.test(col)).map( 
            (col)=> weighted_mean(data.rows,col,"N") )
        let y2_val = data.headers.filter( (col)=>/^CIN3+.*risk/.test(col)).map( 
            (col)=> weighted_mean(data.rows,col,"N") )
        let y3_val = data.headers.filter( (col)=>/^CANCER+.*risk/.test(col)).map( 
            (col)=> weighted_mean(data.rows,col,"N") )

        let y_max = Math.ceil(Math.max(...y1_val,...y2_val,...y3_val))
        let plot2_data = [{
            x:["Immediate","1-year","2-year","3-year","4-year","5-year"],
            y:y1_val,
            name: "CIN2+"
        },{
            x:["Immediate","1-year","2-year","3-year","4-year","5-year"],
            y:y2_val,
            name: "CIN3+"
        },{
            x:["Immediate","1-year","2-year","3-year","4-year","5-year"],
            y:y3_val,
            name: "Cancer"
        }]
        let plot2_layout = {
            xaxis: {
                type: 'category',
                title: 'Time'
            },
            yaxis: {
                range:[0,y_max],
                title: "Risk (%)"
            },
            margin: {
                t: 50
            },
            title: "Plot 2",
        };
        plotly.newPlot( plotDiv, plot2_data, plot2_layout,{responsive:true})
    }

    let rootElement = document.getElementById("plotDiv")
    rootElement.innerText = ""
    if (!data.headers.includes("CIN2+ SE immediate")) return

    // make plot1....
    makePlot1(data,rootElement)
    makePlot2(data,rootElement)
}

async function displayTable(data){
    makeCards(data)
    makeTable(data)
}

function nextQuestion(questionName,rootElement){
    buildQuestion(questions[questionName],rootElement)
}

function addOptionsToSelect(selectElement,value,html){
    let optionElement = document.createElement("option")
    optionElement.value=value
    optionElement.innerHTML = html
    selectElement.add(optionElement)
    return optionElement;
}

function questionsAboutTable(questionResponse,divElement){
    

    function buildTableQuestion(question, wrapper) {
        let { questionElement, selectElement } = createQuestionElement(question.name, question.name)
        questionElement.classList.add("col")

        let optionElement = addOptionsToSelect(selectElement, 0, " --Please choose an option-- ")
        // add option elements for each allowedValue
        question.allowedValues.forEach((value, index) => {
            // create the option element...
            optionElement = addOptionsToSelect(selectElement, index + 1, value)
        })
        // deal with the event listener
        selectElement.addEventListener("change", (event => {
            let colNames = questionResponse.cols.reduce((acc, cv) => {
                acc.push(cv.name)
                return acc
            }, [])

            let selectionObj = Array.from(wrapper.querySelectorAll("select")).reduce((acc, cv) => {
                acc[cv.name] = {
                    value: cv.value,
                    text: cv.item(cv.value).innerText
                }
                acc.ok = (cv.value > 0) && acc.ok
                return acc
            }, { ok: true })
            let cntNone = colNames.reduce((acc, col) =>
                (selectionObj[col].text == "None")?(acc + 1):acc
                , 0)
            // the user has selected "None" and "None"... not 
            // a valid case..  Dont display anything and dont
            // waste time reading the data...
            if (cntNone > 1) return 

            if (selectionObj.ok){
                read_xl(questionResponse.table).then(data => {
                    //filter the table...
                    colNames.forEach( colToFilter => {
                        if (selectionObj[colToFilter].text != "None" ){
                            data.rows = data.rows.filter( (row,indx) => {
                                return row[colToFilter] == selectionObj[colToFilter].text
                            })
                        } else {                        
                            // the user selected None, either.  Select the all row, or dont filter...
                            let obj=data.rows.reduce( (acc,current,indx)=>{
                                acc.hasAll= current[colToFilter] == "ALL" || acc.hasAll
                                if (acc.hasAll){
                                    acc.row = indx
                                }
                                return  acc
                            },{hasAll:false,row:null})
                            /* WARNING:  This has potential for problems.  If 
                               we only select 1 row and then filter out the row
                               in the next iteration of the column name loop,
                               we run the risk of having no data! */
                            if (obj.hasAll){
                                data.rows = [ data.rows[obj.row] ]
                            }
                        }
                        displayTable(data)
                    })
                    makePlots(data)
                });
            }
        }))
        wrapper.insertAdjacentElement("beforeend", questionElement)
    }

 

    // create a wrapper div to hold the table related questions...
    let rowDiv = document.createElement("div")
    rowDiv.classList.add("row")
    questionResponse.cols.map((col) => buildTableQuestion(col,rowDiv))
    divElement.insertAdjacentElement("beforeend",rowDiv)
}

function buildEventListener(question,rootElement){
    return function(event){
        clearNextQuestions(this)
        if (event.target.value>0){
            let selection = event.target.value - 1

            // we can have both cols/table 
            // if cols first display the two questions...
            // else if tables display the table.  if neither
            // probably need to just ask the next question
            if (question.responses[selection].cols){
                questionsAboutTable(question.responses[selection],rootElement)
            } else if (question.responses[selection].table){
                read_xl(question.responses[selection].table).then( data => displayTable(data))
                //displayTable(question.responses[selection].table)
            }
            if (question.responses[selection].next){
                nextQuestion(question.responses[selection].next,rootElement)
            }
        }
    }
}


function createQuestionElement(name,labelText){
    // create question div
    let questionElement = document.createElement("div")
    questionElement.classList.add("question")
    questionElement.classList.add("my-3")

    // create the label and add to the div
    let labelElement = document.createElement("label")
    labelElement.innerHTML = labelText
    labelElement.htmlFor = name
    questionElement.insertAdjacentElement("beforeend",labelElement)

    // create the select and all the option elements...
    let selectElement = document.createElement("select")
    selectElement.id = name
    selectElement.name = name
    selectElement.classList.add("form-select")
    questionElement.insertAdjacentElement("beforeend",selectElement)
    
    return {questionElement,selectElement}
}

function buildQuestion(question,rootElement){
    document.querySelector("#tableDiv").style.display="none"
    let {questionElement,selectElement}=createQuestionElement(question.name,question.text)
    rootElement.insertAdjacentElement("beforeend",questionElement)

    // add options
    let optionElement = document.createElement("option")
    optionElement.value="0"
    optionElement.innerText=" --Please choose an option-- "
    selectElement.insertAdjacentElement("beforeend",optionElement)
    question.responses.forEach( (response,index) => {
        let optionElement = document.createElement("option")
        optionElement.value=index+1
        optionElement.innerHTML = response.text
        selectElement.insertAdjacentElement("beforeend",optionElement)
    })

    // create an empty div for the next question...
    // this way we can clear any question
    let emptyElement = document.createElement("div")
    emptyElement.id=`${question.name}_nq`
    selectElement.addEventListener("change",buildEventListener(question,emptyElement))
    questionElement.insertAdjacentElement("beforeend",emptyElement)
}

document.addEventListener("DOMContentLoaded",(event)=>{
    fetch(`../data/config.json`)
    .then( (body)=>body.json())
    .then( json => config=json)


    let rootElement = document.querySelector("form")
    buildQuestion(questions.question1,rootElement)
})

function clin_res(element){
    if (element.dataset.value == "research"){
        document.querySelectorAll('[data-research-only]').forEach(x=>x.classList.remove("d-none"))
        document.querySelectorAll('[data-clinical-only]').forEach(x=>x.classList.add("d-none"))
    } else {
        document.querySelectorAll('[data-research-only]').forEach(x=>x.classList.add("d-none"))
        document.querySelectorAll('[data-clinical-only]').forEach(x=>x.classList.remove("d-none"))       
    }
}
document.querySelectorAll('input[name="res_clin"]').forEach( x=> x.addEventListener("change",(event)=>{
    clin_res(event.target)
}))
