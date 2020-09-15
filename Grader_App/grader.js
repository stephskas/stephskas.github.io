jQuery(function ($) {
  let catData = "";
  //HANDLERS
  // Rating selection
  $(".stars li")
    // Should listen for mouseover and add hover class to the target and all stars before
    .on("mouseover", function () {
      let currentStar = parseInt($(this).data("value"), 10)
      $(this)
        .parent()
        .children("li.star")
        .each(function (e) {
          if (e < currentStar) {
            $(this).addClass("hover")
          } else {
            $(this).removeClass("hover")
          }
        })
    })
    // Should listen for mouseout and remove hover class to the target and all stars before
    .on("mouseout", function () {
      $(this)
        .parent()
        .children("li.star")
        .each(function (e) {
          $(this).removeClass("hover")
        })
    })
    // Should listen for click on star and add selected class to the target and all stars before
    // Should store selected star rating in an object
    .on("click", function () {
      let currentStar = parseInt($(this).data("value"), 10)
      let stars = $(this).parent().children("li.star")
      $(this)
        .parent()
        .children("li.star")
        .each(function (e) {
          if (e < currentStar) {
            $(this).addClass("selected")
          } else {
            $(this).removeClass("selected")
          }
        })
      let $selectedRating = $("li.selected").length;
      for (s = 0; s < $selectedRating; s++) {
        catData += "★"
      }
    })

  // DATA  

  $("form").on("change", function () {
    // Should store text input for title in an object
    // Should store list id in an object and increment id on form change
    let $title = $("#input-title").val()
  })
    // On submit should add text input to a list displayed to user
    // On submit should append stars to list
    // On submit should display list to user
    // On submit should clear title input field 
    // On enter should act as on submit

  $(document).on("keypress", function (e) {
    if (e.which == 13) {
       $("#submitBtn").click();
    }
  });
  
  $("#submitBtn").on("click", function(e){
    e.preventDefault();
    let $title = $("#input-title").val();
    let rating = $("li.selected").length 
      if ($title && (rating > 0 === true)){
        let $post = `${$title} ${catData}`;
        $("#errorMsg").remove()
        let listItem = $("<li>", { text: $post})
        listItem.addClass("listItem")
        listItem.append($("<button>", { text: "X" }).addClass("removeBtn"))
        $("#userList").append(listItem);
        $("#input-title").val("");
        $("li.selected").removeClass("selected");
        catData = "";
        $(".removeBtn").click(function (e) {
          $(this).parent().remove()
        })
      } else {
        $("#errorMsg").append($("<p>", {text: "Please enter a title and rating"}));
      }     
  });
  // click on clear button should clear title input field and rating 
  $("#clearBtn").on("click", function(e){
    $("#input-title").val("");
    $("li.selected").removeClass("selected");
    catData = "";
  });
});