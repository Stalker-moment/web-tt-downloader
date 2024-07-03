async function getId(url) {
 //get the id from the url tiktok
    let id = url.split("/").pop();
    return id;
}

module.exports = getId;