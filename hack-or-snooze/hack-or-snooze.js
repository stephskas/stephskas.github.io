jQuery(function($){
  $("form").submit(function (e) {
    e.preventDefault() // no page refresh
    e.stopPropagation()
  })
  // Show on signupForm on sign up button click
  $("#signupLink").on("click", function (e) {
    e.stopPropagation()
    $("#signupLink").remove()
    $("#login-divider").removeClass("hidden");
    $("#create-account-form").removeClass("hidden")
  })
  // Style sign up button on mouseover
  $("#signupLink").mouseover(function () {
    $("#signupLink").removeClass("btn-link")
    $("#signupLink").addClass("btn-success")
  })
  $("#signupLink").mouseout(function () {
    $("#signupLink").removeClass("btn-success")
    $("#signupLink").addClass("btn-hover")
  })

  // API  //////////////////////////////////////////////////////
  // [ ] should call the API
  // [ ] should return an array of Story instances
  // [ ] should create a single StoryList instance from the call
  // [ ] should display the StoryList instance
  // [ ] Note: the presence of 'static' keyword indicates that getStories is NOT an instance method.
  // getStories is a method that's called on the class directly. * WHY DOESN'T IT MAKE SENSE FOR getStories TO BE AN INSTANCE METHOD?
  /* 'The static keyword defines a static method for a class. Static methods aren't called on instances of the class. Instead, they're called on the class itself. These are often utility functions, such as functions to create or clone objects. */

  const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com"

  class StoryList {
    constructor(stories) {
      this.stories = stories
    }

    static async getStories() {
      console.debug("getStories")
      // query the /stories endpoint (no auth required)
      const response = await axios.get(`${BASE_URL}/stories`);
      // create an array of Story class instances from the data
      const stories = response.data.stories.map((story) => new Story(story));
      const storyList = new StoryList(stories);
      console.log(storyList)
      return storyList;
    }

    async addStory(user, newStory) {
      console.debug("addStory")
      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/stories`,
        data: {
          token: user.loginToken,
          story: newStory
        }
      });
      newStory = new Story(response.data.story);
      this.stories.unshift(newStory); // add story to the beginning of the list
      user.ownStories.unshift(newStory);
      return newStory;
    }

    async removeStory(user, storyID) {
      console.debug("removeStory")
      await axios({
        url: `${BASE_URL}/stories/${storyID}`,
        method: "DELETE",
        data: {
          token: user.loginToken
        }
      });
      // remove the story with the storyID we are filtering out
      this.stories = this.stories.filter(story => story.storyId !== storyId)
      // remove the story with the storyID we are filtering out from the user's list of stories
      user.ownStories = user.ownStories.filter(
        (userStory) => userStory.storyId !== storyId
      );
    }
  } // END CLASS StoryList  ///////////////////////////////////////////

  class Story {
    constructor(storyObj) {
      this.author = storyObj.author;
      this.title = storyObj.title;
      this.url = storyObj.url;
      this.username = storyObj.username;
      this.storyId = storyObj.storyId;
      this.createdAt = storyObj.createdAt;
      this.updatedAt = storyObj.updatedAt;
    }
    //
    async update(user, storyData) {
      console.debug("update")
      const response = await axios({
        url: `${BASE_URL}/stories/${this.storyId}`,
        method: "PATCH",
        data: {
          token: user.loginToken,
          story: storyData
        }
      });
      const { author, title, url, updatedAt } = response.data.story;
      // the fields that can be changed with a PATCH update
      this.author = author;
      this.title = title;
      this.url = url;
      this.updatedAt = updatedAt;
      return this;
    }
  } // END Story  ////////////////////////////////////////////////

  class User {
    constructor(userObj) {
      this.username = userObj.username;
      this.name = userObj.name;
      this.createdAt = userObj.createdAt;
      this.updatedAt = userObj.updatedAt;

      // these are all set to defaults, not passed in by the constructor
      this.loginToken = "";
      this.favorites = [];
      this.ownStories = [];
    }
    // Create and return a new user.
    // Makes POST request to API and returns a newly-created user
    // with new username, new password and new name

    static async create(username, password, name) {
      console.debug("create")
      const response = await axios.post(`${BASE_URL}/signup`, {
        user: {
          username,
          password,
          name
        }
      });
      // build a new User instance from the API response
      const newUser = new User(response.data.user)
      // attach the token to the newUser instance for convenience
      newUser.loginToken = response.data.token;
      return newUser;
    }
    // Login user and return user instance with properties existing user username and password
    static async login(username, password) {
      console.debug("login")
      const response = await axios.post(`${BASE_URL}/login`, {
        user: {
          username,
          password,
        }
      });
      // build a new User instance from the API response
      const existingUser = new User(response.data.user);

      // instantiate Story instance from the API response
      existingUser.favorites = response.data.user.favorites.map(
        s => new Story(s)
      );
      existingUser.ownStories = response.data.user.stories.map(
        s => new Story(s)
      );

      // attach the token to the newUser instance for convenience
      existingUser.loginToken = response.data.token;

      return existingUser;
    }

    // Get user instance for the logged in user
    // Uses the token and username to make an API request to get the user's data and creates an instance of user with that data.
    static async getLoggedInUser(token, username) {
      console.debug("getLoggedInUser")
      // if we don't have user info, return null
      if (!token || !username) return null

      // call the API
      const response = await axios.get(`${BASE_URL}/users/${username}`, {
        params: { token },
      })

      // instantiate the user from the API information
      const existingUser = new User(response.data.user)

      // attach the token to the newUser instance for convenience
      existingUser.loginToken = token

      // instantiate Story instances for the user's favorites and ownStories
      existingUser.favorites = response.data.user.favorites.map(
        (s) => new Story(s)
      )
      existingUser.ownStories = response.data.user.stories.map(
        (s) => new Story(s)
      )

      return existingUser
    }

    // Fetch user information from the API at /users/{username} using a token.
    // Set all the appropriate inspance properties from the response with the current user instance
    async retrieveUserData() {
      console.debug("retrieveUserData")
      const response = await axios.get(`${BASE_URL}/users/${this.username}`, {
        params: {
          token: this.loginToken,
        },
      })
      // update all of the user's properties from the API response
      this.name = response.data.user.name
      this.createdAt = response.data.user.createdAt
      this.updatedAt = response.date.user.updatedAt

      // convert the user's favorites and ownStories into instances of Story
      this.favorites = response.data.user.favorites.map((s) => new Story(s))
      this.ownStories = response.data.user.stories.map((s) => new Story(s))

      return this
    }
    // Add a story to the list of user favorites and update the API (storyId for story to add to favorites)
    addFavorite(storyId) {
      console.debug("addFavorite")
      return this.toggleFavorite(storyId, "POST")
    }
    // Remove a story from the list of user favorites and update the API, removing storyId
    removeFavorite(storyId) {
      console.debug("removeFavorite")
      return this.toggleFavorite(storyId, "DELETE")
    }
    // Post or delete storyId from API
    async toggleFavorite(storyId, httpVerb) {
      console.debug("toggleFavorite")
      await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
        method: httpVerb,
        data: {
          token: this.loginToken,
        },
      })
      await this.retrieveUserData()
      return this
    }
    // Send a PATCH request to the API to updat the user (userData)
    async update(userData) {
      console.debug("update")
      const response = await axios({
        url: `${BASE_URL}/users/${this.username}`,
        method: "PATCH",
        data: {
          user: userData,
          token: this.loginToken,
        },
      })
      // password can be updated but we're not storing it. Name is the only property you can update
      this.name = response.data.user.name
      return this;
    }
    // Send a DELETE request to the API to remove the user
    async remove() {
      console.debug("remove")
      await axios({
        // wrapper around axios
        url: `${BASE_URL}/users/${this.username}`,
        method: "DELETE",
        data: {
          token: this.loginToken,
        },
      })
    }
  } // END CLASS User  ////////////////////////////////////////////////

  // EVENT LISTENERS //////////////////////////////////////////////////
  //selectors

  $(async function () {
    let storyList = null
    let currentUser = null
    await checkIfLoggedIn()
    console.debug("checkedIfLoggedIn")
    // Event listener for logging in. If successful, should set up the user instance
    $("#loginBtn").on("click", async function (e) {
      console.debug("loginBtn", e)
      e.preventDefault() // no page refresh
      const username = $("#login-username").val()
      let password = $("#login-password").val()
      let userInstance = await User.login(username, password)
      currentUser = userInstance
      syncCurrentUserToLocalStorage()
      loginAndSubmitForm()
    })
    // Event listener for signing up. If successful, should set up a new user instance
    $("#signupBtn").on("click", async function (e) {
      console.debug("signupBtn", e)
      e.preventDefault()
      let name = $("#create-account-name").val()
      let username = $("#create-account-username").val()
      let password = $("#create-account-password").val()
      // call the login static method to build a user instance
      const newUser = await User.create(username, password, name)
      currentUser = newUser
      syncCurrentUserToLocalStorage()
      loginAndSubmitForm()
    })
    // Event listener for log out.
    $("#navbarDropdown-logout").on("click", function() {
       console.debug("logout")
      $("#create-account-form").toggleClass("hidden");
      // empty out local storage
      localStorage.clear()
      // refresh the page, clearing memory
      location.reload()
    })
    // Event listener for adding story.
    $("#navAddArticle").on("click", function () {
      console.debug("navAddArticle clicked")
      $("#submit-form").toggleClass("hidden")
    })
    $("#submit-form").on("submit", async function(e) {
      console.debug("submit-form", e)
      e.preventDefault();
      const title = $("#title").val()
      const url = $("#url").val()
      const hostName = getHostName(url)
      const author = $("#author").val()
      const username = currentUser.username
      const storyObject = await storyList.addStory(currentUser, {
        title,
        author,
        url,
        username,
      });
      $("#submit-form-btn").click($("#submit-form")).toggleClass("hidden")
      // generate markup for new story
      const $li = $(`
        <li id="${storyObject.storyId}" class="id-${storyObject.storyId}">
          <span class="star"><i class="far fa-star"></i></span>
          <a class="article-link" href="${url}" target="a_blank">
            <strong>${title}</strong>
          </a>
          <small class="article-hostname ${hostName}">(${hostName})</  small>
          <small class="article-author">by ${author}</small>
          <small class="article-username">posted by ${username}</small>
        </li>
      `)
      $("#all-articles-list").prepend($li)
    })
  }) // END ASYNC FUNCTION

  $(".articles-container").on("click", ".star", async function(e) {
    console.debug("articles-container")
    if (currentUser) {
      const $closestLi = $(e.target).closest("li");
      const storyId = $closestLi.attr("id");

      // if the item is already favorited
      if ($(e.target).hasClass("far")){
        // remove the favorite from the user's list
        await currentUser.removeFavorite(storyId);
        // then change the class to be an empty star
        $(e.target).closest("i").toggleClass("far fa");
      } else {
        // the item is un-favorited
        await currentUser.addFavorite(storyId);
        $(e.target).closest("i").toggleClass("far fa");
      }
    }
  })

  $("#navFavorites").on("click", function(e) {
    console.debug("#navFavorites")
    if(currentUser){
      generateFaves();
      $("#favorited-articles").toggleClass("hidden")
    }
  });

  $("#navMyArticles").on("click", function(e) {
    console.log("#navMyArticles clicked", e)
    if(currentUser){
      generateMyStories();
      $("#my-articles").toggleClass("hidden")
    }
  });
  
  async function checkIfLoggedIn() {
    console.debug("checkIfLoggedIn")
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if there is a token in localStorage, call User.getLoggedInUser
    // to get an instance of User with the right details
    // this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    console.debug("getLoggedInUser", token, username)
    await generateStories();
    console.debug("generateStories")
    // if (currentUser) {
    //   // generateProfile();
    // }
  }

  function loginAndSubmitForm() {
    console.debug("loginAndSubmitForm")
    $("#login-form").trigger("reset");
    $("#create-account-form").trigger("reset");
    // show the stories
    $("#all-articles-list").show();
    // update the navigation bar
    showNavForLoggedInUser();
    //get user profile
    // generateProfile();
  }

  function generateProfile(){}

  async function generateStories() {
    console.debug("generateStories")
    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update global variable
    storyList = storyListInstance;
    // empty page
    $("#all-articles-list").empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      $("#all-articles-list").append(result);
    }
  }

  function generateStoryHTML(story, isOwnStory){
    console.debug("generateStoryHTML")
    let hostName = getHostName(story.url);
    let starType = isFavorite(story) ? "fas" : "far";
    // render trash can icon for deleting own story
    const trashCanIcon = isOwnStory ? 
    `<span class="trash">
     <i class="fas fa-trash"></i>
    </span>`
    : "";
    // render all the rest of the story markup
    const storyMarkup = $(`
      <li id="${story.storyId}">
        ${trashCanIcon}
        <span class="star"><i class="${starType} fa-star"></i></span>
         <a class="article-link" href="${story.url}
         target="a_blank">
          <strong>${story.title}</strong>
         </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}"> (${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
        </li>
    `)
    return storyMarkup;
  }

  function generateFaves() {
    console.debug("generateFaves")
    // empty out list by default
    $("#favorited-articles").empty();
    $("#favorited-articles").toggleClass("hidden");
    // if the user has no favorites
    if (currentUser.favorites.length === 0) {
      $("#favorited-articles").append("<h5>No favorites added</h5>");
    } else {
      // for all of the user's favorites
      for (let story of currentUser.favorites) {
        //render each story in the list
        let favoriteHTML = generateStoryHTML(story, false, true);
        $("#favorited-articles").append(favoriteHTML);
      }
    }
  }

  function generateMyStories() {
    console.debug("generateMyStories")
    if (currentUser.ownStories.length === 0) {
      $("#my-articles").append("<h5>No stories added by user</h5>");
    } else {
      // for all of the user's posted stories
      for (let story of currentUser.ownStories) {
        let ownStoryHTML = generateStoryHTML(story, true);
        $("#my-articles").append(ownStoryHTML);
      }
    }
    $("#my-articles").toggleClass("hidden")
  }

  function showNavForLoggedInUser() {
    console.debug("showNavForLoggedInUser")
    $("#navbarDropdown-login").remove();
    $("#navMenu").removeClass("hidden")
    $("#navbarDropdown-logout").removeClass("hidden")
  }

  function isFavorite(story) {
    console.debug("isFavorite", story)
    let favStoryIds = new Set();
    if (currentUser) {
      favStoryIds = new Set(currentUser.favorites.map(obj => obj.storyId));
    }
    return favStoryIds.has(story.storyId);
  }

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0,4) ==="www. ") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  function syncCurrentUserToLocalStorage() {
    console.debug("syncCurrentUserToLocalStorage", currentUser)
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
})

