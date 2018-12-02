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

// add change event listener to upload button
// add click event listener to submit button
document.querySelector(".file-select").addEventListener("change", handleFileUploadChange);
document.querySelector(".file-submit").addEventListener("click", handleFileUploadSubmit);

// declare variable for image url and selected file 
var userImgURL;
var selectedFile;

// declare function for handling the upload change, the event passed is name of the selected file
function handleFileUploadChange(e) {
    // store files name in a variable selectedFile
    selectedFile = e.target.files[0];
    console.log(selectedFile)
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

    buttonDiv.append(yBtn, nBtn);

    // dynamically generate a bootstrap card  
    var card = $("<div>").attr("class", "card p-3 mt-3 user-image-card");

    // append image and buttons to the card
    card.append(img, buttonDiv);

    // append the card to the page
    $("#imageDisplay").prepend(card);

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
      
    console.log(info);

    // set new values using the variable snapshot above (figure out how to read 'promises')

    // display percentages

});

function getImageInfo(key){
    return database.ref(key).once('value').then(function(snapshot) {
        console.log("getImageInfo: " + snapshot.val());
        return snapshot.val();
    });
}