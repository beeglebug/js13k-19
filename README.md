# Entombed - js13k 2019 

![thumbnail](https://raw.github.com/beeglebug/js13k-19/master/thumbnail.png)

## post mortem

#### summary

raycaster was the plan

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Still no idea what i&#39;m doing for <a href="https://twitter.com/hashtag/js13k?src=hash&amp;ref_src=twsrc%5Etfw">#js13k</a>, but i&#39;ve got my environment all set up and i&#39;ve grabbed some raytracing code I was playing with recently as a starting point. Excited to see where this goes. <a href="https://twitter.com/hashtag/gamedev?src=hash&amp;ref_src=twsrc%5Etfw">#gamedev</a> <a href="https://twitter.com/hashtag/js13kgames?src=hash&amp;ref_src=twsrc%5Etfw">#js13kgames</a> <a href="https://t.co/Pp1Rbs0cfA">pic.twitter.com/Pp1Rbs0cfA</a></p>&mdash; Stuart Lee (@beeglebug) <a href="https://twitter.com/beeglebug/status/1161363436904878080?ref_src=twsrc%5Etfw">August 13, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

knew i wanted sound
dont leave all the content to the end
use all the space

### technical details

raycasting
maze generation
pathfinding
rng
stateless ai

#### minification

gulp
terser
advzip
manual golfing was a waste
compress multiple images into one

#### what went well

learned loads
first time sound
play testing and feedback
accessibility (controls/mouse sensitivity)
stats and achievements (last minute addition)

#### what could have gone better

lighting was basic
wasted time on dead ends (name gen)
would have liked more variety
terser mangle properties
could compress images more (color and size)
animation

#### conclusion

twitter was fun (notch likes)
had fun, but worked a bit too much on it
dont over think the compression until you need to

#### resources
- https://lodev.org/cgtutor/raycasting.html
- Modified tiles found here: http://finalbossblues.com/timefantasy/freebies/dark-dimension-tileset/
- https://github.com/foumart/JS.13kGames/blob/master/lib/SoundFX.js
