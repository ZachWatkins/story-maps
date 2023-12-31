import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/beige.css'
import StoryMap from './modules/story-map.js'
import Reveal from 'reveal.js'

const deck = new Reveal()
deck.initialize({
    hash: true,
    slideNumber: true,
    embedded: true,
})
deck.addEventListener( 'centerText', function() {
    deck.configure({center: true})
}, false )

new StoryMap(window.storymap)
