// A $( document ).ready() block.
$( document ).ready(function() {
   
     $mountItemTemplate=$(".mount-item-template").first().clone();
     $MountList=$("#MountList");

    // 1
    const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

    if (!indexedDB) {
        console.log("IndexedDB could not be found in this browser.");
    }

    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      
      var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      
      var blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
      var yellowIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      
    var markers = new Array();
    const map = L.map('map').setView([28.0123,86.7790], 5);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var mountain_data_upto_date_ix = sessionStorage.getItem("mountain_data_upto_date_ix");

    console.log({mountain_data_upto_date_ix});

    if(!mountain_data_upto_date_ix || mountain_data_upto_date_ix=='false')
    {
        mountain_data_upto_date_ix=false;
        deleteRequest = indexedDB.deleteDatabase("MOUNTAINS_DB");
    }
    
    // 2
    const request = indexedDB.open("MOUNTAINS_DB", 1);
    
    request.onerror = function (event) {
        console.error("An error occurred with IndexedDB");
        console.error(event);
     };
     var db=null;

     request.onupgradeneeded = function () {
       
         db = request.result;
        const store = db.createObjectStore("Mountains", { keyPath: "id",autoIncrement:true });
      
        store.createIndex("Lat_IX", "lat", { unique: false });
        store.createIndex("Long_IX", "long", { unique: false });
        store.createIndex("Alt_IX", "alt", { unique: false });
        store.createIndex("Cont_IX", "cont", { unique: false });
        store.createIndex("Name_IX", "name", { unique: false });

        // store.createIndex("Long_and_Lat_IX", ["long", "lat"], {
        //   unique: false,
        // }); 

    };


    request.onsuccess = function () {
      
        const db = request.result;
        const transaction = db.transaction("Mountains", "readwrite");
        const store = transaction.objectStore("Mountains");

    //     const altIndex = store.index("Alt_IX");
    //     const makeModelIndex = store.index("Long_and_Lat_IX");

        //3
        //store.put({ id: 1, name: "Annapurna", long: 83.8203, lat: 28.5961, alt:8091, cont:"Asia" });
        
        // store.put({ id: 3, colour: "Blue", make: "Honda" });
        // store.put({ id: 4, colour: "Silver", make: "Subaru" });
        
        // //4
         const firstItemQuery = store.get(1);
        // const colourQuery = colourIndex.getAll(["Red"]);
        // const colourMakeQuery = makeModelIndex.get(["Blue", "Honda"]);
      
        // // 5
        firstItemQuery.onsuccess = function () {

            if(!(firstItemQuery.result))
            {
                // mountain_data_upto_date_ix=false;
                // sessionStorage.setItem("mountain_data_upto_date_ix", false);
                
              //  InitMountainData();
            }

          //console.log('idQuery', firstItemQuery.result);
        };

        // colourQuery.onsuccess = function () {
        //   console.log('colourQuery', colourQuery.result);
        // };
        // colourMakeQuery.onsuccess = function () {
        //   console.log('colourMakeQuery', colourMakeQuery.result);
        // };
      
        // 6
        transaction.oncomplete = function () {
          db.close();
        };

      };


      if(!mountain_data_upto_date_ix)
      {
          InitMountainData();
      }
    

      
    function InitMountainData() {
        $.ajax({
            type: "GET",
            url: 'js/index.json',
            dataType: "json",
            jsonp: true,
            success: function (data) {
                
               mounts = data.features;
                //console.log(mounts);

                const dbOpenRequest = indexedDB.open("MOUNTAINS_DB", 1);
                dbOpenRequest.onsuccess = function () {

                    var database = dbOpenRequest.result;
                    const tran = database.transaction("Mountains", "readwrite");
                    const mountains = tran.objectStore("Mountains");
                    var _id = 0;
 
                    tran.addEventListener("error", (e) => {
                        console.log(e);
                    });

                    mounts.forEach(mount => {
                        var currentMount = mount.properties;
                        //  console.log(currentMount);
                        // console.log({ name: mount.name, long: mount.long, lat: mount.lat, alt: mount.alt, cont: mount.cont });
                        mountains.put({ name: currentMount.name, 
                            long: currentMount.longitude,
                             lat: currentMount.latitude, 
                            alt: currentMount.meters, 
                            cont: currentMount.continent, 
                            country: currentMount.countries!=null && currentMount.countries.length>0? currentMount.countries[0]:"Unknown" });


                      //  mountains.put({ name: mount.name, long: mount.long, lat: mount.lat, alt: mount.alt, cont: mount.cont, country:mount.country });

                        _id++;
                    });
                };

                dbOpenRequest.oncomplete = function () {
                    database.close();
                };

                
                // dbOpenRequest.onerror = function (e) {
                //     console.error(e);
                // };

                sessionStorage.setItem("mountain_data_upto_date_ix", true);
            }
        });
    }


    $( "#slider" ).slider({
        range: true,
       
        min: 500,
        max: 9000,
        step: 100,
        values: [ 600, 8890 ],
        slide: function( event, ui ) {
            $("#altitude-input").val( ui.values[0] + " - " + ui.values[1] +" Meters" );
        }
      });

      $( "#altitude-input" ).val( $( "#slider" ).slider( "values", 0 ) +
      " - " + $( "#slider" ).slider( "values", 1 )+" Meters" );

              
      $( ".main-header" ).text("Find Mountains in "+ $( "#slider" ).slider( "values", 0 ) + " - "+
       $( "#slider" ).slider( "values", 1 )+" Meters..." );

      setTimeout(() => {


        LoadMountainData(Number($( "#slider" ).slider( "values", 0 )), Number($( "#slider" ).slider( "values", 1 )))
        
      }, 500);

      $( "#slider" ).on( "slidechange", function( event, ui ) {

        $( "#altitude-input" ).val( $( "#slider" ).slider( "values", 0 ) +
        " - " + $( "#slider" ).slider( "values", 1 )+" Meters..." );
        
        $( ".main-header" ).text("Find Mountains in "+ $( "#slider" ).slider( "values", 0 ) + " - "+
        $( "#slider" ).slider( "values", 1 )+" Meters..." );
 
        LoadMountainData(Number($( "#slider" ).slider( "values", 0 )), Number($( "#slider" ).slider( "values", 1 )))

      });


        function LoadMountainData(altitudeStarts, altitudeEnds, continent) {

                //console.log("loading mountain data for : ", {altitudeStarts}, {altitudeEnds}, {continent});

                const dbOpenRequest = indexedDB.open("MOUNTAINS_DB", 1);
                dbOpenRequest.onsuccess = function () {

                    var database = dbOpenRequest.result; 
                    const tran = database.transaction("Mountains", "readwrite");

                    const mountains = tran.objectStore("Mountains"); 
                    const range = IDBKeyRange.bound(altitudeStarts, altitudeEnds);
                    const query = mountains.index('Alt_IX').openCursor(range, 'prev');
                
                    $("#MountList tbody").remove();

                    for(i=0;i<markers.length;i++) {
                        map.removeLayer(markers[i]);
                    }
                    
                // Iterate over the results and log them to the console
                query.onsuccess = (event) => {
                    const cursor = event.target.result;
                     
                  // console.log(cursor.key, cursor.value);
                        
                    if (cursor) {
                            
                            var data = cursor.value;

                            var icon= yellowIcon;
                            if(data.alt>6000) {icon=redIcon; } 
                            else if(data.alt>4000) {icon=blueIcon ;} 
                            else if(data.alt>2500) { icon=greenIcon;}


                           var newMarker= L.marker([data.lat, data.long], {icon: icon}).addTo(map).bindPopup(data.name);
                            markers.push(newMarker);

                            $tempItem = $mountItemTemplate.clone();

                            $tempItem.find(".name").text(data.name +" "+data.alt+" meters" );
                            $tempItem.find(".altitude").text(data.alt);
                            $tempItem.find(".coords").text( data.lat +"-"+ data.long);

                            $tempItem.find(".coords").attr("data-lat", data.lat);
                            $tempItem.find(".coords").attr("data-long", data.long);

                            $tempItem.find(".countinent").html(data.cont +" / <i class='gray'>"+data.country+"</i>");
                            
                            if((continent==null || continent==undefined) ||  data.cont == continent)
                            {
                                $("#MountList").append($tempItem);
                            }

                            cursor.continue();
                   }
            }

            dbOpenRequest.oncomplete = function () {
                database.close();
            };


      }}
    

      $( "#MountList" ).on( "click",".coords", function( e ) {

         ///alert($(this).text());
        var long=$(this).attr("data-long");
        var lat=$(this).attr("data-lat");
  
        map.flyTo([Number(lat),Number(long)], 13);
        //var urlTemplate= `https://www.openstreetmap.org/export/embed.html?bbox=${long}%2C${lat}&amp;layer=cyclosm&amp;marker=${Number(lat)-0.50}%2C${Number(long)+0.50}`;
//var urlTemplate=`https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d56409.40343241166!2d${long}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDU5JzE3LjIiTiA4NsKwNTUnMzEuMSJF!5e0!3m2!1str!2str!4v1679769627977!5m2!1str!2str`

// var urlTemplate=`https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d35515.148816007204!2d${long}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjfCsDU5JzE3LjIiTiA4NsKwNTUnMzEuMSJF!5e0!3m2!1str!2str!4v1679773167948!5m2!1str!2str`
//         console.log( $("#current-map").attr("src"));
//         console.log( urlTemplate);

//        $("#current-map").attr("src", urlTemplate);
       

      });


    

});
