document.getElementById("Continue").addEventListener("click", function(){
    let params = new URLSearchParams(document.location.search);
    location.href = params.get("redirect")+`?accepted="true"` || `ilan.bloxxer.dev?accepted="true"`
})