        function printDiv(divID) {
            //Get the HTML of div
            var divElements = document.getElementById(divID).innerHTML;
            //Get the HTML of whole page
            var oldPage = document.body.innerHTML;

            //Reset the page's HTML with div's HTML only
            document.body.innerHTML = "<html><head><title></title></head><body><br><br><br>" + divElements + "</body></html>";

            //Print Page
            window.print();

            //Restore orignal HTML
            document.body.innerHTML = oldPage;
        }

        

        const mentorTable = document.querySelector(".table.table-hover")
        // const internTable = document.querySelector("#table_interns table")
        const tableHeaders = document.querySelectorAll('#my-table thead tr th');
        
        let sortDirection = false;
        
        //To create pages for the Mentor and Intern tables
        const createPages =(tableDivId)=>{
            let box = paginator({
                table: document.getElementById(tableDivId).getElementsByTagName("table")[0],
                box_mode: "list",
        });
            box.className = "box";
            document.getElementById(tableDivId).appendChild(box);
        }

        createPages("printablediv")
        // createPages("table_interns")
        
        
        //To convert the HTML table to an Array of Objects
        const tableToArray=(table)=>{
            let data = [];
            // first row needs to be headers
            let headers = [];
            let test = [];
            for(let i=0; i<table.rows[0].cells.length; i++){
    
                headers[i]=table.rows[0].cells[i].dataset.heading
                
            }
                data.push(headers);

            //iterate through the cells
            for(let i=1; i<table.rows.length; i++){
                let tableRow = table.rows[i];
                let rowData = {};

                for(let j=0; j<tableRow.cells.length; j++){
                rowData[headers[j]] = tableRow.cells[j].innerHTML;
                }
                data.push(rowData)
            }
            return data
        }

        //stores respective HTML tables in variables in the form of arrays
        const mentorData = tableToArray(mentorTable)
       
        
        // const internData = tableToArray(internTable)

        
    //This function creates tableRows when fed an array of objects. 
        const loadTable=(userData, tableBody)=>{
            
            let sn = 1
            let dataHTML = '';
            userData.forEach((user, index)=>{
                
                if(!Array.isArray(user)){
                    dataHTML += `<tr>
                        <td>${sn++}</td>
                        <td>${user.expertise}</td>
                        <td>${user.photo}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        
                        <td>${user.cv}</td>
                        <td>${user.interest}</td>
                        <td>${user.state}</td>
                        <td>${user.employment-status}</td>
                        <td>${user.timestamp}</td>
                    </tr>`
                }
            })
            tableBody.innerHTML = dataHTML;
        }
        
                 
    //Series of functions which work in tandem to sort data when sortup or sort down icon is clicked
        const sortColumn =(columnName,userData,tableBody)=>{
            const dataType = typeof userData[1][columnName];
            
            sortDirection = !sortDirection;
           
            switch(dataType){
                case 'number':
                        
                    sortNumberColumn(sortDirection, columnName,userData, tableBody);
                    break;
                case 'string':
                        
                    sortStringColumn(sortDirection, columnName,userData, tableBody);
                    break;
            }
            // loadTable(userData,tableBody)
        }

        const sortNumberColumn =(sortDirection,columnName)=>{
            userData = userData.sort((u1, u2)=>{
                return sortDirection ? u1[columnName] - u2[columnName] : u2[columnName] - u1[columnName] 
            })
        }

        const sortStringColumn =(sortDirection,columnName,userData, tableBody)=>{
            // console.log(userData)
            modifiedUserData = userData.slice(1, userData.length)
            
            if(sortDirection){
                userData =  modifiedUserData.sort((u1, u2)=> (u1[columnName].toLowerCase() > u2[columnName].toLowerCase()) ? 1: ((u2[columnName].toLowerCase() > u1[columnName].toLowerCase())? -1 : 0 ))
            }else{
                userData = modifiedUserData.sort((u1, u2)=> (u1[columnName].toLowerCase() > u2[columnName].toLowerCase()) ? 1: ((u2[columnName].toLowerCase() > u1[columnName].toLowerCase())? -1 : 0 )).reverse()
            }
            
            loadTable(userData,tableBody)
        }

        
        tableHeaders.forEach(tableHeader => {
            tableHeader.addEventListener('click', (e)=>{
            
            if(e.target.tagName == 'I'){
                const tableBody = e.target.parentElement.parentElement.parentElement.nextElementSibling
    
                const columnName = e.target.parentElement.dataset.heading
                
                    sortColumn(columnName, mentorData,tableBody)
                    Array.from(e.target.parentElement.children).forEach(child=>{
                    child.style.display = ""
                })
                    e.target.style.display = "none"         
                }
        })
    })

    

    /////////EXPORT TO PDF//////////////////////////////////////////             
    const getPDF =()=>{
        let doc = new jsPDF()
        doc.autoTable({html: '.table.table-hover'});
        doc.save('Lists.pdf')
    }
    
   
                 
    /////////EXPORT TO CSV/////////////////////////////////////////
    const objectToCSV =(data)=>{
        const csvRows = [];
        let values = [];        
        //get the headers
        headers = [...data[0]]
        csvRows.push(headers.join(','));
        console.log(headers)
        //loop over the rows
        for(const row of data){
            if (!Array.isArray(row)){
                    values = headers.map(header =>{
                    const escQuotes = (''+row[header]).replace(/"/g, '\\"')
                    return `"${escQuotes}"`
                })
                csvRows.push(values.join(','))
            }
        }
        console.log(csvRows)
        //form escaped CSVs
        return csvRows.join('\n')
    }

    const download =(data)=>{
        const blob = new Blob([data], {type: 'text/csv'});
        console.log(blob)
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'download.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a)
    }

    const getCSV =()=>{
        const csvData = objectToCSV(mentorData)
        download(csvData)
    }

    
    ////////////////////SEARCH//////////////////////////////////
    const searchBox = document.querySelector('.searchBox');
    const filterEntries =()=>{
        const entries = document.querySelectorAll('tbody tr');
        const searchBoxValue = searchBox.value.toLowerCase();
    
        entries.forEach(entry=>{
            let rowContent = []
            entry.querySelectorAll('td').forEach(td=>{
                rowContent.push(td.textContent)
            })
            rowContent = rowContent.join(' ').toLowerCase();
            if(rowContent.indexOf(searchBoxValue) === -1){
                entry.style.display = "none";
            }else{
                entry.style.display = "";
            }
        })
    }
    

    ////////////////Event Listeners////////////////////////////////////////
    const exportAs = document.querySelector("#exportAs");
    const overlay = document.querySelector('#overlay')
    const exportModal = document.querySelector('#export-modal')
    searchBox.addEventListener('keyup', filterEntries)
    exportAs.addEventListener('click',()=>{
        overlay.classList.add('visible')
        exportModal.classList.add('visible')
    })
    overlay.addEventListener('click',()=>{
        overlay.classList.remove('visible')
        exportModal.classList.remove('visible')
    })
    exportModal.addEventListener('click', ()=>{
        if(event.target.id === "download"){
            const radioBtn = document.querySelectorAll('input[name="exportOptions"]')
            if(radioBtn[0].checked){
                getCSV()
            }else if(radioBtn[1].checked){
                getPDF()
            }else{
                document.querySelector('#message').innerHTML = `<span style="color:red; position:absolute; left:13%; width:100%;">You've not selected an option</span>`
                setTimeout(()=>{
                    document.querySelector('#message').innerHTML  = '';
                }, 2000)
            }
        }
    } )

    /////////More Details SideBar/////////////////////////////////////////

   
    const prev = document.querySelector('.left');
    const next = document.querySelector('.right');
    const navigator = document.querySelector('#navigator')
    let row = 0;
    
    const populateDetails =(id, row)=>{
        document.getElementById('sn').innerHTML = mentorData[row]["sn"]
        if(id !== 'cv'){
            document.getElementById(id).innerHTML = mentorData[row][id]
        }else if(id == 'cv'){
            let link = document.createElement("a");
            link.setAttribute("href", mentorData[row][id]);
            link.setAttribute("target", "_blank");
            link.textContent = mentorData[row][id];
            if(document.getElementById(id).firstChild){
                document.getElementById(id).removeChild(document.getElementById(id).firstChild)
            }
            document.getElementById(id).appendChild(link)
        }
       
        
    }
    const iterateRow =(e)=>{
        let dataRow = document.querySelectorAll('#my-table tbody tr');
        let details = document.querySelectorAll('.details span')
        dataRow = Array.from(dataRow)
    
        if(dataRow.indexOf(e.target.parentElement) >= 0){
            document.getElementById("no-intern").innerHTML = "";
            navigator.classList.add('active');
            row = dataRow.indexOf(e.target.parentElement) + 1;
            details.forEach(detail =>{
                populateDetails(detail.id, row)
            })
        }else if(e.target.classList.contains("navigator")){
            
            if(e.target.classList.contains("right")){
                if(row > dataRow.length){
                    row = 1
                }
            }else if(e.target.classList.contains("left")){
                if(row === 0){
                    row = dataRow.length
                }
            }
           
            details.forEach(detail =>{
                
                populateDetails(detail.id, row)
            })
        }
        
    }
    
    
   
    
    mentorTable.addEventListener('click', (e)=>{
       iterateRow(e)
        
    })

   
    //////////Details SideBar Navigation////////////////////////////////////////
    
        // const placeholder = document.querySelector('.did-you-know p')
       
        
        
        const funFacts = ["Solar is a safe alternative to current fossil fuels like coal, petrol and gas. Solar panels reduce both global warming and urban heat island. The production of solar energy in cities is a way to diminish our dependence on fossil fuels and mitigate global warming by lowering the emission of greenhouse gases.", "There's enough solar energy hitting the Earth every hour to meet all of humanity's power needs for an entire year. Every ounce of oil, every lump of coal, and every cubic foot of natural gas could be left in the ground if only we could capture one hour's worth of solar energy each year. That's the scale of the opportunity.", "Solar energy has been used for over 2700 years. In 700 BC, glass lenses were used to make fire by magnifying the sun’s rays. Moreover, the Greeks and Romans were the first to use passive solar designs. Buildings with south facing windows allowed the sun to heat and light indoor spaces.", "Nearly 60 years ago, the US Navy launched Vanguard-1  — the first artificial earth satellite powered by solar cells — as a response to the Soviet Sputnik. Six decades on, it's still circling our planet. The Vanguard 1 remains the oldest manmade satellite in orbit – logging more than 6 billion miles."]
        let length = funFacts.length
        let index = 0;
        // placeholder.innerHTML = funFacts[index]
       
        
        
        const displayText =()=>{
            indicators[index].classList.add('active')
            placeholder.innerHTML = funFacts[index]
        }
        
        // indicatorBox.addEventListener('click', e =>{
            
        //     if(e.target.classList.contains('indicator')){
        //         if(!e.target.classList.contains('active')){
        //             indicators[index].classList.remove('active')
        //             index = indicators.indexOf(e.target)
        //             displayText()
        //         }
        //     }
        // })

        next.addEventListener('click', (e)=>{
            console.log(e.target.className)
            row++
            iterateRow(e)
            
            // console.log(row)
        //     indicators[index].classList.remove('active')
        //     if(index === length - 1){
        //         index = 0
        //     }else{
        //         index++
        //     }
        //    displayText()
        })

        prev.addEventListener('click', (e)=>{
            row--
            iterateRow(e)
            // console.log(row)
            // indicators[index].classList.remove('active')
            // if(index === 0){
            //     index = length - 1
            // }else{
            //     index --
            // }
            // displayText()
        })


        
        
