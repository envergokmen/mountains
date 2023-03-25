// A $( document ).ready() block.
$( document ).ready(function() {
   
    // const request = window.indexedDB.open('MOUNTAINS_DB', 1);

    // request.onerror = (event) => {
    //     // Do something with request.errorCode!
    //   };
    //   request.onsuccess = (event) => {
    //     // Do something with request.result!
    //   };

    //  window.indexedDB.deleteDatabase('MOUNTAINS_DB', 1);


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

    if(!mountain_data_upto_date_ix)
    {
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
        //1
         db = request.result;
      
        //2
        const store = db.createObjectStore("Mountains", { keyPath: "id",autoIncrement:true });
      
        //3
        store.createIndex("Lat_IX", ["lat"], { unique: false });
        store.createIndex("Long_IX", ["long"], { unique: false });
        store.createIndex("Alt_IX", ["alt"], { unique: false });
        store.createIndex("Cont_IX", ["cont"], { unique: false });
        store.createIndex("Name_IX", ["name"], { unique: true });
 
        // 4
        store.createIndex("Long_and_Lat_IX", ["long", "lat"], {
          unique: false,
        }); 
    };


    request.onsuccess = function () {
    //     console.log("Database opened successfully");
      
        const db = request.result;
    //// 1
        const transaction = db.transaction("Mountains", "readwrite");
      
    //     //2
         const store = transaction.objectStore("Mountains");
    //     const altIndex = store.index("Alt_IX");
    //     const makeModelIndex = store.index("Long_and_Lat_IX");

        //3
        //store.put({ id: 1, name: "Annapurna", long: 83.8203, lat: 28.5961, alt:8091, cont:"Asia" });
        
        // store.put({ id: 3, colour: "Blue", make: "Honda" });
        // store.put({ id: 4, colour: "Silver", make: "Subaru" });
        
        // //4
        // const idQuery = store.get(4);
        // const colourQuery = colourIndex.getAll(["Red"]);
        // const colourMakeQuery = makeModelIndex.get(["Blue", "Honda"]);
      
        // // 5
        // idQuery.onsuccess = function () {
        //   console.log('idQuery', idQuery.result);
        // };
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
          $.ajax({
              type: "GET",
              url: '/js/mountains.json',
              dataType: "json",
              jsonp: true,
              success: function(mounts) {
                 
                const request2 = indexedDB.open("MOUNTAINS_DB", 1);
                
                request2.onsuccess = function () {

                    var db2 = request2.result;
                   
                    const transaction2 = db2.transaction("Mountains", "readwrite");
                    const store2 = transaction2.objectStore("Mountains");
                    var _id=0;

                    mounts.forEach(mount=>  {
                        store2.put({ name: mount.name, long: mount.long, lat: mount.lat, alt:mount.alt, cont: mount.cont});  
                        _id++;
                      });
                    }

                    request2.oncomplete = function () {
                        db2.close();
                 };
              
                  sessionStorage.setItem("mountain_data_upto_date_ix",true);
              }
          });
      }



/*
    var db = openDatabase('MOUNTAINS_DB', '1.0', 'Mountains Database', 2 * 1024 * 1024);  

    var totalMountain=0;

    var mountain_data_upto_date = sessionStorage.getItem("mountain_data_initilized");

    db.transaction(function (tx) { 
        
        if(!mountain_data_upto_date)
        {
            tx.executeSql('DROP TABLE Mountains');  
        }
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS Mountains (name,long,lat,alt,cont)'); 
    });  

    db.transaction(function (tx) { 
    tx.executeSql('SELECT count(*) as TotalCount FROM Mountains', [], function (tx, results) { 
        totalMountain = Number(results.rows.item(0).TotalCount);
        console.log({totalMountain});

        if(totalMountain==0)
        {
            $.ajax({
                type: "GET",
                url: '/js/mountains.json',
                dataType: "json",
                jsonp: true,
                success: function(mounts) {
                   
    
                    db.transaction(function (tx) { 
    
                        mounts.forEach(mount=>  {
                            tx.executeSql('INSERT INTO Mountains (name,long,lat,alt,cont) VALUES ("'+mount.name+'",'+mount.long+','+mount.lat+','+ mount.alt+',"'+mount.cont+'")');   
                        });
                       
                    }); 
                    
                    sessionStorage.setItem("mountain_data_initilized",true);
                }
            });
        }

    }, null); 
    });
*/
    
});