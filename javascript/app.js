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

const storageService = firebase.storage();
const storageRef = storageService.ref();

const database = firebase.database();

document.querySelector(".file-select").addEventListener("change", handleFileUploadChange);
document.querySelector(".file-submit").addEventListener("click", handleFileUploadSubmit);

var userImgURL;
var selectedFile;
var imageCounter = 0;

function handleFileUploadChange(e) {
  selectedFile = e.target.files[0];
  console.log(selectedFile)
}

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

    uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        console.log("URL: " + downloadURL);
        userImgURL = downloadURL;
        // imageCounter++;
        database.ref().push({
            // name: "image-" + imageCounter,
            url: downloadURL
        });
    });

    console.log("success");

    });
  }

database.ref().on("child_added", function(snap){

    console.log(userImgURL);

    var img = $("<img>").attr("src", snap.val().url);
    img.attr("style", "width:300px");

    var yBtn = $("<button>").attr("class", "btn btn-success m-1")
    yBtn.text("YES");

    var nBtn = $("<button>").attr("class", "btn btn-danger m-1")
    nBtn.text("No");

    var card = $("<div>").attr("class", "card p-3 m-3");

    card.append(img, yBtn, nBtn);

    $("#imageDisplay").append(card);

})