// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 
"https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from 
"https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "savesmart.firebaseapp.com",
    projectId: "savesmart",
    storageBucket: "savesmart.appspot.com",
    messagingSenderId: "XXXX",
    appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let goalAmount = 0;
let savedAmount = 0;
let userId = "";

// Google Login
window.googleLogin = function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            userId = user.uid;
            document.getElementById("userName").innerText = "Hello, " + user.displayName;
            loadSavings();
        })
        .catch((error) => console.error(error));
};

// Set Goal
window.setGoal = async function() {
    goalAmount = Number(document.getElementById("goal").value);
    document.getElementById("goalDisplay").innerText = goalAmount;

    if(userId){
        await setDoc(doc(db, "savings", userId), {
            goalAmount: goalAmount,
            savedAmount: savedAmount
        });
    }
    drawChart();
};

// Add Money
window.addMoney = async function() {
    const amount = Number(document.getElementById("amount").value);
    savedAmount += amount;
    document.getElementById("saved").innerText = savedAmount;

    const progress = (savedAmount / goalAmount) * 100;
    document.getElementById("progress").style.width = progress + "%";

    document.getElementById("message").innerText = 
        savedAmount >= goalAmount ? "🎉 Goal Achieved! Congratulations!" : "";

    if(userId){
        await setDoc(doc(db, "savings", userId), {
            goalAmount: goalAmount,
            savedAmount: savedAmount
        });
    }
    drawChart();
};

// Load savings from Firebase
async function loadSavings() {
    if(!userId) return;
    const docRef = doc(db, "savings", userId);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        const data = docSnap.data();
        goalAmount = data.goalAmount;
        savedAmount = data.savedAmount;
        document.getElementById("goalDisplay").innerText = goalAmount;
        document.getElementById("saved").innerText = savedAmount;
        document.getElementById("progress").style.width = (savedAmount/goalAmount)*100 + "%";
        drawChart();
    }
}

// Google Chart
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    const remaining = Math.max(goalAmount - savedAmount, 0);
    const data = google.visualization.arrayToDataTable([
        ['Type', 'Amount'],
        ['Saved', savedAmount],
        ['Remaining', remaining]
    ]);

    const options = { title: 'Saving Progress' };
    const chart = new google.visualization.PieChart(document.getElementById('chart'));
    chart.draw(data, options);
}
