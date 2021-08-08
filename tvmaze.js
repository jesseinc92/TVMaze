/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.
 */
async function searchShows(query) {
  // Make an ajax request to the searchShows api.
  const response = await axios.get('http://api.tvmaze.com/search/shows', { params: { q: query }});
  const shows = response.data;
  const showsArray = [];

  for (let show of shows) {
    if (show.show.image) {
      showsArray.push({
        id: show.show.id,
        name: show.show.name,
        summary: show.show.summary,
        image: show.show.image.medium
      })
    } else {
      showsArray.push({
        id: show.show.id,
        name: show.show.name,
        summary: show.show.summary,
        image: 'https://tinyurl.com/tv-missing'
      })
    }
  }

  return showsArray;
}


/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();
  let count = 1;

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <img class="card-img-top" src="${show.image}">
             <p class="card-text">${show.summary}</p>
             <button class="episode-button" id="${count}">Episodes</button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);

    count++;
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // get episodes from tvmaze
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = response.data;
  const episodeArray = [];

  // return array-of-episode-info, as described in docstring above
  for (let episode of episodes) {
    episodeArray.push({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    });
  }

  return episodeArray;
}


// given a list of episodes, add to DOM
function populateEpisodes(episodes) {
  for (let episode of episodes) {
    let $item = $(
      `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`
    )

    $("#episodes-list").append($item);
  }
}


/** Handle episode button push.
 *  - accept event target and find show ID.
 *  - populate episode list
 */

$("#shows-list").on("click", "button", async function handleEpisodes(evt) {
  $("#episodes-list").empty();

  let id = evt.target.closest(".Show").getAttribute('data-show-id');

  let episodes = await getEpisodes(id);

  populateEpisodes(episodes);

  $("#episodes-area").show();
  
});