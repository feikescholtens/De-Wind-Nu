//This config is used for bundling in both a developer environment and production environment

const deleteUnminifiedBundels = true
const makeSourceMaps = false //Development: true, production: false

//Homepage variables
const homepageJS = "public/src/homepage/index.js",
  homepageHTML = "public/src/homepage/index.ejs",
  homepageDestinationDir = "public/dist/homepage",
  homepagePathURL = ""

//Windpage variables
const windpageJS = "public/src/windPage/index.js",
  windpageHTML = "public/src/windPage/index.ejs",
  windpageDestinationDir = "public/dist/windPage",
  windpagePathURL = "/wind"




//----------------Main logic------------------------------------------------

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs"

//Rollup plugins
import { nodeResolve } from "@rollup/plugin-node-resolve"
import html from "@rollup/plugin-html"
import { minify as minifyHTML } from "html-minifier-terser"
import postcss from "rollup-plugin-postcss"
import UglifyJS from "uglify-js"

//PostCSS plugins
import cssnano from "cssnano"

//Array calling custom build function for both pages
export default [buildWebPageBundleConfig(homepageJS, homepageHTML, homepageDestinationDir, homepagePathURL),
  buildWebPageBundleConfig(windpageJS, windpageHTML, windpageDestinationDir, windpagePathURL)
]




//----------------Helper functions------------------------------------------------

function buildWebPageBundleConfig(mainJSFile, HTMLFile, destinationDir, pathURL) {
  return {


    input: mainJSFile,
    output: {
      dir: destinationDir,
      entryFileNames: "index.unmin.js",
      format: "iife",
      sourcemap: () => { if (makeSourceMaps) return true }
    },
    plugins: [
      nodeResolve(),
      html({
        fileName: "index.ejs",
        template: async () =>
          await minifyHTML(readFileSync(HTMLFile)
            .toString()
            .replace("</head>",
              `<script src="index.js" defer></script>
							<link href="styles.css" rel="stylesheet">
					</head>`), {
              removeAttributeQuotes: true,
              removeComments: true,
              collapseWhitespace: true,
              conservativeCollapse: true,
              minifyCSS: true,
              minifyJS: true
            }),
      }),
      postcss({
        extract: "styles.css",
        plugins: [cssnano()]
      }),
      minifyJS(`${destinationDir}/index.unmin.js`, `${destinationDir}/index.js`, pathURL),
    ]


  }
}





function minifyJS(inputFile, outputFile, pathURL) {
  return {
    async closeBundle() { //Hook when bundling is complete


      const uglifyResult = UglifyJS.minify({ "minified": readFileSync(inputFile).toString() }, (() => {
        if (makeSourceMaps) {
          return {
            sourceMap: {
              content: readFileSync(`${inputFile}.map`).toString(),
              root: "/src",
              url: `${pathURL}/index.js.map`
            }
          }
        } else return {}
      })())

      const code = uglifyResult.code
      writeFileSync(outputFile, code)

      if (makeSourceMaps) {
        const map = uglifyResult.map

        writeFileSync(`${outputFile}.map`, map)
      } else {
        if (existsSync(`${outputFile}.map`)) unlinkSync(`${outputFile}.map`)
        if (existsSync(`${inputFile}.map`)) unlinkSync(`${inputFile}.map`)
      }

      if (deleteUnminifiedBundels) {
        unlinkSync(inputFile)
        if (existsSync(`${inputFile}.map`)) unlinkSync(`${inputFile}.map`)
      }


    }
  }
}