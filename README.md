# Saxophone Hero
 code for Sky Macklay's piece for "Saxophone Hero," commissioned by Project Fusion

## Disclaimer
This README is currently a development journal/list of "to-dos" and process notes for me to reference. Eventually this will be reformatted into a guide to setting up the piece and running it for a performance.

# Process Notes

How to do various things. Links to resources.

## Converting MIDI Files

Right now every user gets the whole score and the subset of their notes is assigned when they choose a player. **06/26/2024**
1. Export MIDI file from Sibelius to Logic. All the "bongos" tracks should be regions that have MIDI notes 60 and 61 (L and R thumbs)
2. Export individual track (entire score) as Type 1 MIDI.
3. Drop on the [ToneJS MIDI parser tool](https://tonejs.github.io/Midi/) and copy/paste the results into the score.js file, which contains a single JS object called "score" with 4 keys: soprano, alto, tenor, and bari.
4. Delete everything from the JSON score except the array of objects originally assigned to the `notes` key. A complete note object just contains:
 `'voice':[{note1},{note2}...{noteN}]`
 5. The relevant info is 