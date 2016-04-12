var test = require('tape')
var nock = require('nock')
var spotify = require('../')
var Client = require('../lib/client')

var endpoint = 'https://api.spotify.test'

test('should create a client', function (t) {
  t.ok(spotify.createClient, 'should exist')
  t.equals(typeof spotify.createClient, 'function', 'should be a function')

  var client = spotify.createClient()
  t.ok(client instanceof Client, 'should be instance of Client')
  t.end()
})

test('should fail with unknown endpoint', function (t) {
  var client = spotify.createClient({ endpoint: endpoint })
  nock(endpoint)
    .get('/foo')
    .reply(404)

  client._request('/foo', { q: 'Demi', type: 'artist' }, function (err, body) {
    t.ok(err, 'request failed')
    t.end()
  })
})

test('should search artist, album, track', function (t) {
  var client = spotify.createClient({ endpoint: endpoint })
  t.equals(typeof client.search, 'function', 'should be a function')

  nock(endpoint)
    .get('/search')
    .query({ q: 'Demi Lovato' })
    .query({ type: 'artist,album,track' })
    .reply(200, [{ artists: 'Demi Lovato' },
                  { albums: 'Demi Lovato' },
                  { tracks: 'Demi Lovato' }])

  client.search('Demi Lovato', 'all', function (err, data) {
    t.error(err, 'should not be an error')
    t.ok(Array.isArray(data), 'should be an Array')
    t.equals(data[0].artists, 'Demi Lovato', 'should retrive a artist name')
    t.equals(data[1].albums, 'Demi Lovato', 'should retrive a albums name')
    t.equals(data[2].tracks, 'Demi Lovato', 'should retrive a tracks name')
    t.end()
  })
})

test('should get single an album', function (t) {
  var id_album = '6Kssm2LosQ0WyLukFZkEG5'
  var client = spotify.createClient({ endpoint: endpoint })
  t.equals(typeof client.getAlbum, 'function', 'should be a function')

  nock(endpoint)
  .get('/albums/' + id_album)
  .reply(200, { id: id_album })

  client.getAlbum(id_album, { tracks: false }, function (err, album) {
    t.error(err, 'should not be an error')
    t.equals(typeof album, 'object', 'should be a single element')
    t.equals(album.id, id_album, 'should retrive a album id')
    t.end()
  })
})

test('should get albums tracks', function (t) {
  var id_album = '67sdfahy4dertgd232dttt'
  var client = spotify.createClient({ endpoint: endpoint })
  t.equals(typeof client.getAlbum, 'function', 'should be a function')

  nock(endpoint)
  .get('/albums/' + id_album + '/tracks')
  .reply(200, { items: [] })

  client.getAlbum(id_album, { tracks: true }, function (err, tracks) {
    t.error(err, 'should not be an error')
    t.ok(Array.isArray(tracks.items), 'should be an Array')
    t.end()
  })
})
