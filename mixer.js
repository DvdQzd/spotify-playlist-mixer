const auth = require('./auth.json');
const axios = require('axios');
var _ = require('lodash');
const args = process.argv.slice(2);
const destinationPlaylist = args[0].split(':')[2];
const originPlaylist = args[1].split(':')[2];
const baseUrl = `https://api.spotify.com/v1`;
const playlistUrl = `${baseUrl}/playlists/${originPlaylist}`;
const addTracksToPlaylistUrl = `${baseUrl}/playlists/${destinationPlaylist}/tracks`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${auth.token}`
};

const doTheMagic = async () => {
  const tracks = await getPlaylistTracks(originPlaylist);
  addTracksToPlaylist(tracks);
  console.log(`Tracks added successfully!`);
};

const getPlaylistTracks = async () => {
  var tracks = [];
  let response = await axios.get(playlistUrl, { headers });
  response.data.tracks.items.forEach(t => {
    tracks.push(t.track.uri);
  });
  addTracksToPlaylist(tracks);
  tracks = [];
  let n = Math.ceil(response.data.tracks.total / 100);
  if (n > 1) {
    for (let offset = 100; offset < n * 100; offset += 100) {
      
      response = await axios.get(`${playlistUrl}?offset=${offset}`, {
        headers
      });
      response.data.tracks.items.forEach(t => {
        tracks.push(t.track.uri);
        await addTracksToPlaylist(tracks);
        tracks = [];
      });
      
    }
  }
  return tracks;
};

const addTracksToPlaylist = tracks => {
  const groups = _.chunk(tracks, 50);

  groups.forEach(async trackUris => {
    try {
      await new Promise(r => setTimeout(r, 5000));
      const r = await axios({
        method: 'POST',
        url: addTracksToPlaylistUrl,
        headers: headers,
        data: { uris: trackUris }
      });
      console.log
    } catch (e) {
      console.log(e);
    }
  });
};

doTheMagic();
