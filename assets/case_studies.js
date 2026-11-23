const divCase1 = document.getElementById("case-1-sec")
const divCase2 = document.getElementById("case-2-sec")

document.addEventListener("DOMContentLoaded", (event) => {
   const jsonRequest = new Request("data/sample_data_context.json");

   fetch(jsonRequest)
      .then((response) => response.json())
      .then((data) => {
         //console.log("JSON data fetched")

         // create a container for each work and inside boxes for each publication (da cambiare)
         for (let i = 0; i < data["@graph"].length; i++) {
            var classInfo = entity[i]["@type"].split("/").pop()
            if (classInfo == "F1_Work") {
               const workDiv = document.createElement("div");
               workDiv.setAttribute("class", "work-div")
               workDiv.appendChild(document.createElement("h1")).textContent = entity["gbo:hasTitle"]
               divCase1.appendChild(workDiv)
            }
         }
   })
   .catch(console.error);
});