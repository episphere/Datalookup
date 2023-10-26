import {read_excel_url} from './read_xl.js'

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
                table: "General Table for Screening/No history cotest with genotyping.xlsx"
            },
            {
                text:"No",
                table: "General Table for Screening/No history cotest.xlsx"
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
                table: "General Table for Surveillance/Past_HPVnegative_ASCUS.xlsx"
            },
            {
                text:"HPV-negative LSIL",
                table: "General Table for Surveillance/Past_HPVnegative_LSIL.xlsx"
            },
        ]
    },
    question5: {
        name: "question5",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Screening/Past_cotestnegative_cotest with genotyping.xlsx"
            },
            {
                text:"No",
                table: "General Table for Screening/Past_cotestnegative_cotest.xlsx"
            },
        ]
    },
    question6: {
        name: "question6",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Screening/Past_HPVnegative_cotest with genotyping.xlsx"
            },
            {
                text:"No",
                table: "General Table for Screening/Past_HPVnegative_cotest.xlsx"
            },
        ]
    },
    question7: {
        name: "question7",
        text:"HPV genotyping known?",
        responses:[
            {
                text:"Yes",
                table: "General Table for Surveillance/Past_HPVpositive_NILM with genotyping.xlsx"
            },
            {
                text:"No",
                table: "General Table for Surveillance/Past_HPVpositive_NILM.xlsx"
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
                table: "General Table for Post-Colpo/Post-Colpo.xlsx"
            }, 
        ]
    },
    question9: {
        name: "question9",
        text: "What was the last screening result(s) after the biopsy?",
        responses: [
            {
                text: "Cotest-negative",
                table: "General Table for Post-Colpo/Post-Colpo_Past_Cotestnegative.xlsx"
            },
            {
                text: "Cotest-negative x2",
                table: "General Table for Post-Colpo/Post-Colpo_Past_Cotestnegative_x2.xlsx"
            },
            {
                text: "HPV-negative",
                table: "General Table for Post-Colpo/Post-Colpo_Past_HPVnegative.xlsx"
            },
            {
                text: "HPV-negative x2",
                table: "General Table for Post-Colpo/Post-Colpo_Past_HPVnegative_x2.xlsx"
            },
            {
                text: "HPV-negative ASC-US/LSIL",
                table: "General Table for Post-Colpo/Post-Colpo_LowGrade_Past_HPVnegative_ASCUSorLSIL.xlsx"
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
                table: "General Table for Post-Treatment/Post-Treatment_no past.xlsx"
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
        let bodyRow = bodyElement.insertRow()
        bodyRow.insertCell()
        data.headers.forEach( col => {
            let cell = bodyRow.insertCell();
            cell.innerText = row[col] || " ";
        });
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
    // add the table
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

async function displayTable(tableName,selectElement){
    let data = await read_xl(tableName)
    makeCards(data)
    makeTable(data)
}

function nextQuestion(questionName,rootElement){
    buildQuestion(questions[questionName],rootElement)
}

function buildEventListener(question,rootElement){
    return function(event){
        clearNextQuestions(this)
        if (event.target.value>0){
            let selection = event.target.value - 1
            if (question.responses[selection].table){
                displayTable(question.responses[selection].table,this)
            }
            if (question.responses[selection].next){
                nextQuestion(question.responses[selection].next,rootElement)
            }
        }
    }
}

function buildQuestion(question,rootElement){
    document.querySelector("#tableDiv").style.display="none"
    // create question div
    let questionElement = document.createElement("div")
    questionElement.classList.add("question")
    questionElement.classList.add("my-3")
    rootElement.insertAdjacentElement("beforeend",questionElement)

    // create the label and add to the div
    let labelElement = document.createElement("label")
    labelElement.innerHTML = question.text
    questionElement.insertAdjacentElement("beforeend",labelElement)

    // create the select and all the option elements...
    let selectElement = document.createElement("select")
    selectElement.id = question.name
    selectElement.name = question.name
    selectElement.classList.add("form-select")
    questionElement.insertAdjacentElement("beforeend",selectElement)
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