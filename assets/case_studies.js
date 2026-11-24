const divCase1 = document.getElementById("case-1-sec")
const divCase2 = document.getElementById("case-2-sec")

document.addEventListener("DOMContentLoaded", (event) => {
   const jsonRequest = new Request("data/sample_data_context.json");

   fetch(jsonRequest)
      .then((response) => response.json())
      .then((data) => {
         //console.log("JSON data fetched")

         // div for work buttons
         const workDiv = document.createElement("div");
         workDiv.setAttribute("class", "work-div");
         // div for publication boxes
         const pubDiv = document.createElement("div");
         pubDiv.setAttribute("class", "pub-div");
         // title array (to sort boxes later)
         var pubArray = []


         // display works and publications
         for (let i = 0; i < data["@graph"].length; i++) {
            var classInfo = data["@graph"][i]["@type"].split("/").pop()
            var entityId = data["@graph"][i]["@id"].split("/").pop()
            // exclusion lists
            var excludedWorks = ["work_notte_di_luna_2", "work_la_centrale_di_cornigliano", "work_fulmine", "work_ns"]
            var excludedPublications = ["publicationcomponent_notte_di_luna_1989", "publicationcomponent_notte_di_luna_1971", "publication_ns_1971", "publicationcomponent_la_centrale_di_cornigliano_1953", "publicationcomponent_la_centrale_di_cornigliano_1986", "publicationcomponent_la_centrale_di_cornigliano_1993"]
            var excludedExpressions = ["expression_notte_di_luna_incompiuti", "expression_la_centrale_di_cornigliano"]

            // display work buttons
            if (classInfo == "F1_Work" && !excludedWorks.includes(entityId)) {
               workDiv.appendChild(document.createElement("button")).textContent = data["@graph"][i]["gbo:hasTitle"]
               divCase1.appendChild(workDiv)
            }
            // create publication boxes
            var publicationClasses = ["Publication", "PublicationComponent"]
            if (publicationClasses.includes(classInfo) && !excludedPublications.includes(entityId)) {
               var dateSlug = data["@graph"][i]["gbo:hasIdentifier"].split("_").pop()
               // create array to sort 
               var titleLabel = data["@graph"][i]["gbo:hasTitle"] + " " + "(" + dateSlug + ")"
               
               // troubleshoot undefined item
               const entity = data["@graph"][i];
               const rawTitle = entity["gbo:hasTitle"];

               if (rawTitle === undefined || rawTitle === null || rawTitle === "") {
                  console.warn("Missing gbo:hasTitle on graph item:", {
                     index: i,
                     id: entity["@id"],
                     keys: Object.keys(entity),
                     entity
                  });
               }

               // populate publication array to sort alphabetically
               pubArray.push({
                  titleLabel,
                  "Publication type": data["@graph"][i]["gbo:hasPublicationType"],
                  "Pages": data["@graph"][i]["schema:pagination"]
               });
               //console.log(pubArray)
            }
         }
         pubArray.sort((a, b) => {
            const titleA = a.titleLabel.toLowerCase(); 
            const titleB = b.titleLabel.toLowerCase();
            if (titleA < titleB) {
               return -1;
            }
            if (titleA > titleB) {
               return 1;
            }
            return 0;
         });
               for (const publication of pubArray) {
                  const itemDiv = document.createElement("div");
                  itemDiv.appendChild(document.createElement("h3")).textContent = publication.titleLabel
                  //pubDiv.appendChild(itemDiv)

                  // div for metadata list
                  const pubMeta = document.createElement("ul")
                  pubMeta.setAttribute("class", "metadata-ul")

                  // conditional blocks for additional metadata properties
                  if (publication["Publication type"]) {
                     const liPubType = document.createElement("li");
                     liPubType.textContent = "Tipo di pubblicazione:" + " " + publication["Publication type"]
                     pubMeta.appendChild(liPubType)
                  }

                  if (publication["Pages"]) {
                     const liPages = document.createElement("li");
                     liPages.textContent = "Pagine:" + " " + publication["Pages"]
                     pubMeta.appendChild(liPages)
                  }
                  if (pubMeta.hasChildNodes()) {
                     itemDiv.appendChild(pubMeta)
                  }

                  pubDiv.appendChild(itemDiv)
               }
               divCase1.appendChild(pubDiv)

               // poi lookup per relazioni con altre entità
   })
   .catch(console.error);
});