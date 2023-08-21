import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/moon.css'
import Reveal from 'reveal.js'

const deck = new Reveal()
deck.initialize({
    hash: true,
    slideNumber: true,
    embedded: true,
    display: 'block'
})
deck.addEventListener( 'centerText', function() {
    deck.configure({center: true})
}, false )
