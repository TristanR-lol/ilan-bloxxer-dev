document.getElementById("Continue").addEventListener("click", function () {
    let params = new URLSearchParams(document.location.search);
    let redirect = params.get("redirect") || "https://ilan.bloxxer.dev/";
    location.href = redirect + "?accepted=true";
});