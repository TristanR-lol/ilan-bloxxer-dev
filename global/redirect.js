let params = new URLSearchParams(location.search)
if (params.get("accepted") !== "true") {
    location.href = `https://ilan.bloxxer.dev/popup/?redirect=${location.href}`
}