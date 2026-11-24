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
            // extract class information
            var classInfo = data["@graph"][i]["@type"].split("/").pop()
            // extract entity id
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

         // sort array alphabetically by title
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

         // map for relationships lookup
            const mapRelations = new Map();
            for (const node of data["@graph"]) {
               if (node["@id"]) {
                  mapRelations.set(node["@id"], node)
               }
            }

            function getClassInfo(graph_node) {
               if (!graph_node) return "";
               const relEntityClass = graph_node.split("/")[5]
               return String(relEntityClass)
            }

            function getGraphNodeLabel(node_or_uri) {
               if (!node_or_uri) return "";
               if (typeof node_or_uri === "string") {
                  const target = mapRelations.get(node_or_uri);
                  return target ? extractTitle(target["gbo:hasTitle"] ?? target["rdfs:label"]) || node_or_uri : node_or_uri;
               }
               if (typeof node_or_uri === "object") {
                  const id = node_or_uri["@id"];
                  const target = id ? mapRelations.get(id) : null;
                  const raw = target["gbo:hasTitle"] ?? target["rdfs:label"] ?? node_or_uri["gbo:hasTitle"] ?? node_or_uri["rdfs:label"] ?? id;
                  return extractTitle(raw) || String(id ?? "");
               }
               return String(node_or_uri);
            }

            const keysPropertiesArray = ["crm:P50_has_current_keeper", "schema:author", "schema:contributor", "time:hasBeginning", "time:hasEnd", "lrmoo:R2_is_derivative_of", "gbo:hasSourceWork", "schema:birthPlace", "schema:deathPlace", "lrmoo:R3_is_realised_in", "gbo:hasCompositionSpan", "lrmoo:R5i_is_component_of", "lrmoo:R4_is_embodied_in", "lrmoo:R71i_is_part_of", "lrmoo:R7i_is_exemplified_by", "gbo:isIncludedInVolume", "gbo:isIncludedInPeriodical", "gbo:publisher", "rdam:P30088_has_place_of_publication", "gbo:isCarriedBy", "gbo:carries", "gbo:hasPeriodicalIssue", "gbo:hasPeriodical", "rdai:P40069_has_related_work_of_item", "rdam:P30135_has_work_manifested", "lrmoo:R4i_embodies", "lrmoo:R7_exemplifies", "rdaw:P10072_has_manifestation_of_work", "rdaw:P10310_has_related_item_of_work"]

            function extractUrisFromKeys(entity, keys) {
               if (!entity || !Array.isArray(keys)) return [];

               const uniqueUris = new Set();

               for (const key of keys) {
                  const rawValue = entity[key];
                  if (!rawValue) continue;

                  const items = Array.isArray(rawValue) ? rawValue : [rawValue];
                  for (const entry of items) {
                     const uri = typeof entry === "string" ? entry : entry?.["@id"];
                     if (typeof uri === "string" && uri.length > 0) {
                        uniqueUris.add(uri);
                     }
                  }
               }

               return Array.from(uniqueUris);
            }

               // Populate divs with data from graph
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

                  // populating div with related entities
                  const relByClassMap = new Map();
                  
                  // Function call
                  const relatedEntities = extractUrisFromKeys(publication, keysPropertiesArray);

                  for (const uri of relatedEntities) {
                     const graphNode = mapRelations.get(uri);
                     const graphClass = graphNode ? getClassInfo(targetNode) : "ClassUnknown";
                     const graphLabel = getGraphNodeLabel(graphNode || uri);

                     if (!relByClassMap.has(graphClass)) {
                        relByClassMap.set(graphClass, []);
                     }
                     relByClassMap.get(graphClass).push({uri, label: graphLabel});
                  }

                  // Create divs based on classes type
                  for (const [classType, values] of mapRelations.entries()) {
                     if (!Array.isArray(values)) {
                     //console.warn("Expected array for classType, got:", classType, entries);
                     //console.log(classType, values)
                     continue;
                     }

                     const classDiv = document.createElement("div");
                     classDiv.dataset.classType = classType;

                     const classTitle = document.createElement("h4");
                     classTitle.textContent = classType;
                     classDiv.appendChild(classTitle);

                     for (const relation of values) {
                        const entry = document.createElement("div");
                        entry.textContent = String(relation);
                        classDiv.appendChild(entry);
                     }
                     itemDiv.appendChild(classDiv);
                  }

                  pubDiv.appendChild(itemDiv)
               }
               divCase1.appendChild(pubDiv)

               // poi lookup per relazioni con altre entità
         })
   .catch(console.error);
});