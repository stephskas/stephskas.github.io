// AJAX GIPHY PARTY APP 
// https://developers.giphy.com/docs/api/endpoint/#search
// API KEY: 4Q2j1blBfgQb8hTfuXWdWnKIqlxQxJLw
// REQUIREMENTS:
// - Allow the user to search for a GIF and when the form is submitted, make an AJAX request to the Giphy API and return a single GIF
// - Once the Giphy API has responded with data, append the GIF to the page
// - Allow the user to search for as many GIFs as they would like and keep appending them to the page
// - Allow the user to remove all of the GIFs by clicking a button
// PART 1:
jQuery(function ($) {

  const $container = $("#container");
  const $searchInput = $("#searchInput");
// Get image gif
  $("#getGif").on("click", async function (e) {
    e.preventDefault()
    // clear form search field
    let queryStr = $searchInput.val()
    $searchInput.val("")
    //Get gifs matching search input value
    const res = await axios.get("https://api.giphy.com/v1/gifs/search", {
      params: {
        q: queryStr,
        // limit: 5,
        api_key: "4Q2j1blBfgQb8hTfuXWdWnKIqlxQxJLw",
        class: "giphy",
      },
    })
    addGif(res.data)
  })

// Get sticker gif
  $("#getSticker").on("click", async function (e) {
    e.preventDefault()
    // clear form search field
    let queryStr = $searchInput.val();
    $searchInput.val("");
    //Get sticker matching search input value
    const res = await axios.get("https://api.giphy.com/v1/stickers/search", {
      params: {
        q: queryStr,
        // limit: 5,
        api_key: "4Q2j1blBfgQb8hTfuXWdWnKIqlxQxJLw",
        class: "giphy"
      }
    });
    addGif(res.data);
  });

 // Display gifs
  function addGif(res) {
    let numResults = res.data.length;
    console.log(numResults);
    let randomIdx = Math.floor(Math.random() * numResults);
    let $newGif = $("<img>", { src: res.data[randomIdx].images.original.url })
    $("#container").prepend($newGif);
  }
 // Clear gifs
 $("#clearGif").on("click", function(){
   $container.empty();
 })

});


