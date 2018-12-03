// Initialize Firebase
var config = {
    apiKey: "AIzaSyBRVMHpLa4znTLMfXhG6P2zFO036TbbEVc",
    authDomain: "keeper-223821.firebaseapp.com",
    databaseURL: "https://keeper-223821.firebaseio.com",
    projectId: "keeper-223821",
    storageBucket: "keeper-223821.appspot.com",
    messagingSenderId: "1085767157247"
};
// Pass Firebase credentials (above) into initializeApp method
firebase.initializeApp(config);

// declare constant for firebase storage and storage reference and database
const storageService = firebase.storage();
const storageRef = storageService.ref();
const database = firebase.database();

// Add popovers
$(function () {
    $('[data-toggle="popover"]').popover()
})

// declare variable for image url and selected file 
var userImgURL;
var selectedFile;
var retailer = "";
var userLatitude = "";
var userLongitude = "";

getLocation();

// add change event listener to upload button
// add click event listener to submit button
document.querySelector(".file-select").addEventListener("change", handleFileUploadChange);
document.querySelector(".file-submit").addEventListener("click", function(){
    retailer = $("#retailer").val().trim();
    $("#retailer").val("");
    $("#submitButton").toggleClass("submit-highlight");
    $("#retailer").toggleClass("show-retailer");
    handleFileUploadSubmit();
});


// declare function for handling the upload change, the event passed is name of the selected file
function handleFileUploadChange(e) {
    // store files name in a variable selectedFile
    selectedFile = e.target.files[0];
    console.log(selectedFile)
    $("#submitButton").toggleClass("submit-highlight magictime swashIn");
    $("#retailer").toggleClass("show-retailer magictime swashIn");
}

// declare function for handling the upload submit where an event is passed as an argument
function handleFileUploadSubmit(e) {

    //create a child directory called images, and place the file inside this directory
    var uploadTask = storageRef.child(`images/${selectedFile.name}`).put(selectedFile);
    console.log(uploadTask);

    uploadTask.on("state_changed", (snapshot) => {

        // Observe state change events such as progress, pause, and resume
        console.log("snapshot: " + snapshot);

    }, (error) => {

        // Handle unsuccessful uploads
        console.log(error);

    }, () => {

        // Do something once upload is complete
        // grab the download URL through the firebase function .getDownloadURL()
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log("URL: " + downloadURL);
            // set our download URL to a variable
            userImgURL = downloadURL;
            // push new child to database containing user image url
            database.ref().push({
                // set key of url to contain the download url 
                url: downloadURL,
                retailer: retailer,
                yes: 0,
                no: 0,
                total: 0
            });
        });

        console.log("success");

    });
}

// reference the firebase database and on child added, declare anonymous function and pass it and argument of snap
database.ref().on("child_added", function (snap) {

    console.log(snap);

    var imgWrapper = $("<div>").attr("class", "image-wrapper");
    imgWrapper.attr("data-displayed", "false");
    imgWrapper.attr("data-retailer", snap.val().retailer);

    // dynamically generate html tags for img with src = image url
    var img = $("<img>").attr("src", snap.val().url);
    img.attr("class", "user-image")

    //dynamically generate a button with an attribute of bootstrap classes
    var yBtn = $("<button>").attr("class", "btn yes-button vote-button");
    yBtn.attr("data-key", snap.key);
    yBtn.attr("data-y-n", "yes");
    yBtn.text("YES");

    //dynamically generate a button with an attribute of bootstrap classes
    var nBtn = $("<button>").attr("class", "btn no-button vote-button");
    nBtn.attr("data-key", snap.key);
    nBtn.attr("data-y-n", "no");
    nBtn.text("NO");

    var buttonDiv = $("<div>").attr("class", "d-flex flex-row justify-content-around");
    buttonDiv.attr("id", snap.key);

    imgWrapper.append(img);
    buttonDiv.append(yBtn, nBtn);

    // dynamically generate a bootstrap card  
    var card = $("<div>").attr("class", "card p-3 mt-3 user-image-card");

    // append image and buttons to the card
    card.append(imgWrapper, buttonDiv);

    // append the card to the page
    $("#imageDisplay").append(card);

});

$(document).on("click", ".image-wrapper", function(){
    
    var dataDisplayed = $(this).attr("data-displayed");
    var retailerData = $(this).attr("data-retailer");
    var thisRef = this;
    
    console.log(retailerData);

    if(dataDisplayed === "false"){

        var retailDiv = $("<div>").append("<h5 class='retailResults'>Loading...</h5>");
        retailDiv.addClass("text-center mb-2");
    
        $(thisRef).append(retailDiv);
        
        $(thisRef).attr("data-displayed", "true");
        
        if(userLatitude !== "" && userLongitude !== "" && retailerData !== ""){

            jQuery.ajaxPrefilter(function (options) {
                if (options.crossDomain && jQuery.support.cors) {
                    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
                }
            });
    
            var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + userLatitude + "," + userLongitude + "&radius=1500&type=clothing_store&keyword=" + retailerData + "&key=AIzaSyAuXp4DdKaYR75c5vtwcbYzYCGrxZK5NjM";

            $.ajax({
                url: queryURL,
                method: "GET",
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }).then(function (response) {
                console.log(response);
                var retailerInfo = $("<div>").attr("class", "magictime swashIn text-center");
                retailerInfo.append("<h6 class='retailResults'><strong>Item found at:</strong> " + response.results[0].name + "</h6>");
                retailerInfo.append("<p class='retailResults'><strong>Address:</strong> " + response.results[0].vicinity + "</p>");
                
                retailDiv.html(retailerInfo);
            });
    
        }

    }
    
});

$(document).on("click", ".vote-button", function(){
    
    // Assign variables to attributes "data-key" and "data-y-n", which indicate the serial number of the image the button is associated with and whether the button clicked was the "yes" or "no" button
    var imageSerialNumber = $(this).attr("data-key");
    var buttonType = $(this).attr("data-y-n");

    // Declare variables that will be assigned to the data stored in the database
    var yes;
    var no;
    var total;
    var url;
      
    getImageInfo(imageSerialNumber).then(function(snap){
        
        console.log("Snap: " + snap);
        
        yes = snap.yes;
        no = snap.no;
        total = snap.total;
        url = snap.url;

        console.log("Yes: " + yes);
        console.log("No: " + no);
        console.log("Total: " + total);

        if(buttonType === "yes"){
            yes += 1;
        } else if(buttonType === "no"){
            no += 1;
        }

        total = yes + no;

        console.log("2. Yes: " + yes);
        console.log("2. No: " + no);
        console.log("2. Total: " + total);

        database.ref(imageSerialNumber).set({
            url: url,
            yes: yes,
            no: no,
            total: total
        });
    
    }).then(function(){

        var yesPercent = (yes / total) * 100;
        var noPercent = (no / total) * 100;

        $("#" + imageSerialNumber).html("<h2 class='magictime swashIn yesResults'>Yes: " + Math.round(yesPercent) + "%</h2>" + "<h2 class='magictime swashIn'> | </h2>" + "<h2 class='magictime swashIn noResults'>No: " + Math.round(noPercent) + "%</h2>" );

    });

});

function getImageInfo(key){
    return database.ref(key).once('value').then(function(snapshot) {
        console.log("getImageInfo: " + snapshot.val());
        return snapshot.val();
    });
}