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
        store.createIndex("Name_IX", "name", { unique: true });
        store.createIndex("Long_and_Lat_IX", ["long", "lat"], {
          unique: false,
        }); 

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
                mountain_data_upto_date_ix=false;
                sessionStorage.setItem("mountain_data_upto_date_ix", false);
                
                InitMountainData();
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
            url: '/js/mountains.json',
            dataType: "json",
            jsonp: true,
            success: function (mounts) {

                const dbOpenRequest = indexedDB.open("MOUNTAINS_DB", 1);
                dbOpenRequest.onsuccess = function () {

                    var database = dbOpenRequest.result;

                    const tran = database.transaction("Mountains", "readwrite");
                    const mountains = tran.objectStore("Mountains");
                    var _id = 0;

                    mounts.forEach(mount => {
                        console.log({ name: mount.name, long: mount.long, lat: mount.lat, alt: mount.alt, cont: mount.cont });
                        mountains.put({ name: mount.name, long: mount.long, lat: mount.lat, alt: mount.alt, cont: mount.cont });
                        _id++;
                    });
                };

                dbOpenRequest.oncomplete = function () {
                    database.close();
                };

                sessionStorage.setItem("mountain_data_upto_date_ix", true);
            }
        });
    }


    $( "#slider" ).slider({
        range: true,
       
        min: 500,
        max: 9000,
        step: 100,
        values: [ 8000, 8890 ],
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

                console.log("loading mountain data for : ", {altitudeStarts}, {altitudeEnds}, {continent});

                const dbOpenRequest = indexedDB.open("MOUNTAINS_DB", 1);
                dbOpenRequest.onsuccess = function () {

                    var database = dbOpenRequest.result; 
                    const tran = database.transaction("Mountains", "readwrite");

                    const mountains = tran.objectStore("Mountains"); 
                    const range = IDBKeyRange.bound(altitudeStarts, altitudeEnds);
                    const query = mountains.index('Alt_IX').openCursor(range, 'prev');
                
                    $("#MountList tbody").remove();

                // Iterate over the results and log them to the console
                query.onsuccess = (event) => {
                    const cursor = event.target.result;
                     
                  // console.log(cursor.key, cursor.value);
                        
                    if (cursor) {
                            
                            var data = cursor.value;

                            $tempItem = $mountItemTemplate.clone();

                            $tempItem.find(".name").text(data.name);
                            $tempItem.find(".altitude").text(data.alt);
                            $tempItem.find(".coords").text(data.lat+"-"+data.long);
                            $tempItem.find(".countinent").text(data.cont);
                            
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
    

});
