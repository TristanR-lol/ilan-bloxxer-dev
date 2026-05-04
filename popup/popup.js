let params = new URLSearchParams(document.location.search);
let redirect = params.get("redirect") || "https://ilan.bloxxer.dev/";
document.getElementById("Continue").addEventListener("click", function () {
    location.href = redirect + "?accepted=true";
});
document.getElementById("HBD").innerHTML=`${redirect}: Here Be Dragons!`;