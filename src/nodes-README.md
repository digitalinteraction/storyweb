
# Nodes
`id` : Unique sequential ID
`name` : Text title
`desc` : Text description
`sound` : Name of file (no path name, no .mp3)
`image` : Path to image inside assets (e.g. ./assets/example.jpg)
`thumb` : Path to thumbnail inside assets (e.g. ./assets/example_sq.jpg)
`position` : [x, y] position on 30x30 grid. 0 indexed so max position is 29,29
`connections` : id of connections
`imgCred` : Text of credit for image
`sndCredit` : Text of credit for sound
`imgLink` : Any link for the credit
`sndLink` : Any link for the credit


## Example node
```
{
  "id": 9999,
  "name": "",
  "desc": "",
  "sound": "",
  "image": "./assets/.jpg",
  "thumb": "./assets/_sq.jpg",
  "position": [0, 0],
  "connections": [],
  "imgCredit": "",
  "sndCredit": "",
  "imgLink": "",
  "soundLink": ""
},
```

### Sounds
Automatically loaded from the dist/assets/sounds folder, with .mp3 added

### Gotchas
* Don't forget to include a trailing comma after each object (each should look like }, at the end)
* Don't include a trailing comma on the very last object of the file - JSON format doesn't like this as it implies there's another object coming
