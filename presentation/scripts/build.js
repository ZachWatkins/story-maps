/**
 * Build the presentation.
 * @author Zachary K. Watkins
 * @module build
 * @since 0.1.0
 */

// cp node_modules/reveal.js/dist/reveal.css dist && cp node_modules/reveal.js/dist/reveal.js dist && cp node_modules/reveal.js/dist/theme/moon.css dist/theme
/**
 * External dependencies.
 */
const fs = require('fs');
const path = require('path');

const pipeline = [
    {
        src: "index.html",
        dest: "dist",
        replace: [
            ["dist/reveal.js", "assets/reveal.js"],
            ["dist/reveal.css", "assets/reveal.css"],
            ["dist/theme/moon.css", "assets/theme/moon.css"]
        ]
    },
    {
        src: "node_modules/reveal.js/dist/reveal.css",
        dest: "dist/assets"
    },
    {
        src: "node_modules/reveal.js/dist/reveal.js",
        dest: "dist/assets"
    },
    {
        src: "node_modules/reveal.js/dist/theme/moon.css",
        dest: "dist/assets/theme"
    }
];

async function copyFile(item) {
    const { src, dest, replace } = item;
    const fileName = path.basename(src);
    const destFile = path.join(dest, fileName);
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    fs.copyFileSync(src, destFile);
    if (replace) {
        let contents = fs.readFileSync(destFile, 'utf8');
        for (let i = 0; i < replace.length; i++) {
            contents = contents.replace(replace[i][0], replace[i][1]);
        }
        fs.writeFileSync(destFile, contents, 'utf8');
    }
    return `+ ${destFile}`;
}

const results = Promise.allSettled(pipeline.map(copyFile)).then((results) => {
    results.forEach((result) => {
        console.log(result.value);
    });
});
